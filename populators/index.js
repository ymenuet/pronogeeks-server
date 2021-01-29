exports.populateHomeAndAwayTeams = [{
    path: 'homeTeam',
    model: 'Team'
}, {
    path: 'awayTeam',
    model: 'Team'
}]

exports.seasonPopulator = [{
    path: 'fixtures',
    model: 'Fixture',
    populate: this.populateHomeAndAwayTeams
}, {
    path: 'rankedTeams',
    model: 'Team'
}]

exports.userPopulator = [{
    path: 'seasons',
    populate: [{
        path: 'season',
        model: 'Season',
        populate: [{
            path: 'fixtures',
            model: 'Fixture',
            populate: this.populateHomeAndAwayTeams
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
                populate: this.populateHomeAndAwayTeams
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