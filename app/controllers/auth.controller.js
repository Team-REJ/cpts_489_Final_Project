const db = require('../../config/db');
const password = require('../../utils/password');
const { AUTH, ROLES } = require('../../config/constants');

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function safeRedirect(target) {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) {
    return '/dashboard';
  }
  return target;
}

exports.getRegister = (req, res) => {
  res.render('register', { title: 'Register', values: {} });
};

exports.postRegister = async (req, res, next) => {
  try {
    const { email = '', password: pw = '', first_name = '', last_name = '' } = req.body;
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanFirst = String(first_name).trim();
    const cleanLast = String(last_name).trim();

    const values = { email: cleanEmail, first_name: cleanFirst, last_name: cleanLast };

    if (!cleanEmail || !pw || !cleanFirst || !cleanLast) {
      setFlash(req, 'error', 'All fields are required.');
      return res.status(400).render('register', { title: 'Register', values });
    }

    if (!AUTH.WSU_EMAIL_PATTERN.test(cleanEmail)) {
      setFlash(req, 'error', 'Email must be a @wsu.edu address.');
      return res.status(400).render('register', { title: 'Register', values });
    }

    if (pw.length < AUTH.PASSWORD_MIN_LENGTH) {
      setFlash(req, 'error', `Password must be at least ${AUTH.PASSWORD_MIN_LENGTH} characters.`);
      return res.status(400).render('register', { title: 'Register', values });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      setFlash(req, 'error', 'An account with that email already exists.');
      return res.status(409).render('register', { title: 'Register', values });
    }

    const hashed = await password.hash(pw);
    const result = db
      .prepare(
        'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)'
      )
      .run(cleanEmail, hashed, cleanFirst, cleanLast, ROLES.STUDENT);

    req.session.regenerate((regenErr) => {
      if (regenErr) return next(regenErr);
      req.session.userId = result.lastInsertRowid;
      setFlash(req, 'success', `Welcome to CougarMarket, ${cleanFirst}!`);
      res.redirect('/dashboard');
    });
  } catch (err) {
    next(err);
  }
};

exports.getLogin = (req, res) => {
  const redirect = typeof req.query.redirect === 'string' ? req.query.redirect : '';
  res.render('login', { title: 'Log in', values: {}, redirect });
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email = '', password: pw = '', redirect = '' } = req.body;
    const cleanEmail = String(email).trim().toLowerCase();
    const values = { email: cleanEmail };

    if (!cleanEmail || !pw) {
      setFlash(req, 'error', 'Email and password are required.');
      return res.status(400).render('login', { title: 'Log in', values, redirect });
    }

    const user = db
      .prepare('SELECT id, email, password_hash, status FROM users WHERE email = ?')
      .get(cleanEmail);

    if (!user) {
      setFlash(req, 'error', 'Invalid email or password.');
      return res.status(401).render('login', { title: 'Log in', values, redirect });
    }

    const ok = await password.compare(pw, user.password_hash);
    if (!ok) {
      setFlash(req, 'error', 'Invalid email or password.');
      return res.status(401).render('login', { title: 'Log in', values, redirect });
    }

    if (user.status === 'suspended') {
      setFlash(req, 'error', 'This account is suspended. Contact an administrator.');
      return res.status(403).render('login', { title: 'Log in', values, redirect });
    }

    req.session.regenerate((regenErr) => {
      if (regenErr) return next(regenErr);
      req.session.userId = user.id;
      setFlash(req, 'success', 'Signed in.');
      res.redirect(safeRedirect(redirect));
    });
  } catch (err) {
    next(err);
  }
};

exports.postLogout = (req, res, next) => {
  if (!req.session) return res.redirect('/');
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('cougarmarket.sid');
    res.redirect('/');
  });
};
