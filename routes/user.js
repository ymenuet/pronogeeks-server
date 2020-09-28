const express = require('express');
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares/index')

const {
    getSeason,
    getMatchweek,
    getPlayersSeason,
    saveFavTeam
} = require('../controllers/user')

router.get('/players/:seasonID', ensureLogin, catchErrors(getPlayersSeason))

router.get('/:seasonID', ensureLogin, catchErrors(getSeason))

router.get('/:seasonID/:matchweekNumber', ensureLogin, catchErrors(getMatchweek))

router.put('/:seasonID/favTeam', ensureLogin, catchErrors(saveFavTeam))

module.exports = router;