const express = require('express');
const router = express.Router();

const { requireAuth } = require('../../../middleware/auth');

function stub(feature) {
  return (req, res) => {
    res.status(501).render('error', {
      title: 'Not Implemented',
      status: 501,
      message: `Not implemented yet \u2014 ${feature}`,
    });
  };
}

router.get('/',            stub('browse listings'));
router.get('/search',      stub('search listings'));
router.get('/new',         requireAuth, stub('create listing'));
router.post('/',           requireAuth, stub('create listing submit'));
router.get('/:id',         stub('listing details'));
router.get('/:id/edit',    requireAuth, stub('edit listing'));
router.post('/:id',        requireAuth, stub('update listing'));
router.post('/:id/delete', requireAuth, stub('delete listing'));
router.post('/:id/complete', requireAuth, stub('mark listing complete'));

module.exports = router;
