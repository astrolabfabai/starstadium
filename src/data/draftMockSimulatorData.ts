// NFL Draft Mock Simulator Data & Valuation Projection Engine
import { DraftProspect, TeamDraftProfile, TEAM_DRAFT_PROFILES, getJimmyJohnsonValue, getRichHillValue } from './draftPickData';

export interface HistoricalDraftSlotStat {
  pick: number;
  tier: string;
  allProRate: number; // % chance of at least 1 First-Team All-Pro
  proBowlRate: number; // % chance of at least 1 Pro Bowl
  starterRate: number; // % chance of becoming a primary multi-year starter (>3 yrs)
  bustRate: number; // % chance of replacement/sub-starter level
  expected5YrAV: number; // Expected 5-year Pro-Football-Reference Approximate Value
  avgRookieCapSurplusM: number; // Estimated 4-yr cap surplus in Millions USD vs market vet APY
}

export interface HistoricalPositionTrend {
  position: string;
  firstRoundAvgHitRate: number; // %
  firstRoundAvgYear3AV: number;
  avgSecondContractAPY: number; // $ Millions
  scarcityMultiplier: number;
  description: string;
}

export interface MockDraftPickSlot {
  pickNumber: number;
  round: number;
  pickInRound: number;
  teamKey: string;
  originalTeamKey?: string;
  tradedVia?: string;
}

export interface SimPickResult {
  pickNumber: number;
  round: number;
  teamKey: string;
  prospect: DraftProspect;
  timestamp: string;
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';
  gradeScore: number; // 0 - 100
  valueDelta: number; // Expected Rank - Actual Pick Slot (positive = steal, negative = reach)
  valueDeltaPercent: number; // % surplus / deficit
  schemeFitScore: number; // 0 - 100
  needMet: boolean;
  projectedYear1CapSurplusM: number;
  projected5YearAV: number[]; // [Yr 1, Yr 2, Yr 3, Yr 4, Yr 5]
  projectedFloorAV: number[];
  projectedCeilingAV: number[];
  rationale: string;
  isUserPick: boolean;
}

export interface SimTradeOffer {
  id: string;
  proposingTeamKey: string;
  targetTeamKey: string;
  pickNumber: number;
  targetProspectName?: string;
  givingPicks: { pickNumber: number; round: number; label: string; value: number }[];
  receivingPicks: { pickNumber: number; round: number; label: string; value: number }[];
  netValueJimmyJohnson: number;
  fairnessRatio: number; // Giving / Receiving (1.0 = fair, >1.0 = overpay)
  message: string;
}

// 1. Historical Draft Slot Baselines (Based on 2011-2025 CBA Rookie Wage Era historical outcomes)
export const HISTORICAL_SLOT_BASELINES: Record<number, HistoricalDraftSlotStat> = {
  1: { pick: 1, tier: 'Top 1 (Elite Franchise)', allProRate: 48, proBowlRate: 72, starterRate: 88, bustRate: 12, expected5YrAV: 44.5, avgRookieCapSurplusM: 28.5 },
  2: { pick: 2, tier: 'Top 3 (Blue Chip)', allProRate: 42, proBowlRate: 65, starterRate: 84, bustRate: 16, expected5YrAV: 40.2, avgRookieCapSurplusM: 24.2 },
  3: { pick: 3, tier: 'Top 3 (Blue Chip)', allProRate: 39, proBowlRate: 62, starterRate: 82, bustRate: 18, expected5YrAV: 38.0, avgRookieCapSurplusM: 22.0 },
  5: { pick: 5, tier: 'Top 5 (Cornerstone)', allProRate: 35, proBowlRate: 58, starterRate: 78, bustRate: 22, expected5YrAV: 34.6, avgRookieCapSurplusM: 19.5 },
  10: { pick: 10, tier: 'Top 10 (Foundation)', allProRate: 28, proBowlRate: 51, starterRate: 72, bustRate: 28, expected5YrAV: 29.8, avgRookieCapSurplusM: 15.8 },
  15: { pick: 15, tier: 'Mid 1st (Solid Starter)', allProRate: 22, proBowlRate: 43, starterRate: 66, bustRate: 34, expected5YrAV: 25.4, avgRookieCapSurplusM: 12.9 },
  20: { pick: 20, tier: 'Mid 1st (Solid Starter)', allProRate: 18, proBowlRate: 38, starterRate: 61, bustRate: 39, expected5YrAV: 22.1, avgRookieCapSurplusM: 10.4 },
  25: { pick: 25, tier: 'Late 1st (Contender Core)', allProRate: 15, proBowlRate: 34, starterRate: 57, bustRate: 43, expected5YrAV: 19.7, avgRookieCapSurplusM: 8.8 },
  32: { pick: 32, tier: 'Late 1st (Contender Core)', allProRate: 12, proBowlRate: 29, starterRate: 52, bustRate: 48, expected5YrAV: 17.5, avgRookieCapSurplusM: 7.2 },
  45: { pick: 45, tier: 'Mid 2nd (High Upside)', allProRate: 9, proBowlRate: 22, starterRate: 44, bustRate: 56, expected5YrAV: 14.2, avgRookieCapSurplusM: 5.1 },
  64: { pick: 64, tier: 'Late 2nd (Starter Candidate)', allProRate: 6, proBowlRate: 17, starterRate: 38, bustRate: 62, expected5YrAV: 11.8, avgRookieCapSurplusM: 3.8 }
};

export function getSlotBaseline(pick: number): HistoricalDraftSlotStat {
  if (HISTORICAL_SLOT_BASELINES[pick]) return HISTORICAL_SLOT_BASELINES[pick];
  // Interpolated approximation
  const p = Math.max(1, Math.min(256, pick));
  if (p <= 32) {
    const factor = (32 - p) / 31;
    return {
      pick: p,
      tier: p <= 10 ? 'Top 10 (Foundation)' : 'Round 1 (Starter Focus)',
      allProRate: Math.round(12 + factor * 36),
      proBowlRate: Math.round(29 + factor * 43),
      starterRate: Math.round(52 + factor * 36),
      bustRate: Math.round(48 - factor * 36),
      expected5YrAV: Number((17.5 + factor * 27.0).toFixed(1)),
      avgRookieCapSurplusM: Number((7.2 + factor * 21.3).toFixed(1))
    };
  } else if (p <= 64) {
    const factor = (64 - p) / 32;
    return {
      pick: p,
      tier: 'Round 2 (High-Value Rotation)',
      allProRate: Math.round(6 + factor * 6),
      proBowlRate: Math.round(17 + factor * 12),
      starterRate: Math.round(38 + factor * 14),
      bustRate: Math.round(62 - factor * 14),
      expected5YrAV: Number((11.8 + factor * 5.7).toFixed(1)),
      avgRookieCapSurplusM: Number((3.8 + factor * 3.4).toFixed(1))
    };
  } else {
    return {
      pick: p,
      tier: p <= 105 ? 'Round 3 (Developmental)' : 'Day 3 (Depth & Special Teams)',
      allProRate: Math.max(1, Math.round(5 - (p - 64) * 0.03)),
      proBowlRate: Math.max(3, Math.round(14 - (p - 64) * 0.08)),
      starterRate: Math.max(12, Math.round(34 - (p - 64) * 0.15)),
      bustRate: Math.min(88, Math.round(66 + (p - 64) * 0.15)),
      expected5YrAV: Number(Math.max(4.0, (11.0 - (p - 64) * 0.06)).toFixed(1)),
      avgRookieCapSurplusM: Number(Math.max(0.8, (3.5 - (p - 64) * 0.02)).toFixed(1))
    };
  }
}

