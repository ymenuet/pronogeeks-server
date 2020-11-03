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

exports.calculateOdds = (odd, fixture) => {
    let unibetOdds = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 16)
    let bwinOdds = odd.bookmakers.filter(bookmaker => bookmaker.bookmaker_id === 6)
    if (unibetOdds.length > 0) unibetOdds = unibetOdds[0]
    else if (bwinOdds.length > 0) unibetOdds = bwinOdds[0]
    else unibetOdds = odd.bookmakers[0]

    fixture.oddsWinHome = Math.round(unibetOdds.bets[0].values.filter(oddValue => oddValue.value === 'Home')[0].odd * 10)
    fixture.oddsDraw = Math.round(unibetOdds.bets[0].values.filter(oddValue => oddValue.value === 'Draw')[0].odd * 10)
    fixture.oddsWinAway = Math.round(unibetOdds.bets[0].values.filter(oddValue => oddValue.value === 'Away')[0].odd * 10)
    fixture.lastOddsUpdate = Date.now()

    return fixture
}