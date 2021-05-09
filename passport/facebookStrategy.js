const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const {
    emailFormatter
} = require('../utils/helpers')

const facebookConfig = {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: `${process.env.URL}/auth/facebook/callback`,
    profileFields: ['id', 'email', 'name', 'photos']
}

passport.use(new FacebookStrategy(facebookConfig, async(accessToken, refreshToken, profile, done) => {
    const user = await User.findOne({
        facebookID: profile.id
    })
    const email = emailFormatter(profile.emails[0].value)
    const userWithEmail = await User.findOne({
        email
    })
    if (!user && userWithEmail) return done(null, false, {
        message: {
            en: "Try logging in with Google or a local account.",
            fr: 'Essaye de te connecter avec Google ou un compte local.'
        }
    })
    if (!user && !userWithEmail) {
        const name = profile.name.givenName
        let randomUsername = `${name}Geek${Math.floor(Math.random() * 999999)}`
        let userRandom = await User.findOne({
            username: randomUsername
        })
        while (userRandom) {
            randomUsername = `${name}Geek${Math.floor(Math.random() * 999999)}`
            userRandom = await User.findOne({
                username: randomUsername
            })
        }
        const user = await User.create({
            facebookID: profile.id,
            email,
            photo: profile.photos[0].value,
            username: randomUsername,
            confirmed: true
        })
        return done(null, user)
    }
    done(null, user)
}))