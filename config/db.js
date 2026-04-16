const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'cougmarket.sqlite');

if (!fs.existsSync(dbPath)) {
  console.error(`[db] Database file not found at ${dbPath}`);
  console.error('[db] Run `npm run db:init` to create the schema and seed demo data.');
  throw new Error('Database not initialized');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
