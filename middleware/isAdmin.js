module.exports = isUserAdmin = (req, res, next) => {
  if (req.user) {
    // user is logged in
    if (req.user.admin) {
      // user is admin
      console.log('user is admin');
      next();
    } else {
      console.log('users not admin');
      // user is not admin, redirect to membership page
      req.flash('error', 'Administrative privelages are required for modification.');
      res.redirect('/users/membership');
    }
  } else {
    // user is not logged in, redirect to login
    console.log('user not logged in');
    req.flash('error', 'Must be logged in as Adminstrator for modification privelages');
    res.redirect('/users/login');
  }
};
