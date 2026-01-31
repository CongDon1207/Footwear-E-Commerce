const express = require('express');
const {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);

module.exports = router;
