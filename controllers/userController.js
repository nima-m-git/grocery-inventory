const passport = require('passport');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const User = require('../models/user');

// User sign up
exports.signup_get = (req, res) => res.render('sign-up-form');

exports.signup_post = [
    body('firstName', 'First name must be specified').trim().isLength({ min: 1}).isAlphanumeric().escape(),
    body('lastName', 'Last name must be specified').trim().isLength({ min: 1}).isAlphanumeric().escape(),
    body('email', 'Must be valid email').isEmail().escape()
        .custom(async (value, { req }) => {
            const emails = (await User.find({}, 'email')).map(obj => obj.email);
            if (emails.includes(value)) {
                throw new Error('Email already registered');
            }
            return true;
        }),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long').escape(),
    body('confirm-password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must match');
            }
            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log(errors)
            res.render('sign-up-form', { ...errors, ...req.body, });
            return ;
        } 

        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) {
                return next(err);
            } 
            const user = new User({
                ...req.body,
                password: hashedPassword,
            }).save((err) => {
                if (err) { return next(err); }
                res.redirect('/');
            });
        });

    }
];

// User login
exports.login_get = (req, res) => res.render('login', { error: req.flash('error')});

exports.login_post = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
});

// User logout
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

// User membership details
exports.membership_get = (req, res) => {
    if (!req.user) {
        res.redirect('login');
    } 
    res.render('membership');
}

// Upgrade user membership
exports.membership_post = [
    body('code').escape(),

    (req, res, next) => {
        if (!req.user) {
            res.redirect('login');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('membership', { errors, });
        }

        const code = req.body.code;

        const admin = code === process.env.ADMIN_CODE;

        const upgraded = {
            status: (admin !== req.user.admin),
            attempted: true,
            admin,
        }
        
        const user = new User({
            admin,
            _id: req.user.id,
        });

        User.findByIdAndUpdate(req.user.id, user, {}, (err, updatedUser) => {
            if (err) { return next(err); }
            res.render('membership', { ...upgraded, });
        })
    }
];
    
