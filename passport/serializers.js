const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((loggedInUser, cb) => {
    cb(null, loggedInUser._id);
});

passport.deserializeUser(async(userIdFromSession, cb) => {
    const user = await User.findOne({
        _id: userIdFromSession
    }).catch(err => {
        cb(err);
    })
    delete user.password
    cb(null, userDocument);
});