// 2. Historical Positional Value & Market Hit Rates
export const HISTORICAL_POSITION_TRENDS: Record<string, HistoricalPositionTrend> = {
  QB: {
    position: 'QB',
    firstRoundAvgHitRate: 46,
    firstRoundAvgYear3AV: 11.2,
    avgSecondContractAPY: 48.5,
    scarcityMultiplier: 1.45,
    description: 'Highest ceiling & surplus cap impact ($35M+/yr savings on rookie contract), but carries ~54% bust risk.'
  },
  WR: {
    position: 'WR',
    firstRoundAvgHitRate: 64,
    firstRoundAvgYear3AV: 9.6,
    avgSecondContractAPY: 29.0,
    scarcityMultiplier: 1.25,
    description: 'Modern NFL game-changer; elite day-1 translation rate and immediate explosive YAC generation.'
  },
  OT: {
    position: 'OT',
    firstRoundAvgHitRate: 71,
    firstRoundAvgYear3AV: 8.8,
    avgSecondContractAPY: 26.5,
    scarcityMultiplier: 1.30,
    description: 'Highest 1st-round hit rate of any non-specialist position; cornerstone 10-year blindside stability.'
  },
  EDGE: {
    position: 'EDGE',
    firstRoundAvgHitRate: 67,
    firstRoundAvgYear3AV: 9.1,
    avgSecondContractAPY: 28.0,
    scarcityMultiplier: 1.35,
    description: 'Premium pass rush pressure dictates modern defensive EPA; elite athletes convert at a high clip.'
  },
  CB: {
    position: 'CB',
    firstRoundAvgHitRate: 59,
    firstRoundAvgYear3AV: 7.9,
    avgSecondContractAPY: 22.0,
    scarcityMultiplier: 1.20,
    description: 'Crucial coverage eraser in spread offenses; high volatility in year-to-year target grades.'
  },
  TE: {
    position: 'TE',
    firstRoundAvgHitRate: 58,
    firstRoundAvgYear3AV: 6.8,
    avgSecondContractAPY: 16.5,
    scarcityMultiplier: 1.10,
    description: 'Rare hybrid weapon; dynamic inline and slot versatility stresses base defenses.'
  },
  DL: {
    position: 'DL',
    firstRoundAvgHitRate: 68,
    firstRoundAvgYear3AV: 8.0,
    avgSecondContractAPY: 24.0,
    scarcityMultiplier: 1.22,
    description: 'Interior pass rush collapsing the pocket directly up the gut is the most disruptive defensive element.'
  },
  IOL: {
    position: 'IOL',
    firstRoundAvgHitRate: 74,
    firstRoundAvgYear3AV: 7.5,
    avgSecondContractAPY: 18.0,
    scarcityMultiplier: 1.05,
    description: 'Exceptionally reliable draft conversion rate; cleans up interior A-gap stunts and run lanes.'
  },
  LB: {
    position: 'LB',
    firstRoundAvgHitRate: 62,
    firstRoundAvgYear3AV: 7.2,
    avgSecondContractAPY: 16.0,
    scarcityMultiplier: 1.02,
    description: 'Defensive captain & green-dot communicator; requires modern sideline-to-sideline pursuit range.'
  },
  S: {
    position: 'S',
    firstRoundAvgHitRate: 60,
    firstRoundAvgYear3AV: 6.9,
    avgSecondContractAPY: 17.5,
    scarcityMultiplier: 1.04,
    description: 'Two-high disguise chess piece; essential for neutralizing middle-field explosive crossers.'
  },
  RB: {
    position: 'RB',
    firstRoundAvgHitRate: 75,
    firstRoundAvgYear3AV: 9.8,
    avgSecondContractAPY: 13.5,
    scarcityMultiplier: 0.92,
    description: 'Immediate year-1 yardage production, but short career shelf-life limits 2nd contract surplus value.'
  }
};

