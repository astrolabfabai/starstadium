import { FootballPlayConcept, QuarterbackSprayProfile, TeamEpaRecord, PersonnelEfficiency, PlayByPlayEvent } from '../types';

export const FOOTBALL_PLAYS: FootballPlayConcept[] = [
  {
    id: 'four-verticals',
    name: 'Animation #1 • Four Verticals ("60 Go")',
    category: 'Pass',
    personnel: '11 Personnel (3 WR, 1 TE, 1 RB)',
    formation: 'Shotgun 2x2 Open Spread',
    defensiveCoverage: 'Cover 3 Sky (Single-High Free Safety)',
    description: 'A signature vertical stretch concept that strains MOF (Middle of Field) open safety coverage by sending 4 receivers deep into 4 distinct vertical corridors.',
    keys: [
      'Pre-Snap: Identify single-high (Cover 3/Cover 1) vs 2-high safeties (Cover 2/Cover 4).',
      'Post-Snap: Slot receivers bend down the seams to isolate the deep middle Free Safety.',
      'Checkdown: RB leaks into the flat as immediate safety valve against blitz pressure.'
    ],
    progression: [
      '1. Inside Seam vs MoF Safety leverage',
      '2. Boundary Outside Go route vs single coverage',
      '3. Field Slot post-bend',
      '4. RB Underneath Checkdown'
    ],
    emoji: '🚀',
    losYard: 35,
    firstDownYard: 45,
    offensiveNodes: [
      // QB
      { id: 'qb', label: 'QB', position: 'QB', role: 'QB', startX: 30, startY: 26.6, routePath: [{ x: 30, y: 26.6 }], actionText: '3-Step Drop & Seam Read' },
      // RB
      { id: 'rb', label: 'RB', position: 'RB', role: 'RB', startX: 30, startY: 22, routePath: [{ x: 32, y: 22 }, { x: 36, y: 15 }, { x: 38, y: 10 }], passTarget: false, actionText: 'Check-Release Flat' },
      // Offensive Line
      { id: 'lt', label: 'LT', position: 'LT', role: 'OL', startX: 35, startY: 20 },
      { id: 'lg', label: 'LG', position: 'LG', role: 'OL', startX: 35, startY: 23 },
      { id: 'c', label: 'C', position: 'C', role: 'OL', startX: 35, startY: 26.6 },
      { id: 'rg', label: 'RG', position: 'RG', role: 'OL', startX: 35, startY: 30 },
      { id: 'rt', label: 'RT', position: 'RT', role: 'OL', startX: 35, startY: 33 },
      // Receivers
      { id: 'wr-x', label: 'WR (X)', position: 'WR', role: 'WR', startX: 35, startY: 6, routePath: [{ x: 45, y: 6 }, { x: 60, y: 5 }, { x: 75, y: 5 }], passTarget: true, actionText: 'Boundary Go / Fade' },
      { id: 'wr-h', label: 'SLOT (H)', position: 'WR', role: 'WR', startX: 35, startY: 15, routePath: [{ x: 45, y: 16 }, { x: 62, y: 20 }, { x: 78, y: 22 }], passTarget: true, actionText: 'Left Seam Bender' },
      { id: 'te-y', label: 'TE (Y)', position: 'TE', role: 'TE', startX: 35, startY: 36, routePath: [{ x: 45, y: 36 }, { x: 62, y: 32 }, { x: 78, y: 30 }], passTarget: true, actionText: 'Right Seam Lock' },
      { id: 'wr-z', label: 'WR (Z)', position: 'WR', role: 'WR', startX: 35, startY: 47, routePath: [{ x: 45, y: 47 }, { x: 60, y: 48 }, { x: 75, y: 48 }], passTarget: true, actionText: 'Field Outside Fly' }
    ],
    defensiveNodes: [
      { id: 'de-l', label: 'DE', position: 'DE', role: 'DL', startX: 36.5, startY: 20 },
      { id: 'dt-l', label: 'DT', position: 'DT', role: 'DL', startX: 36.5, startY: 24 },
      { id: 'dt-r', label: 'DT', position: 'DT', role: 'DL', startX: 36.5, startY: 29 },
      { id: 'de-r', label: 'EDGE', position: 'EDGE', role: 'DL', startX: 36.5, startY: 34 },
      { id: 'wlb', label: 'WLB', position: 'LB', role: 'LB', startX: 40, startY: 18 },
      { id: 'mlb', label: 'MLB', position: 'LB', role: 'LB', startX: 40, startY: 26.6 },
      { id: 'slb', label: 'SLB', position: 'LB', role: 'LB', startX: 40, startY: 34 },
      { id: 'cb-l', label: 'CB1', position: 'CB', role: 'CB', startX: 42, startY: 6 },
      { id: 'cb-r', label: 'CB2', position: 'CB', role: 'CB', startX: 42, startY: 47 },
      { id: 'ss', label: 'SS (Box)', position: 'SS', role: 'S', startX: 43, startY: 34 },
      { id: 'fs', label: 'FS (Deep Post)', position: 'FS', role: 'S', startX: 55, startY: 26.6 }
    ]
  },
  {
    id: 'mesh-crossing',
    name: 'Animation #2 • Mesh Concept ("92 Cross")',
    category: 'Pass',
    personnel: '11 Personnel (3 WR, 1 TE, 1 RB)',
    formation: 'Shotgun 3x1 Trips Right',
    defensiveCoverage: 'Cover 2 Man Under',
    description: 'Premier high-percentage man/zone beater featuring two shallow crossing receivers who brush shoulders at 5 yards depth, setting natural rub picks against trailing defensive backs.',
    keys: [
      'Crossers must set the "mesh point" at exactly 4-5 yards depth over the center.',
      'Against Man coverage: high-speed footrace on the shallow crossing rail.',
      'Against Zone: settle into vacant windows between hook-curl linebackers.'
    ],
    progression: [
      '1. Deep Corner Route (Pre-Snap Alert vs Cover 2)',
      '2. Mesh Crosser 1 (Left to Right)',
      '3. Mesh Crosser 2 (Right to Left)',
      '4. RB Swing / Checkdown in Flat'
    ],
    emoji: '🕸️',
    losYard: 40,
    firstDownYard: 47,
    offensiveNodes: [
      { id: 'qb', label: 'QB', position: 'QB', role: 'QB', startX: 35, startY: 26.6, routePath: [{ x: 35, y: 26.6 }], actionText: 'Quick 3-Drop' },
      { id: 'rb', label: 'RB', position: 'RB', role: 'RB', startX: 35, startY: 31, routePath: [{ x: 37, y: 35 }, { x: 42, y: 44 }], passTarget: true, actionText: 'Flare Route' },
      { id: 'lt', label: 'LT', position: 'LT', role: 'OL', startX: 40, startY: 20 },
      { id: 'lg', label: 'LG', position: 'LG', role: 'OL', startX: 40, startY: 23 },
      { id: 'c', label: 'C', position: 'C', role: 'OL', startX: 40, startY: 26.6 },
      { id: 'rg', label: 'RG', position: 'RG', role: 'OL', startX: 40, startY: 30 },
      { id: 'rt', label: 'RT', position: 'RT', role: 'OL', startX: 40, startY: 33 },
      { id: 'wr-x', label: 'WR (X)', position: 'WR', role: 'WR', startX: 40, startY: 6, routePath: [{ x: 45, y: 8 }, { x: 46, y: 24 }, { x: 48, y: 38 }], passTarget: true, actionText: 'Shallow Under (Mesh 1)' },
      { id: 'wr-slot1', label: 'SLOT 1', position: 'WR', role: 'WR', startX: 40, startY: 38, routePath: [{ x: 45, y: 36 }, { x: 46, y: 25 }, { x: 48, y: 12 }], passTarget: true, actionText: 'Shallow Over (Mesh 2)' },
      { id: 'wr-slot2', label: 'SLOT 2', position: 'WR', role: 'WR', startX: 40, startY: 43, routePath: [{ x: 48, y: 43 }, { x: 55, y: 40 }, { x: 60, y: 35 }], passTarget: false, actionText: 'Dig / Sit at 12 yds' },
      { id: 'wr-z', label: 'WR (Z)', position: 'WR', role: 'WR', startX: 40, startY: 48, routePath: [{ x: 50, y: 48 }, { x: 62, y: 50 }], passTarget: true, actionText: 'Deep Corner Fade' }
    ],
    defensiveNodes: [
      { id: 'de-l', label: 'DE', position: 'DE', role: 'DL', startX: 41.5, startY: 20 },
      { id: 'dt-l', label: 'DT', position: 'DT', role: 'DL', startX: 41.5, startY: 24 },
      { id: 'dt-r', label: 'DT', position: 'DT', role: 'DL', startX: 41.5, startY: 29 },
      { id: 'de-r', label: 'EDGE', position: 'EDGE', role: 'DL', startX: 41.5, startY: 34 },
      { id: 'wlb', label: 'WLB', position: 'LB', role: 'LB', startX: 45, startY: 18 },
      { id: 'mlb', label: 'MLB', position: 'LB', role: 'LB', startX: 46, startY: 26.6 },
      { id: 'cb-x', label: 'CB1', position: 'CB', role: 'CB', startX: 43, startY: 6 },
      { id: 'nb', label: 'NICKEL', position: 'CB', role: 'CB', startX: 43, startY: 38 },
      { id: 'cb-z', label: 'CB2', position: 'CB', role: 'CB', startX: 43, startY: 48 },
      { id: 'ss', label: 'SS (Deep Half)', position: 'SS', role: 'S', startX: 58, startY: 16 },
      { id: 'fs', label: 'FS (Deep Half)', position: 'FS', role: 'S', startX: 58, startY: 38 }
    ]
  },
  {
    id: 'pa-bootleg-wheel',
    name: 'Animation #3 • Play-Action Bootleg & Wheel ("Naked 7")',
    category: 'Play Action',
    personnel: '12 Personnel (2 TE, 2 WR, 1 RB)',
    formation: 'Pistol Heavy 2-TE Left',
    defensiveCoverage: 'Cover 1 Man Blitz / 4-3 Over',
    description: 'Shanahan-tree outside zone play fake that turns the defensive line and linebackers flow to the left while QB boots naked right, hitting the leaking TE on a corner-wheel combination.',
    keys: [
      'Aggressive offensive line zone-step left sells the stretch rush to flow linebackers.',
      'QB sells the mesh belly fake to the RB before rolling naked to the right perimeter.',
      'High-low flood stretch: 1) Deep Corner (18 yds), 2) Crosser (10 yds), 3) Flat (3 yds).'
    ],
    progression: [
      '1. Deep Wheel / Over Route by TE2',
      '2. Intermediate Sail Route (12-14 yds)',
      '3. Leaking FB/TE in Flat (5 yds)',
      '4. QB Scramble Run for 1st Down'
    ],
    emoji: '🎯',
    losYard: 30,
    firstDownYard: 38,
    offensiveNodes: [
      { id: 'qb', label: 'QB', position: 'QB', role: 'QB', startX: 26, startY: 26.6, routePath: [{ x: 26, y: 22 }, { x: 25, y: 36 }, { x: 28, y: 44 }], actionText: 'Zone Fake & Boot Right' },
      { id: 'rb', label: 'RB', position: 'RB', role: 'RB', startX: 23, startY: 26.6, routePath: [{ x: 28, y: 18 }, { x: 33, y: 12 }], actionText: 'Hard Outside Zone Fake Left' },
      { id: 'te-1', label: 'TE 1 (Y)', position: 'TE', role: 'TE', startX: 30, startY: 16, routePath: [{ x: 32, y: 18 }, { x: 35, y: 32 }, { x: 42, y: 44 }], passTarget: true, actionText: 'Sneak Across / Slide Flat' },
      { id: 'te-2', label: 'TE 2 (F)', position: 'TE', role: 'TE', startX: 30, startY: 13, routePath: [{ x: 35, y: 13 }, { x: 46, y: 24 }, { x: 56, y: 42 }], passTarget: true, actionText: 'Deep Over / Crossing Wheel' },
      { id: 'lt', label: 'LT', position: 'LT', role: 'OL', startX: 30, startY: 20 },
      { id: 'lg', label: 'LG', position: 'LG', role: 'OL', startX: 30, startY: 23 },
      { id: 'c', label: 'C', position: 'C', role: 'OL', startX: 30, startY: 26.6 },
      { id: 'rg', label: 'RG', position: 'RG', role: 'OL', startX: 30, startY: 30 },
      { id: 'rt', label: 'RT', position: 'RT', role: 'OL', startX: 30, startY: 33 },
      { id: 'wr-x', label: 'WR (X)', position: 'WR', role: 'WR', startX: 30, startY: 6, routePath: [{ x: 42, y: 6 }, { x: 45, y: 6 }], actionText: 'Clearout Post' },
      { id: 'wr-z', label: 'WR (Z)', position: 'WR', role: 'WR', startX: 30, startY: 48, routePath: [{ x: 42, y: 48 }, { x: 46, y: 40 }, { x: 50, y: 46 }], passTarget: true, actionText: 'Deep Comeback / Sail' }
    ],
    defensiveNodes: [
      { id: 'de-l', label: 'DE (Bitten)', position: 'DE', role: 'DL', startX: 31.5, startY: 16 },
      { id: 'dt-l', label: 'DT', position: 'DT', role: 'DL', startX: 31.5, startY: 22 },
      { id: 'dt-r', label: 'DT', position: 'DT', role: 'DL', startX: 31.5, startY: 28 },
      { id: 'de-r', label: 'EDGE (Chasing)', position: 'EDGE', role: 'DL', startX: 31.5, startY: 34 },
      { id: 'wlb', label: 'WLB', position: 'LB', role: 'LB', startX: 35, startY: 18 },
      { id: 'mlb', label: 'MLB', position: 'LB', role: 'LB', startX: 35, startY: 24 },
      { id: 'slb', label: 'SLB', position: 'LB', role: 'LB', startX: 35, startY: 32 },
      { id: 'cb-l', label: 'CB1', position: 'CB', role: 'CB', startX: 38, startY: 6 },
      { id: 'cb-r', label: 'CB2', position: 'CB', role: 'CB', startX: 38, startY: 48 },
      { id: 'ss', label: 'SS', position: 'SS', role: 'S', startX: 42, startY: 32 },
      { id: 'fs', label: 'FS', position: 'FS', role: 'S', startX: 52, startY: 26.6 }
    ]
  },
  {
    id: 'inside-zone-rpo',
    name: 'Animation #4 • Inside Zone RPO Bubble ("Read Stick")',
    category: 'RPO',
    personnel: '11 Personnel (3 WR, 1 TE, 1 RB)',
    formation: 'Shotgun Offset Left',
    defensiveCoverage: 'Cover 4 Quarters / Light Box',
    description: 'Modern triple-threat Run-Pass Option that puts the second-level conflict defender (Overhang Apex Linebacker) in an impossible bind.',
    keys: [
      'If Conflict LB attacks box to stop RB: QB pulls ball and throws instant bubble/slant.',
      'If Conflict LB drops into coverage window: QB hands off inside zone into 5-man box.',
      'Offensive line run blocks full speed (must not be >1 yard downfield before pass).'
    ],
    progression: [
      '1. Read Overhang Defender (Apex Sam/Nickel)',
      '2. Give: Inside Zone A/B Gap Cutback',
      '3. Pull & Throw: Perimeter Bubble Screen'
    ],
    emoji: '⚡',
    losYard: 45,
    firstDownYard: 52,
    offensiveNodes: [
      { id: 'qb', label: 'QB', position: 'QB', role: 'QB', startX: 40, startY: 26.6, routePath: [{ x: 41, y: 26.6 }], actionText: 'Read Conflict LB' },
      { id: 'rb', label: 'RB', position: 'RB', role: 'RB', startX: 40, startY: 22, routePath: [{ x: 44, y: 25 }, { x: 50, y: 26 }], actionText: 'Inside Zone Mesh' },
      { id: 'lt', label: 'LT', position: 'LT', role: 'OL', startX: 45, startY: 20 },
      { id: 'lg', label: 'LG', position: 'LG', role: 'OL', startX: 45, startY: 23 },
      { id: 'c', label: 'C', position: 'C', role: 'OL', startX: 45, startY: 26.6 },
      { id: 'rg', label: 'RG', position: 'RG', role: 'OL', startX: 45, startY: 30 },
      { id: 'rt', label: 'RT', position: 'RT', role: 'OL', startX: 45, startY: 33 },
      { id: 'wr-x', label: 'WR (X)', position: 'WR', role: 'WR', startX: 45, startY: 6, routePath: [{ x: 50, y: 8 }, { x: 53, y: 12 }], passTarget: true, actionText: 'Glance / Quick Slant' },
      { id: 'te-y', label: 'TE (Y)', position: 'TE', role: 'TE', startX: 45, startY: 35, routePath: [{ x: 46, y: 35 }], actionText: 'C-Gap Seal' },
      { id: 'wr-slot', label: 'SLOT (H)', position: 'WR', role: 'WR', startX: 45, startY: 42, routePath: [{ x: 44, y: 46 }, { x: 47, y: 49 }], passTarget: true, actionText: 'Perimeter Bubble Screen' },
      { id: 'wr-z', label: 'WR (Z)', position: 'WR', role: 'WR', startX: 45, startY: 48, routePath: [{ x: 47, y: 48 }, { x: 48, y: 46 }], actionText: 'Stalk Block CB' }
    ],
    defensiveNodes: [
      { id: 'de-l', label: 'DE', position: 'DE', role: 'DL', startX: 46.5, startY: 20 },
      { id: 'dt-l', label: 'DT', position: 'DT', role: 'DL', startX: 46.5, startY: 24 },
      { id: 'dt-r', label: 'DT', position: 'DT', role: 'DL', startX: 46.5, startY: 29 },
      { id: 'de-r', label: 'EDGE', position: 'EDGE', role: 'DL', startX: 46.5, startY: 34 },
      { id: 'wlb', label: 'WLB', position: 'LB', role: 'LB', startX: 49, startY: 18 },
      { id: 'mlb', label: 'MLB', position: 'LB', role: 'LB', startX: 49, startY: 26.6 },
      { id: 'apex', label: 'APEX (Conflict)', position: 'LB', role: 'LB', startX: 48, startY: 39 },
      { id: 'cb-l', label: 'CB1', position: 'CB', role: 'CB', startX: 50, startY: 6 },
      { id: 'cb-r', label: 'CB2', position: 'CB', role: 'CB', startX: 50, startY: 48 },
      { id: 'ss', label: 'SS (Quarters)', position: 'SS', role: 'S', startX: 57, startY: 20 },
      { id: 'fs', label: 'FS (Quarters)', position: 'FS', role: 'S', startX: 57, startY: 38 }
    ]
  },
  {
    id: 'smash-fade-redzone',
    name: 'Animation #5 • Red Zone Smash & High-Low Fade',
    category: 'Pass',
    personnel: '11 Personnel (3 WR, 1 TE, 1 RB)',
    formation: 'Shotgun Bunch Right Compressed',
    defensiveCoverage: 'Goal Line Cover 0 / Press Man',
    description: 'High-leverage red zone package attacking tight coverages near the goal line with a quick 5-yard hitch and a high-arcing corner fade into the pylon.',
    keys: [
      'Compressed bunch formation forces defensive confusion on switches/banjos.',
      'Point man on bunch runs flat to pin the nickel corner down.',
      'QB throws to back shoulder of the outside fade with room away from boundary.'
    ],
    progression: [
      '1. Back-Pylon Corner Fade',
      '2. Point Under Hitch (5 yds)',
      '3. Weakside Slant / Flat'
    ],
    emoji: '💥',
    losYard: 18,
    firstDownYard: 10,
    offensiveNodes: [
      { id: 'qb', label: 'QB', position: 'QB', role: 'QB', startX: 13, startY: 26.6, routePath: [{ x: 13, y: 26.6 }], actionText: 'Fade Rhythm Drop' },
      { id: 'rb', label: 'RB', position: 'RB', role: 'RB', startX: 13, startY: 22, routePath: [{ x: 16, y: 16 }, { x: 18, y: 12 }], actionText: 'Weakside Flat' },
      { id: 'lt', label: 'LT', position: 'LT', role: 'OL', startX: 18, startY: 20 },
      { id: 'lg', label: 'LG', position: 'LG', role: 'OL', startX: 18, startY: 23 },
      { id: 'c', label: 'C', position: 'C', role: 'OL', startX: 18, startY: 26.6 },
      { id: 'rg', label: 'RG', position: 'RG', role: 'OL', startX: 18, startY: 30 },
      { id: 'rt', label: 'RT', position: 'RT', role: 'OL', startX: 18, startY: 33 },
      { id: 'wr-x', label: 'WR (X)', position: 'WR', role: 'WR', startX: 18, startY: 8, routePath: [{ x: 23, y: 10 }, { x: 26, y: 16 }], passTarget: false, actionText: 'Weak Slant' },
      { id: 'te-bunch', label: 'TE (Point)', position: 'TE', role: 'TE', startX: 18, startY: 38, routePath: [{ x: 21, y: 44 }, { x: 23, y: 50 }], actionText: 'Flat / Rub Route' },
      { id: 'wr-h', label: 'SLOT (H)', position: 'WR', role: 'WR', startX: 18, startY: 41, routePath: [{ x: 23, y: 41 }, { x: 23, y: 40 }], passTarget: true, actionText: '5-Yard Hitch Sit' },
      { id: 'wr-z', label: 'WR (Z)', position: 'WR', role: 'WR', startX: 18, startY: 44, routePath: [{ x: 23, y: 44 }, { x: 28, y: 49 }, { x: 32, y: 51 }], passTarget: true, actionText: 'High Corner Fade to Pylon' }
    ],
    defensiveNodes: [
      { id: 'de-l', label: 'DE', position: 'DE', role: 'DL', startX: 19.5, startY: 20 },
      { id: 'dt-l', label: 'DT', position: 'DT', role: 'DL', startX: 19.5, startY: 24 },
      { id: 'dt-r', label: 'DT', position: 'DT', role: 'DL', startX: 19.5, startY: 29 },
      { id: 'de-r', label: 'EDGE', position: 'EDGE', role: 'DL', startX: 19.5, startY: 34 },
      { id: 'mlb', label: 'MLB (Blitz)', position: 'LB', role: 'LB', startX: 21, startY: 26.6 },
      { id: 'wlb', label: 'WLB (Blitz)', position: 'LB', role: 'LB', startX: 21, startY: 18 },
      { id: 'cb-x', label: 'CB1 (Press)', position: 'CB', role: 'CB', startX: 19.5, startY: 8 },
      { id: 'cb-z', label: 'CB2 (Press)', position: 'CB', role: 'CB', startX: 19.5, startY: 44 },
      { id: 'nb', label: 'NICKEL', position: 'CB', role: 'CB', startX: 20, startY: 39 },
      { id: 'ss', label: 'SS (Low Hole)', position: 'SS', role: 'S', startX: 23, startY: 32 },
      { id: 'fs', label: 'FS (Endzone)', position: 'FS', role: 'S', startX: 26, startY: 26.6 }
    ]
  }
];

