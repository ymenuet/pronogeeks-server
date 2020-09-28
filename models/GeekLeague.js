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
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    seasons: [{
        type: Schema.Types.ObjectId,
        ref: 'Season'
    }]
}, {
    timestamps: true
})

module.exports = model('GeekLeague', GeekLeagueSchema)