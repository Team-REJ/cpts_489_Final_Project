const db = require('../config/db');

const getUserStmt = () =>
  db.prepare(
    'SELECT id, email, first_name, last_name, role, status, rating, created_at FROM users WHERE id = ?'
  );

let stmt;

module.exports = function attachUser(req, res, next) {
  if (!stmt) stmt = getUserStmt();

  res.locals.currentUser = null;
  res.locals.flash = null;
  res.locals.csrfToken = '';

  if (req.session && req.session.userId) {
    const user = stmt.get(req.session.userId);
    if (user) {
      req.user = user;
      res.locals.currentUser = user;
    } else {
      delete req.session.userId;
    }
  }

  if (req.session && req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }

  if (typeof req.csrfToken === 'function') {
    res.locals.csrfToken = req.csrfToken();
  }

  next();
};
