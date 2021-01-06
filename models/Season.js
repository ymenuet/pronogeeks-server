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
    startDate: Date,
    endDate: Date,
    country: String,
    countryCode: String,
    logo: String,
    flag: String,
    provRankingOpen: {
        type: Boolean,
        default: true
    },
    fixtures: [{
        type: Schema.Types.ObjectId,
        ref: 'Fixture'
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