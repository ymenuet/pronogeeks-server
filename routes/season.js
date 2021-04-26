const express = require('express');
const router = express.Router();

const {
    createSeason,
    closeSeason,
    closeRankingsSeason,
    getSeason,
    getUndergoingSeasons,
    deleteSeason
} = require('../controllers/season')

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

router.get('/current', catchErrors(getUndergoingSeasons))

router.get('/closeSeason/:seasonID', checkRole(['GEEK ADMIN']), catchErrors(closeSeason))

router.get('/:seasonID', catchErrors(getSeason))

router.post('/', ensureLogin, checkRole(['GEEK ADMIN']), catchErrors(createSeason))

router.put('/closeRankings/:seasonID', ensureLogin, catchErrors(closeRankingsSeason))

router.delete('/:seasonID', ensureLogin, checkRole(['GEEK ADMIN']), catchErrors(deleteSeason))

module.exports = router;