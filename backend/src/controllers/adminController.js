const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Valid status transitions to enforce workflow
 */
const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Get admin dashboard metrics
 * GET /api/admin/metrics
 */
const getMetrics = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      activeProducts,
      totalUsers,
      revenueResult,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'processing', 'shipping', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        byStatus: statusCounts,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      users: {
        total: totalUsers,
      },
      revenue: {
        total: totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders (admin)
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
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
      .populate('statusHistory.updatedBy', 'full_name');

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

    // Validate transition
    const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Cannot transition from '${order.status}' to '${status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
      });
    }

    // If cancelling, restore stock
    if (status === 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product_id).session(session);
        if (product) {
          const sizeVariant = product.sizes.find((s) => s.size === item.size);
          if (sizeVariant) {
            sizeVariant.stock += item.quantity;
            product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
            await product.save({ session });
          }
        }
      }
      order.cancelledAt = new Date();
      order.cancelReason = note || 'Cancelled by admin';
    }

    // Update status timestamps
    if (status === 'confirmed') order.confirmedAt = new Date();
    if (status === 'shipping') order.shippedAt = new Date();
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      // Auto-update payment status to paid for COD
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
    }

    // Update status
    order.status = status;

    // Add to status history
    order.statusHistory.push({
      status,
      note: note || '',
      updatedBy: adminId,
      createdAt: new Date(),
    });

    await order.save({ session });
    await session.commitTransaction();

    // Refetch with populated fields
    const updatedOrder = await Order.findById(id)
      .populate('statusHistory.updatedBy', 'full_name');

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
 * Get all products (admin)
 * GET /api/admin/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-__v'),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
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
 * Update product (admin)
 * PUT /api/admin/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Recalculate totalStock if sizes updated
    if (updates.sizes) {
      product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
      await product.save();
    }

    res.json({ message: 'Product updated', product });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle product active status (admin)
 * PATCH /api/admin/products/:id/toggle-active
 */
const toggleProductActive = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: `Product ${product.isActive ? 'activated' : 'deactivated'}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin)
 * GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-password_hash -__v'),
      User.countDocuments(query),
    ]);

    res.json({
      users,
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
 * Update user status (admin)
 * PATCH /api/admin/users/:id/status
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Prevent admin from changing their own status
    if (id === req.userId) {
      return res.status(400).json({ message: 'Cannot change your own status' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password_hash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User status updated to '${status}'`, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetrics,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllProducts,
  updateProduct,
  toggleProductActive,
  getAllUsers,
  updateUserStatus,
};
