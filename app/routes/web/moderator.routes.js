const express = require('express');
const router = express.Router();
const moderatorController = require('../../controllers/moderator.controller');
const { requireAuth } = require('../../../middleware/auth');
const { requireStaff } = require('../../../middleware/roles');

router.use(requireAuth, requireStaff);

router.get('/',                    moderatorController.getDashboard);
router.post('/listings/:id/approve', moderatorController.postApproveListing);
router.post('/listings/:id/reject',  moderatorController.postRejectListing);
router.post('/users/:id/flag',     moderatorController.postFlagUser);

module.exports = router;

