const express = require('express');
const router = express.Router();
const { login, logout, getCurrentUser, getAllUsers } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, userValidation } = require('../middleware/validation');

// Public routes
router.post('/login', validate, userValidation.login, login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.get('/users', authenticate, authorize('Admin'), getAllUsers);

module.exports = router;
