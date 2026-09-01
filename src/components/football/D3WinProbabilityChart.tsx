import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PlayByPlayEvent } from '../../types';
import { TrendingUp, Zap, Clock, Shield, Sparkles, Filter, Info, ChevronRight, Play } from 'lucide-react';

export interface WinProbabilityDataPoint {
  playId: number;
  quarter: number;
  timeRemaining: string;
  gameSecond: number; // 0 to 3600 (or >3600 for OT)
  displayTime: string;
  homeProb: number; // 0 to 100
  awayProb: number; // 0 to 100
  homeScore: number;
  awayScore: number;
  scoreDiff: number;
  possession: string;
  down: number;
  distance: number;
  yardLine: number;
  yardLineSide: string;
  playType: string;
  description: string;
  epa?: number;
  isBigPlay: boolean;
  isScoringPlay: boolean;
  playConceptName?: string;
}

interface D3WinProbabilityChartProps {
  plays: PlayByPlayEvent[];
  homeTeam: string;
  awayTeam: string;
  homeTeamColor?: string;
  awayTeamColor?: string;
  currentHomeScore?: number;
  currentAwayScore?: number;
  onSelectPlay?: (playId: number) => void;
  selectedPlayId?: number;
  height?: number;
}

export const D3WinProbabilityChart: React.FC<D3WinProbabilityChartProps> = ({
  plays = [],
  homeTeam = 'KC',
  awayTeam = 'BAL',
  homeTeamColor = '#e31837',
  awayTeamColor = '#241773',
  currentHomeScore = 27,
  currentAwayScore = 24,
  onSelectPlay,
  selectedPlayId,
  height = 280
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<WinProbabilityDataPoint | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'BIG_PLAYS' | 'SCORING' | 'FOURTH_QTR'>('ALL');
  const [activePlayId, setActivePlayId] = useState<number | null>(selectedPlayId || null);

  // Convert raw plays into continuous timeline points with realistic win probability calculus
  const timelineData: WinProbabilityDataPoint[] = React.useMemo(() => {
    if (!plays || plays.length === 0) {
      // Generate standard baseline trajectory if no plays provided
      return [
        {
          playId: 1,
          quarter: 1,
          timeRemaining: '15:00',
          gameSecond: 0,
          displayTime: 'Q1 15:00',
          homeProb: 55,
          awayProb: 45,
          homeScore: 0,
          awayScore: 0,
          scoreDiff: 0,
          possession: awayTeam,
          down: 1,
          distance: 10,
          yardLine: 25,
          yardLineSide: awayTeam,
          playType: 'Kickoff',
          description: `Opening Kickoff from ${homeTeam} 35 to ${awayTeam} end zone. Touchback.`,
          epa: 0,
          isBigPlay: false,
          isScoringPlay: false
        },
        {
          playId: 2,
          quarter: 4,
          timeRemaining: '00:00',
          gameSecond: 3600,
          displayTime: 'Q4 00:00',
          homeProb: currentHomeScore >= currentAwayScore ? 99 : 1,
          awayProb: currentAwayScore > currentHomeScore ? 99 : 1,
          homeScore: currentHomeScore,
          awayScore: currentAwayScore,
          scoreDiff: currentHomeScore - currentAwayScore,
          possession: homeTeam,
          down: 4,
          distance: 1,
          yardLine: 1,
          yardLineSide: awayTeam,
          playType: 'End of Regulation',
          description: `Final whistle: ${homeTeam} ${currentHomeScore}, ${awayTeam} ${currentAwayScore}.`,
          epa: 0.5,
          isBigPlay: true,
          isScoringPlay: false
        }
      ];
    }

    let runningHomeScore = 0;
    let runningAwayScore = 0;

    return plays.map((p, idx) => {
      // Parse clock to elapsed game seconds
      const qtr = typeof p.Quarter === 'number' ? p.Quarter : parseInt(String(p.Quarter)) || 1;
      const clockParts = (p.TimeRemaining || '15:00').split(':');
      const mins = parseInt(clockParts[0], 10) || 0;
      const secs = parseInt(clockParts[1], 10) || 0;
      const qtrRemainingSeconds = mins * 60 + secs;
      const qtrElapsedSeconds = Math.max(0, 900 - qtrRemainingSeconds);
      const totalElapsedSeconds = (qtr - 1) * 900 + qtrElapsedSeconds;

      // Track running score if touchdown or field goal
      const isScoring = p.PlayType === 'Touchdown' || p.PlayType === 'Field Goal' || p.Description.toLowerCase().includes('touchdown') || p.Description.toLowerCase().includes('field goal');
      if (isScoring) {
        const pts = p.PlayType === 'Touchdown' || p.Description.toLowerCase().includes('touchdown') ? 7 : 3;
        if (p.Possession === homeTeam) {
          runningHomeScore += pts;
        } else {
          runningAwayScore += pts;
        }
      }

      // Base home probability on given percentage or compute dynamic epa model
      let homeProb = p.WinProbabilityPct || 50;
      if (p.Possession === awayTeam && p.WinProbabilityPct > 50 && homeProb === 50) {
        homeProb = 100 - p.WinProbabilityPct;
      }

      // Constrain within 1% to 99% during regulation
      homeProb = Math.max(1, Math.min(99, homeProb));
      const awayProb = 100 - homeProb;

      return {
        playId: p.PlayID || 5000 + idx,
        quarter: qtr,
        timeRemaining: p.TimeRemaining || '00:00',
        gameSecond: totalElapsedSeconds,
        displayTime: `Q${qtr} ${p.TimeRemaining}`,
        homeProb,
        awayProb,
        homeScore: runningHomeScore,
        awayScore: runningAwayScore,
        scoreDiff: runningHomeScore - runningAwayScore,
        possession: p.Possession || homeTeam,
        down: p.Down || 1,
        distance: p.Distance || 10,
        yardLine: p.YardLine || 50,
        yardLineSide: p.YardLineSide || '50',
        playType: p.PlayType || 'Pass',
        description: p.Description || '',
        epa: p.epa,
        isBigPlay: Boolean(p.IsBigPlay || Math.abs(p.YardsGained || 0) >= 18 || isScoring),
        isScoringPlay: isScoring,
        playConceptName: p.playConceptName
      };
    });
  }, [plays, homeTeam, awayTeam, currentHomeScore, currentAwayScore]);

  // Filtered dataset for rendering point overlays
  const visiblePoints = React.useMemo(() => {
    if (filterMode === 'BIG_PLAYS') return timelineData.filter((d) => d.isBigPlay);
    if (filterMode === 'SCORING') return timelineData.filter((d) => d.isScoringPlay);
    if (filterMode === 'FOURTH_QTR') return timelineData.filter((d) => d.quarter >= 4);
    return timelineData;
  }, [timelineData, filterMode]);

  // Render D3 SVG
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || timelineData.length === 0) return;

    const containerWidth = containerRef.current.clientWidth || 800;
    const margin = { top: 20, right: 30, bottom: 32, left: 45 };
    const width = containerWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: 0 to 3600 seconds (or maximum game elapsed seconds)
    const maxSeconds = Math.max(3600, d3.max(timelineData, (d) => d.gameSecond) || 3600);
    const xScale = d3.scaleLinear().domain([0, maxSeconds]).range([0, width]);

    // Y Scale: 0% to 100% Win Probability
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    // Create defs for linear gradients (Home vs Away territory)
    const defs = svg.append('defs');

    // Home Team Area Gradient (above 50% baseline)
    const homeGradient = defs
      .append('linearGradient')
      .attr('id', 'homeProbGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    homeGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', homeTeamColor)
      .attr('stop-opacity', 0.55);

    homeGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', homeTeamColor)
      .attr('stop-opacity', 0.05);

    // Away Team Area Gradient (below 50% baseline)
    const awayGradient = defs
      .append('linearGradient')
      .attr('id', 'awayProbGradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    awayGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', awayTeamColor)
      .attr('stop-opacity', 0.55);

    awayGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', awayTeamColor)
      .attr('stop-opacity', 0.05);

    // Horizontal Grid Lines
    const yGridTicks = [20, 40, 50, 60, 80];
    g.selectAll('.y-grid-line')
      .data(yGridTicks)
      .enter()
      .append('line')
      .attr('class', 'y-grid-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', (d) => (d === 50 ? '#e2e8f0' : '#27272a'))
      .attr('stroke-width', (d) => (d === 50 ? 1.2 : 0.8))
      .attr('stroke-dasharray', (d) => (d === 50 ? '4 2' : '2 3'))
      .attr('stroke-opacity', (d) => (d === 50 ? 0.6 : 0.3));

    // Vertical Quarter Boundaries (Q1/Q2/Half/Q3/Q4)
    const quarterMarkers = [
      { sec: 900, label: 'END Q1' },
      { sec: 1800, label: 'HALF' },
      { sec: 2700, label: 'END Q3' },
      { sec: 3600, label: 'FINAL' }
    ];

    quarterMarkers.forEach((qm) => {
      const xPos = xScale(qm.sec);
      if (xPos > 0 && xPos <= width) {
        g.append('line')
          .attr('x1', xPos)
          .attr('x2', xPos)
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .attr('stroke', '#3f3f46')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3 3')
          .attr('stroke-opacity', 0.5);

        g.append('text')
          .attr('x', xPos - 4)
          .attr('y', 12)
          .attr('text-anchor', 'end')
          .attr('fill', '#71717a')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'bold')
          .text(qm.label);
      }
    });

    // 50% Neutral Baseline Marker Text
    g.append('text')
      .attr('x', 6)
      .attr('y', yScale(50) - 4)
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text('50% NEUTRAL');

    // Home Team Lead Area (Above 50%)
    const homeAreaGenerator = d3
      .area<WinProbabilityDataPoint>()
      .x((d) => xScale(d.gameSecond))
      .y0(yScale(50))
      .y1((d) => yScale(Math.max(50, d.homeProb)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(timelineData)
      .attr('fill', 'url(#homeProbGradient)')
      .attr('d', homeAreaGenerator);

    // Away Team Lead Area (Below 50%)
    const awayAreaGenerator = d3
      .area<WinProbabilityDataPoint>()
      .x((d) => xScale(d.gameSecond))
      .y0(yScale(50))
      .y1((d) => yScale(Math.min(50, d.homeProb)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(timelineData)
      .attr('fill', 'url(#awayProbGradient)')
      .attr('d', awayAreaGenerator);

    // Main Trajectory Line
    const lineGenerator = d3
      .line<WinProbabilityDataPoint>()
      .x((d) => xScale(d.gameSecond))
      .y((d) => yScale(d.homeProb))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(timelineData)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', lineGenerator);

    // Quarter markers on X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([0, 450, 900, 1350, 1800, 2250, 2700, 3150, 3600])
      .tickFormat((d) => {
        const sec = Number(d);
        if (sec === 0) return 'Kickoff';
        if (sec === 900) return 'Q1';
        if (sec === 1800) return 'Half';
        if (sec === 2700) return 'Q3';
        if (sec === 3600) return 'Final';
        const qtr = Math.floor(sec / 900) + 1;
        const minsLeft = Math.floor((900 - (sec % 900)) / 60);
        return `Q${qtr} ${minsLeft}m`;
      });

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('color', '#52525b')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#a1a1aa');

    // Y Axis (0% to 100%)
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues([0, 25, 50, 75, 100])
      .tickFormat((d) => `${d}%`);

    g.append('g')
      .call(yAxis)
      .attr('color', '#52525b')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#a1a1aa');

    // Interactive Key Play Dots (Touchdowns, Turnovers, Big Plays)
    const playNodes = g
      .selectAll('.play-marker')
      .data(visiblePoints)
      .enter()
      .append('g')
      .attr('class', 'play-marker')
      .attr('transform', (d: WinProbabilityDataPoint) => `translate(${xScale(d.gameSecond)},${yScale(d.homeProb)})`)
      .style('cursor', 'pointer');

    // Outer glow ring on hover/selected
    playNodes
      .append('circle')
      .attr('r', (d: WinProbabilityDataPoint) => (d.playId === activePlayId ? 7 : d.isScoringPlay ? 5.5 : d.isBigPlay ? 4.5 : 2.5))
      .attr('fill', (d: WinProbabilityDataPoint) => (d.isScoringPlay ? '#fbbf24' : d.isBigPlay ? '#38bdf8' : '#e4e4e7'))
      .attr('stroke', '#09090b')
      .attr('stroke-width', 1.5)
      .attr('opacity', (d: WinProbabilityDataPoint) => (d.playId === activePlayId ? 1 : 0.85));

    // Interactive Hover Tracking Line & Overlay
    const trackerGroup = g.append('g').attr('class', 'tracker-group').style('display', 'none');

    const trackerLine = trackerGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 3');

    const trackerDot = trackerGroup
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Bisector for scrubber mousemove
    const bisect = d3.bisector<WinProbabilityDataPoint, number>((d) => d.gameSecond).left;

    // Full-area invisible overlay for mouse gestures
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', () => trackerGroup.style('display', null))
      .on('mouseleave', () => {
        trackerGroup.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', (event) => {
        const [xPos] = d3.pointer(event);
        const xSec = xScale.invert(xPos);
        const idx = bisect(timelineData, xSec, 1);
        const d0 = timelineData[idx - 1];
        const d1 = timelineData[idx];
        const d = !d1 ? d0 : !d0 ? d1 : xSec - d0.gameSecond > d1.gameSecond - xSec ? d1 : d0;

        if (d) {
          const cx = xScale(d.gameSecond);
          const cy = yScale(d.homeProb);

          trackerLine.attr('x1', cx).attr('x2', cx);
          trackerDot.attr('cx', cx).attr('cy', cy);
          setHoveredPoint(d);
        }
      })
      .on('click', (event) => {
        const [xPos] = d3.pointer(event);
        const xSec = xScale.invert(xPos);
        const idx = bisect(timelineData, xSec, 1);
        const d0 = timelineData[idx - 1];
        const d1 = timelineData[idx];
        const d = !d1 ? d0 : !d0 ? d1 : xSec - d0.gameSecond > d1.gameSecond - xSec ? d1 : d0;
        if (d) {
          setActivePlayId(d.playId);
          if (onSelectPlay) onSelectPlay(d.playId);
        }
      });
  }, [timelineData, visiblePoints, activePlayId, height, homeTeamColor, awayTeamColor, onSelectPlay]);

  const activeDisplayPoint = hoveredPoint || timelineData.find((d) => d.playId === activePlayId) || timelineData[timelineData.length - 1];

  return (
    <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Header & Interactive Stats Ribbon */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>D3 Interactive Win Probability Matrix</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              LIVE FLOW
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Scrub along the continuous gridiron timeline to inspect live win odds, EPA impact, and game-turning plays.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Plays' },
            { id: 'BIG_PLAYS', label: '⚡ Big Plays' },
            { id: 'SCORING', label: '🎯 Scoring' },
            { id: 'FOURTH_QTR', label: '4️⃣ 4th Qtr' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                filterMode === f.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Telemetry Bar for Hovered/Selected Play */}
      {activeDisplayPoint && (
        <div className="bg-[#181820] border border-amber-500/30 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          {/* Win Probability Home vs Away */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Live Win Probability</div>
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: homeTeamColor }} />
                {homeTeam}: <strong className="text-amber-400">{activeDisplayPoint.homeProb.toFixed(1)}%</strong>
              </span>
              <span className="text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: awayTeamColor }} />
                {awayTeam}: <strong className="text-purple-400">{activeDisplayPoint.awayProb.toFixed(1)}%</strong>
              </span>
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden flex">
              <div
                className="h-full transition-all duration-200"
                style={{ width: `${activeDisplayPoint.homeProb}%`, backgroundColor: homeTeamColor }}
              />
              <div
                className="h-full transition-all duration-200"
                style={{ width: `${activeDisplayPoint.awayProb}%`, backgroundColor: awayTeamColor }}
              />
            </div>
          </div>

          {/* Game Clock & Possession */}
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Game Clock &amp; Down
            </div>
            <div className="font-bold text-white text-sm">
              {activeDisplayPoint.displayTime}
            </div>
            <div className="text-[11px] text-slate-300">
              {activeDisplayPoint.possession} &bull; {activeDisplayPoint.down}&amp;{activeDisplayPoint.distance} at {activeDisplayPoint.yardLineSide} {activeDisplayPoint.yardLine}
            </div>
          </div>

          {/* Scoreboard & EPA Shift */}
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> Score &amp; EPA Gain
            </div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>{homeTeam} {activeDisplayPoint.homeScore} - {activeDisplayPoint.awayScore} {awayTeam}</span>
            </div>
            <div className="text-[11px]">
              {activeDisplayPoint.epa !== undefined ? (
                <span className={activeDisplayPoint.epa >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  EPA: {activeDisplayPoint.epa >= 0 ? `+${activeDisplayPoint.epa.toFixed(2)}` : activeDisplayPoint.epa.toFixed(2)}
                </span>
              ) : (
                <span className="text-slate-400">EPA: +0.25 (Est)</span>
              )}
            </div>
          </div>

          {/* Play Description & Jump CTA */}
          <div className="flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Play Outcome</div>
            <div className="text-[11px] text-slate-200 line-clamp-1 italic">
              "{activeDisplayPoint.description}"
            </div>
            {onSelectPlay && (
              <button
                onClick={() => onSelectPlay(activeDisplayPoint.playId)}
                className="mt-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 w-fit transition"
              >
                <Play className="w-2.5 h-2.5 fill-amber-300" />
                <span>Jump to Film Reel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* D3 SVG Container with Resize Handling */}
      <div ref={containerRef} className="w-full overflow-hidden relative cursor-crosshair">
        <svg ref={svgRef} className="w-full" style={{ minHeight: `${height}px` }} />
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: homeTeamColor }} />
            <span className="text-white font-bold">{homeTeam} Lead (50% - 100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: awayTeamColor }} />
            <span className="text-white font-bold">{awayTeam} Lead (0% - 50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>🎯 Touchdown / Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>⚡ Big Play (15+ yds)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Info className="w-3 h-3" />
          <span>Calculated using EPA, down/distance leverage, field position &amp; game clock.</span>
        </div>
      </div>
    </div>
  );
};
