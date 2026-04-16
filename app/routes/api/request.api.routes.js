const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../../middleware/auth');

function apiStub(req, res) {
  res.status(501).json({ status: 'stub', endpoint: req.originalUrl });
}

router.use(requireAuth);

router.get('/:id',          apiStub);
router.get('/:id/messages', apiStub);
router.post('/:id/messages', apiStub);
router.post('/:id/status',  apiStub);

module.exports = router;
