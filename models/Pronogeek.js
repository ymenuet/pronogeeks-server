const {
    Schema,
    model
} = require('mongoose')

const {
    USER_REF,
    SEASON_REF,
    FIXTURE_REF,
    PRONOGEEK_REF
} = require('./refs')

const PronogeekSchema = new Schema({
    geek: {
        type: Schema.Types.ObjectId,
        ref: USER_REF
    },
    matchweek: Number,
    season: {
        type: Schema.Types.ObjectId,
        ref: SEASON_REF
    },
    fixture: {
        type: Schema.Types.ObjectId,
        ref: FIXTURE_REF
    },
    homeProno: {
        type: Number,
        default: null
    },
    awayProno: {
        type: Number,
        default: null
    },
    winner: String,
    correct: {
        type: Boolean,
        default: false
    },
    exact: {
        type: Boolean,
        default: false
    },
    bonusFavTeam: {
        type: Boolean,
        default: false
    },
    points: {
        type: Number,
        default: 0
    },
    addedToProfile: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = model(PRONOGEEK_REF, PronogeekSchema)