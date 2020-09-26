const User = require('../models/User')
const Season = require('../models/Season')

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
        return res.status(200).json({
            season: seasonExists
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
            season: newSeason
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