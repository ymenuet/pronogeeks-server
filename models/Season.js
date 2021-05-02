const {
    Schema,
    model
} = require('mongoose')

const {
    LIST_OF_ALL_SEASON_STATUSES,
    LIST_OF_ALL_SEASON_TYPES,
    seasonTypes,
    seasonStatuses
} = require('./enums/season')

const {
    FIXTURE_REF,
    TEAM_REF,
    SEASON_REF
} = require('./refs')

const SeasonSchema = new Schema({
    leagueName: String,
    type: {
        type: String,
        enum: LIST_OF_ALL_SEASON_TYPES,
        default: seasonTypes.LEAGUE
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
        ref: FIXTURE_REF
    }],
    status: {
        type: String,
        enum: LIST_OF_ALL_SEASON_STATUSES,
        default: seasonStatuses.UPCOMING
    },
    rankedTeams: [{
        type: Schema.Types.ObjectId,
        ref: TEAM_REF
    }]
}, {
    timestamps: true
})

module.exports = model(SEASON_REF, SeasonSchema)