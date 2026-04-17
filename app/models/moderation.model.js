const db = require('../../config/db');

class ModerationModel {
  /**
   * Log a new moderation action
   * @param {Object} data 
   * @returns {Object} result
   */
  static log(data) {
    const { actor_id, action, target_user_id = null, target_listing_id = null, reason = '' } = data;
    const stmt = db.prepare(`
      INSERT INTO moderation_actions (actor_id, action, target_user_id, target_listing_id, reason)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(actor_id, action, target_user_id, target_listing_id, reason);
  }

  /**
   * Get all moderation actions performed by a specific staff member
   * @param {number} actorId 
   * @returns {Array}
   */
  static findByActor(actorId) {
    return db.prepare(`
      SELECT m.*, u.first_name, u.last_name 
      FROM moderation_actions m
      LEFT JOIN users u ON m.actor_id = u.id
      WHERE actor_id = ? 
      ORDER BY m.created_at DESC
    `).all(actorId);
  }

  /**
   * Get all moderation activity across the system (for Admin review)
   * @returns {Array}
   */
  static findAll() {
    return db.prepare(`
      SELECT m.*, a.first_name as actor_fname, a.last_name as actor_lname,
             t.first_name as target_fname, t.last_name as target_lname,
             l.title as listing_title
      FROM moderation_actions m
      LEFT JOIN users a ON m.actor_id = a.id
      LEFT JOIN users t ON m.target_user_id = t.id
      LEFT JOIN listings l ON m.target_listing_id = l.id
      ORDER BY m.created_at DESC
    `).all();
  }

  /**
   * Most-recent moderation actions across all staff, with actor/target/listing names.
   */
  static findRecent(limit = 10) {
    return db.prepare(`
      SELECT m.*, a.first_name AS actor_fname, a.last_name AS actor_lname,
             t.first_name AS target_fname, t.last_name AS target_lname,
             l.title AS listing_title
      FROM moderation_actions m
      LEFT JOIN users a ON m.actor_id = a.id
      LEFT JOIN users t ON m.target_user_id = t.id
      LEFT JOIN listings l ON m.target_listing_id = l.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(limit);
  }

  /**
   * Get moderation history for a specific user
   * @param {number} userId 
   * @returns {Array}
   */
  static findHistoryForUser(userId) {
    return db.prepare(`
      SELECT * FROM moderation_actions 
      WHERE target_user_id = ? 
      ORDER BY created_at DESC
    `).all(userId);
  }

  /**
   * Get moderation history for a specific listing
   * @param {number} listingId 
   * @returns {Array}
   */
  static findHistoryForListing(listingId) {
    return db.prepare(`
      SELECT * FROM moderation_actions 
      WHERE target_listing_id = ? 
      ORDER BY created_at DESC
    `).all(listingId);
  }
}

module.exports = ModerationModel;
