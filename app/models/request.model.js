const db = require('../../config/db');

class RequestModel {
  /**
   * Create a new purchase request
   * @param {Object} data 
   * @returns {Object} result
   */
  static create(data) {
    const { listing_id, buyer_id, seller_id, current_offer } = data;
    const stmt = db.prepare(`
      INSERT INTO requests (listing_id, buyer_id, seller_id, current_offer, status, offered_by)
      VALUES (?, ?, ?, ?, 'pending', 'buyer')
    `);
    return stmt.run(listing_id, buyer_id, seller_id, current_offer);
  }

  /**
   * Find a request by ID
   * @param {number} id 
   * @returns {Object|undefined}
   */
  static findById(id) {
    return db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
  }

  /**
   * Find requests where user is the buyer
   * @param {number} buyerId 
   * @returns {Array}
   */
  static findByBuyer(buyerId) {
    return db.prepare('SELECT * FROM requests WHERE buyer_id = ? ORDER BY created_at DESC').all(buyerId);
  }

  /**
   * Find requests where user is the seller
   * @param {number} sellerId 
   * @returns {Array}
   */
  static findBySeller(sellerId) {
    return db.prepare('SELECT * FROM requests WHERE seller_id = ? ORDER BY created_at DESC').all(sellerId);
  }

  /**
   * Find requests for a specific listing
   * @param {number} listingId 
   * @returns {Array}
   */
  static findByListing(listingId) {
    return db.prepare('SELECT * FROM requests WHERE listing_id = ? ORDER BY created_at DESC').all(listingId);
  }

  /**
   * Update request status
   * @param {number} id 
   * @param {string} status 
   */
  static updateStatus(id, status) {
    const stmt = db.prepare(`
      UPDATE requests 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(status, id);
  }

  /**
   * Update current offer
   * @param {number} id
   * @param {number} amount
   * @param {string} offeredBy - 'buyer' or 'seller'
   */
  static updateOffer(id, amount, offeredBy) {
    const stmt = db.prepare(`
      UPDATE requests
      SET current_offer = ?, offered_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(amount, offeredBy, id);
  }

  /**
   * Find requests on a listing that are still open (pending, negotiating, or accepted).
   * Optionally excludes one request id (e.g., the one just accepted).
   */
  static findOpenByListing(listingId, excludeRequestId = null) {
    const sql = `
      SELECT * FROM requests
      WHERE listing_id = ?
        AND status IN ('pending','negotiating','accepted')
        ${excludeRequestId ? 'AND id != ?' : ''}
      ORDER BY created_at ASC
    `;
    return excludeRequestId
      ? db.prepare(sql).all(listingId, excludeRequestId)
      : db.prepare(sql).all(listingId);
  }
}

module.exports = RequestModel;
