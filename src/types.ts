export type ViewMode = 
  | 'dashboard'
  | 'standings'
  | 'teams'
  | 'schedule'
  | 'scoreboard'
  | 'highlights'
  | 'stats'
  | 'playbyplay'
  | 'depth_injuries'
  | 'betting'
  | 'fantasy'
  | 'draft_analyzer'
  | 'draft_simulator'
  | 'news'
  | 'db_viewer'
  | 'user_account'
  | 'admin';

export type SeasonCode = '2026REG' | '2026PRE' | '2026POST' | '2025REG' | '2024REG' | '2024POST' | '2023REG';

export interface SeasonOption {
  code: SeasonCode;
  label: string;
  year: number;
  type: string;
  description: string;
}

export const SEASONS_LIST: SeasonOption[] = [
  { code: '2026REG', label: '2026 Regular Season', year: 2026, type: 'REG', description: 'Current Active 18-Week 2026 Official Campaign' },
  { code: '2026PRE', label: '2026 Preseason', year: 2026, type: 'PRE', description: '2026 Exhibition & Training Camp' },
  { code: '2026POST', label: '2026 Postseason', year: 2026, type: 'POST', description: 'Super Bowl LXI Playoff Brackets & Final Drives' },
  { code: '2025REG', label: '2025 Regular Season', year: 2025, type: 'REG', description: 'Previous 2025 Campaign Benchmarks' },
  { code: '2024REG', label: '2024 Regular Season', year: 2024, type: 'REG', description: 'Historical 2024 Offense & Defense Data' },
  { code: '2023REG', label: '2023 Regular Season', year: 2023, type: 'REG', description: 'Archive Standings & Player Milestones' }
];

export interface WidgetConfig {
  id: string;
  title: string;
  type: ViewMode;
  category: string;
  w: number; // width in grid columns (1-12)
  visible: boolean;
  order: number;
}

export interface FootballRoutePoint {
  x: number; // 0 - 100 on field
  y: number; // 0 - 53.3 yards width
}

export interface FootballPlayerNode {
  id: string;
  label: string;
  position: string;
  role: 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S';
  startX: number;
  startY: number;
  routePath?: FootballRoutePoint[];
  passTarget?: boolean;
  actionText?: string;
}

export interface FootballPlayConcept {
  id: string;
  name: string;
  category: 'Pass' | 'Run' | 'RPO' | 'Screen' | 'Play Action';
  personnel: string; // e.g. "11 Personnel (3WR 1TE 1RB)"
  formation: string; // "Shotgun Trips Right", "I-Form Pro"
  defensiveCoverage: string; // "Cover 3 Sky", "Cover 2 Man"
  description: string;
  keys: string[];
  progression: string[];
  emoji: string;
  offensiveNodes: FootballPlayerNode[];
  defensiveNodes: FootballPlayerNode[];
  losYard: number; // Line of scrimmage yard (e.g. 35)
  firstDownYard: number; // Yard to gain (e.g. 45)
}

export interface PassingZoneStat {
  zoneId: string;
  zoneName: string;
  depth: 'Behind LOS' | 'Short (0-10)' | 'Intermediate (11-19)' | 'Deep (20+)';
  location: 'Left' | 'Middle' | 'Right';
  attempts: number;
  completions: number;
  compPct: number;
  yards: number;
  touchdowns: number;
  interceptions: number;
  passerRating: number;
  epaPerAttempt: number;
}

export interface QuarterbackSprayProfile {
  qbName: string;
  teamKey: string;
  season: string;
  totalAttempts: number;
  completionPct: number;
  passerRating: number;
  airYardsPerAtt: number;
  zones: PassingZoneStat[];
}

export interface TeamEpaRecord {
  teamKey: string;
  teamName: string;
  dropbackEpa: number;
  rushEpa: number;
  overallOffensiveEpa: number;
  defensiveEpaAllowed: number;
  successRate: number; // percentage (e.g. 48.5)
  earlyDownEpa: number;
  thirdDownEpa: number;
  explosivePlayPct: number;
}

export interface PersonnelEfficiency {
  personnel: string;
  code: string;
  description: string;
  usagePct: number;
  successRatePct: number;
  yardsPerPlay: number;
  passRatioPct: number;
  epaPerPlay: number;
}

