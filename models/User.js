const {
    Schema,
    model
} = require('mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    username: String,
    password: String,
    googleID: String,
    facebookID: String,
    confirmed: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['GEEK ADMIN', 'SUPER GEEK', 'GEEK'],
        default: 'GEEK'
    },
    photo: {
        type: String,
        default: 'https://res.cloudinary.com/dlyw9xi3k/image/upload/v1601160365/pronogeeks/default-profile-pic.jpg'
    },
    renewToken: String,
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
        matchweeks: [{
            pronogeeks: [{
                type: Schema.Types.ObjectId,
                ref: 'Pronogeek'
            }],
            number: Number,
            points: {
                type: Number,
                default: 0
            },
            numberCorrects: {
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
            },
        }]
    }]
}, {
    timestamps: true
});

module.exports = model('User', UserSchema);