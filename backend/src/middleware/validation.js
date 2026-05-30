const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const userValidation = {
  login: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  create: [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['Admin', 'Sales', 'Accounts', 'Manager', 'Cashier', 'Staff'])
  ]
};

// Product validation rules
const productValidation = {
  create: [
    body('sku').notEmpty().withMessage('SKU is required'),
    body('name').notEmpty().withMessage('Product name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
    body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100')
  ],
  update: [
    body('sku').optional().notEmpty().withMessage('SKU cannot be empty'),
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('minStock').optional().isInt({ min: 0 }).withMessage('Min stock must be a non-negative integer'),
    body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100')
  ]
};

// Customer validation rules
const customerValidation = {
  create: [
    body('name').notEmpty().withMessage('Customer name is required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('email').optional().isEmail().withMessage('Valid email is required')
  ],
  update: [
    body('name').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('email').optional().isEmail().withMessage('Valid email is required')
  ]
};

// Bill validation rules
const billValidation = {
  create: [
    body('bill_number').notEmpty().withMessage('Bill number is required'),
    body('customer_name').notEmpty().withMessage('Customer name is required'),
    body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
    body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
    body('lineItems').isArray({ min: 1 }).withMessage('At least one line item is required'),
    body('lineItems.*.name').notEmpty().withMessage('Item name is required'),
    body('lineItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('lineItems.*.rate').isFloat({ min: 0 }).withMessage('Rate must be a positive number')
  ],
  update: [
    body('customer_name').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('subtotal').optional().isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
    body('total').optional().isFloat({ min: 0 }).withMessage('Total must be a positive number'),
    body('payment_status').optional().isIn(['draft', 'pending', 'completed', 'cancelled'])
  ]
};

// Return validation rules
const returnValidation = {
  create: [
    body('invoice').notEmpty().withMessage('Invoice number is required'),
    body('item').notEmpty().withMessage('Item name is required'),
    body('type').isIn(['Return', 'Exchange']).withMessage('Type must be Return or Exchange'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  update: [
    body('status').optional().isIn(['Pending', 'In Progress', 'Completed', 'Rejected'])
  ]
};

// ID parameter validation
const idParam = [
  param('id').isInt().withMessage('Valid ID is required')
];

module.exports = {
  validate,
  userValidation,
  productValidation,
  customerValidation,
  billValidation,
  returnValidation,
  idParam
};
