const express = require('express');
const router = express.Router();

function apiStub(req, res) {
  res.status(501).json({ status: 'stub', endpoint: req.originalUrl });
}

router.get('/',         apiStub);
router.get('/:id',      apiStub);
router.post('/',        apiStub);
router.put('/:id',      apiStub);
router.delete('/:id',   apiStub);

module.exports = router;
