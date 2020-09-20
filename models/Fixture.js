const {
    Schema,
    model
} = require('mongoose')

const FixtureSchema = new Schema({
    matchweek: {
        type: Schema.Types.ObjectId,
        ref: 'Matchweek',
    },
    apiFixtureID: String,
    date: Date,
    homeTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    awayTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    score: {
        home: Number,
        away: Number
    },
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    status: {
        type: String,
        enum: ['upcoming', 'underway', 'ended'],
        default: 'upcoming'
    },
    odds: {
        winHome: Number,
        draw: Number,
        winAway: Number
    }
}, {
    timestamps: true
})

module.exports = model('Fixture', FixtureSchema)