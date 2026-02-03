const Product = require('../../models/Product');
const User = require('../../models/User');
const Order = require('../../models/Order');

const recalculateProductRating = (product) => {
  if (!product.reviews || product.reviews.length === 0) {
    product.rating = 0;
    product.reviewCount = 0;
    return;
  }

  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;
  product.reviewCount = product.reviews.length;
};

/**
 * Get reviews for a product
 * GET /api/reviews/products/:productId
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let reviews = [...(product.reviews || [])];

    switch (sortBy) {
      case 'oldest':
        reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'newest':
      default:
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedReviews = reviews.slice(startIndex, startIndex + limitNum);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    });

    res.json({
      reviews: paginatedReviews,
      pagination: {
        total: reviews.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(reviews.length / limitNum),
      },
      summary: {
        averageRating: product.rating || 0,
        totalReviews: product.reviewCount || reviews.length,
        ratingDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a review to a product
 * POST /api/reviews/products/:productId
 */
const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existingReview = product.reviews.find((r) => r.userId.toString() === userId);
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const hasPurchased = await Order.findOne({
      user_id: userId,
      'items.product_id': productId,
      status: 'delivered',
    });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newReview = {
      userId,
      userName: user.full_name,
      rating: parseInt(rating),
      title: title?.trim() || '',
      comment: comment?.trim() || '',
      verified: !!hasPurchased,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    product.reviews.push(newReview);
    recalculateProductRating(product);
    await product.save();

    res.status(201).json({
      message: 'Review added successfully',
      review: newReview,
      summary: {
        averageRating: product.rating,
        totalReviews: product.reviewCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 * PUT /api/reviews/products/:productId/:reviewId
 */
const updateReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === reviewId && r.userId.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      product.reviews[reviewIndex].rating = parseInt(rating);
    }
    if (title !== undefined) product.reviews[reviewIndex].title = title.trim();
    if (comment !== undefined) product.reviews[reviewIndex].comment = comment.trim();
    product.reviews[reviewIndex].updatedAt = new Date();

    recalculateProductRating(product);
    await product.save();

    res.json({
      message: 'Review updated successfully',
      review: product.reviews[reviewIndex],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 * DELETE /api/reviews/products/:productId/:reviewId
 */
const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const user = await User.findById(userId);
    const isAdmin = user?.role === 'admin';

    const reviewIndex = product.reviews.findIndex((r) => {
      if (r._id.toString() !== reviewId) return false;
      return isAdmin || r.userId.toString() === userId;
    });

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    product.reviews.splice(reviewIndex, 1);
    recalculateProductRating(product);
    await product.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can review a product
 * GET /api/reviews/products/:productId/can-review
 */
const canReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const hasReviewed = product.reviews.some((r) => r.userId.toString() === userId);

    const hasPurchased = await Order.findOne({
      user_id: userId,
      'items.product_id': productId,
      status: 'delivered',
    });

    res.json({
      canReview: !hasReviewed,
      hasReviewed,
      hasPurchased: !!hasPurchased,
      userReview: hasReviewed ? product.reviews.find((r) => r.userId.toString() === userId) : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  canReview,
};

