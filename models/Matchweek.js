const {
    Schema,
    model
} = require('mongoose')

const MatchweekSchema = new Schema({
    season: {
        type: Schema.Types.ObjectId,
        ref: 'Season'
    },
    number: {
        type: Number,
        min: 1
    },
    startDate: Date,
    endDate: Date,
    status: {
        type: String,
        enum: ['upcoming', 'underway', 'ended'],
        default: 'upcoming'
    },
    fixtures: [{
        type: Schema.Types.ObjectId,
        ref: 'Fixture'
    }]
}, {
    timestamps: true
})

module.exports = model('Matchweek', MatchweekSchema)