// 3. Complete Round 1 & Round 2 Mock Draft Order (Realistic 2026/2027 draft slots with trades)
export const DEFAULT_MOCK_ORDER: MockDraftPickSlot[] = [
  // Round 1
  { pickNumber: 1, round: 1, pickInRound: 1, teamKey: 'CHI', originalTeamKey: 'CAR', tradedVia: 'Bryce Young Trade 2023' },
  { pickNumber: 2, round: 1, pickInRound: 2, teamKey: 'WAS' },
  { pickNumber: 3, round: 1, pickInRound: 3, teamKey: 'NE' },
  { pickNumber: 4, round: 1, pickInRound: 4, teamKey: 'ARI' },
  { pickNumber: 5, round: 1, pickInRound: 5, teamKey: 'LAC' },
  { pickNumber: 6, round: 1, pickInRound: 6, teamKey: 'NYG' },
  { pickNumber: 7, round: 1, pickInRound: 7, teamKey: 'TEN' },
  { pickNumber: 8, round: 1, pickInRound: 8, teamKey: 'ATL' },
  { pickNumber: 9, round: 1, pickInRound: 9, teamKey: 'CHI' },
  { pickNumber: 10, round: 1, pickInRound: 10, teamKey: 'NYJ' },
  { pickNumber: 11, round: 1, pickInRound: 11, teamKey: 'MIN' },
  { pickNumber: 12, round: 1, pickInRound: 12, teamKey: 'DEN' },
  { pickNumber: 13, round: 1, pickInRound: 13, teamKey: 'LV' },
  { pickNumber: 14, round: 1, pickInRound: 14, teamKey: 'NO' },
  { pickNumber: 15, round: 1, pickInRound: 15, teamKey: 'IND' },
  { pickNumber: 16, round: 1, pickInRound: 16, teamKey: 'SEA' },
  { pickNumber: 17, round: 1, pickInRound: 17, teamKey: 'JAX' },
  { pickNumber: 18, round: 1, pickInRound: 18, teamKey: 'CIN' },
  { pickNumber: 19, round: 1, pickInRound: 19, teamKey: 'LAR' },
  { pickNumber: 20, round: 1, pickInRound: 20, teamKey: 'PIT' },
  { pickNumber: 21, round: 1, pickInRound: 21, teamKey: 'MIA' },
  { pickNumber: 22, round: 1, pickInRound: 22, teamKey: 'PHI' },
  { pickNumber: 23, round: 1, pickInRound: 23, teamKey: 'MIN', originalTeamKey: 'HOU', tradedVia: 'Capital Trade 2024' },
  { pickNumber: 24, round: 1, pickInRound: 24, teamKey: 'DAL' },
  { pickNumber: 25, round: 1, pickInRound: 25, teamKey: 'GB' },
  { pickNumber: 26, round: 1, pickInRound: 26, teamKey: 'TB' },
  { pickNumber: 27, round: 1, pickInRound: 27, teamKey: 'ARI', originalTeamKey: 'HOU', tradedVia: 'Will Anderson Jr. Trade' },
  { pickNumber: 28, round: 1, pickInRound: 28, teamKey: 'BUF' },
  { pickNumber: 29, round: 1, pickInRound: 29, teamKey: 'DET' },
  { pickNumber: 30, round: 1, pickInRound: 30, teamKey: 'BAL' },
  { pickNumber: 31, round: 1, pickInRound: 31, teamKey: 'SF' },
  { pickNumber: 32, round: 1, pickInRound: 32, teamKey: 'KC' },
  // Round 2
  { pickNumber: 33, round: 2, pickInRound: 1, teamKey: 'CAR' },
  { pickNumber: 34, round: 2, pickInRound: 2, teamKey: 'NE' },
  { pickNumber: 35, round: 2, pickInRound: 3, teamKey: 'ARI' },
  { pickNumber: 36, round: 2, pickInRound: 4, teamKey: 'WAS' },
  { pickNumber: 37, round: 2, pickInRound: 5, teamKey: 'LAC' },
  { pickNumber: 38, round: 2, pickInRound: 6, teamKey: 'TEN' },
  { pickNumber: 39, round: 2, pickInRound: 7, teamKey: 'CAR', originalTeamKey: 'NYG', tradedVia: 'Brian Burns Trade' },
  { pickNumber: 40, round: 2, pickInRound: 8, teamKey: 'WAS', originalTeamKey: 'CHI', tradedVia: 'Montez Sweat Trade' },
  { pickNumber: 41, round: 2, pickInRound: 9, teamKey: 'GB', originalTeamKey: 'NYJ', tradedVia: 'Aaron Rodgers Trade' },
  { pickNumber: 42, round: 2, pickInRound: 10, teamKey: 'HOU', originalTeamKey: 'MIN', tradedVia: 'Draft Day Swap' },
  { pickNumber: 43, round: 2, pickInRound: 11, teamKey: 'ATL' },
  { pickNumber: 44, round: 2, pickInRound: 12, teamKey: 'LV' },
  { pickNumber: 45, round: 2, pickInRound: 13, teamKey: 'NO' },
  { pickNumber: 46, round: 2, pickInRound: 14, teamKey: 'IND' },
  { pickNumber: 47, round: 2, pickInRound: 15, teamKey: 'NYG', originalTeamKey: 'SEA', tradedVia: 'Leonard Williams Trade' },
  { pickNumber: 48, round: 2, pickInRound: 16, teamKey: 'JAX' },
  { pickNumber: 49, round: 2, pickInRound: 17, teamKey: 'CIN' },
  { pickNumber: 50, round: 2, pickInRound: 18, teamKey: 'PHI', originalTeamKey: 'NO', tradedVia: 'Draft Swap' },
  { pickNumber: 51, round: 2, pickInRound: 19, teamKey: 'PIT' },
  { pickNumber: 52, round: 2, pickInRound: 20, teamKey: 'LAR' },
  { pickNumber: 53, round: 2, pickInRound: 21, teamKey: 'PHI' },
  { pickNumber: 54, round: 2, pickInRound: 22, teamKey: 'CLE' },
  { pickNumber: 55, round: 2, pickInRound: 23, teamKey: 'MIA' },
  { pickNumber: 56, round: 2, pickInRound: 24, teamKey: 'DAL' },
  { pickNumber: 57, round: 2, pickInRound: 25, teamKey: 'TB' },
  { pickNumber: 58, round: 2, pickInRound: 26, teamKey: 'GB' },
  { pickNumber: 59, round: 2, pickInRound: 27, teamKey: 'HOU' },
  { pickNumber: 60, round: 2, pickInRound: 28, teamKey: 'BUF' },
  { pickNumber: 61, round: 2, pickInRound: 29, teamKey: 'DET' },
  { pickNumber: 62, round: 2, pickInRound: 30, teamKey: 'BAL' },
  { pickNumber: 63, round: 2, pickInRound: 31, teamKey: 'SF' },
  { pickNumber: 64, round: 2, pickInRound: 32, teamKey: 'KC' }
];

