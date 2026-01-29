const Product = require('../models/Product');

/**
 * Get all products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { category, sortBy, limit = 10, page = 1 } = req.query;

    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort(sortBy || '-createdAt');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
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
      return res.status(400).json({ message: 'Please provide required fields' });
    }

    const product = new Product({
      name,
      price,
      category,
      images: images || [],
      sizes: sizes || [],
      description,
      discount: discount || 0,
    });

    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated', product });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (admin only)
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

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
