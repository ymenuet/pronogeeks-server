const express = require("express");
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares')

const {
    newLeagueProcess,
    getLeague,
    getMatchweekRanking,
    getUserLeagues,
    editLeague,
    deleteLeague,
    outLeague
} = require('../controllers/geekLeague')

router.post('/', ensureLogin, catchErrors(newLeagueProcess))

router.get('/:geekLeagueID', ensureLogin, catchErrors(getLeague))

router.get('/ranking/:geekLeagueID/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, catchErrors(getMatchweekRanking))

router.get('/', ensureLogin, catchErrors(getUserLeagues))

router.get('/out/:geekLeagueID', ensureLogin, catchErrors(outLeague))

router.put('/:geekLeagueID', ensureLogin, catchErrors(editLeague))

router.delete('/:geekLeagueID', ensureLogin, catchErrors(deleteLeague))

module.exports = router;