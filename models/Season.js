const {
    Schema,
    model
} = require('mongoose')

const SeasonSchema = new Schema({
    leagueName: String,
    type: {
        type: String,
        enum: ['League'],
        default: 'League'
    },
    apiLeagueID: String,
    year: Number,
    country: String,
    logo: String,
    flag: String,
    matchweeks: [{
        type: Schema.Types.ObjectId,
        ref: 'Matchweek'
    }],
    status: {
        type: String,
        enum: ['upcoming', 'underway', 'ended'],
        default: 'upcoming'
    },
    rankedTeams: [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }]
}, {
    timestamps: true
})

module.exports = model('Season', SeasonSchema)