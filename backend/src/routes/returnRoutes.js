const express = require('express');
const router = express.Router();
const { getReturns, getReturn, createReturn, updateReturn, deleteReturn } = require('../controllers/returnController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, returnValidation, idParam } = require('../middleware/validation');

// Public routes (for frontend compatibility)
router.get('/', optionalAuth, getReturns);
router.get('/:id', optionalAuth, idParam, validate, getReturn);

// Protected routes
router.post('/', authenticate, validate, returnValidation.create, createReturn);
router.put('/:id', authenticate, idParam, validate, returnValidation.update, updateReturn);
router.delete('/:id', authenticate, idParam, validate, deleteReturn);

module.exports = router;
