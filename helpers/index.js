const axios = require('axios')

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

exports.getFixturesByMatchweekFromAPI = async(leagueID, matchweekNum) => {
    const {
        data: {
            api: {
                fixtures
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/fixtures/league/${leagueID}/Regular_Season_-_${matchweekNum}`,
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
    return fixtures
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

exports.updateUserPoints = (user, seasonID, fixture) => {
    let seasonIndex;
    user.seasons.forEach((season, i) => {
        if (season.season._id.toString() == seasonID) seasonIndex = i
    })
    let matchweekIndex;
    user.seasons[seasonIndex].matchweeks.forEach((matchweek, i) => {
        if (matchweek.number.toString() == fixture.matchweek.toString()) matchweekIndex = i
    })
    let matchweekPoints = 0;
    let numberCorrects = 0;
    let bonusPoints = 0
    user.seasons[seasonIndex].matchweeks[matchweekIndex].pronogeeks.forEach(pronogeek => {
        if (pronogeek.points) matchweekPoints += parseInt(pronogeek.points)
        if (pronogeek.correct) numberCorrects++
    })
    switch (numberCorrects) {
        case 5:
            bonusPoints = 50
            break;
        case 6:
            bonusPoints = 100
            break;
        case 7:
            bonusPoints = 200
            break;
        case 8:
            bonusPoints = 300
            break;
        case 9:
            bonusPoints = 500
            break;
        case 10:
            bonusPoints = 700
            break;
        default:
            bonusPoints = 0
    }

    // Update matchweek points on user profile
    user.seasons[seasonIndex].matchweeks[matchweekIndex].points = parseInt(matchweekPoints)
    user.seasons[seasonIndex].matchweeks[matchweekIndex].numberCorrects = parseInt(numberCorrects)
    user.seasons[seasonIndex].matchweeks[matchweekIndex].bonusPoints = parseInt(bonusPoints)
    user.seasons[seasonIndex].matchweeks[matchweekIndex].totalPoints = parseInt(matchweekPoints + bonusPoints)

    // Update season points on user profile
    let seasonPoints = user.seasons[seasonIndex].initialPoints || 0;
    user.seasons[seasonIndex].matchweeks.forEach(matchweek => seasonPoints += matchweek.totalPoints)
    user.seasons[seasonIndex].totalPoints = seasonPoints

    return user
}