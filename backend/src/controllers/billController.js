const db = require('../database/db');

// Get all bills
const getBills = async (req, res) => {
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

    const bills = await db.all(sql, params);

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
const getBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await db.get('SELECT * FROM bills WHERE id = ?', [id]);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Get bill items
    const items = await db.all('SELECT * FROM bill_items WHERE bill_id = ?', [id]);

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
const createBill = async (req, res) => {
  try {
    const { 
      bill_number, customer_id, customer_name, customer_phone,
      subtotal, tax_amount, discount_flat, discount_percent, total,
      payment_method, payment_status, lineItems 
    } = req.body;

    // Check if bill_number already exists
    const existingBill = await db.get('SELECT id FROM bills WHERE bill_number = ?', [bill_number]);
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: 'Bill number already exists. Please generate a new invoice number.'
      });
    }

    const billId = await db.transaction(async () => {
      // Insert bill
      const billResult = await db.run(
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

      const newBillId = billResult.lastInsertRowid;

      // Insert bill items
      for (const item of lineItems) {
        await db.run(
          `INSERT INTO bill_items (bill_id, product_id, product_name, category, size, quantity, unit_price, line_total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newBillId,
            item.product_id || null,
            item.name,
            item.category || null,
            item.size || null,
            item.quantity,
            item.rate,
            item.quantity * item.rate
          ]
        );

        // Update product stock
        if (item.product_id) {
          await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      }

      // Update customer total purchases if customer exists
      if (customer_id) {
        await db.run('UPDATE customers SET total_purchases = total_purchases + ? WHERE id = ?', [total, customer_id]);
      }

      return newBillId;
    });

    const newBill = await db.get('SELECT * FROM bills WHERE id = ?', [billId]);
    const items = await db.all('SELECT * FROM bill_items WHERE bill_id = ?', [billId]);

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
const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, customer_phone, payment_status, payment_method } = req.body;

    const existingBill = await db.get('SELECT * FROM bills WHERE id = ?', [id]);
    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    await db.run(
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

    const updatedBill = await db.get('SELECT * FROM bills WHERE id = ?', [id]);

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
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBill = await db.get('SELECT * FROM bills WHERE id = ?', [id]);
    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Start transaction to restore stock
    await db.transaction(async () => {
      // Get bill items to restore stock
      const items = await db.all('SELECT * FROM bill_items WHERE bill_id = ?', [id]);
      
      for (const item of items) {
        if (item.product_id) {
          await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      }

      // Delete bill (cascade will delete items)
      await db.run('DELETE FROM bills WHERE id = ?', [id]);

      // Update customer total purchases
      if (existingBill.customer_id) {
        await db.run('UPDATE customers SET total_purchases = total_purchases - ? WHERE id = ?', [existingBill.total, existingBill.customer_id]);
      }
    });

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
