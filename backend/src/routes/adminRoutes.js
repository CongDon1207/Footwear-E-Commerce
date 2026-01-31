const express = require('express');
const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
  getMetrics,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllProducts,
  updateProduct,
  toggleProductActive,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(auth);
router.use(requireAdmin);

// Dashboard
router.get('/metrics', getMetrics);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Products
router.get('/products', getAllProducts);
router.put('/products/:id', updateProduct);
router.patch('/products/:id/toggle-active', toggleProductActive);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;