export const QB_SPRAY_CHARTS: QuarterbackSprayProfile[] = [
  {
    qbName: 'Patrick Mahomes',
    teamKey: 'KC',
    season: '2026REG',
    totalAttempts: 597,
    completionPct: 67.8,
    passerRating: 104.5,
    airYardsPerAtt: 7.9,
    zones: [
      { zoneId: 'BLOS_L', zoneName: 'Behind LoS (Left)', depth: 'Behind LOS', location: 'Left', attempts: 38, completions: 34, compPct: 89.5, yards: 245, touchdowns: 2, interceptions: 0, passerRating: 105.4, epaPerAttempt: 0.12 },
      { zoneId: 'BLOS_M', zoneName: 'Behind LoS (Middle)', depth: 'Behind LOS', location: 'Middle', attempts: 18, completions: 17, compPct: 94.4, yards: 110, touchdowns: 1, interceptions: 0, passerRating: 102.1, epaPerAttempt: 0.08 },
      { zoneId: 'BLOS_R', zoneName: 'Behind LoS (Right)', depth: 'Behind LOS', location: 'Right', attempts: 42, completions: 39, compPct: 92.9, yards: 280, touchdowns: 3, interceptions: 0, passerRating: 112.5, epaPerAttempt: 0.15 },
      
      { zoneId: 'SH_L', zoneName: 'Short Left (0-10 yds)', depth: 'Short (0-10)', location: 'Left', attempts: 75, completions: 58, compPct: 77.3, yards: 460, touchdowns: 5, interceptions: 1, passerRating: 101.0, epaPerAttempt: 0.18 },
      { zoneId: 'SH_M', zoneName: 'Short Middle (0-10 yds)', depth: 'Short (0-10)', location: 'Middle', attempts: 88, completions: 72, compPct: 81.8, yards: 640, touchdowns: 7, interceptions: 2, passerRating: 108.4, epaPerAttempt: 0.28 },
      { zoneId: 'SH_R', zoneName: 'Short Right (0-10 yds)', depth: 'Short (0-10)', location: 'Right', attempts: 80, completions: 62, compPct: 77.5, yards: 510, touchdowns: 6, interceptions: 1, passerRating: 104.2, epaPerAttempt: 0.22 },

      { zoneId: 'INT_L', zoneName: 'Intermediate Left (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Left', attempts: 52, completions: 32, compPct: 61.5, yards: 512, touchdowns: 4, interceptions: 2, passerRating: 95.8, epaPerAttempt: 0.35 },
      { zoneId: 'INT_M', zoneName: 'Intermediate Middle (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Middle', attempts: 68, completions: 47, compPct: 69.1, yards: 780, touchdowns: 6, interceptions: 1, passerRating: 122.5, epaPerAttempt: 0.52 },
      { zoneId: 'INT_R', zoneName: 'Intermediate Right (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Right', attempts: 55, completions: 36, compPct: 65.5, yards: 565, touchdowns: 5, interceptions: 2, passerRating: 102.3, epaPerAttempt: 0.38 },

      { zoneId: 'DP_L', zoneName: 'Deep Left (20+ yds)', depth: 'Deep (20+)', location: 'Left', attempts: 26, completions: 11, compPct: 42.3, yards: 380, touchdowns: 3, interceptions: 1, passerRating: 104.2, epaPerAttempt: 0.44 },
      { zoneId: 'DP_M', zoneName: 'Deep Middle (20+ yds)', depth: 'Deep (20+)', location: 'Middle', attempts: 29, completions: 15, compPct: 51.7, yards: 540, touchdowns: 5, interceptions: 1, passerRating: 125.4, epaPerAttempt: 0.72 },
      { zoneId: 'DP_R', zoneName: 'Deep Right (20+ yds)', depth: 'Deep (20+)', location: 'Right', attempts: 26, completions: 12, compPct: 46.2, yards: 410, touchdowns: 3, interceptions: 1, passerRating: 110.6, epaPerAttempt: 0.49 }
    ]
  },
  {
    qbName: 'Josh Allen',
    teamKey: 'BUF',
    season: '2026REG',
    totalAttempts: 562,
    completionPct: 66.5,
    passerRating: 102.8,
    airYardsPerAtt: 8.7,
    zones: [
      { zoneId: 'BLOS_L', zoneName: 'Behind LoS (Left)', depth: 'Behind LOS', location: 'Left', attempts: 32, completions: 29, compPct: 90.6, yards: 195, touchdowns: 1, interceptions: 0, passerRating: 98.4, epaPerAttempt: 0.05 },
      { zoneId: 'BLOS_M', zoneName: 'Behind LoS (Middle)', depth: 'Behind LOS', location: 'Middle', attempts: 14, completions: 13, compPct: 92.9, yards: 85, touchdowns: 1, interceptions: 0, passerRating: 100.2, epaPerAttempt: 0.04 },
      { zoneId: 'BLOS_R', zoneName: 'Behind LoS (Right)', depth: 'Behind LOS', location: 'Right', attempts: 36, completions: 33, compPct: 91.7, yards: 220, touchdowns: 2, interceptions: 0, passerRating: 105.1, epaPerAttempt: 0.11 },

      { zoneId: 'SH_L', zoneName: 'Short Left (0-10 yds)', depth: 'Short (0-10)', location: 'Left', attempts: 68, completions: 50, compPct: 73.5, yards: 410, touchdowns: 4, interceptions: 2, passerRating: 91.2, epaPerAttempt: 0.14 },
      { zoneId: 'SH_M', zoneName: 'Short Middle (0-10 yds)', depth: 'Short (0-10)', location: 'Middle', attempts: 78, completions: 61, compPct: 78.2, yards: 580, touchdowns: 6, interceptions: 1, passerRating: 107.5, epaPerAttempt: 0.25 },
      { zoneId: 'SH_R', zoneName: 'Short Right (0-10 yds)', depth: 'Short (0-10)', location: 'Right', attempts: 74, completions: 56, compPct: 75.7, yards: 460, touchdowns: 5, interceptions: 2, passerRating: 97.4, epaPerAttempt: 0.19 },

      { zoneId: 'INT_L', zoneName: 'Intermediate Left (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Left', attempts: 50, completions: 31, compPct: 62.0, yards: 490, touchdowns: 4, interceptions: 2, passerRating: 96.2, epaPerAttempt: 0.32 },
      { zoneId: 'INT_M', zoneName: 'Intermediate Middle (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Middle', attempts: 62, completions: 42, compPct: 67.7, yards: 710, touchdowns: 5, interceptions: 2, passerRating: 110.8, epaPerAttempt: 0.46 },
      { zoneId: 'INT_R', zoneName: 'Intermediate Right (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Right', attempts: 58, completions: 37, compPct: 63.8, yards: 590, touchdowns: 6, interceptions: 2, passerRating: 104.5, epaPerAttempt: 0.39 },

      { zoneId: 'DP_L', zoneName: 'Deep Left (20+ yds)', depth: 'Deep (20+)', location: 'Left', attempts: 32, completions: 15, compPct: 46.9, yards: 520, touchdowns: 5, interceptions: 2, passerRating: 114.2, epaPerAttempt: 0.58 },
      { zoneId: 'DP_M', zoneName: 'Deep Middle (20+ yds)', depth: 'Deep (20+)', location: 'Middle', attempts: 25, completions: 12, compPct: 48.0, yards: 440, touchdowns: 4, interceptions: 1, passerRating: 118.0, epaPerAttempt: 0.65 },
      { zoneId: 'DP_R', zoneName: 'Deep Right (20+ yds)', depth: 'Deep (20+)', location: 'Right', attempts: 33, completions: 16, compPct: 48.5, yards: 560, touchdowns: 5, interceptions: 2, passerRating: 117.8, epaPerAttempt: 0.61 }
    ]
  },
  {
    qbName: 'Lamar Jackson',
    teamKey: 'BAL',
    season: '2026REG',
    totalAttempts: 480,
    completionPct: 69.2,
    passerRating: 108.9,
    airYardsPerAtt: 8.2,
    zones: [
      { zoneId: 'BLOS_L', zoneName: 'Behind LoS (Left)', depth: 'Behind LOS', location: 'Left', attempts: 28, completions: 26, compPct: 92.9, yards: 180, touchdowns: 1, interceptions: 0, passerRating: 101.5, epaPerAttempt: 0.09 },
      { zoneId: 'BLOS_M', zoneName: 'Behind LoS (Middle)', depth: 'Behind LOS', location: 'Middle', attempts: 16, completions: 15, compPct: 93.8, yards: 105, touchdowns: 1, interceptions: 0, passerRating: 103.4, epaPerAttempt: 0.07 },
      { zoneId: 'BLOS_R', zoneName: 'Behind LoS (Right)', depth: 'Behind LOS', location: 'Right', attempts: 30, completions: 28, compPct: 93.3, yards: 210, touchdowns: 2, interceptions: 0, passerRating: 108.2, epaPerAttempt: 0.12 },

      { zoneId: 'SH_L', zoneName: 'Short Left (0-10 yds)', depth: 'Short (0-10)', location: 'Left', attempts: 58, completions: 44, compPct: 75.9, yards: 380, touchdowns: 3, interceptions: 1, passerRating: 96.8, epaPerAttempt: 0.16 },
      { zoneId: 'SH_M', zoneName: 'Short Middle (0-10 yds)', depth: 'Short (0-10)', location: 'Middle', attempts: 72, completions: 60, compPct: 83.3, yards: 590, touchdowns: 8, interceptions: 1, passerRating: 121.2, epaPerAttempt: 0.36 },
      { zoneId: 'SH_R', zoneName: 'Short Right (0-10 yds)', depth: 'Short (0-10)', location: 'Right', attempts: 60, completions: 47, compPct: 78.3, yards: 420, touchdowns: 4, interceptions: 1, passerRating: 102.5, epaPerAttempt: 0.21 },

      { zoneId: 'INT_L', zoneName: 'Intermediate Left (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Left', attempts: 44, completions: 29, compPct: 65.9, yards: 440, touchdowns: 3, interceptions: 1, passerRating: 104.8, epaPerAttempt: 0.38 },
      { zoneId: 'INT_M', zoneName: 'Intermediate Middle (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Middle', attempts: 56, completions: 41, compPct: 73.2, yards: 690, touchdowns: 7, interceptions: 1, passerRating: 136.5, epaPerAttempt: 0.62 },
      { zoneId: 'INT_R', zoneName: 'Intermediate Right (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Right', attempts: 48, completions: 31, compPct: 64.6, yards: 480, touchdowns: 4, interceptions: 1, passerRating: 108.2, epaPerAttempt: 0.41 },

      { zoneId: 'DP_L', zoneName: 'Deep Left (20+ yds)', depth: 'Deep (20+)', location: 'Left', attempts: 22, completions: 10, compPct: 45.5, yards: 360, touchdowns: 3, interceptions: 1, passerRating: 108.4, epaPerAttempt: 0.52 },
      { zoneId: 'DP_M', zoneName: 'Deep Middle (20+ yds)', depth: 'Deep (20+)', location: 'Middle', attempts: 24, completions: 14, compPct: 58.3, yards: 510, touchdowns: 6, interceptions: 0, passerRating: 147.2, epaPerAttempt: 0.88 },
      { zoneId: 'DP_R', zoneName: 'Deep Right (20+ yds)', depth: 'Deep (20+)', location: 'Right', attempts: 22, completions: 9, compPct: 40.9, yards: 310, touchdowns: 2, interceptions: 1, passerRating: 94.8, epaPerAttempt: 0.42 }
    ]
  },
  {
    qbName: 'Joe Burrow',
    teamKey: 'CIN',
    season: '2026REG',
    totalAttempts: 580,
    completionPct: 70.4,
    passerRating: 106.1,
    airYardsPerAtt: 7.4,
    zones: [
      { zoneId: 'BLOS_L', zoneName: 'Behind LoS (Left)', depth: 'Behind LOS', location: 'Left', attempts: 36, completions: 34, compPct: 94.4, yards: 220, touchdowns: 2, interceptions: 0, passerRating: 106.2, epaPerAttempt: 0.10 },
      { zoneId: 'BLOS_M', zoneName: 'Behind LoS (Middle)', depth: 'Behind LOS', location: 'Middle', attempts: 20, completions: 19, compPct: 95.0, yards: 125, touchdowns: 1, interceptions: 0, passerRating: 104.8, epaPerAttempt: 0.09 },
      { zoneId: 'BLOS_R', zoneName: 'Behind LoS (Right)', depth: 'Behind LOS', location: 'Right', attempts: 40, completions: 38, compPct: 95.0, yards: 260, touchdowns: 3, interceptions: 0, passerRating: 114.2, epaPerAttempt: 0.14 },

      { zoneId: 'SH_L', zoneName: 'Short Left (0-10 yds)', depth: 'Short (0-10)', location: 'Left', attempts: 82, completions: 66, compPct: 80.5, yards: 520, touchdowns: 6, interceptions: 1, passerRating: 107.5, epaPerAttempt: 0.22 },
      { zoneId: 'SH_M', zoneName: 'Short Middle (0-10 yds)', depth: 'Short (0-10)', location: 'Middle', attempts: 84, completions: 71, compPct: 84.5, yards: 660, touchdowns: 7, interceptions: 1, passerRating: 115.4, epaPerAttempt: 0.32 },
      { zoneId: 'SH_R', zoneName: 'Short Right (0-10 yds)', depth: 'Short (0-10)', location: 'Right', attempts: 86, completions: 69, compPct: 80.2, yards: 560, touchdowns: 7, interceptions: 1, passerRating: 110.8, epaPerAttempt: 0.26 },

      { zoneId: 'INT_L', zoneName: 'Intermediate Left (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Left', attempts: 54, completions: 36, compPct: 66.7, yards: 560, touchdowns: 5, interceptions: 1, passerRating: 114.2, epaPerAttempt: 0.44 },
      { zoneId: 'INT_M', zoneName: 'Intermediate Middle (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Middle', attempts: 60, completions: 43, compPct: 71.7, yards: 720, touchdowns: 6, interceptions: 1, passerRating: 127.8, epaPerAttempt: 0.56 },
      { zoneId: 'INT_R', zoneName: 'Intermediate Right (11-19 yds)', depth: 'Intermediate (11-19)', location: 'Right', attempts: 56, completions: 38, compPct: 67.9, yards: 590, touchdowns: 5, interceptions: 1, passerRating: 116.5, epaPerAttempt: 0.47 },

      { zoneId: 'DP_L', zoneName: 'Deep Left (20+ yds)', depth: 'Deep (20+)', location: 'Left', attempts: 24, completions: 10, compPct: 41.7, yards: 340, touchdowns: 3, interceptions: 1, passerRating: 101.4, epaPerAttempt: 0.40 },
      { zoneId: 'DP_M', zoneName: 'Deep Middle (20+ yds)', depth: 'Deep (20+)', location: 'Middle', attempts: 18, completions: 9, compPct: 50.0, yards: 320, touchdowns: 3, interceptions: 0, passerRating: 133.6, epaPerAttempt: 0.70 },
      { zoneId: 'DP_R', zoneName: 'Deep Right (20+ yds)', depth: 'Deep (20+)', location: 'Right', attempts: 20, completions: 9, compPct: 45.0, yards: 310, touchdowns: 3, interceptions: 1, passerRating: 108.3, epaPerAttempt: 0.48 }
    ]
  }
];

