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
  const {
    fixture: { points, goalsHomeTeam, goalsAwayTeam, homeTeam, awayTeam },
  } = pronogeek;

  pronogeek.correct = true;
  pronogeek.points = points;
  if (
    pronogeek.homeProno == goalsHomeTeam &&
    pronogeek.awayProno == goalsAwayTeam
  ) {
    pronogeek.exact = true;
    pronogeek.points = points * 2;
  }

  // add 30 bonus points if good pronostic on favorite team game
  const userSeason = pronogeek.geek.seasons.find(
    ({ season }) => season._id.toString() == pronogeek.season.toString()
  );
  const userFavTeam = userSeason.favTeam?._id.toString();
  if (
    userFavTeam === homeTeam._id.toString() ||
    userFavTeam === awayTeam._id.toString()
  ) {
    pronogeek.bonusFavTeam = true;
    pronogeek.points += matchweekBonusPoints.FAVORITE_TEAM;
  }
};

const updatePronogeek = async (pronogeek) => {
  if (pronogeek.winner === pronogeek.fixture.winner && !!pronogeek.geek) {
    calculateCorrectPronogeekPoints(pronogeek);
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
