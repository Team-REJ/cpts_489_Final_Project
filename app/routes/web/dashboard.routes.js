const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../../middleware/auth');

router.get('/', requireAuth, (req, res) => {
  res.status(501).render('error', {
    title: 'Not Implemented',
    status: 501,
    message: 'Not implemented yet \u2014 user dashboard',
  });
});

module.exports = router;
