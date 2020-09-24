const Fixture = require('../models/Fixture')

exports.getFixture = async(req, res) => {
    const fixture = await Fixture.findById(req.params.fixtureID)
        .populate({
            path: 'homeTeam',
            model: 'Team'
        })
        .populate({
            path: 'awayTeam',
            model: 'Team'
        })
    res.status(200).json({
        fixture
    })
}