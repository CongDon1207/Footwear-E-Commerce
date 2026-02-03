const Product = require('../../models/Product');

/**
 * Get all reviews by a user (for dashboard)
 * GET /api/reviews/my
 */
const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const products = await Product.find(
      { 'reviews.userId': userId, isActive: true },
      { name: 1, images: 1, reviews: 1 }
    );

    let userReviews = [];
    products.forEach((product) => {
      const review = product.reviews.find((r) => r.userId.toString() === userId);
      if (!review) return;

      userReviews.push({
        ...review.toObject(),
        productId: product._id,
        productName: product.name,
        productImage: product.images?.[0] || null,
      });
    });

    userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

module.exports = {
  getUserReviews,
};

