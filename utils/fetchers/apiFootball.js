const axios = require('axios')

const apiFootballHeaders = {
    "content-type": "application/octet-stream",
    "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
    "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
    "useQueryString": true
}

exports.getTeamsBySeasonFromAPI = async leagueID => {
    const {
        data: {
            api: {
                teams
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/teams/league/${leagueID}`,
        "headers": apiFootballHeaders
    })

    return teams
}

exports.getSeasonRankingFromAPI = async leagueID => {
    const {
        data: {
            api: {
                standings
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/leagueTable/${leagueID}`,
        "headers": apiFootballHeaders
    })

    return standings
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
        "headers": apiFootballHeaders,
        "params": {
            "timezone": "Europe/London"
        }
    })

    return fixtures
}

exports.getWinnerOddByFixtureFromAPI = async fixtureID => {
    const {
        data: {
            api: {
                odds
            }
        }
    } = await axios({
        "method": "GET",
        "url": `https://api-football-v1.p.rapidapi.com/v2/odds/fixture/${fixtureID}/label/1`,
        "headers": apiFootballHeaders
    })

    return odds[0]
}