export interface Team {
  Key: string;
  TeamID: number;
  City: string;
  Name: string;
  FullName: string;
  Conference: 'AFC' | 'NFC';
  Division: 'East' | 'North' | 'South' | 'West';
  PrimaryColor: string;
  SecondaryColor: string;
  WikipediaLogoUrl: string;
  StadiumID: number;
  StadiumName: string;
  HeadCoach: string;
  OffensiveScheme: string;
  DefensiveScheme: string;
}

export interface TeamStanding {
  Team: string;
  TeamID: number;
  Name: string;
  Conference: 'AFC' | 'NFC';
  Division: string;
  Wins: number;
  Losses: number;
  Ties: number;
  Percentage: number;
  PointsFor: number;
  PointsAgainst: number;
  PointDifferential: number;
  HomeWins: number;
  HomeLosses: number;
  AwayWins: number;
  AwayLosses: number;
  DivisionWins: number;
  DivisionLosses: number;
  ConferenceWins: number;
  ConferenceLosses: number;
  Streak: string;
  Touchdowns: number;
}

export interface Player {
  PlayerID: number;
  Team: string;
  Number: number;
  FirstName: string;
  LastName: string;
  Position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DL' | 'LB' | 'DB';
  Status: 'Active' | 'Injured Reserve' | 'Questionable' | 'PUP' | 'Practice Squad';
  Height: string;
  Weight: number;
  Age: number;
  Experience: number;
  College: string;
  PhotoUrl: string;
  Salary: number;
  DraftYear: number;
  DraftRound: number;
  DraftPick: number;
}

export interface GameSchedule {
  GameKey: string;
  Season: number;
  SeasonType: 'REG' | 'PRE' | 'POST';
  Week: number;
  Date: string;
  Time: string;
  AwayTeam: string;
  HomeTeam: string;
  AwayScore: number | null;
  HomeScore: number | null;
  Channel: string;
  StadiumName: string;
  StadiumCity: string;
  Surface: 'Grass' | 'FieldTurf' | 'AstroTurf';
  IsDome: boolean;
  PointSpread: number;
  OverUnder: number;
  ForecastTemp: number;
  ForecastDescription: string;
  ForecastWindSpeed: number;
  Status: 'Scheduled' | 'InProgress' | 'Final' | 'F/OT';
  Quarter?: string;
  TimeRemaining?: string;
  Clock?: string;
  ClockSeconds?: number;
  PlayClock?: number;
  Possession?: string;
  DownDistance?: string;
  TimeoutsLeftHome?: number;
  TimeoutsLeftAway?: number;
  HasStarted: boolean;
  IsOver: boolean;
}

export interface PlayerStat {
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  Played: number;
  PassingYards: number;
  PassingTDs: number;
  Interceptions: number;
  CompletionPct: number;
  PasserRating: number;
  RushingYards: number;
  RushingTDs: number;
  RushingYardsPerAttempt: number;
  Receptions: number;
  ReceivingYards: number;
  ReceivingTDs: number;
  Tackles: number;
  Sacks: number;
  InterceptionsDef: number;
  FieldGoalsMade: number;
  FieldGoalPct: number;
  FantasyPoints: number;
}

export interface PlayByPlayEvent {
  PlayID: number;
  GameID: number;
  Quarter: number;
  TimeRemaining: string;
  Possession: string;
  Down: number;
  Distance: number;
  YardLine: number;
  YardLineSide: string;
  PlayType: 'Pass' | 'Run' | 'Punt' | 'Field Goal' | 'Turnover' | 'Penalty' | 'Sack' | 'Touchdown';
  YardsGained: number;
  Description: string;
  IsBigPlay: boolean;
  WinProbabilityPct: number;
  epa?: number;
  playConceptId?: string;
  playConceptName?: string;
  formation?: string;
  personnel?: string;
  defensiveCoverage?: string;
  targetPlayer?: string;
  ballCarrier?: string;
  passTargetRole?: string;
  customTacticalConcept?: FootballPlayConcept;
}

