exports.fixtureLongStatuses = {
  TBD: "Time to be defined",
  NS: "Not Started",
  H1: "First Half, Kick Off",
  HT: "Halftime",
  H2: "Second Half, 2nd Half Started",
  ET: "Extra Time",
  P: "Penalty In Progress",
  BT: "Break Time (in Extra Time)",
  SUSP: "Match Suspended",
  INT: "Match Interrupted",
  PST: "Match Postponed",
  CANC: "Match Cancelled",
  FT: "Match Finished",
  AET: "Match Finished After Extra Time",
  PEN: "Match Finished After Penalty",
  ABD: "Match Abandoned",
  AWD: "Technical Loss",
  WO: "WalkOver",
};

exports.LIST_OF_ALL_FIXTURE_LONG_STATUSES = Object.values(
  this.fixtureLongStatuses
);

exports.fixtureShortStatuses = {
  TBD: "TBD",
  NS: "NS",
  H1: "1H",
  HT: "HT",
  H2: "2H",
  ET: "ET",
  P: "P",
  FT: "FT",
  AET: "AET",
  PEN: "PEN",
  BT: "BT",
  SUSP: "SUSP",
  INT: "INT",
  PST: "PST",
  CANC: "CANC",
  ABD: "ABD",
  AWD: "AWD",
  WO: "WO",
};

exports.LIST_OF_ALL_FIXTURE_SHORT_STATUSES = Object.values(
  this.fixtureShortStatuses
);

exports.fixtureEvents = {
  goal: "GOAL",
  ownGoal: "OWN GOAL",
  penalty: "PENALTY",
  missedPenalty: "MISSED PENALTY",
  card: "CARD",
  substitution: "SUBST",
  var: "VAR",
};

exports.LIST_OF_ALL_FIXTURE_EVENTS = Object.values(this.fixtureEvents);

exports.fixtureWinner = {
  HOME: "Home",
  DRAW: "Draw",
  AWAY: "Away",
};

exports.LIST_OF_ALL_FIXTURE_WINNERS = Object.values(this.fixtureWinner);