// 4. Expanded 45+ Premier Consensus Prospect Board for Deep Mock Sim
export const EXTENDED_CONSENSUS_PROSPECTS: DraftProspect[] = [
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
    teamFits: ['CHI', 'WAS', 'NE', 'MIN', 'DEN', 'LV'],
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
    teamFits: ['ARI', 'NE', 'LAC', 'NYG', 'CHI', 'BUF'],
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
    teamFits: ['WAS', 'NE', 'NYG', 'DEN', 'LV'],
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
    teamFits: ['NE', 'WAS', 'MIN', 'NYG', 'DEN'],
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
    teamFits: ['LAC', 'TEN', 'NYJ', 'NE', 'WAS'],
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
    teamFits: ['NYG', 'LAC', 'ARI', 'CAR', 'IND'],
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
    teamFits: ['CHI', 'NYG', 'ATL', 'IND', 'NYJ', 'BUF'],
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
    teamFits: ['NYJ', 'IND', 'LAC', 'DEN', 'LV', 'CIN'],
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
    teamFits: ['ATL', 'CHI', 'MIN', 'ARI', 'DEN', 'LAR'],
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
    teamFits: ['PHI', 'IND', 'JAX', 'DET', 'GB', 'LAR'],
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
    teamFits: ['DET', 'PHI', 'GB', 'JAX', 'IND', 'TB'],
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
    teamFits: ['NO', 'NYJ', 'LV', 'CIN', 'PIT', 'MIA'],
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
    teamFits: ['LAR', 'TB', 'MIA', 'ARI', 'ATL', 'SEA'],
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
    teamFits: ['SEA', 'MIA', 'CIN', 'HOU', 'BUF', 'DAL'],
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
    teamFits: ['NYJ', 'TEN', 'NO', 'PIT', 'WAS', 'BAL'],
    description: 'Prototypical left tackle pass protector with silky footwork, patient punch timing, and elite athletic balance.'
  },
  {
    rank: 16,
    name: 'J.J. McCarthy',
    position: 'QB',
    college: 'Michigan',
    height: '6-2',
    weight: 219,
    rasScore: 9.38,
    scoutingGrade: 90.7,
    projectedRound: 'Round 1 (Picks 8-18)',
    playerComp: 'Kirk Cousins / Alex Smith (with 4.5 wheels)',
    strengths: ['27-1 record as college starter & National Champ', 'Deadly on 3rd down passing efficiency', 'Plus athleticism & off-platform delivery', 'Pro-style system mastery'],
    teamFits: ['MIN', 'DEN', 'LV', 'NYG', 'NE'],
    description: 'Championship-winning quarterback with crisp mechanics, high-velocity intermediate velocity, and proven leadership.'
  },
  {
    rank: 17,
    name: 'Laiatu Latu',
    position: 'EDGE',
    college: 'UCLA',
    height: '6-5',
    weight: 259,
    rasScore: 9.32,
    scoutingGrade: 90.5,
    projectedRound: 'Round 1 (Picks 14-24)',
    playerComp: 'Maxx Crosby / Aidan Hutchinson',
    strengths: ['Best pass-rush move toolbox in class', 'Ghost rush, cross-chop & spin mastery', 'Incredible college pressure rate (22.5%)', 'Relentless backfield pursuer'],
    teamFits: ['IND', 'LAR', 'TB', 'MIA', 'ARI', 'DET'],
    description: 'The most refined, technician pass rusher in the draft with a complete array of counter moves.'
  },
  {
    rank: 18,
    name: 'JC Latham',
    position: 'OT',
    college: 'Alabama',
    height: '6-6',
    weight: 342,
    rasScore: 9.15,
    scoutingGrade: 90.2,
    projectedRound: 'Round 1 (Picks 10-20)',
    playerComp: 'Orlando Brown Jr. / Darnell Wright',
    strengths: ['Enormous mass and raw grip strength', 'Dominant road grader in gap-scheme runs', 'Heavy hands that stop bull rushers dead', 'Secured right side of Bama line for 2 yrs'],
    teamFits: ['TEN', 'CIN', 'NO', 'PIT', 'LAC'],
    description: 'Massive right tackle prospect with earth-shattering power and a mean streak in the run game.'
  },
  {
    rank: 19,
    name: 'Nate Wiggins',
    position: 'CB',
    college: 'Clemson',
    height: '6-1',
    weight: 173,
    rasScore: 9.44,
    scoutingGrade: 89.8,
    projectedRound: 'Round 1 (Picks 18-28)',
    playerComp: 'Dominique Rodgers-Cromartie',
    strengths: ['Blazing 4.28 forty track speed', 'Effortless hip turn and fluid backpedal', 'Clutch chase-down hustle plays', 'Length to disrupt throwing lanes'],
    teamFits: ['BAL', 'PHI', 'GB', 'ARI', 'JAX'],
    description: 'Electric 4.28-speed cover cornerback with smooth transitional hips and exceptional boundary range.'
  },
  {
    rank: 20,
    name: 'Amarius Mims',
    position: 'OT',
    college: 'Georgia',
    height: '6-8',
    weight: 340,
    rasScore: 9.58,
    scoutingGrade: 89.5,
    projectedRound: 'Round 1 (Picks 16-26)',
    playerComp: 'Trent Brown / Mekhi Becton',
    strengths: ['Astronomical 86.7-inch wingspan', 'Astonishing agility for 340-lb frame', 'Untouchable pass protection ceiling', 'Dominant in limited SEC starts'],
    teamFits: ['CIN', 'PIT', 'BAL', 'SF', 'MIA', 'DAL'],
    description: 'Physically imposing specimen built in a laboratory with limitless upside if developed properly.'
  },
  {
    rank: 21,
    name: 'Brian Thomas Jr.',
    position: 'WR',
    college: 'LSU',
    height: '6-3',
    weight: 209,
    rasScore: 9.97,
    scoutingGrade: 89.2,
    projectedRound: 'Round 1 (Picks 17-28)',
    playerComp: 'DK Metcalf / Christian Watson',
    strengths: ['4.33 forty time at 6-foot-3 (rare athletic score)', 'Led FBS with 17 receiving touchdowns', 'Devastating vertical boundary threat', 'Huge catch radius'],
    teamFits: ['JAX', 'BUF', 'KC', 'PIT', 'BAL'],
    description: 'Rare size-speed specimen who led the nation in touchdowns and tears open coverages down the sideline.'
  },
  {
    rank: 22,
    name: 'Chop Robinson',
    position: 'EDGE',
    college: 'Penn State',
    height: '6-3',
    weight: 254,
    rasScore: 9.84,
    scoutingGrade: 89.0,
    projectedRound: 'Round 1 (Picks 18-30)',
    playerComp: 'Micah Parsons (rush role) / Haason Reddick',
    strengths: ['Historic 1.54 ten-yard split (fastest in class)', 'Unearthly first-step twitch', 'Relentless motor on stunts', 'Explosive tackle-for-loss generator'],
    teamFits: ['MIA', 'TB', 'LAR', 'SF', 'KC'],
    description: 'First-step alien who fires off the line like a bullet from a gun, disrupting plays before they develop.'
  },
  {
    rank: 23,
    name: 'Graham Barton',
    position: 'IOL',
    college: 'Duke',
    height: '6-5',
    weight: 313,
    rasScore: 9.99,
    scoutingGrade: 88.9,
    projectedRound: 'Round 1 (Picks 20-30)',
    playerComp: 'Zack Martin / Ryan Jensen',
    strengths: ['Elite 9.99 RAS athletic testing', 'Can start at Center, Guard, or Tackle', 'High football intellect and blitz pickup', 'Tenacious punch and drive'],
    teamFits: ['TB', 'DAL', 'MIA', 'PHI', 'DET', 'SF'],
    description: 'Universal offensive line chess piece with nearly perfect athletic testing and elite versatility.'
  },
  {
    rank: 24,
    name: 'Cooper DeJean',
    position: 'CB',
    college: 'Iowa',
    height: '6-0',
    weight: 203,
    rasScore: 9.89,
    scoutingGrade: 88.7,
    projectedRound: 'Round 1 (Picks 20-32)',
    playerComp: 'Malcolm Jenkins / Tyrann Mathieu',
    strengths: ['Can play Boundary CB, Nickel, or Free Safety', 'Electric punt returner (3 career TDs)', 'Elite zone coverage instincts', 'Thunderous open-field tackler'],
    teamFits: ['PHI', 'GB', 'DET', 'BAL', 'BUF', 'SF'],
    description: 'Swiss Army knife defensive back with unmatched zone awareness, fierce tackling, and dynamic return ability.'
  },
  {
    rank: 25,
    name: 'Jer\'Zhan Newton',
    position: 'DL',
    college: 'Illinois',
    height: '6-2',
    weight: 304,
    rasScore: 8.92,
    scoutingGrade: 88.4,
    projectedRound: 'Round 1 (Picks 22-32)',
    playerComp: 'Javon Hargrave / Ed Oliver',
    strengths: ['Big Ten Defensive Player of the Year', 'Unstoppable interior swim and club move', 'High snap endurance & stamina', 'Knack for batted passes at line'],
    teamFits: ['CIN', 'HOU', 'DAL', 'DET', 'SF', 'TB'],
    description: 'Proven interior pass rusher who dominated the Big Ten with relentless energy and heavy hand strikes.'
  },
  {
    rank: 26,
    name: 'Tyler Guyton',
    position: 'OT',
    college: 'Oklahoma',
    height: '6-8',
    weight: 322,
    rasScore: 9.71,
    scoutingGrade: 88.1,
    projectedRound: 'Round 1 (Picks 24-32)',
    playerComp: 'Lane Johnson (developmental) / Brian O\'Neill',
    strengths: ['Silky smooth pass set footwork', 'Tremendous natural recovery athleticism', 'Tall, lean frame with room to add muscle', 'Former defensive end motor'],
    teamFits: ['DAL', 'KC', 'SF', 'BAL', 'GB'],
    description: 'Incredibly nimble 6-foot-8 pass-protecting tackle with elite movement skills and high upside.'
  },
  {
    rank: 27,
    name: 'Xavier Worthy',
    position: 'WR',
    college: 'Texas',
    height: '5-11',
    weight: 165,
    rasScore: 9.41,
    scoutingGrade: 88.0,
    projectedRound: 'Round 1 (Picks 25-32)',
    playerComp: 'Tyreek Hill / DeSean Jackson',
    strengths: ['NFL Combine record 4.21 forty-yard dash', 'Instant field tilter forcing two-deep safety shells', 'Great nuance on shallow crossing routes', 'Electrifying in space'],
    teamFits: ['KC', 'BUF', 'BAL', 'CAR', 'DET'],
    description: 'The fastest man in NFL Combine history (4.21s) who completely reshapes defensive coverage spacing.'
  },
  {
    rank: 28,
    name: 'Kool-Aid McKinstry',
    position: 'CB',
    college: 'Alabama',
    height: '5-11',
    weight: 199,
    rasScore: 8.95,
    scoutingGrade: 87.8,
    projectedRound: 'Round 1 / Early 2',
    playerComp: 'Marshon Lattimore / Stephon Gilmore',
    strengths: ['Three-year starter in Nick Saban defense', 'Mastery of press-bail technique', 'Never panics with back to the ball', 'Exceptional punt returner'],
    teamFits: ['NO', 'DET', 'GB', 'PHI', 'ARI', 'JAX'],
    description: 'Imperturbable Alabama cover corner with smooth technique, high IQ, and battle-tested SEC pedigree.'
  },
  {
    rank: 29,
    name: 'Adonai Mitchell',
    position: 'WR',
    college: 'Texas',
    height: '6-2',
    weight: 205,
    rasScore: 9.99,
    scoutingGrade: 87.5,
    projectedRound: 'Round 1 / Early 2',
    playerComp: 'CeeDee Lamb / George Pickens',
    strengths: ['4.34 forty with 9.99 RAS score', 'Silky route snaps at the top of the route', 'Playoff touchdown machine in college', 'Unbelievable body contortion catches'],
    teamFits: ['BUF', 'KC', 'IND', 'CAR', 'NE', 'BAL'],
    description: 'Dynamic X-receiver with near-flawless athletic testing and a knack for scoring in the biggest moments.'
  },
  {
    rank: 30,
    name: 'Jordan Morgan',
    position: 'OT',
    college: 'Arizona',
    height: '6-5',
    weight: 311,
    rasScore: 9.24,
    scoutingGrade: 87.2,
    projectedRound: 'Round 1 / Early 2',
    playerComp: 'Ali Marpet / Alijah Vera-Tucker',
    strengths: ['Quick lateral mirror in pass protection', 'Nasty punch timing and anchor', 'Can play Left Tackle or slide into Guard', 'Overcame ACL to play elite senior season'],
    teamFits: ['GB', 'SF', 'MIA', 'DAL', 'WAS', 'NE'],
    description: 'Experienced, athletic tackle who can protect the blindside or convert to an All-Pro interior guard.'
  },
  {
    rank: 31,
    name: 'Ladd McConkey',
    position: 'WR',
    college: 'Georgia',
    height: '6-0',
    weight: 186,
    rasScore: 9.34,
    scoutingGrade: 87.0,
    projectedRound: 'Round 1 / Early 2',
    playerComp: 'Cooper Kupp / Julian Edelman',
    strengths: ['4.39 speed with ankle-breaking route breaks', 'Zero wasted steps in route stems', 'Unreal separation on 3rd down', 'Reliable hands in traffic'],
    teamFits: ['LAC', 'CAR', 'BUF', 'KC', 'NE', 'WAS'],
    description: 'Master route technician who creates instant separation on every route in the tree with 4.39 speed.'
  },
  {
    rank: 32,
    name: 'Darius Robinson',
    position: 'DL',
    college: 'Missouri',
    height: '6-5',
    weight: 285,
    rasScore: 9.02,
    scoutingGrade: 86.8,
    projectedRound: 'Round 1 / Early 2',
    playerComp: 'Cameron Jordan / Denico Autry',
    strengths: ['Can play 5-technique edge or 3-technique tackle', 'Massive 35-inch arms and anvil hands', 'Devastating power in the run game', 'Senior Bowl MVP candidate'],
    teamFits: ['ARI', 'DET', 'SF', 'BAL', 'TB'],
    description: 'Heavyweight defensive lineman who sets iron edges against the run and crushes interior pockets.'
  },
  {
    rank: 33,
    name: 'Jackson Powers-Johnson',
    position: 'IOL',
    college: 'Oregon',
    height: '6-3',
    weight: 328,
    rasScore: 9.42,
    scoutingGrade: 86.5,
    projectedRound: 'Round 1 / Early 2',
    playerComp: 'Creed Humphrey / Corey Linsley',
    strengths: ['Rimington Trophy winner as nation\'s best Center', 'Brick wall anchor against 330-lb nose tackles', 'Mean-streak pulling on outside zone', 'Immediate 10-year pivot leader'],
    teamFits: ['DAL', 'PIT', 'MIA', 'CAR', 'LV', 'PHI'],
    description: 'Dominant center prospect who anchors like an oak tree and mauls defenders in the run game.'
  },
  {
    rank: 34,
    name: 'Edgerrin Cooper',
    position: 'LB',
    college: 'Texas A&M',
    height: '6-2',
    weight: 230,
    rasScore: 9.34,
    scoutingGrade: 86.2,
    projectedRound: 'Round 2',
    playerComp: 'Fred Warner / Roquan Smith style',
    strengths: ['4.51 forty closing burst', 'Sideline-to-sideline pursuit range', 'Disruptive blitzer (8 sacks in 2023)', 'Great instincts in hook-curl zone coverage'],
    teamFits: ['GB', 'DAL', 'PHI', 'CAR', 'TEN', 'CLE'],
    description: 'The premier linebacker in the class with blazing closing speed, pass-rush pop, and modern coverage traits.'
  },
  {
    rank: 35,
    name: 'Keon Coleman',
    position: 'WR',
    college: 'Florida State',
    height: '6-3',
    weight: 213,
    rasScore: 8.87,
    scoutingGrade: 86.0,
    projectedRound: 'Round 2',
    playerComp: 'Dez Bryant / Allen Robinson',
    strengths: ['College basketball background with elite 38" vert', 'Dominant above-the-rim red zone jump balls', 'Violent tackle-breaker in space', 'Punt return skills at 213 lbs'],
    teamFits: ['BUF', 'CAR', 'NE', 'LAC', 'WAS'],
    description: 'Power forward wide receiver who dominates contested catch situations and turns short screens into highlight plays.'
  },
  {
    rank: 36,
    name: 'Jonathon Brooks',
    position: 'RB',
    college: 'Texas',
    height: '6-0',
    weight: 216,
    rasScore: 8.90,
    scoutingGrade: 85.8,
    projectedRound: 'Round 2',
    playerComp: 'Jamaal Charles / Josh Jacobs blend',
    strengths: ['Patient vision behind zone blocking', 'Explosive jump-cut into second level', 'Three-down receiver & pass protector', 'Averages 6.1 yards per carry'],
    teamFits: ['DAL', 'LAC', 'CAR', 'NYG', 'DEN', 'LV'],
    description: 'The consensus RB1 of the class with ideal three-down size, silky vision, and home-run open field speed.'
  },
  {
    rank: 37,
    name: 'Kamari Lassiter',
    position: 'CB',
    college: 'Georgia',
    height: '6-0',
    weight: 186,
    rasScore: 8.82,
    scoutingGrade: 85.5,
    projectedRound: 'Round 2',
    playerComp: 'D.J. Reed / Asante Samuel Jr.',
    strengths: ['Allowed zero touchdowns in 2023 SEC season', 'Relentless competitor in run fits', 'Instinctive break on the football', 'High football IQ'],
    teamFits: ['HOU', 'PHI', 'DET', 'ARI', 'WAS'],
    description: 'Lockdown SEC cornerback who allowed zero touchdowns in his final season with exceptional tackle tenacity.'
  },
  {
    rank: 38,
    name: 'Zach Frazier',
    position: 'IOL',
    college: 'West Virginia',
    height: '6-3',
    weight: 313,
    rasScore: 8.94,
    scoutingGrade: 85.2,
    projectedRound: 'Round 2',
    playerComp: 'Jason Kelce / Alex Mack',
    strengths: ['Four-time high school state wrestling champion', 'Unshakeable balance and wrestling leverage', 'Leader of West Virginia offensive line', 'High football IQ call-outs'],
    teamFits: ['PIT', 'DAL', 'CAR', 'WAS', 'MIA'],
    description: 'Four-time heavyweight wrestling champion who plays center with elite leverage, toughness, and football grit.'
  },
  {
    rank: 39,
    name: 'Braden Fiske',
    position: 'DL',
    college: 'Florida State',
    height: '6-4',
    weight: 292,
    rasScore: 9.89,
    scoutingGrade: 85.0,
    projectedRound: 'Round 2',
    playerComp: 'Justin Smith / Kobie Turner',
    strengths: ['Combative high-motor disruptor', 'Ran 4.78 forty at 292 lbs at Combine', 'Dominated ACC Championship (3 sacks)', 'Non-stop motor on every down'],
    teamFits: ['LAR', 'ARI', 'HOU', 'CIN', 'CLE'],
    description: 'High-energy interior hurricane who destroyed the NFL Combine and plays with an unquenchable competitive fire.'
  },
  {
    rank: 40,
    name: 'Junior Colson',
    position: 'LB',
    college: 'Michigan',
    height: '6-2',
    weight: 238,
    rasScore: 8.91,
    scoutingGrade: 84.8,
    projectedRound: 'Round 2',
    playerComp: 'Denzel Perryman / Nick Bolton',
    strengths: ['Lott IMPACT Trophy winner and National Champ', 'Zero missed tackles inside the box in 2023', 'Jim Harbaugh defensive general', 'Stout run thumper'],
    teamFits: ['LAC', 'TEN', 'GB', 'DAL', 'SEA'],
    description: 'Championship-winning defensive quarterback who commands the middle of the field with zero missed tackles.'
  },
  {
    rank: 41,
    name: 'Tyler Nubin',
    position: 'S',
    college: 'Minnesota',
    height: '6-2',
    weight: 199,
    rasScore: 8.65,
    scoutingGrade: 84.5,
    projectedRound: 'Round 2',
    playerComp: 'Jessie Bates III / Harrison Smith',
    strengths: ['School-record 13 career interceptions', 'Sensational centerfield range and vision', 'Physical enforcer coming downhill against the run', 'Smart communicator'],
    teamFits: ['NYG', 'GB', 'BUF', 'WAS', 'PHI'],
    description: 'Elite centerfield ball-hawk who reads quarterback eyes and erases deep passing concepts.'
  },
  {
    rank: 42,
    name: 'Ricky Pearsall',
    position: 'WR',
    college: 'Florida',
    height: '6-1',
    weight: 189,
    rasScore: 9.91,
    scoutingGrade: 84.3,
    projectedRound: 'Round 2',
    playerComp: 'Adam Thielen / Christian Kirk',
    strengths: ['4.41 forty with 42" vertical jump', 'Highlight-reel one-handed circus catches', 'Crisp separation against SEC corners', 'Fearless over the middle'],
    teamFits: ['SF', 'CAR', 'NE', 'KC', 'BUF'],
    description: 'Acrobatic pass catcher with 9.91 RAS testing and some of the greatest one-handed catches in college football history.'
  },
  {
    rank: 43,
    name: 'Roman Wilson',
    position: 'WR',
    college: 'Michigan',
    height: '5-11',
    weight: 185,
    rasScore: 9.12,
    scoutingGrade: 84.0,
    projectedRound: 'Round 2',
    playerComp: 'Tyler Lockett / John Brown',
    strengths: ['4.39 speed with 12 touchdown grabs in 2023', 'Master of the scramble drill with QBs', 'Tough blocker in Harbaugh run game', 'Instant slot burst'],
    teamFits: ['PIT', 'LAC', 'CAR', 'NE', 'NYG'],
    description: 'Explosive slot separator who served as Michigan\'s primary touchdown creator and dynamic deep threat.'
  },
  {
    rank: 44,
    name: 'Marshawn Kneeland',
    position: 'EDGE',
    college: 'Western Michigan',
    height: '6-3',
    weight: 267,
    rasScore: 9.54,
    scoutingGrade: 83.8,
    projectedRound: 'Round 2',
    playerComp: 'Za\'Darius Smith / George Karlaftis',
    strengths: ['Relentless bull rusher who walks tackles into QBs', 'Elite Senior Bowl 1-on-1 performance', 'Stout run defender who doesn\'t give ground', 'Explosive broad jump testing'],
    teamFits: ['DAL', 'TB', 'SF', 'BAL', 'MIA'],
    description: 'Heavy-handed edge setter with violent punch power and relentless motor from Western Michigan.'
  },
  {
    rank: 45,
    name: 'T.J. Tampa',
    position: 'CB',
    college: 'Iowa State',
    height: '6-1',
    weight: 189,
    rasScore: 8.88,
    scoutingGrade: 83.5,
    projectedRound: 'Round 2 / Round 3',
    playerComp: 'Tariq Woolen (zone length) / James Bradberry',
    strengths: ['Long arms that re-route receivers at the line', 'First-team All-Big 12 shutdown corner', 'Superb instincts reading route stems', 'Physical against perimeter screens'],
    teamFits: ['ARI', 'JAX', 'DET', 'WAS', 'IND'],
    description: 'Long, physical press-zone cornerback who smothers passing windows with 32-inch arms.'
  }
];

