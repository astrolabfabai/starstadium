import { PlayByPlayEvent, FootballPlayConcept, FootballPlayerNode } from '../types';
import { SCHEDULES_DATA } from './sportsDataMock';

// Team rosters for play-by-play player generation
interface TeamRosterProfile {
  qb: string;
  rb: string;
  wr1: string;
  wr2: string;
  slot: string;
  te: string;
  defLeader: string;
  cb1: string;
  safety: string;
}

const TEAM_PROFILES: Record<string, TeamRosterProfile> = {
  KC: {
    qb: 'Patrick Mahomes',
    rb: 'Isiah Pacheco',
    wr1: 'Xavier Worthy',
    wr2: 'Rashee Rice',
    slot: 'Hollywood Brown',
    te: 'Travis Kelce',
    defLeader: 'Chris Jones',
    cb1: 'Trent McDuffie',
    safety: 'Justin Reid'
  },
  BAL: {
    qb: 'Lamar Jackson',
    rb: 'Derrick Henry',
    wr1: 'Zay Flowers',
    wr2: 'Rashod Bateman',
    slot: 'Nelson Agholor',
    te: 'Mark Andrews',
    defLeader: 'Roquan Smith',
    cb1: 'Marlon Humphrey',
    safety: 'Kyle Hamilton'
  },
  PHI: {
    qb: 'Jalen Hurts',
    rb: 'Saquon Barkley',
    wr1: 'A.J. Brown',
    wr2: 'DeVonta Smith',
    slot: 'Jahan Dotson',
    te: 'Dallas Goedert',
    defLeader: 'Jalen Carter',
    cb1: 'Darius Slay',
    safety: 'Reed Blankenship'
  },
  GB: {
    qb: 'Jordan Love',
    rb: 'Josh Jacobs',
    wr1: 'Christian Watson',
    wr2: 'Romeo Doubs',
    slot: 'Jayden Reed',
    te: 'Luke Musgrave',
    defLeader: 'Rashan Gary',
    cb1: 'Jaire Alexander',
    safety: 'Xavier McKinney'
  },
  SF: {
    qb: 'Brock Purdy',
    rb: 'Christian McCaffrey',
    wr1: 'Brandon Aiyuk',
    wr2: 'Deebo Samuel',
    slot: 'Jauan Jennings',
    te: 'George Kittle',
    defLeader: 'Nick Bosa',
    cb1: 'Charvarius Ward',
    safety: 'Talanoa Hufanga'
  },
  DET: {
    qb: 'Jared Goff',
    rb: 'Jahmyr Gibbs',
    wr1: 'Amon-Ra St. Brown',
    wr2: 'Jameson Williams',
    slot: 'Kalif Raymond',
    te: 'Sam LaPorta',
    defLeader: 'Aidan Hutchinson',
    cb1: 'Terrion Arnold',
    safety: 'Brian Branch'
  },
  LA: {
    qb: 'Matthew Stafford',
    rb: 'Kyren Williams',
    wr1: 'Cooper Kupp',
    wr2: 'Puka Nacua',
    slot: 'Demarcus Robinson',
    te: 'Colby Parkinson',
    defLeader: 'Kobie Turner',
    cb1: 'Tre\'Davious White',
    safety: 'Kamren Curl'
  },
  NYJ: {
    qb: 'Aaron Rodgers',
    rb: 'Breece Hall',
    wr1: 'Garrett Wilson',
    wr2: 'Mike Williams',
    slot: 'Malachi Corley',
    te: 'Tyler Conklin',
    defLeader: 'Quinnen Williams',
    cb1: 'Sauce Gardner',
    safety: 'Chuck Clark'
  },
  BUF: {
    qb: 'Josh Allen',
    rb: 'James Cook',
    wr1: 'Keon Coleman',
    wr2: 'Curtis Samuel',
    slot: 'Khalil Shakir',
    te: 'Dalton Kincaid',
    defLeader: 'Ed Oliver',
    cb1: 'Rasul Douglas',
    safety: 'Taylor Rapp'
  },
  MIA: {
    qb: 'Tua Tagovailoa',
    rb: 'De\'Von Achane',
    wr1: 'Tyreek Hill',
    wr2: 'Jaylen Waddle',
    slot: 'Braxton Berrios',
    te: 'Jonnu Smith',
    defLeader: 'Jaelan Phillips',
    cb1: 'Jalen Ramsey',
    safety: 'Jevon Holland'
  },
  CIN: {
    qb: 'Joe Burrow',
    rb: 'Zack Moss',
    wr1: 'Ja\'Marr Chase',
    wr2: 'Tee Higgins',
    slot: 'Andrei Iosivas',
    te: 'Mike Gesicki',
    defLeader: 'Trey Hendrickson',
    cb1: 'Cam Taylor-Britt',
    safety: 'Vonn Bell'
  },
  DAL: {
    qb: 'Dak Prescott',
    rb: 'Ezekiel Elliott',
    wr1: 'CeeDee Lamb',
    wr2: 'Brandin Cooks',
    slot: 'Jalen Tolbert',
    te: 'Jake Ferguson',
    defLeader: 'Micah Parsons',
    cb1: 'Trevon Diggs',
    safety: 'Malik Hooker'
  },
  CHI: {
    qb: 'Caleb Williams',
    rb: 'D\'Andre Swift',
    wr1: 'DJ Moore',
    wr2: 'Keenan Allen',
    slot: 'Rome Odunze',
    te: 'Cole Kmet',
    defLeader: 'Montez Sweat',
    cb1: 'Jaylon Johnson',
    safety: 'Kevin Byard'
  },
  NYG: {
    qb: 'Daniel Jones',
    rb: 'Devin Singletary',
    wr1: 'Malik Nabers',
    wr2: 'Darius Slayton',
    slot: 'Wan\'Dale Robinson',
    te: 'Theo Johnson',
    defLeader: 'Dexter Lawrence',
    cb1: 'Deonte Banks',
    safety: 'Tyler Nubin'
  },
  DEN: {
    qb: 'Bo Nix',
    rb: 'Javonte Williams',
    wr1: 'Courtland Sutton',
    wr2: 'Josh Reynolds',
    slot: 'Marvin Mims Jr.',
    te: 'Greg Dulcich',
    defLeader: 'Zach Allen',
    cb1: 'Patrick Surtain II',
    safety: 'Brandon Jones'
  },
  LAC: {
    qb: 'Justin Herbert',
    rb: 'Gus Edwards',
    wr1: 'Ladd McConkey',
    wr2: 'Josh Palmer',
    slot: 'DJ Chark Jr.',
    te: 'Will Dissly',
    defLeader: 'Joey Bosa',
    cb1: 'Asante Samuel Jr.',
    safety: 'Derwin James Jr.'
  },
  NE: {
    qb: 'Drake Maye',
    rb: 'Rhamondre Stevenson',
    wr1: 'Demario Douglas',
    wr2: 'Ja\'Lynn Polk',
    slot: 'Kendrick Bourne',
    te: 'Hunter Henry',
    defLeader: 'Keion White',
    cb1: 'Christian Gonzalez',
    safety: 'Kyle Dugger'
  },
  SEA: {
    qb: 'Geno Smith',
    rb: 'Kenneth Walker III',
    wr1: 'DK Metcalf',
    wr2: 'Tyler Lockett',
    slot: 'Jaxon Smith-Njigba',
    te: 'Noah Fant',
    defLeader: 'Boye Mafe',
    cb1: 'Devon Witherspoon',
    safety: 'Julian Love'
  },
  PIT: {
    qb: 'Russell Wilson',
    rb: 'Najee Harris',
    wr1: 'George Pickens',
    wr2: 'Van Jefferson',
    slot: 'Calvin Austin III',
    te: 'Pat Freiermuth',
    defLeader: 'T.J. Watt',
    cb1: 'Joey Porter Jr.',
    safety: 'Minkah Fitzpatrick'
  },
  CLE: {
    qb: 'Deshaun Watson',
    rb: 'Nick Chubb',
    wr1: 'Amari Cooper',
    wr2: 'Jerry Jeudy',
    slot: 'Elijah Moore',
    te: 'David Njoku',
    defLeader: 'Myles Garrett',
    cb1: 'Denzel Ward',
    safety: 'Grant Delpit'
  },
  HOU: {
    qb: 'C.J. Stroud',
    rb: 'Joe Mixon',
    wr1: 'Nico Collins',
    wr2: 'Stefon Diggs',
    slot: 'Tank Dell',
    te: 'Dalton Schultz',
    defLeader: 'Will Anderson Jr.',
    cb1: 'Derek Stingley Jr.',
    safety: 'Jalen Pitre'
  },
  IND: {
    qb: 'Anthony Richardson',
    rb: 'Jonathan Taylor',
    wr1: 'Michael Pittman Jr.',
    wr2: 'Alec Pierce',
    slot: 'Josh Downs',
    te: 'Kylen Granson',
    defLeader: 'DeForest Buckner',
    cb1: 'Kenny Moore II',
    safety: 'Julian Blackmon'
  },
  JAX: {
    qb: 'Trevor Lawrence',
    rb: 'Travis Etienne Jr.',
    wr1: 'Brian Thomas Jr.',
    wr2: 'Gabe Davis',
    slot: 'Christian Kirk',
    te: 'Evan Engram',
    defLeader: 'Josh Hines-Allen',
    cb1: 'Tyson Campbell',
    safety: 'Andre Cisco'
  },
  TEN: {
    qb: 'Will Levis',
    rb: 'Tony Pollard',
    wr1: 'Calvin Ridley',
    wr2: 'DeAndre Hopkins',
    slot: 'Tyler Boyd',
    te: 'Chig Okonkwo',
    defLeader: 'Jeffery Simmons',
    cb1: 'L\'Jarius Sneed',
    safety: 'Amani Hooker'
  },
  LV: {
    qb: 'Gardner Minshew',
    rb: 'Zamir White',
    wr1: 'Davante Adams',
    wr2: 'Jakobi Meyers',
    slot: 'Tre Tucker',
    te: 'Brock Bowers',
    defLeader: 'Maxx Crosby',
    cb1: 'Jack Jones',
    safety: 'Tre\'von Moehrig'
  },
  WAS: {
    qb: 'Jayden Daniels',
    rb: 'Brian Robinson Jr.',
    wr1: 'Terry McLaurin',
    wr2: 'Luke McCaffrey',
    slot: 'Olamide Zaccheaus',
    te: 'Zach Ertz',
    defLeader: 'Jonathan Allen',
    cb1: 'Benjamin St-Juste',
    safety: 'Jeremy Chinn'
  },
  ATL: {
    qb: 'Kirk Cousins',
    rb: 'Bijan Robinson',
    wr1: 'Drake London',
    wr2: 'Darnell Mooney',
    slot: 'Ray-Ray McCloud',
    te: 'Kyle Pitts',
    defLeader: 'Matthew Judon',
    cb1: 'A.J. Terrell',
    safety: 'Jessie Bates III'
  },
  CAR: {
    qb: 'Bryce Young',
    rb: 'Chuba Hubbard',
    wr1: 'Diontae Johnson',
    wr2: 'Xavier Legette',
    slot: 'Adam Thielen',
    te: 'Tommy Tremble',
    defLeader: 'Derrick Brown',
    cb1: 'Jaycee Horn',
    safety: 'Xavier Woods'
  },
  NO: {
    qb: 'Derek Carr',
    rb: 'Alvin Kamara',
    wr1: 'Chris Olave',
    wr2: 'Rashid Shaheed',
    slot: 'Cedrick Wilson Jr.',
    te: 'Juwan Johnson',
    defLeader: 'Cameron Jordan',
    cb1: 'Marshon Lattimore',
    safety: 'Tyrann Mathieu'
  },
  TB: {
    qb: 'Baker Mayfield',
    rb: 'Rachaad White',
    wr1: 'Mike Evans',
    wr2: 'Chris Godwin',
    slot: 'Jalen McMillan',
    te: 'Cade Otton',
    defLeader: 'Vita Vea',
    cb1: 'Jamel Dean',
    safety: 'Antoine Winfield Jr.'
  },
  ARI: {
    qb: 'Kyler Murray',
    rb: 'James Conner',
    wr1: 'Marvin Harrison Jr.',
    wr2: 'Michael Wilson',
    slot: 'Greg Dortch',
    te: 'Trey McBride',
    defLeader: 'Zaven Collins',
    cb1: 'Sean Murphy-Bunting',
    safety: 'Budda Baker'
  },
  MIN: {
    qb: 'Sam Darnold',
    rb: 'Aaron Jones',
    wr1: 'Justin Jefferson',
    wr2: 'Jordan Addison',
    slot: 'Jalen Nailor',
    te: 'T.J. Hockenson',
    defLeader: 'Jonathan Greenard',
    cb1: 'Shaquill Griffin',
    safety: 'Harrison Smith'
  }
};

