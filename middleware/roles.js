const { ROLES } = require('../config/constants');

function deny(res, message) {
  return res.status(403).render('error', {
    title: 'Forbidden',
    status: 403,
    message: message || 'You do not have access to this page.',
  });
}

function requireRole(...allowed) {
  const flat = allowed.flat();
  return (req, res, next) => {
    if (!req.user) {
      const redirect = encodeURIComponent(req.originalUrl || '/');
      return res.redirect(`/login?redirect=${redirect}`);
    }
    if (!flat.includes(req.user.role)) return deny(res);
    next();
  };
}

const requireStudent   = requireRole(ROLES.STUDENT);
const requireModerator = requireRole(ROLES.MODERATOR);
const requireAdmin     = requireRole(ROLES.ADMIN);
const requireStaff     = requireRole(ROLES.MODERATOR, ROLES.ADMIN);

module.exports = {
  requireRole,
  requireStudent,
  requireModerator,
  requireAdmin,
  requireStaff,
};