export interface DepthChartPosition {
  Position: string;
  Category: 'Offense' | 'Defense' | 'Special Teams';
  Starter: Player;
  SecondString?: Player;
  ThirdString?: Player;
}

export interface InjuryReport {
  InjuryID: number;
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  BodyPart: string;
  Status: 'Out' | 'Doubtful' | 'Questionable' | 'Probable' | 'IR';
  PracticeStatus: 'Full' | 'Limited' | 'Did Not Participate';
  DeclaredDate: string;
  Notes: string;
}

export interface BettingLine {
  GameID: number;
  AwayTeam: string;
  HomeTeam: string;
  Sportsbook: 'DraftKings' | 'FanDuel' | 'BetMGM' | 'Caesars' | 'PointsBet';
  SpreadHome: number;
  SpreadAway: number;
  SpreadHomeOdds: number;
  SpreadAwayOdds: number;
  MoneylineHome: number;
  MoneylineAway: number;
  TotalOverUnder: number;
  OverOdds: number;
  UnderOdds: number;
  PublicSpreadHomePct: number;
  PublicMoneyHomePct: number;
  LineMovement: { time: string; spread: number; total: number; moneyline: number }[];
}

export interface FantasyDfsPlayer {
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  Opponent: string;
  DraftKingsSalary: number;
  FanDuelSalary: number;
  ProjectedPoints: number;
  FloorPoints: number;
  CeilingPoints: number;
  ProjectedOwnershipPct: number;
  ValueScore: number; // ProjectedPoints per $1,000 salary
  Adp: number;
}

export interface NewsArticle {
  NewsID: number;
  PlayerID?: number;
  Team: string;
  Title: string;
  Content: string;
  Categories: string[];
  Source: 'RotoBaller' | 'SportsData.io' | 'Official Release';
  Updated: string;
  ImpactLevel: 'High' | 'Medium' | 'Low';
  PlayerPhotoUrl?: string;
}

export interface Transaction {
  TransactionID: number;
  Date: string;
  Team: string;
  Type: 'Signed' | 'Traded' | 'Waived' | 'Elevated' | 'Placed on IR';
  PlayerName: string;
  Position: string;
  Details: string;
}

export interface ApiEndpointDoc {
  id: string;
  name: string;
  category: string;
  method: 'GET';
  urlPattern: string;
  callInterval: string;
  returnType: string;
  includedDataTables: string[];
  description: string;
  queryParams: { name: string; type: string; required: boolean; default?: string }[];
  urlParams: { name: string; type: string; required: boolean; examples?: string }[];
}

export interface OllamaConfig {
  host: string; // default http://localhost:11434
  model: string; // e.g. llama3, mistral, qwen2.5, llama3.2, etc.
  isEnabled: boolean;
}

export interface AutoRefreshConfig {
  isEnabled: boolean;
  intervalSecs: number; // 5, 10, 20, 30, 60
  lastRefreshedAt: string;
}

export interface CurrentSeasonApiResponse {
  season: SeasonCode;
  year: number;
  seasonType: 'REG' | 'PRE' | 'POST';
  week: number;
  source: string;
  label: string;
  timestamp: string;
}

export interface GoogleAiAnalysisRequest {
  type: 'general_chat' | 'telemetry' | 'tactical' | 'drive_prediction' | 'fourth_down';
  prompt?: string;
  gameData?: any;
  telemetryData?: {
    downDistance: string;
    yardLine: number;
    timeOfPossessionHome: string;
    timeOfPossessionAway: string;
    redZoneTripsHome: number;
    redZoneTripsAway: number;
    redZoneTdHome: number;
    redZoneTdAway: number;
    currentDriveYards: number;
    currentDrivePlays: number;
  };
}

