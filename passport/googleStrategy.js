const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const googleConfig = {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "/auth/google/callback"
}

passport.use(new GoogleStrategy(googleConfig, async(accessToken, refreshToken, profile, done) => {
    const user = await User.findOne({
        googleID: profile.id
    })
    const userWithEmail = await User.findOne({
        email: profile.emails[0].value
    })
    if (!user && userWithEmail) return done(null, false, {
        message: {
            en: "Try logging in with Facebook or a local account",
            fr: 'Essaye de te connecter avec Facebook ou un compte local.'
        }
    })
    if (!user && !userWithEmail) {
        const user = await User.create({
            email: profile.emails[0].value,
            googleID: profile.id,
            image: profile.photos[0].value,
        })
        return done(null, user)
    }
    done(null, user)
}))