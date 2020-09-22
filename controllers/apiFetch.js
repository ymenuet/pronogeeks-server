const axios = require('axios')
const Team = require('../models/Team')
const Season = require('../models/Season')
const Fixture = require('../models/Fixture')

exports.fetchAllSeasonTeamsFromApi = async(req, res) => {
    const {
        seasonID
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID
    const {
        data: {
            api: {
                teams: teamsAPI
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/teams/league/${leagueID}`,
        "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
            "useQueryString": true
        }
    })

    res.status(200).json({
        teamsAPI
    })
}

exports.fetchSeasonRankingFromApi = async(req, res) => {
    const {
        seasonID
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID
    const {
        data: {
            api: {
                standings: rankingAPI
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/leagueTable/${leagueID}`,
        "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
            "useQueryString": true
        }
    })

    const rankedTeams = await Promise.all(rankingAPI[0].map(async team => {
        return await Team.findOneAndUpdate({
            apiTeamID: team.team_id,
            season: seasonID
        }, {
            rank: team.rank,
            points: team.points,
            goalsDiff: team.goalsDiff,
            matchsPlayed: team.all.matchsPlayed,
            win: team.all.win,
            draw: team.all.draw,
            lose: team.all.lose,
            goalsFor: team.all.goalsFor,
            goalsAgainst: team.all.goalsAgainst
        }, {
            new: true
        })
    }))

    res.status(200).json({
        rankedTeams
    })
}

exports.fetchAllSeasonFixturesFromApi = async(req, res) => {
    const {
        seasonID
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID
    const {
        data: {
            api: {
                fixtures: fixturesAPI
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/fixtures/league/${leagueID}`,
        "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
            "useQueryString": true
        },
        "params": {
            "timezone": "Europe/London"
        }
    })
    const fixtures = await Promise.all(fixturesAPI.map(async(fixture, index) => {
        const matchweek = Math.ceil(index / 10)
        const homeTeam = await Team.findOne({
            apiTeamID: fixture.homeTeam.team_id,
            season: seasonID
        })
        const homeTeamId = homeTeam._id
        const awayTeam = await Team.findOne({
            apiTeamID: fixture.awayTeam.team_id,
            season: seasonID
        })
        const awayTeamId = awayTeam._id

        const goalsHomeTeam = fixture.goalsHomeTeam
        const goalsAwayTeam = fixture.goalsAwayTeam
        let winner;
        if (goalsHomeTeam >= 0 && goalsAwayTeam >= 0) {
            goalsHomeTeam > goalsAwayTeam ? winner = fixture.homeTeam.team_name :
                goalsHomeTeam < goalsAwayTeam ?
                winner = fixture.awayTeam.team_name :
                winner = 'Draw'
        }
        const updatedFixture = await Fixture.findOneAndUpdate({
            apiFixtureID: fixture.fixture_id,
            season: seasonID
        }, {
            date: fixture.event_date,
            homeTeam: homeTeamId,
            awayTeam: awayTeamId,
            goalsHomeTeam,
            goalsAwayTeam,
            winner,
            status: fixture.status,
            statusShort: fixture.statusShort,
        })
        return updatedFixture
    }))

    res.status(200).json({
        fixtures
    })
}

exports.fetchNextMatchweekOddsFromApi = async(req, res) => {
    const {
        seasonID
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID
    const {
        data: {
            api: {
                odds
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/odds/league/${leagueID}/label/1`,
        "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
            "useQueryString": true
        }
    })

    res.status(200).json({
        odds
    })
}