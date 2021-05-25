const express = require('express');
const router = express.Router();

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

const {
    getSeasonPlayers,
    saveFavTeam,
    getAllGeeks,
    getGeek,
    updateProvRanking,
    updateSeasonPoints,
} = require('../controllers/geek');

const {
    userRoles
} = require('../models/enums/user');

router.get('/', ensureLogin, catchErrors(getAllGeeks))

router.get('/players/:seasonID', ensureLogin, catchErrors(getSeasonPlayers))

router.get('/updatePoints/:seasonID', ensureLogin, checkRole([userRoles.GEEK_ADMIN]), catchErrors(updateSeasonPoints))

router.get('/:userID', catchErrors(getGeek))

router.put('/provisionalRanking/:seasonID', ensureLogin, catchErrors(updateProvRanking))

router.put('/favTeam/:seasonID', ensureLogin, catchErrors(saveFavTeam))

module.exports = router;