const Request = require('../models/request.model');
const Message = require('../models/message.model');
const Listing = require('../models/listing.model');
const Notification = require('../models/notification.model');
const { NOTIFICATION_TYPE, MESSAGE_TYPE, REQUEST_STATUS } = require('../../config/constants');

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

exports.getThread = (req, res, next) => {
  try {
    const requestId = req.params.id;
    const request = Request.findById(requestId);

    if (!request) {
      return res.status(404).render('error', { title: 'Not Found', status: 404, message: 'Request not found.' });
    }

    // Authorization: User must be buyer or seller
    if (request.buyer_id !== req.session.userId && request.seller_id !== req.session.userId) {
      setFlash(req, 'error', 'You do not have permission to view this thread.');
      return res.redirect('/dashboard');
    }

    const listing = Listing.findById(request.listing_id);
    const messages = Message.findByRequestId(requestId);

    res.render('request-thread', {
      title: 'Request Thread',
      request,
      listing,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

exports.postCreate = (req, res, next) => {
  try {
    const { listing_id, initial_message, offer_amount } = req.body;
    const listing = Listing.findById(listing_id);

    if (!listing) {
      setFlash(req, 'error', 'Invalid listing.');
      return res.redirect('/listings');
    }

    if (listing.owner_id === req.session.userId) {
      setFlash(req, 'error', 'You cannot send a request for your own listing.');
      return res.redirect('/listings/' + listing_id);
    }

    const requestResult = Request.create({
      listing_id,
      buyer_id: req.session.userId,
      seller_id: listing.owner_id,
      current_offer: offer_amount ? parseFloat(offer_amount) : listing.price
    });

    const requestId = requestResult.lastInsertRowid;

    // Create the initial message
    Message.create({
      request_id: requestId,
      sender_id: req.session.userId,
      body: initial_message || 'I am interested in this item.',
      message_type: MESSAGE_TYPE.USER
    });

    // Notify the seller
    Notification.create({
      recipient_id: listing.owner_id,
      type: NOTIFICATION_TYPE.REQUEST_RECEIVED,
      body: `You received a new request for "${listing.title}".`,
      related_listing_id: listing_id,
      related_request_id: requestId
    });

    setFlash(req, 'success', 'Request sent successfully!');
    res.redirect('/requests/' + requestId);
  } catch (err) {
    next(err);
  }
};

exports.postMessage = (req, res, next) => {
  try {
    const requestId = req.params.id;
    const { body } = req.body;
    const request = Request.findById(requestId);

    if (!request || (request.buyer_id !== req.session.userId && request.seller_id !== req.session.userId)) {
      setFlash(req, 'error', 'Unauthorized.');
      return res.redirect('/dashboard');
    }

    Message.create({
      request_id: requestId,
      sender_id: req.session.userId,
      body
    });

    // Notify the other party
    const recipientId = (req.session.userId === request.buyer_id) ? request.seller_id : request.buyer_id;
    Notification.create({
      recipient_id: recipientId,
      type: NOTIFICATION_TYPE.MESSAGE_RECEIVED,
      body: 'New message in request thread.',
      related_request_id: requestId
    });

    res.redirect('/requests/' + requestId);
  } catch (err) {
    next(err);
  }
};

exports.postAccept = (req, res, next) => {
  try {
    const request = Request.findById(req.params.id);
    if (!request || request.seller_id !== req.session.userId) {
      setFlash(req, 'error', 'Unauthorized.');
      return res.redirect('/dashboard');
    }

    Request.updateStatus(req.params.id, 'accepted');
    
    // Also mark listing as completed if appropriate
    Listing.updateStatus(request.listing_id, 'completed');

    Message.create({
      request_id: req.params.id,
      sender_id: null,
      body: 'Request has been accepted. The item is now marked as sold.',
      message_type: MESSAGE_TYPE.SYSTEM
    });

    Notification.create({
      recipient_id: request.buyer_id,
      type: NOTIFICATION_TYPE.REQUEST_ACCEPTED,
      body: 'Your purchase request was accepted!',
      related_request_id: req.params.id
    });

    setFlash(req, 'success', 'Request accepted.');
    res.redirect('/requests/' + req.params.id);
  } catch (err) {
    next(err);
  }
};

exports.postOffer = (req, res, next) => {
  try {
    const requestId = req.params.id;
    const request = Request.findById(requestId);

    if (!request) {
      setFlash(req, 'error', 'Request not found.');
      return res.redirect('/dashboard');
    }

    const isBuyer = request.buyer_id === req.session.userId;
    const isSeller = request.seller_id === req.session.userId;
    if (!isBuyer && !isSeller) {
      setFlash(req, 'error', 'Unauthorized.');
      return res.redirect('/dashboard');
    }

    if (request.status !== REQUEST_STATUS.PENDING && request.status !== REQUEST_STATUS.NEGOTIATING) {
      setFlash(req, 'error', 'This thread is closed to new offers.');
      return res.redirect('/requests/' + requestId);
    }

    const amount = parseFloat(req.body.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      setFlash(req, 'error', 'Enter a valid offer amount.');
      return res.redirect('/requests/' + requestId);
    }

    const offeredBy = isBuyer ? 'buyer' : 'seller';
    Request.updateOffer(requestId, amount, offeredBy);

    if (request.status === REQUEST_STATUS.PENDING) {
      Request.updateStatus(requestId, REQUEST_STATUS.NEGOTIATING);
    }

    Message.create({
      request_id: requestId,
      sender_id: req.session.userId,
      body: `${offeredBy === 'buyer' ? 'Buyer' : 'Seller'} offered $${amount.toFixed(2)}.`,
      message_type: MESSAGE_TYPE.OFFER
    });

    const recipientId = isBuyer ? request.seller_id : request.buyer_id;
    Notification.create({
      recipient_id: recipientId,
      type: NOTIFICATION_TYPE.OFFER_MADE,
      body: `New counter-offer of $${amount.toFixed(2)} on your request thread.`,
      related_request_id: requestId
    });

    setFlash(req, 'success', 'Offer submitted.');
    res.redirect('/requests/' + requestId);
  } catch (err) {
    next(err);
  }
};

exports.postReject = (req, res, next) => {
  try {
    const request = Request.findById(req.params.id);
    if (!request || request.seller_id !== req.session.userId) {
      setFlash(req, 'error', 'Unauthorized.');
      return res.redirect('/dashboard');
    }

    Request.updateStatus(req.params.id, 'rejected');

    Message.create({
      request_id: req.params.id,
      sender_id: null,
      body: 'Request has been declined by the seller.',
      message_type: MESSAGE_TYPE.SYSTEM
    });

    Notification.create({
      recipient_id: request.buyer_id,
      type: NOTIFICATION_TYPE.REQUEST_REJECTED,
      body: 'Your purchase request was rejected.',
      related_request_id: req.params.id
    });

    setFlash(req, 'success', 'Request rejected.');
    res.redirect('/requests/' + req.params.id);
  } catch (err) {
    next(err);
  }
};
