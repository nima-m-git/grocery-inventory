const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const multer = require('multer');
require('dotenv').config()

const User = require('./models/user');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const inventoryRouter = require('./routes/inventory');

const app = express();

//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI || process.env.DEV_DB;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Image configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
      console.log(file);
      cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      cb(null, true);
  } else {
      cb(null, false);
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// passport user authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
  (username, password, done) => {
    User.findOne({ email: username, }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email' });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
            // passwords match, log in user
            return done(null, user)
        } else {
            // passwords dont match
            return done(null, false, { message: 'Incorrect password'})
        }
      })
    });
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

app.use(flash());
app.use(session({ secret: 'SOMESECRET', resave: false, saveUninitialized: true, }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
// set user in locals to be used globally by all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/inventory', inventoryRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
