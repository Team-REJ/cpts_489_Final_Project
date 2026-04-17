const express = require('express');
const router = express.Router();

const settingsController = require('../../controllers/settings.controller');
const { requireAuth } = require('../../../middleware/auth');

router.use(requireAuth);

router.get('/',          settingsController.getIndex);
router.post('/password', settingsController.postPassword);

module.exports = router;
