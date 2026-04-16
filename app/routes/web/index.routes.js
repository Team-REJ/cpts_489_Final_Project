const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

router.get('/about', (req, res) => {
  res.status(501).render('error', {
    title: 'Not Implemented',
    status: 501,
    message: 'Not implemented yet \u2014 about page',
  });
});

module.exports = router;
