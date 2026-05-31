const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path: backend/database/anyaa.db
const dataDir = path.join(__dirname, '..', '..', 'database');
const dbPath = path.join(dataDir, 'anyaa.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
  } else {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    // WAL mode for better concurrency
    db.run("PRAGMA journal_mode = WAL");
  }
});

// Promise wrappers
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastInsertRowid: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function transaction(fn) {
  await run('BEGIN');
  try {
    const result = await fn();
    await run('COMMIT');
    return result;
  } catch (err) {
    await run('ROLLBACK');
    throw err;
  }
}

function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  run,
  get,
  all,
  transaction,
  close,
  _raw: db,
  path: dbPath,
};
// end of file
