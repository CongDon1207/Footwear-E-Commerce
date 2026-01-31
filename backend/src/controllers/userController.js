const User = require('../models/User');

/**
 * Get user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password_hash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        avatar_url: user.avatar_url,
        email_verified_at: user.email_verified_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, avatar_url } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(full_name && { full_name }),
        ...(avatar_url && { avatar_url }),
        updated_at: new Date(),
      },
      { new: true }
    ).select('-password_hash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
