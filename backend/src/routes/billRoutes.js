const express = require('express');
const router = express.Router();
const { getBills, getBill, createBill, updateBill, deleteBill } = require('../controllers/billController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, billValidation, idParam } = require('../middleware/validation');

// Public routes (for frontend compatibility)
router.get('/', optionalAuth, getBills);
router.get('/:id', optionalAuth, idParam, validate, getBill);

// Protected routes
router.post('/', authenticate, validate, billValidation.create, createBill);
router.put('/:id', authenticate, idParam, validate, billValidation.update, updateBill);
router.delete('/:id', authenticate, idParam, validate, deleteBill);

module.exports = router;
