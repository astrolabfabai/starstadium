import { ApiEndpointDoc } from '../types';

export const API_DOCS_REGISTRY: ApiEndpointDoc[] = [
  {
    id: 'standings',
    name: 'Standings, Rankings & Brackets',
    category: 'Competition Feeds',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/scores/json/Standings/{season}',
    callInterval: '5 Minutes',
    returnType: 'Standing[]',
    includedDataTables: ['Standing'],
    description: 'Returns regular season standings for all teams in the specified season including win-loss ratios, points for/against, streaks, and divisional records.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [{ name: 'season', type: 'string', required: true, examples: '2024REG, 2024POST, 2024PRE' }]
  },
  {
    id: 'teams_all',
    name: 'Team Profiles - All',
    category: 'Teams & Rosters',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/scores/json/Teams',
    callInterval: '4 Hours',
    returnType: 'Team[]',
    includedDataTables: ['Stadium', 'Team'],
    description: 'Returns full team information including name, city, conference, division, colors, coaching scheme, and stadium data.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: []
  },
  {
    id: 'players_by_team',
    name: 'Player Profiles - by Team',
    category: 'Teams & Rosters',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/scores/json/Players/{team}',
    callInterval: '1 Hour',
    returnType: 'PlayerDetail[]',
    includedDataTables: ['Player', 'PlayerDetail'],
    description: 'Returns all players on the specified team with full biographical info, jersey number, college, salary, and active status.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [{ name: 'team', type: 'string', required: true, examples: 'KC, SF, BAL, DET, PHI, DAL' }]
  },
  {
    id: 'schedules',
    name: 'Schedules & Game Day Info',
    category: 'Event Feeds',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/scores/json/Schedules/{season}',
    callInterval: '3 Minutes',
    returnType: 'Schedule[]',
    includedDataTables: ['Schedule', 'Stadium'],
    description: 'Returns game details including home/away teams, game date/time, season week, broadcast channel, weather forecast, and stadium info.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [{ name: 'season', type: 'string', required: true, examples: '2024REG, 2024POST' }]
  },
  {
    id: 'scores_by_week',
    name: 'Scores & Game State - by Week',
    category: 'Event Feeds',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/scores/json/ScoresByWeek/{season}/{week}',
    callInterval: '5 Seconds (Live)',
    returnType: 'Score[]',
    includedDataTables: ['Score', 'Stadium'],
    description: 'Full scores and gameday info including live distance/down, quarter time remaining, referee crew, and score progression.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [
      { name: 'season', type: 'string', required: true, examples: '2024REG' },
      { name: 'week', type: 'integer', required: true, examples: '1, 4, 8, 18' }
    ]
  },
  {
    id: 'player_season_stats',
    name: 'Player Season Stats & Leaders',
    category: 'Team & Player Stats',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/stats/json/PlayerSeasonStats/{season}',
    callInterval: '15 Minutes',
    returnType: 'PlayerSeason[]',
    includedDataTables: ['PlayerSeason', 'ScoringDetail'],
    description: 'Returns season-total stats for all players on a given season including passing, rushing, receiving, tackles, sacks, and fantasy scoring.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [{ name: 'season', type: 'string', required: true, examples: '2024REG' }]
  },
  {
    id: 'play_by_play',
    name: 'Play By Play - Live & Final',
    category: 'Play by Play Feeds',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/pbp/json/PlayByPlay/{season}/{week}/{hometeam}',
    callInterval: '1 Minute',
    returnType: 'PlayByPlay',
    includedDataTables: ['Play', 'PlayByPlay', 'PlayStat'],
    description: 'Returns all individual plays for a specified team game including play type, yards gained, win probability shifts, down & distance, and player tags.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [
      { name: 'season', type: 'string', required: true, examples: '2024REG' },
      { name: 'week', type: 'integer', required: true, examples: '1' },
      { name: 'hometeam', type: 'string', required: true, examples: 'KC' }
    ]
  },
  {
    id: 'depth_charts',
    name: 'Depth Charts - All Teams',
    category: 'Player Feeds',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/scores/json/DepthChartsAll',
    callInterval: '5 Minutes',
    returnType: 'TeamDepthChart[]',
    includedDataTables: ['DepthChart', 'TeamDepthChart'],
    description: 'Returns depth chart hierarchy for all rostered players expected to play in active schemes (Offense, Defense, Special Teams).',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: []
  },
  {
    id: 'injuries_by_week',
    name: 'Injuries - by Week',
    category: 'Player Feeds',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/stats/json/Injuries/{season}/{week}',
    callInterval: '5 Minutes',
    returnType: 'Injury[]',
    includedDataTables: ['Injury'],
    description: 'Returns injury status (Out, Questionable, Doubtful, IR), affected body parts, practice participation logs, and declared return windows.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [
      { name: 'season', type: 'string', required: true, examples: '2024REG' },
      { name: 'week', type: 'integer', required: true, examples: '4' }
    ]
  },
  {
    id: 'betting_odds',
    name: 'Game Odds & Line Movement',
    category: 'Betting Feeds',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/odds/json/LiveGameOddsByWeek/{season}/{week}',
    callInterval: '5 Seconds',
    returnType: 'GameInfo[]',
    includedDataTables: ['GameInfo', 'GameOdd'],
    description: 'In-play and pre-game odds (spread, moneyline, total over/under) across DraftKings, FanDuel, BetMGM with live line movement history.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [
      { name: 'season', type: 'string', required: true, examples: '2024REG' },
      { name: 'week', type: 'integer', required: true, examples: '1' }
    ]
  },
  {
    id: 'dfs_slates',
    name: 'Fantasy Projections & DFS Slates',
    category: 'Fantasy Feeds',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/projections/json/DfsSlatesByWeek/{season}/{week}',
    callInterval: '15 Minutes',
    returnType: 'DfsSlate[]',
    includedDataTables: ['DfsSlate', 'DfsSlatePlayer'],
    description: 'Daily Fantasy Sports (DFS) slates, salary tiers across DraftKings/FanDuel, projected fantasy point outputs, ownership projections, and value ratings.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: [
      { name: 'season', type: 'string', required: true, examples: '2024REG' },
      { name: 'week', type: 'integer', required: true, examples: '1' }
    ]
  },
  {
    id: 'news_rotoballer',
    name: 'News, Headshots & Wire',
    category: 'News & Images',
    method: 'GET',
    urlPattern: 'https://api.sportsdata.io/v3/nfl/news-rotoballer/json/RotoBallerPremiumNews',
    callInterval: '3 Minutes',
    returnType: 'News[]',
    includedDataTables: ['News'],
    description: 'Real-time breaking player news feeds from RotoBaller with fantasy impact ratings, player links, and transaction logs.',
    queryParams: [{ name: 'key', type: 'string', required: true }],
    urlParams: []
  }
];
