const axios = require("axios");

const apiFootballHeaders = {
    "content-type": "application/octet-stream",
    "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
    "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
    useQueryString: true,
};

const apiFootballV2BaseUrl = "https://v2.api-football.com/";
const apiFootballV3BaseUrl = "https://api-football-v1.p.rapidapi.com/v3";

exports.getLeaguesByCountry = async(country) => {
    const {
        data,
    } = await axios({
        method: "GET",
        url: `${apiFootballV3BaseUrl}/leagues`,
        params: {
            country
        },
        headers: apiFootballHeaders,
    });

    return data;
};

exports.getSeasonFromAPI = async(leagueID) => {
    const {
        data: {
            response,
        },
    } = await axios({
        method: "GET",
        url: `${apiFootballV3BaseUrl}/leagues`,
        params: {
            id: leagueID
        },
        headers: apiFootballHeaders,
    });

    return response;
};

exports.getTeamsBySeasonFromAPI = async(leagueID) => {
    const {
        data: {
            api: {
                teams
            },
        },
    } = await axios({
        method: "GET",
        url: `${apiFootballV2BaseUrl}teams/league/${leagueID}`,
        headers: apiFootballHeaders,
    });

    return teams;
};

exports.getSeasonRankingFromAPI = async(leagueID, season) => {
    const {
        data: {
            response
        },
    } = await axios({
        method: "GET",
        url: `${apiFootballV3BaseUrl}/standings`,
        params: {
            league: leagueID,
            season: `${season || new Date().getFullYear()}`
        },
        headers: apiFootballHeaders,
    });

    return response[0].league.standings[0];
};

exports.getTeamDetailsFromAPI = async(teamID) => {
    const {
        data: {
            response
        },
    } = await axios({
        method: "GET",
        url: `${apiFootballV3BaseUrl}/teams`,
        params: {
            id: teamID,
        },
        headers: apiFootballHeaders,
    });

    return response[0];
};

exports.getFixturesBySeasonFromAPI = async(leagueID, seasonYear = new Date().getFullYear()) => {
    const {
        data: {
            response,
        },
    } = await axios({
        method: "GET",
        url: `${apiFootballV3BaseUrl}/fixtures`,
        headers: apiFootballHeaders,
        params: {
            timezone: "Europe/London",
            league: leagueID,
            season: seasonYear
        },
    });

    return response;
};

exports.getFixturesByMatchweekFromAPI = async(leagueID, matchweekNum, seasonYear = new Date().getFullYear()) => {
    const {
        data: {
            response
        }
    } = await axios({
        method: "GET",
        url: `${apiFootballV3BaseUrl}/fixtures`,
        headers: apiFootballHeaders,
        params: {
            timezone: "Europe/London",
            league: leagueID,
            season: seasonYear,
            round: `Regular Season - ${matchweekNum}`
        },
    });

    return response;
};

exports.getWinnerOddByFixtureFromAPI = async(fixtureID) => {
    const {
        data: {
            response,
        },
    } = await axios({
        method: "GET",
        url: `${apiFootballV3BaseUrl}/odds`,
        params: {
            fixture: fixtureID
        },
        headers: apiFootballHeaders,
    });

    return response[0];
};