const Team = require("../models/Team");
const Season = require("../models/Season");
const Fixture = require("../models/Fixture");
const User = require("../models/User");
const Pronogeek = require("../models/Pronogeek");

const { PRONOGEEK_REF } = require("../models/refs");

const {
  fixtureShortStatuses,
  fixtureWinner,
} = require("../models/enums/fixture");
const { seasonStatuses } = require("../models/enums/season");

const {
  matchFinished,
  calculateCorrectPronogeekPoints,
  updateUserPoints,
  determineWinnerFixture,
  calculateOdds,
  fetchAndSaveSeasonRanking,
} = require("../utils/helpers");

const {
  getLeaguesByCountry,
  getSeasonFromAPI,
  getTeamsBySeasonFromAPI,
  getFixturesBySeasonFromAPI,
  getFixturesByMatchweekFromAPI,
  getWinnerOddByFixtureFromAPI,
  getFixtureEventsFromAPI,
} = require("../utils/fetchers/apiFootball");

const {
  profileFilter,
  MILLISECONDS_IN_1_DAY,
  MILLISECONDS_IN_30_MINUTES,
  MILLISECONDS_IN_25_MINUTES,
} = require("../utils/constants");

const {
  populateHomeAndAwayTeams,
  pronogeekPopulator,
  userPopulator,
} = require("../utils/populators");

let updateRankingTimeoutId;

exports.fetchAllSeasonTeamsFromApi = async (req, res) => {
  const { seasonID } = req.params;
  const season = await Season.findById(seasonID);
  const leagueID = season.apiLeagueID;

  const teamsAPI = await getTeamsBySeasonFromAPI(leagueID);

  res.status(200).json({
    teamsAPI,
  });
};

exports.fetchFullSeasonInfoFromApi = async (req, res) => {
  const { leagueID } = req.params;

  const existingSeason = await Season.findOne({ apiLeagueID: leagueID });

  if (existingSeason)
    return res.status(409).json({
      message: {
        en: "This season is already downloaded.",
        fr: "Cette saison est déjà téléchargée.",
      },
    });

  const seasonAPI = await getSeasonFromAPI(leagueID);

  const newSeason = await Season.create({
    leagueName: seasonAPI.name,
    type: seasonAPI.type,
    country: seasonAPI.country,
    countryCode: seasonAPI.country_code,
    status: seasonStatuses.UNDERWAY,
    apiLeagueID: leagueID,
    year: seasonAPI.season,
    startDate: seasonAPI.season_start,
    endDate: seasonAPI.season_end,
    logo: seasonAPI.logo,
    flag: seasonAPI.flag,
    provRankingOpen: true,
    rankedTeams: [],
    fixtures: [],
  });

  const newTeams = await fetchAndSaveSeasonTeams(leagueID, newSeason._id, res);

  const newFixtures = await fetchAndSaveSeasonFixtures(
    leagueID,
    newSeason._id,
    newTeams,
    res
  );

  await Season.findByIdAndUpdate(newSeason._id, {
    rankedTeams: mapID(newTeams),
    fixtures: mapID(newFixtures),
  });

  res.status(200).json({
    seasonAPI,
  });
};

exports.fetchLeaguesByCountry = async (req, res) => {
  const { country } = req.params;

  const leagues = await getLeaguesByCountry(country);

  res.status(200).json({
    leagues,
  });
};

exports.fetchSeasonRankingFromApi = async (req, res) => {
  const { seasonID } = req.params;

  const rankedTeams = await fetchAndSaveSeasonRanking(seasonID);

  res.status(200).json({
    rankedTeams,
  });
};

