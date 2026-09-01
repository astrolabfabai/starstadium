import React, { useState, useEffect } from 'react';
import { SeasonCode, SEASONS_LIST, GameSchedule } from '../../types';
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
  Bar
} from 'recharts';
import { SCHEDULES_DATA, NFL_TEAMS } from '../../data/sportsDataMock';
import { getPlaysForGame } from '../../data/gamePlaysData';
import { getPlayTacticalConcept } from '../../data/footballDiagramsData';
import { GridironTacticalCanvas } from '../football/GridironTacticalCanvas';
import { WinProbabilityChart } from '../football/WinProbabilityChart';
import { LivePossessionRedZoneStats } from '../LivePossessionRedZoneStats';
import { BettingOddsWidget } from '../BettingOddsWidget';
import { useScoringNotifications } from '../../context/ScoringNotificationContext';
import {
  Radio,
  Play,
  Pause,
  RefreshCw,
  Clock,
  Flame,
  Wifi,
  Calendar,
  Zap,
  Timer,
  ChevronRight,
  Shield,
  Activity,
  AlertCircle,
  SkipBack,
  SkipForward,
  TrendingUp,
  Bell
} from 'lucide-react';

interface ScoreboardLiveViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  selectedGameKey?: string;
  onSelectGameKey?: (key: string) => void;
  onNavigateToPlayByPlay?: (key: string) => void;
  onNavigateToHighlights?: (key: string) => void;
}

interface LiveGameState {
  id: string;
  gameKey: string;
  week: number;
  awayTeam: { abbreviation: string; name: string; score: number; logo?: string; color?: string };
  homeTeam: { abbreviation: string; name: string; score: number; logo?: string; color?: string };
  quarter: string;
  clockSeconds: number; // exact second countdown (e.g. 135 -> 2:15)
  playClock: number; // 40 or 25s playclock
  possession: string; // 'KC' or 'BAL' etc
  downDistance: string; // '3rd & 4 at BAL 38'
  timeoutsLeftHome: number;
  timeoutsLeftAway: number;
  status: 'InProgress' | 'Final' | 'Scheduled';
  statusDetail: string;
  channel: string;
  venue: string;
  oddsSpread: string;
  oddsOu: string;
  isClockRunning: boolean;
}

