const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkWishlist,
  clearWishlist,
  mergeWishlist,
} = require('../controllers/wishlistController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// All wishlist routes require authentication
router.use(auth);

// Get user's wishlist
router.get('/', getWishlist);

// Merge guest wishlist after login
router.post('/merge', mergeWishlist);

// Clear entire wishlist
router.delete('/', clearWishlist);

// Check if product is in wishlist
router.get('/check/:productId', checkWishlist);

// Add product to wishlist
router.post('/:productId', addToWishlist);

// Toggle product in wishlist
router.post('/:productId/toggle', toggleWishlist);

// Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

module.exports = router;
