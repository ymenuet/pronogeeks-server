const express = require("express");
const router = express.Router();

const {
    signupProcess,
    loginProcess,
    editProfileProcess,
    logout,
    facebookLogin,
    facebookCallback,
    googleLogin,
    googleCallback,
    getCurrentUser,
    editPhoto
} = require('../controllers/auth')

const {
    catchErrors,
    ensureLogin
} = require('../middlewares/index')

router.post("/login", catchErrors(loginProcess));

router.post("/signup", catchErrors(signupProcess));

router.get("/logout", ensureLogin, logout);

router.get('/profile', ensureLogin, getCurrentUser)

router.get('/facebook', facebookLogin)
router.get('/facebook/callback', facebookCallback)

router.get('/google', googleLogin)
router.get('/google/callback', googleCallback)

router.put('/edit', ensureLogin, catchErrors(editProfileProcess))

router.put('/editPic', ensureLogin, catchErrors(editPhoto))

module.exports = router;