const {
    Schema,
    model
} = require('mongoose')

const TeamSchema = new Schema({
    name: String,
    code: String,
    stadium: String,
    country: String,
    logo: String,
    apiTeamID: String,
    season: {
        type: Schema.Types.ObjectId,
        ref: 'Season'
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

module.exports = model('Team', TeamSchema)