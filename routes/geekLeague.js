const express = require("express");
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares')

const {
    newLeagueProcess,
    getLeague,
    getUserLeagues
} = require('../controllers/geekLeague')

router.post('/', ensureLogin, catchErrors(newLeagueProcess))

router.get('/:geekLeagueID', ensureLogin, catchErrors(getLeague))

router.get('/', ensureLogin, catchErrors(getUserLeagues))

module.exports = router;