import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TEAM_DRAFT_PROFILES,
  DraftProspect,
  TeamDraftProfile,
  getJimmyJohnsonValue,
  getRichHillValue
} from '../../data/draftPickData';
import {
  DEFAULT_MOCK_ORDER,
  EXTENDED_CONSENSUS_PROSPECTS,
  HISTORICAL_SLOT_BASELINES,
  HISTORICAL_POSITION_TRENDS,
  MockDraftPickSlot,
  SimPickResult,
  SimTradeOffer,
  evaluateMockPick,
  getAiMockSelection,
  generateAiTradeOffer,
  getSlotBaseline
} from '../../data/draftMockSimulatorData';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  Sparkles,
  Search,
  Filter,
  ArrowRightLeft,
  ChevronRight,
  Shield,
  Zap,
  Info,
  Clock,
  UserCheck,
  Flame,
  Layers,
  BarChart3,
  Copy,
  Check,
  ChevronDown,
  HelpCircle,
  Cpu,
  Target
} from 'lucide-react';

interface DraftMockSimulatorProps {
  initialUserTeam?: string;
  onNavigateToTrades?: () => void;
}

export const DraftMockSimulator: React.FC<DraftMockSimulatorProps> = ({
  initialUserTeam = 'CHI',
  onNavigateToTrades
}) => {
  // Simulator State
  const [draftOrder, setDraftOrder] = useState<MockDraftPickSlot[]>(DEFAULT_MOCK_ORDER);
  const [currentPickIndex, setCurrentPickIndex] = useState<number>(0);
  const [completedPicks, setCompletedPicks] = useState<SimPickResult[]>([]);
  const [availableProspects, setAvailableProspects] = useState<DraftProspect[]>(EXTENDED_CONSENSUS_PROSPECTS);
  
  // GM & Setup Settings
  const [userTeamKey, setUserTeamKey] = useState<string>(initialUserTeam);
  const [isCommishMode, setIsCommishMode] = useState<boolean>(false); // Spectator / Pick for any team
  const [simSpeedMs, setSimSpeedMs] = useState<number>(1800); // ms per pick
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tradeFrequency, setTradeFrequency] = useState<'off' | 'low' | 'normal' | 'high'>('normal');
  const [randomnessFactor, setRandomnessFactor] = useState<number>(0.15); // AI variation
  const [draftLength, setDraftLength] = useState<number>(32); // 32 (Round 1) or 64 (Rounds 1-2)

  // In-Draft Active Trade Offer
  const [activeTradeOffer, setActiveTradeOffer] = useState<SimTradeOffer | null>(null);

  // Filter & Search Prospects Board
  const [prospectSearch, setProspectSearch] = useState<string>('');
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<'rank' | 'scoutingGrade' | 'rasScore' | 'value'>('rank');

  // Selected Prospect Detail Drawer / Modal
  const [inspectedProspect, setInspectedProspect] = useState<DraftProspect | null>(null);
  const [inspectedPickResult, setInspectedPickResult] = useState<SimPickResult | null>(null);

  // UI Active Sub-view
  const [activeViewMode, setActiveViewMode] = useState<'board' | 'picks_log' | 'report_card' | 'historical_trends'>('board');

  // Copy status
  const [copied, setCopied] = useState<boolean>(false);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trajectorySvgRef = useRef<SVGSVGElement | null>(null);
  const barChartSvgRef = useRef<SVGSVGElement | null>(null);

  const currentPick = draftOrder[currentPickIndex];
  const isDraftComplete = currentPickIndex >= draftLength || currentPickIndex >= draftOrder.length;
  const isUserOnClock = currentPick && (currentPick.teamKey === userTeamKey || isCommishMode) && !isDraftComplete;

  const currentTeamProfile = useMemo(() => {
    if (!currentPick) return null;
    return TEAM_DRAFT_PROFILES.find((t) => t.teamKey === currentPick.teamKey) || null;
  }, [currentPick]);

  // Recommended prospects for current team on clock
  const recommendedProspects = useMemo(() => {
    if (!currentPick || !currentTeamProfile) return [];
    return availableProspects
      .filter((p) => {
        const needMatch = currentTeamProfile.topNeeds.includes(p.position) || currentTeamProfile.secondaryNeeds.includes(p.position);
        const fitMatch = p.teamFits.includes(currentPick.teamKey);
        return needMatch || fitMatch || p.rank <= currentPick.pickNumber + 3;
      })
      .slice(0, 4);
  }, [currentPick, currentTeamProfile, availableProspects]);

  // Filtered & Sorted Prospects List
  const filteredProspects = useMemo(() => {
    return availableProspects
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(prospectSearch.toLowerCase()) ||
          p.college.toLowerCase().includes(prospectSearch.toLowerCase()) ||
          p.playerComp.toLowerCase().includes(prospectSearch.toLowerCase());
        const matchesPos = selectedPosFilter === 'ALL' || p.position === selectedPosFilter;
        return matchesSearch && matchesPos;
      })
      .sort((a, b) => {
        if (sortKey === 'rank') return a.rank - b.rank;
        if (sortKey === 'scoutingGrade') return b.scoutingGrade - a.scoutingGrade;
        if (sortKey === 'rasScore') return b.rasScore - a.rasScore;
        if (sortKey === 'value') {
          const deltaA = currentPick ? a.rank - currentPick.pickNumber : 0;
          const deltaB = currentPick ? b.rank - currentPick.pickNumber : 0;
          return deltaA - deltaB;
        }
        return 0;
      });
  }, [availableProspects, prospectSearch, selectedPosFilter, sortKey, currentPick]);

  // Make a draft selection
  const makeSelection = (prospect: DraftProspect, isUser: boolean) => {
    if (!currentPick || isDraftComplete) return;

    const result = evaluateMockPick(currentPick.pickNumber, currentPick.teamKey, prospect, isUser);

    setCompletedPicks((prev) => [result, ...prev]);
    setAvailableProspects((prev) => prev.filter((p) => p.rank !== prospect.rank));
    setCurrentPickIndex((prev) => prev + 1);
    setActiveTradeOffer(null);

    // If inspected prospect was drafted, update inspected result
    if (inspectedProspect && inspectedProspect.rank === prospect.rank) {
      setInspectedPickResult(result);
    }
  };

  // AI Next Step Handler
  const stepSim = () => {
    if (isDraftComplete || !currentPick) {
      setIsPlaying(false);
      return;
    }

    // If user is on the clock and not in commish auto mode, pause to let user pick
    if (currentPick.teamKey === userTeamKey && !isCommishMode) {
      setIsPlaying(false);

      // Check if AI wants to propose a trade to user
      if (tradeFrequency !== 'off' && !activeTradeOffer && Math.random() < (tradeFrequency === 'high' ? 0.65 : tradeFrequency === 'normal' ? 0.35 : 0.15)) {
        const offer = generateAiTradeOffer(currentPick, userTeamKey, availableProspects);
        if (offer) {
          setActiveTradeOffer(offer);
        }
      }
      return;
    }

    // AI selection
    const aiPick = getAiMockSelection(currentPick.pickNumber, currentPick.teamKey, availableProspects, randomnessFactor);
    makeSelection(aiPick, false);
  };

  // Simulation Timer Hook
  useEffect(() => {
    if (isPlaying && !isDraftComplete) {
      // Check if user is on clock
      if (currentPick && currentPick.teamKey === userTeamKey && !isCommishMode) {
        setIsPlaying(false);
        return;
      }

      timerRef.current = setTimeout(() => {
        stepSim();
      }, simSpeedMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentPickIndex, isDraftComplete, simSpeedMs, userTeamKey, isCommishMode]);

  // Fast forward until user's next pick
  const simToUserPick = () => {
    let currIdx = currentPickIndex;
    let newCompleted: SimPickResult[] = [...completedPicks];
    let newAvailable: DraftProspect[] = [...availableProspects];
    let newOrder = [...draftOrder];

    while (currIdx < draftLength && currIdx < newOrder.length) {
      const pick = newOrder[currIdx];
      if (pick.teamKey === userTeamKey && !isCommishMode && currIdx !== currentPickIndex) {
        break;
      }

      const aiPick = getAiMockSelection(pick.pickNumber, pick.teamKey, newAvailable, randomnessFactor);
      const res = evaluateMockPick(pick.pickNumber, pick.teamKey, aiPick, pick.teamKey === userTeamKey);
      newCompleted = [res, ...newCompleted];
      newAvailable = newAvailable.filter((p) => p.rank !== aiPick.rank);
      currIdx++;
    }

    setCompletedPicks(newCompleted);
    setAvailableProspects(newAvailable);
    setCurrentPickIndex(currIdx);
    setIsPlaying(false);
  };

  // Fast forward entire round / simulation
  const simEntireDraft = () => {
    let currIdx = currentPickIndex;
    let newCompleted: SimPickResult[] = [...completedPicks];
    let newAvailable: DraftProspect[] = [...availableProspects];
    let newOrder = [...draftOrder];

    while (currIdx < draftLength && currIdx < newOrder.length) {
      const pick = newOrder[currIdx];
      const aiPick = getAiMockSelection(pick.pickNumber, pick.teamKey, newAvailable, randomnessFactor);
      const res = evaluateMockPick(pick.pickNumber, pick.teamKey, aiPick, pick.teamKey === userTeamKey);
      newCompleted = [res, ...newCompleted];
      newAvailable = newAvailable.filter((p) => p.rank !== aiPick.rank);
      currIdx++;
    }

    setCompletedPicks(newCompleted);
    setAvailableProspects(newAvailable);
    setCurrentPickIndex(currIdx);
    setIsPlaying(false);
    setActiveViewMode('report_card');
  };

  // Reset Mock Draft
  const resetDraft = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setCurrentPickIndex(0);
    setCompletedPicks([]);
    setAvailableProspects(EXTENDED_CONSENSUS_PROSPECTS);
    setDraftOrder(DEFAULT_MOCK_ORDER);
    setActiveTradeOffer(null);
    setInspectedProspect(null);
    setInspectedPickResult(null);
    setActiveViewMode('board');
  };

  // Accept in-draft AI trade offer
  const acceptTradeOffer = () => {
    if (!activeTradeOffer || !currentPick) return;

    const newOrder = [...draftOrder];
    // Swap team ownership of current pick
    newOrder[currentPickIndex] = {
      ...newOrder[currentPickIndex],
      teamKey: activeTradeOffer.proposingTeamKey,
      originalTeamKey: currentPick.teamKey,
      tradedVia: `Live Mock Trade with ${userTeamKey}`
    };

    // User gets proposing team's picks
    activeTradeOffer.givingPicks.forEach((gp) => {
      const idx = newOrder.findIndex((p) => p.pickNumber === gp.pickNumber);
      if (idx !== -1) {
        newOrder[idx] = {
          ...newOrder[idx],
          teamKey: userTeamKey,
          originalTeamKey: activeTradeOffer.proposingTeamKey,
          tradedVia: `Live Mock Trade from ${activeTradeOffer.proposingTeamKey}`
        };
      }
    });

    setDraftOrder(newOrder);
    setActiveTradeOffer(null);
  };

  // Decline trade offer
  const declineTradeOffer = () => {
    setActiveTradeOffer(null);
  };

  // Copy results summary
  const copyDraftSummary = () => {
    const text = completedPicks
      .map(
        (p) =>
          `Pick #${p.pickNumber} (${p.teamKey}): ${p.prospect.name} (${p.prospect.position} - ${p.prospect.college}) | Grade: ${p.grade} | Scheme Fit: ${p.schemeFitScore}%`
      )
      .reverse()
      .join('\n');

    navigator.clipboard.writeText(`🏈 StarStadium 2026 NFL Mock Draft Results:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Render D3 5-Year Player Value Trajectory Curve
  useEffect(() => {
    if (!trajectorySvgRef.current) return;
    const svg = d3.select(trajectorySvgRef.current);
    svg.selectAll('*').remove();

    const width = 460;
    const height = 210;
    const margin = { top: 20, right: 25, bottom: 35, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Target data: either from inspected pick result or projected from inspected prospect
    let avPoints = [6, 9, 11, 10, 12];
    let floorPoints = [4, 6, 7, 7, 8];
    let ceilingPoints = [8, 12, 16, 15, 18];
    let playerName = 'Prospect Baseline';

    if (inspectedPickResult) {
      avPoints = inspectedPickResult.projected5YearAV;
      floorPoints = inspectedPickResult.projectedFloorAV;
      ceilingPoints = inspectedPickResult.projectedCeilingAV;
      playerName = inspectedPickResult.prospect.name;
    } else if (inspectedProspect) {
      const estRes = evaluateMockPick(
        currentPick ? currentPick.pickNumber : inspectedProspect.rank,
        currentPick ? currentPick.teamKey : inspectedProspect.teamFits[0] || 'CHI',
        inspectedProspect
      );
      avPoints = estRes.projected5YearAV;
      floorPoints = estRes.projectedFloorAV;
      ceilingPoints = estRes.projectedCeilingAV;
      playerName = inspectedProspect.name;
    }

    const years = ['Rookie (Y1)', 'Y2 Growth', 'Y3 Prime', 'Y4 Contract', 'Y5 Extension'];

    const xScale = d3.scalePoint().domain(years).range([0, innerWidth]).padding(0.1);
    const maxY = Math.max(22, d3.max(ceilingPoints) || 20);
    const yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]).nice();

    // Subtle Gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .ticks(4)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '3 3');

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat((d) => `${d} AV`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px');

    // Gradient for Confidence Band Area
    const defs = svg.append('defs');
    const areaGrad = defs.append('linearGradient').attr('id', 'bandGradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.25);
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#38bdf8').attr('stop-opacity', 0.03);

    // Area Confidence Band (Ceiling to Floor)
    const bandArea = d3.area<number>()
      .x((_, i) => xScale(years[i]) || 0)
      .y0((_, i) => yScale(floorPoints[i]))
      .y1((_, i) => yScale(ceilingPoints[i]))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(avPoints)
      .attr('fill', 'url(#bandGradient)')
      .attr('d', bandArea);

    // Median Projection Line
    const medianLine = d3.line<number>()
      .x((_, i) => xScale(years[i]) || 0)
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(avPoints)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 3)
      .attr('d', medianLine);

    // Historical 1st Round Average Dotted Baseline
    const histAvgLine = d3.line<number>()
      .x((_, i) => xScale(years[i]) || 0)
      .y((_, i) => yScale([5.5, 7.8, 8.9, 8.4, 9.2][i]))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum([5.5, 7.8, 8.9, 8.4, 9.2])
      .attr('fill', 'none')
      .attr('stroke', '#71717a')
      .attr('stroke-dasharray', '4 4')
      .attr('stroke-width', 1.5)
      .attr('d', histAvgLine);

    // Data Point Dots
    avPoints.forEach((val, idx) => {
      const x = xScale(years[idx]) || 0;
      const y = yScale(val);

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4.5)
        .attr('fill', '#38bdf8')
        .attr('stroke', '#09090b')
        .attr('stroke-width', 2);

      // Value label on top
      g.append('text')
        .attr('x', x)
        .attr('y', y - 9)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e0f2fe')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text(`${val}`);
    });
  }, [inspectedProspect, inspectedPickResult, currentPick]);

  // Report Card Stats & Leaderboards
  const reportCardAnalytics = useMemo(() => {
    if (completedPicks.length === 0) return null;

    // Team by team classes
    const teamClasses: Record<
      string,
      { teamKey: string; picks: SimPickResult[]; totalGradeScore: number; avgGradeScore: number; topSteal?: SimPickResult }
    > = {};

    completedPicks.forEach((p) => {
      if (!teamClasses[p.teamKey]) {
        teamClasses[p.teamKey] = { teamKey: p.teamKey, picks: [], totalGradeScore: 0, avgGradeScore: 0 };
      }
      teamClasses[p.teamKey].picks.push(p);
      teamClasses[p.teamKey].totalGradeScore += p.gradeScore;
    });

    const rankedTeams = Object.values(teamClasses).map((tc) => {
      tc.avgGradeScore = Math.round(tc.totalGradeScore / tc.picks.length);
      return tc;
    }).sort((a, b) => b.avgGradeScore - a.avgGradeScore);

    // Steals (highest positive value delta)
    const steals = [...completedPicks].filter((p) => p.valueDelta > 0).sort((a, b) => b.valueDelta - a.valueDelta).slice(0, 5);

    // Reaches (lowest negative value delta)
    const reaches = [...completedPicks].filter((p) => p.valueDelta < 0).sort((a, b) => a.valueDelta - b.valueDelta).slice(0, 5);

    return {
      rankedTeams,
      steals,
      reaches,
      totalPicks: completedPicks.length
    };
  }, [completedPicks]);

  // D3 Bar Chart for Team Draft Class Score in Report Card
  useEffect(() => {
    if (activeViewMode !== 'report_card' || !barChartSvgRef.current || !reportCardAnalytics) return;
    const svg = d3.select(barChartSvgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 240;
    const margin = { top: 15, right: 25, bottom: 40, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const topTeams = reportCardAnalytics.rankedTeams.slice(0, 12);
    const xScale = d3.scaleBand().domain(topTeams.map((t) => t.teamKey)).range([0, innerWidth]).padding(0.28);
    const yScale = d3.scaleLinear().domain([50, 100]).range([innerHeight, 0]).nice();

    // Bars
    g.selectAll<SVGRectElement, (typeof topTeams)[0]>('.bar')
      .data(topTeams)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: (typeof topTeams)[0]) => xScale(d.teamKey) || 0)
      .attr('y', (d: (typeof topTeams)[0]) => yScale(d.avgGradeScore))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: (typeof topTeams)[0]) => innerHeight - yScale(d.avgGradeScore))
      .attr('fill', (d: (typeof topTeams)[0]) => {
        const profile = TEAM_DRAFT_PROFILES.find((p) => p.teamKey === d.teamKey);
        return profile ? profile.primaryColor : '#38bdf8';
      })
      .attr('rx', 4);

    // Score text on bars
    g.selectAll<SVGTextElement, (typeof topTeams)[0]>('.bar-label')
      .data(topTeams)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d: (typeof topTeams)[0]) => (xScale(d.teamKey) || 0) + xScale.bandwidth() / 2)
      .attr('y', (d: (typeof topTeams)[0]) => yScale(d.avgGradeScore) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e4e4e7')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text((d: (typeof topTeams)[0]) => `${d.avgGradeScore}`);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('fill', '#e4e4e7')
      .attr('font-size', '11px')
      .attr('font-weight', '600');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px');
  }, [activeViewMode, reportCardAnalytics]);

  return (
    <div className="w-full space-y-6">
      {/* Header & Simulation Control Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Target className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  NFL Draft Mock Simulator
                  <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold tracking-wider">
                    2026 Consensus Engine
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick prospects for NFL teams, test trade packages, and analyze real-time player value changes against historical rookie wage curves.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Simulation Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* User Team Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400 font-medium">Your GM Team:</span>
              <select
                value={userTeamKey}
                onChange={(e) => setUserTeamKey(e.target.value)}
                disabled={isPlaying}
                className="bg-slate-900 text-emerald-400 font-bold font-mono px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-emerald-500"
              >
                {TEAM_DRAFT_PROFILES.map((t) => (
                  <option key={t.teamKey} value={t.teamKey}>
                    {t.teamKey} - {t.teamName}
                  </option>
                ))}
              </select>
            </div>

            {/* Commish / All-Teams Mode Toggle */}
            <button
              onClick={() => setIsCommishMode(!isCommishMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isCommishMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Commish Mode allows you to pick for any team on the clock"
            >
              <Cpu className="w-3.5 h-3.5" />
              {isCommishMode ? 'Commish (All Teams)' : 'Single GM Mode'}
            </button>

            {/* Sim Length */}
            <select
              value={draftLength}
              onChange={(e) => setDraftLength(Number(e.target.value))}
              disabled={completedPicks.length > 0}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-slate-500"
            >
              <option value={32}>Round 1 Only (32 Picks)</option>
              <option value={64}>Rounds 1 & 2 (64 Picks)</option>
            </select>

            {/* Play / Pause Auto-Sim */}
            {!isDraftComplete ? (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all ${
                    isPlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause Sim' : 'Auto Sim'}
                </button>

                {/* Step One Pick */}
                <button
                  onClick={stepSim}
                  disabled={isPlaying}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
                  title="Simulate only the next pick"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                  Next Pick
                </button>

                {/* Sim to User Pick */}
                {!isCommishMode && (
                  <button
                    onClick={simToUserPick}
                    disabled={isPlaying}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                    title="Simulate all AI picks until user team is on the clock"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    Sim to {userTeamKey}
                  </button>
                )}

                {/* Fast Forward All */}
                <button
                  onClick={simEntireDraft}
                  disabled={isPlaying}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                  title="Simulate remainder of draft instantly"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Sim Remainder
                </button>
              </>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                🎉 MOCK DRAFT COMPLETE
              </span>
            )}

            {/* Reset */}
            <button
              onClick={resetDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
              title="Reset mock draft to beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveViewMode('board')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeViewMode === 'board'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Live Draft Board & Prospects ({availableProspects.length})
          </button>

          <button
            onClick={() => setActiveViewMode('picks_log')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeViewMode === 'picks_log'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Picks Log & Value Tracker ({completedPicks.length})
          </button>

          <button
            onClick={() => setActiveViewMode('report_card')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeViewMode === 'report_card'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Draft War Room Report Card {isDraftComplete && '⭐'}
          </button>

          <button
            onClick={() => setActiveViewMode('historical_trends')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeViewMode === 'historical_trends'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Historical Slot & Position Baselines
          </button>

          {onNavigateToTrades && (
            <button
              onClick={onNavigateToTrades}
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-medium transition-all"
            >
              <ArrowRightLeft className="w-3 h-3" />
              Open Full Trade Machine
            </button>
          )}
        </div>
      </div>

      {/* In-Draft AI Trade Proposal Alert Pop-over */}
      {activeTradeOffer && (
        <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-xl p-4.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40">
                    INCOMING DRAFT TRADE OFFER
                  </span>
                  <span className="text-xs text-amber-200/80">From {activeTradeOffer.proposingTeamKey}</span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">{activeTradeOffer.message}</h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                  <div>
                    <span className="text-slate-400">They Give:</span>{' '}
                    <span className="text-emerald-300 font-mono font-bold">
                      {activeTradeOffer.givingPicks.map((p) => p.label).join(' + ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">They Receive:</span>{' '}
                    <span className="text-amber-300 font-mono font-bold">
                      {activeTradeOffer.receivingPicks.map((p) => p.label).join(' + ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Trade Surplus Value:</span>{' '}
                    <span
                      className={`font-mono font-bold ${
                        activeTradeOffer.netValueJimmyJohnson >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {activeTradeOffer.netValueJimmyJohnson >= 0 ? '+' : ''}
                      {activeTradeOffer.netValueJimmyJohnson} pts ({activeTradeOffer.fairnessRatio}x Value)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={acceptTradeOffer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                Accept Trade
              </button>
              <button
                onClick={declineTradeOffer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* On-The-Clock War Room Banner */}
      {!isDraftComplete && currentPick && currentTeamProfile && (
        <div
          className={`border rounded-xl p-5 shadow-2xl transition-all ${
            isUserOnClock
              ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/60 ring-2 ring-emerald-500/20'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Team Badge & Clock */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex flex-col items-center justify-center font-black text-xl shadow-lg border border-white/10"
                style={{
                  backgroundColor: currentTeamProfile.primaryColor || '#0284c7',
                  color: '#ffffff'
                }}
              >
                <span>{currentPick.teamKey}</span>
                <span className="text-[10px] font-mono tracking-widest opacity-80 uppercase">
                  RD {currentPick.round}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold uppercase font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ON THE CLOCK • PICK #{currentPick.pickNumber}
                  </span>
                  {currentPick.originalTeamKey && (
                    <span className="text-xs text-slate-400 font-mono">
                      (via {currentPick.originalTeamKey} - {currentPick.tradedVia})
                    </span>
                  )}
                  {isUserOnClock && (
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500 text-slate-950 animate-pulse">
                      YOUR PICK!
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {currentTeamProfile.teamName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                  <span className="text-slate-400">Primary Needs:</span>
                  {currentTeamProfile.topNeeds.map((need) => (
                    <span
                      key={need}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono font-semibold"
                    >
                      {need}
                    </span>
                  ))}
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Cap Space:</span>
                  <span className="font-mono text-emerald-400">{currentTeamProfile.capSpaceEst}</span>
                </div>
              </div>
            </div>

            {/* Quick Recommended Picks for Current Team */}
            <div className="lg:border-l lg:border-slate-800 lg:pl-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Recommended Best Fits
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {recommendedProspects.map((rec) => (
                  <button
                    key={rec.rank}
                    onClick={() => {
                      setInspectedProspect(rec);
                      if (isUserOnClock) {
                        // Keep inspected open
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left transition-all text-xs group"
                  >
                    <span className="font-mono font-bold text-slate-400 group-hover:text-emerald-400">
                      #{rec.rank}
                    </span>
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-white leading-tight">
                        {rec.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rec.position} • {rec.college}
                      </div>
                    </div>
                    {isUserOnClock && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          makeSelection(rec, true);
                        }}
                        className="ml-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                      >
                        Draft
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Areas based on Tab */}
      {activeViewMode === 'board' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left 2 Cols: Interactive Prospects Board */}
          <div className="xl:col-span-2 space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={prospectSearch}
                    onChange={(e) => setProspectSearch(e.target.value)}
                    placeholder="Search prospect, college, pro comp..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-slate-400 font-medium">Sort:</span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-slate-500"
                  >
                    <option value="rank">Consensus Rank (High to Low)</option>
                    <option value="scoutingGrade">Scouting Grade (0-100)</option>
                    <option value="rasScore">Athletic RAS Score</option>
                    <option value="value">Surplus Value Delta</option>
                  </select>
                </div>
              </div>

              {/* Position Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['ALL', 'QB', 'WR', 'OT', 'EDGE', 'CB', 'TE', 'DL', 'IOL', 'LB', 'S', 'RB'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosFilter(pos)}
                    className={`px-3 py-1 rounded-lg font-bold font-mono transition-all whitespace-nowrap ${
                      selectedPosFilter === pos
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Prospects Table / Grid */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-3.5 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>Available Prospects ({filteredProspects.length})</span>
                <span>Click prospect to preview 5-Year Value Trajectory</span>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-[640px] overflow-y-auto">
                {filteredProspects.map((prospect) => {
                  const isInspected = inspectedProspect?.rank === prospect.rank;
                  const isNeedForCurrentTeam =
                    currentTeamProfile &&
                    (currentTeamProfile.topNeeds.includes(prospect.position) ||
                      currentTeamProfile.secondaryNeeds.includes(prospect.position));

                  const valueDelta = currentPick ? prospect.rank - currentPick.pickNumber : 0;

                  return (
                    <div
                      key={prospect.rank}
                      onClick={() => setInspectedProspect(prospect)}
                      className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-all ${
                        isInspected ? 'bg-slate-800/70 border-l-4 border-emerald-500' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center font-mono">
                            <span className="text-[10px] text-slate-400 font-medium">RNK</span>
                            <span className="text-sm font-black text-white">#{prospect.rank}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm hover:text-emerald-400 transition-colors">
                                {prospect.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-mono font-bold text-xs">
                                {prospect.position}
                              </span>
                              {isNeedForCurrentTeam && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                  TEAM NEED
                                </span>
                              )}
                              {valueDelta > 3 && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                                  +{valueDelta} STEAL
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>{prospect.college}</span>
                              <span>•</span>
                              <span>
                                {prospect.height}, {prospect.weight} lbs
                              </span>
                              <span>•</span>
                              <span className="text-slate-300">
                                Comp:{' '}
                                <span className="text-slate-200 font-medium">{prospect.playerComp}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Metrics & Draft Button */}
                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-medium">SCOUT / RAS</div>
                            <div className="text-xs font-mono font-bold text-slate-200">
                              <span className="text-emerald-400">{prospect.scoutingGrade}</span> /{' '}
                              <span className="text-sky-400">{prospect.rasScore}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          {isUserOnClock && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                makeSelection(prospect, true);
                              }}
                              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Draft #{currentPick?.pickNumber}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Prospect Deep Dive & 5-Year Value Trajectory Curve */}
          <div className="space-y-5">
            {inspectedProspect ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      CONSENSUS RANK #{inspectedProspect.rank}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">{inspectedProspect.name}</h3>
                    <p className="text-xs text-slate-400">
                      {inspectedProspect.position} • {inspectedProspect.college} • {inspectedProspect.height},{' '}
                      {inspectedProspect.weight} lbs
                    </p>
                  </div>

                  {isUserOnClock && (
                    <button
                      onClick={() => makeSelection(inspectedProspect, true)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                    >
                      Draft Now
                    </button>
                  )}
                </div>

                {/* Scouting & Athletic Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Scouting Grade</span>
                    <span className="text-base font-black text-emerald-400">
                      {inspectedProspect.scoutingGrade} / 100
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Athletic RAS Score</span>
                    <span className="text-base font-black text-sky-400">
                      {inspectedProspect.rasScore} / 10.0
                    </span>
                  </div>
                </div>

                {/* 5-Year Career Value Trajectory D3 Curve */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                      5-Year Projected Value (AV Curve)
                    </span>
                    <span className="text-[10px] text-slate-400">Confidence Band: Floor vs Ceiling</span>
                  </div>

                  <div className="w-full flex justify-center">
                    <svg ref={trajectorySvgRef} className="w-full h-auto max-h-[210px]" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-sky-400 inline-block" />
                      <span>Projected Median AV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-slate-500 inline-block border-dashed" />
                      <span>Slot Baseline</span>
                    </div>
                  </div>
                </div>

                {/* Pro Player Comp & Scheme Fits */}
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80">
                    <span className="text-slate-400 text-[11px] block font-semibold mb-1">
                      Historical Pro Player Comparison:
                    </span>
                    <span className="text-slate-200 font-bold">{inspectedProspect.playerComp}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] font-semibold block mb-1.5">
                      Core Strengths:
                    </span>
                    <ul className="space-y-1">
                      {inspectedProspect.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 text-[11px] font-semibold block mb-1.5">
                      Top Scheme Fits:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectedProspect.teamFits.map((tf) => (
                        <span
                          key={tf}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono font-bold text-[10px]"
                        >
                          {tf}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 text-center text-slate-400 shadow-xl">
                <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="font-bold text-white text-base">Select a Prospect</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Click on any prospect to view full scouting grades, RAS athletic score, pro comparisons, and interactive 5-year value curve.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Picks Log & Real-time Value Tracker */}
      {activeViewMode === 'picks_log' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Draft Selections & Value Analytics Log
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of every pick made with immediate draft grade, value delta (+points/reach), and cap surplus.
              </p>
            </div>

            <button
              onClick={copyDraftSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
            </button>
          </div>

          {completedPicks.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium">No picks have been made yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Hit "Auto Sim" or "Next Pick" to begin simulating the draft.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedPicks.map((pick) => {
                const teamProf = TEAM_DRAFT_PROFILES.find((t) => t.teamKey === pick.teamKey);

                return (
                  <div
                    key={pick.pickNumber}
                    className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-sm shadow-md border border-white/10"
                          style={{
                            backgroundColor: teamProf?.primaryColor || '#0284c7',
                            color: '#ffffff'
                          }}
                        >
                          <span>{pick.teamKey}</span>
                          <span className="text-[10px] opacity-80">#{pick.pickNumber}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-white text-base">{pick.prospect.name}</h4>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-mono font-bold text-xs">
                              {pick.prospect.position}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              ({pick.prospect.college})
                            </span>
                            {pick.isUserPick && (
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold font-mono">
                                USER PICK
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{pick.rationale}</p>
                        </div>
                      </div>

                      {/* Grades & Metrics */}
                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Surplus Cap Impact</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            +${pick.projectedYear1CapSurplusM}M / yr
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Scheme Fit</span>
                          <span className="text-xs font-mono font-bold text-sky-300">
                            {pick.schemeFitScore}%
                          </span>
                        </div>

                        {/* Grade Badge */}
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shadow-md border ${
                            pick.grade.startsWith('A')
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : pick.grade.startsWith('B')
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                              : pick.grade.startsWith('C')
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          {pick.grade}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Post-Draft War Room Report Card */}
      {activeViewMode === 'report_card' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-amber-400" />
                  Draft War Room Analytics & Report Card
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comprehensive performance evaluations across all franchises based on draft value surplus, team scheme fulfillment, and roster ROI.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyDraftSummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Recap
                </button>
              </div>
            </div>

            {/* Top Draft Class Comparison Bar Chart */}
            {reportCardAnalytics && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Top Draft Class Average Scores (0 - 100)
                  </span>
                  <span className="text-[10px] text-slate-400">Ranked by Composite Draft Grade</span>
                </div>
                <div className="w-full flex justify-center">
                  <svg ref={barChartSvgRef} className="w-full h-auto max-h-[240px]" />
                </div>
              </div>
            )}

            {/* Steals vs Reaches Leaderboards */}
            {reportCardAnalytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Steals */}
                <div className="bg-slate-800/40 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    Top Steals of the Draft (Value Surplus)
                  </h4>
                  <div className="space-y-2">
                    {reportCardAnalytics.steals.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{s.prospect.name}</span>{' '}
                          <span className="text-slate-400 font-mono">({s.prospect.position})</span>
                          <div className="text-[10px] text-slate-400">
                            Drafted #{s.pickNumber} by {s.teamKey} (Rank #{s.prospect.rank})
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                          +{s.valueDelta} Slots
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reaches */}
                <div className="bg-slate-800/40 border border-rose-500/30 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Biggest Draft Reaches (Early Selections)
                  </h4>
                  <div className="space-y-2">
                    {reportCardAnalytics.reaches.map((r, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{r.prospect.name}</span>{' '}
                          <span className="text-slate-400 font-mono">({r.prospect.position})</span>
                          <div className="text-[10px] text-slate-400">
                            Drafted #{r.pickNumber} by {r.teamKey} (Rank #{r.prospect.rank})
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold">
                          {r.valueDelta} Slots
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Slot & Positional Baselines Tab */}
      {activeViewMode === 'historical_trends' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                <BarChart3 className="w-6 h-6 text-sky-400" />
                Historical NFL Draft Hit Rates & Positional Value Models
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Empirical baseline outcomes derived from modern rookie wage scale drafts (2011–2025 CBA era).
              </p>
            </div>

            {/* Historical Slots Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase font-mono font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Draft Slot Tier</th>
                    <th className="p-3 text-center">All-Pro %</th>
                    <th className="p-3 text-center">Pro Bowl %</th>
                    <th className="p-3 text-center">Starter Rate %</th>
                    <th className="p-3 text-center">Expected 5-Yr AV</th>
                    <th className="p-3 text-right">Avg Rookie Cap Surplus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.values(HISTORICAL_SLOT_BASELINES).map((slot) => (
                    <tr key={slot.pick} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{slot.tier}</td>
                      <td className="p-3 text-center text-amber-400 font-bold">{slot.allProRate}%</td>
                      <td className="p-3 text-center text-sky-300">{slot.proBowlRate}%</td>
                      <td className="p-3 text-center text-emerald-400">{slot.starterRate}%</td>
                      <td className="p-3 text-center text-purple-300 font-bold">{slot.expected5YrAV} AV</td>
                      <td className="p-3 text-right text-emerald-400 font-bold">+${slot.avgRookieCapSurplusM}M / yr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Positional Scarcity & 2nd Contract APY Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {Object.values(HISTORICAL_POSITION_TRENDS).map((pos) => (
                <div key={pos.position} className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {pos.position}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Avg 2nd APY: ${pos.avgSecondContractAPY}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1">
                    <span>1st Rd Hit Rate: <strong className="text-sky-400">{pos.firstRoundAvgHitRate}%</strong></span>
                    <span>Scarcity Multiplier: <strong className="text-purple-300">{pos.scarcityMultiplier}x</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    {pos.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
