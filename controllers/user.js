const User = require('../models/User')
const Season = require('../models/Season')
const Pronogeek = require('../models/Pronogeek')

exports.getUsers = async(req, res) => {
    const users = await User.find(null, null, {
        sort: {
            username: 1
        }
    })
    users.forEach(user => user.password = undefined)
    res.status(200).json({
        users
    })
}

exports.getUser = async(req, res) => {
    const user = await User.findById(req.params.userID)
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
    if (user) user.password = undefined
    res.status(200).json({
        user
    })
}

exports.getSeason = async(req, res) => {
    const {
        seasonID
    } = req.params
    const season = await Season.findById(seasonID)
    const teams = season.rankedTeams
    const user = await User.findOne({
        _id: req.user._id
    })
    let seasonExists = user.seasons.filter(seas => seas.season.toString() === seasonID)
    if (seasonExists.length > 0) {
        seasonExists = seasonExists[0]
        if (!seasonExists.favTeam) return res.status(200).json({
            newSeason: true
        })
        else return res.status(200).json({
            newSeason: false
        })
    } else if (seasonExists.length < 1) {
        const newSeason = {
            season: seasonID,
            totalPoints: 0,
            provisionalRanking: teams,
            matchweeks: []
        }
        user.seasons.push(newSeason)
        user.save()
        return res.status(200).json({
            newSeason: true
        })
    }
}

exports.getMatchweek = async(req, res) => {
    const {
        seasonID,
        matchweekNumber
    } = req.params

    const user = await User.findOne({
        _id: req.user._id
    })
    let index;
    const season = user.seasons.filter((seas, i) => {
        if (seas.season.toString() === seasonID) {
            index = i
            return true
        } else return false
    })
    if (season.length < 1) return res.status(404).json({
        message: {
            en: 'Season not found on this profile.',
            fr: 'Saison introuvable sur ce profil.'
        }
    })
    else {
        let matchweekExists = season[0].matchweeks.filter(matchweek => matchweek.number.toString() === matchweekNumber)
        if (matchweekExists.length > 0) {
            matchweekExists = matchweekExists[0]
            return res.status(200).json({
                matchweek: matchweekExists
            })
        } else if (matchweekExists.length < 1) {
            const newMatchweek = {
                pronogeeks: [],
                number: matchweekNumber,
                points: 0,
                bonusPoints: 0,
                totalPoints: 0
            }
            user.seasons[index].matchweeks.push(newMatchweek)
            user.save()
            return res.status(200).json({
                matchweek: newMatchweek
            })
        }
    }
}

exports.getPlayersSeason = async(req, res) => {
    const {
        seasonID
    } = req.params
    const users = await User.find({
        seasons: {
            $elemMatch: {
                season: seasonID
            }
        }
    })
    users.forEach(user => user.password = undefined)
    res.status(200).json({
        users
    })
}

exports.saveFavTeam = async(req, res) => {
    const {
        seasonID
    } = req.params
    const {
        favTeam
    } = req.body
    const user = await User.findOne({
        _id: req.user._id
    })
    let seasonIndex;
    user.seasons.forEach((seas, i) => {
        if (seas.season.toString() === seasonID) {
            seasonIndex = i
        }
    })
    user.seasons[seasonIndex].favTeam = favTeam
    user.save()
    res.status(200).json({
        message: {
            en: 'Favorite team saved.',
            fr: 'Équipe de coeur enregistrée.'
        }
    })
}

exports.confirmUser = async(req, res) => {
    await User.findByIdAndUpdate(req.params.userID, {
        confirmed: true
    })
    res.status(200).json({
        message: {
            en: 'Email confirmed.',
            fr: 'Email confirmé.'
        }
    })
}

exports.deleteUserAccount = async(req, res) => {
    const {
        userID
    } = req.params
    await User.findByIdAndDelete(userID)
    const pronogeeksUser = await Pronogeek.find({
        geek: userID
    })
    pronogeeksUser.forEach(pronogeek => pronogeek.deleteOne())
    res.status(200).json({
        message: {
            en: 'User deleted.',
            fr: 'Compte supprimé.'
        }
    })
}