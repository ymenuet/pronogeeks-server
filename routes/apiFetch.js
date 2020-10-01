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

//=============TEAMS=================

router.get('/teams/season/:seasonID', ensureLogin, checkRole(['GEEK ADMIN']), catchErrors(fetchAllSeasonTeamsFromApi))

router.get('/ranking/season/:seasonID', ensureLogin, checkRole(['GEEK ADMIN']), catchErrors(fetchSeasonRankingFromApi))


//============FIXTURES===============

router.get('/fixtures/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, checkRole(['GEEK ADMIN', 'SUPER GEEK']), catchErrors(fetchSeasonMatchweekFixturesFromApi))


//===========FIXTURE ODDS============

router.get('/odds/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, checkRole(['GEEK ADMIN', 'SUPER GEEK']), catchErrors(fetchNextMatchweekOddsFromApi))

module.exports = router;