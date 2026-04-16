const express = require('express');
const router = express.Router();

const auth = require('../../controllers/auth.controller');
const { requireAuth, requireGuest } = require('../../../middleware/auth');

router.get('/login',    requireGuest, auth.getLogin);
router.post('/login',   requireGuest, auth.postLogin);
router.get('/register', requireGuest, auth.getRegister);
router.post('/register', requireGuest, auth.postRegister);
router.post('/logout',  requireAuth, auth.postLogout);

module.exports = router;
