exports.fixtureLongStatuses = {
    TBD: 'Time To Be Defined',
    NS: 'Not Started',
    H1: 'First Half, Kick Off',
    HT: 'Halftime',
    H2: 'Second Half, 2nd Half Started',
    ET: 'Extra Time',
    P: 'Penalty In Progress',
    FT: 'Match Finished',
    AET: 'Match Finished After Extra Time',
    PEN: 'Match Finished After Penalty',
    BT: 'Break Time (in Extra Time)',
    SUSP: 'Match Suspended',
    INT: 'Match Interrupted',
    PST: 'Match Postponed',
    CANC: 'Match Cancelled',
    ABD: 'Match Abandoned',
    AWD: 'Technical Loss',
    WO: 'WalkOver',
}

exports.LIST_OF_ALL_FIXTURE_LONG_STATUSES = Object.values(this.fixtureLongStatuses)

exports.fixtureShortStatuses = {
    TBD: 'TBD',
    NS: 'NS',
    H1: '1H',
    HT: 'HT',
    H2: '2H',
    ET: 'ET',
    P: 'P',
    FT: 'FT',
    AET: 'AET',
    PEN: 'PEN',
    BT: 'BT',
    SUSP: 'SUSP',
    INT: 'INT',
    PST: 'PST',
    CANC: 'CANC',
    ABD: 'ABD',
    AWD: 'AWD',
    WO: 'WO',
}

exports.LIST_OF_ALL_FIXTURE_SHORT_STATUSES = Object.values(this.fixtureShortStatuses)

exports.fixtureWinner = {
    HOME: 'Home',
    DRAW: 'Draw',
    AWAY: 'Away'
}