export const TEAM_EPA_DATA: TeamEpaRecord[] = [
  { teamKey: 'KC', teamName: 'Chiefs', dropbackEpa: 0.24, rushEpa: 0.04, overallOffensiveEpa: 0.16, defensiveEpaAllowed: -0.12, successRate: 52.4, earlyDownEpa: 0.14, thirdDownEpa: 0.22, explosivePlayPct: 14.8 },
  { teamKey: 'BAL', teamName: 'Ravens', dropbackEpa: 0.26, rushEpa: 0.12, overallOffensiveEpa: 0.19, defensiveEpaAllowed: -0.09, successRate: 54.1, earlyDownEpa: 0.18, thirdDownEpa: 0.21, explosivePlayPct: 16.2 },
  { teamKey: 'BUF', teamName: 'Bills', dropbackEpa: 0.22, rushEpa: 0.06, overallOffensiveEpa: 0.15, defensiveEpaAllowed: -0.07, successRate: 51.6, earlyDownEpa: 0.12, thirdDownEpa: 0.24, explosivePlayPct: 15.1 },
  { teamKey: 'DET', teamName: 'Lions', dropbackEpa: 0.21, rushEpa: 0.09, overallOffensiveEpa: 0.17, defensiveEpaAllowed: -0.05, successRate: 53.0, earlyDownEpa: 0.16, thirdDownEpa: 0.19, explosivePlayPct: 15.5 },
  { teamKey: 'SF', teamName: '49ers', dropbackEpa: 0.19, rushEpa: 0.05, overallOffensiveEpa: 0.13, defensiveEpaAllowed: -0.10, successRate: 50.8, earlyDownEpa: 0.15, thirdDownEpa: 0.10, explosivePlayPct: 14.2 },
  { teamKey: 'PHI', teamName: 'Eagles', dropbackEpa: 0.16, rushEpa: 0.08, overallOffensiveEpa: 0.12, defensiveEpaAllowed: -0.08, successRate: 49.9, earlyDownEpa: 0.11, thirdDownEpa: 0.16, explosivePlayPct: 13.9 },
  { teamKey: 'HOU', teamName: 'Texans', dropbackEpa: 0.18, rushEpa: -0.02, overallOffensiveEpa: 0.09, defensiveEpaAllowed: -0.11, successRate: 47.8, earlyDownEpa: 0.08, thirdDownEpa: 0.14, explosivePlayPct: 14.5 },
  { teamKey: 'GB', teamName: 'Packers', dropbackEpa: 0.15, rushEpa: 0.03, overallOffensiveEpa: 0.10, defensiveEpaAllowed: -0.04, successRate: 48.9, earlyDownEpa: 0.09, thirdDownEpa: 0.12, explosivePlayPct: 13.6 },
  { teamKey: 'CIN', teamName: 'Bengals', dropbackEpa: 0.20, rushEpa: -0.04, overallOffensiveEpa: 0.10, defensiveEpaAllowed: 0.02, successRate: 49.2, earlyDownEpa: 0.07, thirdDownEpa: 0.18, explosivePlayPct: 14.0 },
  { teamKey: 'WAS', teamName: 'Commanders', dropbackEpa: 0.17, rushEpa: 0.07, overallOffensiveEpa: 0.13, defensiveEpaAllowed: 0.01, successRate: 50.4, earlyDownEpa: 0.12, thirdDownEpa: 0.15, explosivePlayPct: 14.7 },
  { teamKey: 'MIN', teamName: 'Vikings', dropbackEpa: 0.14, rushEpa: -0.01, overallOffensiveEpa: 0.07, defensiveEpaAllowed: -0.14, successRate: 47.1, earlyDownEpa: 0.06, thirdDownEpa: 0.11, explosivePlayPct: 13.2 },
  { teamKey: 'PIT', teamName: 'Steelers', dropbackEpa: 0.04, rushEpa: 0.02, overallOffensiveEpa: 0.03, defensiveEpaAllowed: -0.15, successRate: 45.2, earlyDownEpa: 0.04, thirdDownEpa: 0.02, explosivePlayPct: 11.5 },
  { teamKey: 'DAL', teamName: 'Cowboys', dropbackEpa: 0.09, rushEpa: -0.08, overallOffensiveEpa: 0.02, defensiveEpaAllowed: 0.04, successRate: 44.8, earlyDownEpa: 0.01, thirdDownEpa: 0.05, explosivePlayPct: 12.0 },
  { teamKey: 'MIA', teamName: 'Dolphins', dropbackEpa: 0.12, rushEpa: 0.01, overallOffensiveEpa: 0.07, defensiveEpaAllowed: -0.03, successRate: 47.0, earlyDownEpa: 0.08, thirdDownEpa: 0.06, explosivePlayPct: 14.1 },
  { teamKey: 'DEN', teamName: 'Broncos', dropbackEpa: 0.02, rushEpa: -0.03, overallOffensiveEpa: -0.01, defensiveEpaAllowed: -0.13, successRate: 43.8, earlyDownEpa: 0.01, thirdDownEpa: -0.04, explosivePlayPct: 11.2 },
  { teamKey: 'CHI', teamName: 'Bears', dropbackEpa: 0.01, rushEpa: -0.04, overallOffensiveEpa: -0.02, defensiveEpaAllowed: -0.06, successRate: 43.1, earlyDownEpa: -0.01, thirdDownEpa: -0.02, explosivePlayPct: 11.8 },
  { teamKey: 'NYJ', teamName: 'Jets', dropbackEpa: 0.05, rushEpa: -0.06, overallOffensiveEpa: -0.01, defensiveEpaAllowed: -0.02, successRate: 44.0, earlyDownEpa: 0.02, thirdDownEpa: -0.05, explosivePlayPct: 12.3 },
  { teamKey: 'NE', teamName: 'Patriots', dropbackEpa: -0.08, rushEpa: -0.05, overallOffensiveEpa: -0.07, defensiveEpaAllowed: -0.01, successRate: 41.2, earlyDownEpa: -0.06, thirdDownEpa: -0.10, explosivePlayPct: 9.8 },
  { teamKey: 'CAR', teamName: 'Panthers', dropbackEpa: -0.10, rushEpa: -0.06, overallOffensiveEpa: -0.09, defensiveEpaAllowed: 0.15, successRate: 39.5, earlyDownEpa: -0.08, thirdDownEpa: -0.12, explosivePlayPct: 9.2 }
];

