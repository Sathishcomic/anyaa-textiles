const db = require('../database/db');

// Helper to coerce numeric fields
const toNumber = (v, fallback = 0) => (v === undefined || v === null || v === '' ? fallback : Number(v));

// Get all products
const getProducts = async (req, res) => {
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

    let products = await db.all(sql, params);
    // Load variants for each product so frontend can search by variant fields
    products = await Promise.all(products.map(async p => {
      const variants = await db.all('SELECT id, color, size, design_number, sku_suffix, stock_quantity, price_override FROM product_variants WHERE product_id = ?', [p.id]);
      // normalize field names to frontend expectations
      return { ...p, variants: variants.map(v => ({ id: v.id, color: v.color, size: v.size, designNumber: v.design_number, sku: v.sku_suffix, stock: v.stock_quantity, price_override: v.price_override })) };
    }));

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
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get variants if any
    const variants = await db.all('SELECT id, color, size, design_number, sku_suffix, stock_quantity, price_override FROM product_variants WHERE product_id = ?', [id]);

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
const createProduct = async (req, res) => {
  try {
    const { sku, name, category, price, stock, minStock, unit, taxRate, variants } = req.body;

    const result = await db.run(
      `INSERT INTO products (sku, name, category, price, stock, min_stock, unit, tax_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, name, category, toNumber(price), toNumber(stock, 0), toNumber(minStock, 5), unit || 'pieces', toNumber(taxRate, 5)]
    );

    const productId = result.lastInsertRowid;

    // If variants provided, insert them and compute total stock
    if (Array.isArray(variants) && variants.length > 0) {
      let totalStock = 0;
      for (const v of variants) {
        const qty = toNumber(v.stock || v.stock_quantity, 0);
        await db.run(
          `INSERT INTO product_variants (product_id, color, size, design_number, sku_suffix, stock_quantity, price_override)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [productId, v.color || null, v.size || null, v.designNumber || v.design_number || null, v.sku || v.sku_suffix || null, qty, v.price_override ?? v.price ?? null]
        );
        totalStock += qty;
      }

      // update master product stock to sum of variants
      await db.run('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [totalStock, productId]);
    }

    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

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
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, category, price, stock, minStock, unit, taxRate, variants } = req.body;

    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await db.run(
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

    // If variants provided, sync them (insert/update/delete) and recalculate stock
    if (Array.isArray(variants)) {
      await db.transaction(async () => {
        const existing = await db.all('SELECT id FROM product_variants WHERE product_id = ?', [id]);
        const existingIds = existing.map(e => e.id);
        const providedIds = [];

        for (const v of variants) {
          const qty = toNumber(v.stock || v.stock_quantity, 0);
          if (v.id) {
            providedIds.push(v.id);
            await db.run('UPDATE product_variants SET color = ?, size = ?, design_number = ?, sku_suffix = ?, stock_quantity = ?, price_override = ? WHERE id = ?', [v.color || null, v.size || null, v.designNumber || v.design_number || null, v.sku || v.sku_suffix || null, qty, v.price_override ?? v.price ?? null, v.id]);
          } else {
            const r = await db.run('INSERT INTO product_variants (product_id, color, size, design_number, sku_suffix, stock_quantity, price_override) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, v.color || null, v.size || null, v.designNumber || v.design_number || null, v.sku || v.sku_suffix || null, qty, v.price_override ?? v.price ?? null]);
            providedIds.push(r.lastInsertRowid);
          }
        }

        // Delete variants that were removed
        const toDelete = existingIds.filter(eid => !providedIds.includes(eid));
        for (const delId of toDelete) {
          await db.run('DELETE FROM product_variants WHERE id = ?', [delId]);
        }

        // Recalculate total stock from variants
        const totalRow = await db.get('SELECT COALESCE(SUM(stock_quantity),0) as total FROM product_variants WHERE product_id = ?', [id]);
        const total = totalRow ? totalRow.total : 0;
        await db.run('UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [total, id]);
      });
    }

    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);

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
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await db.run('DELETE FROM products WHERE id = ?', [id]);

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
const getLowStockProducts = async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products WHERE stock < min_stock ORDER BY stock ASC');

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
