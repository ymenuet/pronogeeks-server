const express = require("express");
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares')

const {} = require('../controllers/pronogeeks')

module.exports = router;