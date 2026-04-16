const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../../middleware/auth');
const { requireAdmin } = require('../../../middleware/roles');

function stub(feature) {
  return (req, res) => {
    res.status(501).render('error', {
      title: 'Not Implemented',
      status: 501,
      message: `Not implemented yet \u2014 ${feature}`,
    });
  };
}

router.use(requireAuth, requireAdmin);

router.get('/',                 stub('admin dashboard'));
router.get('/listings',         stub('view all listings'));
router.post('/listings/:id/remove', stub('remove listing'));
router.get('/users',            stub('view users'));
router.post('/users/:id/ban',   stub('ban user'));
router.post('/users/:id/role',  stub('change user role'));
router.get('/stats',            stub('marketplace statistics'));

module.exports = router;
