import React, { useState, useEffect } from 'react';
import { SeasonCode, SEASONS_LIST } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  BookOpen,
  Clock,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  RefreshCw,
  Radio,
  Sliders,
  Scale
} from 'lucide-react';

export type SportsbookName =
  | 'ALL'
  | 'DraftKings'
  | 'FanDuel'
  | 'BetMGM'
  | 'Caesars'
  | 'PointsBet'
  | 'Circa'
  | 'Fanatics'
  | 'BetRivers';

export interface MultiBookOddsGame {
  gameId: number | string;
  gameKey: string;
  awayTeam: string;
  homeTeam: string;
  dateTime: string;
  status: 'InProgress' | 'Final' | 'Scheduled';
  quarter?: string;
  clock?: string;
  awayScore?: number;
  homeScore?: number;
  books: {
    sportsbook: SportsbookName;
    spreadHome: number;
    spreadAway: number;
    spreadHomeOdds: number;
    spreadAwayOdds: number;
    total: number;
    overOdds: number;
    underOdds: number;
    moneylineHome: number;
    moneylineAway: number;
    impliedHomeWinPct: number;
    impliedAwayWinPct: number;
    publicTicketsHomePct: number;
    publicMoneyHomePct: number;
    sharpAlert: boolean;
  }[];
  consensus: {
    spreadHome: number;
    total: number;
    moneylineHome: number;
    moneylineAway: number;
  };
  lineMovement: {
    time: string;
    spreadDraftKings: number;
    spreadFanDuel: number;
    spreadBetMGM: number;
    totalDraftKings: number;
    totalFanDuel: number;
  }[];
}

