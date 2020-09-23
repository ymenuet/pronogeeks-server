const express = require("express");
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares')

const {} = require('../controllers/geekLeague')

module.exports = router;