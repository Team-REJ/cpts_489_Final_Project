const express = require('express');
const router = express.Router();
const Stats = require('../../models/stats.model');

router.get('/', (req, res, next) => {
  try {
    const counts = Stats.getHomepageCounts();
    res.render('home', { title: 'Home', counts });
  } catch (err) {
    next(err);
  }
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

module.exports = router;
