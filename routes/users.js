const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

// User Routes //

// Create user
router.get('/signup', user_controller.signup_get);

router.post('/signup', user_controller.signup_post);

// Login
router.get('/login', user_controller.login_get);

router.post('/login', user_controller.login_post);

// Logout
router.get('/logout', user_controller.logout);

// Membership page
router.get('/membership', user_controller.membership_get);

router.post('/membership', user_controller.membership_post);


module.exports = router;