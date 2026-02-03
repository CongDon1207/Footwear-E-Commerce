const Product = require('../../models/Product');

/**
 * Get all products (admin)
 * GET /api/admin/products
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-__v'),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin)
 * PUT /api/admin/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (updates.sizes) {
      product.totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
      await product.save();
    }

    res.json({ message: 'Product updated', product });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle product active status (admin)
 * PATCH /api/admin/products/:id/toggle-active
 */
const toggleProductActive = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: `Product ${product.isActive ? 'activated' : 'deactivated'}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  updateProduct,
  toggleProductActive,
};

