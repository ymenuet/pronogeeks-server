const {
    Schema,
    model
} = require('mongoose')

const GeekLeagueSchema = new Schema({
    name: String,
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    geeks: [{
        geek: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        initialPoints: {
            type: Number,
            default: 0
        }
    }],
    seasons: [{
        season: {
            type: Schema.Types.ObjectId,
            ref: 'Season'
        },
        ranking: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }]
}, {
    timestamps: true
})

module.exports = model('GeekLeague', GeekLeagueSchema)