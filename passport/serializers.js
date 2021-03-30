const passport = require('passport');
const User = require('../models/User');
const {
    profileFilter
} = require('../helpers/constants');
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
        .select(profileFilter)
        .then(userDocument => {
            cb(null, userDocument);
        })
        .catch(err => {
            cb(err);
        })
});