// NFL Draft Pick Value Calculators & Models (Jimmy Johnson, Rich Hill, Fitzgerald-Spielberger, Harvard AV)
export interface DraftPick {
  pick: number; // 1 to 256
  round: number; // 1 to 7
  pickInRound: number; // 1 to 32
  team: string; // e.g. 'CAR', 'CHI', 'KC', 'NE'
  originalTeam?: string;
  isCompensatory?: boolean;
  notes?: string;
}

export interface DraftProspect {
  rank: number;
  name: string;
  position: 'QB' | 'WR' | 'OT' | 'EDGE' | 'CB' | 'TE' | 'DL' | 'LB' | 'S' | 'RB' | 'IOL';
  college: string;
  height: string;
  weight: number;
  fortyYardDash?: number;
  rasScore: number; // Relative Athletic Score (0.00 - 10.00)
  scoutingGrade: number; // 0 - 100
  projectedRound: string;
  playerComp: string;
  strengths: string[];
  teamFits: string[];
  description: string;
}

export interface TeamDraftProfile {
  teamKey: string;
  teamName: string;
  conference: 'AFC' | 'NFC';
  division: string;
  primaryColor: string;
  picks: number[]; // Array of pick numbers owned in 2026/2027 draft
  topNeeds: string[];
  secondaryNeeds: string[];
  capSpaceEst: string;
  draftStrategy: string;
}

// Jimmy Johnson Classic 1990s Chart Table (Top 256 formula with precision anchors)
export function getJimmyJohnsonValue(pick: number): number {
  if (pick <= 0) return 0;
  if (pick === 1) return 3000;
  if (pick === 2) return 2600;
  if (pick === 3) return 2200;
  if (pick === 4) return 1800;
  if (pick === 5) return 1700;
  if (pick === 6) return 1600;
  if (pick === 7) return 1500;
  if (pick === 8) return 1400;
  if (pick === 9) return 1350;
  if (pick === 10) return 1300;
  if (pick <= 16) return Math.round(1300 - (pick - 10) * 50); // 1250 down to 1000
  if (pick <= 32) return Math.round(1000 - (pick - 16) * 25.6); // 1000 down to 590
  if (pick <= 64) return Math.round(590 - (pick - 32) * 10); // 590 down to 270
  if (pick <= 96) return Math.round(270 - (pick - 64) * 4.8); // 270 down to 116
  if (pick <= 128) return Math.round(116 - (pick - 96) * 2.2); // 116 down to 46
  if (pick <= 160) return Math.round(46 - (pick - 128) * 0.9); // 46 down to 17
  if (pick <= 192) return Math.round(17 - (pick - 160) * 0.35); // 17 down to 6
  if (pick <= 224) return Math.max(2, Math.round(6 - (pick - 192) * 0.12));
  return Math.max(1, Math.round(2 - (pick - 224) * 0.03));
}

// Rich Hill Modern NFL Trade Market Chart (Pats Pulpit)
export function getRichHillValue(pick: number): number {
  if (pick <= 0) return 0;
  if (pick === 1) return 1000;
  if (pick === 2) return 717;
  if (pick === 3) return 514;
  if (pick === 4) return 491;
  if (pick === 5) return 468;
  if (pick === 6) return 446;
  if (pick === 7) return 426;
  if (pick === 8) return 406;
  if (pick === 9) return 387;
  if (pick === 10) return 369;
  if (pick <= 32) return Math.round(369 * Math.pow(0.967, pick - 10)); // ~184 at #32
  if (pick <= 64) return Math.round(184 * Math.pow(0.972, pick - 32)); // ~75 at #64
  if (pick <= 100) return Math.round(75 * Math.pow(0.973, pick - 64)); // ~28 at #100
  if (pick <= 150) return Math.round(28 * Math.pow(0.978, pick - 100)); // ~9 at #150
  if (pick <= 200) return Math.round(9 * Math.pow(0.98, pick - 150)); // ~3 at #200
  return Math.max(1, Math.round(3 * Math.pow(0.985, pick - 200)));
}

// Fitzgerald-Spielberger Surplus Value Model (OverTheCap / PFF Wage Scale Analytic)
export function getFitzgeraldSpielbergerValue(pick: number): number {
  if (pick <= 0) return 0;
  if (pick === 1) return 3000;
  // Logarithmic surplus curve placing higher relative value on mid-round rookie contracts
  return Math.max(10, Math.round(3000 * Math.pow(pick, -0.62)));
}

