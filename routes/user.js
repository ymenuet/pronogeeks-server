const express = require('express');
const router = express.Router();

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

const {
    getSeason,
    getMatchweek,
    getPlayersSeason,
    saveFavTeam,
    getUsers,
    getUser,
    saveGeekLeagueHistory,
    updateProvRanking,
    updateSeasonPoints,
} = require('../controllers/user')

router.get('/users', ensureLogin, catchErrors(getUsers))

router.get('/geek/:userID', catchErrors(getUser))

router.get('/players/:seasonID', ensureLogin, catchErrors(getPlayersSeason))

router.get('/updatePoints/:seasonID', ensureLogin, checkRole(['GEEK ADMIN']), catchErrors(updateSeasonPoints))

router.get('/:seasonID', ensureLogin, catchErrors(getSeason))

router.get('/:seasonID/:matchweekNumber', ensureLogin, catchErrors(getMatchweek))

router.put('/geekLeagueHistory/:userID/:geekLeagueID', ensureLogin, catchErrors(saveGeekLeagueHistory))

router.put('/provisionalRanking/:seasonID', ensureLogin, catchErrors(updateProvRanking))

router.put('/:seasonID/favTeam', ensureLogin, catchErrors(saveFavTeam))

module.exports = router;