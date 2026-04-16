function notFound(req, res, next) {
  res.status(404);
  if (req.accepts('html')) {
    return res.render('error', {
      title: 'Not Found',
      status: 404,
      message: 'Page not found',
    });
  }
  return res.json({ status: 404, message: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.code === 'EBADCSRFTOKEN') {
    console.error('[csrf] bad token on', req.method, req.originalUrl);
    res.status(403);
    if (req.accepts('html')) {
      return res.render('error', {
        title: 'Forbidden',
        status: 403,
        message: 'Invalid or missing CSRF token. Please reload the page and try again.',
      });
    }
    return res.json({ status: 403, message: 'Invalid CSRF token' });
  }

  console.error('[error]', err);
  res.status(500);
  if (req.accepts('html')) {
    return res.render('error', {
      title: 'Server Error',
      status: 500,
      message: 'Something went wrong',
    });
  }
  return res.json({ status: 500, message: 'Server error' });
}

module.exports = { notFound, errorHandler };
