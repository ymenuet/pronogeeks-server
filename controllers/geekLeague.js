const GeekLeague = require('../models/GeekLeague')
const User = require('../models/User')

const {
    geekleaguePopulator
} = require('../utils/populators')

exports.newLeagueProcess = async(req, res) => {
    const {
        name,
        geeks,
        season
    } = req.body
    const creator = req.user._id

    const geekleagueCreated = await GeekLeague.create({
        name,
        creator,
        season,
        geeks: [creator, ...geeks]
    })
    const leagueID = geekleagueCreated._id

    const users = await User.find({
        _id: {
            $in: geekleagueCreated.geeks
        }
    })

    await Promise.all(users.map(async user => {
        user.geekLeagues.push(leagueID)
        await user.save()
    }))

    const geekleague = await GeekLeague.findById(leagueID).populate(geekleaguePopulator)

    res.status(201).json({
        geekleague
    })
}

exports.getLeague = async(req, res) => {
    const {
        geekLeagueID
    } = req.params
    const geekleague = await GeekLeague.findById(geekLeagueID)
        .populate(geekleaguePopulator)

    if (!geekleague) return res.status(404).json({
        message: {
            en: `This league doesn't exist (anymore).`,
            fr: `Cette ligue n'existe pas ou plus.`
        }
    })

    res.status(200).json({
        geekleague
    })
}

exports.getUserLeagues = async(req, res) => {
    const userGeekleagues = await GeekLeague.find({
            geeks: {
                $in: req.user._id
            }
        })
        .populate(geekleaguePopulator)
    res.status(200).json({
        userGeekleagues
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

    const geekleague = await GeekLeague.findOne({
        _id: geekLeagueID
    })

    if (!geekleague) return res.status(404).json({
        message: {
            en: `This league doesn't exist (anymore).`,
            fr: `Cette ligue n'existe pas ou plus.`
        }
    })

    if (geekleague.creator.toString() !== req.user._id.toString()) return res.status(304).json({
        message: {
            en: 'You are not authorized to modify that item.',
            fr: `Tu n'es pas autorisé à modifier cet élément.`
        }
    })

    if (name) geekleague.name = name

    if (geeks && geeks.length) {
        const geeksWithoutDuplicata = geeks.filter(geek => !geekleague.geeks.includes(geek))

        geekleague.geeks = [...geekleague.geeks, ...geeksWithoutDuplicata]

        const users = await User.find({
            _id: {
                $in: geeksWithoutDuplicata
            }
        })
        await Promise.all(users.map(async user => {
            user.geekLeagues.push(geekLeagueID)
            await user.save()
        }))
    }

    await geekleague.save()

    const editedGeekleague = await GeekLeague.findById(geekLeagueID).populate(geekleaguePopulator)

    res.status(200).json({
        geekleague: editedGeekleague
    })
}

exports.deleteLeague = async(req, res) => {
    const {
        geekLeagueID
    } = req.params

    const geekLeague = await GeekLeague.findById(geekLeagueID)

    if (!geekLeague) return res.status(404).json({
        message: {
            en: `This league doesn't exist (anymore).`,
            fr: `Cette ligue n'existe pas ou plus.`
        }
    })

    if (geekLeague.creator.toString() !== req.user._id.toString()) return res.status(304).json({
        message: {
            en: 'You are not authorized to delete that item.',
            fr: `Tu n'es pas autorisé à supprimer cet élément.`
        }
    })

    const geeks = geekLeague.geeks

    await Promise.all(geeks.map(async geekID => {
        const geek = await User.findOne({
            _id: geekID
        })

        if (!geek) return

        geek.geekLeagues = geek.geekLeagues.filter(league => league.toString() !== geekLeagueID)
        await geek.save()
    }))

    const usersWithGeekLeagueInHistory = await User.find({
        geekLeagueHistory: geekLeagueID
    })

    await Promise.all(usersWithGeekLeagueInHistory.map(async user => {
        user.geekLeagueHistory = null
        await user.save()
    }))

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
    if (!geekLeague) return res.status(404).json({
        message: {
            en: `This league doesn't exist (anymore).`,
            fr: `Cette ligue n'existe pas ou plus.`
        }
    })
    geekLeague.geeks = geekLeague.geeks.filter(geek => geek.toString() !== userID.toString())
    await geekLeague.save()

    const user = await User.findOne({
        _id: userID
    })
    user.geekLeagues = user.geekLeagues.filter(league => league.toString() !== geekLeagueID.toString())
    if (`${user.geekLeagueHistory}` === `${geekLeagueID}`) user.geekLeagueHistory = null
    await user.save()

    res.status(200).json({
        message: {
            en: 'Geek removed from geek league.',
            fr: `Le geek a été retiré de la ligue.`
        }
    })
}