const {
    Schema,
    model
} = require('mongoose')

const {
    LIST_OF_ALL_SEASON_STATUSES,
    LIST_OF_ALL_SEASON_TYPES
} = require('./enums/season')

const SeasonSchema = new Schema({
    leagueName: String,
    type: {
        type: String,
        enum: LIST_OF_ALL_SEASON_TYPES,
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
        enum: LIST_OF_ALL_SEASON_STATUSES,
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