export interface GoogleAiAnalysisResponse {
  source: 'google_genai_gemini' | 'simulated_analytics';
  model: string;
  text: string;
  insights?: string[];
  tacticalRecommendation?: string;
  successProbabilityPct?: number;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  roleTitle: string;
  avatarEmoji: string;
  favoriteTeam: string; // e.g. 'KC', 'SF', 'DAL', 'PHI', 'BAL'
  favoriteConference: 'ALL' | 'AFC' | 'NFC';
  scoringFormat: 'PPR' | 'HALF_PPR' | 'STANDARD';
  primaryDfsSite: 'DraftKings' | 'FanDuel';
  notifications: {
    redZoneAlerts: boolean;
    fourthDownDecisions: boolean;
    injuryUpdates: boolean;
    oddsLineMovement: boolean;
    bigPlays: boolean;
  };
  preferences: {
    defaultLandingView: ViewMode;
    autoRefreshSecs: number;
    highContrastMode: boolean;
    dualEngineAi: boolean;
  };
  savedPlayConcepts: string[];
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  ip?: string;
}

export interface ServerAdminStatus {
  status: string;
  uptimeSeconds: number;
  startedAt: string;
  nodeVersion: string;
  platform: string;
  memoryUsage: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
  };
  envStatus: {
    geminiConfigured: boolean;
    sportsdataConfigured: boolean;
    securityMode: string;
    keysExposedToClient: boolean;
  };
  totalRequestsLogged: number;
  recentLogs: ApiLogEntry[];
}

export type ScoreType =
  | 'TOUCHDOWN'
  | 'FIELD_GOAL'
  | 'SAFETY'
  | 'TWO_POINT'
  | 'PICK_SIX'
  | 'FUMBLE_RETURN_TD';

export interface ScoringDriveAlert {
  id: string;
  gameKey: string;
  timestamp: number;
  scoreType: ScoreType;
  scoringTeam: string;
  scoringTeamName: string;
  scoringTeamColor?: string;
  opponentTeam: string;
  opponentTeamName: string;
  opponentTeamColor?: string;
  scoringPlayer: string;
  pointsAdded: number;
  updatedHomeScore: number;
  updatedAwayScore: number;
  homeTeam: string;
  awayTeam: string;
  quarter: string;
  timeRemaining: string;
  drivePlays: number;
  driveYards: number;
  driveTimeOfPossession: string;
  playDescription: string;
  epaGain?: number;
  winProbShift?: number;
  isRedZoneStrike?: boolean;
  read?: boolean;
}

export type HighlightCategory = 
  | 'GAME_RECAP'
  | 'TOUCHDOWNS'
  | 'REDZONE_DRIVES'
  | 'BIG_PLAYS'
  | 'MIC_D_UP'
  | 'DEFENSIVE_STOPS'
  | 'INTERCEPTIONS'
  | 'SACKS'
  | 'ALL_POSSESSIONS';

export interface HighlightVideoItem {
  id: string;
  gameKey: string;
  season: string; // e.g. 2026_Season
  week: string; // e.g. Week_01
  homeTeam: string;
  awayTeam: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  playlistId?: string;
  playlistTitle?: string;
  thumbnailUrl: string;
  duration: string; // e.g. "12:45"
  category: HighlightCategory;
  viewsCount?: string;
  publishedDate?: string;
  fileSizeMb?: number;
  downloadFormat: 'mp4_1080p' | 'mp4_720p' | 'mp3_192k';
  matchConfidence: number; // 0-100%
  matchedPlayId?: number;
  matchedPlayer?: string;
  ytdlpCommand: string;
  status: 'QUEUED' | 'DOWNLOADING' | 'DOWNLOADED' | 'FAILED' | 'READY';
  downloadProgress?: number; // 0 - 100
  downloadSpeed?: string; // e.g. "8.4 MB/s"
  eta?: string;
}

export interface HighlightDownloadQueueItem {
  id: string;
  videoId: string;
  title: string;
  gameMatchup: string;
  playlistTitle?: string;
  url: string;
  format: 'mp4' | 'mp3';
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'ERROR' | 'RETRYING';
  progress: number;
  speed: string;
  eta: string;
  addedAt: number;
  downloadPath: string;
  error?: string;
}

export interface YtPlaylistScraperConfig {
  channelUrl: string;
  keywords: string[];
  outputDir: string;
  outputFormat: 'mp4' | 'mp3';
  audioQuality: string;
  extractFlat: boolean;
  maxRounds: number;
  sponsorBlock: boolean;
  downloadThumbnails: boolean;
  embedMetadata: boolean;
  selectedSeason: string;
  selectedWeek: string;
}

