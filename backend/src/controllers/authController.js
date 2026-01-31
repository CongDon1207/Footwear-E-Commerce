const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Helper function to generate tokens
 */
const generateTokens = async (user, ip) => {
  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  // Generate refresh token (long-lived)
  const refreshTokenValue = crypto.randomBytes(40).toString('hex');
  
  const refreshTokenExpiry = new Date();
  refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

  // Save refresh token to database
  const refreshToken = new RefreshToken({
    user_id: user.id,
    token: refreshTokenValue,
    expires_at: refreshTokenExpiry,
    created_by_ip: ip,
  });

  await refreshToken.save();

  return { accessToken, refreshToken: refreshTokenValue };
};

/**
 * User registration
 */
const register = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Please provide email, password, and full_name' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password_hash: hashedPassword,
      full_name,
      role: 'user',
      status: 'active',
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user, req.ip);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'User account is not active' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user, req.ip);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Find refresh token in database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || !storedToken.isActive) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Get user
    const user = await User.findById(storedToken.user_id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    res.json({
      message: 'Token refreshed successfully',
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout - revoke refresh token
 */
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Find and revoke token
      const storedToken = await RefreshToken.findOne({ token: refreshToken });
      if (storedToken && storedToken.isActive) {
        storedToken.revoke(req.ip);
        await storedToken.save();
      }
      // Clean up expired tokens
      await RefreshToken.cleanupUserTokens(req.userId);
    }

    // Clear cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from all devices - revoke all refresh tokens
 */
const logoutAll = async (req, res, next) => {
  try {
    await RefreshToken.revokeAllUserTokens(req.userId, req.ip);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
};
