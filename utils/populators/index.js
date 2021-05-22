const {
    profileFilter
} = require("../constants")

const {
    SEASON_REF,
    TEAM_REF,
    USER_REF,
    GEEKLEAGUE_REF,
    FIXTURE_REF
} = require('../../models/refs')

exports.userPopulator = [{
    path: 'seasons',
    populate: [{
        path: 'season',
        model: SEASON_REF
    }, {
        path: 'provisionalRanking',
        model: TEAM_REF
    }, {
        path: 'favTeam',
        model: TEAM_REF
    }]
}, {
    path: 'geekLeagues',
    model: GEEKLEAGUE_REF,
    populate: {
        path: 'creator',
        model: USER_REF,
    }
}]

exports.populateHomeAndAwayTeams = [{
    path: 'homeTeam',
    model: TEAM_REF
}, {
    path: 'awayTeam',
    model: TEAM_REF
}]

exports.geekPopulator = {
    path: 'seasons',
    populate: {
        path: 'favTeam',
        model: TEAM_REF
    }
}

exports.seasonPopulator = [{
    path: 'fixtures',
    model: FIXTURE_REF,
    options: {
        sort: {
            date: 1
        }
    },
    populate: this.populateHomeAndAwayTeams
}, {
    path: 'rankedTeams',
    model: TEAM_REF
}]

exports.geekleaguePopulator = [{
    path: 'geeks',
    model: USER_REF,
    populate: this.geekPopulator,
    select: profileFilter,
}, {
    path: 'creator',
    model: USER_REF,
    select: profileFilter,
}, {
    path: 'season',
    model: SEASON_REF,
}]

exports.pronogeekPopulator = [{
    path: 'fixture',
    model: FIXTURE_REF,
    populate: this.populateHomeAndAwayTeams
}, {
    path: 'geek',
    model: USER_REF,
    populate: this.geekPopulator,
    select: profileFilter,
}]