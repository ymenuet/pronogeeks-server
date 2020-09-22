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

exports.fetchSeasonMatchweekFixturesFromApi = async(req, res) => {
    const {
        seasonID,
        matchweekNumber
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID

    // Cancel fetch if matches already finished
    const matchweekFixtures = await Fixture.find({
        matchweek: matchweekNumber
    })
    const fixturesLeftToPlay = matchweekFixtures.filter(fixture => fixture.statusShort === 'TBD' || fixture.statusShort === 'NS' || fixture.statusShort === '1H' || fixture.statusShort === 'HT' || fixture.statusShort === '2H' || fixture.statusShort === 'ET' || fixture.statusShort === 'P' || fixture.statusShort === 'BT' || fixture.statusShort === 'SUSP' || fixture.statusShort === 'INT' || fixture.statusShort === 'PST')
    if (fixturesLeftToPlay.length < 1) return res.status(200).json({
        message: {
            en: `There is no game to update. They are all finished.`,
            fr: `Tous les matchs sont déjà finis. Il n'y a rien à mettre à jour.`
        }
    })

    const {
        data: {
            api: {
                fixtures: fixturesAPI
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/fixtures/league/${leagueID}/Regular_Season_-_${matchweekNumber}`,
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
    const fixtures = await Promise.all(fixturesAPI.map(async fixture => {
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
                goalsHomeTeam < goalsAwayTeam ? winner = fixture.awayTeam.team_name :
                goalsHomeTeam === goalsAwayTeam ? winner = 'Draw' :
                winner = null
        }
        const updatedFixture = await Fixture.findOneAndUpdate({
            apiFixtureID: fixture.fixture_id,
            season: seasonID
        }, {
            matchweek: matchweekNumber,
            date: fixture.event_date,
            homeTeam: homeTeamId,
            awayTeam: awayTeamId,
            goalsHomeTeam,
            goalsAwayTeam,
            winner,
            status: fixture.status,
            statusShort: fixture.statusShort,
        }, {
            new: true
        })
        return updatedFixture
    }))

    res.status(200).json({
        fixtures
    })
}

exports.fetchNextMatchweekOddsFromApi = async(req, res) => {
    const {
        seasonID,
        matchweekNumber
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID

    // Cancel fetch if matches already finished
    const matchweekFixtures = await Fixture.find({
        matchweek: matchweekNumber
    })
    const fixturesLeftToPlay = matchweekFixtures.filter(fixture => fixture.statusShort === 'TBD' || fixture.statusShort === 'NS' || fixture.statusShort === '1H' || fixture.statusShort === 'HT' || fixture.statusShort === '2H' || fixture.statusShort === 'ET' || fixture.statusShort === 'P' || fixture.statusShort === 'BT' || fixture.statusShort === 'SUSP' || fixture.statusShort === 'INT' || fixture.statusShort === 'PST')
    if (fixturesLeftToPlay.length < 1) return res.status(200).json({
        message: {
            en: `There is no game to update. They are all finished.`,
            fr: `Tous les matchs sont déjà finis. Il n'y a rien à mettre à jour.`
        }
    })

    const {
        data: {
            api: {
                odds: oddsAPI
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/odds/league/${leagueID}/label/1?page=${matchweekNumber}`,
        "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
            "useQueryString": true
        }
    })

    const fixtureOdds = await Promise.all(oddsAPI.map(async odd => {
        // Not to update the matches that are already finished
        const fixtureForStatus = await Fixture.findOne({
            apiFixtureID: odd.fixture.fixture_id
        })
        const fixtureID = fixtureForStatus._id
        if (fixtureForStatus.statusShort !== 'TBD' || 'NS' || '1H' || 'HT' || '2H' || 'ET' || 'P' || 'BT' || 'SUSP' || 'INT' || 'PST') return {
            message: {
                en: `The odds of the fixture with ID ${fixtureID} were not updated since the game is already finished.`,
                fr: `Les cotes du match d'ID ${fixtureID} n'ont pas été mis à jour car le match est déjà fini.`
            }
        }

        const oddsWinHome = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 16)[0].bets[0].values.filter(oddValue => oddValue.value === 'Home')[0].odd
        const oddsDraw = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 16)[0].bets[0].values.filter(oddValue => oddValue.value === 'Draw')[0].odd
        const oddsWinAway = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 16)[0].bets[0].values.filter(oddValue => oddValue.value === 'Away')[0].odd
        const fixture = await Fixture.findOneAndUpdate({
            apiFixtureID: odd.fixture.fixture_id,
        }, {
            oddsWinHome,
            oddsDraw,
            oddsWinAway
        }, {
            new: true
        })
        return fixture
    }))

    res.status(200).json({
        fixtureOdds
    })
}