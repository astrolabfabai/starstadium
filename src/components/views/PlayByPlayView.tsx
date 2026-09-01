import React, { useState, useEffect } from 'react';
import { SeasonCode, SEASONS_LIST, PlayByPlayEvent, GameSchedule } from '../../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { SCHEDULES_DATA } from '../../data/sportsDataMock';
import { getPlaysForGame } from '../../data/gamePlaysData';
import { getPlayTacticalConcept } from '../../data/footballDiagramsData';
import { GridironTacticalCanvas } from '../football/GridironTacticalCanvas';
import { WinProbabilityChart } from '../football/WinProbabilityChart';
import { exportPlayAnimationsAsHtml, exportPlayAnimationsAsJson, exportCoachingReport } from '../../utils/playAnimationsExporter';
import {
  Activity,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Zap,
  Shield,
  Calendar,
  Layers,
  Sparkles,
  Target,
  ChevronRight,
  TrendingUp,
  Clock,
  Radio,
  Download,
  Film,
  X,
  FileCode,
  FileText,
  Sliders,
  Filter
} from 'lucide-react';

const PLAY_TYPE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface PlayByPlayViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  selectedGameKey?: string;
  initialGameKey?: string;
  onSelectGameKey?: (gameKey: string) => void;
}

export const PlayByPlayView: React.FC<PlayByPlayViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange,
  selectedGameKey: propSelectedGameKey,
  initialGameKey,
  onSelectGameKey
}) => {
  // Available games in this season
  const gamesForSeason = SCHEDULES_DATA.filter((g) => {
    if (selectedSeason.startsWith('2026') && g.Season === 2026) return true;
    if (selectedSeason.startsWith('2025') && g.Season === 2025) return true;
    if (selectedSeason.startsWith('2024') && g.Season === 2024) return true;
    if (selectedSeason.startsWith('2023') && g.Season === 2023) return true;
    return true;
  });

  const [selectedGameKey, setSelectedGameKey] = useState<string>(
    propSelectedGameKey || initialGameKey || gamesForSeason[0]?.GameKey || '202610203'
  );

  // Synchronize when parent passes a new selectedGameKey (e.g. from Scoreboard or Schedule)
  useEffect(() => {
    if (propSelectedGameKey && propSelectedGameKey !== selectedGameKey) {
      setSelectedGameKey(propSelectedGameKey);
    }
  }, [propSelectedGameKey]);

  const handleSelectGame = (gameKey: string) => {
    setSelectedGameKey(gameKey);
    if (onSelectGameKey) {
      onSelectGameKey(gameKey);
    }
  };

  const [gameStatusFilter, setGameStatusFilter] = useState<'ALL' | 'LIVE' | 'FINAL'>('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'ALL'>('ALL');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1);
  const [isRoutesAnimating, setIsRoutesAnimating] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFilmRoomModalOpen, setIsFilmRoomModalOpen] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Selected game - checks gamesForSeason first, then full SCHEDULES_DATA
  const activeGame =
    gamesForSeason.find((g) => g.GameKey === selectedGameKey) ||
    SCHEDULES_DATA.find((g) => g.GameKey === selectedGameKey) ||
    gamesForSeason[0] ||
    SCHEDULES_DATA[0];

  // Dynamic plays for the selected game (Live or Final)
  const gamePlays = getPlaysForGame(
    activeGame.GameKey,
    activeGame.AwayTeam,
    activeGame.HomeTeam,
    activeGame.Status
  );

  const filteredPlays = gamePlays.filter((p) => {
    if (selectedQuarter !== 'ALL' && p.Quarter !== selectedQuarter) return false;
    return true;
  });

  const [selectedPlayId, setSelectedPlayId] = useState<number>(filteredPlays[0]?.PlayID || 5001);

  // When game or filter changes, reset selected play if needed
  useEffect(() => {
    if (filteredPlays.length > 0) {
      setSelectedPlayId(filteredPlays[0].PlayID);
      setSelectedNodeId(null);
    }
  }, [selectedGameKey, selectedQuarter]);

  const activePlay = filteredPlays.find((p) => p.PlayID === selectedPlayId) || filteredPlays[0] || gamePlays[0];
  const activePlayConcept = getPlayTacticalConcept(activePlay);
  const activePlayIndex = filteredPlays.findIndex((p) => p.PlayID === selectedPlayId);
  const currentPlayIndexNumber = activePlayIndex >= 0 ? activePlayIndex + 1 : 1;

  // Auto-step through play sequence
  useEffect(() => {
    if (!isAutoPlaying || filteredPlays.length === 0) return;

    const intervalTime = Math.max(2000, 4500 / autoSpeed);
    const timer = setInterval(() => {
      setSelectedPlayId((currentId) => {
        const currentIndex = filteredPlays.findIndex((p) => p.PlayID === currentId);
        const nextIndex = (currentIndex + 1) % filteredPlays.length;
        return filteredPlays[nextIndex].PlayID;
      });
      setSelectedNodeId(null);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, autoSpeed, filteredPlays]);

  // Keyboard navigation for step back and step forward (Left / Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredPlays, selectedPlayId]);

  const handlePrevPlay = () => {
    const currentIndex = filteredPlays.findIndex((p) => p.PlayID === selectedPlayId);
    const prevIndex = (currentIndex - 1 + filteredPlays.length) % filteredPlays.length;
    setSelectedPlayId(filteredPlays[prevIndex].PlayID);
    setSelectedNodeId(null);
  };

  const handleNextPlay = () => {
    const currentIndex = filteredPlays.findIndex((p) => p.PlayID === selectedPlayId);
    const nextIndex = (currentIndex + 1) % filteredPlays.length;
    setSelectedPlayId(filteredPlays[nextIndex].PlayID);
    setSelectedNodeId(null);
  };

  const visibleGames = gamesForSeason.filter((g) => {
    if (gameStatusFilter === 'LIVE') return g.Status === 'InProgress';
    if (gameStatusFilter === 'FINAL') return g.Status === 'Final';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Game Switcher */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 border border-emerald-500/20 font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Gridiron Tactical Visualizer &bull; Play-By-Play for Every Game
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide font-serif italic flex items-center gap-2">
              <span>🏈 Gridiron Tactical Visualizer &amp; Live Play Engine</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Visualizing: <strong className="text-white">{activeGame.AwayTeam} @ {activeGame.HomeTeam}</strong>
              <span className="ml-2 text-slate-500">&bull; {activeGame.StadiumName}</span>
              <span className="ml-2 text-amber-400 font-bold">&bull; {activeGame.Status === 'InProgress' ? '🔴 LIVE IN PROGRESS' : activeGame.Status === 'Final' ? '🏁 FINAL GAME' : '📅 SCHEDULED'}</span>
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Season Picker */}
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

            {/* Export Coaching Package Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Plays</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#18181c] border border-white/10 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <button
                    onClick={() => {
                      exportPlayAnimationsAsHtml(filteredPlays, `${activeGame.AwayTeam} vs ${activeGame.HomeTeam}`);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 font-bold flex items-center gap-2"
                  >
                    <FileCode className="w-4 h-4 text-emerald-400" /> HTML Interactive Theater
                  </button>
                  <button
                    onClick={() => {
                      exportPlayAnimationsAsJson(filteredPlays, `${activeGame.AwayTeam} vs ${activeGame.HomeTeam}`);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 font-bold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-amber-400" /> Raw JSON Playbook
                  </button>
                  <button
                    onClick={() => {
                      exportCoachingReport(filteredPlays, `${activeGame.AwayTeam} vs ${activeGame.HomeTeam}`);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-200 hover:bg-white/10 font-bold flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-sky-400" /> Coaching Summary Markdown
                  </button>
                </div>
              )}
            </div>

            {/* Film Room Full-Screen Button */}
            <button
              onClick={() => setIsFilmRoomModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/20"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Full Film Theater</span>
            </button>
          </div>
        </div>

        {/* Game Selector Chip Row (Gridiron Tactical Visualizer for EVERY game) */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-amber-500" /> Select Matchup:
              </span>
              {/* Game status filter */}
              <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                <button
                  onClick={() => setGameStatusFilter('ALL')}
                  className={`px-2 py-0.5 rounded ${gameStatusFilter === 'ALL' ? 'bg-white/20 text-white font-bold' : 'text-slate-400'}`}
                >
                  All ({gamesForSeason.length})
                </button>
                <button
                  onClick={() => setGameStatusFilter('LIVE')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 ${gameStatusFilter === 'LIVE' ? 'bg-rose-500/30 text-rose-300 font-bold' : 'text-slate-400'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> Live
                </button>
                <button
                  onClick={() => setGameStatusFilter('FINAL')}
                  className={`px-2 py-0.5 rounded ${gameStatusFilter === 'FINAL' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-400'}`}
                >
                  Finals
                </button>
              </div>
            </div>

            <span className="text-xs text-amber-400 font-mono">
              Loaded: {filteredPlays.length} Tactical Plays
            </span>
          </div>

          {/* Horizontal scrollable Game Cards */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {visibleGames.map((g) => {
              const isSelected = g.GameKey === selectedGameKey;
              const isLive = g.Status === 'InProgress';
              return (
                <button
                  key={g.GameKey}
                  onClick={() => handleSelectGame(g.GameKey)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2.5 shrink-0 transition-all border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                      : 'bg-[#09090b] text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="tracking-wide">
                    {g.AwayTeam} {g.AwayScore ?? 0} @ {g.HomeTeam} {g.HomeScore ?? 0}
                  </span>
                  {isLive ? (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${isSelected ? 'bg-slate-950 text-rose-400' : 'bg-rose-500/20 text-rose-300 animate-pulse'}`}>
                      🔴 {g.Quarter || 'LIVE'}
                    </span>
                  ) : g.Status === 'Final' ? (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${isSelected ? 'bg-slate-950 text-slate-200' : 'bg-slate-800 text-slate-400'}`}>
                      FINAL
                    </span>
                  ) : (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/5 text-slate-400">
                      UPCOMING
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TACTICAL VISUALIZER & PLAY REEL HERO COMPONENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: THE GRIDIRON TACTICAL CANVAS & REEL CONTROLS (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Play Animation Number & Situation Header */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-black text-xs border border-amber-500/30">
                PLAY ANIMATION #{currentPlayIndexNumber} OF {filteredPlays.length}
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-white">
                {activePlay.Down === 1 ? '1st' : activePlay.Down === 2 ? '2nd' : activePlay.Down === 3 ? '3rd' : '4th'} &amp; {activePlay.Distance} &bull; {activePlay.YardLineSide} {activePlay.YardLine}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="text-emerald-400 font-semibold">{activePlay.PlayType || 'Play Action'}</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-300">Q{activePlay.Quarter} ({activePlay.TimeRemaining})</span>
            </div>
          </div>

          {/* Play Animation Stepper Progress & Step Numbers Strip */}
          <div className="bg-[#0e0e11] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-md shadow-amber-500/20">
                  ANIMATION #{currentPlayIndexNumber}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Step {currentPlayIndexNumber} of {filteredPlays.length} in Sequence
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-400/90 font-semibold hidden sm:inline-block">
                {activePlay.Down === 1 ? '1st' : activePlay.Down === 2 ? '2nd' : activePlay.Down === 3 ? '3rd' : '4th'} &amp; {activePlay.Distance} &bull; {activePlay.YardLineSide} {activePlay.YardLine}
              </span>
            </div>

            {/* Micro Stepper Pills for Sequence Progress */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {filteredPlays.map((p, idx) => {
                const stepNum = idx + 1;
                const isCurrent = idx === activePlayIndex;
                const isPast = idx < activePlayIndex;

                return (
                  <button
                    key={p.PlayID}
                    onClick={() => {
                      setSelectedPlayId(p.PlayID);
                      setSelectedNodeId(null);
                    }}
                    title={`Animation Step #${stepNum}: Q${p.Quarter} ${p.TimeRemaining}`}
                    className={`shrink-0 px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/30'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-[#18181b] text-slate-400 hover:text-white border border-white/10 hover:border-white/25'
                    }`}
                  >
                    <span className="opacity-70">#</span>
                    <span>{stepNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Control Ribbon */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Prev & Next Step Buttons */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  onClick={handlePrevPlay}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1 transition font-mono"
                  title="Step Backward (Left Arrow ◄)"
                >
                  <SkipBack className="w-3.5 h-3.5 text-amber-400" />
                  <span>⏮️ Prev</span>
                </button>
                <button
                  onClick={handleNextPlay}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1 transition font-mono"
                  title="Step Forward (Right Arrow ►)"
                >
                  <span>Next ⏭️</span>
                  <SkipForward className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>

              {/* Auto Play Reel */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition shadow-sm ${
                  isAutoPlaying
                    ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoPlaying ? '⏸️ Pause' : '▶️ Auto Reel'}</span>
              </button>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-white/10 text-[10px] font-mono text-slate-400">
                <span>⚡ Speed:</span>
                {[1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setAutoSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded font-bold transition ${
                      autoSpeed === spd
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Route Animation Toggle & Quarter Segmented Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRoutesAnimating}
                  onChange={(e) => setIsRoutesAnimating(e.target.checked)}
                  className="rounded border-white/20 bg-black/60 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> 📐 Routes
                </span>
              </label>

              {/* Quarter Filter Chips */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
                {[
                  { id: 'ALL', label: '🌐 All' },
                  { id: 1, label: '1️⃣ Q1' },
                  { id: 2, label: '2️⃣ Q2' },
                  { id: 3, label: '3️⃣ Q3' },
                  { id: 4, label: '4️⃣ Q4' }
                ].map((q) => (
                  <button
                    key={String(q.id)}
                    onClick={() => setSelectedQuarter(q.id as any)}
                    className={`px-2 py-0.5 rounded font-bold transition ${
                      selectedQuarter === q.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* THE GRIDIRON TACTICAL CANVAS CHALKBOARD */}
          <div className="relative">
            <GridironTacticalCanvas
              playConcept={activePlayConcept}
              playEvent={activePlay}
              stepNumber={currentPlayIndexNumber}
              totalSteps={filteredPlays.length}
              isAnimating={isRoutesAnimating}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </div>

          {/* ACTIVE PLAY TELEMETRY BAR */}
          <div className="bg-[#09090b] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Q{activePlay.Quarter} &bull; {activePlay.TimeRemaining}
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {activePlay.Down === 1 ? '1st' : activePlay.Down === 2 ? '2nd' : activePlay.Down === 3 ? '3rd' : '4th'} &amp; {activePlay.Distance} at {activePlay.YardLineSide} {activePlay.YardLine}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">
                  EPA: <strong className={activePlay.epa && activePlay.epa > 0 ? 'text-emerald-400' : 'text-rose-400'}>{activePlay.epa ? `${activePlay.epa > 0 ? '+' : ''}${activePlay.epa}` : '0.00'}</strong>
                </span>
                <span className="text-slate-400">
                  Win Prob: <strong className="text-amber-400">{activePlay.WinProbabilityPct}%</strong>
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              {activePlay.Description}
            </p>

            {/* Scheme & Coverage Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151518] text-amber-300 border border-amber-500/20">
                📐 Concept: <strong>{activePlay.playConceptName || activePlayConcept.name}</strong>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151518] text-sky-300 border border-sky-500/20">
                🛡️ Coverage: <strong>{activePlay.defensiveCoverage || activePlayConcept.defensiveCoverage}</strong>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151518] text-emerald-300 border border-emerald-500/20">
                👥 Personnel: <strong>{activePlay.formation || activePlayConcept.personnel}</strong>
              </span>
            </div>
          </div>

          {/* Dynamic Win Probability Shift Line Chart */}
          <div className="mt-4">
            <WinProbabilityChart
              gameKey={activeGame.GameKey}
              homeTeam={{ abbreviation: activeGame.HomeTeam, name: activeGame.HomeTeam, score: activeGame.HomeScore || 0 }}
              awayTeam={{ abbreviation: activeGame.AwayTeam, name: activeGame.AwayTeam, score: activeGame.AwayScore || 0 }}
              status={activeGame.Status}
              plays={gamePlays}
              pointSpread={activeGame.PointSpread}
              onSelectPlay={(playId) => {
                setSelectedPlayId(playId);
                setSelectedNodeId(null);
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: DRIVE PLAY-BY-PLAY FEED & ADVANCED STATS (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Drive Play Selector Feed */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col h-[560px]">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                <Radio className="w-3.5 h-3.5 text-amber-500" /> Full Play Log ({filteredPlays.length})
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Click play to diagram</span>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 py-3 pr-1">
              {filteredPlays.map((p, idx) => {
                const isSelected = p.PlayID === selectedPlayId;
                const isBigPlay = p.IsBigPlay || p.YardsGained >= 20;

                return (
                  <div
                    key={p.PlayID}
                    onClick={() => {
                      setSelectedPlayId(p.PlayID);
                      setSelectedNodeId(null);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                        : 'bg-[#09090b] border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded font-black text-[9.5px] ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-white/10 text-amber-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-amber-400">
                          Q{p.Quarter} {p.TimeRemaining} &bull; {p.Possession}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isBigPlay && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold font-mono text-[9px]">
                            BIG PLAY
                          </span>
                        )}
                        <span className="text-slate-400 font-bold">
                          {p.YardsGained > 0 ? `+${p.YardsGained}` : p.YardsGained} yds
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-[11px] leading-snug">
                      {p.Description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] font-mono text-slate-400">
                      <span>{p.Down === 1 ? '1st' : p.Down === 2 ? '2nd' : p.Down === 3 ? '3rd' : '4th'} &amp; {p.Distance}</span>
                      <span className="text-emerald-400 font-bold">{p.playConceptName ? p.playConceptName.slice(0, 22) : 'Tactical Scheme'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FULL FILM ROOM MODAL */}
      {isFilmRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#09090b]">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-extrabold text-white">
                  Tactical Film Room &bull; {activeGame.AwayTeam} @ {activeGame.HomeTeam}
                </h3>
              </div>
              <button
                onClick={() => setIsFilmRoomModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <GridironTacticalCanvas
                playConcept={activePlayConcept}
                isAnimating={true}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                zoom={1.1}
              />
              <div className="bg-[#09090b] p-4 rounded-xl border border-white/10 text-sm text-white">
                <strong>Play Telemetry:</strong> {activePlay.Description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
