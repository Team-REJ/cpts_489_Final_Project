const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification.controller');
const { requireAuth } = require('../../../middleware/auth');

router.use(requireAuth);

router.get('/', notificationController.getPage);

module.exports = router;
