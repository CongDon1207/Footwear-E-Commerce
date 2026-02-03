const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');

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

module.exports = {
  getMetrics,
};

