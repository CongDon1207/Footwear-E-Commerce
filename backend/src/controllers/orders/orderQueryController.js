const Order = require('../../models/Order');
const { toOrderResponse } = require('./orderPaymentInfo');

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
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ order: toOrderResponse(order) });
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
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ order: toOrderResponse(order) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  getOrderByNumber,
};

