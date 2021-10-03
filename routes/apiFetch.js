const express = require("express");
const router = express.Router();

const {
  fetchLeaguesByCountry,
  fetchFullSeasonInfoFromApi,
  fetchAllSeasonTeamsFromApi,
  fetchSeasonRankingFromApi,
  fetchSeasonMatchweekFixturesFromApi,
  fetchNextMatchweekOddsFromApi,
  fetchFixtureEvents,
} = require("../controllers/apiFetch");

const { ensureLogin, checkRole, catchErrors } = require("../middlewares/index");

const { userRoles } = require("../models/enums/user");

//============SEASONS================

router.get(
  "/leagues/country/:country",
  ensureLogin,
  checkRole([userRoles.GEEK_ADMIN]),
  catchErrors(fetchLeaguesByCountry)
);

router.get(
  "/season/:leagueID",
  ensureLogin,
  checkRole([userRoles.GEEK_ADMIN]),
  catchErrors(fetchFullSeasonInfoFromApi)
);

//=============TEAMS=================

router.get(
  "/teams/season/:seasonID",
  ensureLogin,
  checkRole([userRoles.GEEK_ADMIN]),
  catchErrors(fetchAllSeasonTeamsFromApi)
);

router.get(
  "/ranking/season/:seasonID",
  ensureLogin,
  checkRole([userRoles.GEEK_ADMIN]),
  catchErrors(fetchSeasonRankingFromApi)
);

//============FIXTURES===============

router.get(
  "/fixtures/season/:seasonID/matchweek/:matchweekNumber",
  ensureLogin,
  checkRole([userRoles.GEEK_ADMIN, userRoles.SUPER_GEEK]),
  catchErrors(fetchSeasonMatchweekFixturesFromApi)
);

router.get(
  "/fixture/:fixtureID/events",
  ensureLogin,
  checkRole([userRoles.GEEK_ADMIN, userRoles.SUPER_GEEK]),
  catchErrors(fetchFixtureEvents)
);

//===========FIXTURE ODDS============

router.get(
  "/odds/season/:seasonID/matchweek/:matchweekNumber",
  ensureLogin,
  checkRole([userRoles.GEEK_ADMIN, userRoles.SUPER_GEEK]),
  catchErrors(fetchNextMatchweekOddsFromApi)
);

module.exports = router;
