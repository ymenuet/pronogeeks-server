const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((loggedInUser, cb) => {
    cb(null, loggedInUser._id);
});

passport.deserializeUser(async(userIdFromSession, cb) => {
    const user = await User.findById(userIdFromSession).catch(err => {
        cb(err);
    })
    user.password = undefined
    cb(null, user);
});