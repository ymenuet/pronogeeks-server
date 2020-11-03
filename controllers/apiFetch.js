const axios = require('axios')
const Team = require('../models/Team')
const Season = require('../models/Season')
const Fixture = require('../models/Fixture')
const User = require('../models/User')
const Pronogeek = require('../models/Pronogeek')

const {
    matchFinished,
    getFixturesByMatchweekFromAPI,
    calculateCorrectPronogeekPoints,
    updateUserPoints
} = require('../helpers')

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

// The function below goes to fetch the updated scores and status of the games of a specific season and matchweek.
// Once it has the results, it updates the games that where not up-to-date yet.
// Then, it updates the pronogeeks of every game that changed status, with the points and bonus points.
// And to finish, it updates all the profiles of the users that had bet on the updated games
exports.fetchSeasonMatchweekFixturesFromApi = async(req, res) => {
    const {
        seasonID,
        matchweekNumber
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID

    // Cancel fetch if all matches already finished
    const matchweekFixtures = await Fixture.find({
        matchweek: matchweekNumber
    })
    const fixturesLeftToPlay = matchweekFixtures.filter(fixture => !matchFinished(fixture.statusShort))
    if (fixturesLeftToPlay.length < 1) return res.status(200).json({
        message: {
            en: `There is no game to update. They are all finished.`,
            fr: `Tous les matchs sont déjà finis. Il n'y a rien à mettre à jour.`
        }
    })


    // Fetch fixtures that have been postponed in order to update their date
    const postponedFixturesDB = await Fixture.find({
        statusShort: 'PST'
    })

    if (postponedFixturesDB.length > 0) {

        const uniqueMatchweeks = []
        postponedFixturesDB.forEach(fixture => {
            if (!uniqueMatchweeks.includes(fixture.matchweek) &&
                Date.now() - new Date(fixture.lastScoreUpdate) > 1000 * 60 * 60 * 24 &&
                Date.now() - new Date(fixture.date) > 0
            ) uniqueMatchweeks.push(fixture.matchweek)
        })

        if (uniqueMatchweeks.length > 0) {
            const matchweeksWithPostponedFixturesAPI = await Promise.all(uniqueMatchweeks.map(async matchweekNum => {
                return await getFixturesByMatchweekFromAPI(leagueID, matchweekNum)
            }))

            const fixturesToUpdate = []
            matchweeksWithPostponedFixturesAPI.forEach(matchweek => fixturesToUpdate.push(...matchweek))

            await Promise.all(fixturesToUpdate.map(async fixture => {
                await Fixture.findOneAndUpdate({
                    apiFixtureID: fixture.fixture_id
                }, {
                    date: fixture.event_date,
                    lastScoreUpdate: Date.now()
                })
            }))
        }
    }

    // Fetch fixtures of the matchweek
    const fixturesAPI = await getFixturesByMatchweekFromAPI(leagueID, matchweekNumber)

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

        const fixtureOdds = await Fixture.findOne({
            apiFixtureID: fixture.fixture_id
        })

        const goalsHomeTeam = fixture.goalsHomeTeam
        const goalsAwayTeam = fixture.goalsAwayTeam
        let winner = null;
        let points = 0;
        if (
            typeof goalsHomeTeam === 'number' &&
            goalsHomeTeam >= 0 &&
            typeof goalsAwayTeam === 'number' &&
            goalsAwayTeam >= 0
        ) {
            if (goalsHomeTeam > goalsAwayTeam) {
                winner = fixture.homeTeam.team_name;
                points = fixtureOdds.oddsWinHome
            } else if (goalsHomeTeam < goalsAwayTeam) {
                winner = fixture.awayTeam.team_name
                points = fixtureOdds.oddsWinAway
            } else {
                winner = 'Draw'
                points = fixtureOdds.oddsDraw
            }
        }
        const timeElapsed = fixture.elapsed == 0 ? null : fixture.elapsed
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
            timeElapsed,
            lastScoreUpdate: Date.now()
        }, {
            new: true
        })
        if (matchFinished(updatedFixture.statusShort)) {
            const userIDs = []
            const pronogeeks = await Pronogeek.find({
                    fixture: updatedFixture._id
                })
                .populate({
                    path: 'fixture',
                    model: 'Fixture'
                })
                .populate({
                    path: 'fixture',
                    populate: {
                        path: 'homeTeam',
                        model: 'Team'
                    }
                })
                .populate({
                    path: 'fixture',
                    populate: {
                        path: 'awayTeam',
                        model: 'Team'
                    }
                })
                .populate({
                    path: 'geek',
                    model: 'User'
                })
                .populate({
                    path: 'geek',
                    populate: {
                        path: 'seasons',
                        populate: {
                            path: 'season',
                            model: 'Season'
                        }
                    }
                })
                .populate({
                    path: 'geek',
                    populate: {
                        path: 'seasons',
                        populate: {
                            path: 'favTeam',
                            model: 'Team'
                        }
                    }
                })
                .populate({
                    path: 'geek',
                    populate: {
                        path: 'seasons',
                        populate: {
                            path: 'matchweek',
                            populate: {
                                path: 'pronogeeks',
                                model: 'Pronogeek'
                            }
                        }
                    }
                })

            await Promise.all(pronogeeks.map(async pronogeek => {
                if (pronogeek.winner === winner && !pronogeek.addedToProfile && pronogeek.geek) {

                    userIDs.push(pronogeek.geek._id)

                    pronogeek = calculateCorrectPronogeekPoints(pronogeek, updatedFixture, points)

                }

                pronogeek.addedToProfile = true
                await pronogeek.save()

                return pronogeek
            }))

            await Promise.all(userIDs.map(async userID => {
                let user = await User.findOne({
                        _id: userID
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
                            path: 'matchweeks',
                            populate: {
                                path: 'pronogeeks',
                                model: 'Pronogeek'
                            }
                        }
                    })
                if (user) {
                    user = updateUserPoints(user, seasonID, updatedFixture)
                    await user.save()
                }
                return user
            }))
        }
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

    // Cancel fetch if matches already finished
    const matchweekFixtures = await Fixture.find({
        matchweek: matchweekNumber,
        season: seasonID
    })
    const fixturesLeftToPlay = matchweekFixtures.filter(fixture => new Date(fixture.date).getTime() - Date.now() > 1000 * 60 * 30)
    if (fixturesLeftToPlay.length < 1) return res.status(200).json({
        message: {
            en: `There is no game to update. They are all finished or starting in less than 30min.`,
            fr: `Tous les matchs sont déjà finis ou commencent dans moins de 30min. Il n'y a rien à mettre à jour.`
        }
    })

    const fixtureUpdatedOdds = await Promise.all(fixturesLeftToPlay.map(async fixture => {
        const {
            data: {
                api: {
                    odds
                }
            }
        } = await axios({
            "method": "GET",
            "url": `https://api-football-v1.p.rapidapi.com/v2/odds/fixture/${fixture.apiFixtureID}/label/1`,
            "headers": {
                "content-type": "application/octet-stream",
                "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
                "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
                "useQueryString": true
            }
        })
        const odd = odds[0]
        let unibetOdds = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 16)
        let bwinOdds = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 6)
        if (unibetOdds.length > 0) unibetOdds = unibetOdds[0]
        else if (bwinOdds.length > 0) unibetOdds = bwinOdds[0]
        else unibetOdds = odd.bookmakers[0]

        fixture.oddsWinHome = Math.round(unibetOdds.bets[0].values.filter(oddValue => oddValue.value === 'Home')[0].odd * 10)
        fixture.oddsDraw = Math.round(unibetOdds.bets[0].values.filter(oddValue => oddValue.value === 'Draw')[0].odd * 10)
        fixture.oddsWinAway = Math.round(unibetOdds.bets[0].values.filter(oddValue => oddValue.value === 'Away')[0].odd * 10)
        fixture.lastOddsUpdate = Date.now()

        await fixture.save()

        return fixture
    }))

    res.status(200).json({
        fixtures: fixtureUpdatedOdds
    })
}