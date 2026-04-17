const express = require('express');
const router = express.Router();

const adminController = require('../../controllers/admin.controller');
const { requireAuth } = require('../../../middleware/auth');
const { requireAdmin } = require('../../../middleware/roles');

router.use(requireAuth, requireAdmin);

router.get('/',                      adminController.getDashboard);
router.get('/listings',              adminController.getListings);
router.post('/listings/:id/remove',  adminController.postRemoveListing);
router.get('/users',                 adminController.getUsers);
router.post('/users/:id/ban',        adminController.postBanUser);
router.post('/users/:id/role',       adminController.postChangeRole);

module.exports = router;
