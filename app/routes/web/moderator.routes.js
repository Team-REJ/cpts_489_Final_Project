const express = require('express');
const router = express.Router();
const moderatorController = require('../../controllers/moderator.controller');
const { requireAuth } = require('../../../middleware/auth');
const { requireStaff } = require('../../../middleware/roles');

router.use(requireAuth, requireStaff);

router.get('/',                      moderatorController.getDashboard);
router.get('/activity',              moderatorController.getActivity);
router.get('/listings',              moderatorController.getListings);
router.get('/users',                 moderatorController.getUsers);
router.post('/listings/:id/approve', moderatorController.postApproveListing);
router.post('/listings/:id/reject',  moderatorController.postRejectListing);
router.post('/users/:id/flag',       moderatorController.postFlagUser);
router.post('/users/:id/unflag',     moderatorController.postUnflagUser);

module.exports = router;

