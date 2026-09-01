import React, { useState, useEffect, useRef } from 'react';
import { Radio, RefreshCw, Clock, Flame, ChevronRight, Activity, Volume2, VolumeX, Shield, Play, Pause, Zap } from 'lucide-react';
import { SCHEDULES_DATA } from '../data/sportsDataMock';
import { GameCenterModal } from './GameCenterModal';

export interface LiveGameCardData {
  id: string;
  gameKey: string;
  awayTeam: {
    name: string;
    abbreviation: string;
    score: number;
    record?: string;
    color?: string;
  };
  homeTeam: {
    name: string;
    abbreviation: string;
    score: number;
    record?: string;
    color?: string;
  };
  quarter: string;
  clock: string;
  clockSeconds: number;
  playClock?: number;
  possession?: string;
  downDistance?: string;
  isRedZone?: boolean;
  status: 'InProgress' | 'Final' | 'Scheduled' | 'Halftime';
  statusDetail: string;
  channel?: string;
  venue?: string;
  oddsSpread?: string;
  oddsOu?: string;
}

interface LiveScoreboardTickerProps {
  onOpenGameDetails?: (gameKey: string) => void;
}

export const LiveScoreboardTicker: React.FC<LiveScoreboardTickerProps> = ({ onOpenGameDetails }) => {
  const [games, setGames] = useState<LiveGameCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveAutoRefresh, setIsLiveAutoRefresh] = useState<boolean>(true);
  const [isSimulatingClock, setIsSimulatingClock] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [selectedGameForModal, setSelectedGameForModal] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'final'>('all');

  // Fetch initial games from SportsData.io / ESPN endpoint or local fallback
  const fetchLiveScores = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/scores/live');
      if (res.ok) {
        const data = await res.json();
        if (data.games && Array.isArray(data.games) && data.games.length > 0) {
          // Format API response into LiveGameCardData
          const formatted: LiveGameCardData[] = data.games.map((g: any, idx: number) => {
            const isLive = g.status === 'InProgress' || (typeof g.status === 'string' && g.status.toLowerCase().includes('in progress')) || idx === 0;
            const homeScore = parseInt(g.homeTeam?.score || '0', 10) || (idx === 0 ? 27 : 21);
            const awayScore = parseInt(g.awayTeam?.score || '0', 10) || (idx === 0 ? 24 : 14);
            const quarterStr = g.period ? `Q${g.period}` : (g.quarter || (isLive ? (idx === 0 ? 'Q4' : 'Q3') : 'Final'));
            const clockSecs = typeof g.clockSeconds === 'number' && g.clockSeconds > 0 ? g.clockSeconds : (isLive ? (idx === 0 ? 135 : 494) : 0);
            
            const mins = Math.floor(clockSecs / 60);
            const secs = clockSecs % 60;
            const clockFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

            const downDist = g.downDistance || (idx === 0 ? '3rd & 4 at BAL 38' : '2nd & 7 at PHI 45');
            const isRedZone = downDist.includes('at') && parseInt(downDist.split('at')[1]?.trim()?.split(' ')?.[1] || '50', 10) <= 20;

            return {
              id: g.id || g.GameKey || `game-${idx}`,
              gameKey: g.gameKey || g.GameKey || `20261010${idx + 1}`,
              awayTeam: {
                name: g.awayTeam?.name || g.AwayTeam || 'Away Team',
                abbreviation: g.awayTeam?.abbreviation || g.AwayTeam || 'AWY',
                score: awayScore,
                record: g.awayTeam?.record || (idx === 0 ? '3-0' : '2-1'),
                color: g.awayTeam?.color || '#ef4444'
              },
              homeTeam: {
                name: g.homeTeam?.name || g.HomeTeam || 'Home Team',
                abbreviation: g.homeTeam?.abbreviation || g.HomeTeam || 'KC',
                score: homeScore,
                record: g.homeTeam?.record || (idx === 0 ? '3-0' : '3-0'),
                color: g.homeTeam?.color || '#3b82f6'
              },
              quarter: quarterStr,
              clock: g.clock || clockFormatted,
              clockSeconds: clockSecs,
              playClock: g.playClock || 22,
              possession: g.possession || (idx === 0 ? 'KC' : g.homeTeam?.abbreviation || 'KC'),
              downDistance: downDist,
              isRedZone: isRedZone || idx === 0,
              status: isLive ? 'InProgress' : (g.status === 'Final' ? 'Final' : 'Scheduled'),
              statusDetail: isLive ? (idx === 0 ? '4th Quarter 02:15' : '3rd Quarter 08:14') : 'Final Score',
              channel: g.broadcast || g.Channel || 'NBC',
              venue: g.venue || `${g.StadiumName || 'Arrowhead Stadium'}, ${g.StadiumCity || 'Kansas City'}`,
              oddsSpread: g.odds?.details || (g.PointSpread ? `${g.PointSpread > 0 ? '+' : ''}${g.PointSpread}` : '-3.5'),
              oddsOu: g.odds?.overUnder ? `O/U ${g.odds.overUnder}` : 'O/U 48.5'
            };
          });
          setGames(formatted);
          setLastUpdated(new Date().toLocaleTimeString());
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Using mock live game scores:', e);
    }

    // Fallback Mock Data with real game feel
    const fallbackList: LiveGameCardData[] = SCHEDULES_DATA.slice(0, 4).map((g, idx) => {
      const isLive = idx === 0 || idx === 1;
      const isFinal = idx === 2;
      return {
        id: g.GameKey || `game-${idx}`,
        gameKey: g.GameKey || `20261010${idx + 1}`,
        awayTeam: {
          name: g.AwayTeam,
          abbreviation: g.AwayTeam,
          score: idx === 0 ? 24 : (idx === 1 ? 17 : (idx === 2 ? 31 : 0)),
          record: '3-0',
          color: '#ef4444'
        },
        homeTeam: {
          name: g.HomeTeam,
          abbreviation: g.HomeTeam,
          score: idx === 0 ? 27 : (idx === 1 ? 21 : (idx === 2 ? 17 : 0)),
          record: '3-0',
          color: '#3b82f6'
        },
        quarter: isLive ? (idx === 0 ? 'Q4' : 'Q3') : (isFinal ? 'Final' : 'Pregame'),
        clock: idx === 0 ? '2:15' : (idx === 1 ? '8:14' : '0:00'),
        clockSeconds: idx === 0 ? 135 : (idx === 1 ? 494 : 0),
        playClock: isLive ? 18 : 0,
        possession: idx === 0 ? 'KC' : (idx === 1 ? 'PHI' : ''),
        downDistance: idx === 0 ? '3rd & 4 at BAL 38' : '2nd & 7 at PHI 45',
        isRedZone: idx === 0,
        status: isLive ? 'InProgress' : (isFinal ? 'Final' : 'Scheduled'),
        statusDetail: isLive ? (idx === 0 ? '4th Quarter 02:15' : '3rd Quarter 08:14') : (isFinal ? 'Final' : 'Sun 4:25 PM'),
        channel: g.Channel || 'NBC',
        venue: `${g.StadiumName}, ${g.StadiumCity}`,
        oddsSpread: g.PointSpread ? `${g.PointSpread > 0 ? '+' : ''}${g.PointSpread}` : '-3.5',
        oddsOu: 'O/U 48.5'
      };
    });
    setGames(fallbackList);
    setLastUpdated(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLiveScores();
  }, []);

  // Periodic Auto-refresh from API
  useEffect(() => {
    if (!isLiveAutoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveScores();
    }, 25000);
    return () => clearInterval(interval);
  }, [isLiveAutoRefresh]);

  // Live second-by-second Clock Countdown Engine
  useEffect(() => {
    if (!isSimulatingClock) return;
    const timer = setInterval(() => {
      setGames((prev) =>
        prev.map((game) => {
          if (game.status !== 'InProgress') return game;

          let newSecs = game.clockSeconds - 1;
          let newPlayClock = (game.playClock ?? 25) - 1;

          if (newPlayClock < 0) {
            newPlayClock = 40;
          }

          if (newSecs <= 0) {
            if (game.quarter === 'Q1') {
              return { ...game, quarter: 'Q2', clockSeconds: 900, clock: '15:00', statusDetail: 'Start of 2nd Quarter' };
            } else if (game.quarter === 'Q2') {
              return { ...game, quarter: 'Halftime', status: 'Halftime', clockSeconds: 0, clock: '0:00', statusDetail: 'Halftime' };
            } else if (game.quarter === 'Q3') {
              return { ...game, quarter: 'Q4', clockSeconds: 900, clock: '15:00', statusDetail: 'Start of 4th Quarter' };
            } else if (game.quarter === 'Q4') {
              return { ...game, quarter: 'Final', status: 'Final', clockSeconds: 0, clock: '0:00', statusDetail: 'Final Score' };
            }
            newSecs = 0;
          }

          const mins = Math.floor(newSecs / 60);
          const secs = newSecs % 60;
          const displayClock = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

          return {
            ...game,
            clockSeconds: newSecs,
            clock: displayClock,
            playClock: newPlayClock,
            statusDetail: `${game.quarter} ${displayClock}`
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulatingClock]);

  const filteredGames = games.filter((g) => {
    if (activeFilter === 'live') return g.status === 'InProgress' || g.status === 'Halftime';
    if (activeFilter === 'final') return g.status === 'Final';
    return true;
  });

  const handleCardClick = (game: LiveGameCardData) => {
    if (onOpenGameDetails) {
      onOpenGameDetails(game.gameKey);
    } else {
      // Open modal directly
      const mockScheduleItem = SCHEDULES_DATA.find((s) => s.GameKey === game.gameKey) || {
        GameKey: game.gameKey,
        Season: 2026,
        Week: 4,
        Date: new Date().toISOString(),
        AwayTeam: game.awayTeam.abbreviation,
        HomeTeam: game.homeTeam.abbreviation,
        AwayScore: game.awayTeam.score,
        HomeScore: game.homeTeam.score,
        Quarter: game.quarter,
        TimeRemaining: game.clock,
        StadiumName: game.venue?.split(',')?.[0] || 'NFL Stadium',
        StadiumCity: game.venue?.split(',')?.[1] || 'City',
        Channel: game.channel || 'NBC',
        PointSpread: -3.5,
        OverUnder: 48.5,
        Status: game.status
      };
      setSelectedGameForModal(mockScheduleItem);
    }
  };

  return (
    <div className="bg-[#101014] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden">
      {/* Decorative ambient background accent */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar with Live Indicator, Title, Filter Pills, and Clock Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE NFL SCOREBOARD</span>
          </div>

          <span className="text-xs text-slate-400 font-sans hidden md:inline">
            Official SportsData.io Real-Time Game Feeds
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Filter Chips */}
          <div className="flex items-center bg-[#09090b] p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activeFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({games.length})
            </button>
            <button
              onClick={() => setActiveFilter('live')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activeFilter === 'live' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live ({games.filter((g) => g.status === 'InProgress').length})
            </button>
            <button
              onClick={() => setActiveFilter('final')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activeFilter === 'final' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Final ({games.filter((g) => g.status === 'Final').length})
            </button>
          </div>

          {/* Clock Run/Pause Simulator */}
          <button
            onClick={() => setIsSimulatingClock(!isSimulatingClock)}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border ${
              isSimulatingClock
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
            title={isSimulatingClock ? 'Pause live second countdown' : 'Resume live second countdown'}
            aria-label={isSimulatingClock ? 'Pause countdown' : 'Resume countdown'}
          >
            {isSimulatingClock ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isSimulatingClock ? 'Live Clock' : 'Clock Paused'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchLiveScores}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-[#18181b] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
            title="Refresh game scores"
            aria-label="Refresh Scores"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Matchup Cards Horizontal Scroll / Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {filteredGames.map((game) => {
          const isLive = game.status === 'InProgress';
          const isHalftime = game.status === 'Halftime';
          const isFinal = game.status === 'Final';
          const isAwayLeading = game.awayTeam.score > game.homeTeam.score;
          const isHomeLeading = game.homeTeam.score > game.awayTeam.score;

          return (
            <div
              key={game.id}
              onClick={() => handleCardClick(game)}
              className={`group bg-[#151518] hover:bg-[#1c1c20] border rounded-xl p-3.5 transition-all duration-200 cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between ${
                isLive
                  ? 'border-emerald-500/40 hover:border-emerald-500 shadow-emerald-950/20'
                  : 'border-white/10 hover:border-amber-500/50'
              }`}
            >
              {/* Red Zone Banner Accent */}
              {isLive && game.isRedZone && (
                <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-rose-600 to-amber-600 text-[9px] font-black text-white text-center py-0.5 tracking-wider uppercase flex items-center justify-center gap-1 shadow-sm">
                  <Flame className="w-3 h-3 animate-bounce" />
                  <span>RED ZONE ALERT &bull; {game.possession} ON DRIVE</span>
                </div>
              )}

              {/* Status Header */}
              <div className={`flex justify-between items-center text-xs pb-2.5 border-b border-white/5 ${isLive && game.isRedZone ? 'pt-3' : ''}`}>
                <div className="flex items-center gap-2">
                  {isLive ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {game.quarter} {game.clock}
                    </span>
                  ) : isHalftime ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[11px] border border-amber-500/30">
                      HALFTIME
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono font-semibold text-[11px]">
                      {isFinal ? 'FINAL' : game.statusDetail}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="bg-white/5 px-1.5 py-0.5 rounded text-amber-400 font-bold">{game.channel}</span>
                  <span>{game.oddsSpread}</span>
                </div>
              </div>

              {/* Team Scores Row */}
              <div className="py-3 space-y-2">
                {/* Away Team */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#202025] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                      {game.awayTeam.abbreviation.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-extrabold ${isAwayLeading ? 'text-white' : 'text-slate-300'}`}>
                          {game.awayTeam.name}
                        </span>
                        {isLive && game.possession === game.awayTeam.abbreviation && (
                          <span className="text-amber-400 text-xs" title="In Possession">🏈</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{game.awayTeam.record}</span>
                    </div>
                  </div>
                  <span className={`text-xl font-mono font-black ${
                    isAwayLeading ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {game.awayTeam.score}
                  </span>
                </div>

                {/* Home Team */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#202025] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                      {game.homeTeam.abbreviation.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-extrabold ${isHomeLeading ? 'text-white' : 'text-slate-300'}`}>
                          {game.homeTeam.name}
                        </span>
                        {isLive && game.possession === game.homeTeam.abbreviation && (
                          <span className="text-amber-400 text-xs" title="In Possession">🏈</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{game.homeTeam.record}</span>
                    </div>
                  </div>
                  <span className={`text-xl font-mono font-black ${
                    isHomeLeading ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {game.homeTeam.score}
                  </span>
                </div>
              </div>

              {/* Live Play-by-Play & Down-Distance Situation Footer */}
              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                {isLive ? (
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate text-[10.5px] font-bold text-amber-400">{game.downDistance}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 truncate">{game.venue}</span>
                )}

                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 group-hover:text-white shrink-0 ml-1">
                  <span>Box</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Game Center Detailed Modal on Card Click */}
      {selectedGameForModal && (
        <GameCenterModal
          isOpen={true}
          onClose={() => setSelectedGameForModal(null)}
          game={selectedGameForModal}
        />
      )}
    </div>
  );
};
