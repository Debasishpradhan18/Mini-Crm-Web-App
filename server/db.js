const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'crm.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite CRM database at', DB_PATH);
  }
});

// Promisified helpers for clean async/await
const dbAsync = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
  exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

async function initDB() {
  await dbAsync.run('PRAGMA foreign_keys = ON;');
  await dbAsync.run('PRAGMA journal_mode = WAL;');

  // Users table
  await dbAsync.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      company TEXT,
      role TEXT DEFAULT 'Sales Executive',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contacts table
  await dbAsync.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      job_title TEXT,
      status TEXT DEFAULT 'Lead', -- 'Lead', 'Prospect', 'Customer', 'Inactive'
      tags TEXT DEFAULT '[]', -- JSON array of tags e.g. ["Enterprise", "Hot Lead"]
      value REAL DEFAULT 0,
      notes TEXT,
      linkedin TEXT,
      twitter TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Deals table
  // Stages: 'New', 'Contacted', 'Qualified', 'Won', 'Lost'
  await dbAsync.run(`
    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      contact_id INTEGER,
      title TEXT NOT NULL,
      value REAL NOT NULL DEFAULT 0,
      stage TEXT NOT NULL DEFAULT 'New',
      probability INTEGER DEFAULT 20, -- 0 to 100%
      priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
      expected_close_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
    )
  `);

  // Activities / Interactions / Timeline table
  await dbAsync.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      contact_id INTEGER,
      deal_id INTEGER,
      type TEXT NOT NULL, -- 'note', 'email', 'call', 'stage_change', 'ai_assist', 'deal_created', 'contact_created'
      title TEXT NOT NULL,
      description TEXT,
      metadata TEXT, -- JSON string for extra fields
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    )
  `);

  // Settings table (per user or global)
  await dbAsync.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      UNIQUE(user_id, key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables verified.');
}

module.exports = {
  db,
  dbAsync,
  initDB
};
