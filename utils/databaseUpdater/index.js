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
  setUpdatePronosInterval();
  if (process.env.DISABLE_DATABASE_UPDATE === "true") return;

  setLiveFixturesInterval();
};
