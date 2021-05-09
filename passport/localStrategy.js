const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const {
    emailFormatter
} = require('../utils/helpers')


passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    (emailNotFormatted, password, done) => {
        const email = emailFormatter(emailNotFormatted)
        User.findOne({
                email
            })
            .then(foundUser => {
                if (!foundUser) {
                    done(null, false, {
                        message: 'Incorrect email'
                    });
                    return;
                }
                if (!bcrypt.compareSync(password, foundUser.password)) {
                    done(null, false, {
                        message: 'Incorrect password'
                    });
                    return;
                }

                done(null, foundUser);
            })
            .catch(err => done(err));
    }
));