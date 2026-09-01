import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { PlayByPlayEvent } from '../../types';
import { getPlaysForGame } from '../../data/gamePlaysData';
import { NFL_TEAMS } from '../../data/sportsDataMock';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Flame,
  Clock,
  Shield,
  Award,
  Filter,
  Info,
  ChevronRight
} from 'lucide-react';

interface WinProbabilityChartProps {
  gameKey: string;
  homeTeam: {
    abbreviation: string;
    name: string;
    score: number;
    color?: string;
  };
  awayTeam: {
    abbreviation: string;
    name: string;
    score: number;
    color?: string;
  };
  status?: string;
  quarter?: string;
  clock?: string;
  plays?: PlayByPlayEvent[];
  pointSpread?: number;
  onSelectPlay?: (playId: number) => void;
}

export interface WinProbDataPoint {
  index: number;
  playId: number;
  label: string;
  quarter: number | string;
  timeRemaining: string;
  homeWinPct: number;
  awayWinPct: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  description: string;
  playType: string;
  deltaHome: number;
  isBigPlay: boolean;
  epa?: number;
  possession?: string;
  downDistance?: string;
}

export const WinProbabilityChart: React.FC<WinProbabilityChartProps> = ({
  gameKey,
  homeTeam,
  awayTeam,
  status = 'InProgress',
  quarter = 'Q4',
  clock = '02:15',
  plays: customPlays,
  pointSpread,
  onSelectPlay
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'LEVERAGE'>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<WinProbDataPoint | null>(null);
  const [chartType, setChartType] = useState<'dual_line' | 'area_split'>('dual_line');

  // Resolve team colors with fallback
  const homeTeamInfo = NFL_TEAMS.find((t) => t.Key === homeTeam.abbreviation);
  const awayTeamInfo = NFL_TEAMS.find((t) => t.Key === awayTeam.abbreviation);

  const homeColor =
    homeTeam.color || (homeTeamInfo ? `#${homeTeamInfo.PrimaryColor.replace('#', '')}` : '#3b82f6');
  const awayColor =
    awayTeam.color || (awayTeamInfo ? `#${awayTeamInfo.PrimaryColor.replace('#', '')}` : '#ef4444');

  // Get chronological plays for this game
  const rawPlays = useMemo(() => {
    if (customPlays && customPlays.length > 0) return customPlays;
    return getPlaysForGame(gameKey, awayTeam.abbreviation, homeTeam.abbreviation, status);
  }, [gameKey, customPlays, awayTeam.abbreviation, homeTeam.abbreviation, status]);

  // Compute pregame baseline win probability from spread
  const pregameHomeWinPct = useMemo(() => {
    if (pointSpread !== undefined) {
      // Basic normal distribution estimate: -3.5 spread ~ 58.5%
      const spread = typeof pointSpread === 'number' ? pointSpread : 0;
      const prob = 50 - spread * 2.4;
      return Math.min(85, Math.max(15, parseFloat(prob.toFixed(1))));
    }
    return 54.2; // Slight standard home field advantage default
  }, [pointSpread]);

  // Build time-series data points
  const fullTimeSeries: WinProbDataPoint[] = useMemo(() => {
    const points: WinProbDataPoint[] = [];

    // 0. Kickoff / Pre-game Baseline
    points.push({
      index: 0,
      playId: 0,
      label: 'Kickoff',
      quarter: 1,
      timeRemaining: '15:00',
      homeWinPct: pregameHomeWinPct,
      awayWinPct: parseFloat((100 - pregameHomeWinPct).toFixed(1)),
      homeTeam: homeTeam.abbreviation,
      awayTeam: awayTeam.abbreviation,
      homeScore: 0,
      awayScore: 0,
      description: `Pregame baseline projection based on Vegas odds & team power ratings.`,
      playType: 'Kickoff',
      deltaHome: 0,
      isBigPlay: false,
      epa: 0
    });

    let runningHomeScore = 0;
    let runningAwayScore = 0;
    let prevHomeWinPct = pregameHomeWinPct;

    rawPlays.forEach((p, idx) => {
      // Score tracking heuristics
      if (p.Description.includes('TOUCHDOWN') || p.PlayType === 'Touchdown') {
        if (p.Possession === homeTeam.abbreviation) runningHomeScore += 7;
        else runningAwayScore += 7;
      } else if (p.PlayType === 'Field Goal' && p.Description.includes('GOOD')) {
        if (p.Possession === homeTeam.abbreviation) runningHomeScore += 3;
        else runningAwayScore += 3;
      }

      const rawHomePct = p.WinProbabilityPct ?? 50.0;
      const roundedHomePct = parseFloat(rawHomePct.toFixed(1));
      const roundedAwayPct = parseFloat((100 - roundedHomePct).toFixed(1));
      const delta = parseFloat((roundedHomePct - prevHomeWinPct).toFixed(1));
      prevHomeWinPct = roundedHomePct;

      points.push({
        index: idx + 1,
        playId: p.PlayID,
        label: `Q${p.Quarter} ${p.TimeRemaining}`,
        quarter: p.Quarter,
        timeRemaining: p.TimeRemaining,
        homeWinPct: roundedHomePct,
        awayWinPct: roundedAwayPct,
        homeTeam: homeTeam.abbreviation,
        awayTeam: awayTeam.abbreviation,
        homeScore: runningHomeScore,
        awayScore: runningAwayScore,
        description: p.Description,
        playType: p.PlayType,
        deltaHome: delta,
        isBigPlay: p.IsBigPlay || Math.abs(delta) >= 8.0,
        epa: p.epa,
        possession: p.Possession,
        downDistance: p.Down && p.Distance ? `${p.Down} & ${p.Distance}` : undefined
      });
    });

    // If game is Final, append absolute 100% / 0% outcome point
    if (status === 'Final' && points.length > 0) {
      const isHomeWin = homeTeam.score > awayTeam.score;
      const finalHomePct = isHomeWin ? 100 : 0;
      const lastPoint = points[points.length - 1];
      points.push({
        index: points.length,
        playId: 99999,
        label: 'Final',
        quarter: 'Final',
        timeRemaining: '0:00',
        homeWinPct: finalHomePct,
        awayWinPct: 100 - finalHomePct,
        homeTeam: homeTeam.abbreviation,
        awayTeam: awayTeam.abbreviation,
        homeScore: homeTeam.score,
        awayScore: awayTeam.score,
        description: `Official Final Score: ${awayTeam.name} ${awayTeam.score}, ${homeTeam.name} ${homeTeam.score}`,
        playType: 'Final',
        deltaHome: parseFloat((finalHomePct - lastPoint.homeWinPct).toFixed(1)),
        isBigPlay: true,
        epa: 0
      });
    }

    return points;
  }, [rawPlays, pregameHomeWinPct, homeTeam, awayTeam, status]);

  // Filter points for chart display
  const displayedPoints = useMemo(() => {
    if (selectedFilter === 'ALL') return fullTimeSeries;
    if (selectedFilter === 'LEVERAGE') {
      return fullTimeSeries.filter((p) => p.index === 0 || p.isBigPlay || Math.abs(p.deltaHome) >= 6.0);
    }
    const qNum = parseInt(selectedFilter.replace('Q', ''), 10);
    return fullTimeSeries.filter((p) => p.quarter === qNum || p.index === 0);
  }, [fullTimeSeries, selectedFilter]);

  // Current Live Win Probability (last point or real-time score metric)
  const currentPoint = fullTimeSeries[fullTimeSeries.length - 1] || {
    homeWinPct: 50,
    awayWinPct: 50
  };

  const currentHomePct = currentPoint.homeWinPct;
  const currentAwayPct = currentPoint.awayWinPct;
  const isHomeLeadingProb = currentHomePct >= currentAwayPct;

  // Find biggest swing plays in the game
  const topSwings = useMemo(() => {
    return [...fullTimeSeries]
      .filter((p) => p.playId > 0 && Math.abs(p.deltaHome) > 0)
      .sort((a, b) => Math.abs(b.deltaHome) - Math.abs(a.deltaHome))
      .slice(0, 4);
  }, [fullTimeSeries]);

  return (
    <div className="space-y-4">
      {/* 1. TOP HERO WIN-PROBABILITY SPLIT METER */}
      <div className="bg-[#0e0e11] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Ambient subtle glow based on winning team */}
        <div
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: isHomeLeadingProb ? homeColor : awayColor }}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-amber-400 animate-pulse" /> Live Win Probability Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {status === 'Final' ? '🏁 Game Settled' : `🔴 Live Model Shift (${quarter} ${clock})`}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Real-Time Probability Shift &amp; Leverage Dynamics
            </h3>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 text-right">
              <span className="text-[9px] uppercase font-mono text-slate-400 block">Model Favorite</span>
              <span className="text-xs font-black font-mono text-white flex items-center gap-1">
                {isHomeLeadingProb ? homeTeam.name : awayTeam.name}
                <strong className="text-amber-400">({Math.max(currentHomePct, currentAwayPct)}%)</strong>
              </span>
            </div>
            <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 text-right hidden sm:block">
              <span className="text-[9px] uppercase font-mono text-slate-400 block">Pregame Baseline</span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {homeTeam.abbreviation} {pregameHomeWinPct}% &bull; {awayTeam.abbreviation} {(100 - pregameHomeWinPct).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Dual Live Probability Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-end font-mono">
            {/* Away Team Info */}
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: awayColor }}
              />
              <span className="text-xs sm:text-sm font-black text-white">{awayTeam.name}</span>
              <span className="text-xs sm:text-sm font-mono font-black text-slate-300">
                ({awayTeam.abbreviation})
              </span>
              <span
                className="text-lg sm:text-2xl font-black font-mono ml-2 transition-all"
                style={{ color: awayColor }}
              >
                {currentAwayPct}%
              </span>
            </div>

            {/* Home Team Info */}
            <div className="flex items-center gap-2 text-right">
              <span
                className="text-lg sm:text-2xl font-black font-mono mr-2 transition-all"
                style={{ color: homeColor }}
              >
                {currentHomePct}%
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-slate-300">
                ({homeTeam.abbreviation})
              </span>
              <span className="text-xs sm:text-sm font-black text-white">{homeTeam.name}</span>
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: homeColor }}
              />
            </div>
          </div>

          {/* Meter Bar */}
          <div className="h-4 sm:h-5 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 flex relative shadow-inner">
            {/* 50% Center Marker */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 z-10 -translate-x-1/2 pointer-events-none" />
            
            {/* Away Fill */}
            <div
              className="h-full rounded-l-full transition-all duration-700 relative overflow-hidden"
              style={{
                width: `${currentAwayPct}%`,
                backgroundColor: awayColor
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/10" />
            </div>

            {/* Home Fill */}
            <div
              className="h-full rounded-r-full transition-all duration-700 relative overflow-hidden"
              style={{
                width: `${currentHomePct}%`,
                backgroundColor: homeColor
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/20" />
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
            <span>0% ({awayTeam.abbreviation})</span>
            <span className="text-slate-400 font-bold">50% Neutral Toss-Up</span>
            <span>100% ({homeTeam.abbreviation})</span>
          </div>
        </div>
      </div>

      {/* 2. CHART CONTROLS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0e0e11] border border-white/10 rounded-xl p-3">
        {/* Quarter Filtering */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filter:
          </span>
          {(['ALL', 'Q1', 'Q2', 'Q3', 'Q4', 'LEVERAGE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedFilter(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition font-bold ${
                selectedFilter === mode
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {mode === 'ALL' ? 'Full Game' : mode === 'LEVERAGE' ? '⚡ High Leverage' : mode}
            </button>
          ))}
        </div>

        {/* Display Mode */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-xs font-mono">
          <button
            onClick={() => setChartType('dual_line')}
            className={`px-2.5 py-1 rounded transition ${
              chartType === 'dual_line' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dual Curves
          </button>
          <button
            onClick={() => setChartType('area_split')}
            className={`px-2.5 py-1 rounded transition ${
              chartType === 'area_split' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Probability Area
          </button>
        </div>
      </div>

      {/* 3. RECHARTS INTERACTIVE WIN-PROBABILITY LINE CHART */}
      <div className="bg-[#0e0e11] border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'dual_line' ? (
              <LineChart
                data={displayedPoints}
                margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
                onMouseMove={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    setHoveredPoint(e.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222226" vertical={false} />
                
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  tick={{ fontSize: 10, fontFamily: 'monospace' }}
                  interval="preserveStartEnd"
                />
                
                <YAxis
                  stroke="#71717a"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 10, fontFamily: 'monospace' }}
                />

                {/* 50% Toss-Up Baseline Reference Line */}
                <ReferenceLine
                  y={50}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '50% Neutral',
                    position: 'insideTopRight',
                    fill: '#94a3b8',
                    fontSize: 10,
                    fontFamily: 'monospace'
                  }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data: WinProbDataPoint = payload[0].payload;
                      const isSwing = Math.abs(data.deltaHome) >= 5.0;
                      return (
                        <div className="bg-[#121215] border border-white/20 p-3 rounded-xl shadow-2xl text-xs font-mono space-y-2 max-w-xs z-50">
                          <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" /> {data.label}
                            </span>
                            {data.downDistance && (
                              <span className="text-slate-300 font-bold bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                                {data.downDistance}
                              </span>
                            )}
                          </div>

                          {/* Probability Comparison */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: homeColor }} />
                                {data.homeTeam} Win %:
                              </span>
                              <span className="font-extrabold text-sm" style={{ color: homeColor }}>
                                {data.homeWinPct}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: awayColor }} />
                                {data.awayTeam} Win %:
                              </span>
                              <span className="font-extrabold text-sm" style={{ color: awayColor }}>
                                {data.awayWinPct}%
                              </span>
                            </div>
                          </div>

                          {/* Delta Shift on this play */}
                          {data.playId > 0 && (
                            <div className="pt-1 border-t border-white/10 flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">Play Swing:</span>
                              <span
                                className={`font-bold flex items-center gap-0.5 ${
                                  data.deltaHome > 0
                                    ? 'text-emerald-400'
                                    : data.deltaHome < 0
                                    ? 'text-rose-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {data.deltaHome > 0 ? (
                                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                                ) : data.deltaHome < 0 ? (
                                  <TrendingDown className="w-3 h-3 text-rose-400" />
                                ) : null}
                                {data.deltaHome > 0 ? `+${data.deltaHome}% ${data.homeTeam}` : `${data.deltaHome}% ${data.homeTeam}`}
                              </span>
                            </div>
                          )}

                          {/* Play description */}
                          <div className="text-[11px] text-slate-300 font-sans leading-tight pt-1">
                            {data.description}
                          </div>

                          {data.epa !== undefined && data.epa !== 0 && (
                            <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                              <span>Expected Points (EPA):</span>
                              <strong className={data.epa > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {data.epa > 0 ? `+${data.epa}` : data.epa}
                              </strong>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Home Team Win % Line */}
                <Line
                  type="monotone"
                  dataKey="homeWinPct"
                  name={`${homeTeam.name} (${homeTeam.abbreviation})`}
                  stroke={homeColor}
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isBigPlay || payload.index === 0 || payload.quarter === 'Final') {
                      return (
                        <circle
                          key={`dot-${payload.index}`}
                          cx={cx}
                          cy={cy}
                          r={payload.isBigPlay ? 5 : 3.5}
                          fill={homeColor}
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          className="cursor-pointer"
                          onClick={() => {
                            if (onSelectPlay && payload.playId) onSelectPlay(payload.playId);
                          }}
                        />
                      );
                    }
                    return null;
                  }}
                  activeDot={{ r: 6, fill: '#ffffff', stroke: homeColor, strokeWidth: 2 }}
                />

                {/* Away Team Win % Line */}
                <Line
                  type="monotone"
                  dataKey="awayWinPct"
                  name={`${awayTeam.name} (${awayTeam.abbreviation})`}
                  stroke={awayColor}
                  strokeWidth={2.5}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ r: 5, fill: '#ffffff', stroke: awayColor, strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <AreaChart
                data={displayedPoints}
                margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={homeColor} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={homeColor} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222226" vertical={false} />
                <XAxis dataKey="label" stroke="#71717a" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} stroke="#71717a" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <ReferenceLine y={50} stroke="#64748b" strokeDasharray="4 4" strokeWidth={1.5} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data: WinProbDataPoint = payload[0].payload;
                      return (
                        <div className="bg-[#121215] border border-white/20 p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1.5 max-w-xs">
                          <div className="text-amber-400 font-bold">{data.label}</div>
                          <div className="text-white font-black">{homeTeam.abbreviation}: {data.homeWinPct}%</div>
                          <div className="text-slate-400">{awayTeam.abbreviation}: {data.awayWinPct}%</div>
                          <p className="text-[11px] font-sans text-slate-300 pt-1">{data.description}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="homeWinPct" stroke={homeColor} strokeWidth={3} fill="url(#homeGrad)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Legend Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded" style={{ backgroundColor: homeColor }} />
              <span className="text-slate-300 font-bold">{homeTeam.name} ({homeTeam.abbreviation})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed" style={{ borderColor: awayColor }} />
              <span className="text-slate-300 font-bold">{awayTeam.name} ({awayTeam.abbreviation})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full border border-white bg-amber-500" />
              <span>High Leverage Turn</span>
            </div>
          </div>
          <div className="text-slate-500 text-[11px]">
            Hover any checkpoint to view play telemetry &amp; EPA impact
          </div>
        </div>
      </div>

      {/* 4. HIGHEST LEVERAGE WIN PROBABILITY SWINGS OF THE GAME */}
      <div className="bg-[#0e0e11] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <h4 className="text-xs uppercase font-mono font-bold text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Top Win Probability Leverage Swings (Decisive Moments)
          </h4>
          <span className="text-[11px] font-mono text-slate-500">Ranked by Δ Probability Shift</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topSwings.map((swing, rank) => {
            const isHomeFavored = swing.deltaHome > 0;
            const swingMagnitude = Math.abs(swing.deltaHome);
            const favoredTeam = isHomeFavored ? homeTeam.abbreviation : awayTeam.abbreviation;
            const favoredColor = isHomeFavored ? homeColor : awayColor;

            return (
              <div
                key={swing.playId || rank}
                onClick={() => {
                  if (onSelectPlay && swing.playId) onSelectPlay(swing.playId);
                }}
                className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-amber-500/50 hover:bg-white/5 cursor-pointer transition flex flex-col justify-between space-y-2 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-slate-300 font-bold font-mono text-[10px] flex items-center justify-center">
                      #{rank + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Q{swing.quarter} {swing.timeRemaining}
                    </span>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-mono font-black flex items-center gap-1 shadow-sm"
                    style={{
                      backgroundColor: `${favoredColor}20`,
                      color: favoredColor,
                      borderColor: `${favoredColor}50`
                    }}
                  >
                    {isHomeFavored ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    +{swingMagnitude}% {favoredTeam}
                  </span>
                </div>

                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed group-hover:text-white">
                  {swing.description}
                </p>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  <span>Win % Shift: <strong>{isHomeFavored ? `${(swing.homeWinPct - swing.deltaHome).toFixed(1)}% → ${swing.homeWinPct}%` : `${(swing.awayWinPct + swing.deltaHome).toFixed(1)}% → ${swing.awayWinPct}%`}</strong></span>
                  {swing.epa && (
                    <span className="text-slate-300">
                      EPA: <strong className={swing.epa > 0 ? 'text-emerald-400' : 'text-rose-400'}>{swing.epa > 0 ? `+${swing.epa}` : swing.epa}</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
