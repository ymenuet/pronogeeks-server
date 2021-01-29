const User = require('../models/User')
const Team = require('../models/Team')
const Season = require('../models/Season')

const {
    seasonPopulator,
} = require('../populators')

exports.getAllGeeks = async(req, res) => {
    let geeks = await User.find(null, null, {
        sort: {
            username: 1
        }
    })
    geeks = geeks.map(geek => ({
        ...geek._doc,
        password: undefined
    }))
    res.status(200).json({
        geeks
    })
}

exports.getGeek = async(req, res) => {
    const geek = await User.findById(req.params.userID)
        .populate({
            path: 'seasons',
            populate: [{
                path: 'season',
                model: 'Season'
            }, {
                path: 'matchweeks',
                populate: {
                    path: 'pronogeeks',
                    model: 'Pronogeek'
                }
            }]
        })
    if (geek) geek.password = undefined
    res.status(200).json({
        geek
    })
}

exports.createGeekSeason = async(req, res) => {
    const {
        seasonID
    } = req.params

    const geek = await User.findOne({
        _id: req.user._id
    })

    let geekSeason = []

    if (geek.seasons.length) geekSeason = geek.seasons.filter(seas => seas.season.toString() === seasonID)

    if (geekSeason.length > 0) return res.status(304).json({
        message: {
            en: `This season already exists on the user's profile. Not modified.`,
            fr: `Cette saison existe déjà sur le profil de l'utilisateur. Aucune modification faite.`
        }
    })

    else {

        const newSeason = {
            season: seasonID,
            provisionalRanking: [],
            matchweeks: [],
            totalPoints: 0,
            initialPoints: 0,
            numberCorrects: 0,
            initialNumberCorrects: 0,
            numberExacts: 0,
            initialNumberExacts: 0,
            bonusFavTeam: 0,
            initialBonusFavTeam: 0,
        }
        geek.seasons.push(newSeason)
        await geek.save()

        populatedSeason = await Season.findById(seasonID).populate(seasonPopulator)

        geekSeason = {
            ...newSeason,
            season: populatedSeason
        }
    }

    return res.status(200).json({
        geekSeason
    })
}

// Modifier ce controller pour retourner la journée créée à l'action
exports.createGeekMatchweek = async(req, res) => {
    const {
        seasonID,
        matchweekNumber
    } = req.params

    const geek = await User.findOne({
        _id: req.user._id
    })

    let index;
    const season = geek.seasons.filter((seas, i) => {
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
            geek.seasons[index].matchweeks.push(newMatchweek)
            geek.save()
            return res.status(200).json({
                matchweek: newMatchweek
            })
        }
    }
}

exports.getSeasonPlayers = async(req, res) => {
    const {
        seasonID
    } = req.params
    let geeks = await User.find({
            seasons: {
                $elemMatch: {
                    season: seasonID
                }
            }
        })
        .populate({
            path: 'seasons',
            populate: {
                path: 'favTeam',
                model: 'Team'
            }
        })
    geeks = geeks.map(geek => ({
        ...geek._doc,
        password: undefined
    }))
    res.status(200).json({
        geeks
    })
}

exports.saveGeekLeagueHistory = async(req, res) => {
    const {
        userID,
        geekLeagueID
    } = req.params
    await User.findByIdAndUpdate(userID, {
        geekLeagueHistory: geekLeagueID
    })
    res.status(200).json({
        message: {
            en: 'User geekLeague history updated.',
            fr: `Historique ligue geek de l'utilisateur actualisé.`
        }
    })
}

exports.updateProvRanking = async(req, res) => {
    const {
        seasonID,
    } = req.params
    const {
        userProvRanking
    } = req.body
    const geek = await User.findOne({
        _id: req.user._id
    })
    let seasonIndex;
    geek.seasons.map((seas, i) => {
        if (seas.season.toString() === seasonID) {
            seasonIndex = i
        }
        return seas
    })
    geek.seasons[seasonIndex].provisionalRanking = userProvRanking
    await geek.save()
    res.status(200).json({
        message: {
            en: `Provisional ranking updated.`,
            fr: `Classement prévisionnel actualisé.`
        }
    })
}

exports.saveFavTeam = async(req, res) => {
    const {
        seasonID
    } = req.params
    const {
        teamID
    } = req.body
    const geek = await User.findOne({
        _id: req.user._id
    })
    let seasonIndex;
    geek.seasons.forEach((seas, i) => {
        if (seas.season.toString() === seasonID) {
            seasonIndex = i
        }
    })
    geek.seasons[seasonIndex].favTeam = teamID
    await geek.save()

    const userFavTeam = await Team.findById(teamID)

    res.status(200).json({
        userFavTeam
    })
}

exports.updateSeasonPoints = async(req, res) => {
    const {
        seasonID
    } = req.params
    const geeks = await User.find({
        seasons: {
            $elemMatch: {
                season: seasonID
            }
        }
    })
    await Promise.all(geeks.map(async geek => {
        let seasonIndex;
        geek.seasons.forEach((season, i) => {
            if (season.season._id.toString() == seasonID) seasonIndex = i
        })
        let seasonPoints = geek.seasons[seasonIndex].initialPoints || 0;
        let seasonCorrects = geek.seasons[seasonIndex].initialNumberCorrects || 0;
        let seasonExacts = geek.seasons[seasonIndex].initialNumberExacts || 0;
        let seasonBonusFavTeam = geek.seasons[seasonIndex].initialBonusFavTeam || 0;

        if (geek.seasons[seasonIndex].matchweeks && geek.seasons[seasonIndex].matchweeks.length > 0) {
            geek.seasons[seasonIndex].matchweeks.forEach(matchweek => {
                seasonPoints += matchweek.totalPoints
                seasonCorrects += matchweek.numberCorrects
                seasonExacts += matchweek.numberExacts
                seasonBonusFavTeam += matchweek.bonusFavTeam ? 1 : 0
            })
            geek.seasons[seasonIndex].totalPoints = seasonPoints
            geek.seasons[seasonIndex].numberCorrects = seasonCorrects
            geek.seasons[seasonIndex].numberExacts = seasonExacts
            geek.seasons[seasonIndex].bonusFavTeam = seasonBonusFavTeam

            await geek.save()
        }
    }))
    res.status(200).json({
        message: {
            en: `Points updated for season ${seasonID}.`,
            fr: `Points actualisés pour la saison ${seasonID}.`
        }
    })
}