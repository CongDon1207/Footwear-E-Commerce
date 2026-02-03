const express = require('express');
const {
  getActiveDeals,
  getFlashDeals,
  getDealById,
  getAllDealsAdmin,
  createDeal,
  updateDeal,
  deleteDeal,
  toggleDealStatus,
  getDealStats,
} = require('../controllers/dealController');
const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

// Public routes
router.get('/', getActiveDeals);
router.get('/flash', getFlashDeals);
router.get('/:id', getDealById);

// Admin routes
router.get('/admin/all', auth, requireAdmin, getAllDealsAdmin);
router.get('/admin/stats', auth, requireAdmin, getDealStats);
router.post('/', auth, requireAdmin, createDeal);
router.put('/:id', auth, requireAdmin, updateDeal);
router.delete('/:id', auth, requireAdmin, deleteDeal);
router.patch('/:id/toggle', auth, requireAdmin, toggleDealStatus);

module.exports = router;
