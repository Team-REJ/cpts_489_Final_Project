require('dotenv').config();

const path = require('path');
const express = require('express');

const sessionMiddleware = require('./config/session');
const csrf = require('./middleware/csrf');
const attachUser = require('./middleware/attachUser');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const indexRoutes     = require('./app/routes/web/index.routes');
const authRoutes      = require('./app/routes/web/auth.routes');
const listingRoutes   = require('./app/routes/web/listing.routes');
const requestRoutes   = require('./app/routes/web/request.routes');
const dashboardRoutes = require('./app/routes/web/dashboard.routes');
const moderatorRoutes = require('./app/routes/web/moderator.routes');
const adminRoutes        = require('./app/routes/web/admin.routes');
const settingsRoutes     = require('./app/routes/web/settings.routes');
const notificationRoutes = require('./app/routes/web/notification.routes');

const listingApi      = require('./app/routes/api/listing.api.routes');
const requestApi      = require('./app/routes/api/request.api.routes');
const notificationApi = require('./app/routes/api/notification.api.routes');
const dashboardApi    = require('./app/routes/api/dashboard.api.routes');
const searchApi       = require('./app/routes/api/search.api.routes');

const app = express();

// 2. view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app', 'views'));

// 3. static assets
app.use(express.static(path.join(__dirname, 'public')));

// 4. body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 5. session
app.use(sessionMiddleware);

// 6. csrf
app.use(csrf);

// 7. attach user + flash + csrf token to res.locals
app.use(attachUser);

// 8. routers
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/listings', listingRoutes);
app.use('/requests', requestRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/moderator', moderatorRoutes);
app.use('/admin', adminRoutes);
app.use('/settings', settingsRoutes);
app.use('/notifications', notificationRoutes);

app.use('/api/listings',      listingApi);
app.use('/api/requests',      requestApi);
app.use('/api/notifications', notificationApi);
app.use('/api/dashboard',     dashboardApi);
app.use('/api/search',        searchApi);

// 9. 404
app.use(notFound);

// 10. error handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`[server] CougarMarket listening on http://localhost:${PORT}`);
});
