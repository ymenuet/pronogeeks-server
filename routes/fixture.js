const express = require("express");
const router = express.Router();

const {
    catchErrors,
    ensureLogin,
    checkRole
} = require('../middlewares')

const {} = require('../controllers/fixture')


module.exports = router;