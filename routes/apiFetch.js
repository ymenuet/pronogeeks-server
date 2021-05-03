const express = require('express');
const router = express.Router();

const {
    fetchAllSeasonTeamsFromApi,
    fetchSeasonRankingFromApi,
    fetchSeasonMatchweekFixturesFromApi,
    fetchNextMatchweekOddsFromApi
} = require('../controllers/apiFetch')

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

const {
    userRoles
} = require('../models/enums/user')

//=============TEAMS=================

router.get('/teams/season/:seasonID', ensureLogin, checkRole([userRoles.GEEK_ADMIN]), catchErrors(fetchAllSeasonTeamsFromApi))

router.get('/ranking/season/:seasonID', ensureLogin, checkRole([userRoles.GEEK_ADMIN]), catchErrors(fetchSeasonRankingFromApi))


//============FIXTURES===============

router.get('/fixtures/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, checkRole([userRoles.GEEK_ADMIN, userRoles.SUPER_GEEK]), catchErrors(fetchSeasonMatchweekFixturesFromApi))


//===========FIXTURE ODDS============

router.get('/odds/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, checkRole([userRoles.GEEK_ADMIN, userRoles.SUPER_GEEK]), catchErrors(fetchNextMatchweekOddsFromApi))

module.exports = router;