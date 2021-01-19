exports.userPopulator = [{
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
}]

exports.populateHomeAndAwayTeams = [{
    path: 'homeTeam',
    model: 'Team'
}, {
    path: 'awayTeam',
    model: 'Team'
}]