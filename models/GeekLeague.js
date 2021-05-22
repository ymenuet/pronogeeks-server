const {
    Schema,
    model
} = require('mongoose')

const {
    USER_REF,
    SEASON_REF,
    GEEKLEAGUE_REF
} = require('./refs')

const GeekLeagueSchema = new Schema({
    name: String,
    creator: {
        type: Schema.Types.ObjectId,
        ref: USER_REF
    },
    geeks: [{
        type: Schema.Types.ObjectId,
        ref: USER_REF
    }],
    season: {
        type: Schema.Types.ObjectId,
        ref: SEASON_REF
    }
}, {
    timestamps: true
})

module.exports = model(GEEKLEAGUE_REF, GeekLeagueSchema)