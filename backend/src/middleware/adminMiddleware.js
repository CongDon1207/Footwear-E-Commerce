const User = require('../models/User');

/**
 * Admin authorization middleware
 * Requires user to be authenticated (via auth middleware) and have admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    // userId should be set by auth middleware
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.userId).select('role status');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Attach user info for logging/auditing
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Seller or Admin authorization middleware
 */
const requireSellerOrAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.userId).select('role status');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    if (!['admin', 'seller'].includes(user.role)) {
      return res.status(403).json({ message: 'Seller or Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireAdmin,
  requireSellerOrAdmin,
};
