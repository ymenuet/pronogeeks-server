const Season = require('../models/Season')

exports.getSeasons = async(req, res) => {
    const seasons = await Season.find(null, null, {
        sort: {
            startDate: -1
        }
    })
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
        .populate([{
            path: 'fixtures',
            model: 'Fixture',
            options: {
                sort: {
                    date: 1
                }
            },
            populate: [{
                path: 'awayTeam',
                model: 'Team'
            }, {
                path: 'homeTeam',
                model: 'Team'
            }]
        }, {
            path: 'rankedTeams',
            model: 'Team'
        }])
    res.status(200).json({
        season
    })
}

exports.getUndergoingSeasons = async(req, res) => {
    const seasons = await Season.find({
        status: 'underway'
    }, null, {
        sort: {
            startDate: -1
        }
    })
    res.status(200).json({
        seasons
    })
}

exports.getMatchweek = async(req, res) => {
    const season = await Season.findById(req.params.seasonID)
        .populate({
            path: 'fixtures',
            model: 'Fixture',
            options: {
                sort: {
                    date: 1
                }
            },
            populate: {
                path: 'awayTeam',
                model: 'Team'
            }
        })
        .populate({
            path: 'fixtures',
            populate: {
                path: 'homeTeam',
                model: 'Team'
            }
        })
    const fixtures = season.fixtures.filter(fixture => fixture.matchweek == req.params.matchweekNumber)
    res.status(200).json({
        fixtures
    })
}

exports.createSeason = async(req, res) => {
    const season = await Season.create(req.body)
    res.status(200).json({
        season
    })
}

exports.closeRankingsSeason = async(req, res) => {
    const season = await Season.findByIdAndUpdate(req.params.seasonID, {
        provRankingOpen: false
    }, {
        new: true
    })
    res.status(200).json({
        season
    })
}

exports.deleteSeason = async(req, res) => {
    await Season.findByIdAndDelete(req.params.seasonID)
    res.status(200).json({
        message: {
            en: 'Season deleted',
            fr: 'Saison supprimée'
        }
    })
}