const express = require('express');
const router = express.Router();
const requestController = require('../../controllers/request.controller');
const { requireAuth } = require('../../../middleware/auth');

router.use(requireAuth);

router.get('/:id',          requestController.getThread);
router.post('/',            requestController.postCreate);
router.post('/:id/message', requestController.postMessage);
router.post('/:id/accept',  requestController.postAccept);
router.post('/:id/reject',  requestController.postReject);

module.exports = router;

