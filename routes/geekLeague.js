const express = require("express");
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares')

const {
    newLeagueProcess
} = require('../controllers/geekLeague')

router.post('/', ensureLogin, catchErrors(newLeagueProcess))

module.exports = router;