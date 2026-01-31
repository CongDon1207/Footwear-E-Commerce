const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * Get user's wishlist
 * GET /api/wishlist
 */
const getWishlist = async (req, res, next) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'productId',
        select: 'name price discount images category totalStock isActive',
      })
      .lean();

    // Filter out items where product was deleted or inactive
    const items = wishlistItems
      .filter((item) => item.productId && item.productId.isActive)
      .map((item) => ({
        _id: item._id,
        product: item.productId,
        addedAt: item.createdAt,
      }));

    res.json({ items, count: items.length });
  } catch (error) {
    next(error);
  }
};

/**
 * Add product to wishlist
 * POST /api/wishlist/:productId
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      userId: req.userId,
      productId,
    });

    if (existing) {
      return res.status(200).json({
        message: 'Product already in wishlist',
        item: existing,
      });
    }

    const wishlistItem = await Wishlist.create({
      userId: req.userId,
      productId,
    });

    res.status(201).json({
      message: 'Product added to wishlist',
      item: wishlistItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove product from wishlist
 * DELETE /api/wishlist/:productId
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await Wishlist.findOneAndDelete({
      userId: req.userId,
      productId,
    });

    if (!result) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle product in wishlist (add if not exists, remove if exists)
 * POST /api/wishlist/:productId/toggle
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existing = await Wishlist.findOne({
      userId: req.userId,
      productId,
    });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
      return res.json({ message: 'Product removed from wishlist', inWishlist: false });
    }

    await Wishlist.create({ userId: req.userId, productId });
    res.status(201).json({ message: 'Product added to wishlist', inWishlist: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
const checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const existing = await Wishlist.findOne({
      userId: req.userId,
      productId,
    });

    res.json({ inWishlist: !!existing });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all items from wishlist
 * DELETE /api/wishlist
 */
const clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.deleteMany({ userId: req.userId });
    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    next(error);
  }
};

/**
 * Merge guest wishlist with user wishlist (called after login)
 * POST /api/wishlist/merge
 * Body: { productIds: string[] }
 */
const mergeWishlist = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'productIds array required' });
    }

    // Validate all products exist and are active
    const validProducts = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).select('_id');

    const validProductIds = validProducts.map((p) => p._id.toString());

    // Get existing wishlist items
    const existingItems = await Wishlist.find({
      userId: req.userId,
      productId: { $in: validProductIds },
    });

    const existingProductIds = new Set(existingItems.map((i) => i.productId.toString()));

    // Create new items for products not already in wishlist
    const newItems = validProductIds
      .filter((pid) => !existingProductIds.has(pid))
      .map((productId) => ({
        userId: req.userId,
        productId,
      }));

    if (newItems.length > 0) {
      await Wishlist.insertMany(newItems, { ordered: false });
    }

    res.json({
      message: 'Wishlist merged',
      added: newItems.length,
      alreadyExisted: existingItems.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkWishlist,
  clearWishlist,
  mergeWishlist,
};
