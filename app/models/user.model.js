const db = require('../../config/db');

const PUBLIC_COLUMNS = 'id, email, first_name, last_name, role, status, rating, created_at, updated_at';

class UserModel {
  /**
   * List all users, newest first. Excludes password_hash.
   * @returns {Array}
   */
  static findAll() {
    return db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC`).all();
  }

  /**
   * Find a user by id. Excludes password_hash.
   * @param {number} id
   * @returns {Object|undefined}
   */
  static findById(id) {
    return db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`).get(id);
  }

  /**
   * Find a user by email. INCLUDES password_hash — for auth/settings use only.
   * @param {string} email
   * @returns {Object|undefined}
   */
  static findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  /**
   * Find a user by id INCLUDING password_hash — for password-change verification.
   * @param {number} id
   * @returns {Object|undefined}
   */
  static findByIdWithHash(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  /**
   * Replace a user's password hash.
   * @param {number} id
   * @param {string} hash
   */
  static updatePassword(id, hash) {
    return db
      .prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hash, id);
  }

  /**
   * Update a user's moderation status (active, flagged, suspended).
   * @param {number} id
   * @param {string} status
   */
  static updateStatus(id, status) {
    return db
      .prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, id);
  }

  /**
   * Update a user's role (student, moderator, admin).
   * @param {number} id
   * @param {string} role
   */
  static updateRole(id, role) {
    return db
      .prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(role, id);
  }

  /**
   * Count users with a given role — used to prevent removing the last admin.
   * @param {string} role
   * @returns {number}
   */
  static countByRole(role) {
    const row = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get(role);
    return row ? row.count : 0;
  }

  /**
   * Delete a user.
   * @param {number} id
   */
  static delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }
}

module.exports = UserModel;
