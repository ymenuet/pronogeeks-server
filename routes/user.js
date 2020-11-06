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
    saveFavTeam,
    getUsers,
    getUser,
    saveGeekLeagueHistory,
    confirmUser,
    deleteUserAccount
} = require('../controllers/user')

router.get('/users', ensureLogin, catchErrors(getUsers))

router.get('/geek/:userID', catchErrors(getUser))

router.get('/players/:seasonID', ensureLogin, catchErrors(getPlayersSeason))

router.get('/:seasonID', ensureLogin, catchErrors(getSeason))

router.get('/:seasonID/:matchweekNumber', ensureLogin, catchErrors(getMatchweek))

router.put('/geekLeagueHistory/:userID/:geekLeagueID', ensureLogin, catchErrors(saveGeekLeagueHistory))

router.put('/:seasonID/favTeam', ensureLogin, catchErrors(saveFavTeam))

router.put('/:userID/:confirmToken', catchErrors(confirmUser))

router.delete('/:userID', ensureLogin, catchErrors(deleteUserAccount))

module.exports = router;