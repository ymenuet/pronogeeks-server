const express = require('express');
const router = express.Router();

const {
    createSeason,
    closeRankingsSeason,
    getSeason,
    getUndergoingSeasons,
    getMatchweek,
    getSeasons,
    getSeasonsByCountry,
    deleteSeason
} = require('../controllers/season')

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

router.get('/', catchErrors(getSeasons))

router.get('/current', catchErrors(getUndergoingSeasons))

router.get('/country/:countryCode', catchErrors(getSeasonsByCountry))

router.get('/:seasonID', catchErrors(getSeason))

router.get('/:seasonID/:matchweekNumber', catchErrors(getMatchweek))

router.post('/', ensureLogin, checkRole(['GEEK ADMIN']), catchErrors(createSeason))

router.put('/closeRankings/:seasonID', ensureLogin, catchErrors(closeRankingsSeason))

router.delete('/:seasonID', ensureLogin, checkRole(['GEEK ADMIN']), catchErrors(deleteSeason))

module.exports = router;