const Listing = require('../models/listing.model');
const Request = require('../models/request.model');
const Message = require('../models/message.model');
const Notification = require('../models/notification.model');
const {
  LISTING_STATUS,
  REQUEST_STATUS,
  MESSAGE_TYPE,
  NOTIFICATION_TYPE,
} = require('../../config/constants');

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

exports.postMarkSold = (req, res, next) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing || listing.owner_id !== req.user.id) {
      setFlash(req, 'error', 'Unauthorized.');
      return res.redirect('/dashboard');
    }

    if (listing.status !== LISTING_STATUS.ACTIVE) {
      setFlash(req, 'error', 'Only active listings can be marked as sold.');
      return res.redirect('/listings/' + listing.id);
    }

    Listing.updateStatus(listing.id, LISTING_STATUS.COMPLETED);

    const openRequests = Request.findOpenByListing(listing.id);
    openRequests.forEach((r) => {
      const alreadyAccepted = r.status === REQUEST_STATUS.ACCEPTED;
      if (!alreadyAccepted) {
        Request.updateStatus(r.id, REQUEST_STATUS.CANCELLED);
      }

      Message.create({
        request_id: r.id,
        sender_id: null,
        body: alreadyAccepted
          ? 'The seller marked this listing as sold. Thanks for the exchange!'
          : 'The seller marked this listing as sold. This request has been closed.',
        message_type: MESSAGE_TYPE.SYSTEM,
      });

      Notification.create({
        recipient_id: r.buyer_id,
        type: NOTIFICATION_TYPE.LISTING_SOLD,
        body: alreadyAccepted
          ? `"${listing.title}" has been marked as sold.`
          : `"${listing.title}" is no longer available — the seller marked it as sold.`,
        related_listing_id: listing.id,
        related_request_id: r.id,
      });
    });

    setFlash(req, 'success', 'Listing marked as sold.');
    res.redirect('/listings/' + listing.id);
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
