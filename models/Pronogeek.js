const {
    Schema,
    model
} = require('mongoose')

const PronogeekSchema = new Schema({
    geek: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    matchweek: Number,
    season: {
        type: Schema.Types.ObjectId,
        ref: 'Season'
    },
    fixture: {
        type: Schema.Types.ObjectId,
        ref: 'Fixture'
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
    points: {
        type: Number,
        default: 0
    },
    bonusPoints: {
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

module.exports = model('Pronogeek', PronogeekSchema)