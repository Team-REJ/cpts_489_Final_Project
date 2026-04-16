const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification.controller');
const { requireAuth } = require('../../../middleware/auth');

router.use(requireAuth);

router.get('/',               notificationController.getAll);
router.get('/unread-count',   notificationController.getUnreadCount);
router.post('/read-all',      notificationController.markAllRead);
router.post('/:id/read',      notificationController.markRead);

module.exports = router;

