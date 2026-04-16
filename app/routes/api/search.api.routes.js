const express = require('express');
const router = express.Router();

function apiStub(req, res) {
  res.status(501).json({ status: 'stub', endpoint: req.originalUrl });
}

router.get('/',           apiStub);
router.get('/listings',   apiStub);
router.get('/suggest',    apiStub);

module.exports = router;
