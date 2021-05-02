const passport = require('passport');
const User = require('../models/User');
const {
    profileFilter
} = require('../utils/constants');
const {
    userPopulator
} = require('../utils/populators')

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