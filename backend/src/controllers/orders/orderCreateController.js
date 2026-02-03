const Order = require('../../models/Order');
const Product = require('../../models/Product');
const mongoose = require('mongoose');
const { buildPaymentInfo } = require('./orderPaymentInfo');

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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ message: 'Shipping address is required (fullName, phone, address, city, district)' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, size, quantity } = item;

      if (!productId || !size || !quantity || quantity < 1) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Each item must have productId, size, and quantity (>= 1)' });
      }

      const product = await Product.findById(productId).session(session);
      if (!product || !product.isActive) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }

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

      const finalPrice = product.price * (1 - product.discount / 100);
      const itemSubtotal = finalPrice * quantity;

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

      sizeVariant.stock -= quantity;
      product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
      await product.save({ session });
    }

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;
    const orderNumber = await Order.generateOrderNumber();

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
      paymentStatus: 'pending',
      paymentHistory: [
        {
          status: 'pending',
          note: paymentMethod === 'bank_transfer' ? 'Awaiting bank transfer' : 'Payment pending',
          updatedBy: userId,
          createdAt: new Date(),
        },
      ],
      statusHistory: [
        {
          status: 'pending',
          note: 'Order placed',
          createdAt: new Date(),
        },
      ],
    });

    await order.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderNumber: order.orderNumber,
        id: order._id,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        payment: buildPaymentInfo(order),
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

    for (const item of order.items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) continue;

      const sizeVariant = product.sizes.find((s) => s.size === item.size);
      if (!sizeVariant) continue;

      sizeVariant.stock += item.quantity;
      product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
      await product.save({ session });
    }

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
  cancelOrder,
};

