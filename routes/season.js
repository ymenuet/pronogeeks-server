const express = require('express');
const router = express.Router();

const {
    createSeason,
    updateSeason,
    getSeason,
    getSeasons,
    getSeasonsByCountry,
    deleteSeason
} = require('../controllers/season')

const {
    ensureLogin,
    checkRole,
    catchErrors
} = require('../middlewares/index')

router.get('/', catchErrors(getSeasons))

router.get('/country/:countryCode', catchErrors(getSeasonsByCountry))

router.get('/:seasonID', catchErrors(getSeason))

router.post('/', ensureLogin, checkRole('SUPER GEEK'), catchErrors(createSeason))

router.put('/:seasonID', ensureLogin, checkRole('SUPER GEEK'), catchErrors(updateSeason))

router.delete('/:seasonID', ensureLogin, checkRole('SUPER GEEK'), catchErrors(deleteSeason))

module.exports = router;