// The function below goes to fetch the updated scores and status of the games of a specific season and matchweek.
// Once it has the results, it updates the games.
// Then, it updates the pronogeeks of every game that changed status and is now finished, with the points and bonus points.
// And to finish, it updates all the profiles of the users that had bet on the updated games.
exports.fetchSeasonMatchweekFixturesFromApi = async (req, res) => {
  const { seasonID, matchweekNumber } = req.params;
  const season = await Season.findById(seasonID);
  const leagueID = season.apiLeagueID;

  // Cancel fetch if all matches already finished, not to use a request without needing to
  const matchweekFixtures = await Fixture.find({
    matchweek: matchweekNumber,
    season: seasonID,
  });
  const fixturesLeftToPlay = matchweekFixtures.filter(
    (fixture) => !matchFinished(fixture.statusShort)
  );
  if (fixturesLeftToPlay.length < 1)
    return res.status(200).json({
      message: {
        en: `There is no game to update. They are all finished.`,
        fr: `Tous les matchs sont déjà finis. Il n'y a rien à mettre à jour.`,
      },
    });

  // No "await" because it is not important for the rest of this function and we don't want to block it if there is an error here
  fetchAndUpdatePostponedFixtures(leagueID);

  let rankingToUpdate = false;

  const usersToUpdate = [];

  const fixturesAPI = await getFixturesByMatchweekFromAPI(
    leagueID,
    matchweekNumber
  );

  const fixtures = await Promise.all(
    fixturesAPI.map(async (fixture) => {
      const homeTeam = await Team.findOne({
        apiTeamID: fixture.homeTeam.team_id,
        season: seasonID,
      });
      const homeTeamId = homeTeam._id;
      const awayTeam = await Team.findOne({
        apiTeamID: fixture.awayTeam.team_id,
        season: seasonID,
      });
      const awayTeamId = awayTeam._id;

      let fixtureFromDB = await Fixture.findOne({
        apiFixtureID: fixture.fixture_id,
        season: seasonID,
      }).populate(populateHomeAndAwayTeams);

      const matchFinishedSinceLastUpdate =
        matchFinished(fixture.statusShort) &&
        fixture.statusShort !== fixtureFromDB.statusShort;

      if (!rankingToUpdate) rankingToUpdate = matchFinishedSinceLastUpdate;

      const { goalsHomeTeam, goalsAwayTeam, timeElapsed, winner, points } =
        determineWinnerFixture(fixture, fixtureFromDB);

      if (!matchFinished(fixtureFromDB.statusShort)) {
        fixtureFromDB = await Fixture.findOneAndUpdate(
          {
            apiFixtureID: fixture.fixture_id,
            season: seasonID,
          },
          {
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
            lastScoreUpdate: Date.now(),
          },
          {
            new: true,
          }
        ).populate(populateHomeAndAwayTeams);

        if (matchFinished(fixtureFromDB.statusShort)) {
          const pronogeeks = await Pronogeek.find({
            fixture: fixtureFromDB._id,
          }).populate(pronogeekPopulator);

          await Promise.all(
            pronogeeks.map(async (pronogeek) => {
              if (!pronogeek.addedToProfile) {
                if (pronogeek.winner === winner && pronogeek.geek) {
                  const geekID = pronogeek.geek._id.toString();
                  if (!usersToUpdate.includes(geekID))
                    usersToUpdate.push(geekID);

                  pronogeek = calculateCorrectPronogeekPoints(
                    pronogeek,
                    fixtureFromDB,
                    points
                  );
                }

                pronogeek.addedToProfile = true;
                await pronogeek.save();
              }
              return pronogeek;
            })
          );
        }
      }
      return fixtureFromDB;
    })
  );

  await saveUserProfilesWithUpdatedPoints(
    usersToUpdate,
    seasonID,
    matchweekNumber
  );

  if (rankingToUpdate) {
    clearTimeout(updateRankingTimeoutId);
    updateRankingTimeoutId = setTimeout(
      () => fetchAndSaveSeasonRanking(seasonID),
      MILLISECONDS_IN_25_MINUTES
    );
  }

  const user = await User.findById(req.user._id)
    .populate(userPopulator)
    .select(profileFilter);

  const pronogeeks = await Pronogeek.find({
    geek: req.user._id,
    season: seasonID,
    matchweek: matchweekNumber,
  });

  res.status(200).json({
    fixtures,
    user,
    pronogeeks,
  });
};

exports.fetchNextMatchweekOddsFromApi = async (req, res) => {
  const { seasonID, matchweekNumber } = req.params;

  // Cancel fetch if matches already finished
  const matchweekFixtures = await Fixture.find({
    matchweek: matchweekNumber,
    season: seasonID,
  }).populate(populateHomeAndAwayTeams);

  const fixturesLeftToPlay = matchweekFixtures.filter(
    (fixture) =>
      new Date(fixture.date).getTime() - Date.now() > MILLISECONDS_IN_30_MINUTES
  );
  if (fixturesLeftToPlay.length < 1)
    return res.status(200).json({
      message: {
        en: `There is no game to update. They are all finished or starting in less than 30min.`,
        fr: `Tous les matchs sont déjà finis ou commencent dans moins de 30min. Il n'y a rien à mettre à jour.`,
      },
    });

  const fixtureUpdatedOdds = await Promise.all(
    fixturesLeftToPlay.map(async (fixture) => {
      const odd = await getWinnerOddByFixtureFromAPI(fixture.apiFixtureID);

      if (odd) {
        fixture = calculateOdds(odd, fixture);
      }

      fixture.lastOddsUpdate = Date.now();
      await fixture.save();

      return fixture;
    })
  );

  res.status(200).json({
    fixtures: fixtureUpdatedOdds,
  });
};

