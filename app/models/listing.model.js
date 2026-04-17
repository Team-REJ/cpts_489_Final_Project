const db = require('../../config/db');

class ListingModel {
  /**
   * Create a new listing
   * @param {Object} data - Listing data
   * @returns {Object} result - Contains lastInsertRowid
   */
  static create(data) {
    const { owner_id, title, description, category, condition, type, price } = data;
    const stmt = db.prepare(`
      INSERT INTO listings (owner_id, title, description, category, condition, type, price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    return stmt.run(owner_id, title, description, category, condition, type, price);
  }

  /**
   * Get all active listings for browsing
   * @returns {Array} listings
   */
  static findAllActive() {
    return db.prepare("SELECT * FROM listings WHERE status = 'active' ORDER BY created_at DESC").all();
  }

  /**
   * Find a listing by ID
   * @param {number} id 
   * @returns {Object|undefined} listing
   */
  static findById(id) {
    return db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
  }

  /**
   * Find listings by owner ID
   * @param {number} ownerId 
   * @returns {Array} listings
   */
  static findByOwner(ownerId) {
    return db.prepare('SELECT * FROM listings WHERE owner_id = ? ORDER BY created_at DESC').all(ownerId);
  }

  /**
   * Update a listing's status or details
   * @param {number} id 
   * @param {Object} data 
   */
  static update(id, data) {
    const { title, description, category, condition, type, price, status } = data;
    const stmt = db.prepare(`
      UPDATE listings 
      SET title = ?, description = ?, category = ?, condition = ?, type = ?, price = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(title, description, category, condition, type, price, status, id);
  }

  /**
   * Delete a listing
   * @param {number} id 
   */
  static delete(id) {
    return db.prepare('DELETE FROM listings WHERE id = ?').run(id);
  }

  /**
   * Update view count
   * @param {number} id 
   */
  static incrementViews(id) {
    return db.prepare('UPDATE listings SET view_count = view_count + 1 WHERE id = ?').run(id);
  }

  /**
   * Search listings by title or description
   * @param {string} query 
   * @returns {Array} listings
   */
  static search(query) {
    const searchTerm = `%${query}%`;
    return db.prepare(`
      SELECT * FROM listings 
      WHERE status = 'active' AND (title LIKE ? OR description LIKE ?)
      ORDER BY created_at DESC
    `).all(searchTerm, searchTerm);
  }
}

module.exports = ListingModel;
