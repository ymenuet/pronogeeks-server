const express = require("express");
const router = express.Router();

const {
    catchErrors,
    ensureLogin,
} = require('../middlewares')

const {
    getFixture
} = require('../controllers/fixture')

router.get('/:fixtureID', ensureLogin, catchErrors(getFixture))

module.exports = router;