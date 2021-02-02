const express = require("express");
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares')

const {
    getProno,
    getMatchweekPronos,
    saveProno,
    saveMatchweekPronos
} = require('../controllers/pronogeeks')

router.get('/:fixtureID', ensureLogin, catchErrors(getProno))

router.get('/geek/:geekID/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, catchErrors(getMatchweekPronos))

router.put('/season/:seasonID/matchweek/:matchweekNumber', ensureLogin, catchErrors(saveMatchweekPronos))

router.put('/:fixtureID', ensureLogin, catchErrors(saveProno))

module.exports = router;