const DEFAULT_PROFILE = (team: string): TeamRosterProfile => ({
  qb: `${team} Starting QB`,
  rb: `${team} Primary RB`,
  wr1: `${team} WR1`,
  wr2: `${team} WR2`,
  slot: `${team} Slot WR`,
  te: `${team} Starting TE`,
  defLeader: `${team} Pass Rusher`,
  cb1: `${team} Cornerback`,
  safety: `${team} Free Safety`
});

export function getTeamRoster(team: string): TeamRosterProfile {
  return TEAM_PROFILES[team] || DEFAULT_PROFILE(team);
}

// Generate play-by-play and tactical concepts for ANY game
export function generateGamePlays(
  gameKey: string,
  awayTeam: string = 'BAL',
  homeTeam: string = 'KC',
  status: string = 'InProgress'
): PlayByPlayEvent[] {
  const home = getTeamRoster(homeTeam);
  const away = getTeamRoster(awayTeam);

  const numericGameId = parseInt(gameKey.replace(/\D/g, '') || '202610101', 10);

  const plays: PlayByPlayEvent[] = [
    // --- QUARTER 1 ---
    {
      PlayID: numericGameId * 100 + 1,
      GameID: numericGameId,
      Quarter: 1,
      TimeRemaining: '14:52',
      Possession: homeTeam,
      Down: 1,
      Distance: 10,
      YardLine: 25,
      YardLineSide: homeTeam,
      PlayType: 'Pass',
      YardsGained: 18,
      Description: `(14:52) (Shotgun) ${home.qb} pass deep middle to ${home.te} to ${homeTeam} 43 for 18 yards (${away.defLeader}).`,
      IsBigPlay: true,
      WinProbabilityPct: 54.2,
      epa: 1.18,
      playConceptName: 'Shotgun 11 • Four Verticals ("60 Go")',
      formation: 'Shotgun 2x2 Open Spread',
      personnel: '11 Personnel (3 WR, 1 TE, 1 RB)',
      defensiveCoverage: 'vs Cover 3 Sky (Single-High Free Safety)',
      targetPlayer: home.te,
      passTargetRole: 'TE'
    },
    {
      PlayID: numericGameId * 100 + 2,
      GameID: numericGameId,
      Quarter: 1,
      TimeRemaining: '14:15',
      Possession: homeTeam,
      Down: 1,
      Distance: 10,
      YardLine: 43,
      YardLineSide: homeTeam,
      PlayType: 'Run',
      YardsGained: 6,
      Description: `(14:15) ${home.rb} left tackle to ${homeTeam} 49 for 6 yards (${away.safety}).`,
      IsBigPlay: false,
      WinProbabilityPct: 55.1,
      epa: 0.24,
      playConceptName: 'Inside Zone / Left Tackle Cutback',
      formation: 'Shotgun Offset Pistol',
      defensiveCoverage: 'Cover 1 Man Under (8-Man Box)',
      ballCarrier: home.rb
    },
    {
      PlayID: numericGameId * 100 + 3,
      GameID: numericGameId,
      Quarter: 1,
      TimeRemaining: '13:30',
      Possession: homeTeam,
      Down: 2,
      Distance: 4,
      YardLine: 49,
      YardLineSide: homeTeam,
      PlayType: 'Pass',
      YardsGained: 35,
      Description: `(13:30) (Shotgun) ${home.qb} pass deep right to ${home.wr1} for 35 YARDS, TOUCHDOWN!`,
      IsBigPlay: true,
      WinProbabilityPct: 68.9,
      epa: 3.42,
      playConceptName: 'Post-Wheel Double Move Shot',
      formation: 'Shotgun 3x1 Trips Right',
      defensiveCoverage: 'Cover 2 Man Under',
      targetPlayer: home.wr1,
      passTargetRole: 'WR'
    },

    // --- QUARTER 2 ---
    {
      PlayID: numericGameId * 100 + 4,
      GameID: numericGameId,
      Quarter: 2,
      TimeRemaining: '11:20',
      Possession: awayTeam,
      Down: 1,
      Distance: 10,
      YardLine: 25,
      YardLineSide: awayTeam,
      PlayType: 'Run',
      YardsGained: 13,
      Description: `(11:20) ${away.rb} off right guard to ${awayTeam} 38 for 13 yards (${home.defLeader}).`,
      IsBigPlay: false,
      WinProbabilityPct: 44.5,
      epa: 0.88,
      playConceptName: 'Duo Power / Heavy Guard Pull',
      formation: 'Singleback 21 Heavy (2 RB, 1 TE, 2 WR)',
      defensiveCoverage: 'Cover 3 Buzz',
      ballCarrier: away.rb
    },
    {
      PlayID: numericGameId * 100 + 5,
      GameID: numericGameId,
      Quarter: 2,
      TimeRemaining: '08:45',
      Possession: awayTeam,
      Down: 3,
      Distance: 7,
      YardLine: 38,
      YardLineSide: awayTeam,
      PlayType: 'Run',
      YardsGained: 21,
      Description: `(08:45) (Shotgun) ${away.qb} scramble left end to ${homeTeam} 41 for 21 yards (${home.defLeader}).`,
      IsBigPlay: true,
      WinProbabilityPct: 49.8,
      epa: 1.84,
      playConceptName: 'Bootleg Flood & QB Scramble Rail',
      formation: 'Shotgun Empty Spread',
      defensiveCoverage: 'Cover 4 Quarters Match',
      ballCarrier: away.qb
    },
    {
      PlayID: numericGameId * 100 + 6,
      GameID: numericGameId,
      Quarter: 2,
      TimeRemaining: '07:15',
      Possession: awayTeam,
      Down: 1,
      Distance: 10,
      YardLine: 41,
      YardLineSide: homeTeam,
      PlayType: 'Pass',
      YardsGained: 24,
      Description: `(07:15) (Shotgun) ${away.qb} pass deep over the middle to ${away.wr1} to ${homeTeam} 17 for 24 yards (${home.safety}).`,
      IsBigPlay: true,
      WinProbabilityPct: 53.2,
      epa: 1.65,
      playConceptName: 'Mesh Shallow Cross Rub / Deep Over',
      formation: 'Shotgun 11 Trips Left',
      defensiveCoverage: 'Cover 2 Tampa',
      targetPlayer: away.wr1,
      passTargetRole: 'WR'
    },
    {
      PlayID: numericGameId * 100 + 7,
      GameID: numericGameId,
      Quarter: 2,
      TimeRemaining: '03:10',
      Possession: awayTeam,
      Down: 2,
      Distance: 6,
      YardLine: 17,
      YardLineSide: homeTeam,
      PlayType: 'Pass',
      YardsGained: 17,
      Description: `(03:10) (Shotgun) ${away.qb} pass short middle to ${away.te} for 17 YARDS, TOUCHDOWN!`,
      IsBigPlay: true,
      WinProbabilityPct: 50.0,
      epa: 2.89,
      playConceptName: 'Red Zone Texas / Angle Route Concept',
      formation: 'Shotgun 12 Heavy Personnel',
      defensiveCoverage: 'Cover 1 Goal Line Press',
      targetPlayer: away.te,
      passTargetRole: 'TE'
    },

    // --- QUARTER 3 ---
    {
      PlayID: numericGameId * 100 + 8,
      GameID: numericGameId,
      Quarter: 3,
      TimeRemaining: '09:40',
      Possession: homeTeam,
      Down: 2,
      Distance: 8,
      YardLine: 32,
      YardLineSide: homeTeam,
      PlayType: 'Pass',
      YardsGained: 14,
      Description: `(09:40) (Shotgun) ${home.qb} quick out pass to ${home.wr2} to ${homeTeam} 46 for 14 yards (${away.cb1}).`,
      IsBigPlay: false,
      WinProbabilityPct: 62.1,
      epa: 0.95,
      playConceptName: 'Quick Out / Sprintout Option',
      formation: 'Shotgun 2x2 Open',
      defensiveCoverage: 'Cover 1 Man Press',
      targetPlayer: home.wr2,
      passTargetRole: 'WR'
    },
    {
      PlayID: numericGameId * 100 + 9,
      GameID: numericGameId,
      Quarter: 3,
      TimeRemaining: '05:12',
      Possession: homeTeam,
      Down: 3,
      Distance: 3,
      YardLine: 46,
      YardLineSide: homeTeam,
      PlayType: 'Pass',
      YardsGained: 28,
      Description: `(05:12) (Shotgun) ${home.qb} pass deep left to ${home.te} to ${awayTeam} 26 for 28 yards (${away.safety}).`,
      IsBigPlay: true,
      WinProbabilityPct: 74.0,
      epa: 2.10,
      playConceptName: 'Deep Post Mills / Dig Hi-Lo',
      formation: 'Shotgun 12 Tight Wing',
      defensiveCoverage: 'Cover 3 Sky',
      targetPlayer: home.te,
      passTargetRole: 'TE'
    },

    // --- QUARTER 4 ---
    {
      PlayID: numericGameId * 100 + 10,
      GameID: numericGameId,
      Quarter: 4,
      TimeRemaining: '02:15',
      Possession: awayTeam,
      Down: 1,
      Distance: 10,
      YardLine: 35,
      YardLineSide: awayTeam,
      PlayType: 'Pass',
      YardsGained: 16,
      Description: `(02:15) (No Huddle, Shotgun) ${away.qb} pass middle to ${away.te} to ${homeTeam} 49 for 16 yards (${home.cb1}).`,
      IsBigPlay: true,
      WinProbabilityPct: 22.4,
      epa: 1.12,
      playConceptName: 'Hurry-Up Y-Stick / Seam Choice',
      formation: 'Shotgun 11 Spread 2-Minute',
      defensiveCoverage: 'Cover 4 Prevent Shell',
      targetPlayer: away.te,
      passTargetRole: 'TE'
    },
    {
      PlayID: numericGameId * 100 + 11,
      GameID: numericGameId,
      Quarter: 4,
      TimeRemaining: '00:45',
      Possession: awayTeam,
      Down: 2,
      Distance: 4,
      YardLine: 24,
      YardLineSide: homeTeam,
      PlayType: 'Pass',
      YardsGained: 14,
      Description: `(00:45) (Shotgun) ${away.qb} pass short right to ${away.slot} to ${homeTeam} 10 for 14 yards (${home.safety}).`,
      IsBigPlay: true,
      WinProbabilityPct: 35.6,
      epa: 1.78,
      playConceptName: 'Dagger Concept / Deep Dig & Clearout',
      formation: 'Shotgun 3x1 ISO Spread',
      defensiveCoverage: 'Cover 2 Red Zone Bracket',
      targetPlayer: away.slot,
      passTargetRole: 'WR'
    },
    {
      PlayID: numericGameId * 100 + 12,
      GameID: numericGameId,
      Quarter: 4,
      TimeRemaining: '00:05',
      Possession: awayTeam,
      Down: 3,
      Distance: 10,
      YardLine: 10,
      YardLineSide: homeTeam,
      PlayType: 'Pass',
      YardsGained: 0,
      Description: status === 'Final'
        ? `(00:05) (Shotgun) ${away.qb} pass incomplete end zone to ${away.te} (Confirmed Incomplete by toe-line review). GAME OVER!`
        : `(00:05) (Shotgun) ${away.qb} pass incomplete end zone to ${away.te} (Out of bounds review - confirmed incomplete by toe-line millimeter).`,
      IsBigPlay: true,
      WinProbabilityPct: 98.9,
      epa: -2.85,
      playConceptName: 'Red Zone Corner Fade / Toe-Tap Climax',
      formation: 'Shotgun 3x1 ISO Boundary',
      defensiveCoverage: 'Goal Line Cover 0 Bracket',
      targetPlayer: away.te,
      passTargetRole: 'TE'
    }
  ];

  return plays;
}

// Master selector to get plays for ANY game
export function getPlaysForGame(
  gameKeyOrId?: string | number,
  fallbackAway?: string,
  fallbackHome?: string,
  status?: string
): PlayByPlayEvent[] {
  if (!gameKeyOrId) {
    const away = fallbackAway || 'SEA';
    const home = fallbackHome || 'NE';
    return generateGamePlays('202610203', away, home, status || 'Final');
  }

  const strKey = String(gameKeyOrId);
  const match = SCHEDULES_DATA.find((g) => g.GameKey === strKey || String(g.GameKey).includes(strKey));

  if (match) {
    const away = fallbackAway || match.AwayTeam;
    const home = fallbackHome || match.HomeTeam;
    return generateGamePlays(match.GameKey, away, home, match.Status || status);
  }

  const away = fallbackAway || (strKey.includes('202610203') ? 'SEA' : 'BAL');
  const home = fallbackHome || (strKey.includes('202610203') ? 'NE' : 'KC');
  return generateGamePlays(strKey, away, home, status);
}
