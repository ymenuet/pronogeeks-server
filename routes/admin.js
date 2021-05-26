const express = require('express');
const router = express.Router();

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index');

const {
    userRoles
} = require('../models/enums/user');

const {
    addSeason
} = require('../controllers/admin')

router.post('/season/:leagueIdAPI', ensureLogin, checkRole([userRoles.GEEK_ADMIN]), catchErrors(addSeason))

module.exports = router