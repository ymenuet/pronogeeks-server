const {
    Schema,
    model
} = require('mongoose')

const {
    SEASON_REF,
    TEAM_REF
} = require('./refs')

const TeamSchema = new Schema({
    name: String,
    code: String,
    stadium: String,
    country: String,
    logo: String,
    apiTeamID: String,
    season: {
        type: Schema.Types.ObjectId,
        ref: SEASON_REF
    },
    rank: Number,
    points: Number,
    goalsDiff: Number,
    matchsPlayed: Number,
    win: Number,
    draw: Number,
    lose: Number,
    goalsFor: Number,
    goalsAgainst: Number
}, {
    timestamps: true
})

module.exports = model(TEAM_REF, TeamSchema)