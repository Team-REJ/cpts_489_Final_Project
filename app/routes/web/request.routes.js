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

router.use(requireAuth);

router.get('/:id',         stub('view request thread'));
router.post('/',           stub('create purchase request'));
router.post('/:id/message', stub('post message in thread'));
router.post('/:id/offer',  stub('send counter-offer'));
router.post('/:id/accept', stub('accept request'));
router.post('/:id/reject', stub('reject request'));

module.exports = router;
