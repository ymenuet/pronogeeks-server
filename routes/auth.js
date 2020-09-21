const express = require("express");
const router = express.Router();

const {
    signupProcess,
    loginProcess,
    editProfileProcess,
    logout,
    getCurrentUser
} = require('../controllers/auth')

const {
    catchErrors,
    ensureLogin
} = require('../middlewares/index')

router.post("/login", catchErrors(loginProcess));

router.post("/signup", catchErrors(signupProcess));

router.get("/logout", ensureLogin, logout);

router.get('/currentuser', getCurrentUser)

router.put('/edit', ensureLogin, catchErrors(editProfileProcess))

module.exports = router;