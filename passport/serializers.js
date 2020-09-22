const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((loggedInUser, cb) => {
    cb(null, loggedInUser._id);
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
            },
            //     populate: {
            //         path: 'provisionalRanking',
            //         model: 'Team'
            //     },
            //     populate: {
            //         path: 'favTeam',
            //         model: 'Team'
            //     },
            //     populate: {
            //         path: 'pronogeeks',
            //         model: 'Pronogeek'
            //     },
        })
        .catch(err => {
            cb(err);
        })
    user.password = undefined
    cb(null, user);
});