const Product = require('../models/Product');

/**
 * Get all products with filtering, searching, and pagination
 * @query category - Filter by category
 * @query q - Search by product name
 * @query minPrice - Minimum price filter
 * @query maxPrice - Maximum price filter
 * @query onSale - Filter products on sale (discount > 0)
 * @query inStock - Filter products in stock
 * @query sizes - Filter by available sizes (comma-separated)
 * @query sortBy - Sort field (price, -price, name, -name, createdAt, -createdAt)
 * @query limit - Items per page (default: 12)
 * @query page - Page number (default: 1)
 */
const getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      q,
      minPrice,
      maxPrice,
      onSale,
      inStock,
      sizes,
      sortBy = '-createdAt',
      limit = 12,
      page = 1,
    } = req.query;

    // Build query object
    let query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search by name (case-insensitive)
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // On sale filter (discount > 0)
    if (onSale === 'true') {
      query.discount = { $gt: 0 };
    }

    // In stock filter
    if (inStock === 'true') {
      query.totalStock = { $gt: 0 };
    }

    // Size filter
    if (sizes) {
      const sizeArray = sizes.split(',').map((s) => s.trim());
      query['sizes.size'] = { $in: sizeArray };
      query['sizes.stock'] = { $gt: 0 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query).limit(limitNum).skip(skip).sort(sortBy),
      Product.countDocuments(query),
    ]);

    // Calculate final price for each product
    const productsWithFinalPrice = products.map((product) => {
      const productObj = product.toObject();
      productObj.finalPrice = productObj.price * (1 - productObj.discount / 100);
      return productObj;
    });

    res.json({
      products: productsWithFinalPrice,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID with calculated final price
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productObj = product.toObject();
    productObj.finalPrice = productObj.price * (1 - productObj.discount / 100);

    res.json({ product: productObj });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all unique categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product (admin only)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, images, sizes, description, discount } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Please provide required fields: name, price, category' });
    }

    // Calculate total stock from sizes
    let totalStock = 0;
    if (sizes && Array.isArray(sizes)) {
      totalStock = sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
    }

    const product = new Product({
      name,
      price,
      category,
      images: images || [],
      sizes: sizes || [],
      description: description || '',
      discount: discount || 0,
      totalStock,
    });

    await product.save();

    const productObj = product.toObject();
    productObj.finalPrice = productObj.price * (1 - productObj.discount / 100);

    res.status(201).json({ message: 'Product created', product: productObj });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 */
const updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Recalculate total stock if sizes are updated
    if (updateData.sizes && Array.isArray(updateData.sizes)) {
      updateData.totalStock = updateData.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productObj = product.toObject();
    productObj.finalPrice = productObj.price * (1 - productObj.discount / 100);

    res.json({ message: 'Product updated', product: productObj });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (soft delete - admin only)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product recommendations
 * Rule-based: same category, prioritize on-sale items, exclude current product
 * @param id - Current product ID
 * @query limit - Number of recommendations (default: 8, max: 20)
 */
const getRecommendations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 8));

    // Get current product to find its category
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find products in same category, excluding current product
    // Prioritize: on-sale first, then by newest
    const recommendations = await Product.aggregate([
      {
        $match: {
          _id: { $ne: currentProduct._id },
          category: currentProduct.category,
          isActive: true,
        },
      },
      {
        $addFields: {
          hasDiscount: { $gt: ['$discount', 0] },
          finalPrice: {
            $multiply: ['$price', { $subtract: [1, { $divide: ['$discount', 100] }] }],
          },
        },
      },
      {
        $sort: { hasDiscount: -1, createdAt: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    // If not enough recommendations from same category, fill with other on-sale products
    if (recommendations.length < limit) {
      const remaining = limit - recommendations.length;
      const existingIds = [currentProduct._id, ...recommendations.map((p) => p._id)];

      const additionalProducts = await Product.aggregate([
        {
          $match: {
            _id: { $nin: existingIds },
            isActive: true,
            discount: { $gt: 0 },
          },
        },
        {
          $addFields: {
            finalPrice: {
              $multiply: ['$price', { $subtract: [1, { $divide: ['$discount', 100] }] }],
            },
          },
        },
        {
          $sort: { discount: -1, createdAt: -1 },
        },
        {
          $limit: remaining,
        },
      ]);

      recommendations.push(...additionalProducts);
    }

    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendations,
};
