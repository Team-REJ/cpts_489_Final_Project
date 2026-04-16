const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const { AUTH } = require('./constants');

const sessionDbPath = process.env.SESSION_DB_PATH || path.join(__dirname, '..', 'database', 'sessions.sqlite');
const sessionDir = path.dirname(sessionDbPath);
const sessionDbFile = path.basename(sessionDbPath);

const isProd = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
  console.warn('[session] SESSION_SECRET is not set. Using an insecure dev default \u2014 set it in .env before deploying.');
}

module.exports = session({
  store: new SQLiteStore({
    db: sessionDbFile,
    dir: sessionDir,
  }),
  secret: process.env.SESSION_SECRET || 'dev-insecure-secret-change-me',
  name: 'cougarmarket.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: AUTH.SESSION_MAX_AGE_MS,
  },
});
