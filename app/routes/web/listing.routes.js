const express = require('express');
const router = express.Router();
const listingController = require('../../controllers/listing.controller');
const { requireAuth } = require('../../../middleware/auth');

router.get('/',               listingController.getAll);
router.get('/new',            requireAuth, listingController.getCreate);
router.post('/',              requireAuth, listingController.postCreate);
router.get('/:id',            listingController.getDetails);
router.get('/:id/edit',       requireAuth, listingController.getEdit);
router.post('/:id',           requireAuth, listingController.postUpdate);
router.post('/:id/delete',    requireAuth, listingController.postDelete);

module.exports = router;

