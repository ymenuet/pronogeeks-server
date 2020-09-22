const Season = require('../models/Season')

exports.getSeasons = async(req, res) => {
    const seasons = await Season.find()
    res.status(200).json({
        seasons
    })
}

exports.getSeasonsByCountry = async(req, res) => {
    const seasons = await Season.find({
        countryCode: req.params.countryCode
    })
    res.status(200).json({
        seasons
    })
}

exports.getSeason = async(req, res) => {
    const season = await Season.findById(req.params.seasonID)
    res.status(200).json({
        season
    })
}

exports.createSeason = async(req, res) => {
    const season = await Season.create(req.body)
    res.status(200).json({
        season
    })
}

exports.updateSeason = async(req, res) => {
    const season = await Season.findByIdAndUpdate(req.params.seasonID, req.body, {
        new: true
    })
    res.status(200).json({
        season
    })
}

exports.deleteSeason = async(req, res) => {
    await Season.findByIdAndDelete(req.params.seasonID)
    res.status(200).json({
        message: 'Season deleted'
    })
}