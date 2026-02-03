const Deal = require('../models/Deal');
const Product = require('../models/Product');

// @desc    Get all active deals (public)
// @route   GET /api/deals
// @access  Public
const getActiveDeals = async (req, res) => {
  try {
    const { limit = 10, type, featured } = req.query;

    const options = {
      limit: parseInt(limit),
      dealType: type,
      featured: featured === 'true',
    };

    const deals = await Deal.getActiveDeals(options);

    res.json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (error) {
    console.error('Get active deals error:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};

// @desc    Get featured flash deals (for homepage)
// @route   GET /api/deals/flash
// @access  Public
const getFlashDeals = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const now = new Date();

    const deals = await Deal.find({
      isActive: true,
      dealType: 'flash_sale',
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { stockLimit: null },
        { $expr: { $lt: ['$soldCount', '$stockLimit'] } },
      ],
    })
      .populate('product', 'name images category rating reviewCount sizes')
      .sort({ isFeatured: -1, priority: -1, endDate: 1 })
      .limit(parseInt(limit));

    // Get the earliest end date for the countdown
    const earliestEndDate = deals.length > 0
      ? deals.reduce((earliest, deal) => 
          deal.endDate < earliest ? deal.endDate : earliest, deals[0].endDate)
      : null;

    res.json({
      success: true,
      count: deals.length,
      deals,
      endsAt: earliestEndDate,
    });
  } catch (error) {
    console.error('Get flash deals error:', error);
    res.status(500).json({ error: 'Failed to fetch flash deals' });
  }
};

// @desc    Get a single deal by ID
// @route   GET /api/deals/:id
// @access  Public
const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('product', 'name description images category rating reviewCount sizes totalStock');

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({
      success: true,
      deal,
    });
  } catch (error) {
    console.error('Get deal by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
};

// @desc    Get all deals (admin - includes inactive)
// @route   GET /api/deals/admin/all
// @access  Private/Admin
const getAllDealsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    
    if (status === 'active') {
      const now = new Date();
      query.isActive = true;
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (status === 'upcoming') {
      const now = new Date();
      query.isActive = true;
      query.startDate = { $gt: now };
    } else if (status === 'expired') {
      const now = new Date();
      query.endDate = { $lt: now };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (type) {
      query.dealType = type;
    }

    const [deals, total] = await Promise.all([
      Deal.find(query)
        .populate('product', 'name images category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Deal.countDocuments(query),
    ]);

    res.json({
      success: true,
      deals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all deals admin error:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};

// @desc    Create a new deal
// @route   POST /api/deals
// @access  Private/Admin
const createDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      productId,
      dealType,
      discountPercentage,
      startDate,
      endDate,
      stockLimit,
      isFeatured,
      priority,
      bannerImage,
      badge,
    } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for existing active deal on the same product
    const existingDeal = await Deal.findOne({
      product: productId,
      isActive: true,
      endDate: { $gte: new Date() },
      startDate: { $lte: end },
    });

    if (existingDeal) {
      return res.status(400).json({ 
        error: 'An active deal already exists for this product in the specified time range' 
      });
    }

    const deal = await Deal.create({
      title,
      description,
      product: productId,
      dealType: dealType || 'flash_sale',
      discountPercentage,
      originalPrice: product.price,
      startDate: start,
      endDate: end,
      stockLimit: stockLimit || null,
      isFeatured: isFeatured || false,
      priority: priority || 0,
      bannerImage,
      badge: badge || 'hot',
    });

    await deal.populate('product', 'name images category');

    res.status(201).json({
      success: true,
      deal,
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
};

// @desc    Update a deal
// @route   PUT /api/deals/:id
// @access  Private/Admin
const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const {
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      stockLimit,
      isActive,
      isFeatured,
      priority,
      bannerImage,
      badge,
    } = req.body;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    // Update fields
    if (title !== undefined) deal.title = title;
    if (description !== undefined) deal.description = description;
    if (discountPercentage !== undefined) deal.discountPercentage = discountPercentage;
    if (startDate !== undefined) deal.startDate = new Date(startDate);
    if (endDate !== undefined) deal.endDate = new Date(endDate);
    if (stockLimit !== undefined) deal.stockLimit = stockLimit;
    if (isActive !== undefined) deal.isActive = isActive;
    if (isFeatured !== undefined) deal.isFeatured = isFeatured;
    if (priority !== undefined) deal.priority = priority;
    if (bannerImage !== undefined) deal.bannerImage = bannerImage;
    if (badge !== undefined) deal.badge = badge;

    await deal.save();
    await deal.populate('product', 'name images category');

    res.json({
      success: true,
      deal,
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
};

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Private/Admin
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    await deal.deleteOne();

    res.json({
      success: true,
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
};

// @desc    Toggle deal active status
// @route   PATCH /api/deals/:id/toggle
// @access  Private/Admin
const toggleDealStatus = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    deal.isActive = !deal.isActive;
    await deal.save();
    await deal.populate('product', 'name images category');

    res.json({
      success: true,
      deal,
      message: `Deal ${deal.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle deal status error:', error);
    res.status(500).json({ error: 'Failed to toggle deal status' });
  }
};

// @desc    Get deal statistics
// @route   GET /api/deals/admin/stats
// @access  Private/Admin
const getDealStats = async (req, res) => {
  try {
    const now = new Date();

    const [activeCount, upcomingCount, expiredCount, totalSales] = await Promise.all([
      Deal.countDocuments({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
      Deal.countDocuments({
        isActive: true,
        startDate: { $gt: now },
      }),
      Deal.countDocuments({
        endDate: { $lt: now },
      }),
      Deal.aggregate([
        { $match: { soldCount: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            totalSold: { $sum: '$soldCount' },
            totalRevenue: { $sum: { $multiply: ['$dealPrice', '$soldCount'] } },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        active: activeCount,
        upcoming: upcomingCount,
        expired: expiredCount,
        totalSold: totalSales[0]?.totalSold || 0,
        totalRevenue: totalSales[0]?.totalRevenue || 0,
      },
    });
  } catch (error) {
    console.error('Get deal stats error:', error);
    res.status(500).json({ error: 'Failed to fetch deal statistics' });
  }
};

module.exports = {
  getActiveDeals,
  getFlashDeals,
  getDealById,
  getAllDealsAdmin,
  createDeal,
  updateDeal,
  deleteDeal,
  toggleDealStatus,
  getDealStats,
};
