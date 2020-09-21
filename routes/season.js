const express = require('express');
const router = express.Router();

const {
    createSeason,
    updateSeason,
    getSeason
} = require('../controllers/season')

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

router.post('/', ensureLogin, checkRole('SUPER GEEK'), catchErrors(createSeason))

router.put('/:seasonID', ensureLogin, checkRole('SUPER GEEK'), catchErrors(updateSeason))

router.get('/:seasonID', catchErrors(getSeason))

module.exports = router;