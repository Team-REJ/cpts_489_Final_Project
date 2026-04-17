const User = require('../models/user.model');
const password = require('../../utils/password');
const { AUTH } = require('../../config/constants');

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

/**
 * Render the account settings page.
 * GET /settings
 */
exports.getIndex = (req, res) => {
  res.render('settings', { title: 'Settings' });
};

/**
 * Change the authenticated user's password.
 * POST /settings/password
 */
exports.postPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFlash(req, 'error', 'All password fields are required.');
      return res.redirect('/settings');
    }

    if (newPassword.length < AUTH.PASSWORD_MIN_LENGTH) {
      setFlash(req, 'error', `New password must be at least ${AUTH.PASSWORD_MIN_LENGTH} characters.`);
      return res.redirect('/settings');
    }

    if (newPassword !== confirmPassword) {
      setFlash(req, 'error', 'New password and confirmation do not match.');
      return res.redirect('/settings');
    }

    const userWithHash = User.findByIdWithHash(req.user.id);
    if (!userWithHash) {
      setFlash(req, 'error', 'Account not found.');
      return res.redirect('/settings');
    }

    const ok = await password.compare(currentPassword, userWithHash.password_hash);
    if (!ok) {
      setFlash(req, 'error', 'Current password is incorrect.');
      return res.redirect('/settings');
    }

    const newHash = await password.hash(newPassword);
    User.updatePassword(req.user.id, newHash);

    setFlash(req, 'success', 'Password updated successfully.');
    res.redirect('/settings');
  } catch (err) {
    next(err);
  }
};
