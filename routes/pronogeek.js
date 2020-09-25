const express = require("express");
const router = express.Router();

const {
    ensureLogin,
    catchErrors
} = require('../middlewares')

const {
    getProno,
    newProno,
    saveProno
} = require('../controllers/pronogeeks')

router.get('/:fixtureID', ensureLogin, catchErrors(getProno))

router.post('/:fixtureID', ensureLogin, catchErrors(newProno))

router.put('/:pronogeekID', ensureLogin, catchErrors(saveProno))

module.exports = router;