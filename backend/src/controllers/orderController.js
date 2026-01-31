const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Create a new order
 * Validates stock, calculates prices server-side, and deducts inventory
 */
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, paymentMethod = 'cod' } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ message: 'Shipping address is required (fullName, phone, address, city, district)' });
    }

    // Process each item - validate stock and calculate prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, size, quantity } = item;

      if (!productId || !size || !quantity || quantity < 1) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Each item must have productId, size, and quantity (>= 1)' });
      }

      // Find product
      const product = await Product.findById(productId).session(session);

      if (!product || !product.isActive) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }

      // Find size variant and check stock
      const sizeVariant = product.sizes.find((s) => s.size === size);

      if (!sizeVariant) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Size ${size} not available for ${product.name}` });
      }

      if (sizeVariant.stock < quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} (size ${size}). Available: ${sizeVariant.stock}`,
        });
      }

      // Calculate final price
      const finalPrice = product.price * (1 - product.discount / 100);
      const itemSubtotal = finalPrice * quantity;

      // Create order item with snapshot data
      orderItems.push({
        product_id: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        discount: product.discount,
        finalPrice,
        size,
        quantity,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;

      // Deduct stock
      sizeVariant.stock -= quantity;
      product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
      await product.save({ session });
    }

    // Calculate shipping fee (simple rule: free shipping over 500k VND)
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    // Generate order number
    const orderNumber = await Order.generateOrderNumber();

    // Create order
    const order = new Order({
      orderNumber,
      user_id: userId,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city || '',
        district: shippingAddress.district || '',
        ward: shippingAddress.ward || '',
        note: shippingAddress.note || '',
      },
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      statusHistory: [
        {
          status: 'pending',
          note: 'Order placed',
          createdAt: new Date(),
        },
      ],
    });

    await order.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderNumber: order.orderNumber,
        id: order._id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * Get user's orders (paginated)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const query = { user_id: userId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
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
 * Get single order by ID
 */
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, user_id: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by order number
 */
const getOrderByNumber = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orderNumber = req.params.orderNumber;

    const order = await Order.findOne({ orderNumber, user_id: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order (user can only cancel pending orders)
 */
const cancelOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;
    const orderId = req.params.id;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, user_id: userId }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Restore stock for each item
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

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Cancelled by user';
    order.statusHistory.push({
      status: 'cancelled',
      note: reason || 'Cancelled by user',
      updatedBy: userId,
      createdAt: new Date(),
    });
    await order.save({ session });

    await session.commitTransaction();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  cancelOrder,
};