// 5. Smart Evaluation & Value Projection Engine
export function evaluateMockPick(
  pickNumber: number,
  teamKey: string,
  prospect: DraftProspect,
  isUserPick: boolean = false
): SimPickResult {
  const teamProfile = TEAM_DRAFT_PROFILES.find((t) => t.teamKey === teamKey) || {
    teamKey,
    teamName: teamKey,
    conference: 'AFC',
    division: 'General',
    primaryColor: '#0284c7',
    picks: [pickNumber],
    topNeeds: ['OT', 'WR', 'CB', 'EDGE'],
    secondaryNeeds: ['DT', 'IOL', 'QB'],
    capSpaceEst: '$25.0M',
    draftStrategy: 'Best player available approach.'
  };

  // Positional need weight
  const isTopNeed = teamProfile.topNeeds.includes(prospect.position);
  const isSecondaryNeed = teamProfile.secondaryNeeds.includes(prospect.position);
  const needScore = isTopNeed ? 100 : isSecondaryNeed ? 75 : 45;

  // Expected slot based on prospect consensus rank
  const expectedSlot = prospect.rank;
  const valueDelta = expectedSlot - pickNumber; // positive = steal (e.g. Rank 3 drafted at 8 = +5), negative = reach (Rank 15 drafted at 4 = -11)
  const valueDeltaPercent = Number(((valueDelta / Math.max(1, pickNumber)) * 100).toFixed(1));

  // Scheme fit calculation
  const isDirectSchemeFit = prospect.teamFits.includes(teamKey);
  const posTrend = HISTORICAL_POSITION_TRENDS[prospect.position] || { scarcityMultiplier: 1.0 };
  const schemeFitScore = Math.min(100, Math.round(
    (isDirectSchemeFit ? 95 : 75) +
    (prospect.rasScore > 9.5 ? 5 : 0) +
    (isTopNeed ? 5 : 0)
  ));

  // Calculate composite Grade Score (0-100)
  // Weights: Prospect Grade (35%), Value Delta / Steal bonus (30%), Need Match (20%), Scheme/RAS Fit (15%)
  let gradeScore = (prospect.scoutingGrade * 0.35) +
                   (50 + valueDelta * 2.2) * 0.30 +
                   (needScore * 0.20) +
                   (schemeFitScore * 0.15);

  gradeScore = Math.max(35, Math.min(99, Math.round(gradeScore)));

  // Convert to Letter Grade
  let grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F' = 'B';
  if (gradeScore >= 95) grade = 'A+';
  else if (gradeScore >= 90) grade = 'A';
  else if (gradeScore >= 85) grade = 'A-';
  else if (gradeScore >= 80) grade = 'B+';
  else if (gradeScore >= 75) grade = 'B';
  else if (gradeScore >= 70) grade = 'B-';
  else if (gradeScore >= 64) grade = 'C+';
  else if (gradeScore >= 58) grade = 'C';
  else if (gradeScore >= 50) grade = 'D';
  else grade = 'F';

  // Calculate 5-Year Projected Value (Approximate Value points & Cap Surplus)
  const slotBaseline = getSlotBaseline(pickNumber);
  const base5Yr = slotBaseline.expected5YrAV;
  const multiplier = (prospect.scoutingGrade / 90) * (schemeFitScore / 80) * (posTrend.scarcityMultiplier || 1.0);

  // 5-Year AV trajectory [Yr1, Yr2, Yr3, Yr4, Yr5]
  const yr1 = Math.round(base5Yr * 0.16 * multiplier * (isTopNeed ? 1.15 : 0.95));
  const yr2 = Math.round(base5Yr * 0.22 * multiplier);
  const yr3 = Math.round(base5Yr * 0.26 * multiplier);
  const yr4 = Math.round(base5Yr * 0.24 * multiplier);
  const yr5 = Math.round(base5Yr * 0.28 * multiplier * (prospect.rasScore > 9.0 ? 1.1 : 0.9));

  const projected5YearAV = [yr1, yr2, yr3, yr4, yr5];
  const projectedFloorAV = projected5YearAV.map((v) => Math.max(1, Math.round(v * 0.65)));
  const projectedCeilingAV = projected5YearAV.map((v) => Math.round(v * 1.45));

  const projectedYear1CapSurplusM = Number(
    (slotBaseline.avgRookieCapSurplusM * 0.25 * (posTrend.scarcityMultiplier || 1.0) * (valueDelta > 0 ? 1.2 : 0.9)).toFixed(1)
  );

  // Craft analytical rationale
  let rationale = '';
  if (valueDelta >= 4) {
    rationale = `🔥 Massive Value Steal! ${prospect.name} was rated #${prospect.rank} on consensus boards. Landed at #${pickNumber} with an immediate ${schemeFitScore}% scheme fit for ${teamProfile.teamName}.`;
  } else if (valueDelta <= -5) {
    rationale = `⚠️ Draft Reach: ${prospect.name} was projected at rank #${prospect.rank}. Selected early at #${pickNumber} to aggressively address a pressing ${prospect.position} roster hole.`;
  } else if (isTopNeed) {
    rationale = `🎯 Bullseye Fit: Perfect marriage of board value and team need. ${prospect.name} steps in as day-1 starter for ${teamProfile.teamName} at ${prospect.position}.`;
  } else {
    rationale = `💎 Best Player Available (BPA): Pure talent acquisition. ${prospect.name} brings elite ${prospect.rasScore} RAS athleticism to bolster roster depth.`;
  }

  const round = pickNumber <= 32 ? 1 : pickNumber <= 64 ? 2 : 3;

  return {
    pickNumber,
    round,
    teamKey,
    prospect,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    grade,
    gradeScore,
    valueDelta,
    valueDeltaPercent,
    schemeFitScore,
    needMet: isTopNeed || isSecondaryNeed,
    projectedYear1CapSurplusM,
    projected5YearAV,
    projectedFloorAV,
    projectedCeilingAV,
    rationale,
    isUserPick
  };
}

