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
        model: 'Season'
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
        path: 'creator',
        model: 'User',
    }
}]

exports.geekleaguePopulator = {
    path: 'geeks',
    model: 'User',
    populate: {
        path: 'seasons',
        populate: {
            path: 'favTeam',
            model: 'Team'
        }
    }
}