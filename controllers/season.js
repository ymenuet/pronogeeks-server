const Season = require('../models/Season')
const User = require('../models/User')

const {
    seasonStatuses
} = require('../models/enums/season')

const {
    provRankingBonusPoints
} = require('../utils/constants')

const {
    fetchAndSaveSeasonRanking
} = require('../utils/helpers')

const {
    seasonPopulator
} = require('../utils/populators')

exports.getSeason = async(req, res) => {
    const season = await Season.findById(req.params.seasonID)
        .populate(seasonPopulator)

    res.status(200).json({
        season
    })
}

exports.closeSeason = async(req, res) => {
    const {
        seasonID
    } = req.params

    await fetchAndSaveSeasonRanking(seasonID)

    const season = await Season.findById(seasonID)

    const seasonPlayers = await User.find({
        seasons: {
            $elemMatch: {
                season: seasonID
            }
        }
    })

    await Promise.all(seasonPlayers.map(saveProvRankingPoints(season)))

    await Season.findByIdAndUpdate(seasonID, {
        status: seasonStatuses.ENDED
    })

    res.status(200).json({
        message: {
            en: 'Season finished.',
            fr: 'Saison terminée.'
        }
    })
}

exports.getUndergoingSeasons = async(req, res) => {
    const seasons = await Season.find({
        status: seasonStatuses.UNDERWAY
    }, null, {
        sort: {
            startDate: -1
        }
    })
    res.status(200).json({
        seasons
    })
}

exports.createSeason = async(req, res) => {
    const season = await Season.create(req.body)
    res.status(200).json({
        season
    })
}

exports.closeRankingsSeason = async(req, res) => {
    const season = await Season.findByIdAndUpdate(req.params.seasonID, {
        provRankingOpen: false
    }, {
        new: true
    })
    res.status(200).json({
        season
    })
}

exports.deleteSeason = async(req, res) => {
    await Season.findByIdAndDelete(req.params.seasonID)
    res.status(200).json({
        message: {
            en: 'Season deleted',
            fr: 'Saison supprimée'
        }
    })
}

function saveProvRankingPoints(season) {
    return async(player) => {
        const playerSeason = player.seasons.find(seas => seas.season.toString() === season._id.toString())

        if (
            playerSeason.provRankingPointsDetails &&
            playerSeason.provRankingPointsDetails.addedToProfile
        ) return

        const {
            provRankingPoints,
            favTeamProvRankingPoints,
            comboBonus
        } = countProvRankingPoints({
            playerSeason,
            season
        })

        const provRankingTotalPoints = provRankingPoints + favTeamProvRankingPoints + comboBonus

        playerSeason.provRankingPointsDetails = {
            withoutBonus: provRankingPoints,
            comboBonus,
            favTeamBonus: favTeamProvRankingPoints,
            total: provRankingTotalPoints,
            addedToProfile: true
        }

        playerSeason.provRankingTotalPoints = provRankingTotalPoints

        playerSeason.pointsWithoutProvRanking = playerSeason.totalPoints

        playerSeason.totalPoints = playerSeason.pointsWithoutProvRanking + provRankingTotalPoints

        await player.save()
    }
}

function countProvRankingPoints({
    playerSeason,
    season
}) {
    let provRankingPoints = 0
    let favTeamProvRankingPoints = 0
    let combo = 0

    playerSeason.provisionalRanking.forEach((team, index) => {
        if (team.toString() === season.rankedTeams[index].toString()) {
            provRankingPoints += calculatePointsByTeamRanking(index + 1)
            combo++

            if (team.toString() === playerSeason.favTeam.toString()) favTeamProvRankingPoints = provRankingBonusPoints.FAVORITE_TEAM
        }
    })

    const comboBonus = calculateComboPoints(combo)

    return {
        provRankingPoints,
        favTeamProvRankingPoints,
        comboBonus
    }
}

function calculatePointsByTeamRanking(rank) {
    switch (rank) {
        case 1:
            return provRankingBonusPoints.FIRST
        case 2:
            return provRankingBonusPoints.SECOND
        case 3:
            return provRankingBonusPoints.THIRD
        case 18:
            return provRankingBonusPoints.LAST_THREE
        case 19:
            return provRankingBonusPoints.LAST_THREE
        case 20:
            return provRankingBonusPoints.LAST_THREE
        default:
            return provRankingBonusPoints.MIDDLE
    }
}

function calculateComboPoints(combo) {
    if (combo === 20) return provRankingBonusPoints.PERFECT

    if (combo > 14) return provRankingBonusPoints.COMBO_15_TO_19

    if (combo > 9) return provRankingBonusPoints.COMBO_10_TO_14

    if (combo > 4) return provRankingBonusPoints.COMBO_5_TO_9

    return 0
}