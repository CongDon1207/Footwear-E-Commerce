const express = require('express');
const {
  getAllProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations,
} = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getRecommendations);

// Protected routes (admin only)
router.post('/', auth, requireAdmin, createProduct);
router.put('/:id', auth, requireAdmin, updateProduct);
router.delete('/:id', auth, requireAdmin, deleteProduct);

module.exports = router;
