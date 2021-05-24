const Team = require('../../models/Team')
const Season = require('../../models/Season')
const User = require('../../models/User')

const {
    getSeasonRankingFromAPI
} = require('../fetchers/apiFootball')

const {
    fixtureShortStatuses,
    fixtureWinner
} = require('../../models/enums/fixture')

const {
    matchweekBonusPoints,
    ODDS_FACTOR
} = require('../constants')

exports.emailFormatter = email => email ? email.toLowerCase() : null

exports.usernameFormatter = username => username ?
    username
    .toLowerCase()
    .replace(/ /g, '') :
    null

exports.doesUsernameExist = async username => {
    const user = await await User.findOne({
        username: {
            $regex: `^${this.usernameFormatter(username)}$`,
            $options: 'ix'
        }
    })
    return !!user
}

exports.usernameGenerator = (name) => `${name}Geek${Math.floor(Math.random() * 9999)}`

exports.generateRandomUsername = async name => {
    let randomUsername = this.usernameGenerator(name)
    let usernameExists = await this.doesUsernameExist(randomUsername)
    while (usernameExists) {
        randomUsername = this.usernameGenerator(name)
        usernameExists = await this.doesUsernameExist(randomUsername)
    }
    return randomUsername
}

exports.generateRandomToken = tokenLength => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < tokenLength; i++) token += characters.charAt(Math.floor(Math.random() * characters.length))
    return token
}

exports.matchFinished = statusShort => {
    return statusShort !== fixtureShortStatuses.TBD &&
        statusShort !== fixtureShortStatuses.NS &&
        statusShort !== fixtureShortStatuses.H1 &&
        statusShort !== fixtureShortStatuses.HT &&
        statusShort !== fixtureShortStatuses.H2 &&
        statusShort !== fixtureShortStatuses.ET &&
        statusShort !== fixtureShortStatuses.P &&
        statusShort !== fixtureShortStatuses.BT &&
        statusShort !== fixtureShortStatuses.SUSP &&
        statusShort !== fixtureShortStatuses.INT &&
        statusShort !== fixtureShortStatuses.PST
}

exports.determineWinnerFixture = (fixture, fixtureOdds) => {
    const goalsHomeTeam = fixture.goalsHomeTeam
    const goalsAwayTeam = fixture.goalsAwayTeam
    let winner = null;
    let points = 0;
    const timeElapsed = fixture.elapsed == 0 ? null : fixture.elapsed
    if (
        typeof goalsHomeTeam === 'number' &&
        goalsHomeTeam >= 0 &&
        typeof goalsAwayTeam === 'number' &&
        goalsAwayTeam >= 0
    ) {
        if (goalsHomeTeam > goalsAwayTeam) {
            winner = fixture.homeTeam.team_name;
            points = fixtureOdds.oddsWinHome || 0
        } else if (goalsHomeTeam < goalsAwayTeam) {
            winner = fixture.awayTeam.team_name
            points = fixtureOdds.oddsWinAway || 0
        } else {
            winner = fixtureWinner.DRAW
            points = fixtureOdds.oddsDraw || 0
        }
    }

    return {
        goalsHomeTeam,
        goalsAwayTeam,
        timeElapsed,
        winner,
        points
    }
}

exports.calculateCorrectPronogeekPoints = (pronogeek, fixture, points) => {
    pronogeek.correct = true
    pronogeek.points = parseInt(points)
    if (
        pronogeek.homeProno == fixture.goalsHomeTeam &&
        pronogeek.awayProno == fixture.goalsAwayTeam
    ) {
        pronogeek.exact = true
        pronogeek.points = parseInt(points) * 2
    }

    // add 30 bonus points if good pronostic on favorite team game
    const userSeason = pronogeek.geek.seasons.filter(season => season.season._id.toString() == pronogeek.season.toString())[0]
    const userFavTeam = userSeason.favTeam ? userSeason.favTeam.name : ''
    if (
        userFavTeam.toString() === pronogeek.fixture.homeTeam.name.toString() ||
        userFavTeam.toString() === pronogeek.fixture.awayTeam.name.toString()
    ) {
        pronogeek.bonusFavTeam = true
        pronogeek.points += matchweekBonusPoints.FAVORITE_TEAM
    }

    return pronogeek
}

