const db = require('./db');
const bcrypt = require('bcryptjs');

const run = db.run;
const get = db.get;
const all = db.all;

async function createTables() {
  // Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'Admin',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 5,
      unit TEXT DEFAULT 'pieces',
      tax_rate REAL DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Product Variants table
  await run(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      color TEXT,
      size TEXT,
      design_number TEXT,
      sku_suffix TEXT,
      stock_quantity INTEGER DEFAULT 0,
      price_override REAL DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  // Ensure older databases get the price_override column
  try {
    await run('ALTER TABLE product_variants ADD COLUMN price_override REAL DEFAULT NULL');
  } catch (e) {
    // ignore if column already exists
  }

  // Customers table
  await run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      gst_no TEXT,
      address TEXT,
      segment TEXT DEFAULT 'Regular',
      status TEXT DEFAULT 'Active',
      total_purchases REAL DEFAULT 0,
      due REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bills table
  await run(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      customer_name TEXT,
      customer_phone TEXT,
      subtotal REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      discount_flat REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'completed',
      items_count INTEGER DEFAULT 0,
      bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    )
  `);

  // Bill Items table
  await run(`
    CREATE TABLE IF NOT EXISTS bill_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT,
      category TEXT,
      size TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      line_total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);

  // Returns table
  await run(`
    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice TEXT NOT NULL,
      customer TEXT,
      item TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      reason TEXT,
      notes TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_name TEXT DEFAULT 'Anyaa Textiles',
      gst_no TEXT,
      phone TEXT,
      address TEXT,
      currency TEXT DEFAULT 'INR',
      tax_default REAL DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Roles table (for future multi-role support)
  await run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      permissions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Staff table (for future HR module)
  await run(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      department TEXT,
      salary REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  console.log('✅ All tables created successfully');
}

async function insertDefaultData() {
  // Insert default users
  const hashedPassword = bcrypt.hashSync('admin', 10);
  await run(`INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`, ['admin@anyaa.com', hashedPassword, 'Admin User', 'Admin']);
  const salesPassword = bcrypt.hashSync('sales', 10);
  await run(`INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`, ['sales@anyaa.com', salesPassword, 'Sales User', 'Sales']);
  const accountsPassword = bcrypt.hashSync('accounts', 10);
  await run(`INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`, ['accounts@anyaa.com', accountsPassword, 'Accounts User', 'Accounts']);
  console.log('✅ Default users inserted');

  // Insert default products
  await run(`INSERT OR IGNORE INTO products (sku, name, category, price, stock, min_stock, unit, tax_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['KU-104', 'Pink Floral Kurti', 'Kurti', 1250, 2, 5, 'pieces', 5]);
  await run(`INSERT OR IGNORE INTO products (sku, name, category, price, stock, min_stock, unit, tax_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['SA-212', 'Silk Saree - Navy Blue', 'Saree', 4500, 1, 3, 'pieces', 12]);
  await run(`INSERT OR IGNORE INTO products (sku, name, category, price, stock, min_stock, unit, tax_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['LG-045', 'Cotton Leggings - XL', 'Leggings', 450, 4, 10, 'pieces', 5]);
  console.log('✅ Default products inserted');

  // Insert default customers
  await run(`INSERT OR IGNORE INTO customers (name, phone, email, total_purchases, due) VALUES (?, ?, ?, ?, ?)`, ['Priya S.', '9876543210', 'priya@example.com', 12450, 0]);
  await run(`INSERT OR IGNORE INTO customers (name, phone, email, total_purchases, due) VALUES (?, ?, ?, ?, ?)`, ['Meena R.', '9876543211', 'meena@example.com', 850, 0]);
  await run(`INSERT OR IGNORE INTO customers (name, phone, email, total_purchases, due) VALUES (?, ?, ?, ?, ?)`, ['Phoenix', '85522666', 'phoen@gmail.com', 0, 0]);
  console.log('✅ Default customers inserted');

  // Insert default settings
  await run(`INSERT OR IGNORE INTO settings (id, business_name, phone, address, currency, tax_default) VALUES (1, ?, ?, ?, ?, ?)`, ['Anyaa Textiles', '+91 9876543210', '123 Textile Market, City', 'INR', 5]);
  console.log('✅ Default settings inserted');

  // Insert default roles
  await run(`INSERT OR IGNORE INTO roles (name, permissions) VALUES (?, ?)`, ['Admin', JSON.stringify(['view_all', 'edit_all', 'delete_all', 'user_mgmt'])]);
  await run(`INSERT OR IGNORE INTO roles (name, permissions) VALUES (?, ?)`, ['Manager', JSON.stringify(['view_all', 'edit_sales', 'approve_discount'])]);
  await run(`INSERT OR IGNORE INTO roles (name, permissions) VALUES (?, ?)`, ['Cashier', JSON.stringify(['view_billing', 'create_bill', 'view_stock'])]);
  await run(`INSERT OR IGNORE INTO roles (name, permissions) VALUES (?, ?)`, ['Staff', JSON.stringify(['view_billing', 'view_stock'])]);
  console.log('✅ Default roles inserted');
}

async function createIndexes() {
  await run('CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)');
  await run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
  await run('CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)');
  await run('CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON bills(bill_number)');
  await run('CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_bills_bill_date ON bills(bill_date)');
  await run('CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_returns_invoice ON returns(invoice)');
  await run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  console.log('✅ Indexes created successfully');
}

async function init() {
  try {
    console.log('🚀 Initializing database...');
    await createTables();
    await insertDefaultData();
    await createIndexes();
    console.log('✅ Database initialization completed successfully!');
    console.log(`📁 Database location: ${db.path}`);
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  } finally {
    await db.close();
  }
}

init();
