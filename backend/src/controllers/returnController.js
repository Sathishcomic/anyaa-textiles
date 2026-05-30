const db = require('../database/db');

// Get all returns
const getReturns = (req, res) => {
  try {
    const { status, type, search } = req.query;
    
    let sql = 'SELECT * FROM returns';
    let params = [];
    let conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (search) {
      conditions.push('(invoice LIKE ? OR customer LIKE ? OR item LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const returns = db.all(sql, params);

    res.json({
      success: true,
      data: returns
    });
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get returns',
      error: error.message
    });
  }
};

// Get single return
const getReturn = (req, res) => {
  try {
    const { id } = req.params;
    
    const returnRecord = db.get('SELECT * FROM returns WHERE id = ?', [id]);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    res.json({
      success: true,
      data: returnRecord
    });
  } catch (error) {
    console.error('Get return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get return',
      error: error.message
    });
  }
};

// Create return
const createReturn = (req, res) => {
  try {
    const { invoice, customer, item, type, quantity, reason, notes } = req.body;

    const result = db.run(
      `INSERT INTO returns (invoice, customer, item, type, quantity, reason, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice,
        customer || null,
        item,
        type,
        quantity || 1,
        reason || null,
        notes || null
      ]
    );

    const newReturn = db.get('SELECT * FROM returns WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      data: newReturn,
      message: 'Return created successfully'
    });
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create return',
      error: error.message
    });
  }
};

// Update return
const updateReturn = (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const existingReturn = db.get('SELECT * FROM returns WHERE id = ?', [id]);
    if (!existingReturn) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    db.run(
      `UPDATE returns 
       SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        status || existingReturn.status,
        notes !== undefined ? notes : existingReturn.notes,
        id
      ]
    );

    const updatedReturn = db.get('SELECT * FROM returns WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updatedReturn,
      message: 'Return updated successfully'
    });
  } catch (error) {
    console.error('Update return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update return',
      error: error.message
    });
  }
};

// Delete return
const deleteReturn = (req, res) => {
  try {
    const { id } = req.params;

    const existingReturn = db.get('SELECT * FROM returns WHERE id = ?', [id]);
    if (!existingReturn) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    db.run('DELETE FROM returns WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Return deleted successfully'
    });
  } catch (error) {
    console.error('Delete return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete return',
      error: error.message
    });
  }
};

module.exports = {
  getReturns,
  getReturn,
  createReturn,
  updateReturn,
  deleteReturn
};
