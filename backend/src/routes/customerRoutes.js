const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, customerValidation, idParam } = require('../middleware/validation');

// Public routes (for frontend compatibility)
router.get('/', optionalAuth, getCustomers);
router.get('/:id', optionalAuth, idParam, validate, getCustomer);

// Protected routes
router.post('/', authenticate, validate, customerValidation.create, createCustomer);
router.put('/:id', authenticate, idParam, validate, customerValidation.update, updateCustomer);
router.delete('/:id', authenticate, idParam, validate, deleteCustomer);

module.exports = router;
