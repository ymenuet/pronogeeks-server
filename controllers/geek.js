const User = require('../models/User')
const Team = require('../models/Team')
const Season = require('../models/Season')
const {
    geekPopulator
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
        .populate(geekPopulator)
    if (geek) geek.password = undefined
    res.status(200).json({
        geek
    })
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
        .populate(geekPopulator)
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
        geekLeagueID
    } = req.params
    await User.findByIdAndUpdate(req.user._id, {
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

    let geekSeason = []

    if (geek.seasons.length) geekSeason = geek.seasons.filter(seas => seas.season.toString() === seasonID)

    if (geekSeason.length > 0 && geekSeason[0].favTeam) return res.status(304).json({
        message: {
            en: `The user already have a favorite team for this season. Not modified.`,
            fr: `L'utilisateur a déjà une équipe de coeur pour cette saison. Aucune modification faite.`
        }
    })

    const newSeason = {
        season: seasonID,
        favTeam: teamID,
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

    const favTeam = await Team.findById(teamID)
    const season = await Season.findById(seasonID)

    geekSeason = {
        ...newSeason,
        favTeam,
        season
    }

    return res.status(200).json({
        geekSeason
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