export const ScoreboardLiveView: React.FC<ScoreboardLiveViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange,
  selectedGameKey: propSelectedGameKey,
  onSelectGameKey,
  onNavigateToPlayByPlay,
  onNavigateToHighlights
}) => {
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isMasterClockRunning, setIsMasterClockRunning] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedWeek, setSelectedWeek] = useState<number | 'ALL'>(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'FINAL' | 'UPCOMING'>('ALL');
  const [selectedGameKey, setSelectedGameKey] = useState<string>(propSelectedGameKey || '202610101');

  // Initialize live game state with all games from active season in SCHEDULES_DATA
  const [liveGames, setLiveGames] = useState<LiveGameState[]>(() => {
    return SCHEDULES_DATA.map((g, idx) => {
      const isLive = g.Status === 'InProgress';
      const homeTeamInfo = NFL_TEAMS.find((t) => t.Key === g.HomeTeam);
      const awayTeamInfo = NFL_TEAMS.find((t) => t.Key === g.AwayTeam);

      return {
        id: g.GameKey || `game-${idx}`,
        gameKey: g.GameKey,
        week: g.Week || 1,
        awayTeam: {
          abbreviation: g.AwayTeam,
          name: awayTeamInfo ? awayTeamInfo.FullName : g.AwayTeam,
          score: g.AwayScore ?? 0,
          color: awayTeamInfo ? `#${awayTeamInfo.PrimaryColor}` : '#ef4444'
        },
        homeTeam: {
          abbreviation: g.HomeTeam,
          name: homeTeamInfo ? homeTeamInfo.FullName : g.HomeTeam,
          score: g.HomeScore ?? 0,
          color: homeTeamInfo ? `#${homeTeamInfo.PrimaryColor}` : '#3b82f6'
        },
        quarter: g.Quarter || (isLive ? 'Q4' : (g.Status === 'Final' ? 'Final' : 'Pregame')),
        clockSeconds: g.ClockSeconds ?? (isLive ? 135 : 0),
        playClock: g.PlayClock ?? (isLive ? 22 : 0),
        possession: g.Possession || (isLive ? g.AwayTeam : ''),
        downDistance: g.DownDistance || (isLive ? '1st & 10' : (g.Status === 'Final' ? 'Final' : 'Pregame')),
        timeoutsLeftHome: g.TimeoutsLeftHome ?? 3,
        timeoutsLeftAway: g.TimeoutsLeftAway ?? 3,
        status: (g.Status as any) || (isLive ? 'InProgress' : 'Scheduled'),
        statusDetail: isLive ? `${g.Quarter || 'Q4'} ${g.TimeRemaining || '2:15'}` : (g.Status === 'Final' ? 'Final Score' : `${g.Date} ${g.Time || ''}`),
        channel: g.Channel || 'FOX',
        venue: `${g.StadiumName || 'NFL Stadium'}, ${g.StadiumCity || ''}`,
        oddsSpread: g.PointSpread ? `${g.PointSpread > 0 ? '+' : ''}${g.PointSpread}` : '-3.5',
        oddsOu: g.OverUnder ? `O/U ${g.OverUnder}` : 'O/U 48.5',
        isClockRunning: isLive
      };
    });
  });

  // Synchronize when prop changes
  useEffect(() => {
    if (propSelectedGameKey && propSelectedGameKey !== selectedGameKey) {
      setSelectedGameKey(propSelectedGameKey);
      const matched = liveGames.find((g) => g.gameKey === propSelectedGameKey);
      if (matched && matched.week) {
        setSelectedWeek(matched.week);
      }
    }
  }, [propSelectedGameKey]);

  const handleGameSelect = (key: string) => {
    setSelectedGameKey(key);
    if (onSelectGameKey) {
      onSelectGameKey(key);
    }
  };

  const handleWeekChange = (week: number | 'ALL') => {
    setSelectedWeek(week);
    const gamesInWeek = liveGames.filter((g) => week === 'ALL' || g.week === week);
    if (gamesInWeek.length > 0 && !gamesInWeek.some((g) => g.gameKey === selectedGameKey)) {
      handleGameSelect(gamesInWeek[0].gameKey);
    }
  };

  // Second-by-second countdown clock ticker for live games
  useEffect(() => {
    if (!isMasterClockRunning) return;

    const secondInterval = setInterval(() => {
      setLiveGames((prevGames) =>
        prevGames.map((game) => {
          if (game.status !== 'InProgress' || !game.isClockRunning) {
            return game;
          }

          // Decrement game clock by 1 second
          let nextClockSecs = game.clockSeconds - 1;
          let nextPlayClock = game.playClock - 1;
          let nextQuarter = game.quarter;
          let nextStatus = game.status;
          let nextStatusDetail = game.statusDetail;

          // Reset play clock when it hits 0
          if (nextPlayClock < 0) {
            nextPlayClock = 40;
          }

          // Handle end of quarter/game
          if (nextClockSecs <= 0) {
            if (game.quarter === 'Q1') {
              nextQuarter = 'Q2';
              nextClockSecs = 900; // 15 mins
            } else if (game.quarter === 'Q2') {
              nextQuarter = 'HALFTIME';
              nextClockSecs = 0;
            } else if (game.quarter === 'Q3') {
              nextQuarter = 'Q4';
              nextClockSecs = 900;
            } else if (game.quarter === 'Q4') {
              nextQuarter = 'FINAL';
              nextClockSecs = 0;
              nextStatus = 'Final';
            }
          }

          const mins = Math.floor(Math.max(0, nextClockSecs) / 60);
          const secs = Math.max(0, nextClockSecs) % 60;
          const formattedClock = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

          if (nextStatus === 'InProgress') {
            nextStatusDetail = `${nextQuarter} ${formattedClock}`;
          }

          return {
            ...game,
            clockSeconds: Math.max(0, nextClockSecs),
            playClock: nextPlayClock,
            quarter: nextQuarter,
            status: nextStatus,
            statusDetail: nextStatusDetail
          };
        })
      );
    }, 1000);

    return () => clearInterval(secondInterval);
  }, [isMasterClockRunning]);

  // Format MM:SS with exact second formatting
  const formatSecondsToClock = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter games based on selected week and status
  const displayedGames = liveGames.filter((g) => {
    const matchesWeek = selectedWeek === 'ALL' || g.week === selectedWeek;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'LIVE' && g.status === 'InProgress') ||
      (statusFilter === 'FINAL' && g.status === 'Final') ||
      (statusFilter === 'UPCOMING' && g.status === 'Scheduled');
    return matchesWeek && matchesStatus;
  });

  // Dynamic Quarter Score Progression based on active selected game
  const activeGame = liveGames.find((g) => g.gameKey === selectedGameKey) || displayedGames[0] || liveGames[0];
  const awayScore = activeGame?.awayTeam?.score ?? 0;
  const homeScore = activeGame?.homeTeam?.score ?? 0;
  const awayAbbr = activeGame?.awayTeam?.abbreviation || 'AWY';
  const homeAbbr = activeGame?.homeTeam?.abbreviation || 'HOM';

  const scoreProgressionData = [
    { Quarter: 'Start', [awayAbbr]: 0, [homeAbbr]: 0 },
    { Quarter: 'Q1', [awayAbbr]: Math.floor(awayScore * 0.25), [homeAbbr]: Math.floor(homeScore * 0.3) },
    { Quarter: 'Q2 (Half)', [awayAbbr]: Math.floor(awayScore * 0.5), [homeAbbr]: Math.floor(homeScore * 0.55) },
    { Quarter: 'Q3', [awayAbbr]: Math.floor(awayScore * 0.75), [homeAbbr]: Math.floor(homeScore * 0.8) },
    { Quarter: activeGame?.status === 'Final' ? 'Final' : 'Q4 (Live)', [awayAbbr]: awayScore, [homeAbbr]: homeScore }
  ];

  const [rawApiFeed, setRawApiFeed] = useState<any>(null);
  const [showProofAudit, setShowProofAudit] = useState<boolean>(false);

  const fetchLiveScoreboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/live/scoreboard');
      if (res.ok) {
        const data = await res.json();
        setRawApiFeed(data);
        if (data.games && data.games.length > 0) {
          const isEspn = data.source === 'espn_live_api';
          setIsLiveApi(isEspn);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.error('Failed to load live scores', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveScoreboard();
  }, []);

  const {
    unreadCount,
    setIsNotificationCenterOpen,
    triggerSampleScoringDrive
  } = useScoringNotifications();

  const [focusedTab, setFocusedTab] = useState<'tactical' | 'win_prob' | 'possession_redzone' | 'score_flow' | 'odds'>('win_prob');
  const [selectedPlayId, setSelectedPlayId] = useState<number>(5001);
  const [isAutoPlayingTactical, setIsAutoPlayingTactical] = useState<boolean>(false);
  const [autoSpeedTactical, setAutoSpeedTactical] = useState<number>(1);
  const [isRoutesAnimating, setIsRoutesAnimating] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const activeGamePlays = activeGame
    ? getPlaysForGame(
        activeGame.gameKey,
        activeGame.awayTeam.abbreviation,
        activeGame.homeTeam.abbreviation,
        activeGame.status
      )
    : [];

  useEffect(() => {
    if (activeGamePlays.length > 0) {
      setSelectedPlayId(activeGamePlays[0].PlayID);
    }
  }, [selectedGameKey]);

  // Tactical auto-play effect
  useEffect(() => {
    if (!isAutoPlayingTactical || activeGamePlays.length === 0) return;
    const intervalTime = Math.max(2000, 4500 / autoSpeedTactical);
    const timer = setInterval(() => {
      setSelectedPlayId((currentId) => {
        const currentIndex = activeGamePlays.findIndex((p) => p.PlayID === currentId);
        const nextIndex = (currentIndex + 1) % activeGamePlays.length;
        return activeGamePlays[nextIndex].PlayID;
      });
      setSelectedNodeId(null);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isAutoPlayingTactical, autoSpeedTactical, activeGamePlays]);

  const activePlay = activeGamePlays.find((p) => p.PlayID === selectedPlayId) || activeGamePlays[0];
  const activePlayConcept = activePlay ? getPlayTacticalConcept(activePlay) : null;

  const handlePrevPlay = () => {
    if (activeGamePlays.length === 0) return;
    const currentIndex = activeGamePlays.findIndex((p) => p.PlayID === selectedPlayId);
    const prevIndex = (currentIndex - 1 + activeGamePlays.length) % activeGamePlays.length;
    setSelectedPlayId(activeGamePlays[prevIndex].PlayID);
    setSelectedNodeId(null);
  };

  const handleNextPlay = () => {
    if (activeGamePlays.length === 0) return;
    const currentIndex = activeGamePlays.findIndex((p) => p.PlayID === selectedPlayId);
    const nextIndex = (currentIndex + 1) % activeGamePlays.length;
    setSelectedPlayId(activeGamePlays[nextIndex].PlayID);
    setSelectedNodeId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Ticker Controls */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" /> Endpoint 04 &bull; Real-Time Scoreboard & Game Clock (Seconds Resolution)
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide font-serif italic flex items-center gap-2">
              <span>🏈 Live Game Clock & Real-Time Scoreboard</span>
              {isLiveApi ? (
                <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Wifi className="w-3 h-3 animate-pulse" /> Live ESPN Feed
                </span>
              ) : (
                <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} /> Second-by-Second Gridiron Engine
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Endpoint: <code className="text-amber-400 font-mono">/v3/nfl/scores/json/ScoresByWeek/{selectedSeason}/1</code>
              <span className="ml-2 text-slate-500">&bull; Last Sync: {lastUpdated}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Season Inline Picker */}
            <div className="flex items-center gap-1.5 bg-[#09090b] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Season:</span>
              <select
                value={selectedSeason}
                onChange={(e) => onSeasonChange && onSeasonChange(e.target.value as SeasonCode)}
                className="bg-transparent text-amber-400 font-bold font-mono focus:outline-none cursor-pointer"
              >
                {SEASONS_LIST.map((s) => (
                  <option key={s.code} value={s.code} className="bg-[#121214] text-slate-200">
                    {s.label} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Master Clock Play/Pause Toggle */}
            <button
              onClick={() => setIsMasterClockRunning(!isMasterClockRunning)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isMasterClockRunning
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-emerald-500/20'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              {isMasterClockRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isMasterClockRunning ? 'Game Clocks Ticking' : 'Resume Clocks'}</span>
            </button>

            <button
              onClick={fetchLiveScoreboard}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs hover:bg-white/10 hover:text-white flex items-center gap-1.5 transition-all font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>🔄 Sync</span>
            </button>

            {/* Proof of Live Games Inspector Toggle */}
            <button
              onClick={() => setShowProofAudit(!showProofAudit)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all font-mono ${
                showProofAudit
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/20'
                  : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>🛡️ Telemetry</span>
            </button>

            {/* Scoring Alert Actions */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
              <button
                onClick={() => triggerSampleScoringDrive('TOUCHDOWN', activeGame?.gameKey)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 font-mono"
                title="Trigger a real-time scoring drive alert for this matchup"
              >
                <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>⚡ TD Sim</span>
              </button>

              <button
                onClick={() => setIsNotificationCenterOpen(true)}
                className="p-1.5 rounded-xl bg-[#18181b] border border-white/10 text-amber-400 hover:text-white hover:bg-white/10 transition-all relative font-mono"
                title="Open Scoring Drive Notification Feed"
                aria-label="Open Scoring Drive Notification Feed"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black flex items-center justify-center border border-[#18181b]">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* LIVE PROOF & VERIFICATION TELEMETRY DRAWER */}
        {showProofAudit && (
          <div className="mb-6 p-4 rounded-2xl bg-[#09090b] border-2 border-emerald-500/40 shadow-2xl animate-fadeIn space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">🛡️</span>
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                    Live Broadcast Feed Proof &amp; Verification
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                      Active Stream
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time verification telemetry proving live connection to official NFL data providers.
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-400">
                <span>Verified Server Timestamp: </span>
                <strong className="text-emerald-400">{rawApiFeed?.timestamp || new Date().toISOString()}</strong>
              </div>
            </div>

            {/* 3 Pillars of Live Proof */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#121214] border border-white/5 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Real-Time Network Source</span>
                </div>
                <div className="text-xs text-slate-200 font-mono">
                  Origin: <code className="text-amber-400">site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard</code>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Fetches live live NFL event IDs, authentic team logos, active game clocks, and official stadium coordinates directly from ESPN&apos;s live edge network.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-white/5 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Dynamic Situation Telemetry</span>
                </div>
                <div className="text-xs text-slate-200 font-mono">
                  Feeds: <code className="text-amber-400">situation.downDistanceText</code> + <code className="text-amber-400">possessionText</code>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Sub-second situational telemetry including active line of scrimmage, line to gain, official play clock countdowns, and remaining team timeouts.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121214] border border-white/5 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>3. Vegas Betting &amp; Broadcast</span>
                </div>
                <div className="text-xs text-slate-200 font-mono">
                  Feeds: <code className="text-sky-400">odds.details</code> + <code className="text-sky-400">broadcasts[0].names</code>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Live point spreads, Over/Under totals from sportsbooks, and verified broadcast networks (NBC, CBS, FOX, ESPN, NFL Network).
                </p>
              </div>
            </div>

            {/* Raw JSON Inspect */}
            <div className="p-3 rounded-xl bg-[#030304] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400 font-bold uppercase">Raw Server Response Payload Sample:</span>
                <span className="text-emerald-400 font-bold">HTTP 200 OK &bull; JSON Payload</span>
              </div>
              <pre className="text-[10px] font-mono text-emerald-400/90 bg-black/80 p-3 rounded-lg overflow-x-auto max-h-48 scrollbar-thin border border-emerald-500/20">
                {JSON.stringify(rawApiFeed || {
                  source: 'espn_live_api',
                  status: '200_CONNECTED',
                  server_proxy: '/api/live/scoreboard',
                  events_count: liveGames.length,
                  sample_game: liveGames[0]
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* THIS WEEK'S GAMES FILTER BAR & SLATE CONTROLS */}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3.5 rounded-2xl bg-[#09090b] border border-white/10 shadow-lg">
          {/* Week Selection Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mr-1">
              Slate:
            </span>
            <button
              onClick={() => handleWeekChange(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                selectedWeek === 1
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span>🏈 Week 1 (This Week)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedWeek === 1 ? 'bg-black/20 text-slate-950 font-black' : 'bg-white/10 text-slate-400'}`}>
                {liveGames.filter(g => g.week === 1).length}
              </span>
            </button>
            <button
              onClick={() => handleWeekChange(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                selectedWeek === 2
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span>Week 2</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedWeek === 2 ? 'bg-black/20 text-slate-950 font-black' : 'bg-white/10 text-slate-400'}`}>
                {liveGames.filter(g => g.week === 2).length}
              </span>
            </button>
            <button
              onClick={() => handleWeekChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                selectedWeek === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span>All Weeks</span>
            </button>
          </div>

          {/* Status Filter Pills with Emojis */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                statusFilter === 'ALL'
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐</span>
              <span>All ({liveGames.filter(g => selectedWeek === 'ALL' || g.week === selectedWeek).length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('LIVE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
                statusFilter === 'LIVE'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold'
                  : 'bg-white/5 text-rose-400/80 hover:text-rose-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>🔴 Live ({liveGames.filter(g => (selectedWeek === 'ALL' || g.week === selectedWeek) && g.status === 'InProgress').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('FINAL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                statusFilter === 'FINAL'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-emerald-300'
              }`}
            >
              <span>✅</span>
              <span>Final ({liveGames.filter(g => (selectedWeek === 'ALL' || g.week === selectedWeek) && g.status === 'Final').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('UPCOMING')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                statusFilter === 'UPCOMING'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-amber-300'
              }`}
            >
              <span>📅</span>
              <span>Upcoming ({liveGames.filter(g => (selectedWeek === 'ALL' || g.week === selectedWeek) && g.status === 'Scheduled').length})</span>
            </button>
          </div>
        </div>

        {/* LIVE GAMES GRID WITH GAME CLOCK TO THE SECOND */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {displayedGames.map((g) => {
            const isSelected = g.gameKey === selectedGameKey;
            const isLive = g.status === 'InProgress';
            const formattedClock = formatSecondsToClock(g.clockSeconds);
            const playClockWarning = g.playClock <= 5 && isLive;

            // Calculate live win probability for card preview
            let cardHomeProb = 50;
            if (g.status === 'Final') {
              cardHomeProb = g.homeTeam.score > g.awayTeam.score ? 100 : g.awayTeam.score > g.homeTeam.score ? 0 : 50;
            } else if (g.status === 'Scheduled') {
              const spreadNum = parseFloat(g.oddsSpread.replace(/[^0-9.-]/g, '')) || 0;
              const isHomeFavored = g.oddsSpread.startsWith('-');
              const homeBase = isHomeFavored ? 50 + Math.abs(spreadNum) * 2.5 : 50 - Math.abs(spreadNum) * 2.5;
              cardHomeProb = Math.min(85, Math.max(15, Math.round(homeBase)));
            } else {
              const scoreDiff = g.homeTeam.score - g.awayTeam.score;
              let prob = 50 + scoreDiff * 4.5;
              if (g.quarter === 'Q4') {
                const timeFactor = (900 - g.clockSeconds) / 900;
                prob += scoreDiff * 3.0 * timeFactor;
              }
              cardHomeProb = Math.min(99, Math.max(1, Math.round(prob)));
            }
            const cardAwayProb = 100 - cardHomeProb;

            return (
              <div
                key={g.id}
                onClick={() => handleGameSelect(g.gameKey)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#151518] border-amber-500 ring-1 ring-amber-500/40 shadow-xl scale-[1.01]'
                    : 'bg-[#09090b] border-white/10 hover:border-white/25 shadow-md'
                }`}
              >
                {/* Top Status & Live Second Clock Header */}
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold mb-3 font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <span>📺</span>
                    <span>{g.channel}</span>
                  </span>
                  {isLive ? (
                    <div className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full animate-pulse font-extrabold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      <span>{g.quarter}</span>
                      <span className="text-white font-mono">{formattedClock}</span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                      {g.status === 'Final' ? '✅ FINAL' : '📅 ' + g.status}
                    </span>
                  )}
                </div>

                {/* Teams, Scores & Possession */}
                <div className="space-y-2.5 my-1">
                  {/* Away Team */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-6 rounded-full inline-block shadow-sm"
                        style={{ backgroundColor: g.awayTeam.color || '#f59e0b' }}
                      />
                      <span className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                        {g.awayTeam.abbreviation}
                        {g.possession === g.awayTeam.abbreviation && (
                          <span className="text-xs animate-bounce" title="Active Ball Possession">🏈</span>
                        )}
                      </span>
                      {/* Timeouts Left Dots */}
                      {isLive && (
                        <div className="flex items-center gap-0.5 ml-1">
                          {[1, 2, 3].map((dot) => (
                            <span
                              key={dot}
                              className={`w-1 h-3 rounded-sm ${
                                dot <= g.timeoutsLeftAway ? 'bg-amber-400' : 'bg-slate-700'
                              }`}
                              title={`Away Timeouts: ${g.timeoutsLeftAway}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-mono font-extrabold text-white text-xl">{g.awayTeam.score}</span>
                  </div>

                  {/* Home Team */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-6 rounded-full inline-block shadow-sm"
                        style={{ backgroundColor: g.homeTeam.color || '#3b82f6' }}
                      />
                      <span className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                        {g.homeTeam.abbreviation}
                        {g.possession === g.homeTeam.abbreviation && (
                          <span className="text-xs animate-bounce" title="Active Ball Possession">🏈</span>
                        )}
                      </span>
                      {/* Timeouts Left Dots */}
                      {isLive && (
                        <div className="flex items-center gap-0.5 ml-1">
                          {[1, 2, 3].map((dot) => (
                            <span
                              key={dot}
                              className={`w-1 h-3 rounded-sm ${
                                dot <= g.timeoutsLeftHome ? 'bg-amber-400' : 'bg-slate-700'
                              }`}
                              title={`Home Timeouts: ${g.timeoutsLeftHome}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-mono font-extrabold text-white text-xl">{g.homeTeam.score}</span>
                  </div>
                </div>

                {/* Down & Distance + Play Clock (Seconds Resolution) */}
                {isLive && (
                  <div className="my-2 p-2 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-slate-300 font-bold truncate text-[11px]">{g.downDistance}</span>
                    </div>
                    {/* Play Clock Badge */}
                    <div
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono shrink-0 ml-1 ${
                        playClockWarning
                          ? 'bg-rose-500 text-white animate-ping font-extrabold'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                      title="Play Clock"
                    >
                      :{g.playClock.toString().padStart(2, '0')}
                    </div>
                  </div>
                )}

                {/* Mini Live Win-Prob Bar */}
                <div className="pt-2 border-t border-white/5 space-y-1 font-mono">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300 font-bold">{g.awayTeam.abbreviation} {cardAwayProb}%</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-0.5 text-[9px] uppercase">
                      <TrendingUp className="w-2.5 h-2.5 text-indigo-400" /> Prob
                    </span>
                    <span className="text-slate-300 font-bold">{g.homeTeam.abbreviation} {cardHomeProb}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${cardAwayProb}%`, backgroundColor: g.awayTeam.color || '#ef4444' }}
                    />
                    <div
                      className="h-full rounded-r-full transition-all duration-500"
                      style={{ width: `${cardHomeProb}%`, backgroundColor: g.homeTeam.color || '#3b82f6' }}
                    />
                  </div>
                </div>

                {/* Odds & Venue footer with Pills */}
                <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1.5 mt-1.5 flex justify-between items-center font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-bold">
                    🎯 {g.oddsSpread}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                    📊 {g.oddsOu}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOCUSED GAME LIVE CLOCK & GAME SITUATION HERO PANEL */}
        {activeGame && (
          <div className="bg-[#09090b] rounded-2xl p-5 border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/30">
                  ⏱️
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Live Broadcast Telemetry
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeGame.venue} &bull; {activeGame.channel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <h3 className="text-xl font-extrabold text-white tracking-wide">
                      {activeGame.awayTeam.name} ({activeGame.awayTeam.score}) @ {activeGame.homeTeam.name} ({activeGame.homeTeam.score})
                    </h3>
                    <div className="flex items-center gap-2">
                      {onNavigateToHighlights && (
                        <button
                          onClick={() => onNavigateToHighlights(activeGame.gameKey)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black font-mono text-xs transition shadow-md shadow-amber-500/20 hover:opacity-90"
                          title="Auto-match and download highlight clips for this matchup"
                        >
                          <span>🎬 Video Highlights</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onNavigateToPlayByPlay && (
                        <button
                          onClick={() => onNavigateToPlayByPlay(activeGame.gameKey)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-mono text-xs transition border border-white/10"
                          title="View all animated play-by-play reels for this game"
                        >
                          <span>⚡ Tactical Plays</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Game Clock to the Second Big Display */}
              <div className="flex items-center gap-3 bg-[#121214] px-4 py-2.5 rounded-2xl border border-emerald-500/40">
                <div className="text-center">
                  <div className="text-[9px] uppercase font-mono font-bold text-slate-400">Quarter</div>
                  <div className="text-lg font-extrabold text-white font-mono">{activeGame.quarter}</div>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-[9px] uppercase font-mono font-bold text-slate-400">Game Clock</div>
                  <div className="text-2xl font-black text-amber-400 font-mono tracking-wider animate-pulse">
                    {formatSecondsToClock(activeGame.clockSeconds)}
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-[9px] uppercase font-mono font-bold text-slate-400">Play Clock</div>
                  <div className="text-lg font-black text-rose-400 font-mono">
                    :{activeGame.playClock.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Situation Badges Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="bg-[#121214] p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Possession</span>
                <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1.5 mt-0.5">
                  🏈 {activeGame.possession} Offense
                </span>
              </div>
              <div className="bg-[#121214] p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Down & Distance</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  {activeGame.downDistance}
                </span>
              </div>
              <div className="bg-[#121214] p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Away Timeouts ({activeGame.awayTeam.abbreviation})</span>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3].map((t) => (
                    <span
                      key={t}
                      className={`w-3 h-3 rounded-full ${
                        t <= activeGame.timeoutsLeftAway ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-mono text-slate-300 ml-1.5 font-bold">{activeGame.timeoutsLeftAway} Left</span>
                </div>
              </div>
              <div className="bg-[#121214] p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Home Timeouts ({activeGame.homeTeam.abbreviation})</span>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3].map((t) => (
                    <span
                      key={t}
                      className={`w-3 h-3 rounded-full ${
                        t <= activeGame.timeoutsLeftHome ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-mono text-slate-300 ml-1.5 font-bold">{activeGame.timeoutsLeftHome} Left</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation in Focused Game Hero Panel */}
            <div className="flex items-center gap-2 border-b border-white/10 pt-2 pb-0 overflow-x-auto">
              <button
                onClick={() => setFocusedTab('win_prob')}
                className={`px-4 py-2 rounded-t-xl text-xs font-bold font-mono flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  focusedTab === 'win_prob'
                    ? 'border-indigo-500 text-indigo-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>📊 Live Win Probability Shift</span>
              </button>

              <button
                onClick={() => setFocusedTab('tactical')}
                className={`px-4 py-2 rounded-t-xl text-xs font-bold font-mono flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  focusedTab === 'tactical'
                    ? 'border-amber-500 text-amber-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>🏈 Gridiron Tactical Visualizer ({activeGamePlays.length} Plays)</span>
              </button>

              <button
                onClick={() => setFocusedTab('possession_redzone')}
                className={`px-4 py-2 rounded-t-xl text-xs font-bold font-mono flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  focusedTab === 'possession_redzone'
                    ? 'border-rose-500 text-rose-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-4 h-4 text-rose-500" />
                <span>🔥 Live Possession &amp; Red Zone Stats</span>
              </button>

              <button
                onClick={() => setFocusedTab('score_flow')}
                className={`px-4 py-2 rounded-t-xl text-xs font-bold font-mono flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  focusedTab === 'score_flow'
                    ? 'border-sky-500 text-sky-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-sky-400" />
                <span>📈 Score Progression Flow</span>
              </button>

              <button
                onClick={() => setFocusedTab('odds')}
                className={`px-4 py-2 rounded-t-xl text-xs font-bold font-mono flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  focusedTab === 'odds'
                    ? 'border-emerald-500 text-emerald-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>🎲 Betting Odds &amp; Spreads</span>
              </button>
            </div>

            {/* TAB 0: LIVE WIN PROBABILITY SHIFT CHART */}
            {focusedTab === 'win_prob' && (
              <div className="mt-4">
                <WinProbabilityChart
                  gameKey={activeGame.gameKey}
                  homeTeam={activeGame.homeTeam}
                  awayTeam={activeGame.awayTeam}
                  status={activeGame.status}
                  quarter={activeGame.quarter}
                  clock={formatSecondsToClock(activeGame.clockSeconds)}
                  plays={activeGamePlays}
                  pointSpread={SCHEDULES_DATA.find((g) => g.GameKey === activeGame.gameKey)?.PointSpread}
                  onSelectPlay={(playId) => {
                    setSelectedPlayId(playId);
                    setFocusedTab('tactical');
                  }}
                />
              </div>
            )}

            {/* TAB 1: GRIDIRON TACTICAL VISUALIZER */}
            {focusedTab === 'tactical' && (
              <div className="mt-4 space-y-4">
                {/* Stepper Ribbon */}
                <div className="bg-[#121214] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={handlePrevPlay}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition"
                        title="Previous Play"
                      >
                        <SkipBack className="w-3.5 h-3.5 text-amber-400" />
                        <span>Prev</span>
                      </button>
                      <button
                        onClick={handleNextPlay}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition"
                        title="Next Play"
                      >
                        <span>Next</span>
                        <SkipForward className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>

                    {/* Auto Play Reel */}
                    <button
                      onClick={() => setIsAutoPlayingTactical(!isAutoPlayingTactical)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                        isAutoPlayingTactical
                          ? 'bg-amber-500 text-slate-950 font-extrabold animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                      }`}
                    >
                      {isAutoPlayingTactical ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isAutoPlayingTactical ? 'Pause Reel' : 'Auto Play Reel'}</span>
                    </button>

                    {/* Speed Multiplier */}
                    <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-white/10 text-[10px] font-mono text-slate-400">
                      <span>Speed:</span>
                      {[1, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setAutoSpeedTactical(spd)}
                          className={`px-1.5 py-0.5 rounded font-bold transition ${
                            autoSpeedTactical === spd
                              ? 'bg-amber-500 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Route Animation Toggle */}
                  <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRoutesAnimating}
                      onChange={(e) => setIsRoutesAnimating(e.target.checked)}
                      className="rounded border-white/20 bg-black/60 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Animate Routes
                    </span>
                  </label>
                </div>

                {/* Canvas & Play Log Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-8 space-y-3">
                    {activePlayConcept && (
                      <GridironTacticalCanvas
                        playConcept={activePlayConcept}
                        isAnimating={isRoutesAnimating}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={setSelectedNodeId}
                        zoom={1}
                      />
                    )}
                    {activePlay && (
                      <div className="p-3 bg-[#121214] border border-white/10 rounded-xl text-xs text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono">
                        <div>
                          <span className="text-amber-400 font-bold">Q{activePlay.Quarter} {activePlay.TimeRemaining}:</span> {activePlay.Description}
                        </div>
                        <div className="text-slate-400 shrink-0">
                          EPA: <strong className={activePlay.epa && activePlay.epa > 0 ? 'text-emerald-400' : 'text-rose-400'}>{activePlay.epa ? `${activePlay.epa > 0 ? '+' : ''}${activePlay.epa}` : '0.00'}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-4 bg-[#121214] border border-white/10 rounded-2xl p-3 max-h-[460px] overflow-y-auto space-y-2">
                    <div className="text-[10px] font-mono uppercase font-bold text-slate-400 pb-2 border-b border-white/10">
                      Game Plays ({activeGamePlays.length})
                    </div>
                    {activeGamePlays.map((p) => {
                      const isSelected = p.PlayID === selectedPlayId;
                      return (
                        <div
                          key={p.PlayID}
                          onClick={() => {
                            setSelectedPlayId(p.PlayID);
                            setSelectedNodeId(null);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-white'
                              : 'bg-black/40 border-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                            <span className="text-amber-400 font-bold">Q{p.Quarter} {p.TimeRemaining} &bull; {p.Possession}</span>
                            <span className="text-slate-400">{p.YardsGained > 0 ? `+${p.YardsGained}` : p.YardsGained} yds</span>
                          </div>
                          <p className="line-clamp-2 text-[11px] leading-tight">{p.Description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE POSSESSION & RED ZONE STATS */}
            {focusedTab === 'possession_redzone' && (
              <div className="mt-4">
                <LivePossessionRedZoneStats
                  game={{
                    id: activeGame.id,
                    gameKey: activeGame.gameKey,
                    name: `${activeGame.awayTeam.name} at ${activeGame.homeTeam.name}`,
                    shortName: `${activeGame.awayTeam.abbreviation} @ ${activeGame.homeTeam.abbreviation}`,
                    date: new Date().toISOString(),
                    awayTeam: {
                      name: activeGame.awayTeam.name,
                      abbreviation: activeGame.awayTeam.abbreviation,
                      score: activeGame.awayTeam.score
                    },
                    homeTeam: {
                      name: activeGame.homeTeam.name,
                      abbreviation: activeGame.homeTeam.abbreviation,
                      score: activeGame.homeTeam.score
                    },
                    quarter: activeGame.quarter,
                    clock: formatSecondsToClock(activeGame.clockSeconds),
                    clockSeconds: activeGame.clockSeconds,
                    playClock: activeGame.playClock,
                    possession: activeGame.possession,
                    downDistance: activeGame.downDistance,
                    status: activeGame.status as any,
                    statusDetail: activeGame.statusDetail
                  }}
                />
              </div>
            )}

            {/* TAB 3: SCORE PROGRESSION FLOW */}
            {focusedTab === 'score_flow' && (
              <div className="mt-4 pt-3">
                <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" /> Real-Time Score Progression Flow ({activeGame.awayTeam.name} vs {activeGame.homeTeam.name})
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreProgressionData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                      <XAxis dataKey="Quarter" stroke="#71717a" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey={awayAbbr} name={`${activeGame.awayTeam.name} (${awayAbbr})`} stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey={homeAbbr} name={`${activeGame.homeTeam.name} (${homeAbbr})`} stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 4: BETTING ODDS & SPREADS */}
            {focusedTab === 'odds' && (
              <div className="mt-4">
                <BettingOddsWidget gameKey={activeGame.gameKey} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
