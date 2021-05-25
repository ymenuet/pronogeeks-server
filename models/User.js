const {
    Schema,
    model
} = require('mongoose');

const {
    USER_REF,
    GEEKLEAGUE_REF,
    TEAM_REF,
    SEASON_REF,
    PRONOGEEK_REF
} = require('./refs')

const {
    userRoles,
    LIST_OF_ALL_USER_ROLES
} = require('./enums/user')

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
        enum: LIST_OF_ALL_USER_ROLES,
        default: userRoles.GEEK
    },
    photo: {
        type: String,
        default: 'https://res.cloudinary.com/dlyw9xi3k/image/upload/v1601160365/pronogeeks/default-profile-pic.jpg'
    },
    confirmToken: {
        type: String,
        default: null
    },
    renewToken: {
        type: String,
        default: null
    },
    geekLeagues: [{
        type: Schema.Types.ObjectId,
        ref: GEEKLEAGUE_REF
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: USER_REF
    }],
    seasons: [{
        season: {
            type: Schema.Types.ObjectId,
            ref: SEASON_REF
        },
        totalPoints: {
            type: Number,
            default: 0
        },
        initialPoints: {
            type: Number,
            default: 0
        },
        numberCorrects: {
            type: Number,
            default: 0
        },
        initialNumberCorrects: {
            type: Number,
            default: 0
        },
        numberExacts: {
            type: Number,
            default: 0
        },
        initialNumberExacts: {
            type: Number,
            default: 0
        },
        bonusFavTeam: {
            type: Number,
            default: 0
        },
        initialBonusFavTeam: {
            type: Number,
            default: 0
        },
        provisionalRanking: [{
            type: Schema.Types.ObjectId,
            ref: TEAM_REF
        }],
        provRankingPointsDetails: {
            withoutBonus: {
                type: Number,
                default: 0
            },
            comboBonus: {
                type: Number,
                default: 0
            },
            favTeamBonus: {
                type: Number,
                default: 0
            },
            total: {
                type: Number,
                default: 0
            },
            addedToProfile: {
                type: Boolean,
                default: false
            },
        },
        provRankingTotalPoints: {
            type: Number,
            default: 0
        },
        pointsWithoutProvRanking: {
            type: Number,
            default: 0
        },
        favTeam: {
            type: Schema.Types.ObjectId,
            ref: TEAM_REF
        },
        matchweeks: [{
            pronogeeks: [{
                type: Schema.Types.ObjectId,
                ref: PRONOGEEK_REF
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
            numberExacts: {
                type: Number,
                default: 0
            },
            bonusFavTeam: {
                type: Boolean,
                default: false
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

module.exports = model(USER_REF, UserSchema);