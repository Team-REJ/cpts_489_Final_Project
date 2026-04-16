const db = require('../../config/db');

class StatsModel {
  /**
   * Get high-level summary of the entire marketplace
   * @returns {Object} statistics
   */
  static getGlobalSummary() {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const listingCount = db.prepare('SELECT COUNT(*) as count FROM listings').get().count;
    const requestCount = db.prepare('SELECT COUNT(*) as count FROM requests').get().count;
    const activeListings = db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'active'").get().count;

    return {
      total_users: userCount,
      total_listings: listingCount,
      total_requests: requestCount,
      active_listings: activeListings
    };
  }

  /**
   * Get counts of listings by category
   * @returns {Array}
   */
  static getListingDistribution() {
    return db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM listings 
      GROUP BY category 
      ORDER BY count DESC
    `).all();
  }

  /**
   * Get counts of listings by status
   * @returns {Array}
   */
  static getListingStatusSummary() {
    return db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM listings 
      GROUP BY status
    `).all();
  }

  /**
   * Get user distribution by role
   * @returns {Array}
   */
  static getUserRoleDistribution() {
    return db.prepare(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `).all();
  }

  /**
   * Get request status distribution
   * @returns {Array}
   */
  static getRequestStatusSummary() {
    return db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM requests 
      GROUP BY status
    `).all();
  }

  /**
   * Calculate total volume of accepted offers
   * @returns {number}
   */
  static getTransactionVolume() {
    const result = db.prepare("SELECT SUM(current_offer) as volume FROM requests WHERE status = 'accepted'").get();
    return result ? (result.volume || 0) : 0;
  }
}

module.exports = StatsModel;
