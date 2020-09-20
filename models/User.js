const {
    Schema,
    model
} = require('mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true
    },
    password: String,
    googleID: String,
    facebookID: String,
    role: {
        type: String,
        enum: ['SUPER GEEK', 'GEEK'],
        default: 'GEEK'
    },
    photo: {
        type: String,
        default: 'https://res.cloudinary.com/dlyw9xi3k/image/upload/v1600628381/Pronogeeks/default-profile-pic.png'
    },
    geekLeagues: [{
        type: Schema.Types.ObjectId,
        ref: 'GeekLeague'
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    seasons: [{
        season: {
            type: Schema.Types.ObjectId,
            ref: 'Season'
        },
        totalPoints: {
            type: Number,
            default: 0
        },
        provisionalRanking: [{
            type: Schema.Types.ObjectId,
            ref: 'Team'
        }],
        favTeam: {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        },
        pronogeeks: [{
            type: Schema.Types.ObjectId,
            ref: 'Pronogeek'
        }]
    }]
}, {
    timestamps: true
});

module.exports = model('User', UserSchema);