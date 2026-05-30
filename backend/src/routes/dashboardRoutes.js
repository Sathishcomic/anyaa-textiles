const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/auth');

// Public route (for frontend compatibility)
router.get('/', optionalAuth, getDashboardStats);

module.exports = router;
