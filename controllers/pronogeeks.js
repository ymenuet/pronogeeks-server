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

exports.getMatchweekPronos = async(req, res) => {
    const {
        geekID,
        seasonID,
        matchweekNumber
    } = req.params
    const pronogeeks = await Pronogeek.find({
        geek: geekID,
        season: seasonID,
        matchweek: matchweekNumber
    })
    res.status(200).json({
        pronogeeks
    })
}

exports.saveProno = async(req, res) => {
    const {
        fixtureID
    } = req.params

    let {
        homeProno,
        awayProno
    } = req.body

    const {
        pronogeek,
        isNew
    } = await saveOneProno({
        req,
        res,
        fixtureID,
        homeProno,
        awayProno
    })

    if (isNew) {
        const user = await User.findOne({
            _id: req.user._id
        })
        let seasonIndex
        user.seasons.forEach((season, i) => {
            if (`${season.season}` === `${pronogeek.season}`) seasonIndex = i
        })
        if (seasonIndex >= 0) {
            let matchweekIndex
            user.seasons[seasonIndex].matchweeks.forEach((matchweek, i) => {
                if (matchweek.number === pronogeek.matchweek) matchweekIndex = i
            })
            if (matchweekIndex >= 0) {
                user.seasons[seasonIndex].matchweeks[matchweekIndex].pronogeeks.push(pronogeek._id)
            } else {
                const newMatchweek = {
                    pronogeeks: [pronogeek._id],
                    number: pronogeek.matchweek,
                    points: 0,
                    numberCorrects: 0,
                    numberExacts: 0,
                    bonusFavTeam: false,
                    bonusPoints: 0,
                    totalPoints: 0
                }
                user.seasons[seasonIndex].matchweeks.push(newMatchweek)
            }
        }
        await user.save()
    }

    res.status(201).json({
        pronogeek
    })
}

exports.saveMatchweekPronos = async(req, res) => {
    const {
        seasonID,
        matchweekNumber
    } = req.params
    const {
        pronogeeksToSave
    } = req.body

    const pronogeeksToAddToUserProfile = []

    const pronogeeks = await Promise.all(pronogeeksToSave.map(async({
        fixture: fixtureID,
        homeProno,
        awayProno
    }) => {
        const {
            pronogeek,
            isNew
        } = await saveOneProno({
            req,
            res,
            fixtureID,
            homeProno,
            awayProno
        })

        const pronoID = pronogeek._id.toString()
        if (isNew && !pronogeeksToAddToUserProfile.includes(pronoID)) pronogeeksToAddToUserProfile.push(pronoID)

        return pronogeek
    }))

    if (pronogeeksToAddToUserProfile.length) {
        const user = await User.findOne({
            _id: req.user._id
        })

        let seasonIndex
        user.seasons.map((season, i) => {
            if (`${season.season}` === seasonID) seasonIndex = i
            return season
        })

        if (seasonIndex >= 0) {
            let matchweekIndex
            user.seasons[seasonIndex].matchweeks.map((matchweek, i) => {
                if (`${matchweek.number}` === matchweekNumber) matchweekIndex = i
                return matchweek
            })

            if (matchweekIndex >= 0) {
                user.seasons[seasonIndex].matchweeks[matchweekIndex].pronogeeks.push(...pronogeeksToAddToUserProfile)

            } else {
                const newMatchweek = {
                    pronogeeks: pronogeeksToAddToUserProfile,
                    number: matchweekNumber,
                    points: 0,
                    numberCorrects: 0,
                    numberExacts: 0,
                    bonusFavTeam: false,
                    bonusPoints: 0,
                    totalPoints: 0
                }
                user.seasons[seasonIndex].matchweeks.push(newMatchweek)
            }
        }
        await user.save()
    }

    res.status(200).json({
        pronogeeks
    })
}

async function saveOneProno({
    req,
    res,
    fixtureID,
    homeProno,
    awayProno
}) {
    homeProno = parseInt(homeProno)
    awayProno = parseInt(awayProno)

    const fixture = await Fixture.findById(fixtureID)
        .populate({
            path: 'homeTeam',
            model: 'Team'
        })
        .populate({
            path: 'awayTeam',
            model: 'Team'
        })

    const winner = homeProno > awayProno ? fixture.homeTeam.name :
        awayProno > homeProno ? fixture.awayTeam.name :
        awayProno === homeProno ? 'Draw' :
        null

    let pronogeek = await Pronogeek.findOne({
        fixture: fixtureID,
        geek: req.user._id
    })

    let isNew

    if (pronogeek) {
        isNew = false
        pronogeek.homeProno = homeProno
        pronogeek.awayProno = awayProno
        pronogeek.winner = winner

        await pronogeek.save().catch(err => res.status(500).json({
            message: {
                en: 'Error while saving the pronostics. Check if the values are numbers.',
                fr: 'Échec de la sauvegarde du pronostic. Vérifier que les valeurs à enregistrer sont bien des numéros.'
            }
        }))

    } else {
        isNew = true
        pronogeek = await Pronogeek.create({
            geek: req.user._id,
            season: fixture.season,
            matchweek: fixture.matchweek,
            fixture: fixtureID,
            homeProno,
            awayProno,
            winner,
            correct: false,
            exact: false,
            bonusFavTeam: false,
            points: 0,
            addedToProfile: false
        }).catch(err => res.status(500).json({
            message: {
                en: 'Error while saving the pronostics. Check if the values are numbers.',
                fr: 'Erreur lors de la sauvegarde du pronostic. Vérifier que les valeurs à enregistrer sont bien des numéros.'
            }
        }))
    }

    return {
        pronogeek,
        isNew
    }
}