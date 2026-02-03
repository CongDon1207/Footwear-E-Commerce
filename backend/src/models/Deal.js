const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    dealType: {
      type: String,
      enum: ['flash_sale', 'daily_deal', 'weekly_special', 'clearance'],
      default: 'flash_sale',
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    dealPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    stockLimit: {
      type: Number,
      default: null, // null means unlimited
      min: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0, // Higher number = higher priority in display
    },
    bannerImage: {
      type: String,
      default: null,
    },
    badge: {
      type: String,
      enum: ['hot', 'new', 'limited', 'bestseller', 'exclusive', null],
      default: 'hot',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to check if deal is currently active
dealSchema.virtual('isLive').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.stockLimit === null || this.soldCount < this.stockLimit)
  );
});

// Virtual for remaining stock
dealSchema.virtual('remainingStock').get(function () {
  if (this.stockLimit === null) return null;
  return Math.max(0, this.stockLimit - this.soldCount);
});

// Virtual for time remaining in milliseconds
dealSchema.virtual('timeRemaining').get(function () {
  const now = new Date();
  if (now > this.endDate) return 0;
  if (now < this.startDate) return this.endDate - this.startDate;
  return this.endDate - now;
});

// Virtual for percentage sold
dealSchema.virtual('percentageSold').get(function () {
  if (this.stockLimit === null || this.stockLimit === 0) return 0;
  return Math.round((this.soldCount / this.stockLimit) * 100);
});

// Index for efficient querying of active deals
dealSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
dealSchema.index({ product: 1 });
dealSchema.index({ dealType: 1, isActive: 1 });
dealSchema.index({ isFeatured: 1, priority: -1 });

// Pre-save hook to calculate deal price
dealSchema.pre('save', function (next) {
  if (this.isModified('originalPrice') || this.isModified('discountPercentage')) {
    this.dealPrice = Math.round(this.originalPrice * (1 - this.discountPercentage / 100));
  }
  next();
});

// Static method to get active deals
dealSchema.statics.getActiveDeals = async function (options = {}) {
  const { limit = 10, dealType, featured = false } = options;
  const now = new Date();

  const query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { stockLimit: null },
      { $expr: { $lt: ['$soldCount', '$stockLimit'] } },
    ],
  };

  if (dealType) {
    query.dealType = dealType;
  }

  if (featured) {
    query.isFeatured = true;
  }

  return this.find(query)
    .populate('product', 'name images category rating reviewCount sizes')
    .sort({ priority: -1, endDate: 1 })
    .limit(limit);
};

// Instance method to increment sold count
dealSchema.methods.incrementSoldCount = async function (quantity = 1) {
  this.soldCount += quantity;
  return this.save();
};

module.exports = mongoose.model('Deal', dealSchema);
