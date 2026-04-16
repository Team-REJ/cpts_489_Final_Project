const db = require('../../config/db');
const Moderation = require('../models/moderation.model');
const Listing = require('../models/listing.model');
const Notification = require('../models/notification.model');

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

/**
 * Moderator Dashboard
 * Shows pending listings and recent activity
 */
exports.getDashboard = (req, res, next) => {
  try {
    const pendingListings = db.prepare("SELECT * FROM listings WHERE status = 'pending' ORDER BY created_at ASC").all();
    const moderationHistory = Moderation.findByActor(req.session.userId);

    res.render('moderator-dashboard', { 
      title: 'Moderator Dashboard', 
      pendingListings, 
      moderationHistory 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Approve a pending listing
 */
exports.postApproveListing = (req, res, next) => {
  try {
    const listingId = req.params.id;
    const listing = Listing.findById(listingId);

    if (!listing) return res.status(404).send('Listing not found');

    // Update status to active
    db.prepare("UPDATE listings SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(listingId);

    // Log the action
    Moderation.log({
      actor_id: req.session.userId,
      action: 'approve_listing',
      target_listing_id: listingId,
      target_user_id: listing.owner_id,
      reason: 'Listing meets marketplace guidelines.'
    });

    // Notify the owner
    Notification.create({
      recipient_id: listing.owner_id,
      type: 'listing_approved',
      body: `Your listing "${listing.title}" has been approved and is now live.`,
      related_listing_id: listingId
    });

    setFlash(req, 'success', 'Listing approved.');
    res.redirect('/moderator');
  } catch (err) {
    next(err);
  }
};

/**
 * Reject a pending listing
 */
exports.postRejectListing = (req, res, next) => {
  try {
    const listingId = req.params.id;
    const { reason } = req.body;
    const listing = Listing.findById(listingId);

    if (!listing) return res.status(404).send('Listing not found');

    // Update status to rejected
    db.prepare("UPDATE listings SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(listingId);

    // Log the action
    Moderation.log({
      actor_id: req.session.userId,
      action: 'reject_listing',
      target_listing_id: listingId,
      target_user_id: listing.owner_id,
      reason: reason || 'Does not meet guidelines.'
    });

    // Notify the owner
    Notification.create({
      recipient_id: listing.owner_id,
      type: 'listing_rejected',
      body: `Your listing "${listing.title}" was rejected. Reason: ${reason || 'Inappropriate content.'}`,
      related_listing_id: listingId
    });

    setFlash(req, 'success', 'Listing rejected and owner notified.');
    res.redirect('/moderator');
  } catch (err) {
    next(err);
  }
};

/**
 * Flag a user account for follow-up
 */
exports.postFlagUser = (req, res, next) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;

    db.prepare("UPDATE users SET status = 'flagged', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(userId);

    Moderation.log({
      actor_id: req.session.userId,
      action: 'flag_user',
      target_user_id: userId,
      reason: reason || 'Reported for suspicious activity.'
    });

    setFlash(req, 'success', 'User flagged for admin review.');
    res.redirect('/moderator');
  } catch (err) {
    next(err);
  }
};
