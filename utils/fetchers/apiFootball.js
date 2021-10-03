const axios = require("axios");

const apiFootballHeaders = {
  "content-type": "application/octet-stream",
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
  "x-rapidapi-key": process.env.APIFOOTBALL_KEY,
  useQueryString: true,
};

const apiFootballV2BaseUrl = "https://api-football-v1.p.rapidapi.com/v2";

exports.getLeaguesByCountry = async (country) => {
  const {
    data: { api },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}/leagues/country/${country}`,
    headers: apiFootballHeaders,
  });

  return api;
};

exports.getSeasonFromAPI = async (leagueID) => {
  const {
    data: {
      api: {
        leagues: [season],
      },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}/leagues/league/${leagueID}`,
    headers: apiFootballHeaders,
  });

  return season;
};

exports.getTeamsBySeasonFromAPI = async (leagueID) => {
  const {
    data: {
      api: { teams },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}/teams/league/${leagueID}`,
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
    url: `${apiFootballV2BaseUrl}/leagueTable/${leagueID}`,
    headers: apiFootballHeaders,
  });

  return standings;
};

exports.getFixturesBySeasonFromAPI = async (leagueID) => {
  const {
    data: {
      api: { fixtures },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}/fixtures/league/${leagueID}`,
    headers: apiFootballHeaders,
    params: {
      timezone: "Europe/London",
    },
  });

  return fixtures;
};

exports.getFixturesByMatchweekFromAPI = async (leagueID, matchweekNum) => {
  const {
    data: {
      api: { fixtures },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}/fixtures/league/${leagueID}/Regular_Season_-_${matchweekNum}`,
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
    url: `${apiFootballV2BaseUrl}/odds/fixture/${fixtureID}/label/1`,
    headers: apiFootballHeaders,
  });

  return odds[0];
};

exports.getFixtureEventsFromAPI = async (fixtureID) => {
  const {
    data: {
      api: { events },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}/events/${fixtureID}`,
    headers: apiFootballHeaders,
  });

  return events;
};

exports.getFixturesLiveFromAPI = async () => {
  const {
    data: {
      api: { fixtures },
    },
  } = await axios({
    method: "GET",
    url: `${apiFootballV2BaseUrl}/fixtures/live`,
    headers: apiFootballHeaders,
  });

  return fixtures;
};
