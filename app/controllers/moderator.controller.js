const Moderation = require('../models/moderation.model');
const Listing = require('../models/listing.model');
const Request = require('../models/request.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const {
  LISTING_STATUS,
  USER_STATUS,
  MODERATION_ACTION,
  NOTIFICATION_TYPE,
} = require('../../config/constants');

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function renderNotFound(res, message) {
  return res.status(404).render('error', {
    title: 'Not Found',
    status: 404,
    message,
  });
}

/**
 * Moderator Dashboard
 * Shows pending listings and this moderator's recent actions.
 * GET /moderator
 */
exports.getDashboard = (req, res, next) => {
  try {
    const pendingListings = Listing.findByStatus(LISTING_STATUS.PENDING);
    const moderationHistory = Moderation.findByActor(req.user.id);

    res.render('moderator-dashboard', {
      title: 'Moderator Dashboard',
      pendingListings,
      moderationHistory,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Approve a pending listing
 * POST /moderator/listings/:id/approve
 */
exports.postApproveListing = (req, res, next) => {
  try {
    const listingId = req.params.id;
    const listing = Listing.findById(listingId);
    if (!listing) return renderNotFound(res, 'Listing not found.');

    Listing.updateStatus(listingId, LISTING_STATUS.ACTIVE);

    Moderation.log({
      actor_id: req.user.id,
      action: MODERATION_ACTION.APPROVE_LISTING,
      target_listing_id: listingId,
      target_user_id: listing.owner_id,
      reason: 'Listing meets marketplace guidelines.',
    });

    Notification.create({
      recipient_id: listing.owner_id,
      type: NOTIFICATION_TYPE.LISTING_APPROVED,
      body: `Your listing "${listing.title}" has been approved and is now live.`,
      related_listing_id: listingId,
    });

    setFlash(req, 'success', 'Listing approved.');
    res.redirect('/moderator');
  } catch (err) {
    next(err);
  }
};

/**
 * Reject a pending listing
 * POST /moderator/listings/:id/reject
 */
exports.postRejectListing = (req, res, next) => {
  try {
    const listingId = req.params.id;
    const { reason } = req.body;
    const listing = Listing.findById(listingId);
    if (!listing) return renderNotFound(res, 'Listing not found.');

    Listing.updateStatus(listingId, LISTING_STATUS.REJECTED);

    Moderation.log({
      actor_id: req.user.id,
      action: MODERATION_ACTION.REJECT_LISTING,
      target_listing_id: listingId,
      target_user_id: listing.owner_id,
      reason: reason || 'Does not meet guidelines.',
    });

    Notification.create({
      recipient_id: listing.owner_id,
      type: NOTIFICATION_TYPE.LISTING_REJECTED,
      body: `Your listing "${listing.title}" was rejected. Reason: ${reason || 'Inappropriate content.'}`,
      related_listing_id: listingId,
    });

    setFlash(req, 'success', 'Listing rejected and owner notified.');
    res.redirect('/moderator');
  } catch (err) {
    next(err);
  }
};

/**
 * Platform-wide activity feed for moderator oversight.
 * Shows recent listings, requests, and moderation actions across all users.
 * GET /moderator/activity
 */
exports.getActivity = (req, res, next) => {
  try {
    const recentListings = Listing.findRecent(15);
    const recentRequests = Request.findRecent(15);
    const recentActions = Moderation.findRecent(15);

    res.render('moderator-activity', {
      title: 'Activity Feed',
      recentListings,
      recentRequests,
      recentActions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Dedicated pending-listings page (full table view).
 * GET /moderator/listings
 */
exports.getListings = (req, res, next) => {
  try {
    const pendingListings = Listing.findByStatus(LISTING_STATUS.PENDING);
    res.render('moderator-listings', {
      title: 'Pending Listings',
      pendingListings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Browse every user so moderators can flag/unflag.
 * GET /moderator/users
 */
exports.getUsers = (req, res, next) => {
  try {
    const users = User.findAll();
    res.render('moderator-users', {
      title: 'User Moderation',
      users,
      userStatus: USER_STATUS,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Clear a flagged status back to active.
 * POST /moderator/users/:id/unflag
 */
exports.postUnflagUser = (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const target = User.findById(userId);
    if (!target) return renderNotFound(res, 'User not found.');

    if (target.status !== USER_STATUS.FLAGGED) {
      setFlash(req, 'error', 'User is not currently flagged.');
      return res.redirect('/moderator/users');
    }

    User.updateStatus(userId, USER_STATUS.ACTIVE);

    Moderation.log({
      actor_id: req.user.id,
      action: MODERATION_ACTION.UNSUSPEND_USER,
      target_user_id: userId,
      reason: req.body.reason || 'Flag cleared after review.',
    });

    setFlash(req, 'success', 'User flag cleared.');
    res.redirect('/moderator/users');
  } catch (err) {
    next(err);
  }
};

/**
 * Flag a user account for follow-up
 * POST /moderator/users/:id/flag
 */
exports.postFlagUser = (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { reason } = req.body;
    const target = User.findById(userId);
    if (!target) return renderNotFound(res, 'User not found.');

    User.updateStatus(userId, USER_STATUS.FLAGGED);

    Moderation.log({
      actor_id: req.user.id,
      action: MODERATION_ACTION.FLAG_USER,
      target_user_id: userId,
      reason: reason || 'Reported for suspicious activity.',
    });

    Notification.create({
      recipient_id: userId,
      type: NOTIFICATION_TYPE.ACCOUNT_FLAGGED,
      body: 'Your account has been flagged for review by a moderator.',
    });

    setFlash(req, 'success', 'User flagged for admin review.');
    res.redirect('/moderator');
  } catch (err) {
    next(err);
  }
};