exports.updateUserPoints = (user, seasonID, matchweekNumber) => {
    let seasonIndex;
    user.seasons.forEach((season, i) => {
        if (season.season.toString() == seasonID) seasonIndex = i
    })
    let matchweekIndex;
    user.seasons[seasonIndex].matchweeks.forEach((matchweek, i) => {
        if (matchweek.number.toString() === matchweekNumber.toString()) matchweekIndex = i
    })
    let matchweekPoints = 0;
    let numberCorrects = 0;
    let numberExacts = 0;
    let bonusPointsCorrects = 0;
    let bonusPointsExacts = 0;
    let bonusFavTeam = false;
    user.seasons[seasonIndex].matchweeks[matchweekIndex].pronogeeks.forEach(pronogeek => {
        if (pronogeek.points) matchweekPoints += parseInt(pronogeek.points)
        if (pronogeek.bonusFavTeam) bonusFavTeam = true
        if (pronogeek.correct) numberCorrects++
            if (pronogeek.exact) numberExacts++
    })
    switch (numberCorrects) {
        case 5:
            bonusPointsCorrects = matchweekBonusPoints.CORRECT_5
            break;
        case 6:
            bonusPointsCorrects = matchweekBonusPoints.CORRECT_6
            break;
        case 7:
            bonusPointsCorrects = matchweekBonusPoints.CORRECT_7
            break;
        case 8:
            bonusPointsCorrects = matchweekBonusPoints.CORRECT_8
            break;
        case 9:
            bonusPointsCorrects = matchweekBonusPoints.CORRECT_9
            break;
        case 10:
            bonusPointsCorrects = matchweekBonusPoints.CORRECT_10
            break;
        default:
            bonusPointsCorrects = 0
    }

    switch (numberExacts) {
        case 3:
            bonusPointsExacts = matchweekBonusPoints.EXACT_3
            break;
        case 4:
            bonusPointsExacts = matchweekBonusPoints.EXACT_4
            break;
        case 5:
            bonusPointsExacts = matchweekBonusPoints.EXACT_5
            break;
        case 6:
            bonusPointsExacts = matchweekBonusPoints.EXACT_6
            break;
        case 7:
            bonusPointsExacts = matchweekBonusPoints.EXACT_7
            break;
        case 8:
            bonusPointsExacts = matchweekBonusPoints.EXACT_8
            break;
        case 9:
            bonusPointsExacts = matchweekBonusPoints.EXACT_9
            break;
        case 10:
            bonusPointsExacts = matchweekBonusPoints.EXACT_10
            break;
        default:
            bonusPointsExacts = 0
    }

    // Update matchweek points on user profile
    user.seasons[seasonIndex].matchweeks[matchweekIndex].points = parseInt(matchweekPoints)
    user.seasons[seasonIndex].matchweeks[matchweekIndex].bonusFavTeam = bonusFavTeam
    user.seasons[seasonIndex].matchweeks[matchweekIndex].numberCorrects = parseInt(numberCorrects)
    user.seasons[seasonIndex].matchweeks[matchweekIndex].numberExacts = parseInt(numberExacts)
    user.seasons[seasonIndex].matchweeks[matchweekIndex].bonusPoints = parseInt(bonusPointsCorrects) + parseInt(bonusPointsExacts)
    user.seasons[seasonIndex].matchweeks[matchweekIndex].totalPoints = parseInt(matchweekPoints) + parseInt(bonusPointsCorrects) + parseInt(bonusPointsExacts)

    // Update season points on user profile
    let seasonPoints = user.seasons[seasonIndex].initialPoints || 0;
    let seasonCorrects = user.seasons[seasonIndex].initialNumberCorrects || 0;
    let seasonExacts = user.seasons[seasonIndex].initialNumberExacts || 0;
    let seasonBonusFavTeam = user.seasons[seasonIndex].initialBonusFavTeam || 0;
    user.seasons[seasonIndex].matchweeks.forEach(matchweek => {
        seasonPoints += matchweek.totalPoints
        seasonCorrects += matchweek.numberCorrects
        seasonExacts += matchweek.numberExacts
        seasonBonusFavTeam += matchweek.bonusFavTeam ? 1 : 0
    })
    user.seasons[seasonIndex].totalPoints = seasonPoints
    user.seasons[seasonIndex].numberCorrects = seasonCorrects
    user.seasons[seasonIndex].numberExacts = seasonExacts
    user.seasons[seasonIndex].bonusFavTeam = seasonBonusFavTeam

    return user
}

exports.calculateOdds = (odd, fixture) => {
    let unibetOdds = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 16)
    let bwinOdds = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 6)
    if (unibetOdds.length > 0) unibetOdds = unibetOdds[0]
    else if (bwinOdds.length > 0) unibetOdds = bwinOdds[0]
    else unibetOdds = odd.bookmakers[0]

    const extractOdd = filterValue => Math.round(unibetOdds.bets[0].values.filter(oddValue => oddValue.value === filterValue)[0].odd * ODDS_FACTOR)

    fixture.oddsWinHome = extractOdd(fixtureWinner.HOME)
    fixture.oddsDraw = extractOdd(fixtureWinner.DRAW)
    fixture.oddsWinAway = extractOdd(fixtureWinner.AWAY)

    return fixture
}

exports.fetchAndSaveSeasonRanking = async seasonID => {
    const season = await Season.findById(seasonID)
    const leagueID = season.apiLeagueID

    const rankingAPI = await getSeasonRankingFromAPI(leagueID)

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

    season.rankedTeams = rankedTeams

    await season.save()

    return rankedTeams
}