const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'anyaa.db');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create database connection wrapper with query helpers
class DatabaseWrapper {
  constructor(db) {
    this.db = db;
  }

  // Generic query methods
  all(sql, params = []) {
    try {
      return this.db.prepare(sql).all(...params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  get(sql, params = []) {
    try {
      return this.db.prepare(sql).get(...params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  run(sql, params = []) {
    try {
      return this.db.prepare(sql).run(...params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Transaction support
  transaction(fn) {
    const txn = this.db.transaction(fn);
    return txn;
  }

  // Close connection
  close() {
    this.db.close();
  }
}

module.exports = new DatabaseWrapper(db);
