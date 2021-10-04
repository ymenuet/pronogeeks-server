const { customSetInterval } = require("../helpers");
const intervals = require("./intervals");

const {
  fetchAndSaveCurrentFixtures,
} = require("../helpers/fetchAndSaveCurrentFixtures");
const { updatePronos } = require("../helpers/updatePronos");

const setLiveFixturesInterval = () => {
  customSetInterval(
    fetchAndSaveCurrentFixtures,
    intervals.setLiveFixturesInterval
  );
};

const setUpdatePronosInterval = () => {
  customSetInterval(updatePronos, intervals.setUpdatePronosInterval);
};

exports.setDatabaseUpdatersIntervals = () => {
  if (process.env.DISABLE_DATABASE_UPDATE === "true") return;

  setLiveFixturesInterval();
  // updatePronos is already called in liveFixturesInterval
  // setUpdatePronosInterval();

  // Add a daily interval for fetching every undergoing season's games with its date and status
  // Add a daily interval for fetching every undergoing season's games odds
  // Add a timeout and/or interval for fetching every undergoing season's ranking (it could come within liveFixturesInterval with a timeout to wait for it to update)
};
