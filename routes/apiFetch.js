const express = require('express');
const router = express.Router();

const {
    fetchAllSeasonTeamsFromApi,
    fetchSeasonRankingFromApi,
    fetchAllSeasonFixturesFromApi,
    fetchNextMatchweekOddsFromApi
} = require('../controllers/apiFetch')

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

//=============TEAMS=================

router.get('/fetch/teams/season/:seasonID', ensureLogin, checkRole('SUPER GEEK'), catchErrors(fetchAllSeasonTeamsFromApi))

router.get('/fetch/ranking/season/:seasonID', ensureLogin, checkRole('SUPER GEEK'), catchErrors(fetchSeasonRankingFromApi))


//============FIXTURES===============

router.get('/fetch/fixtures/season/:seasonID', ensureLogin, checkRole('SUPER GEEK'), catchErrors(fetchAllSeasonFixturesFromApi))


//===========FIXTURE ODDS============

router.get('/fetch/odds/season/:seasonID', ensureLogin, checkRole('SUPER GEEK'), catchErrors(fetchNextMatchweekOddsFromApi))

module.exports = router;