const db = require('../database/db');

// Get all customers
const getCustomers = (req, res) => {
  try {
    const { search, segment, status } = req.query;
    
    let sql = 'SELECT * FROM customers';
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push('(name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (segment) {
      conditions.push('segment = ?');
      params.push(segment);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const customers = db.all(sql, params);

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customers',
      error: error.message
    });
  }
};

// Get single customer
const getCustomer = (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = db.get('SELECT * FROM customers WHERE id = ?', [id]);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer's bills
    const bills = db.all(
      'SELECT * FROM bills WHERE customer_id = ? ORDER BY bill_date DESC LIMIT 10',
      [id]
    );

    res.json({
      success: true,
      data: { ...customer, recentBills: bills }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer',
      error: error.message
    });
  }
};

// Create customer
const createCustomer = (req, res) => {
  try {
    const { name, phone, email, gstNo, address, segment, status } = req.body;

    const result = db.run(
      `INSERT INTO customers (name, phone, email, gst_no, address, segment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        phone || null,
        email || null,
        gstNo || null,
        address || null,
        segment || 'Regular',
        status || 'Active'
      ]
    );

    const newCustomer = db.get('SELECT * FROM customers WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      data: newCustomer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

// Update customer
const updateCustomer = (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, gstNo, address, segment, status, totalPurchases, due } = req.body;

    const existingCustomer = db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    db.run(
      `UPDATE customers 
       SET name = ?, phone = ?, email = ?, gst_no = ?, address = ?, 
           segment = ?, status = ?, total_purchases = ?, due = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || existingCustomer.name,
        phone !== undefined ? phone : existingCustomer.phone,
        email !== undefined ? email : existingCustomer.email,
        gstNo !== undefined ? gstNo : existingCustomer.gst_no,
        address !== undefined ? address : existingCustomer.address,
        segment || existingCustomer.segment,
        status || existingCustomer.status,
        totalPurchases !== undefined ? totalPurchases : existingCustomer.total_purchases,
        due !== undefined ? due : existingCustomer.due,
        id
      ]
    );

    const updatedCustomer = db.get('SELECT * FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

// Delete customer
const deleteCustomer = (req, res) => {
  try {
    const { id } = req.params;

    const existingCustomer = db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    db.run('DELETE FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
