// middleware/auth.js

/**
 * Middleware to require authentication
 * Redirects to login page if user is not logged in
 */
const requireAuth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  next();
};

/**
 * Middleware to redirect logged-in users
 * Used on login/register pages to redirect to /urls if already logged in
 */
const redirectIfLoggedIn = (req, res, next) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  next();
};

/**
 * Middleware to check if user is authenticated (doesn't redirect)
 * Adds user object to res.locals if logged in
 */
const checkAuth = (req, res, next) => {
  if (req.session.user_id) {
    res.locals.userId = req.session.user_id;
  }
  next();
};

module.exports = {
  requireAuth,
  redirectIfLoggedIn,
  checkAuth
};