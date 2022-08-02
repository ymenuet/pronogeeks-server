const express = require('express');
const router = express.Router();

const {
    createSeason,
    closeSeason,
    closeRankingsSeason,
    getSeasonMenuItem,
    getSeason,
    getUndergoingSeasons,
    getUpcomingAndUndergoingSeasons,
    deleteSeason
} = require('../controllers/season')

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index');

const {
    userRoles
} = require('../models/enums/user');

router.get('/current', catchErrors(getUndergoingSeasons))

router.get('/futureAndCurrent', catchErrors(getUpcomingAndUndergoingSeasons))

router.get('/closeSeason/:seasonID', checkRole([userRoles.GEEK_ADMIN]), catchErrors(closeSeason))

router.get('/menuItem', catchErrors(getSeasonMenuItem))

router.get('/:seasonID', catchErrors(getSeason))

router.post('/', ensureLogin, checkRole([userRoles.GEEK_ADMIN]), catchErrors(createSeason))

router.put('/closeRankings/:seasonID', ensureLogin, catchErrors(closeRankingsSeason))

router.delete('/:seasonID', ensureLogin, checkRole([userRoles.GEEK_ADMIN]), catchErrors(deleteSeason))

module.exports = router;