// Harvard Sports Analytics AV Model (5-Year Career Approximate Value)
export function getHarvardAvValue(pick: number): number {
  if (pick <= 0) return 0;
  if (pick === 1) return 450;
  return Math.max(5, Math.round(450 * Math.pow(pick, -0.55)));
}

// Get Round from Pick Number
export function getRoundForPick(pick: number): number {
  if (pick <= 32) return 1;
  if (pick <= 64) return 2;
  if (pick <= 102) return 3; // comp picks
  if (pick <= 137) return 4;
  if (pick <= 178) return 5;
  if (pick <= 220) return 6;
  return 7;
}

// 32-Team Draft Profiles with Pick Allotments & Roster Needs
export const TEAM_DRAFT_PROFILES: TeamDraftProfile[] = [
  {
    teamKey: 'CHI',
    teamName: 'Chicago Bears',
    conference: 'NFC',
    division: 'North',
    primaryColor: '#0B162A',
    picks: [1, 9, 75, 122, 148],
    topNeeds: ['EDGE', 'IOL', 'WR', 'DE'],
    secondaryNeeds: ['DT', 'RB', 'S'],
    capSpaceEst: '$42.5M',
    draftStrategy: 'Protect Caleb Williams with blue-chip pass protection and add edge pass-rush anchor.'
  },
  {
    teamKey: 'NE',
    teamName: 'New England Patriots',
    conference: 'AFC',
    division: 'East',
    primaryColor: '#002244',
    picks: [3, 34, 68, 103, 137, 180, 231],
    topNeeds: ['OT', 'WR', 'EDGE', 'CB'],
    secondaryNeeds: ['TE', 'LB', 'K'],
    capSpaceEst: '$55.8M',
    draftStrategy: 'Surround Drake Maye with an elite blindside tackle and explosive perimeter X receiver.'
  },
  {
    teamKey: 'WAS',
    teamName: 'Washington Commanders',
    conference: 'NFC',
    division: 'East',
    primaryColor: '#5A1414',
    picks: [2, 36, 40, 67, 100, 139, 152, 222],
    topNeeds: ['OT', 'CB', 'EDGE', 'WR'],
    secondaryNeeds: ['S', 'IOL', 'TE'],
    capSpaceEst: '$48.1M',
    draftStrategy: 'Heavy draft capital war chest to fortify secondary and offensive line around Jayden Daniels.'
  },
  {
    teamKey: 'ARI',
    teamName: 'Arizona Cardinals',
    conference: 'NFC',
    division: 'West',
    primaryColor: '#97233F',
    picks: [4, 27, 35, 66, 71, 90, 104, 138, 162, 186, 226],
    topNeeds: ['WR', 'CB', 'EDGE', 'IOL'],
    secondaryNeeds: ['DT', 'RB', 'LB'],
    capSpaceEst: '$36.2M',
    draftStrategy: 'Monster 11-pick cache allowing aggressive trade-ups or drafting immediate day-1 starters.'
  },
  {
    teamKey: 'LAC',
    teamName: 'Los Angeles Chargers',
    conference: 'AFC',
    division: 'West',
    primaryColor: '#0080C6',
    picks: [5, 37, 69, 105, 140, 181, 225, 253],
    topNeeds: ['OT', 'WR', 'CB', 'RB'],
    secondaryNeeds: ['DT', 'TE', 'LB'],
    capSpaceEst: '$29.4M',
    draftStrategy: 'Jim Harbaugh trenches re-tooling with physical road-grading offensive linemen and vertical threats.'
  },
  {
    teamKey: 'NYG',
    teamName: 'New York Giants',
    conference: 'NFC',
    division: 'East',
    primaryColor: '#0B2265',
    picks: [6, 47, 70, 107, 166, 183],
    topNeeds: ['WR', 'QB', 'CB', 'RB'],
    secondaryNeeds: ['EDGE', 'IOL', 'S'],
    capSpaceEst: '$18.6M',
    draftStrategy: 'Securing an electric WR1 playmaker or navigating trade options for developmental passer.'
  },
  {
    teamKey: 'TEN',
    teamName: 'Tennessee Titans',
    conference: 'AFC',
    division: 'South',
    primaryColor: '#0C2340',
    picks: [7, 38, 106, 146, 182, 221, 242, 252],
    topNeeds: ['OT', 'EDGE', 'LB', 'CB'],
    secondaryNeeds: ['S', 'WR', 'TE'],
    capSpaceEst: '$31.0M',
    draftStrategy: 'Locking down franchise left tackle and generating athletic edge pressure in new scheme.'
  },
  {
    teamKey: 'ATL',
    teamName: 'Atlanta Falcons',
    conference: 'NFC',
    division: 'South',
    primaryColor: '#A71930',
    picks: [8, 43, 74, 79, 109, 143, 187, 197],
    topNeeds: ['EDGE', 'CB', 'WR', 'DT'],
    secondaryNeeds: ['S', 'OT', 'LB'],
    capSpaceEst: '$22.8M',
    draftStrategy: 'Urgent focus on premium edge rusher to transform defense into NFC South frontrunner.'
  },
  {
    teamKey: 'NYJ',
    teamName: 'New York Jets',
    conference: 'AFC',
    division: 'East',
    primaryColor: '#125740',
    picks: [10, 72, 111, 134, 157, 185, 257],
    topNeeds: ['OT', 'TE', 'WR', 'S'],
    secondaryNeeds: ['QB', 'DT', 'RB'],
    capSpaceEst: '$16.4M',
    draftStrategy: 'Win-now offensive weapons and premier protection to maximize veteran championship window.'
  },
  {
    teamKey: 'MIN',
    teamName: 'Minnesota Vikings',
    conference: 'NFC',
    division: 'North',
    primaryColor: '#4F2683',
    picks: [11, 23, 108, 129, 157, 167, 177, 230, 232],
    topNeeds: ['QB', 'DT', 'CB', 'EDGE'],
    secondaryNeeds: ['IOL', 'WR', 'LB'],
    capSpaceEst: '$27.1M',
    draftStrategy: 'Aggressive twin first-round capital (#11 & #23) enabling top-tier QB ascension.'
  },
  {
    teamKey: 'DEN',
    teamName: 'Denver Broncos',
    conference: 'AFC',
    division: 'West',
    primaryColor: '#FB4F14',
    picks: [12, 76, 121, 145, 147, 203, 207],
    topNeeds: ['QB', 'EDGE', 'CB', 'TE'],
    secondaryNeeds: ['WR', 'IOL', 'S'],
    capSpaceEst: '$14.9M',
    draftStrategy: 'Sean Payton hunting for his point-guard quarterback or lockdown boundary cornerback.'
  },
  {
    teamKey: 'LV',
    teamName: 'Las Vegas Raiders',
    conference: 'AFC',
    division: 'West',
    primaryColor: '#000000',
    picks: [13, 44, 77, 112, 148, 208, 223, 229],
    topNeeds: ['OT', 'CB', 'QB', 'RB'],
    secondaryNeeds: ['IOL', 'DT', 'LB'],
    capSpaceEst: '$34.0M',
    draftStrategy: 'Solidifying right tackle and secondary with physical, hard-nosed defensive talent.'
  },
  {
    teamKey: 'NO',
    teamName: 'New Orleans Saints',
    conference: 'NFC',
    division: 'South',
    primaryColor: '#D3BC8D',
    picks: [14, 45, 150, 168, 170, 175, 199, 239],
    topNeeds: ['OT', 'WR', 'DE', 'IOL'],
    secondaryNeeds: ['CB', 'S', 'TE'],
    capSpaceEst: '$8.2M',
    draftStrategy: 'Immediate offensive tackle reinforcement to stabilize pocket integrity and run game.'
  },
  {
    teamKey: 'IND',
    teamName: 'Indianapolis Colts',
    conference: 'AFC',
    division: 'South',
    primaryColor: '#002C5F',
    picks: [15, 46, 82, 117, 151, 191, 234],
    topNeeds: ['CB', 'TE', 'WR', 'S'],
    secondaryNeeds: ['EDGE', 'IOL', 'LB'],
    capSpaceEst: '$25.3M',
    draftStrategy: 'Chris Ballard targeting elite athletic RAS score athletes in secondary and pass-catching weaponry.'
  },
  {
    teamKey: 'SEA',
    teamName: 'Seattle Seahawks',
    conference: 'NFC',
    division: 'West',
    primaryColor: '#002244',
    picks: [16, 81, 102, 118, 179, 192, 235],
    topNeeds: ['IOL', 'LB', 'EDGE', 'S'],
    secondaryNeeds: ['TE', 'OT', 'CB'],
    capSpaceEst: '$19.5M',
    draftStrategy: 'Mike Macdonald establishing defensive interior dominance and linebacking discipline.'
  },
  {
    teamKey: 'JAX',
    teamName: 'Jacksonville Jaguars',
    conference: 'AFC',
    division: 'South',
    primaryColor: '#006778',
    picks: [17, 48, 96, 114, 116, 153, 212, 236],
    topNeeds: ['CB', 'WR', 'OT', 'EDGE'],
    secondaryNeeds: ['DT', 'IOL', 'S'],
    capSpaceEst: '$28.7M',
    draftStrategy: 'Lockdown corner to neutralize explosive AFC South passing offenses.'
  },
  {
    teamKey: 'CIN',
    teamName: 'Cincinnati Bengals',
    conference: 'AFC',
    division: 'North',
    primaryColor: '#FB4F14',
    picks: [18, 49, 80, 97, 115, 149, 194, 214, 224, 237],
    topNeeds: ['OT', 'DT', 'WR', 'TE'],
    secondaryNeeds: ['CB', 'RB', 'S'],
    capSpaceEst: '$38.9M',
    draftStrategy: 'Massive 10-pick allotment to rebuild offensive line wall and fortify defensive interior.'
  },
  {
    teamKey: 'LAR',
    teamName: 'Los Angeles Rams',
    conference: 'NFC',
    division: 'West',
    primaryColor: '#003594',
    picks: [19, 52, 83, 99, 154, 155, 196, 209, 213, 217, 254],
    topNeeds: ['EDGE', 'CB', 'OT', 'K'],
    secondaryNeeds: ['IOL', 'WR', 'LB'],
    capSpaceEst: '$21.4M',
    draftStrategy: 'First first-round selection since 2016 plus 11 total picks to reload young core.'
  },
  {
    teamKey: 'PIT',
    teamName: 'Pittsburgh Steelers',
    conference: 'AFC',
    division: 'North',
    primaryColor: '#FFB612',
    picks: [20, 51, 84, 98, 119, 178, 195],
    topNeeds: ['OT', 'WR', 'C', 'CB'],
    secondaryNeeds: ['DL', 'LB', 'S'],
    capSpaceEst: '$18.2M',
    draftStrategy: 'Physical identity reboot with center/tackle anchor and dynamic outside receiver.'
  },
  {
    teamKey: 'MIA',
    teamName: 'Miami Dolphins',
    conference: 'AFC',
    division: 'East',
    primaryColor: '#008E97',
    picks: [21, 55, 158, 184, 198, 241],
    topNeeds: ['IOL', 'DT', 'EDGE', 'WR'],
    secondaryNeeds: ['TE', 'CB', 'S'],
    capSpaceEst: '$12.7M',
    draftStrategy: 'Interior offensive line and defensive tackle replacements to protect Tua and maintain rush lane integrity.'
  },
  {
    teamKey: 'PHI',
    teamName: 'Philadelphia Eagles',
    conference: 'NFC',
    division: 'East',
    primaryColor: '#004C54',
    picks: [22, 50, 53, 120, 161, 171, 172, 210],
    topNeeds: ['CB', 'OT', 'LB', 'S'],
    secondaryNeeds: ['EDGE', 'WR', 'TE'],
    capSpaceEst: '$33.1M',
    draftStrategy: 'Howie Roseman masterclass: 3 top-53 picks to infuse youth into secondary and offensive line succession.'
  },
  {
    teamKey: 'DAL',
    teamName: 'Dallas Cowboys',
    conference: 'NFC',
    division: 'East',
    primaryColor: '#003594',
    picks: [24, 56, 87, 174, 216, 233, 244],
    topNeeds: ['OT', 'C', 'RB', 'LB'],
    secondaryNeeds: ['DT', 'WR', 'CB'],
    capSpaceEst: '$10.5M',
    draftStrategy: 'Rebuilding offensive line cornerstone after free agency departures and drafting lead back.'
  },
  {
    teamKey: 'GB',
    teamName: 'Green Bay Packers',
    conference: 'NFC',
    division: 'North',
    primaryColor: '#203731',
    picks: [25, 41, 58, 88, 91, 126, 169, 202, 219, 245, 255],
    topNeeds: ['OT', 'CB', 'S', 'LB'],
    secondaryNeeds: ['IOL', 'EDGE', 'RB'],
    capSpaceEst: '$24.6M',
    draftStrategy: 'League-leading 11 draft picks with 5 in top 91 to assemble high-RAS defensive backfield.'
  },
  {
    teamKey: 'TB',
    teamName: 'Tampa Bay Buccaneers',
    conference: 'NFC',
    division: 'South',
    primaryColor: '#D32F2F',
    picks: [26, 57, 89, 125, 220, 246, 258],
    topNeeds: ['EDGE', 'IOL', 'CB', 'LB'],
    secondaryNeeds: ['WR', 'S', 'TE'],
    capSpaceEst: '$17.8M',
    draftStrategy: 'Pass rush boost and interior guard reinforcement for Baker Mayfield.'
  },
  {
    teamKey: 'BUF',
    teamName: 'Buffalo Bills',
    conference: 'AFC',
    division: 'East',
    primaryColor: '#00338D',
    picks: [28, 60, 128, 144, 160, 163, 200, 204, 248, 250],
    topNeeds: ['WR', 'S', 'EDGE', 'DT'],
    secondaryNeeds: ['CB', 'OT', 'RB'],
    capSpaceEst: '$11.2M',
    draftStrategy: 'Replacing departed weapons with dynamic X receiver and reloading safety room.'
  },
  {
    teamKey: 'DET',
    teamName: 'Detroit Lions',
    conference: 'NFC',
    division: 'North',
    primaryColor: '#0076B6',
    picks: [29, 61, 73, 164, 201, 205, 249],
    topNeeds: ['CB', 'EDGE', 'IOL', 'WR'],
    secondaryNeeds: ['DT', 'S', 'LB'],
    capSpaceEst: '$26.4M',
    draftStrategy: 'Brad Holmes targeting relentless tone-setters at cornerback and opposite Aidan Hutchinson.'
  },
  {
    teamKey: 'BAL',
    teamName: 'Baltimore Ravens',
    conference: 'AFC',
    division: 'North',
    primaryColor: '#241773',
    picks: [30, 62, 93, 113, 130, 165, 218, 228, 250],
    topNeeds: ['OT', 'CB', 'EDGE', 'WR'],
    secondaryNeeds: ['IOL', 'S', 'RB'],
    capSpaceEst: '$15.3M',
    draftStrategy: 'Eric DeCosta compounding compensatory wizardry with classic Best Player Available drafting.'
  },
  {
    teamKey: 'SF',
    teamName: 'San Francisco 49ers',
    conference: 'NFC',
    division: 'West',
    primaryColor: '#AA0000',
    picks: [31, 63, 94, 124, 132, 135, 173, 176, 211, 215],
    topNeeds: ['OT', 'CB', 'IOL', 'EDGE'],
    secondaryNeeds: ['DT', 'WR', 'TE'],
    capSpaceEst: '$13.9M',
    draftStrategy: '10 draft picks focused heavily on offensive tackle succession and secondary depth.'
  },
  {
    teamKey: 'KC',
    teamName: 'Kansas City Chiefs',
    conference: 'AFC',
    division: 'West',
    primaryColor: '#E31837',
    picks: [32, 64, 95, 131, 159, 173, 227],
    topNeeds: ['WR', 'OT', 'CB', 'RB'],
    secondaryNeeds: ['DT', 'TE', 'LB'],
    capSpaceEst: '$20.1M',
    draftStrategy: 'Three-peat championship focus: blistering perimeter speed for Mahomes and blindside tackle.'
  },
  {
    teamKey: 'CAR',
    teamName: 'Carolina Panthers',
    conference: 'NFC',
    division: 'South',
    primaryColor: '#0085CA',
    picks: [33, 39, 65, 101, 141, 142, 240],
    topNeeds: ['WR', 'EDGE', 'CB', 'TE'],
    secondaryNeeds: ['C', 'LB', 'DT'],
    capSpaceEst: '$32.6M',
    draftStrategy: 'Capitalize on top of Day 2 (#33 & #39) to supply Bryce Young with explosive weaponry.'
  },
  {
    teamKey: 'HOU',
    teamName: 'Houston Texans',
    conference: 'AFC',
    division: 'South',
    primaryColor: '#03202F',
    picks: [42, 59, 86, 123, 127, 188, 189, 238, 247],
    topNeeds: ['DT', 'CB', 'IOL', 'S'],
    secondaryNeeds: ['TE', 'EDGE', 'RB'],
    capSpaceEst: '$23.5M',
    draftStrategy: 'DeMeco Ryans building dominant defensive line push and interior guard pocket stability.'
  },
  {
    teamKey: 'CLE',
    teamName: 'Cleveland Browns',
    conference: 'AFC',
    division: 'North',
    primaryColor: '#311D00',
    picks: [54, 85, 156, 206, 243, 256],
    topNeeds: ['DT', 'WR', 'LB', 'OT'],
    secondaryNeeds: ['TE', 'S', 'RB'],
    capSpaceEst: '$9.8M',
    draftStrategy: 'Maximizing mid-round value picks with high-RAS defensive line and offensive tackle developmental depth.'
  }
];

