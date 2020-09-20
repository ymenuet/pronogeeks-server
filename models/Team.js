const {
    Schema,
    model
} = require('mongoose')

const TeamSchema = new Schema({
    name: String,
    code: String,
    stadium: String,
    country: String,
    logo: String,
    apiTeamID: String,
    seasons: [{
        type: Schema.Types.ObjectId,
        ref: 'Season'
    }]
}, {
    timestamps: true
})

module.exports = model('Team', TeamSchema)