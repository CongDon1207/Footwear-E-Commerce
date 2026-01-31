const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  cancelOrder,
} = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// All order routes require authentication
router.use(auth);

// Create new order
router.post('/', createOrder);

// Get user's orders
router.get('/my', getMyOrders);

// Get order by order number
router.get('/number/:orderNumber', getOrderByNumber);

// Get order by ID
router.get('/:id', getOrderById);

// Cancel order
router.post('/:id/cancel', cancelOrder);

module.exports = router;
