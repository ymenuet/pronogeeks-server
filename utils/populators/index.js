const {
    profileFilter
} = require("../constants")

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

exports.populateHomeAndAwayTeams = [{
    path: 'homeTeam',
    model: 'Team'
}, {
    path: 'awayTeam',
    model: 'Team'
}]

exports.geekPopulator = {
    path: 'seasons',
    populate: {
        path: 'favTeam',
        model: 'Team'
    }
}

exports.seasonPopulator = [{
    path: 'fixtures',
    model: 'Fixture',
    options: {
        sort: {
            date: 1
        }
    },
    populate: this.populateHomeAndAwayTeams
}, {
    path: 'rankedTeams',
    model: 'Team'
}]

exports.geekleaguePopulator = [{
    path: 'geeks',
    model: 'User',
    populate: this.geekPopulator,
    select: profileFilter,
}, {
    path: 'creator',
    model: 'User',
    select: profileFilter,
}]

exports.pronogeekPopulator = [{
    path: 'fixture',
    model: 'Fixture',
    populate: this.populateHomeAndAwayTeams
}, {
    path: 'geek',
    model: 'User',
    populate: this.geekPopulator,
    select: profileFilter,
}]