const Pronogeek = require('../models/Pronogeek')
const Fixture = require('../models/Fixture')
const User = require('../models/User')

exports.getProno = async(req, res) => {
    const pronogeek = await Pronogeek.findOne({
        fixture: req.params.fixtureID,
        geek: req.user._id
    })
    res.status(200).json({
        pronogeek
    })
}

exports.newProno = async(req, res) => {
    let {
        homeProno,
        awayProno
    } = req.body
    homeProno = parseInt(homeProno)
    awayProno = parseInt(awayProno)
    const {
        fixtureID
    } = req.params
    const fixture = await Fixture.findById(fixtureID)
        .populate({
            path: 'homeTeam',
            model: 'Team'
        })
        .populate({
            path: 'awayTeam',
            model: 'Team'
        })
    const matchweekNumber = fixture.matchweek
    const winner = homeProno > awayProno ? fixture.homeTeam.name :
        awayProno > homeProno ? fixture.awayTeam.name :
        awayProno === homeProno ? 'Draw' :
        null
    const pronogeekExists = await Pronogeek.findOne({
        fixture: fixtureID,
        geek: req.user._id
    })
    if (pronogeekExists) return res.status(304).json({
        message: {
            en: 'Pronogeek already existing for this user. Creation aborted.',
            fr: 'Un pronogeek existe déjà pour cet utilisateur et cette rencontre. Création annulée.'
        }
    })
    else {
        const pronogeek = await Pronogeek.create({
            geek: req.user._id,
            season: fixture.season,
            matchweek: fixture.matchweek,
            fixture: fixtureID,
            homeProno,
            awayProno,
            winner
        }).catch(err => res.status(500).json({
            message: {
                en: 'Error while saving the pronostics. Check if the values are numbers.',
                fr: 'Erreur lors de la sauvegarde du pronostic. Vérifier que les valeurs à enregistrer sont bien des numéros.'
            }
        }))
        const user = await User.findOne({
            _id: req.user._id
        })
        let seasonIndex = null
        user.seasons.forEach((season, i) => {
            if (season.season.toString() === fixture.season.toString()) seasonIndex = i
        })
        if (seasonIndex >= 0) {
            let matchweekIndex = null
            user.seasons[seasonIndex].matchweeks.forEach((matchweek, i) => {
                if (matchweek.number === matchweekNumber) matchweekIndex = i
            })
            if (matchweekIndex >= 0) {
                user.seasons[seasonIndex].matchweeks[matchweekIndex].pronogeeks.push(pronogeek._id)
            }
        }
        user.save()
        res.status(201).json({
            pronogeek
        })
    }
}

exports.saveProno = async(req, res) => {
    let {
        homeProno,
        awayProno
    } = req.body
    homeProno = parseInt(homeProno)
    awayProno = parseInt(awayProno)
    const pronogeekWithTeams = await Pronogeek.findById(req.params.pronogeekID)
        .populate({
            path: 'fixture',
            model: 'Fixture',
            populate: {
                path: 'homeTeam',
                model: 'Team'
            }
        })
        .populate({
            path: 'fixture',
            model: 'Fixture',
            populate: {
                path: 'awayTeam',
                model: 'Team'
            }
        })
    const winner = homeProno > awayProno ? pronogeekWithTeams.fixture.homeTeam.name :
        awayProno > homeProno ? pronogeekWithTeams.fixture.awayTeam.name :
        awayProno === homeProno ? 'Draw' :
        null
    const pronogeek = await Pronogeek.findByIdAndUpdate(req.params.pronogeekID, {
        homeProno,
        awayProno,
        winner
    }, {
        new: true
    }).catch(err => res.status(500).json({
        message: {
            en: 'Error while saving the pronostics. Check if the values are numbers.',
            fr: 'Échec de la sauvegarde du pronostic. Vérifier que les valeurs à enregistrer sont bien des numéros.'
        }
    }))
    res.status(200).json({
        pronogeek
    })
}