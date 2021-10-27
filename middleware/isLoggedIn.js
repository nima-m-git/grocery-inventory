module.exports = function isLoggedIn(req, res, next) {
  if (req.user) {
    // user is authenticated
    next();
  } else {
    // user is not logged in, redirect to login
    req.flash('error', 'Must be logged in to create inventory');
    res.redirect('/users/login');
  }
};