export const PERSONNEL_GROUPINGS: PersonnelEfficiency[] = [
  {
    personnel: '11 Personnel',
    code: '1 RB, 1 TE, 3 WR',
    description: 'League-wide standard spread baseline; maximum spatial versatility and spacing.',
    usagePct: 62.4,
    successRatePct: 49.2,
    yardsPerPlay: 5.6,
    passRatioPct: 68.5,
    epaPerPlay: 0.06
  },
  {
    personnel: '12 Personnel',
    code: '1 RB, 2 TE, 2 WR',
    description: 'Dual tight end sets; forces defenses into base personnel or light box dilemmas.',
    usagePct: 21.8,
    successRatePct: 51.5,
    yardsPerPlay: 5.8,
    passRatioPct: 48.0,
    epaPerPlay: 0.08
  },
  {
    personnel: '21 Personnel',
    code: '2 RB, 1 TE, 2 WR',
    description: 'Fullback/H-Back lead blocker sets creating extra gaps and play-action power.',
    usagePct: 7.2,
    successRatePct: 52.8,
    yardsPerPlay: 5.9,
    passRatioPct: 38.2,
    epaPerPlay: 0.09
  },
  {
    personnel: '13 Personnel',
    code: '1 RB, 3 TE, 1 WR',
    description: 'Jumbo heavy package; highest rushing success rate in short-yardage & red zone.',
    usagePct: 3.6,
    successRatePct: 55.4,
    yardsPerPlay: 5.1,
    passRatioPct: 22.0,
    epaPerPlay: 0.11
  },
  {
    personnel: '10 Personnel',
    code: '1 RB, 0 TE, 4 WR',
    description: '4-wide empty-style speed spread; isolates boundary nickel corners.',
    usagePct: 3.1,
    successRatePct: 46.8,
    yardsPerPlay: 5.4,
    passRatioPct: 84.0,
    epaPerPlay: 0.03
  },
  {
    personnel: '22 Personnel',
    code: '2 RB, 2 TE, 1 WR',
    description: 'Goal-line hammer package designed for 3rd/4th and 1 pile drives.',
    usagePct: 1.9,
    successRatePct: 58.0,
    yardsPerPlay: 4.2,
    passRatioPct: 15.0,
    epaPerPlay: 0.14
  }
];

