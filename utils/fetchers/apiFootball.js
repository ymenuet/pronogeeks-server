const axios = require("axios");

const apiFootballHeaders = {
  "content-type": "application/octet-stream",
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
  "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
  useQueryString: true,
};

const apiFootballV2BaseUrl = "https://api-football-v1.p.rapidapi.com/v2/";

const apiFootballV3BaseUrl = "https://api-football-v1.p.rapidapi.com/v3/";

exports.getSeasonFromAPI = async (leagueID) => {
  const {
    data: { response },
  } = await axios({
    method: "GET",
    url: `${apiFootballV3BaseUrl}leagues`,
    params: { id: leagueID, current: true },
    headers: apiFootballHeaders,
  });

  return response;
};

exports.getTeamsBySeasonFromAPI = async (leagueID) => {
  const {
    data: {
      api: { teams },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}teams/league/${leagueID}`,
    headers: apiFootballHeaders,
  });

  return teams;
};

exports.getSeasonRankingFromAPI = async (leagueID) => {
  const {
    data: {
      api: { standings },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}leagueTable/${leagueID}`,
    headers: apiFootballHeaders,
  });

  return standings;
};

exports.getFixturesByMatchweekFromAPI = async (leagueID, matchweekNum) => {
  const {
    data: {
      api: { fixtures },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}fixtures/league/${leagueID}/Regular_Season_-_${matchweekNum}`,
    headers: apiFootballHeaders,
    params: {
      timezone: "Europe/London",
    },
  });

  return fixtures;
};

exports.getWinnerOddByFixtureFromAPI = async (fixtureID) => {
  const {
    data: {
      api: { odds },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}odds/fixture/${fixtureID}/label/1`,
    headers: apiFootballHeaders,
  });

  return odds[0];
};
