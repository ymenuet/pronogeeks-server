const Team = require('../models/Team')
const Season = require('../models/Season')
const Fixture = require('../models/Fixture')
const User = require('../models/User')
const Pronogeek = require('../models/Pronogeek')

exports.addSeason = async(req, res) => {
    const {
        leagueIdAPI
    } = req.params

    console.log(leagueIdAPI)
}