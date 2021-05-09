const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const {
    emailFormatter
} = require('../utils/helpers')

const googleConfig = {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "/auth/google/callback"
}

passport.use(new GoogleStrategy(googleConfig, async(accessToken, refreshToken, profile, done) => {
    const user = await User.findOne({
        googleID: profile.id
    })
    const email = emailFormatter(profile.emails[0].value)
    const userWithEmail = await User.findOne({
        email
    })
    if (!user && userWithEmail) return done(null, false, {
        message: {
            en: "Try logging in with Facebook or a local account.",
            fr: 'Essaye de te connecter avec Facebook ou un compte local.'
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
            email,
            googleID: profile.id,
            photo: profile.photos[0].value,
            username: randomUsername,
            confirmed: true
        })
        return done(null, user)
    }
    done(null, user)
}))