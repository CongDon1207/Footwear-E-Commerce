const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const { uploadAvatar: uploadMiddleware, handleMulterError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Protected routes - all user routes require authentication
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/avatar', auth, uploadMiddleware.single('avatar'), handleMulterError, uploadAvatar);
router.delete('/avatar', auth, deleteAvatar);
router.put('/password', auth, changePassword);

module.exports = router;