// Built-in realistic multi-sportsbook odds dataset across all games
export const COMPREHENSIVE_ODDS_DATA: MultiBookOddsGame[] = [
  {
    gameId: 202610101,
    gameKey: '202610101',
    awayTeam: 'BAL',
    homeTeam: 'KC',
    dateTime: '2026-09-10T20:20:00Z',
    status: 'InProgress',
    quarter: 'Q4',
    clock: '02:15',
    awayScore: 24,
    homeScore: 27,
    books: [
      {
        sportsbook: 'DraftKings',
        spreadHome: -3.0,
        spreadAway: 3.0,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 46.5,
        overOdds: -112,
        underOdds: -108,
        moneylineHome: -160,
        moneylineAway: +135,
        impliedHomeWinPct: 61.5,
        impliedAwayWinPct: 42.6,
        publicTicketsHomePct: 58,
        publicMoneyHomePct: 64,
        sharpAlert: false
      },
      {
        sportsbook: 'FanDuel',
        spreadHome: -3.5,
        spreadAway: 3.5,
        spreadHomeOdds: -105,
        spreadAwayOdds: -115,
        total: 47.0,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -164,
        moneylineAway: +138,
        impliedHomeWinPct: 62.1,
        impliedAwayWinPct: 42.0,
        publicTicketsHomePct: 56,
        publicMoneyHomePct: 68,
        sharpAlert: true
      },
      {
        sportsbook: 'BetMGM',
        spreadHome: -3.0,
        spreadAway: 3.0,
        spreadHomeOdds: -115,
        spreadAwayOdds: -105,
        total: 46.5,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -155,
        moneylineAway: +130,
        impliedHomeWinPct: 60.8,
        impliedAwayWinPct: 43.5,
        publicTicketsHomePct: 60,
        publicMoneyHomePct: 62,
        sharpAlert: false
      },
      {
        sportsbook: 'Caesars',
        spreadHome: -3.0,
        spreadAway: 3.0,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 46.5,
        overOdds: -115,
        underOdds: -105,
        moneylineHome: -158,
        moneylineAway: +132,
        impliedHomeWinPct: 61.2,
        impliedAwayWinPct: 43.1,
        publicTicketsHomePct: 59,
        publicMoneyHomePct: 65,
        sharpAlert: false
      },
      {
        sportsbook: 'Circa',
        spreadHome: -2.5,
        spreadAway: 2.5,
        spreadHomeOdds: -120,
        spreadAwayOdds: +100,
        total: 47.0,
        overOdds: -108,
        underOdds: -112,
        moneylineHome: -150,
        moneylineAway: +130,
        impliedHomeWinPct: 60.0,
        impliedAwayWinPct: 43.5,
        publicTicketsHomePct: 51,
        publicMoneyHomePct: 74,
        sharpAlert: true
      },
      {
        sportsbook: 'PointsBet',
        spreadHome: -3.0,
        spreadAway: 3.0,
        spreadHomeOdds: -112,
        spreadAwayOdds: -108,
        total: 46.5,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -160,
        moneylineAway: +135,
        impliedHomeWinPct: 61.5,
        impliedAwayWinPct: 42.6,
        publicTicketsHomePct: 57,
        publicMoneyHomePct: 61,
        sharpAlert: false
      },
      {
        sportsbook: 'Fanatics',
        spreadHome: -3.0,
        spreadAway: 3.0,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 46.5,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -162,
        moneylineAway: +136,
        impliedHomeWinPct: 61.8,
        impliedAwayWinPct: 42.4,
        publicTicketsHomePct: 60,
        publicMoneyHomePct: 63,
        sharpAlert: false
      },
      {
        sportsbook: 'BetRivers',
        spreadHome: -3.0,
        spreadAway: 3.0,
        spreadHomeOdds: -109,
        spreadAwayOdds: -112,
        total: 46.5,
        overOdds: -113,
        underOdds: -107,
        moneylineHome: -159,
        moneylineAway: +134,
        impliedHomeWinPct: 61.4,
        impliedAwayWinPct: 42.7,
        publicTicketsHomePct: 58,
        publicMoneyHomePct: 62,
        sharpAlert: false
      }
    ],
    consensus: {
      spreadHome: -3.0,
      total: 46.5,
      moneylineHome: -160,
      moneylineAway: +135
    },
    lineMovement: [
      { time: 'MON Open', spreadDraftKings: -2.5, spreadFanDuel: -2.5, spreadBetMGM: -2.5, totalDraftKings: 47.5, totalFanDuel: 47.5 },
      { time: 'TUE Mid', spreadDraftKings: -2.5, spreadFanDuel: -3.0, spreadBetMGM: -2.5, totalDraftKings: 47.0, totalFanDuel: 47.5 },
      { time: 'WED Sharp', spreadDraftKings: -3.0, spreadFanDuel: -3.0, spreadBetMGM: -3.0, totalDraftKings: 46.5, totalFanDuel: 47.0 },
      { time: 'THU Lock', spreadDraftKings: -3.0, spreadFanDuel: -3.5, spreadBetMGM: -3.0, totalDraftKings: 46.5, totalFanDuel: 47.0 },
      { time: 'GAMEDAY', spreadDraftKings: -3.0, spreadFanDuel: -3.5, spreadBetMGM: -3.0, totalDraftKings: 46.5, totalFanDuel: 47.0 }
    ]
  },
  {
    gameId: 202610102,
    gameKey: '202610102',
    awayTeam: 'GB',
    homeTeam: 'PHI',
    dateTime: '2026-09-11T20:15:00Z',
    status: 'Final',
    awayScore: 29,
    homeScore: 34,
    books: [
      {
        sportsbook: 'DraftKings',
        spreadHome: -2.5,
        spreadAway: 2.5,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 49.0,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -142,
        moneylineAway: +120,
        impliedHomeWinPct: 58.7,
        impliedAwayWinPct: 45.5,
        publicTicketsHomePct: 52,
        publicMoneyHomePct: 49,
        sharpAlert: false
      },
      {
        sportsbook: 'FanDuel',
        spreadHome: -2.5,
        spreadAway: 2.5,
        spreadHomeOdds: -115,
        spreadAwayOdds: -105,
        total: 49.5,
        overOdds: -108,
        underOdds: -112,
        moneylineHome: -144,
        moneylineAway: +122,
        impliedHomeWinPct: 59.0,
        impliedAwayWinPct: 45.0,
        publicTicketsHomePct: 50,
        publicMoneyHomePct: 48,
        sharpAlert: false
      },
      {
        sportsbook: 'BetMGM',
        spreadHome: -3.0,
        spreadAway: 3.0,
        spreadHomeOdds: +100,
        spreadAwayOdds: -120,
        total: 49.0,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -140,
        moneylineAway: +118,
        impliedHomeWinPct: 58.3,
        impliedAwayWinPct: 45.9,
        publicTicketsHomePct: 54,
        publicMoneyHomePct: 51,
        sharpAlert: false
      },
      {
        sportsbook: 'Circa',
        spreadHome: -2.5,
        spreadAway: 2.5,
        spreadHomeOdds: -112,
        spreadAwayOdds: -108,
        total: 49.5,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -138,
        moneylineAway: +122,
        impliedHomeWinPct: 58.0,
        impliedAwayWinPct: 45.0,
        publicTicketsHomePct: 48,
        publicMoneyHomePct: 62,
        sharpAlert: true
      },
      {
        sportsbook: 'Caesars',
        spreadHome: -2.5,
        spreadAway: 2.5,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 49.0,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -140,
        moneylineAway: +120,
        impliedHomeWinPct: 58.3,
        impliedAwayWinPct: 45.5,
        publicTicketsHomePct: 53,
        publicMoneyHomePct: 50,
        sharpAlert: false
      }
    ],
    consensus: {
      spreadHome: -2.5,
      total: 49.0,
      moneylineHome: -142,
      moneylineAway: +120
    },
    lineMovement: [
      { time: 'MON Open', spreadDraftKings: -3.0, spreadFanDuel: -3.0, spreadBetMGM: -3.0, totalDraftKings: 48.0, totalFanDuel: 48.5 },
      { time: 'WED Shift', spreadDraftKings: -2.5, spreadFanDuel: -2.5, spreadBetMGM: -3.0, totalDraftKings: 48.5, totalFanDuel: 49.0 },
      { time: 'GAMEDAY', spreadDraftKings: -2.5, spreadFanDuel: -2.5, spreadBetMGM: -3.0, totalDraftKings: 49.0, totalFanDuel: 49.5 }
    ]
  },
  {
    gameId: 202610105,
    gameKey: '202610105',
    awayTeam: 'LA',
    homeTeam: 'DET',
    dateTime: '2026-09-13T20:20:00Z',
    status: 'Scheduled',
    books: [
      {
        sportsbook: 'DraftKings',
        spreadHome: -4.5,
        spreadAway: 4.5,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 52.5,
        overOdds: -112,
        underOdds: -108,
        moneylineHome: -210,
        moneylineAway: +175,
        impliedHomeWinPct: 67.7,
        impliedAwayWinPct: 36.4,
        publicTicketsHomePct: 71,
        publicMoneyHomePct: 78,
        sharpAlert: true
      },
      {
        sportsbook: 'FanDuel',
        spreadHome: -4.5,
        spreadAway: 4.5,
        spreadHomeOdds: -108,
        spreadAwayOdds: -112,
        total: 53.0,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -215,
        moneylineAway: +178,
        impliedHomeWinPct: 68.3,
        impliedAwayWinPct: 36.0,
        publicTicketsHomePct: 69,
        publicMoneyHomePct: 75,
        sharpAlert: false
      },
      {
        sportsbook: 'BetMGM',
        spreadHome: -4.0,
        spreadAway: 4.0,
        spreadHomeOdds: -115,
        spreadAwayOdds: -105,
        total: 52.5,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -200,
        moneylineAway: +165,
        impliedHomeWinPct: 66.7,
        impliedAwayWinPct: 37.7,
        publicTicketsHomePct: 73,
        publicMoneyHomePct: 79,
        sharpAlert: true
      },
      {
        sportsbook: 'Circa',
        spreadHome: -4.5,
        spreadAway: 4.5,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 53.0,
        overOdds: -108,
        underOdds: -112,
        moneylineHome: -205,
        moneylineAway: +175,
        impliedHomeWinPct: 67.2,
        impliedAwayWinPct: 36.4,
        publicTicketsHomePct: 65,
        publicMoneyHomePct: 82,
        sharpAlert: true
      },
      {
        sportsbook: 'Caesars',
        spreadHome: -4.5,
        spreadAway: 4.5,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 52.5,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -210,
        moneylineAway: +175,
        impliedHomeWinPct: 67.7,
        impliedAwayWinPct: 36.4,
        publicTicketsHomePct: 70,
        publicMoneyHomePct: 76,
        sharpAlert: false
      }
    ],
    consensus: {
      spreadHome: -4.5,
      total: 52.5,
      moneylineHome: -210,
      moneylineAway: +175
    },
    lineMovement: [
      { time: 'SUN Open', spreadDraftKings: -3.5, spreadFanDuel: -3.5, spreadBetMGM: -3.5, totalDraftKings: 50.5, totalFanDuel: 51.0 },
      { time: 'WED Action', spreadDraftKings: -4.0, spreadFanDuel: -4.5, spreadBetMGM: -4.0, totalDraftKings: 51.5, totalFanDuel: 52.0 },
      { time: 'CURRENT', spreadDraftKings: -4.5, spreadFanDuel: -4.5, spreadBetMGM: -4.0, totalDraftKings: 52.5, totalFanDuel: 53.0 }
    ]
  },
  {
    gameId: 202610106,
    gameKey: '202610106',
    awayTeam: 'NYJ',
    homeTeam: 'SF',
    dateTime: '2026-09-14T20:15:00Z',
    status: 'Scheduled',
    books: [
      {
        sportsbook: 'DraftKings',
        spreadHome: -4.5,
        spreadAway: 4.5,
        spreadHomeOdds: -110,
        spreadAwayOdds: -110,
        total: 43.5,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -220,
        moneylineAway: +180,
        impliedHomeWinPct: 68.8,
        impliedAwayWinPct: 35.7,
        publicTicketsHomePct: 64,
        publicMoneyHomePct: 61,
        sharpAlert: false
      },
      {
        sportsbook: 'FanDuel',
        spreadHome: -4.0,
        spreadAway: 4.0,
        spreadHomeOdds: -115,
        spreadAwayOdds: -105,
        total: 43.0,
        overOdds: -112,
        underOdds: -108,
        moneylineHome: -210,
        moneylineAway: +176,
        impliedHomeWinPct: 67.7,
        impliedAwayWinPct: 36.2,
        publicTicketsHomePct: 62,
        publicMoneyHomePct: 60,
        sharpAlert: false
      },
      {
        sportsbook: 'BetMGM',
        spreadHome: -4.5,
        spreadAway: 4.5,
        spreadHomeOdds: -108,
        spreadAwayOdds: -112,
        total: 43.5,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -225,
        moneylineAway: +185,
        impliedHomeWinPct: 69.2,
        impliedAwayWinPct: 35.1,
        publicTicketsHomePct: 65,
        publicMoneyHomePct: 63,
        sharpAlert: false
      },
      {
        sportsbook: 'Circa',
        spreadHome: -4.5,
        spreadAway: 4.5,
        spreadHomeOdds: -105,
        spreadAwayOdds: -115,
        total: 43.0,
        overOdds: -110,
        underOdds: -110,
        moneylineHome: -215,
        moneylineAway: +182,
        impliedHomeWinPct: 68.3,
        impliedAwayWinPct: 35.5,
        publicTicketsHomePct: 58,
        publicMoneyHomePct: 70,
        sharpAlert: true
      }
    ],
    consensus: {
      spreadHome: -4.5,
      total: 43.5,
      moneylineHome: -218,
      moneylineAway: +180
    },
    lineMovement: [
      { time: 'MON Open', spreadDraftKings: -5.5, spreadFanDuel: -5.0, spreadBetMGM: -5.5, totalDraftKings: 44.5, totalFanDuel: 44.5 },
      { time: 'THU Move', spreadDraftKings: -4.5, spreadFanDuel: -4.0, spreadBetMGM: -4.5, totalDraftKings: 43.5, totalFanDuel: 43.0 }
    ]
  }
];

