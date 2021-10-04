const User = require("../../models/User");
const { PRONOGEEK_REF } = require("../../models/refs");
const { updateUserPoints } = require(".");

const updateUserTotals = async ({ userID, seasons }) => {
  const user = await User.findOne({
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
    Object.entries(seasons).forEach(([seasonID, matchweeks]) => {
      matchweeks.forEach((matchweek) => {
        updateUserPoints(user, seasonID, matchweek);
      });
    });
    await user.save();
  }

  return user;
};

exports.updateUsersPoints = async (usersToUpdate) => {
  const users = {};
  usersToUpdate.forEach(({ userID, seasonID, matchweek }) => {
    if (!users[userID]) {
      users[userID] = { userID, seasons: { [seasonID]: [matchweek] } };
    } else if (users[userID] && !users[userID].seasons[seasonID]) {
      users[userID].seasons[seasonID] = [matchweek];
    } else if (
      users[userID] &&
      users[userID].seasons[seasonID] &&
      !users[userID].seasons[seasonID].includes(matchweek)
    ) {
      users[userID].seasons[seasonID].push(matchweek);
    }
  });
  await Promise.all(Object.values(users).map(updateUserTotals));
};
