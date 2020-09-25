const Pronogeek = require('../models/Pronogeek')
const Fixture = require('../models/Fixture')
const User = require('../models/User')

exports.getProno = async(req, res) => {
    const pronogeek = await Pronogeek.findOne({
        fixture: req.params.fixtureID
    })
    res.status(200).json({
        pronogeek
    })
}

exports.newProno = async(req, res) => {
    const {
        homeProno,
        awayProno
    } = req.body
    const {
        fixtureID
    } = req.params
    console.log(fixtureID)
    const fixture = await Fixture.findById(fixtureID)
    const pronogeek = await Pronogeek.create({
        geek: req.user._id,
        season: fixture.season,
        matchweek: fixture.matchweek,
        fixture: fixtureID,
        homeProno,
        awayProno
    })
    const user = await User.findOne({
        _id: req.user._id
    })
    let seasonIndex = null
    user.seasons.forEach((season, i) => {
        if (season.season.toString() === fixture.season.toString()) seasonIndex = i
    })
    if (seasonIndex >= 0) user.seasons[seasonIndex].pronogeeks.push(pronogeek._id)
    user.save()
    res.status(201).json({
        pronogeek
    })
}

exports.saveProno = async(req, res) => {
    const {
        homeProno,
        awayProno
    } = req.body
    const pronogeek = await Pronogeek.findByIdAndUpdate(req.params.pronogeekID, {
        homeProno,
        awayProno
    }, {
        new: true
    })
    res.status(200).json({
        pronogeek
    })
}