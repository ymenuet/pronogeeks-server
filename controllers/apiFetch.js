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
} = require('../helpers/functions')

const {
    getTeamsBySeasonFromAPI,
    getFixturesByMatchweekFromAPI,
    getWinnerOddByFixtureFromAPI,
} = require('../helpers/apiFootball')

const {
    profileFilter
} = require('../helpers/constants')

const {
    populateHomeAndAwayTeams,
    pronogeekPopulator,
    userPopulator
} = require('../populators')

const MILLISECONDS_IN_1_DAY = 1000 * 60 * 60 * 24
const MILLISECONDS_IN_30_MINUTES = 1000 * 60 * 30
const MILLISECONDS_IN_25_MINUTES = 1000 * 60 * 25
let updateRankingTimeoutId;


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

    // Cancel fetch if all matches already finished, not to use a request without needing to
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

    // No "await" because it is not important for the rest of this function and we don't want to block it if there is an error here
    fetchAndUpdatePostponedFixtures(leagueID)


    let rankingToUpdate = false

    const usersToUpdate = []


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

        let fixtureFromDB = await Fixture.findOne({
                apiFixtureID: fixture.fixture_id,
                season: seasonID
            })
            .populate(populateHomeAndAwayTeams)

        const matchFinishedSinceLastUpdate = matchFinished(fixture.statusShort) && (fixture.statusShort !== fixtureFromDB.statusShort)

        if (!rankingToUpdate) rankingToUpdate = matchFinishedSinceLastUpdate

        const {
            goalsHomeTeam,
            goalsAwayTeam,
            timeElapsed,
            winner,
            points
        } = determineWinnerFixture(fixture, fixtureFromDB)

        if (!matchFinished(fixtureFromDB.statusShort)) {

            fixtureFromDB = await Fixture.findOneAndUpdate({
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
                .populate(populateHomeAndAwayTeams)

            if (matchFinished(fixtureFromDB.statusShort)) {

                const pronogeeks = await Pronogeek.find({
                        fixture: fixtureFromDB._id
                    })
                    .populate(pronogeekPopulator)

                await Promise.all(pronogeeks.map(async pronogeek => {
                    if (!pronogeek.addedToProfile) {

                        if (pronogeek.winner === winner && pronogeek.geek) {

                            const geekID = pronogeek.geek._id.toString()
                            if (!usersToUpdate.includes(geekID)) usersToUpdate.push(geekID)

                            pronogeek = calculateCorrectPronogeekPoints(pronogeek, fixtureFromDB, points)
                        }

                        pronogeek.addedToProfile = true
                        await pronogeek.save()
                    }
                    return pronogeek
                }))
            }
        }
        return fixtureFromDB
    }))

    await saveUserProfilesWithUpdatedPoints(usersToUpdate, seasonID, matchweekNumber)

    if (rankingToUpdate) {
        clearTimeout(updateRankingTimeoutId)
        updateRankingTimeoutId = setTimeout(() => fetchAndSaveSeasonRanking(seasonID), MILLISECONDS_IN_25_MINUTES)
    }

    const user = await User.findById(req.user._id)
        .populate(userPopulator)
        .select(profileFilter)

    const pronogeeks = await Pronogeek.find({
        geek: req.user._id,
        season: seasonID,
        matchweek: matchweekNumber
    })

    res.status(200).json({
        fixtures,
        user,
        pronogeeks
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
        .populate(populateHomeAndAwayTeams)

    const fixturesLeftToPlay = matchweekFixtures.filter(fixture => new Date(fixture.date).getTime() - Date.now() > MILLISECONDS_IN_30_MINUTES)
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
        }

        fixture.lastOddsUpdate = Date.now()
        await fixture.save()

        return fixture
    }))

    res.status(200).json({
        fixtures: fixtureUpdatedOdds
    })
}


async function saveUserProfilesWithUpdatedPoints(usersToUpdate, seasonID, matchweekNumber) {
    await Promise.all(usersToUpdate.map(async userID => {

        let user = await User.findOne({
                _id: userID
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
            user = updateUserPoints(user, seasonID, matchweekNumber)
            await user.save()
        }

        return user
    }))
}


async function fetchAndUpdatePostponedFixtures(leagueID) {
    const postponedFixturesDB = await Fixture.find({
        statusShort: 'PST'
    })

    if (postponedFixturesDB.length > 0) {

        const uniqueMatchweeks = []
        postponedFixturesDB.forEach(fixture => {
            if (!uniqueMatchweeks.includes(fixture.matchweek) &&
                Date.now() - new Date(fixture.lastScoreUpdate).getTime() > MILLISECONDS_IN_1_DAY &&
                Date.now() - new Date(fixture.date).getTime() > 0
            ) uniqueMatchweeks.push(fixture.matchweek)
        })

        if (uniqueMatchweeks.length > 0) {
            const matchweeksWithPostponedFixturesAPI = await Promise.all(uniqueMatchweeks.map(async matchweekNum => {
                return await getFixturesByMatchweekFromAPI(leagueID, matchweekNum)
            }))

            const fixturesToUpdate = []
            matchweeksWithPostponedFixturesAPI.forEach(matchweek => fixturesToUpdate.push(...matchweek))

            const postponedFixturesToUpdate = fixturesToUpdate.filter(fixture => postponedFixturesDB.map(fixtureDB => fixtureDB.apiFixtureID.toString()).includes(fixture.fixture_id.toString()))

            await Promise.all(postponedFixturesToUpdate.map(async fixture => {
                await Fixture.findOneAndUpdate({
                    apiFixtureID: fixture.fixture_id
                }, {
                    date: fixture.event_date,
                    lastScoreUpdate: Date.now()
                })
            }))
        }
    }
}