const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../../middleware/auth');

function apiStub(req, res) {
  res.status(501).json({ status: 'stub', endpoint: req.originalUrl });
}

router.use(requireAuth);

router.get('/stats',            apiStub);
router.get('/my-listings',      apiStub);
router.get('/requests-received', apiStub);
router.get('/requests-sent',    apiStub);

module.exports = router;
