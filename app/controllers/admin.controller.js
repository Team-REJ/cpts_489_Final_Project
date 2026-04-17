const User = require('../models/user.model');
const Listing = require('../models/listing.model');
const Stats = require('../models/stats.model');
const Moderation = require('../models/moderation.model');
const Notification = require('../models/notification.model');
const {
  ROLES,
  ROLE_VALUES,
  USER_STATUS,
  LISTING_STATUS,
  NOTIFICATION_TYPE,
  MODERATION_ACTION,
} = require('../../config/constants');

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

/**
 * Admin dashboard with live marketplace statistics.
 * GET /admin
 */
exports.getDashboard = (req, res, next) => {
  try {
    const summary = Stats.getGlobalSummary();
    const listingStatus = Stats.getListingStatusSummary();
    const listingCategory = Stats.getListingDistribution();
    const userRoles = Stats.getUserRoleDistribution();
    const requestStatus = Stats.getRequestStatusSummary();
    const transactionVolume = Stats.getTransactionVolume();
    const pendingCount = Listing.findByStatus(LISTING_STATUS.PENDING).length;
    const recentActions = Moderation.findAll().slice(0, 10);

    res.render('admin-dashboard', {
      title: 'Admin Dashboard',
      summary,
      pendingCount,
      listingStatus,
      listingCategory,
      userRoles,
      requestStatus,
      transactionVolume,
      recentActions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * List every registered user for role/status management.
 * GET /admin/users
 */
exports.getUsers = (req, res, next) => {
  try {
    const users = User.findAll();
    res.render('users', {
      title: 'User Management',
      users,
      roles: ROLE_VALUES,
      userStatus: USER_STATUS,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle a user between active and suspended.
 * POST /admin/users/:id/ban
 */
exports.postBanUser = (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const target = User.findById(targetId);

    if (!target) {
      setFlash(req, 'error', 'User not found.');
      return res.redirect('/admin/users');
    }

    if (target.id === req.user.id) {
      setFlash(req, 'error', 'You cannot change your own account status.');
      return res.redirect('/admin/users');
    }

    if (target.role === ROLES.ADMIN && User.countByRole(ROLES.ADMIN) <= 1) {
      setFlash(req, 'error', 'Cannot suspend the last remaining admin.');
      return res.redirect('/admin/users');
    }

    const nextStatus =
      target.status === USER_STATUS.SUSPENDED ? USER_STATUS.ACTIVE : USER_STATUS.SUSPENDED;
    User.updateStatus(targetId, nextStatus);

    Moderation.log({
      actor_id: req.user.id,
      action:
        nextStatus === USER_STATUS.SUSPENDED
          ? MODERATION_ACTION.SUSPEND_USER
          : MODERATION_ACTION.UNSUSPEND_USER,
      target_user_id: targetId,
      reason: req.body.reason || '',
    });

    setFlash(
      req,
      'success',
      nextStatus === USER_STATUS.SUSPENDED
        ? `${target.first_name} ${target.last_name} has been suspended.`
        : `${target.first_name} ${target.last_name} has been reactivated.`
    );
    res.redirect('/admin/users');
  } catch (err) {
    next(err);
  }
};

/**
 * Change a user's role.
 * POST /admin/users/:id/role
 */
exports.postChangeRole = (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    const { role } = req.body;
    const target = User.findById(targetId);

    if (!target) {
      setFlash(req, 'error', 'User not found.');
      return res.redirect('/admin/users');
    }

    if (!ROLE_VALUES.includes(role)) {
      setFlash(req, 'error', 'Invalid role value.');
      return res.redirect('/admin/users');
    }

    if (target.id === req.user.id) {
      setFlash(req, 'error', 'You cannot change your own role.');
      return res.redirect('/admin/users');
    }

    if (
      target.role === ROLES.ADMIN &&
      role !== ROLES.ADMIN &&
      User.countByRole(ROLES.ADMIN) <= 1
    ) {
      setFlash(req, 'error', 'Cannot demote the last remaining admin.');
      return res.redirect('/admin/users');
    }

    User.updateRole(targetId, role);

    Moderation.log({
      actor_id: req.user.id,
      action: MODERATION_ACTION.CHANGE_ROLE,
      target_user_id: targetId,
      reason: `Role changed from ${target.role} to ${role}.`,
    });

    setFlash(req, 'success', `${target.first_name}'s role updated to ${role}.`);
    res.redirect('/admin/users');
  } catch (err) {
    next(err);
  }
};

/**
 * Browse every listing across all statuses.
 * GET /admin/listings
 */
exports.getListings = (req, res, next) => {
  try {
    const listings = Listing.findAll();
    res.render('admin-listings', {
      title: 'All Listings',
      listings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a listing (mark status = 'removed') and notify owner.
 * POST /admin/listings/:id/remove
 */
exports.postRemoveListing = (req, res, next) => {
  try {
    const listingId = parseInt(req.params.id, 10);
    const listing = Listing.findById(listingId);

    if (!listing) {
      setFlash(req, 'error', 'Listing not found.');
      return res.redirect('/admin/listings');
    }

    Listing.updateStatus(listingId, LISTING_STATUS.REMOVED);

    Moderation.log({
      actor_id: req.user.id,
      action: MODERATION_ACTION.REMOVE_LISTING,
      target_listing_id: listingId,
      target_user_id: listing.owner_id,
      reason: req.body.reason || 'Removed by admin.',
    });

    Notification.create({
      recipient_id: listing.owner_id,
      type: NOTIFICATION_TYPE.LISTING_REMOVED,
      body: `Your listing "${listing.title}" was removed by an admin.`,
      related_listing_id: listingId,
    });

    setFlash(req, 'success', 'Listing removed.');
    res.redirect('/admin/listings');
  } catch (err) {
    next(err);
  }
};
