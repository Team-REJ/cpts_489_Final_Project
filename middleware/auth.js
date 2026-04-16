function requireAuth(req, res, next) {
  if (req.user) return next();
  const redirect = encodeURIComponent(req.originalUrl || '/');
  return res.redirect(`/login?redirect=${redirect}`);
}

function requireGuest(req, res, next) {
  if (!req.user) return next();
  return res.redirect('/dashboard');
}

module.exports = { requireAuth, requireGuest };
