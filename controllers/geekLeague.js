const GeekLeague = require('../models/GeekLeague')
const Season = require('../models/Season')
const User = require('../models/User')

exports.newLeagueProcess = async(req, res) => {
    const {
        name,
        geeks
    } = req.body
    const creator = req.user._id
    const seasons = await Season.find({
        $or: [{
            status: 'upcoming'
        }, {
            status: 'underway'
        }]
    }, {
        _id: 1
    })
    const geekLeague = await GeekLeague.create({
        name,
        creator,
        seasons,
        geeks: [creator, ...geeks]
    })
    const users = await User.find({
        _id: {
            $in: [creator, ...geeks]
        }
    })
    users.forEach(user => {
        user.geekLeagues.push(geekLeague._id)
        user.save()
    })
    res.status(201).json({
        geekLeague
    })
}

exports.getLeague = async(req, res) => {
    const {
        geekLeagueID
    } = req.params
    const geekLeague = await GeekLeague.findById(geekLeagueID)
        .populate({
            path: 'geeks',
            model: 'User'
        })
        .populate({
            path: 'seasons',
            model: 'Season'
        })
    res.status(200).json({
        geekLeague
    })
}

exports.getUserLeagues = async(req, res) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: 'geekLeagues',
            model: 'GeekLeague'
        })
        .populate({
            path: 'geekLeagues',
            populate: {
                path: 'geeks',
                model: 'User'
            }
        })
    res.status(200).json({
        geekLeagues: user.geekLeagues
    })
}