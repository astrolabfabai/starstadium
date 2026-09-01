import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TEAM_DRAFT_PROFILES,
  CONSENSUS_DRAFT_PROSPECTS,
  HISTORICAL_TRADE_COMPS,
  getJimmyJohnsonValue,
  getRichHillValue,
  getFitzgeraldSpielbergerValue,
  getHarvardAvValue,
  getRoundForPick,
  TeamDraftProfile,
  DraftProspect
} from '../../data/draftPickData';
import { DraftMockSimulator } from '../football/DraftMockSimulator';
import {
  Scale,
  Sparkles,
  ArrowRightLeft,
  TrendingUp,
  Award,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Shield,
  HelpCircle,
  BarChart2,
  Zap,
  ExternalLink,
  ChevronDown,
  Target
} from 'lucide-react';

export type DraftChartModel = 'jimmy_johnson' | 'rich_hill' | 'fitzgerald_spielberger' | 'harvard_av';

interface SelectedTradeItem {
  id: string;
  type: 'current_pick' | 'future_pick' | 'custom_pick';
  pickNumber: number;
  round: number;
  year?: number;
  label: string;
}

export const DraftPickAnalyzerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mock_simulator' | 'trade_machine' | 'value_curve' | 'team_capital' | 'prospects_board' | 'historical_trades'>('trade_machine');
  const [selectedModel, setSelectedModel] = useState<DraftChartModel>('jimmy_johnson');

  // Trade Machine State
  const [teamAKey, setTeamAKey] = useState<string>('NE');
  const [teamBKey, setTeamBKey] = useState<string>('ARI');
  const [teamAAssets, setTeamAAssets] = useState<SelectedTradeItem[]>([
    { id: 'ne-34', type: 'current_pick', pickNumber: 34, round: 2, label: 'Pick #34 (Round 2)' },
    { id: 'ne-68', type: 'current_pick', pickNumber: 68, round: 3, label: 'Pick #68 (Round 3)' },
    { id: 'ne-2027-1st', type: 'future_pick', pickNumber: 18, round: 1, year: 2027, label: '2027 1st Round Pick (Est #18)' }
  ]);
  const [teamBAssets, setTeamBAssets] = useState<SelectedTradeItem[]>([
    { id: 'ari-4', type: 'current_pick', pickNumber: 4, round: 1, label: 'Pick #4 (Round 1)' }
  ]);

  // Custom Pick Adders
  const [customPickA, setCustomPickA] = useState<number>(1);
  const [customPickB, setCustomPickB] = useState<number>(1);

  // Prospect Search & Filter
  const [prospectSearch, setProspectSearch] = useState<string>('');
  const [prospectPosFilter, setProspectPosFilter] = useState<string>('ALL');

  // Value Curve D3 ref & hovered pick
  const curveSvgRef = useRef<SVGSVGElement>(null);
  const curveContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredCurvePick, setHoveredCurvePick] = useState<number | null>(10);

  // Helper to calculate pick value under selected model
  const calculateValue = (pick: number, model: DraftChartModel = selectedModel): number => {
    if (model === 'jimmy_johnson') return getJimmyJohnsonValue(pick);
    if (model === 'rich_hill') return getRichHillValue(pick);
    if (model === 'fitzgerald_spielberger') return getFitzgeraldSpielbergerValue(pick);
    return getHarvardAvValue(pick);
  };

  // Team A Total Value across all 4 models
  const teamATotals = useMemo(() => {
    const jj = teamAAssets.reduce((sum, item) => sum + getJimmyJohnsonValue(item.pickNumber), 0);
    const rh = teamAAssets.reduce((sum, item) => sum + getRichHillValue(item.pickNumber), 0);
    const fs = teamAAssets.reduce((sum, item) => sum + getFitzgeraldSpielbergerValue(item.pickNumber), 0);
    const hav = teamAAssets.reduce((sum, item) => sum + getHarvardAvValue(item.pickNumber), 0);
    return { jj, rh, fs, hav };
  }, [teamAAssets]);

  // Team B Total Value across all 4 models
  const teamBTotals = useMemo(() => {
    const jj = teamBAssets.reduce((sum, item) => sum + getJimmyJohnsonValue(item.pickNumber), 0);
    const rh = teamBAssets.reduce((sum, item) => sum + getRichHillValue(item.pickNumber), 0);
    const fs = teamBAssets.reduce((sum, item) => sum + getFitzgeraldSpielbergerValue(item.pickNumber), 0);
    const hav = teamBAssets.reduce((sum, item) => sum + getHarvardAvValue(item.pickNumber), 0);
    return { jj, rh, fs, hav };
  }, [teamBAssets]);

  // Active Model Selected Values
  const activeValueA = selectedModel === 'jimmy_johnson' ? teamATotals.jj : selectedModel === 'rich_hill' ? teamATotals.rh : selectedModel === 'fitzgerald_spielberger' ? teamATotals.fs : teamATotals.hav;
  const activeValueB = selectedModel === 'jimmy_johnson' ? teamBTotals.jj : selectedModel === 'rich_hill' ? teamBTotals.rh : selectedModel === 'fitzgerald_spielberger' ? teamBTotals.fs : teamBTotals.hav;
  const netDiff = activeValueA - activeValueB;
  const higherVal = Math.max(activeValueA, activeValueB, 1);
  const diffPct = Math.round((Math.abs(netDiff) / higherVal) * 100);

  // Trade Grade & Verdict
  const tradeVerdict = useMemo(() => {
    if (teamAAssets.length === 0 && teamBAssets.length === 0) return { status: 'EMPTY', text: 'Select picks on both sides to evaluate trade value balance.' };
    if (diffPct <= 6) {
      return {
        status: 'FAIR',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        text: '🤝 Balanced & Fair Trade (~0-6% variance). Both teams exchange equitable draft capital.',
        gradeA: 'A',
        gradeB: 'A'
      };
    }
    if (activeValueA > activeValueB) {
      if (diffPct <= 15) {
        return {
          status: 'SLIGHT_OVERPAY_A',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          text: `⚡ Slight premium paid by ${teamAKey} (+${diffPct}% surplus to ${teamBKey}). Typical for moving up for blue-chip players.`,
          gradeA: 'B+',
          gradeB: 'A-'
        };
      }
      return {
        status: 'HEAVY_OVERPAY_A',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        text: `🚩 Heavy Overpay by ${teamAKey} (+${diffPct}% premium). ${teamBKey} receives substantial surplus draft value.`,
        gradeA: 'C+',
        gradeB: 'A+'
      };
    } else {
      if (diffPct <= 15) {
        return {
          status: 'SLIGHT_UNDERPAY_A',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          text: `⚡ Slight discount for ${teamAKey} (+${diffPct}% surplus value for ${teamAKey}). ${teamBKey} may require additional day-3 sweetener.`,
          gradeA: 'A-',
          gradeB: 'B+'
        };
      }
      return {
        status: 'UNDERPAY_A',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        text: `⚠️ Incomplete Package: ${teamBKey} is surrendering significantly more value (+${diffPct}% surplus to ${teamAKey}).`,
        gradeA: 'A+',
        gradeB: 'D'
      };
    }
  }, [activeValueA, activeValueB, diffPct, teamAKey, teamBKey, teamAAssets, teamBAssets]);

  const teamAProfile = TEAM_DRAFT_PROFILES.find((t) => t.teamKey === teamAKey) || TEAM_DRAFT_PROFILES[0];
  const teamBProfile = TEAM_DRAFT_PROFILES.find((t) => t.teamKey === teamBKey) || TEAM_DRAFT_PROFILES[1];

  // Quick Preset Trades
  const applyTradePreset = (preset: 'TOP_3_QB' | 'DAY_2_HARVEST' | 'MID_ROUND_SWAP' | 'BLOCKBUSTER_THREE_1STS') => {
    if (preset === 'TOP_3_QB') {
      setTeamAKey('WAS');
      setTeamBKey('CHI');
      setTeamAAssets([
        { id: 'was-2', type: 'current_pick', pickNumber: 2, round: 1, label: 'Pick #2 (Round 1)' },
        { id: 'was-40', type: 'current_pick', pickNumber: 40, round: 2, label: 'Pick #40 (Round 2)' }
      ]);
      setTeamBAssets([
        { id: 'chi-1', type: 'current_pick', pickNumber: 1, round: 1, label: 'Pick #1 (Round 1 - Caleb Williams)' }
      ]);
    } else if (preset === 'DAY_2_HARVEST') {
      setTeamAKey('BUF');
      setTeamBKey('CAR');
      setTeamAAssets([
        { id: 'buf-28', type: 'current_pick', pickNumber: 28, round: 1, label: 'Pick #28 (Round 1)' }
      ]);
      setTeamBAssets([
        { id: 'car-33', type: 'current_pick', pickNumber: 33, round: 2, label: 'Pick #33 (Round 2)' },
        { id: 'car-101', type: 'current_pick', pickNumber: 101, round: 4, label: 'Pick #101 (Round 4)' }
      ]);
    } else if (preset === 'MID_ROUND_SWAP') {
      setTeamAKey('PHI');
      setTeamBKey('DET');
      setTeamAAssets([
        { id: 'phi-22', type: 'current_pick', pickNumber: 22, round: 1, label: 'Pick #22 (Round 1)' }
      ]);
      setTeamBAssets([
        { id: 'det-29', type: 'current_pick', pickNumber: 29, round: 1, label: 'Pick #29 (Round 1)' },
        { id: 'det-73', type: 'current_pick', pickNumber: 73, round: 3, label: 'Pick #73 (Round 3)' }
      ]);
    } else {
      setTeamAKey('KC');
      setTeamBKey('LAC');
      setTeamAAssets([
        { id: 'kc-32', type: 'current_pick', pickNumber: 32, round: 1, label: 'Pick #32 (Round 1)' },
        { id: 'kc-64', type: 'current_pick', pickNumber: 64, round: 2, label: 'Pick #64 (Round 2)' },
        { id: 'kc-2027-1st', type: 'future_pick', pickNumber: 30, round: 1, year: 2027, label: '2027 1st Round Pick (Est #30)' }
      ]);
      setTeamBAssets([
        { id: 'lac-5', type: 'current_pick', pickNumber: 5, round: 1, label: 'Pick #5 (Round 1 - Joe Alt)' }
      ]);
    }
  };

  // Add Pick Handlers
  const handleAddPickToTeamA = (pickNumber: number, label?: string) => {
    const round = getRoundForPick(pickNumber);
    const newId = `asset-a-${Date.now()}-${Math.random()}`;
    setTeamAAssets((prev) => [
      ...prev,
      {
        id: newId,
        type: 'current_pick',
        pickNumber,
        round,
        label: label || `Pick #${pickNumber} (Round ${round})`
      }
    ]);
  };

  const handleAddPickToTeamB = (pickNumber: number, label?: string) => {
    const round = getRoundForPick(pickNumber);
    const newId = `asset-b-${Date.now()}-${Math.random()}`;
    setTeamBAssets((prev) => [
      ...prev,
      {
        id: newId,
        type: 'current_pick',
        pickNumber,
        round,
        label: label || `Pick #${pickNumber} (Round ${round})`
      }
    ]);
  };

  // D3 Value Curve Chart Rendering
  useEffect(() => {
    if (!curveSvgRef.current || !curveContainerRef.current || activeTab !== 'value_curve') return;

    const containerWidth = curveContainerRef.current.clientWidth || 800;
    const height = 340;
    const margin = { top: 20, right: 30, bottom: 35, left: 55 };
    const width = containerWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(curveSvgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Pick 1 to 256 dataset
    const picksData = Array.from({ length: 256 }, (_, i) => {
      const pick = i + 1;
      return {
        pick,
        round: getRoundForPick(pick),
        jj: getJimmyJohnsonValue(pick),
        rh: getRichHillValue(pick) * 3, // Normalized to 3000 max scale for visual overlay
        fs: getFitzgeraldSpielbergerValue(pick),
        hav: getHarvardAvValue(pick) * 6.66 // Normalized to 3000 max scale
      };
    });

    const xScale = d3.scaleLinear().domain([1, 256]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 3000]).range([chartHeight, 0]);

    // Background round bands
    const roundRanges = [
      { round: 1, start: 1, end: 32, label: 'Round 1' },
      { round: 2, start: 33, end: 64, label: 'Round 2' },
      { round: 3, start: 65, end: 102, label: 'Round 3' },
      { round: 4, start: 103, end: 137, label: 'Round 4' },
      { round: 5, start: 138, end: 178, label: 'Round 5' },
      { round: 6, start: 179, end: 220, label: 'Round 6' },
      { round: 7, start: 221, end: 256, label: 'Round 7' }
    ];

    roundRanges.forEach((r, idx) => {
      const x1 = xScale(r.start);
      const x2 = xScale(r.end);
      if (idx % 2 === 0) {
        g.append('rect')
          .attr('x', x1)
          .attr('y', 0)
          .attr('width', x2 - x1)
          .attr('height', chartHeight)
          .attr('fill', '#ffffff')
          .attr('opacity', 0.02);
      }

      // Round Divider
      g.append('line')
        .attr('x1', x2)
        .attr('x2', x2)
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', '#27272a')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2 3');

      // Round Label
      g.append('text')
        .attr('x', (x1 + x2) / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#71717a')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .text(`R${r.round}`);
    });

    // Horizontal Grid
    const yTicks = [0, 500, 1000, 1500, 2000, 2500, 3000];
    g.selectAll('.y-grid')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#27272a')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-dasharray', '2 2');

    // JJ Area & Line (Gold)
    const jjLine = d3
      .line<(typeof picksData)[0]>()
      .x((d) => xScale(d.pick))
      .y((d) => yScale(d.jj))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(picksData)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2.5)
      .attr('d', jjLine);

    // Rich Hill Line (Sky Blue)
    const rhLine = d3
      .line<(typeof picksData)[0]>()
      .x((d) => xScale(d.pick))
      .y((d) => yScale(d.rh))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(picksData)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 2')
      .attr('d', rhLine);

    // Fitzgerald-Spielberger Line (Emerald)
    const fsLine = d3
      .line<(typeof picksData)[0]>()
      .x((d) => xScale(d.pick))
      .y((d) => yScale(d.fs))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(picksData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '2 2')
      .attr('d', fsLine);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([1, 32, 64, 100, 150, 200, 256])
      .tickFormat((d) => `#${d}`);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('color', '#52525b')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#a1a1aa');

    const yAxis = d3.axisLeft(yScale).ticks(6);
    g.append('g')
      .call(yAxis)
      .attr('color', '#52525b')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#a1a1aa');

    // Interactive Hover Tracking
    const tracker = g.append('g').attr('class', 'tracker').style('display', 'none');
    const trackerLine = tracker
      .append('line')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 3');

    const trackerDot = tracker
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    g.append('rect')
      .attr('width', width)
      .attr('height', chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', () => tracker.style('display', null))
      .on('mouseleave', () => tracker.style('display', 'none'))
      .on('mousemove', (event) => {
        const [xPos] = d3.pointer(event);
        const pickVal = Math.max(1, Math.min(256, Math.round(xScale.invert(xPos))));
        setHoveredCurvePick(pickVal);
        const cx = xScale(pickVal);
        const cy = yScale(getJimmyJohnsonValue(pickVal));
        trackerLine.attr('x1', cx).attr('x2', cx);
        trackerDot.attr('cx', cx).attr('cy', cy);
      });
  }, [activeTab]);

  // Filtered Prospects
  const filteredProspects = useMemo(() => {
    return CONSENSUS_DRAFT_PROSPECTS.filter((p) => {
      if (prospectPosFilter !== 'ALL' && p.position !== prospectPosFilter) return false;
      if (prospectSearch) {
        const query = prospectSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.college.toLowerCase().includes(query) ||
          p.position.toLowerCase().includes(query) ||
          p.playerComp.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [prospectSearch, prospectPosFilter]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Hero Title */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xl">
                ⚖️
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white font-serif tracking-wide flex items-center gap-2">
                  <span>NFL Draft Pick &amp; Trade Value</span>
                  <span className="text-amber-500 font-sans not-italic font-extrabold">Analyzer</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Multi-Model Trade Machine &bull; Jimmy Johnson, Rich Hill &amp; Fitzgerald-Spielberger Charts &bull; 32-Team War Chest
                </p>
              </div>
            </div>
          </div>

          {/* Model Selector Ribbon */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
            <span className="text-[10px] text-slate-400 font-bold uppercase px-1 flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-400" /> Chart:
            </span>
            {[
              { id: 'jimmy_johnson', label: 'Jimmy Johnson (Classic)', badge: 'NFL STD' },
              { id: 'rich_hill', label: 'Rich Hill (Modern)', badge: 'MARKET' },
              { id: 'fitzgerald_spielberger', label: 'PFF Surplus (Cap)', badge: 'ANALYTIC' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  selectedModel === m.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-1">
        {[
          { id: 'trade_machine', label: '🔄 Interactive Trade Simulator', icon: ArrowRightLeft },
          { id: 'mock_simulator', label: '🏈 Mock Draft Simulator', icon: Target },
          { id: 'value_curve', label: '📈 D3 Draft Value Curves', icon: TrendingUp },
          { id: 'team_capital', label: '🏛️ 32-Team Draft Capital', icon: Layers },
          { id: 'prospects_board', label: '🌟 2026 Consensus Board', icon: Award },
          { id: 'historical_trades', label: '📜 Blockbuster Historical Comps', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: MOCK DRAFT SIMULATOR */}
      {activeTab === 'mock_simulator' && (
        <DraftMockSimulator onNavigateToTrades={() => setActiveTab('trade_machine')} />
      )}

      {/* TAB 1: INTERACTIVE TRADE MACHINE */}
      {activeTab === 'trade_machine' && (
        <div className="space-y-6">
          {/* Quick Trade Presets */}
          <div className="bg-[#141418] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Scenario Presets:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => applyTradePreset('TOP_3_QB')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition"
              >
                QB Jump: WAS #2 + #40 ➔ CHI #1
              </button>
              <button
                onClick={() => applyTradePreset('DAY_2_HARVEST')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition"
              >
                Trade Back: BUF #28 ➔ CAR #33 + #101
              </button>
              <button
                onClick={() => applyTradePreset('MID_ROUND_SWAP')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition"
              >
                First Round Slide: PHI #22 ➔ DET #29 + #73
              </button>
              <button
                onClick={() => applyTradePreset('BLOCKBUSTER_THREE_1STS')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition"
              >
                Blue Chip Ascent: KC ➔ LAC #5
              </button>
            </div>
          </div>

          {/* Trade Evaluation Result Banner */}
          <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Team A Point Summary */}
              <div className="text-center md:text-left flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/20"
                  style={{ backgroundColor: teamAProfile.primaryColor }}
                >
                  {teamAKey}
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono uppercase">{teamAProfile.teamName}</div>
                  <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
                    <span>{activeValueA.toLocaleString()} pts</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Grade: {tradeVerdict.gradeA || 'B'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    JJ: {teamATotals.jj} | RH: {teamATotals.rh} | Surplus: ${Math.round(teamATotals.fs / 30)}M
                  </div>
                </div>
              </div>

              {/* Central Dial / Difference Meter */}
              <div className="flex flex-col items-center justify-center max-w-sm text-center px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border mb-2 ${tradeVerdict.badgeColor}`}>
                  {tradeVerdict.status === 'FAIR' ? '✅ FAIR TRADE' : tradeVerdict.status.includes('OVERPAY') ? '⚡ SURPLUS VALUE' : '⚠️ VALUE DEFICIT'}
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {tradeVerdict.text}
                </p>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Net Variance: <strong className="text-white">{Math.abs(netDiff).toLocaleString()} pts ({diffPct}%)</strong>
                </div>
              </div>

              {/* Team B Point Summary */}
              <div className="text-center md:text-right flex flex-row-reverse md:flex-row items-center gap-3">
                <div>
                  <div className="text-xs text-slate-400 font-mono uppercase">{teamBProfile.teamName}</div>
                  <div className="text-2xl font-black text-white font-mono flex items-center justify-end gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Grade: {tradeVerdict.gradeB || 'B'}
                    </span>
                    <span>{activeValueB.toLocaleString()} pts</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    JJ: {teamBTotals.jj} | RH: {teamBTotals.rh} | Surplus: ${Math.round(teamBTotals.fs / 30)}M
                  </div>
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/20"
                  style={{ backgroundColor: teamBProfile.primaryColor }}
                >
                  {teamBKey}
                </div>
              </div>
            </div>
          </div>

          {/* Trade Sides: Side by Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SIDE A: TEAM A */}
            <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Team A Sends:</span>
                  <select
                    value={teamAKey}
                    onChange={(e) => {
                      setTeamAKey(e.target.value);
                      setTeamAAssets([]);
                    }}
                    aria-label="Select Team A"
                    className="bg-[#1a1a22] border border-white/15 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {TEAM_DRAFT_PROFILES.map((t) => (
                      <option key={t.teamKey} value={t.teamKey}>
                        {t.teamKey} - {t.teamName}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setTeamAAssets([])}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              {/* Owned Picks Quick Selector */}
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                  Available Owned Picks ({teamAProfile.teamName}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {teamAProfile.picks.map((p) => {
                    const isAdded = teamAAssets.some((a) => a.pickNumber === p && a.type === 'current_pick');
                    return (
                      <button
                        key={p}
                        onClick={() => handleAddPickToTeamA(p)}
                        disabled={isAdded}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                          isAdded
                            ? 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed'
                            : 'bg-[#181820] text-slate-200 border-white/10 hover:border-amber-500 hover:text-amber-300'
                        }`}
                      >
                        +# {p} ({getJimmyJohnsonValue(p)}p)
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleAddPickToTeamA(18, '2027 1st Round Pick')}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                  >
                    + 2027 1st
                  </button>
                  <button
                    onClick={() => handleAddPickToTeamA(50, '2027 2nd Round Pick')}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                  >
                    + 2027 2nd
                  </button>
                </div>
              </div>

              {/* Custom Pick Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-slate-400">Custom Pick #:</span>
                <input
                  type="number"
                  min={1}
                  max={256}
                  value={customPickA}
                  onChange={(e) => setCustomPickA(parseInt(e.target.value) || 1)}
                  aria-label="Custom Pick Number Team A"
                  className="w-20 bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleAddPickToTeamA(customPickA)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1 hover:bg-amber-400"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {/* Selected Assets List */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-xs font-mono font-bold text-slate-300">
                  Included in Trade Package ({teamAAssets.length} Assets):
                </div>
                {teamAAssets.length === 0 ? (
                  <div className="p-4 rounded-xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-slate-500 font-mono">
                    No picks added. Click above to add picks.
                  </div>
                ) : (
                  teamAAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-2.5 rounded-xl bg-[#181820] border border-white/10 flex justify-between items-center text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-white">{asset.label}</div>
                        <div className="text-[10px] text-slate-400">
                          JJ: {getJimmyJohnsonValue(asset.pickNumber)} pts &bull; RH: {getRichHillValue(asset.pickNumber)} pts
                        </div>
                      </div>
                      <button
                        onClick={() => setTeamAAssets((prev) => prev.filter((a) => a.id !== asset.id))}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                        title="Remove pick"
                        aria-label="Remove pick"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SIDE B: TEAM B */}
            <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Team B Sends:</span>
                  <select
                    value={teamBKey}
                    onChange={(e) => {
                      setTeamBKey(e.target.value);
                      setTeamBAssets([]);
                    }}
                    aria-label="Select Team B"
                    className="bg-[#1a1a22] border border-white/15 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {TEAM_DRAFT_PROFILES.map((t) => (
                      <option key={t.teamKey} value={t.teamKey}>
                        {t.teamKey} - {t.teamName}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setTeamBAssets([])}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              {/* Owned Picks Quick Selector */}
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                  Available Owned Picks ({teamBProfile.teamName}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {teamBProfile.picks.map((p) => {
                    const isAdded = teamBAssets.some((a) => a.pickNumber === p && a.type === 'current_pick');
                    return (
                      <button
                        key={p}
                        onClick={() => handleAddPickToTeamB(p)}
                        disabled={isAdded}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                          isAdded
                            ? 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed'
                            : 'bg-[#181820] text-slate-200 border-white/10 hover:border-emerald-500 hover:text-emerald-300'
                        }`}
                      >
                        +# {p} ({getJimmyJohnsonValue(p)}p)
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleAddPickToTeamB(18, '2027 1st Round Pick')}
                    className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20"
                  >
                    + 2027 1st
                  </button>
                </div>
              </div>

              {/* Custom Pick Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-slate-400">Custom Pick #:</span>
                <input
                  type="number"
                  min={1}
                  max={256}
                  value={customPickB}
                  onChange={(e) => setCustomPickB(parseInt(e.target.value) || 1)}
                  aria-label="Custom Pick Number Team B"
                  className="w-20 bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleAddPickToTeamB(customPickB)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1 hover:bg-emerald-400"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {/* Selected Assets List */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-xs font-mono font-bold text-slate-300">
                  Included in Trade Package ({teamBAssets.length} Assets):
                </div>
                {teamBAssets.length === 0 ? (
                  <div className="p-4 rounded-xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-slate-500 font-mono">
                    No picks added. Click above to add picks.
                  </div>
                ) : (
                  teamBAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-2.5 rounded-xl bg-[#181820] border border-white/10 flex justify-between items-center text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-white">{asset.label}</div>
                        <div className="text-[10px] text-slate-400">
                          JJ: {getJimmyJohnsonValue(asset.pickNumber)} pts &bull; RH: {getRichHillValue(asset.pickNumber)} pts
                        </div>
                      </div>
                      <button
                        onClick={() => setTeamBAssets((prev) => prev.filter((a) => a.id !== asset.id))}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                        title="Remove pick"
                        aria-label="Remove pick"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: D3 VALUE CURVE EXPLORER */}
      {activeTab === 'value_curve' && (
        <div className="space-y-6">
          <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>D3 Exponential Draft Value Curves (Picks 1 - 256)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizes the non-linear decay of draft pick values across Jimmy Johnson, Rich Hill, and PFF Surplus Value models.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-amber-500" />
                  <span className="text-white">Jimmy Johnson</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-sky-400" />
                  <span className="text-slate-300">Rich Hill</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-emerald-400" />
                  <span className="text-slate-300">Surplus Value</span>
                </div>
              </div>
            </div>

            {/* Hover Telemetry Card */}
            {hoveredCurvePick && (
              <div className="bg-[#181820] border border-amber-500/30 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Selected Pick Slot</div>
                  <div className="text-base font-bold text-white">Pick #{hoveredCurvePick} (Round {getRoundForPick(hoveredCurvePick)})</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Jimmy Johnson Value</div>
                  <div className="text-base font-bold text-amber-400">{getJimmyJohnsonValue(hoveredCurvePick)} pts</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Rich Hill Value</div>
                  <div className="text-base font-bold text-sky-400">{getRichHillValue(hoveredCurvePick)} pts</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Contract Surplus Value</div>
                  <div className="text-base font-bold text-emerald-400">${(getFitzgeraldSpielbergerValue(hoveredCurvePick) / 30).toFixed(1)}M/yr</div>
                </div>
              </div>
            )}

            {/* D3 Curve Canvas */}
            <div ref={curveContainerRef} className="w-full cursor-crosshair">
              <svg ref={curveSvgRef} className="w-full" style={{ minHeight: '340px' }} />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 32-TEAM CAPITAL MATRIX */}
      {activeTab === 'team_capital' && (
        <div className="space-y-6">
          <div className="bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#141418] border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>32-Team Draft Capital &amp; War Chest Ranking</span>
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Sorted by Total Draft Value Points</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-white/5 uppercase text-[10px] text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4">Rank &amp; Team</th>
                    <th className="py-2.5 px-3 text-center">Total Picks</th>
                    <th className="py-2.5 px-3">Primary Owned Picks</th>
                    <th className="py-2.5 px-3 text-right">Jimmy Johnson Pts</th>
                    <th className="py-2.5 px-3 text-right">Rich Hill Pts</th>
                    <th className="py-2.5 px-4">Top Roster Needs</th>
                    <th className="py-2.5 px-3">Draft Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {TEAM_DRAFT_PROFILES.map((team, idx) => {
                    const totalJJ = team.picks.reduce((s, p) => s + getJimmyJohnsonValue(p), 0);
                    const totalRH = team.picks.reduce((s, p) => s + getRichHillValue(p), 0);
                    return (
                      <tr key={team.teamKey} className="hover:bg-white/5 transition">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                          <span className="w-5 text-slate-500 font-normal">#{idx + 1}</span>
                          <span
                            className="w-3 h-3 rounded-full inline-block"
                            style={{ backgroundColor: team.primaryColor }}
                          />
                          <span>{team.teamKey} &bull; {team.teamName}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-white">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">{team.picks.length}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {team.picks.slice(0, 4).map((p) => (
                              <span
                                key={p}
                                className={`px-1.5 py-0.2 rounded text-[10px] ${
                                  p <= 32 ? 'bg-amber-500/20 text-amber-300 font-bold' : 'bg-white/5 text-slate-300'
                                }`}
                              >
                                #{p}
                              </span>
                            ))}
                            {team.picks.length > 4 && (
                              <span className="text-[10px] text-slate-500 font-mono">+{team.picks.length - 4} more</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-amber-400">
                          {totalJJ.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-sky-400">
                          {totalRH.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {team.topNeeds.map((need) => (
                              <span key={need} className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                {need}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-400 max-w-[240px] truncate">
                          {team.draftStrategy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 2026 CONSENSUS DRAFT PROSPECTS BOARD */}
      {activeTab === 'prospects_board' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-[#141418] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prospect by name, college, position..."
                value={prospectSearch}
                onChange={(e) => setProspectSearch(e.target.value)}
                className="w-full bg-[#181820] border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'QB', 'WR', 'OT', 'EDGE', 'CB', 'TE', 'DL'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setProspectPosFilter(pos)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    prospectPosFilter === pos
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Prospects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProspects.map((p) => (
              <div
                key={p.rank}
                className="bg-[#121216] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 hover:border-amber-500/40 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                        RANK #{p.rank}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold text-xs">
                        {p.position}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{p.college}</span>
                    </div>
                    <h3 className="text-base font-black text-white mt-1">{p.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400 font-mono">{p.scoutingGrade}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Scout Grade</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-black/40 p-2 rounded-xl border border-white/5 text-[11px] font-mono text-slate-300">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Size</span>
                    <strong>{p.height}, {p.weight} lbs</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">RAS Score</span>
                    <strong className="text-amber-400">{p.rasScore} / 10.0</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Proj. Slot</span>
                    <strong className="text-sky-300 truncate block">{p.projectedRound}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Pro Comparison</span>
                  <div className="text-xs text-slate-200 font-mono italic bg-white/5 p-2 rounded-lg border border-white/5">
                    "{p.playerComp}"
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Key Strengths</span>
                  <div className="flex flex-wrap gap-1">
                    {p.strengths.slice(0, 2).map((str, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                        &bull; {str}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Best Team Fits:</span>
                  <div className="flex items-center gap-1">
                    {p.teamFits.map((tf) => (
                      <span key={tf} className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold">
                        {tf}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: HISTORICAL TRADE COMPS */}
      {activeTab === 'historical_trades' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {HISTORICAL_TRADE_COMPS.map((comp) => (
              <div
                key={comp.title}
                className="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {comp.year} DRAFT TRADE
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{comp.title}</h3>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                      +{comp.jimmyJohnsonDiff} JJ PTS
                    </span>
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <strong className="text-amber-400">{comp.teamA} Sent:</strong>
                    <span className="text-slate-300 text-right max-w-[260px]">{comp.assetsA}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1.5">
                    <strong className="text-emerald-400">{comp.teamB} Sent:</strong>
                    <span className="text-slate-300 text-right">{comp.assetsB}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-sans leading-relaxed border-t border-white/5 pt-2">
                  <strong className="text-slate-200">Outcome &amp; Historical Impact:</strong> {comp.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