export function getPlayTacticalConcept(play: PlayByPlayEvent): FootballPlayConcept {
  if (play.customTacticalConcept) {
    return play.customTacticalConcept;
  }

  // Calculate field coordinates (0 to 100: 0-10 Left Endzone, 10-60 own side, 60-90 opp side, 90-100 Right Endzone)
  let losYard = 35;
  if (play.YardLineSide === play.Possession) {
    losYard = 10 + Math.min(50, Math.max(1, play.YardLine));
  } else {
    losYard = 60 + (50 - Math.min(50, Math.max(1, play.YardLine)));
  }

  const firstDownYard = Math.min(90, Math.max(10, losYard + Math.max(1, play.Distance)));
  const targetGainYard = Math.min(90, Math.max(10, losYard + play.YardsGained));

  const isPass = play.PlayType === 'Pass' || play.Description.toLowerCase().includes('pass');
  const isRun = play.PlayType === 'Run' || play.Description.toLowerCase().includes('tackle') || play.Description.toLowerCase().includes('rush') || play.Description.toLowerCase().includes('scramble');
  const isScramble = play.Description.toLowerCase().includes('scramble');
  const isTouchdown = play.YardsGained >= 30 || play.Description.toLowerCase().includes('touchdown');

  const desc = play.Description.toLowerCase();

  // Extract names from description
  const qbMatch = play.Description.match(/\(([A-Z]\.[A-Za-z]+)\)/) || play.Description.match(/([A-Z]\.[A-Za-z]+)\s+pass/);
  const qbName = qbMatch ? qbMatch[1] : (play.Possession === 'KC' ? 'P.Mahomes' : play.Possession === 'BAL' ? 'L.Jackson' : 'QB');

  const targetMatch = play.Description.match(/to\s+([A-Z]\.[A-Za-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+)/);
  const targetName = play.targetPlayer || (targetMatch ? targetMatch[1] : 'Primary Target');

  // Build play-specific offensive and defensive nodes
  if (isRun) {
    const isLeft = desc.includes('left');
    const runnerY = isLeft ? 18 : 34;
    const runnerName = play.ballCarrier || (desc.includes('pacheco') ? 'I.Pacheco' : desc.includes('henry') ? 'D.Henry' : desc.includes('jackson') ? 'L.Jackson' : 'RB');

    return {
      id: `play-${play.PlayID}`,
      name: `${play.Possession} • ${isScramble ? 'QB Scramble Extension' : 'Inside Zone / Gap Blast'} (+${play.YardsGained} yds)`,
      category: 'Run',
      personnel: '12 Personnel (1 RB, 2 TE, 2 WR)',
      formation: 'Shotgun Offset Pistol',
      defensiveCoverage: 'Cover 1 Man (8-Man Box)',
      description: play.Description,
      keys: [
        `Ball carrier ${runnerName} attacks the ${isLeft ? 'A/B gap off Left Tackle' : 'C-gap edge'} behind double-team blocks.`,
        `Offensive line climbs to second level to seal off Mike linebacker.`,
        `Result: +${play.YardsGained} yard gain down to the ${targetGainYard - 10} yard line.`
      ],
      progression: [
        `1. Mesh handoff read at LOS yard ${losYard}`,
        `2. Cutback lane recognition`,
        `3. North-South explosion through contact`
      ],
      emoji: isScramble ? '⚡' : '🛡️',
      losYard,
      firstDownYard,
      offensiveNodes: [
        { id: 'qb', label: qbName, position: 'QB', role: 'QB', startX: losYard - 4.5, startY: 26.6, routePath: [{ x: losYard - 4, y: 26.6 }, { x: losYard - 3, y: 26.6 }], actionText: isScramble ? 'Bootleg Scramble' : 'Zone Read Mesh' },
        {
          id: 'rb',
          label: runnerName,
          position: 'RB',
          role: 'RB',
          startX: losYard - 4.5,
          startY: isLeft ? 22 : 31,
          routePath: isScramble
            ? [{ x: losYard - 2, y: runnerY }, { x: losYard + 6, y: runnerY - 4 }, { x: targetGainYard, y: runnerY - 6 }]
            : [{ x: losYard - 1, y: runnerY }, { x: losYard + 4, y: runnerY }, { x: targetGainYard, y: runnerY }],
          passTarget: true,
          actionText: `Primary Ball Carrier (+${play.YardsGained} yds)`
        },
        { id: 'lt', label: 'LT', position: 'LT', role: 'OL', startX: losYard, startY: 20, routePath: [{ x: losYard + 1.5, y: 19 }] },
        { id: 'lg', label: 'LG', position: 'LG', role: 'OL', startX: losYard, startY: 23, routePath: [{ x: losYard + 2, y: 22 }] },
        { id: 'c', label: 'C', position: 'C', role: 'OL', startX: losYard, startY: 26.6, routePath: [{ x: losYard + 1.5, y: 26.6 }] },
        { id: 'rg', label: 'RG', position: 'RG', role: 'OL', startX: losYard, startY: 30, routePath: [{ x: losYard + 2, y: 31 }] },
        { id: 'rt', label: 'RT', position: 'RT', role: 'OL', startX: losYard, startY: 33, routePath: [{ x: losYard + 1.5, y: 34 }] },
        { id: 'wr-1', label: 'WR1', position: 'WR', role: 'WR', startX: losYard, startY: 6, routePath: [{ x: losYard + 8, y: 6 }], actionText: 'Stalk Block Corner' },
        { id: 'te-1', label: 'TE1', position: 'TE', role: 'TE', startX: losYard, startY: 36, routePath: [{ x: losYard + 3, y: 36 }], actionText: 'Drive Block Edge' },
        { id: 'wr-2', label: 'WR2', position: 'WR', role: 'WR', startX: losYard, startY: 47, routePath: [{ x: losYard + 8, y: 47 }], actionText: 'Boundary Stalk Block' }
      ],
      defensiveNodes: [
        { id: 'de-l', label: 'DE', position: 'DE', role: 'DL', startX: losYard + 1.5, startY: 20 },
        { id: 'dt-l', label: 'DT', position: 'DT', role: 'DL', startX: losYard + 1.5, startY: 24 },
        { id: 'dt-r', label: 'DT', position: 'DT', role: 'DL', startX: losYard + 1.5, startY: 29 },
        { id: 'de-r', label: 'DE', position: 'DE', role: 'DL', startX: losYard + 1.5, startY: 33 },
        { id: 'mlb', label: 'MLB', position: 'LB', role: 'LB', startX: losYard + 5, startY: 26.6 },
        { id: 'wlb', label: 'WLB', position: 'LB', role: 'LB', startX: losYard + 5, startY: 20 },
        { id: 'slb', label: 'SLB', position: 'LB', role: 'LB', startX: losYard + 5, startY: 33 },
        { id: 'cb1', label: 'CB1', position: 'CB', role: 'CB', startX: losYard + 7, startY: 6 },
        { id: 'cb2', label: 'CB2', position: 'CB', role: 'CB', startX: losYard + 7, startY: 47 },
        { id: 'fs', label: 'FS', position: 'FS', role: 'S', startX: losYard + 16, startY: 26.6 }
      ]
    };
  }

  // Pass concepts
  const isDeep = isTouchdown || play.YardsGained >= 20 || desc.includes('deep');
  const isMiddle = desc.includes('middle') || desc.includes('kelce') || desc.includes('cross');
  const targetY = isMiddle ? 26.6 : desc.includes('right') ? 42 : 12;

  return {
    id: `play-${play.PlayID}`,
    name: `${play.Possession} • ${isDeep ? 'Deep Shot Strike' : isMiddle ? 'Seam Stretch / Crosser' : 'Quick Rhythm Pass'} (+${play.YardsGained} yds)`,
    category: 'Pass',
    personnel: '11 Personnel (3 WR, 1 TE, 1 RB)',
    formation: isDeep ? 'Shotgun 3x1 Trips Verticals' : 'Shotgun 2x2 Spread',
    defensiveCoverage: isDeep ? 'Cover 3 Sky' : 'Cover 2 Man Under',
    description: play.Description,
    keys: [
      `Quarterback ${qbName} takes 3/5 step drop, climbs pocket, and delivers to ${targetName}.`,
      `Target route executed to exact yard depth ${targetGainYard - 10} for +${play.YardsGained} yards.`,
      `EPA Impact: ${play.epa !== undefined && play.epa >= 0 ? `+${play.epa.toFixed(2)}` : `${play.epa ?? '+0.65'}`} • Win Probability: ${play.WinProbabilityPct}%`
    ],
    progression: [
      `1. Primary: ${targetName} on ${isDeep ? 'Deep Post / Go Route' : 'Inside Seam Route'}`,
      `2. Secondary: Boundary Dig / Comeback`,
      `3. Safety Valve: RB checkdown in the flat`
    ],
    emoji: isTouchdown ? '🏆' : isDeep ? '🚀' : '🎯',
    losYard,
    firstDownYard,
    offensiveNodes: [
      {
        id: 'qb',
        label: qbName,
        position: 'QB',
        role: 'QB',
        startX: losYard - 5,
        startY: 26.6,
        routePath: [{ x: losYard - 5, y: 26.6 }],
        actionText: 'Pocket Set & Delivery'
      },
      {
        id: 'target-wr',
        label: targetName,
        position: isMiddle ? 'TE' : 'WR',
        role: isMiddle ? 'TE' : 'WR',
        startX: losYard,
        startY: isMiddle ? 35 : targetY < 20 ? 8 : 45,
        routePath: [
          { x: losYard + 6, y: targetY },
          { x: Math.min(90, targetGainYard), y: targetY }
        ],
        passTarget: true,
        actionText: `Completed Catch for +${play.YardsGained} yds`
      },
      {
        id: 'rb',
        label: 'RB',
        position: 'RB',
        role: 'RB',
        startX: losYard - 4.5,
        startY: 22,
        routePath: [{ x: losYard + 1, y: 15 }, { x: losYard + 4, y: 10 }],
        actionText: 'Pass Block & Leak Flat'
      },
      { id: 'lt', label: 'LT', position: 'LT', role: 'OL', startX: losYard, startY: 20 },
      { id: 'lg', label: 'LG', position: 'LG', role: 'OL', startX: losYard, startY: 23 },
      { id: 'c', label: 'C', position: 'C', role: 'OL', startX: losYard, startY: 26.6 },
      { id: 'rg', label: 'RG', position: 'RG', role: 'OL', startX: losYard, startY: 30 },
      { id: 'rt', label: 'RT', position: 'RT', role: 'OL', startX: losYard, startY: 33 },
      {
        id: 'wr-x',
        label: 'WR (X)',
        position: 'WR',
        role: 'WR',
        startX: losYard,
        startY: 6,
        routePath: [{ x: losYard + 12, y: 6 }, { x: losYard + 22, y: 5 }],
        actionText: 'Clearout Go Route'
      },
      {
        id: 'wr-z',
        label: 'WR (Z)',
        position: 'WR',
        role: 'WR',
        startX: losYard,
        startY: 48,
        routePath: [{ x: losYard + 8, y: 48 }, { x: losYard + 15, y: 38 }],
        actionText: 'Backside Dig / Cross'
      }
    ],
    defensiveNodes: [
      { id: 'de-l', label: 'DE', position: 'DE', role: 'DL', startX: losYard + 1.5, startY: 20 },
      { id: 'dt-l', label: 'DT', position: 'DT', role: 'DL', startX: losYard + 1.5, startY: 24 },
      { id: 'dt-r', label: 'DT', position: 'DT', role: 'DL', startX: losYard + 1.5, startY: 29 },
      { id: 'de-r', label: 'EDGE', position: 'EDGE', role: 'DL', startX: losYard + 1.5, startY: 33 },
      { id: 'mlb', label: 'MLB', position: 'LB', role: 'LB', startX: losYard + 5, startY: 26.6 },
      { id: 'wlb', label: 'WLB', position: 'LB', role: 'LB', startX: losYard + 5, startY: 20 },
      { id: 'cb1', label: 'CB1', position: 'CB', role: 'CB', startX: losYard + 7, startY: 6 },
      { id: 'cb2', label: 'CB2', position: 'CB', role: 'CB', startX: losYard + 7, startY: 48 },
      { id: 'nb', label: 'NB', position: 'CB', role: 'CB', startX: losYard + 6, startY: 36 },
      { id: 'fs', label: 'FS', position: 'FS', role: 'S', startX: losYard + 18, startY: 26.6 }
    ]
  };
}

