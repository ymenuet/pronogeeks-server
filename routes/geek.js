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
    saveGeekLeagueHistory,
    updateProvRanking,
    updateSeasonPoints,
} = require('../controllers/geek')

router.get('/', ensureLogin, catchErrors(getAllGeeks))

router.get('/players/:seasonID', ensureLogin, catchErrors(getSeasonPlayers))

router.get('/updatePoints/:seasonID', ensureLogin, checkRole(['GEEK ADMIN']), catchErrors(updateSeasonPoints))

router.get('/:userID', catchErrors(getGeek))

router.put('/geekLeagueHistory/:geekLeagueID', ensureLogin, catchErrors(saveGeekLeagueHistory))

router.put('/provisionalRanking/:seasonID', ensureLogin, catchErrors(updateProvRanking))

router.put('/favTeam/:seasonID', ensureLogin, catchErrors(saveFavTeam))

module.exports = router;