const db = require('../../config/db');

class MessageModel {
  /**
   * Create a new message in a request thread
   * @param {Object} data 
   * @returns {Object} result
   */
  static create(data) {
    const { request_id, sender_id, body, message_type = 'user' } = data;
    const stmt = db.prepare(`
      INSERT INTO messages (request_id, sender_id, body, message_type)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(request_id, sender_id, body, message_type);
  }

  /**
   * Fetch all messages for a specific request thread
   * @param {number} requestId 
   * @returns {Array} messages
   */
  static findByRequestId(requestId) {
    return db.prepare(`
      SELECT m.*, u.first_name, u.last_name 
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.request_id = ? 
      ORDER BY m.created_at ASC
    `).all(requestId);
  }

  /**
   * Get the last message in a thread
   * @param {number} requestId 
   * @returns {Object|undefined}
   */
  static findLastInThread(requestId) {
    return db.prepare(`
      SELECT * FROM messages 
      WHERE request_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(requestId);
  }
}

module.exports = MessageModel;
