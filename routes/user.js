const express = require('express');
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares/index')

const {
    getSeason,
    getMatchweek,
    saveFavTeam
} = require('../controllers/user')

router.get('/:seasonID', ensureLogin, catchErrors(getSeason))

router.get('/:seasonID/:matchweekNumber', ensureLogin, catchErrors(getMatchweek))

router.put('/:seasonID/favTeam', ensureLogin, catchErrors(saveFavTeam))

module.exports = router;