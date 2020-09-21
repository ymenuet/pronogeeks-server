const Season = require('../models/Season')

exports.createSeason = async(req, res) => {
    const values = req.body
    const season = await Season.create(values)
    res.status(200).json(season)
}

exports.updateSeason = async(req, res) => {
    const values = req.body
    const season = await Season.findByIdAndUpdate(req.params.seasonID, values, {
        new: true
    })
    res.status(200).json(season)
}

exports.getSeason = async(req, res) => {
    const season = await Season.findById(req.params.seasonID)
    res.status(200).json(season)
}