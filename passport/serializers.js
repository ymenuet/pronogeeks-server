const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((loggedInUser, cb) => {
    cb(null, loggedInUser._id);
});

passport.deserializeUser((userIdFromSession, cb) => {
    User.findOne({
            _id: userIdFromSession
        })
        .populate([{
            path: 'seasons',
            populate: [{
                path: 'season',
                model: 'Season',
                populate: [{
                    path: 'fixtures',
                    model: 'Fixture',
                    populate: [{
                        path: 'awayTeam',
                        model: 'Team'
                    }, {
                        path: 'homeTeam',
                        model: 'Team'
                    }]
                }, {
                    path: 'rankedTeams',
                    model: 'Team'
                }]
            }, {
                path: 'matchweeks',
                populate: {
                    path: 'pronogeeks',
                    model: 'Pronogeek',
                    populate: {
                        path: 'fixture',
                        model: 'Fixture',
                        populate: [{
                            path: 'awayTeam',
                            model: 'Team'
                        }, {
                            path: 'homeTeam',
                            model: 'Team'
                        }]
                    }
                }
            }, {
                path: 'provisionalRanking',
                model: 'Team'
            }, {
                path: 'favTeam',
                model: 'Team'
            }]
        }, {
            path: 'geekLeagues',
            model: 'GeekLeague',
            populate: {
                path: 'geeks',
                model: 'User',
                populate: {
                    path: 'seasons',
                    populate: [{
                        path: 'favTeam',
                        model: 'Team'
                    }, {
                        path: 'matchweeks',
                        populate: {
                            path: 'pronogeeks',
                            model: 'Pronogeek'
                        }
                    }]
                }
            }
        }])
        .then(userDocument => {
            if (userDocument) userDocument.password = undefined
            cb(null, userDocument);
        })
        .catch(err => {
            cb(err);
        })
});