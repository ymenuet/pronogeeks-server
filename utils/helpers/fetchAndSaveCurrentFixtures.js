const Season = require("../../models/Season");
const Fixture = require("../../models/Fixture");
const { seasonStatuses } = require("../../models/enums/season");
const { populateHomeAndAwayTeams } = require("../populators");
const { getFixturesLiveFromAPI } = require("../fetchers/apiFootball");
const { determineWinnerFixture, matchFinished } = require(".");

const mapAndSaveFixturesFromApi = (fixturesFromDB) => async (fixture) => {
  const fixtureToUpdate = fixturesFromDB.find(
    ({ apiFixtureID }) => apiFixtureID === `${fixture.fixture_id}`
  );

  if (fixtureToUpdate) {
    const fixtureEvents = fixture.events.map(
      mapFixtureEventFromAPI(fixtureToUpdate)
    );

    const { goalsHomeTeam, goalsAwayTeam, timeElapsed, winner, points } =
      determineWinnerFixture(fixture, fixtureFromDB);

    fixtureToUpdate.events = fixtureEvents;
    fixtureToUpdate.goalsHomeTeam = goalsHomeTeam;
    fixtureToUpdate.goalsAwayTeam = goalsAwayTeam;
    fixtureToUpdate.winner = winner;
    fixtureToUpdate.status = fixture.status;
    fixtureToUpdate.statusShort = fixture.statusShort;
    fixtureToUpdate.timeElapsed = timeElapsed;
    fixtureToUpdate.points = points;
    fixtureToUpdate.lastScoreUpdate = Date.now();

    await fixtureToUpdate.save();
  }

  return fixtureToUpdate;
};

exports.fetchAndSaveCurrentFixtures = async () => {
  const currentSeasons = await Season.find({
    status: seasonStatuses.UNDERWAY,
  });
  const fixturesFromDB = await Fixture.find({
    season: {
      $in: currentSeasons.map(({ _id }) => _id),
    },
  }).populate(populateHomeAndAwayTeams);

  const fixturesFromAPI = await getFixturesLiveFromAPI();

  const fixturesToFilter = await Promise.all(
    fixturesFromAPI.map(mapAndSaveFixturesFromApi(fixturesFromDB))
  );

  const fixturesUpdated = fixturesToFilter.filter((fixture) => !!fixture);

  const fixturesOver = fixturesUpdated
    .filter(({ statusShort }) => matchFinished(statusShort))
    .map(({ _id }) => _id);
};
