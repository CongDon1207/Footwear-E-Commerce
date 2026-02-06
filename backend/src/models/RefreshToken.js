const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    created_by_ip: {
      type: String,
      default: null,
    },
    revoked_at: {
      type: Date,
      default: null,
    },
    revoked_by_ip: {
      type: String,
      default: null,
    },
    replaced_by_token: {
      type: String,
      default: null,
    },
    device_info: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'refresh_tokens',
  }
);

// Index for cleanup expired tokens
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Virtual to check if token is expired
refreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expires_at;
});

// Virtual to check if token is active
refreshTokenSchema.virtual('isActive').get(function () {
  return !this.revoked_at && !this.isExpired;
});

// Method to revoke token
refreshTokenSchema.methods.revoke = function (ip) {
  this.revoked_at = new Date();
  this.revoked_by_ip = ip;
};

// Static method to cleanup expired/revoked tokens for a user
refreshTokenSchema.statics.cleanupUserTokens = async function (userId) {
  const now = new Date();
  return this.deleteMany({
    user_id: userId,
    $or: [
      { expires_at: { $lt: now } },
      { revoked_at: { $ne: null } },
    ],
  });
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllUserTokens = async function (userId, ip) {
  return this.updateMany(
    {
      user_id: userId,
      revoked_at: null,
    },
    {
      $set: {
        revoked_at: new Date(),
        revoked_by_ip: ip,
      },
    }
  );
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
