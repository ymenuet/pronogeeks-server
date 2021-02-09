const express = require("express");
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares')

const {
    getMatchweekPronos,
    getGeekleagueFixturePronos,
    saveProno,
    saveMatchweekPronos
} = require('../controllers/pronogeeks')

router.get('/geek/:geekID/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, catchErrors(getMatchweekPronos))

router.get('/:geekleagueID/:fixtureID', ensureLogin, catchErrors(getGeekleagueFixturePronos))

router.put('/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, catchErrors(saveMatchweekPronos))

router.put('/:fixtureID', ensureLogin, catchErrors(saveProno))

module.exports = router;