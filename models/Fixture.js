const { Schema, model } = require("mongoose");

const { MILLISECONDS_IN_2_DAYS } = require("../utils/constants");

const { SEASON_REF, TEAM_REF, FIXTURE_REF } = require("./refs");

const {
  fixtureLongStatuses,
  fixtureShortStatuses,
  LIST_OF_ALL_FIXTURE_LONG_STATUSES,
  LIST_OF_ALL_FIXTURE_SHORT_STATUSES,
} = require("./enums/fixture");

const FixtureSchema = new Schema(
  {
    season: {
      type: Schema.Types.ObjectId,
      ref: SEASON_REF,
    },
    matchweek: {
      type: Number,
      required: true,
    },
    apiFixtureID: String,
    date: Date,
    venue: String,
    timeElapsed: {
      type: Number,
      default: null,
    },
    homeTeam: {
      type: Schema.Types.ObjectId,
      ref: TEAM_REF,
    },
    awayTeam: {
      type: Schema.Types.ObjectId,
      ref: TEAM_REF,
    },
    goalsHomeTeam: {
      type: Number,
      default: null,
    },
    goalsAwayTeam: {
      type: Number,
      default: null,
    },
    winner: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: LIST_OF_ALL_FIXTURE_LONG_STATUSES,
      default: fixtureLongStatuses.TBD,
    },
    statusShort: {
      type: String,
      enum: LIST_OF_ALL_FIXTURE_SHORT_STATUSES,
      default: fixtureShortStatuses.TBD,
    },
    oddsWinHome: {
      type: Number,
      default: null,
    },
    oddsDraw: {
      type: Number,
      default: null,
    },
    oddsWinAway: {
      type: Number,
      default: null,
    },
    lastScoreUpdate: {
      type: Date,
      default: Date.now() - MILLISECONDS_IN_2_DAYS,
    },
    lastOddsUpdate: {
      type: Date,
      default: Date.now() - MILLISECONDS_IN_2_DAYS,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model(FIXTURE_REF, FixtureSchema);
