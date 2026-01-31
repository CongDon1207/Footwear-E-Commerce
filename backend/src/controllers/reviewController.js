const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Get reviews for a product
 * @param productId - Product ID
 * @query page - Page number (default: 1)
 * @query limit - Reviews per page (default: 10)
 * @query sortBy - Sort field: newest, oldest, highest, lowest (default: newest)
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get reviews from product
    let reviews = [...(product.reviews || [])];

    // Sort reviews
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

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    // Calculate rating distribution
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
 * User must be authenticated and have purchased the product
 */
const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      (r) => r.userId.toString() === userId
    );
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if user has purchased this product (optional - can be disabled)
    const hasPurchased = await Order.findOne({
      userId,
      'items.productId': productId,
      status: { $in: ['delivered', 'completed'] },
    });

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create review
    const newReview = {
      userId,
      userName: user.full_name,
      rating: parseInt(rating),
      title: title?.trim() || '',
      comment: comment?.trim() || '',
      verified: !!hasPurchased, // Mark as verified if user purchased
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add review to product
    product.reviews.push(newReview);

    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;
    product.reviewCount = product.reviews.length;

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
 * User can only update their own review
 */
const updateReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the review
    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === reviewId && r.userId.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    // Update review fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      product.reviews[reviewIndex].rating = parseInt(rating);
    }
    if (title !== undefined) {
      product.reviews[reviewIndex].title = title.trim();
    }
    if (comment !== undefined) {
      product.reviews[reviewIndex].comment = comment.trim();
    }
    product.reviews[reviewIndex].updatedAt = new Date();

    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;

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
 * User can delete their own review, admin can delete any
 */
const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get user to check if admin
    const user = await User.findById(userId);
    const isAdmin = user?.role === 'admin';

    // Find the review
    const reviewIndex = product.reviews.findIndex((r) => {
      if (r._id.toString() !== reviewId) return false;
      return isAdmin || r.userId.toString() === userId;
    });

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    // Remove review
    product.reviews.splice(reviewIndex, 1);

    // Recalculate average rating
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;
    } else {
      product.rating = 0;
    }
    product.reviewCount = product.reviews.length;

    await product.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews by a user (for dashboard)
 */
const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    // Find all products with reviews by this user
    const products = await Product.find(
      { 'reviews.userId': userId, isActive: true },
      { name: 1, images: 1, reviews: 1 }
    );

    // Extract and format user's reviews
    let userReviews = [];
    products.forEach((product) => {
      const review = product.reviews.find((r) => r.userId.toString() === userId);
      if (review) {
        userReviews.push({
          ...review.toObject(),
          productId: product._id,
          productName: product.name,
          productImage: product.images?.[0] || null,
        });
      }
    });

    // Sort by newest first
    userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedReviews = userReviews.slice(startIndex, startIndex + limitNum);

    res.json({
      reviews: paginatedReviews,
      pagination: {
        total: userReviews.length,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(userReviews.length / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can review a product
 */
const canReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already reviewed
    const hasReviewed = product.reviews.some((r) => r.userId.toString() === userId);

    // Check if user has purchased
    const hasPurchased = await Order.findOne({
      userId,
      'items.productId': productId,
      status: { $in: ['delivered', 'completed'] },
    });

    res.json({
      canReview: !hasReviewed,
      hasReviewed,
      hasPurchased: !!hasPurchased,
      userReview: hasReviewed
        ? product.reviews.find((r) => r.userId.toString() === userId)
        : null,
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
  getUserReviews,
  canReview,
};
