const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../../middleware/auth');
const { requireStaff } = require('../../../middleware/roles');

function stub(feature) {
  return (req, res) => {
    res.status(501).render('error', {
      title: 'Not Implemented',
      status: 501,
      message: `Not implemented yet \u2014 ${feature}`,
    });
  };
}

router.use(requireAuth, requireStaff);

router.get('/',                 stub('moderator dashboard'));
router.get('/listings',         stub('review pending listings'));
router.post('/listings/:id/approve', stub('approve listing'));
router.post('/listings/:id/reject',  stub('reject listing'));
router.get('/users',            stub('flag user accounts'));
router.post('/users/:id/flag',  stub('flag user'));

module.exports = router;
