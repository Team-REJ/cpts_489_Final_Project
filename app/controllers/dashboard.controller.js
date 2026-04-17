const Listing = require('../models/listing.model');
const Request = require('../models/request.model');
const Notification = require('../models/notification.model');

/**
 * Main dashboard view for students
 * Aggregates listings owned by the user and all relevant purchase requests.
 */
exports.getIndex = (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's own listings
    const myListings = Listing.findByOwner(userId);

    // 2. Fetch requests where user is the buyer
    const sentRequests = Request.findByBuyer(userId);

    // 3. Fetch requests where user is the seller
    const receivedRequests = Request.findBySeller(userId);

    // 4. Fetch unread notification count for the sidebar/navbar
    const unreadCount = Notification.getUnreadCount(userId);

    res.render('dashboard', {
      title: 'Dashboard',
      myListings,
      sentRequests,
      receivedRequests,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};
