const Listing = require('../models/listing.model');

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

exports.getAll = (req, res, next) => {
  try {
    const listings = Listing.findAllActive();
    res.render('listings', { title: 'Marketplace', listings });
  } catch (err) {
    next(err);
  }
};

exports.getDetails = (req, res, next) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing) return res.status(404).render('error', { title: 'Not Found', status: 404, message: 'Listing not found.' });
    
    Listing.incrementViews(req.params.id);
    res.render('listing-details', { title: listing.title, listing });
  } catch (err) {
    next(err);
  }
};

exports.getCreate = (req, res) => {
  res.render('create-listing', { title: 'Create Listing', values: {} });
};

exports.postCreate = (req, res, next) => {
  try {
    const { title, description, category, condition, type, price } = req.body;
    
    if (!title || !description || !category || !condition || !type) {
      return res.render('create-listing', { title: 'Create Listing', values: req.body, error: 'All required fields must be filled.' });
    }

    const result = Listing.create({
      owner_id: req.user.id,
      title,
      description,
      category,
      condition,
      type,
      price: price ? parseFloat(price) : null
    });

    setFlash(req, 'success', 'Listing submitted for moderator approval.');
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};

exports.getEdit = (req, res, next) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing) return res.status(404).render('error', { title: 'Not Found', status: 404, message: 'Listing not found.' });
    
    // Ownership Check
    if (listing.owner_id !== req.user.id) {
      setFlash(req, 'error', 'You do not have permission to edit this listing.');
      return res.redirect('/listings/' + req.params.id);
    }

    res.render('edit-listing', { title: 'Edit Listing', listing });
  } catch (err) {
    next(err);
  }
};

exports.postUpdate = (req, res, next) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing || listing.owner_id !== req.user.id) {
      setFlash(req, 'error', 'An error occurred during verification.');
      return res.redirect('/dashboard');
    }

    const { title, description, category, condition, type, price, status } = req.body;
    Listing.update(req.params.id, {
      title,
      description,
      category,
      condition,
      type,
      price: price ? parseFloat(price) : null,
      status: status || listing.status
    });

    setFlash(req, 'success', 'Listing updated successfully.');
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};

exports.postDelete = (req, res, next) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing || listing.owner_id !== req.user.id) {
      setFlash(req, 'error', 'An error occurred during verification.');
      return res.redirect('/dashboard');
    }

    Listing.delete(req.params.id);
    setFlash(req, 'success', 'Listing removed.');
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
};
