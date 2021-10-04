const Pronogeek = require("../../models/Pronogeek");
const { pronogeekPopulator } = require("../populators");
const { matchweekBonusPoints } = require("../constants");
const { updateUsersPoints } = require("./updateUsersPoints");
const { matchFinished, removeDuplicatesFromArray } = require(".");

const getPronogeeksToUpdate = async (fixtureIds) => {
  let pronogeeksToUpdate;

  if (fixtureIds) {
    try {
      pronogeeksToUpdate = await Pronogeek.find({
        fixture: {
          $in: fixtureIds,
        },
      }).populate(pronogeekPopulator);
    } catch (error) {
      console.error(
        "ERROR: (updatePronos - getPronogeeksToUpdate) Error while getting the PronogeeksToUpdate (with fixtureIds):",
        error
      );
    }
  } else {
    try {
      const pronogeeksNotClosed = await Pronogeek.find({
        addedToProfile: false,
      }).populate(pronogeekPopulator);

      pronogeeksToUpdate = pronogeeksNotClosed.filter(({ fixture }) =>
        matchFinished(fixture.statusShort)
      );
    } catch (error) {
      console.error(
        "ERROR: (updatePronos - getPronogeeksToUpdate) Error while getting the PronogeeksToUpdate (without fixtureIds):",
        error
      );
    }
  }

  return pronogeeksToUpdate;
};

const calculateCorrectPronogeekPoints = (pronogeek) => {
  pronogeek.correct = true;
  pronogeek.points = pronogeek.fixture.points;
  if (
    pronogeek.homeProno == pronogeek.fixture.goalsHomeTeam &&
    pronogeek.awayProno == pronogeek.fixture.goalsAwayTeam
  ) {
    pronogeek.exact = true;
    pronogeek.points = pronogeek.fixture.points * 2;
  }

  // add 30 bonus points if good pronostic on favorite team game
  const userSeason = pronogeek.geek.seasons.find(
    ({ season }) => season._id.toString() == pronogeek.season.toString()
  );
  const userFavTeam = userSeason.favTeam?.toString();
  if (
    userFavTeam === pronogeek.fixture.homeTeam.toString() ||
    userFavTeam === pronogeek.fixture.awayTeam.toString()
  ) {
    pronogeek.bonusFavTeam = true;
    pronogeek.points += matchweekBonusPoints.FAVORITE_TEAM;
  }
};

const updatePronogeek = async (pronogeek) => {
  if (pronogeek.winner === pronogeek.fixture.winner && !!pronogeek.geek) {
    calculateCorrectPronogeekPoints(
      pronogeek,
      pronogeek.fixture,
      pronogeek.fixture.points
    );
  }

  pronogeek.addedToProfile = true;
  await pronogeek.save();

  return {
    userID: pronogeek.geek._id.toString(),
    matchweek: pronogeek.matchweek,
    seasonID: pronogeek.season.toString(),
  };
};

const updatePronogeeks = async (pronogeeks) => {
  return await Promise.all(pronogeeks.map(updatePronogeek));
};

exports.updatePronos = async (fixtureIds) => {
  const pronogeeksToUpdate = await getPronogeeksToUpdate(fixtureIds);

  let usersToUpdateWithDuplicates = [];

  if (pronogeeksToUpdate)
    usersToUpdateWithDuplicates = await updatePronogeeks(pronogeeksToUpdate);

  const usersToUpdate = removeDuplicatesFromArray(usersToUpdateWithDuplicates);

  await updateUsersPoints(usersToUpdate);
};
