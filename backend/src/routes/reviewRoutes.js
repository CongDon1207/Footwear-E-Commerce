const express = require('express');
const {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  getUserReviews,
  canReview,
} = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/products/:productId', getProductReviews);

// Protected routes
router.get('/my', auth, getUserReviews);
router.get('/products/:productId/can-review', auth, canReview);
router.post('/products/:productId', auth, addReview);
router.put('/products/:productId/:reviewId', auth, updateReview);
router.delete('/products/:productId/:reviewId', auth, deleteReview);

module.exports = router;
