const db = require('../../config/db');

class NotificationModel {
  /**
   * Create a new notification for a user
   * @param {Object} data 
   * @returns {Object} result
   */
  static create(data) {
    const { recipient_id, type, body, related_listing_id = null, related_request_id = null } = data;
    const stmt = db.prepare(`
      INSERT INTO notifications (recipient_id, type, body, related_listing_id, related_request_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(recipient_id, type, body, related_listing_id, related_request_id);
  }

  /**
   * Fetch all notifications for a specific user
   * @param {number} userId 
   * @returns {Array} notifications
   */
  static findByUser(userId) {
    return db.prepare(`
      SELECT * FROM notifications 
      WHERE recipient_id = ? 
      ORDER BY created_at DESC
    `).all(userId);
  }

  /**
   * Get count of unread notifications for a user
   * @param {number} userId 
   * @returns {number} count
   */
  static getUnreadCount(userId) {
    const row = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = 0').get(userId);
    return row ? row.count : 0;
  }

  /**
   * Mark a specific notification as read
   * @param {number} id 
   */
  static markAsRead(id) {
    return db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  }

  /**
   * Mark all notifications for a user as read
   * @param {number} userId 
   */
  static markAllAsRead(userId) {
    return db.prepare('UPDATE notifications SET is_read = 1 WHERE recipient_id = ?').run(userId);
  }

  /**
   * Find a notification by ID
   * @param {number} id
   * @returns {Object|undefined}
   */
  static findById(id) {
    return db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
  }

  /**
   * Delete a notification
   * @param {number} id 
   */
  static delete(id) {
    return db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  }
}

module.exports = NotificationModel;
