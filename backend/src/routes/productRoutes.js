const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getLowStockProducts } = require('../controllers/productController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, productValidation, idParam } = require('../middleware/validation');

// Public routes (for frontend compatibility)
router.get('/', optionalAuth, getProducts);
router.get('/low-stock', optionalAuth, getLowStockProducts);
router.get('/:id', optionalAuth, idParam, validate, getProduct);

// Protected routes
router.post('/', authenticate, validate, productValidation.create, createProduct);
router.put('/:id', authenticate, idParam, validate, productValidation.update, updateProduct);
router.delete('/:id', authenticate, idParam, validate, deleteProduct);

module.exports = router;
