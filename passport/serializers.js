const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((loggedInUser, cb) => {
    cb(null, loggedInUser._id);
});

passport.deserializeUser((userIdFromSession, cb) => {
    User.findOne({
            _id: userIdFromSession
        })
        .populate({
            path: 'friends',
            model: 'User'
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'season',
                model: 'Season'
            }
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'matchweeks',
                populate: {
                    path: 'pronogeeks',
                    model: 'Pronogeek'
                }
            }
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'provisionalRanking',
                model: 'Team'
            }
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'favTeam',
                model: 'Team'
            }
        })
        .populate({
            path: 'geekLeagues',
            model: 'GeekLeague'
        })
        .populate({
            path: 'geekLeagues',
            populate: {
                path: 'geeks',
                model: 'User'
            }
        })
        .then(userDocument => {
            if (userDocument) userDocument.password = undefined
            cb(null, userDocument);
        })
        .catch(err => {
            cb(err);
        })
});