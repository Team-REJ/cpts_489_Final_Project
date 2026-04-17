const Notification = require('../models/notification.model');

/**
 * Render the notifications page for the authenticated user
 * GET /notifications
 */
exports.getPage = (req, res, next) => {
  try {
    const notifications = Notification.findByUser(req.user.id);
    res.render('notifications', { title: 'Notifications', notifications });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch all notifications for the authenticated user
 * GET /api/notifications
 */
exports.getAll = (req, res, next) => {
  try {
    const notifications = Notification.findByUser(req.session.userId);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

/**
 * Get unread notification count for async polling
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = (req, res, next) => {
  try {
    const count = Notification.getUnreadCount(req.session.userId);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

/**
 * Mark a specific notification as read
 * POST /api/notifications/:id/read
 */
exports.markRead = (req, res, next) => {
  try {
    const notification = Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    if (notification.recipient_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    Notification.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

/**
 * Mark all notifications as read
 * POST /api/notifications/read-all
 */
exports.markAllRead = (req, res, next) => {
  try {
    Notification.markAllAsRead(req.session.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};
