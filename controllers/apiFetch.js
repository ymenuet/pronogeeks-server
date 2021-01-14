const Team = require('../models/Team')
const Season = require('../models/Season')
const Fixture = require('../models/Fixture')
const User = require('../models/User')
const Pronogeek = require('../models/Pronogeek')

const {
    matchFinished,
    calculateCorrectPronogeekPoints,
    updateUserPoints,
    determineWinnerFixture,
    calculateOdds,
    fetchAndSaveSeasonRanking
} = require('../helpers')

const {
    getTeamsBySeasonFromAPI,
    getFixturesByMatchweekFromAPI,
    getWinnerOddByFixtureFromAPI,
} = require('../helpers/apiFootball')

let updateRankingTimeout;
const MILLISECONDS_IN_15_MINUTES = 1000 * 60 * 15


exports.fetchAllSeasonTeamsFromApi = async(req, res) => {
    const {
        seasonID
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID

    const teamsAPI = await getTeamsBySeasonFromAPI(leagueID)

    res.status(200).json({
        teamsAPI
    })
}


exports.fetchSeasonRankingFromApi = async(req, res) => {
    const {
        seasonID
    } = req.params

    const rankedTeams = await fetchAndSaveSeasonRanking(seasonID)

    res.status(200).json({
        rankedTeams
    })
}


// The function below goes to fetch the updated scores and status of the games of a specific season and matchweek.
// Once it has the results, it updates the games.
// Then, it updates the pronogeeks of every game that changed status and is now finished, with the points and bonus points.
// And to finish, it updates all the profiles of the users that had bet on the updated games.
exports.fetchSeasonMatchweekFixturesFromApi = async(req, res) => {
    const {
        seasonID,
        matchweekNumber
    } = req.params
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID

    // Cancel fetch if all matches already finished
    const matchweekFixtures = await Fixture.find({
        matchweek: matchweekNumber,
        season: seasonID
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
                Date.now() - new Date(fixture.lastScoreUpdate).getTime() > 1000 * 60 * 60 * 24 &&
                Date.now() - new Date(fixture.date).getTime() > 0
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

    let rankingToUpdate = false

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

        if (!rankingToUpdate) rankingToUpdate = matchFinished(fixture.statusShort) && fixture.statusShort !== fixtureOdds.statusShort

        const {
            goalsHomeTeam,
            goalsAwayTeam,
            timeElapsed,
            winner,
            points
        } = determineWinnerFixture(fixture, fixtureOdds)

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
            .populate([{
                path: 'homeTeam',
                model: 'Team'
            }, {
                path: 'awayTeam',
                model: 'Team'
            }])
        if (matchFinished(updatedFixture.statusShort)) {
            const userIDs = []
            const pronogeeks = await Pronogeek.find({
                    fixture: updatedFixture._id
                })
                .populate([{
                    path: 'fixture',
                    model: 'Fixture',
                    populate: [{
                        path: 'awayTeam',
                        model: 'Team'
                    }, {
                        path: 'homeTeam',
                        model: 'Team'
                    }]
                }, {
                    path: 'geek',
                    model: 'User',
                    populate: {
                        path: 'seasons',
                        populate: [{
                            path: 'season',
                            model: 'Season'
                        }, {
                            path: 'favTeam',
                            model: 'Team'
                        }, {
                            path: 'matchweek',
                            populate: {
                                path: 'pronogeeks',
                                model: 'Pronogeek'
                            }
                        }]
                    }
                }])

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
                            model: 'Season',
                            populate: {
                                path: 'matchweeks',
                                populate: {
                                    path: 'pronogeeks',
                                    model: 'Pronogeek'
                                }
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

    if (rankingToUpdate) {
        if (updateRankingTimeout) clearTimeout(updateRankingTimeout)
        updateRankingTimeout = setTimeout(() => fetchAndSaveSeasonRanking(seasonID), MILLISECONDS_IN_15_MINUTES)
    }

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
        const odd = await getWinnerOddByFixtureFromAPI(fixture.apiFixtureID)

        if (odd) {
            fixture = calculateOdds(odd, fixture)
            await fixture.save()
        }

        return fixture
    }))

    res.status(200).json({
        fixtures: fixtureUpdatedOdds
    })
}