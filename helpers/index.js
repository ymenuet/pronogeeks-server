const Team = require('../models/Team')
const Season = require('../models/Season')

const {
    getSeasonRankingFromAPI
} = require('../helpers/apiFootball')

exports.generateRandomToken = tokenLength => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < tokenLength; i++) token += characters.charAt(Math.floor(Math.random() * characters.length))
    return token
}

exports.matchFinished = statusShort => {
    return statusShort !== 'TBD' &&
        statusShort !== 'NS' &&
        statusShort !== '1H' &&
        statusShort !== 'HT' &&
        statusShort !== '2H' &&
        statusShort !== 'ET' &&
        statusShort !== 'P' &&
        statusShort !== 'BT' &&
        statusShort !== 'SUSP' &&
        statusShort !== 'INT' &&
        statusShort !== 'PST'
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
            points = fixtureOdds.oddsWinHome
        } else if (goalsHomeTeam < goalsAwayTeam) {
            winner = fixture.awayTeam.team_name
            points = fixtureOdds.oddsWinAway
        } else {
            winner = 'Draw'
            points = fixtureOdds.oddsDraw
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
        pronogeek.points += 30
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
            bonusPointsCorrects = 50
            break;
        case 6:
            bonusPointsCorrects = 100
            break;
        case 7:
            bonusPointsCorrects = 200
            break;
        case 8:
            bonusPointsCorrects = 300
            break;
        case 9:
            bonusPointsCorrects = 500
            break;
        case 10:
            bonusPointsCorrects = 700
            break;
        default:
            bonusPointsCorrects = 0
    }

    switch (numberExacts) {
        case 3:
            bonusPointsExacts = 50
            break;
        case 4:
            bonusPointsExacts = 100
            break;
        case 5:
            bonusPointsExacts = 200
            break;
        case 6:
            bonusPointsExacts = 300
            break;
        case 7:
            bonusPointsExacts = 500
            break;
        case 8:
            bonusPointsExacts = 700
            break;
        case 9:
            bonusPointsExacts = 1000
            break;
        case 10:
            bonusPointsExacts = 1500
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

    const extractOdd = filterValue => Math.round(unibetOdds.bets[0].values.filter(oddValue => oddValue.value === filterValue)[0].odd * 10)

    fixture.oddsWinHome = extractOdd('Home')
    fixture.oddsDraw = extractOdd('Draw')
    fixture.oddsWinAway = extractOdd('Away')

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