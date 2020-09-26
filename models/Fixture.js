const {
    Schema,
    model
} = require('mongoose')

const FixtureSchema = new Schema({
    season: {
        type: Schema.Types.ObjectId,
        ref: 'Season'
    },
    matchweek: {
        type: Number,
        required: true
    },
    apiFixtureID: String,
    date: Date,
    timeElapsed: {
        type: Number,
        default: null
    },
    homeTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    awayTeam: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    goalsHomeTeam: {
        type: Number,
        default: null
    },
    goalsAwayTeam: {
        type: Number,
        default: null
    },
    winner: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: 'Time To Be Defined'
    },
    statusShort: {
        type: String,
        default: 'TBD'
    },
    oddsWinHome: {
        type: Number,
        default: null
    },
    oddsDraw: {
        type: Number,
        default: null
    },
    oddsWinAway: {
        type: Number,
        default: null
    },
}, {
    timestamps: true
})

module.exports = model('Fixture', FixtureSchema)