// 6. AI Smart Pick Generator for Automated Teams
export function getAiMockSelection(
  pickNumber: number,
  teamKey: string,
  availableProspects: DraftProspect[],
  randomnessFactor: number = 0.15
): DraftProspect {
  if (availableProspects.length === 0) return EXTENDED_CONSENSUS_PROSPECTS[0];

  const teamProfile = TEAM_DRAFT_PROFILES.find((t) => t.teamKey === teamKey);
  const topNeeds = teamProfile ? teamProfile.topNeeds : ['OT', 'WR', 'CB', 'EDGE'];
  const secondaryNeeds = teamProfile ? teamProfile.secondaryNeeds : ['DT', 'IOL'];

  // Score available prospects for this team
  const scored = availableProspects.map((p) => {
    let score = p.scoutingGrade * 1.5; // Base talent

    // Need bonus
    if (topNeeds.includes(p.position)) {
      score += 25;
    } else if (secondaryNeeds.includes(p.position)) {
      score += 12;
    }

    // Direct scheme fit bonus
    if (p.teamFits.includes(teamKey)) {
      score += 10;
    }

    // High athletic upside bonus
    if (p.rasScore >= 9.5) {
      score += 6;
    }

    // Top tier premium position bonus (QB, OT, EDGE, WR)
    if (['QB', 'OT', 'EDGE', 'WR'].includes(p.position) && pickNumber <= 15) {
      score += 8;
    }

    // Add slight controlled randomness so repeated drafts produce realistic variations
    const variance = (Math.random() - 0.5) * 30 * randomnessFactor;
    score += variance;

    return { prospect: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].prospect;
}

// 7. Dynamic AI Trade Offer Generator
export function generateAiTradeOffer(
  currentPick: MockDraftPickSlot,
  userTeamKey: string,
  availableProspects: DraftProspect[]
): SimTradeOffer | null {
  // Only trigger occasionally if top talent is still on board
  const topProspect = availableProspects[0];
  if (!topProspect) return null;

  // Find an aggressive team behind user that needs this prospect's position
  const candidateTeams = TEAM_DRAFT_PROFILES.filter((t) =>
    t.teamKey !== userTeamKey &&
    t.picks.some((p) => p > currentPick.pickNumber && p <= currentPick.pickNumber + 18) &&
    (t.topNeeds.includes(topProspect.position) || topProspect.teamFits.includes(t.teamKey))
  );

  if (candidateTeams.length === 0) return null;
  const proposingTeam = candidateTeams[Math.floor(Math.random() * candidateTeams.length)];
  const teamPicks = proposingTeam.picks.filter((p) => p > currentPick.pickNumber);

  if (teamPicks.length === 0) return null;

  const targetValue = getJimmyJohnsonValue(currentPick.pickNumber);
  const primarySwapPick = teamPicks[0];
  const primaryValue = getJimmyJohnsonValue(primarySwapPick);

  const givingPicks = [
    {
      pickNumber: primarySwapPick,
      round: primarySwapPick <= 32 ? 1 : 2,
      label: `Pick #${primarySwapPick} (Round ${primarySwapPick <= 32 ? 1 : 2})`,
      value: primaryValue
    }
  ];

  let totalOfferedValue = primaryValue;

  // Add 2nd or 3rd round sweetener if there's a deficit
  if (teamPicks.length > 1 && totalOfferedValue < targetValue * 0.95) {
    const sweetener = teamPicks[1];
    const sweetVal = getJimmyJohnsonValue(sweetener);
    givingPicks.push({
      pickNumber: sweetener,
      round: sweetener <= 32 ? 1 : sweetener <= 64 ? 2 : 3,
      label: `Pick #${sweetener} (Round ${sweetener <= 32 ? 1 : sweetener <= 64 ? 2 : 3})`,
      value: sweetVal
    });
    totalOfferedValue += sweetVal;
  } else if (totalOfferedValue < targetValue * 0.95) {
    // Add projected future pick
    const futureVal = Math.round(targetValue * 0.45);
    givingPicks.push({
      pickNumber: 18,
      round: 1,
      label: '2027 1st Round Pick (Projected #18)',
      value: futureVal
    });
    totalOfferedValue += futureVal;
  }

  const receivingPicks = [
    {
      pickNumber: currentPick.pickNumber,
      round: currentPick.round,
      label: `Pick #${currentPick.pickNumber} (Round ${currentPick.round})`,
      value: targetValue
    }
  ];

  const netValueJimmyJohnson = totalOfferedValue - targetValue;
  const fairnessRatio = Number((totalOfferedValue / Math.max(1, targetValue)).toFixed(2));

  return {
    id: `trade-offer-${currentPick.pickNumber}-${Date.now()}`,
    proposingTeamKey: proposingTeam.teamKey,
    targetTeamKey: userTeamKey,
    pickNumber: currentPick.pickNumber,
    targetProspectName: topProspect.name,
    givingPicks,
    receivingPicks,
    netValueJimmyJohnson,
    fairnessRatio,
    message: `${proposingTeam.teamName} wants to trade up to #${currentPick.pickNumber} to select ${topProspect.name} (${topProspect.position})!`
  };
}
