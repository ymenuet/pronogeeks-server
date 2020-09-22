const passport = require('passport');
const User = require("../models/User");

// Bcrypt to encrypt passwords
const {
    genSaltSync,
    hashSync
} = require("bcryptjs");

const bcryptSalt = 12;

exports.signupProcess = async(req, res, next) => {
    const {
        email,
        username,
        password,
    } = req.body
    let photo = req.body.photo

    if (!username || !password || !email) return res.status(401).json({
        message: "Please indicate correct email, username and password"
    })

    if (!photo) photo = 'https://res.cloudinary.com/dlyw9xi3k/image/upload/v1600628381/Pronogeeks/default-profile-pic.png'

    const user = await User.findOne({
        email
    })

    if (user) return res.status(401).json({
        message: 'Something went wrong. Try again or try logging in directly.'
    })

    const usernameExists = await User.findOne({
        username
    })

    if (usernameExists) return res.status(401).json({
        message: 'This username already exists. Please choose another one.'
    })

    const hashPass = hashSync(password, genSaltSync(bcryptSalt));

    await User.create({
        email,
        username,
        photo,
        password: hashPass
    }).catch(err => res.status(500).json({
        message: 'Something went wrong'
    }))

    res.status(200).json({
        message: 'User created successfully'
    })

}

exports.loginProcess = async(req, res, next) => {
    passport.authenticate('local', (err, user, failureDetails) => {
        if (err) return res.status(500).json({
            message: 'Something went wrong with the authentication'
        })

        if (!user) return res.status(401).json(failureDetails)

        req.login(user, err => {
            if (err) return res.status(500).json({
                message: 'Session save went bad.'
            })
            user.password = undefined
            res.status(200).json({
                user
            })
        })
    })(req, res, next)
}

exports.logout = (req, res) => {
    req.logout()
    res.status(200).json({
        message: 'User logged out'
    })
}

exports.getCurrentUser = (req, res) => {
    res.status(200).json({
        user: req.user
    })
}

exports.editProfileProcess = async(req, res) => {
    const newProfile = req.body
    delete newProfile.role
    const user = await User.findByIdAndUpdate(req.user._id, newProfile, {
            new: true
        })
        // .populate({
        //     path: 'geekLeagues',
        //     model: 'GeekLeague'
        // })
        .populate({
            path: 'friends',
            model: 'User'
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'season',
                model: 'Season'
            },
            // populate: {
            //     path: 'provisionalRanking',
            //     model: 'Team'
            // },
            // populate: {
            //     path: 'favTeam',
            //     model: 'Team'
            // },
            // populate: {
            //     path: 'pronogeeks',
            //     model: 'Pronogeek'
            // },
        })
        .catch(err => {
            res.status(500).json({
                message: "Something went wrong"
            });
        })
    user.password = undefined
    res.status(200).json({
        user
    })
}