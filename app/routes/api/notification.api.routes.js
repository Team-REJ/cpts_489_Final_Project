const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../../middleware/auth');

function apiStub(req, res) {
  res.status(501).json({ status: 'stub', endpoint: req.originalUrl });
}

router.use(requireAuth);

router.get('/',              apiStub);
router.get('/unread-count',  apiStub);
router.post('/:id/read',     apiStub);

module.exports = router;
