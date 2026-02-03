const Order = require('../../models/Order');
const Product = require('../../models/Product');
const mongoose = require('mongoose');

/**
 * Valid status transitions to enforce workflow
 */
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

/**
 * Get all orders (admin)
 * GET /api/admin/orders
 * Query:
 * - page, limit, status
 * - search (preferred)
 * - orderNumber (legacy alias for search)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search, orderNumber } = req.query;
    const effectiveSearch = search || orderNumber;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const query = {};
    if (status) query.status = status;
    if (effectiveSearch) {
      query.$or = [
        { orderNumber: { $regex: effectiveSearch, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: effectiveSearch, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: effectiveSearch, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('user_id', 'full_name email')
        .select('-__v'),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order by ID (admin)
 * GET /api/admin/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id', 'full_name email')
      .populate('statusHistory.updatedBy', 'full_name')
      .populate('paymentHistory.updatedBy', 'full_name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin)
 * PATCH /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const adminId = req.userId;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Cannot transition from '${order.status}' to '${status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
      });
    }

    if (status === 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product_id).session(session);
        if (!product) continue;

        const sizeVariant = product.sizes.find((s) => s.size === item.size);
        if (!sizeVariant) continue;

        sizeVariant.stock += item.quantity;
        product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
        await product.save({ session });
      }
      order.cancelledAt = new Date();
      order.cancelReason = note || 'Cancelled by admin';
    }

    if (status === 'confirmed') order.confirmedAt = new Date();
    if (status === 'shipping') order.shippedAt = new Date();
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
        order.paymentHistory = order.paymentHistory || [];
        order.paymentHistory.push({
          status: 'paid',
          note: 'Auto-marked as paid for COD delivery',
          updatedBy: adminId,
          createdAt: new Date(),
        });
      }
    }

    order.status = status;

    order.statusHistory.push({
      status,
      note: note || '',
      updatedBy: adminId,
      createdAt: new Date(),
    });

    await order.save({ session });
    await session.commitTransaction();

    const updatedOrder = await Order.findById(id)
      .populate('statusHistory.updatedBy', 'full_name')
      .populate('paymentHistory.updatedBy', 'full_name');

    res.json({
      message: `Order status updated to '${status}'`,
      order: updatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * Update order payment status (admin)
 * PATCH /api/admin/orders/:id/payment-status
 */
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, note } = req.body;
    const adminId = req.userId;

    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid paymentStatus' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const current = order.paymentStatus || 'pending';
    const allowed = {
      pending: ['paid', 'failed'],
      failed: ['pending', 'paid'],
      paid: [],
    }[current] || [];

    if (!allowed.includes(paymentStatus) && paymentStatus !== current) {
      return res.status(400).json({
        message: `Cannot transition paymentStatus from '${current}' to '${paymentStatus}'. Allowed: ${allowed.join(', ') || 'none'}`,
      });
    }

    order.paymentStatus = paymentStatus;
    order.paymentHistory = order.paymentHistory || [];
    order.paymentHistory.push({
      status: paymentStatus,
      note: note || '',
      updatedBy: adminId,
      createdAt: new Date(),
    });

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('statusHistory.updatedBy', 'full_name')
      .populate('paymentHistory.updatedBy', 'full_name');

    res.json({
      message: `Order payment status updated to '${paymentStatus}'`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
};