// Top 2026 Consensus Draft Prospects Board
export const CONSENSUS_DRAFT_PROSPECTS: DraftProspect[] = [
  {
    rank: 1,
    name: 'Caleb Williams',
    position: 'QB',
    college: 'USC',
    height: '6-1',
    weight: 214,
    rasScore: 9.82,
    scoutingGrade: 96.5,
    projectedRound: 'Top 1 (1st Pick)',
    playerComp: 'Patrick Mahomes / Aaron Rodgers blend',
    strengths: ['Off-platform improvisational magic', 'Elastic arm angles & velocity', 'Pinpoint red-zone ball placement', 'High football processing IQ'],
    teamFits: ['CHI', 'WAS', 'NE', 'MIN'],
    description: 'Generational quarterback prospect with extraordinary creativity, pocket elasticity, and deep arm velocity.'
  },
  {
    rank: 2,
    name: 'Marvin Harrison Jr.',
    position: 'WR',
    college: 'Ohio State',
    height: '6-3',
    weight: 209,
    rasScore: 9.91,
    scoutingGrade: 96.0,
    projectedRound: 'Top 4',
    playerComp: 'A.J. Green / Larry Fitzgerald',
    strengths: ['Masterful route nuance & stem deception', 'Elite catch radius & body control', 'Consistently wins vs press coverage', 'Instant WR1 alpha impact'],
    teamFits: ['ARI', 'NE', 'LAC', 'NYG'],
    description: 'The most polished, pro-ready wide receiver prospect in a decade with Hall-of-Fame pedigree and flawless fundamentals.'
  },
  {
    rank: 3,
    name: 'Jayden Daniels',
    position: 'QB',
    college: 'LSU',
    height: '6-4',
    weight: 210,
    rasScore: 9.68,
    scoutingGrade: 94.2,
    projectedRound: 'Top 3',
    playerComp: 'Lamar Jackson / Robert Griffin III',
    strengths: ['Electrifying open-field rushing speed', 'Sublime deep-ball touch & accuracy', 'Low turnover rate in SEC', 'Rapid progression reads'],
    teamFits: ['WAS', 'NE', 'NYG', 'DEN'],
    description: 'Heisman Trophy winner who blends 4.4-speed dynamic running threat with pinpoint vertical boundary touch.'
  },
  {
    rank: 4,
    name: 'Drake Maye',
    position: 'QB',
    college: 'North Carolina',
    height: '6-4',
    weight: 223,
    rasScore: 9.75,
    scoutingGrade: 93.8,
    projectedRound: 'Top 3',
    playerComp: 'Josh Allen / Justin Herbert',
    strengths: ['Prototypical NFL size & arm cannon', 'Fearless intermediate tight-window throws', 'Sneaky athletic scrambler', 'High upside ceiling'],
    teamFits: ['NE', 'WAS', 'MIN', 'NYG'],
    description: 'Big-bodied gunslinger with elite arm talent, aggressive vertical mentality, and high-ceiling developmental traits.'
  },
  {
    rank: 5,
    name: 'Joe Alt',
    position: 'OT',
    college: 'Notre Dame',
    height: '6-9',
    weight: 321,
    rasScore: 9.92,
    scoutingGrade: 94.5,
    projectedRound: 'Top 7',
    playerComp: 'Taylor Lewan / Mike McGlinchey',
    strengths: ['Towering wingspan & anchor strength', 'Immaculate pass protection slide', 'Former tight end fluid hips', '10-year franchise blindside rock'],
    teamFits: ['LAC', 'TEN', 'NYJ', 'NE'],
    description: 'Towering blindside technician with rare mirror-and-slide movement skills for a 6-foot-9 frame.'
  },
  {
    rank: 6,
    name: 'Malik Nabers',
    position: 'WR',
    college: 'LSU',
    height: '6-0',
    weight: 200,
    rasScore: 9.85,
    scoutingGrade: 94.0,
    projectedRound: 'Top 6',
    playerComp: 'Ja\'Marr Chase / Steve Smith Sr.',
    strengths: ['Explosive zero-to-sixty acceleration', 'Unstoppable Yards-After-Catch (YAC)', 'Violent separation out of breaks', 'Elite contested catch aggression'],
    teamFits: ['NYG', 'LAC', 'ARI', 'CAR'],
    description: 'Violent separator who turns quick slants into 80-yard house calls with world-class burst.'
  },
  {
    rank: 7,
    name: 'Rome Odunze',
    position: 'WR',
    college: 'Washington',
    height: '6-3',
    weight: 212,
    rasScore: 9.91,
    scoutingGrade: 93.5,
    projectedRound: 'Top 10',
    playerComp: 'Davante Adams / Keenan Allen',
    strengths: ['Spectacular 75% contested catch rate', 'Crisp release packages off line of scrimmage', 'Alpha red-zone high-pointer', 'Physical run blocker'],
    teamFits: ['CHI', 'NYG', 'ATL', 'IND'],
    description: 'Imposing boundary alpha who dominated college football with acrobatic sideline catches and physical contested victories.'
  },
  {
    rank: 8,
    name: 'Brock Bowers',
    position: 'TE',
    college: 'Georgia',
    height: '6-3',
    weight: 243,
    rasScore: 9.70,
    scoutingGrade: 93.9,
    projectedRound: 'Top 12',
    playerComp: 'George Kittle / Rob Gronkowski mix',
    strengths: ['Offensive mismatch weapon in slot/inline', 'Elusive tackle-breaking ballcarrier', 'Relentless perimeter blocking effort', 'Clutch 3rd down security blanket'],
    teamFits: ['NYJ', 'IND', 'LAC', 'DEN'],
    description: 'Three-time All-American tight end who functions as an unstoppable chess piece across the entire offensive formation.'
  },
  {
    rank: 9,
    name: 'Dallas Turner',
    position: 'EDGE',
    college: 'Alabama',
    height: '6-3',
    weight: 247,
    rasScore: 9.49,
    scoutingGrade: 92.8,
    projectedRound: 'Top 10',
    playerComp: 'Will Anderson Jr. / Brian Burns',
    strengths: ['4.46 forty speed off the edge', 'Explosive first-step get-off', 'Heavy hands on edge setting', 'Versatile coverage dropping ability'],
    teamFits: ['ATL', 'CHI', 'MIN', 'ARI'],
    description: 'Twitched-up edge rusher with blinding closing burst and the natural bend to turn tight corners into the quarterback.'
  },
  {
    rank: 10,
    name: 'Quinyon Mitchell',
    position: 'CB',
    college: 'Toledo',
    height: '6-0',
    weight: 195,
    rasScore: 9.79,
    scoutingGrade: 92.4,
    projectedRound: 'Round 1 (Picks 12-20)',
    playerComp: 'L\'Jarius Sneed / Patrick Surtain II',
    strengths: ['4.33 elite recovery speed', 'Ball-hawking instincts in off-zone and press', 'Exceptional Senior Bowl dominance', 'Physical tackler in boundary run support'],
    teamFits: ['PHI', 'IND', 'JAX', 'DET'],
    description: 'Lockdown perimeter cornerback with 4.33 speed, elite ball production, and verified dominance against top-tier competition.'
  },
  {
    rank: 11,
    name: 'Terrion Arnold',
    position: 'CB',
    college: 'Alabama',
    height: '6-0',
    weight: 189,
    rasScore: 9.25,
    scoutingGrade: 92.0,
    projectedRound: 'Round 1 (Picks 13-22)',
    playerComp: 'Marlon Humphrey',
    strengths: ['Sticky hip-to-hip man coverage', 'Fierce competitor at the catch point', 'Smooth transitions & click-and-close', 'Slot & outside versatility'],
    teamFits: ['DET', 'PHI', 'GB', 'JAX'],
    description: 'Physical Nick Saban-tutored cornerback with exceptional man-coverage mirror ability and ball-tracking poise.'
  },
  {
    rank: 12,
    name: 'Taliese Fuaga',
    position: 'OT',
    college: 'Oregon State',
    height: '6-6',
    weight: 324,
    rasScore: 9.61,
    scoutingGrade: 91.8,
    projectedRound: 'Round 1 (Picks 10-18)',
    playerComp: 'Penei Sewell / Trent Brown',
    strengths: ['Devastating drive-block displacement power', 'Stone wall anchor vs bull rushes', 'Nasty aggressive finisher demeanor', 'Immediate day-1 right tackle star'],
    teamFits: ['NO', 'NYJ', 'LV', 'CIN'],
    description: 'Punishing, road-grading offensive tackle who obliterates defenders in the run game with devastating upper-body torque.'
  },
  {
    rank: 13,
    name: 'Jared Verse',
    position: 'EDGE',
    college: 'Florida State',
    height: '6-4',
    weight: 254,
    rasScore: 9.58,
    scoutingGrade: 91.5,
    projectedRound: 'Round 1 (Picks 14-22)',
    playerComp: 'T.J. Watt / Trey Hendrickson',
    strengths: ['Tremendous bull-rush power & shock', 'Non-stop motor from snap to whistle', 'Relentless run-defense discipline', 'High sack-conversion rate'],
    teamFits: ['LAR', 'TB', 'MIA', 'ARI'],
    description: 'Powerful, violent edge rusher with an explosive bull rush and relentless effort on every snap.'
  },
  {
    rank: 14,
    name: 'Byron Murphy II',
    position: 'DL',
    college: 'Texas',
    height: '6-0',
    weight: 297,
    rasScore: 9.21,
    scoutingGrade: 91.2,
    projectedRound: 'Round 1 (Picks 15-24)',
    playerComp: 'Grady Jarrett / Justin Madubuike',
    strengths: ['Lightning-fast interior first step', 'Low center of gravity natural leverage', 'Interior pass-rush disruptor', 'Splits double teams easily'],
    teamFits: ['SEA', 'MIA', 'CIN', 'HOU'],
    description: 'Hyper-athletic interior 3-technique disruptor who collapses pockets from the inside out with rare quickness.'
  },
  {
    rank: 15,
    name: 'Olu Fashanu',
    position: 'OT',
    college: 'Penn State',
    height: '6-6',
    weight: 312,
    rasScore: 9.45,
    scoutingGrade: 91.0,
    projectedRound: 'Round 1 (Picks 8-15)',
    playerComp: 'David Bakhtiari / Ronnie Stanley',
    strengths: ['Pristine pass protection balance', 'Zero sacks surrendered in Big Ten career', 'Patient hand strikes and reset ability', 'Young 21-year-old high developmental ceiling'],
    teamFits: ['NYJ', 'TEN', 'NO', 'PIT'],
    description: 'Prototypical left tackle pass protector with silky footwork, patient punch timing, and elite athletic balance.'
  }
];

