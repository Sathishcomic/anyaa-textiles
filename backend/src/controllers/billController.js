const db = require('../database/db');

// Get all bills
const getBills = (req, res) => {
  try {
    const { search, status, paymentMethod, fromDate, toDate, limit = 50 } = req.query;
    
    let sql = 'SELECT * FROM bills';
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push('(bill_number LIKE ? OR customer_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      conditions.push('payment_status = ?');
      params.push(status);
    }

    if (paymentMethod) {
      conditions.push('payment_method = ?');
      params.push(paymentMethod);
    }

    if (fromDate) {
      conditions.push('bill_date >= ?');
      params.push(fromDate);
    }

    if (toDate) {
      conditions.push('bill_date <= ?');
      params.push(toDate);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY bill_date DESC LIMIT ?';
    params.push(parseInt(limit));

    const bills = db.all(sql, params);

    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bills',
      error: error.message
    });
  }
};

// Get single bill with items
const getBill = (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = db.get('SELECT * FROM bills WHERE id = ?', [id]);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Get bill items
    const items = db.all('SELECT * FROM bill_items WHERE bill_id = ?', [id]);

    res.json({
      success: true,
      data: { ...bill, items }
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bill',
      error: error.message
    });
  }
};

// Create bill with transaction
const createBill = (req, res) => {
  try {
    const { 
      bill_number, customer_id, customer_name, customer_phone,
      subtotal, tax_amount, discount_flat, discount_percent, total,
      payment_method, payment_status, lineItems 
    } = req.body;

    // Start transaction
    const createBillTxn = db.transaction(() => {
      // Insert bill
      const billResult = db.run(
        `INSERT INTO bills (bill_number, customer_id, customer_name, customer_phone,
         subtotal, tax_amount, discount_flat, discount_percent, total,
         payment_method, payment_status, items_count, bill_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          bill_number,
          customer_id || null,
          customer_name,
          customer_phone || null,
          subtotal,
          tax_amount || 0,
          discount_flat || 0,
          discount_percent || 0,
          total,
          payment_method,
          payment_status || 'completed',
          lineItems.length
        ]
      );

      const billId = billResult.lastInsertRowid;

      // Insert bill items
      const insertItem = db.prepare(
        `INSERT INTO bill_items (bill_id, product_id, product_name, category, size, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );

      for (const item of lineItems) {
        insertItem.run(
          billId,
          item.product_id || null,
          item.name,
          item.category || null,
          item.size || null,
          item.quantity,
          item.rate,
          item.quantity * item.rate
        );

        // Update product stock
        if (item.product_id) {
          db.run(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      // Update customer total purchases if customer exists
      if (customer_id) {
        db.run(
          'UPDATE customers SET total_purchases = total_purchases + ? WHERE id = ?',
          [total, customer_id]
        );
      }

      return billId;
    });

    const billId = createBillTxn();

    const newBill = db.get('SELECT * FROM bills WHERE id = ?', [billId]);
    const items = db.all('SELECT * FROM bill_items WHERE bill_id = ?', [billId]);

    res.status(201).json({
      success: true,
      data: { ...newBill, items },
      message: 'Bill created successfully'
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bill',
      error: error.message
    });
  }
};

// Update bill
const updateBill = (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, customer_phone, payment_status, payment_method } = req.body;

    const existingBill = db.get('SELECT * FROM bills WHERE id = ?', [id]);
    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    db.run(
      `UPDATE bills 
       SET customer_name = ?, customer_phone = ?, payment_status = ?, 
           payment_method = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        customer_name || existingBill.customer_name,
        customer_phone !== undefined ? customer_phone : existingBill.customer_phone,
        payment_status || existingBill.payment_status,
        payment_method || existingBill.payment_method,
        id
      ]
    );

    const updatedBill = db.get('SELECT * FROM bills WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updatedBill,
      message: 'Bill updated successfully'
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bill',
      error: error.message
    });
  }
};

// Delete bill
const deleteBill = (req, res) => {
  try {
    const { id } = req.params;

    const existingBill = db.get('SELECT * FROM bills WHERE id = ?', [id]);
    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Start transaction to restore stock
    const deleteBillTxn = db.transaction(() => {
      // Get bill items to restore stock
      const items = db.all('SELECT * FROM bill_items WHERE bill_id = ?', [id]);
      
      for (const item of items) {
        if (item.product_id) {
          db.run(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      // Delete bill (cascade will delete items)
      db.run('DELETE FROM bills WHERE id = ?', [id]);

      // Update customer total purchases
      if (existingBill.customer_id) {
        db.run(
          'UPDATE customers SET total_purchases = total_purchases - ? WHERE id = ?',
          [existingBill.total, existingBill.customer_id]
        );
      }
    });

    deleteBillTxn();

    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bill',
      error: error.message
    });
  }
};

module.exports = {
  getBills,
  getBill,
  createBill,
  updateBill,
  deleteBill
};
