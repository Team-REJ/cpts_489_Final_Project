const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../../middleware/auth');

router.use(requireAuth);

router.get('/', (req, res) => {
  res.status(501).render('error', {
    title: 'Not Implemented',
    status: 501,
    message: 'Not implemented yet \u2014 account settings',
  });
});

router.post('/', (req, res) => {
  res.status(501).render('error', {
    title: 'Not Implemented',
    status: 501,
    message: 'Not implemented yet \u2014 update settings',
  });
});

module.exports = router;
