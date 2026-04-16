#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const { AUTH, ROLES } = require('../config/constants');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'cougmarket.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

const reset = process.argv.includes('--reset');

function main() {
  if (fs.existsSync(DB_PATH)) {
    if (reset) {
      console.log(`[init] --reset specified, removing ${DB_PATH}`);
      fs.unlinkSync(DB_PATH);
    } else {
      console.log(`[init] ${DB_PATH} already exists; dropping and recreating tables in place.`);
    }
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  console.log('[init] applying schema.sql');
  db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

  console.log('[init] seeding demo users');
  const insertUser = db.prepare(
    'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)'
  );

  const demoPassword = 'password123';
  const hash = bcrypt.hashSync(demoPassword, AUTH.BCRYPT_COST);

  const demoUsers = [
    ['student1@wsu.edu', hash, 'Avery',  'Chen',    ROLES.STUDENT],
    ['student2@wsu.edu', hash, 'Jordan', 'Nguyen',  ROLES.STUDENT],
    ['student3@wsu.edu', hash, 'Riley',  'Martinez', ROLES.STUDENT],
    ['mod@wsu.edu',      hash, 'Sam',    'Okafor',  ROLES.MODERATOR],
    ['admin@wsu.edu',    hash, 'Taylor', 'Reyes',   ROLES.ADMIN],
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertUser.run(...row);
  });
  insertMany(demoUsers);

  console.log('[init] applying seed.sql (listings + images)');
  db.exec(fs.readFileSync(SEED_PATH, 'utf8'));

  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  const listingCount = db.prepare('SELECT COUNT(*) AS n FROM listings').get().n;
  console.log(`[init] done. users=${userCount} listings=${listingCount}`);
  console.log('[init] demo credentials:');
  console.log('         student1@wsu.edu / password123');
  console.log('         student2@wsu.edu / password123');
  console.log('         student3@wsu.edu / password123');
  console.log('         mod@wsu.edu      / password123');
  console.log('         admin@wsu.edu    / password123');

  db.close();
}

try {
  main();
} catch (err) {
  console.error('[init] failed:', err.message);
  process.exitCode = 1;
}
