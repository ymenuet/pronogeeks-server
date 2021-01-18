const passport = require('passport');
const User = require('../models/User');
const {
    userPopulator
} = require('../populators')

passport.serializeUser((loggedInUser, cb) => {
    cb(null, loggedInUser._id);
});

passport.deserializeUser((userIdFromSession, cb) => {
    User.findOne({
            _id: userIdFromSession
        })
        .populate(userPopulator)
        .then(userDocument => {
            if (userDocument) userDocument.password = undefined
            cb(null, userDocument);
        })
        .catch(err => {
            cb(err);
        })
});