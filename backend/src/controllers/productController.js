const db = require('../database/db');

// Get all products
const getProducts = (req, res) => {
  try {
    const { search, category, sort } = req.query;
    
    let sql = 'SELECT * FROM products';
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push('(name LIKE ? OR sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    if (sort) {
      const [field, order] = sort.split(':');
      const allowedFields = ['name', 'sku', 'category', 'price', 'stock', 'created_at'];
      if (allowedFields.includes(field)) {
        sql += ` ORDER BY ${field} ${order === 'desc' ? 'DESC' : 'ASC'}`;
      }
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    const products = db.all(sql, params);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    });
  }
};

// Get single product
const getProduct = (req, res) => {
  try {
    const { id } = req.params;
    
    const product = db.get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get variants if any
    const variants = db.all(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: { ...product, variants }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message
    });
  }
};

// Create product
const createProduct = (req, res) => {
  try {
    const { sku, name, category, price, stock, minStock, unit, taxRate } = req.body;

    const result = db.run(
      `INSERT INTO products (sku, name, category, price, stock, min_stock, unit, tax_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, name, category, price, stock || 0, minStock || 5, unit || 'pieces', taxRate || 5]
    );

    const newProduct = db.get('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product
const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, category, price, stock, minStock, unit, taxRate } = req.body;

    const existingProduct = db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    db.run(
      `UPDATE products 
       SET sku = ?, name = ?, category = ?, price = ?, stock = ?, 
           min_stock = ?, unit = ?, tax_rate = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        sku || existingProduct.sku,
        name || existingProduct.name,
        category || existingProduct.category,
        price !== undefined ? price : existingProduct.price,
        stock !== undefined ? stock : existingProduct.stock,
        minStock !== undefined ? minStock : existingProduct.min_stock,
        unit || existingProduct.unit,
        taxRate !== undefined ? taxRate : existingProduct.tax_rate,
        id
      ]
    );

    const updatedProduct = db.get('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    db.run('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Get low stock products
const getLowStockProducts = (req, res) => {
  try {
    const products = db.all(
      'SELECT * FROM products WHERE stock < min_stock ORDER BY stock ASC'
    );

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock products',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};
