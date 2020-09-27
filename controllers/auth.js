const passport = require('passport');
const User = require("../models/User");
const Season = require("../models/Season");

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
        message: {
            en: "Please indicate correct email, username and password",
            fr: `Merci de compléter les champs du pseudo, de l'email et du mot de passe.`
        }
    })

    if (!photo) photo = 'https://res.cloudinary.com/dlyw9xi3k/image/upload/v1601160365/pronogeeks/default-profile-pic.jpg'

    const user = await User.findOne({
        email
    })

    if (user) return res.status(401).json({
        message: {
            en: 'Something went wrong. Try again with another email.',
            fr: `Échec lors de la création du compte. Essaye peut-être avec un autre email.`
        }
    })

    const usernameExists = await User.findOne({
        username
    })

    if (usernameExists) return res.status(401).json({
        message: {
            en: "Please indicate a unique username.",
            fr: "Ce pseudo est déjà utilisé, trouves-en un plus original !"
        }
    })

    const hashPass = hashSync(password, genSaltSync(bcryptSalt));

    await User.create({
        email,
        username,
        photo,
        password: hashPass,
        geekLeagues: [],
        friends: [],
        seasons: []
    }).catch(err => res.status(500).json({
        message: {
            en: 'Something went wrong on the server side.',
            fr: `Il y a eu un problème du côté du server.`
        }
    }))

    res.status(200).json({
        message: {
            en: 'User created successfully.',
            fr: `Nouvel utilisateur créé.`
        }
    })

}

exports.loginProcess = async(req, res, next) => {
    passport.authenticate('local', (err, user, failureDetails) => {
        if (err) return res.status(500).json({
            message: {
                en: 'Something went wrong with the authentication.',
                fr: `Il y a eu un problème lors de l'authentification.`
            }
        })

        if (!user) return res.status(401).json(failureDetails)

        req.login(user, err => {
            if (err) return res.status(500).json({
                message: {
                    en: 'Session save went bad.',
                    fr: 'La sauvegarde de la session a échoué.'
                }
            })
            user.password = undefined
            res.status(200).json(user)
        })
    })(req, res, next)
}

exports.logout = (req, res) => {
    req.logout()
    res.status(200).json({
        message: {
            en: 'User logged out.',
            fr: 'Utilisateur déconnecté.'
        }
    })
}

exports.getCurrentUser = (req, res) => {
    res.status(200).json({
        user: req.user
    })
}

exports.editProfileProcess = async(req, res) => {
    const {
        username,
    } = req.body
    if (!username) return res.status(401).json({
        message: {
            en: "Please indicate a username",
            fr: "Tu ne peux pas sauvegarder ton profil sans pseudo."
        }
    })
    const existingUsername = User.findOne({
        username
    })
    if (existingUsername) return res.status(401).json({
        message: {
            en: "Please indicate a unique username",
            fr: "Ce pseudo est déjà utilisé, trouves-en un autre !"
        }
    })
    const user = await User.findByIdAndUpdate(req.user._id, {
            username,
        }, {
            new: true
        })
        .populate({
            path: 'friends',
            model: 'User'
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'season',
                model: 'Season'
            }
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'matchweeks',
                populate: {
                    path: 'pronogeeks',
                    model: 'Pronogeek'
                }
            }
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'provisionalRanking',
                model: 'Team'
            }
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'favTeam',
                model: 'Team'
            }
        })
        .catch(err => {
            res.status(500).json({
                message: {
                    en: 'Something went wrong in the server.',
                    fr: `Il y a eu un problème du côté du server.`
                }
            });
        })
    user.password = undefined
    res.status(200).json({
        user
    })
}

exports.editPhoto = async(req, res) => {
    const {
        photo
    } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, {
            photo,
        }, {
            new: true
        })
        .catch(err => {
            res.status(500).json({
                message: {
                    en: 'Something went wrong in the server.',
                    fr: `Il y a eu un problème du côté du server.`
                }
            });
        })
    user.password = undefined
    res.status(200).json({
        user
    })
}