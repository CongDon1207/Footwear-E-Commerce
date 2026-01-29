const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', auth, createProduct); // admin only
router.put('/:id', auth, updateProduct); // admin only
router.delete('/:id', auth, deleteProduct); // admin only

module.exports = router;
