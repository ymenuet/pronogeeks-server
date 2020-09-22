const express = require('express');
const router = express.Router();

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

const {} = require('../controllers/team')

module.exports = router;