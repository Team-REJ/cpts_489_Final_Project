const express = require('express');
const router = express.Router();
const Listing = require('../../models/listing.model');

/**
 * Handle listing search/filter via API
 * GET /api/listings?q=term
 */
router.get('/', (req, res) => {
  try {
    const { q } = req.query;
    let listings;

    if (q) {
      listings = Listing.search(q);
    } else {
      listings = Listing.findAllActive();
    }

    res.json({ success: true, count: listings.length, listings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

/**
 * Fetch raw JSON for a single listing
 * GET /api/listings/:id
 */
router.get('/:id', (req, res) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

module.exports = router;