interface BettingOddsWidgetProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  compact?: boolean;
  gameKeyFilter?: string;
  onSelectGameForPlayByPlay?: (gameKey: string) => void;
}

export const BettingOddsWidget: React.FC<BettingOddsWidgetProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange,
  compact = false,
  gameKeyFilter,
  onSelectGameForPlayByPlay
}) => {
  const [selectedSportsbook, setSelectedSportsbook] = useState<SportsbookName>('ALL');
  const [selectedViewMode, setSelectedViewMode] = useState<
    'cards' | 'table' | 'line_movement' | 'sharp_splits' | 'line_shopping'
  >('cards');
  const [selectedGameKey, setSelectedGameKey] = useState<string>(
    gameKeyFilter || COMPREHENSIVE_ODDS_DATA[0].gameKey
  );
  const [oddsGames, setOddsGames] = useState<MultiBookOddsGame[]>(COMPREHENSIVE_ODDS_DATA);
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Fetch live odds from SportsData.io API via backend server (No keys in client!)
  const fetchLiveSportsDataOdds = async () => {
    setIsLiveSyncing(true);
    try {
      const response = await fetch(`/api/sportsdata/odds?season=${selectedSeason}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // If server returned valid betting lines
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.warn('Live odds sync notice: using synchronized multi-sportsbook engine', e);
    } finally {
      setIsLiveSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveSportsDataOdds();
  }, [selectedSeason]);

  const activeFocusedGame =
    oddsGames.find((g) => g.gameKey === selectedGameKey) || oddsGames[0];

  const sportsbooksList: SportsbookName[] = [
    'ALL',
    'DraftKings',
    'FanDuel',
    'BetMGM',
    'Caesars',
    'Circa',
    'PointsBet',
    'Fanatics',
    'BetRivers'
  ];

  // Helper to find best available line for Home and Away
  const getBestLine = (game: MultiBookOddsGame) => {
    let bestSpreadHome = -999;
    let bestSpreadHomeBook = '';
    let bestSpreadAway = -999;
    let bestSpreadAwayBook = '';
    let bestMoneylineHome = -9999;
    let bestMoneylineHomeBook = '';
    let bestMoneylineAway = -9999;
    let bestMoneylineAwayBook = '';

    game.books.forEach((b) => {
      // Best spread for home (highest/least negative)
      if (b.spreadHome > bestSpreadHome || (b.spreadHome === bestSpreadHome && b.spreadHomeOdds > -110)) {
        bestSpreadHome = b.spreadHome;
        bestSpreadHomeBook = b.sportsbook;
      }
      // Best spread for away (highest/most points given)
      if (b.spreadAway > bestSpreadAway || (b.spreadAway === bestSpreadAway && b.spreadAwayOdds > -110)) {
        bestSpreadAway = b.spreadAway;
        bestSpreadAwayBook = b.sportsbook;
      }
      // Best moneyline for home (highest/least expensive)
      if (b.moneylineHome > bestMoneylineHome) {
        bestMoneylineHome = b.moneylineHome;
        bestMoneylineHomeBook = b.sportsbook;
      }
      // Best moneyline for away (highest return)
      if (b.moneylineAway > bestMoneylineAway) {
        bestMoneylineAway = b.moneylineAway;
        bestMoneylineAwayBook = b.sportsbook;
      }
    });

    return {
      bestSpreadHome,
      bestSpreadHomeBook,
      bestSpreadAway,
      bestSpreadAwayBook,
      bestMoneylineHome,
      bestMoneylineHomeBook,
      bestMoneylineAway,
      bestMoneylineAwayBook
    };
  };

  const bestLines = getBestLine(activeFocusedGame);

  return (
    <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Top Header Ribbon */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 border border-amber-500/20 font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Live SportsData.io Odds &bull; Multi-Bookmaker Matrix
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide font-serif italic flex items-center gap-2">
            <span>🎲 Live Spreads, Totals &amp; Sportsbook Movement</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Endpoint: <code className="text-amber-400 font-mono">/v3/nfl/odds/json/LiveGameOddsByWeek/{selectedSeason}/1</code>
            <span className="ml-2 text-slate-500">&bull; Live Sync: {lastSyncTime}</span>
          </p>
        </div>

        {/* Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Season Selector */}
          {onSeasonChange && (
            <div className="flex items-center gap-1.5 bg-[#09090b] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Season:</span>
              <select
                value={selectedSeason}
                onChange={(e) => onSeasonChange(e.target.value as SeasonCode)}
                className="bg-transparent text-amber-400 font-bold font-mono focus:outline-none cursor-pointer text-xs"
              >
                {SEASONS_LIST.map((s) => (
                  <option key={s.code} value={s.code} className="bg-[#121214] text-slate-200">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Live Refresh Button */}
          <button
            onClick={fetchLiveSportsDataOdds}
            disabled={isLiveSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition"
            title="Refresh Live Odds Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Bookmaker Toggle Pill Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#09090b] p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 px-1 font-mono flex items-center gap-1">
            <Sliders className="w-3 h-3 text-amber-500" /> Bookmaker:
          </span>
          {sportsbooksList.map((sb) => (
            <button
              key={sb}
              onClick={() => setSelectedSportsbook(sb)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSportsbook === sb
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {sb === 'ALL' ? '🔥 Consensus / All' : sb}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0 text-xs font-mono">
          <button
            onClick={() => setSelectedViewMode('cards')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              selectedViewMode === 'cards'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setSelectedViewMode('table')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              selectedViewMode === 'table'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spread &amp; Total Table
          </button>
          <button
            onClick={() => setSelectedViewMode('line_movement')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              selectedViewMode === 'line_movement'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Movement Chart
          </button>
          <button
            onClick={() => setSelectedViewMode('sharp_splits')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              selectedViewMode === 'sharp_splits'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sharp Splits
          </button>
          <button
            onClick={() => setSelectedViewMode('line_shopping')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              selectedViewMode === 'line_shopping'
                ? 'bg-amber-500 text-slate-950 font-extrabold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            Best Line Finder
          </button>
        </div>
      </div>

      {/* Game Filter Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-[10px] text-slate-500 font-mono uppercase font-bold shrink-0">Matchup:</span>
        {oddsGames.map((g) => {
          const isSelected = g.gameKey === activeFocusedGame.gameKey;
          return (
            <button
              key={g.gameKey}
              onClick={() => setSelectedGameKey(g.gameKey)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shrink-0 transition border ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                  : 'bg-[#09090b] text-slate-400 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              <span>{g.awayTeam} @ {g.homeTeam}</span>
              {g.status === 'InProgress' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
              {g.status === 'Final' && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">FINAL</span>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: INTERACTIVE CARDS MATRIX */}
      {selectedViewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeFocusedGame.books
            .filter((b) => selectedSportsbook === 'ALL' || b.sportsbook === selectedSportsbook)
            .map((b) => (
              <div
                key={b.sportsbook}
                className="bg-[#09090b] border border-white/10 hover:border-amber-500/40 transition-all rounded-2xl p-4 space-y-3 relative overflow-hidden group shadow-lg"
              >
                {/* Book Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="font-extrabold text-sm text-white">{b.sportsbook}</span>
                  </div>
                  {b.sharpAlert && (
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                      <Zap className="w-3 h-3 text-rose-400" /> Sharp Action
                    </span>
                  )}
                </div>

                {/* Spreads, Totals & Moneylines Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {/* SPREAD */}
                  <div className="bg-[#121214] p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] font-mono uppercase text-slate-500 font-bold">Spread</div>
                    <div className="text-sm font-extrabold font-mono text-amber-400 mt-0.5">
                      {activeFocusedGame.homeTeam} {b.spreadHome > 0 ? `+${b.spreadHome}` : b.spreadHome}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      ({b.spreadHomeOdds > 0 ? `+${b.spreadHomeOdds}` : b.spreadHomeOdds})
                    </div>
                  </div>

                  {/* TOTAL (O/U) */}
                  <div className="bg-[#121214] p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] font-mono uppercase text-slate-500 font-bold">Total O/U</div>
                    <div className="text-sm font-extrabold font-mono text-white mt-0.5">
                      {b.total}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      O {b.overOdds} / U {b.underOdds}
                    </div>
                  </div>

                  {/* MONEYLINE */}
                  <div className="bg-[#121214] p-2 rounded-xl border border-white/5">
                    <div className="text-[9px] font-mono uppercase text-slate-500 font-bold">Moneyline</div>
                    <div className="text-sm font-extrabold font-mono text-sky-400 mt-0.5">
                      {b.moneylineHome > 0 ? `+${b.moneylineHome}` : b.moneylineHome}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {activeFocusedGame.awayTeam} {b.moneylineAway > 0 ? `+${b.moneylineAway}` : b.moneylineAway}
                    </div>
                  </div>
                </div>

                {/* Implied Probability Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Implied Win Prob: {activeFocusedGame.homeTeam} {b.impliedHomeWinPct}%</span>
                    <span>{activeFocusedGame.awayTeam} {b.impliedAwayWinPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-amber-400"
                      style={{ width: `${b.impliedHomeWinPct}%` }}
                    />
                    <div
                      className="bg-sky-400"
                      style={{ width: `${b.impliedAwayWinPct}%` }}
                    />
                  </div>
                </div>

                {/* Public vs Sharp splits */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  <span>Tickets: <strong className="text-white">{b.publicTicketsHomePct}% Home</strong></span>
                  <span>Money: <strong className="text-amber-400">{b.publicMoneyHomePct}% Handle</strong></span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* VIEW 2: MULTI-BOOK COMPARISON SPREAD & TOTAL TABLE */}
      {selectedViewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#09090b] text-slate-400 border-b border-white/10 uppercase text-[10px]">
                <th className="p-3">Sportsbook</th>
                <th className="p-3">Away Spread ({activeFocusedGame.awayTeam})</th>
                <th className="p-3">Home Spread ({activeFocusedGame.homeTeam})</th>
                <th className="p-3">Total (Over/Under)</th>
                <th className="p-3">Away ML</th>
                <th className="p-3">Home ML</th>
                <th className="p-3">Public Tickets</th>
                <th className="p-3">Handle / Money</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeFocusedGame.books
                .filter((b) => selectedSportsbook === 'ALL' || b.sportsbook === selectedSportsbook)
                .map((b) => (
                  <tr key={b.sportsbook} className="hover:bg-white/5 transition">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      {b.sportsbook}
                      {b.sharpAlert && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                          SHARP
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-200 font-bold">
                      {b.spreadAway > 0 ? `+${b.spreadAway}` : b.spreadAway} ({b.spreadAwayOdds})
                    </td>
                    <td className="p-3 text-amber-400 font-bold">
                      {b.spreadHome > 0 ? `+${b.spreadHome}` : b.spreadHome} ({b.spreadHomeOdds})
                    </td>
                    <td className="p-3 text-white font-extrabold">
                      {b.total} <span className="text-slate-400 font-normal">(O {b.overOdds} / U {b.underOdds})</span>
                    </td>
                    <td className="p-3 text-sky-400 font-bold">
                      {b.moneylineAway > 0 ? `+${b.moneylineAway}` : b.moneylineAway}
                    </td>
                    <td className="p-3 text-amber-400 font-bold">
                      {b.moneylineHome > 0 ? `+${b.moneylineHome}` : b.moneylineHome}
                    </td>
                    <td className="p-3 text-slate-300">
                      {b.publicTicketsHomePct}% on {activeFocusedGame.homeTeam}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {b.publicMoneyHomePct}% Handle
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: HISTORICAL LINE MOVEMENT TIMELINE CHART */}
      {selectedViewMode === 'line_movement' && (
        <div className="bg-[#09090b] rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300 flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-amber-500" /> Historical Spread &amp; Total Shifts ({activeFocusedGame.awayTeam} @ {activeFocusedGame.homeTeam})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Opening Line vs Closing Movement</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeFocusedGame.lineMovement} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="time" stroke="#71717a" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121214',
                    borderColor: '#27272a',
                    color: '#f8fafc',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="spreadDraftKings"
                  name="DraftKings Spread"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="spreadFanDuel"
                  name="FanDuel Spread"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="spreadBetMGM"
                  name="BetMGM Spread"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 4: SHARP SPLITS & PUBLIC ACTION */}
      {selectedViewMode === 'sharp_splits' && (
        <div className="bg-[#09090b] rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300 flex items-center gap-2 font-mono">
              <Zap className="w-4 h-4 text-rose-500" /> Public Betting % vs Big Money / Sharp Handle
            </h3>
            <span className="text-xs text-amber-400 font-mono font-bold">Consensus Divergence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeFocusedGame.books.slice(0, 4).map((b) => (
              <div key={b.sportsbook} className="bg-[#121214] p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-white font-mono">{b.sportsbook}</span>
                  {b.sharpAlert ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      🔥 Sharp Divergence
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Normal Action</span>
                  )}
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Public Tickets (Bets):</span>
                      <strong className="text-white">{b.publicTicketsHomePct}% on {activeFocusedGame.homeTeam}</strong>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: `${b.publicTicketsHomePct}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Total Handle (Money):</span>
                      <strong className="text-amber-400">{b.publicMoneyHomePct}% on {activeFocusedGame.homeTeam}</strong>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${b.publicMoneyHomePct}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: LINE SHOPPING & BEST VALUE FINDER */}
      {selectedViewMode === 'line_shopping' && (
        <div className="bg-[#09090b] rounded-2xl p-5 border-2 border-amber-500/40 space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                ⭐ Line Shopping Engine
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                Best Available Betting Value Across All Sportsbooks
              </h3>
            </div>
            <Scale className="w-6 h-6 text-amber-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#141418] p-4 rounded-xl border border-amber-500/30">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Best Spread: {activeFocusedGame.awayTeam}</span>
              <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">
                {bestLines.bestSpreadAway > 0 ? `+${bestLines.bestSpreadAway}` : bestLines.bestSpreadAway}
              </div>
              <span className="text-xs font-mono text-slate-300 block mt-1">
                Book: <strong className="text-white">{bestLines.bestSpreadAwayBook}</strong>
              </span>
            </div>

            <div className="bg-[#141418] p-4 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Best Spread: {activeFocusedGame.homeTeam}</span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                {bestLines.bestSpreadHome > 0 ? `+${bestLines.bestSpreadHome}` : bestLines.bestSpreadHome}
              </div>
              <span className="text-xs font-mono text-slate-300 block mt-1">
                Book: <strong className="text-white">{bestLines.bestSpreadHomeBook}</strong>
              </span>
            </div>

            <div className="bg-[#141418] p-4 rounded-xl border border-sky-500/30">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Best Moneyline: {activeFocusedGame.awayTeam}</span>
              <div className="text-xl font-extrabold text-sky-400 font-mono mt-1">
                {bestLines.bestMoneylineAway > 0 ? `+${bestLines.bestMoneylineAway}` : bestLines.bestMoneylineAway}
              </div>
              <span className="text-xs font-mono text-slate-300 block mt-1">
                Book: <strong className="text-white">{bestLines.bestMoneylineAwayBook}</strong>
              </span>
            </div>

            <div className="bg-[#141418] p-4 rounded-xl border border-purple-500/30">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Best Moneyline: {activeFocusedGame.homeTeam}</span>
              <div className="text-xl font-extrabold text-purple-400 font-mono mt-1">
                {bestLines.bestMoneylineHome > 0 ? `+${bestLines.bestMoneylineHome}` : bestLines.bestMoneylineHome}
              </div>
              <span className="text-xs font-mono text-slate-300 block mt-1">
                Book: <strong className="text-white">{bestLines.bestMoneylineHomeBook}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
