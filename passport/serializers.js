const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((loggedInUser, cb) => {
    cb(null, loggedInUser.id);
});

passport.deserializeUser(async(userIdFromSession, cb) => {
    const user = await User.findById(userIdFromSession)
        // .populate({
        //     path: 'geekLeagues',
        //     model: 'GeekLeague'
        // })
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
                path: 'pronogeeks',
                model: 'Pronogeek'
            }
        })
        //     populate: {
        //         path: 'provisionalRanking',
        //         model: 'Team'
        //     },
        //     populate: {
        //         path: 'favTeam',
        //         model: 'Team'
        //     },
        .catch(err => {
            cb(err);
        })
    user.password = undefined
    cb(null, user);
});