// Historical Trade Comparables
export interface HistoricalTradeComp {
  title: string;
  year: number;
  teamA: string;
  teamB: string;
  assetsA: string; // What Team A gave
  assetsB: string; // What Team B gave (Target)
  jimmyJohnsonDiff: number;
  outcome: string;
}

export const HISTORICAL_TRADE_COMPS: HistoricalTradeComp[] = [
  {
    title: 'Bryce Young Ascension (Panthers - Bears)',
    year: 2023,
    teamA: 'CAR',
    teamB: 'CHI',
    assetsA: 'Pick #9, Pick #61, 2024 1st (#1 overall), 2025 2nd, WR DJ Moore',
    assetsB: 'Pick #1 overall (Bryce Young)',
    jimmyJohnsonDiff: +1850,
    outcome: 'Massive value haul for Chicago, netting Caleb Williams (#1 overall) and key starters.'
  },
  {
    title: 'Trey Lance Trade Up (49ers - Dolphins)',
    year: 2021,
    teamA: 'SF',
    teamB: 'MIA',
    assetsA: 'Pick #12, 2022 1st (#29), 2022 3rd comp, 2023 1st (#29)',
    assetsB: 'Pick #3 overall (Trey Lance)',
    jimmyJohnsonDiff: +1420,
    outcome: 'High price paid to move up 9 spots. Miami parlayed picks into Tyreek Hill, Jaylen Waddle and Bradley Chubb.'
  },
  {
    title: 'Patrick Mahomes Ascension (Chiefs - Bills)',
    year: 2017,
    teamA: 'KC',
    teamB: 'BUF',
    assetsA: 'Pick #27, Pick #91 (3rd), 2018 1st (#22)',
    assetsB: 'Pick #10 overall (Patrick Mahomes)',
    jimmyJohnsonDiff: +340,
    outcome: 'Franchise-altering trade for Kansas City yielding 3 Super Bowl titles and 2 MVPs.'
  },
  {
    title: 'Josh Allen Trade Up (Bills - Buccaneers)',
    year: 2018,
    teamA: 'BUF',
    teamB: 'TB',
    assetsA: 'Pick #12, Pick #53, Pick #56',
    assetsB: 'Pick #7 overall (Josh Allen)',
    jimmyJohnsonDiff: +280,
    outcome: 'Decisive move by Buffalo to jump Miami & Arizona to draft their franchise cornerstone.'
  }
];
