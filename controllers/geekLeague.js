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
        .populate([{
            path: 'geeks',
            model: 'User',
            populate: [{
                path: 'seasons',
                populate: [{
                    path: 'matchweeks',
                    populate: {
                        path: 'pronogeeks',
                        model: 'Pronogeek'
                    }
                }, {
                    path: 'favTeam',
                    model: 'Team'
                }]
            }]
        }, {
            path: 'seasons',
            model: 'Season'
        }])
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
        .populate({
            path: 'geekLeagues',
            populate: {
                path: 'creator',
                model: 'User'
            }
        })
    res.status(200).json({
        geekLeagues: user.geekLeagues
    })
}

exports.editLeague = async(req, res) => {
    const {
        geekLeagueID
    } = req.params
    const {
        name,
        geeks
    } = req.body
    const editedGeekLeague = await GeekLeague.findOne({
        _id: geekLeagueID
    })
    if (editedGeekLeague.creator.toString() !== req.user._id.toString()) return res.status(304).json({
        message: {
            en: 'You are not authorized to modify that item.',
            fr: `Tu n'es pas autorisé à modifier cet élément.`
        }
    })
    editedGeekLeague.name = name ? name : editedGeekLeague.name
    editedGeekLeague.geeks = geeks ? [...editedGeekLeague.geeks, ...geeks] : editedGeekLeague.geeks
    const users = await User.find({
        _id: {
            $in: geeks
        }
    })
    await editedGeekLeague.save()
    users.forEach(user => {
        user.geekLeagues.push(geekLeagueID)
        user.save()
    })
    const geekLeague = await GeekLeague.findById(geekLeagueID)
        .populate({
            path: 'geeks',
            model: 'User'
        })
    res.status(200).json({
        geekLeague
    })
}

exports.deleteLeague = async(req, res) => {
    const {
        geekLeagueID
    } = req.params
    const geekLeague = await GeekLeague.findById(geekLeagueID)
    if (geekLeague.creator.toString() !== req.user._id.toString()) return res.status(304).json({
        message: {
            en: 'You are not authorized to delete that item.',
            fr: `Tu n'es pas autorisé à supprimer cet élément.`
        }
    })
    await GeekLeague.findByIdAndDelete(geekLeagueID)
    res.status(200).json({
        message: {
            en: 'Geek league deleted.',
            fr: `Ligue Geek supprimée.`
        }
    })
}

exports.outLeague = async(req, res) => {
    const {
        geekLeagueID
    } = req.params
    const userID = req.user._id
    const geekLeague = await GeekLeague.findOne({
        _id: geekLeagueID
    })
    geekLeague.geeks = geekLeague.geeks.filter(geek => geek.toString() !== userID.toString())
    await geekLeague.save()
    const user = await User.findOne({
        _id: userID
    })
    user.geekLeagues = user.geekLeagues.filter(league => league.toString() !== geekLeagueID.toString())
    await user.save()
    res.status(200).json({
        message: {
            en: 'Geek removed from geek league.',
            fr: `Le geek a été retiré de la ligue.`
        }
    })
}