exports.fetchFixtureEvents = async (req, res) => {
  const { fixtureID } = req.params;

  const fixture = await Fixture.findOne({ _id: fixtureID }).populate(
    populateHomeAndAwayTeams
  );

  const eventsFromAPI = await getFixtureEventsFromAPI(fixture.apiFixtureID);

  events = eventsFromAPI.map((event) => ({
    elapsed: event.elapsed,
    elapsedPlus: event.elapsed_plus,
    apiTeamID: event.team_id,
    team:
      `${event.team_id}` === fixture.homeTeam.apiTeamID
        ? fixtureWinner.HOME
        : fixtureWinner.AWAY,
    teamName: event.teamName,
    player: event.player,
    assist: event.assist,
    type: event.type.toUpperCase(),
    detail: event.detail,
    comments: event.comments,
  }));

  fixture.events = events;

  await fixture.save();

  res.status(200).json({ events });
};

async function saveUserProfilesWithUpdatedPoints(
  usersToUpdate,
  seasonID,
  matchweekNumber
) {
  await Promise.all(
    usersToUpdate.map(async (userID) => {
      let user = await User.findOne({
        _id: userID,
      }).populate({
        path: "seasons",
        populate: {
          path: "matchweeks",
          populate: {
            path: "pronogeeks",
            model: PRONOGEEK_REF,
          },
        },
      });

      if (user) {
        user = updateUserPoints(user, seasonID, matchweekNumber);
        await user.save();
      }

      return user;
    })
  );
}

async function fetchAndUpdatePostponedFixtures(leagueID) {
  const postponedFixturesDB = await Fixture.find({
    statusShort: fixtureShortStatuses.PST,
  });

  if (postponedFixturesDB.length > 0) {
    const uniqueMatchweeks = [];
    postponedFixturesDB.forEach((fixture) => {
      if (
        !uniqueMatchweeks.includes(fixture.matchweek) &&
        Date.now() - new Date(fixture.lastScoreUpdate).getTime() >
          MILLISECONDS_IN_1_DAY &&
        Date.now() - new Date(fixture.date).getTime() > 0
      )
        uniqueMatchweeks.push(fixture.matchweek);
    });

    if (uniqueMatchweeks.length > 0) {
      const matchweeksWithPostponedFixturesAPI = await Promise.all(
        uniqueMatchweeks.map(async (matchweekNum) => {
          return await getFixturesByMatchweekFromAPI(leagueID, matchweekNum);
        })
      );

      const fixturesToUpdate = [];
      matchweeksWithPostponedFixturesAPI.forEach((matchweek) =>
        fixturesToUpdate.push(...matchweek)
      );

      const postponedFixturesToUpdate = fixturesToUpdate.filter((fixture) =>
        postponedFixturesDB
          .map((fixtureDB) => fixtureDB.apiFixtureID.toString())
          .includes(fixture.fixture_id.toString())
      );

      await Promise.all(
        postponedFixturesToUpdate.map(async (fixture) => {
          await Fixture.findOneAndUpdate(
            {
              apiFixtureID: fixture.fixture_id,
            },
            {
              date: fixture.event_date,
              lastScoreUpdate: Date.now(),
            }
          );
        })
      );
    }
  }
}

async function fetchAndSaveSeasonTeams(apiLeagueID, seasonID, res) {
  const teamsAPI = await getTeamsBySeasonFromAPI(apiLeagueID);

  return await Promise.all(
    teamsAPI.map(async (team) => {
      return await Team.create({
        name: team.name,
        season: seasonID,
        apiTeamID: team.team_id,
        code: team.code,
        logo: team.logo,
        country: team.country,
        stadium: team.venue_name,
      });
    })
  );
}

async function fetchAndSaveSeasonFixtures(apiLeagueID, seasonID, teams, res) {
  const fixturesAPI = await getFixturesBySeasonFromAPI(apiLeagueID);

  return await Promise.all(
    fixturesAPI.map(async (fixture) => {
      const homeTeamID = getTeamIDForFixture(fixture, teams, "homeTeam");
      const awayTeamID = getTeamIDForFixture(fixture, teams, "awayTeam");

      return await Fixture.create({
        season: seasonID,
        homeTeam: homeTeamID,
        awayTeam: awayTeamID,
        apiFixtureID: `${fixture.fixture_id}`,
        status: fixture.status,
        statusShort: fixture.statusShort,
        matchweek: convertAPIRoundToDBMatchweek(fixture.round),
        date: fixture.event_date,
        venue: fixture.venue,
      });
    })
  );
}

function getTeamIDForFixture(fixture, teams, teamKey) {
  return teams.find(
    ({ apiTeamID }) => apiTeamID === `${fixture[teamKey].team_id}`
  )._id;
}

function convertAPIRoundToDBMatchweek(round) {
  const startIndex = round.indexOf("-") + 2;
  return Number(round.substring(startIndex));
}

function mapID(array) {
  return array.map(({ _id }) => _id);
}
