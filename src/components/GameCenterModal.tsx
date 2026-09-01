import React, { useState, useEffect } from 'react';
import { PlayByPlayEvent, SeasonCode, GameSchedule } from '../types';
import { PLAY_BY_PLAY_EVENTS, SCHEDULES_DATA, PLAYERS_DATA } from '../data/sportsDataMock';
import { getPlaysForGame } from '../data/gamePlaysData';
import { getPlayTacticalConcept } from '../data/footballDiagramsData';
import { GridironTacticalCanvas } from './football/GridironTacticalCanvas';
import { exportPlayAnimationsAsHtml, exportPlayAnimationsAsJson, exportCoachingReport } from '../utils/playAnimationsExporter';
import { LivePossessionRedZoneStats } from './LivePossessionRedZoneStats';
import { BettingOddsWidget } from './BettingOddsWidget';
import { LiveScoreboardGame } from './LiveScoreboard';
import { D3WinProbabilityChart } from './football/D3WinProbabilityChart';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Download,
  Film,
  Zap,
  Activity,
  Layers,
  BarChart2,
  TrendingUp,
  Shield,
  Clock,
  Radio,
  Share2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

interface GameCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameKey?: string;
  onNavigateToPlayByPlay?: () => void;
  selectedSeason?: SeasonCode;
}

export const GameCenterModal: React.FC<GameCenterModalProps> = ({
  isOpen,
  onClose,
  gameKey = '202610101',
  onNavigateToPlayByPlay,
  selectedSeason = '2026REG'
}) => {
  const [activeTab, setActiveTab] = useState<'pbp' | 'possession_redzone' | 'stats' | 'momentum' | 'all_animations' | 'betting_odds'>('pbp');
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'ALL'>('ALL');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1);
  const [isRoutesAnimating, setIsRoutesAnimating] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFilmRoomPlaying, setIsFilmRoomPlaying] = useState<boolean>(true);

  // Find game schedule info
  const game = SCHEDULES_DATA.find((g) => g.GameKey === gameKey) || SCHEDULES_DATA[0];

  // Dynamic plays for this game (Live, Finals, or Scheduled)
  const allGamePlays = getPlaysForGame(game.GameKey, game.AwayTeam, game.HomeTeam, game.Status);

  const filteredPlays = allGamePlays.filter((p) => {
    if (selectedQuarter !== 'ALL' && p.Quarter !== selectedQuarter) return false;
    return true;
  });

  const [selectedPlayId, setSelectedPlayId] = useState<number>(filteredPlays[0]?.PlayID || 5001);

  // Sync play ID if game changes
  useEffect(() => {
    if (filteredPlays.length > 0) {
      setSelectedPlayId(filteredPlays[0].PlayID);
    }
  }, [gameKey, selectedQuarter]);

  const activePlay = filteredPlays.find((p) => p.PlayID === selectedPlayId) || filteredPlays[0] || allGamePlays[0];
  const activePlayConcept = getPlayTacticalConcept(activePlay);

  // Auto reel player
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

  // Keyboard navigation for step back and step forward
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPlay();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredPlays, selectedPlayId]);

  if (!isOpen) return null;

  const handleNextPlay = () => {
    const currentIndex = filteredPlays.findIndex((p) => p.PlayID === selectedPlayId);
    const nextIndex = (currentIndex + 1) % filteredPlays.length;
    setSelectedPlayId(filteredPlays[nextIndex].PlayID);
    setSelectedNodeId(null);
  };

  const handlePrevPlay = () => {
    const currentIndex = filteredPlays.findIndex((p) => p.PlayID === selectedPlayId);
    const prevIndex = currentIndex <= 0 ? filteredPlays.length - 1 : currentIndex - 1;
    setSelectedPlayId(filteredPlays[prevIndex].PlayID);
    setSelectedNodeId(null);
  };

  // Mock Box Score Stats for this matchup (Chiefs vs Ravens)
  const passingStats = [
    { team: 'KC', player: 'Patrick Mahomes', compAtt: '20/28', yds: 291, td: 2, int: 1, rate: 112.5, epa: '+8.4' },
    { team: 'BAL', player: 'Lamar Jackson', compAtt: '26/41', yds: 273, td: 1, int: 0, rate: 90.8, epa: '+6.1' }
  ];

  const rushingStats = [
    { team: 'KC', player: 'Isiah Pacheco', att: 15, yds: 45, avg: '3.0', td: 1, long: 12 },
    { team: 'BAL', player: 'Lamar Jackson', att: 16, yds: 122, avg: '7.6', td: 0, long: 21 },
    { team: 'BAL', player: 'Derrick Henry', att: 13, yds: 46, avg: '3.5', td: 1, long: 13 }
  ];

  const receivingStats = [
    { team: 'KC', player: 'Rashee Rice', rec: 7, tgt: 9, yds: 103, td: 0, yac: 54 },
    { team: 'KC', player: 'Xavier Worthy', rec: 2, tgt: 3, yds: 47, td: 1, yac: 35 },
    { team: 'KC', player: 'Travis Kelce', rec: 3, tgt: 4, yds: 34, td: 0, yac: 12 },
    { team: 'BAL', player: 'Isaiah Likely', rec: 9, tgt: 12, yds: 111, td: 1, yac: 48 },
    { team: 'BAL', player: 'Zay Flowers', rec: 6, tgt: 10, yds: 37, td: 0, yac: 19 }
  ];

  const teamComparison = [
    { stat: 'Total Net Yards', KC: 353, BAL: 452 },
    { stat: 'Passing Net Yards', KC: 281, BAL: 267 },
    { stat: 'Rushing Yards', KC: 72, BAL: 185 },
    { stat: 'First Downs', KC: 18, BAL: 25 },
    { stat: '3rd Down Efficiency', KC: 50, BAL: 43 },
    { stat: 'Time of Possession (mins)', KC: 26.5, BAL: 33.5 }
  ];

  const winProbTimeline = [
    { time: 'Q1 15:00', KC: 54, BAL: 46 },
    { time: 'Q1 13:30 (TD Worthy)', KC: 69, BAL: 31 },
    { time: 'Q2 11:20 (Henry Run)', KC: 56, BAL: 44 },
    { time: 'Q2 07:15 (Flowers 24y)', KC: 47, BAL: 53 },
    { time: 'Halftime (KC 13-10)', KC: 58, BAL: 42 },
    { time: 'Q3 05:12 (Kelce 28y)', KC: 74, BAL: 26 },
    { time: 'Q4 02:15 (Andrews 16y)', KC: 78, BAL: 22 },
    { time: 'Q4 00:05 (Incomplete Endzone)', KC: 99, BAL: 1 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-[#0e0e11] border border-white/15 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Header / Live Scoreboard Ribbon */}
        <div className="bg-[#141418] border-b border-white/10 p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">🏈</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                    LIVE SCOREBOARD &bull; GAME CENTER
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{game.Channel || 'NBC'} &bull; {game.StadiumName}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-wide flex items-center gap-2">
                    <span>{game.AwayTeam} {game.AwayScore ?? 24}</span>
                    <span className="text-slate-500 font-sans text-base">@</span>
                    <span>{game.HomeTeam} {game.HomeScore ?? 27}</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                    Q4 02:15
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons & Close */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Download All Play Animations Button */}
            <div className="relative group">
              <button
                onClick={() => exportPlayAnimationsAsHtml(filteredPlays, `${game.AwayTeam} vs ${game.HomeTeam}`, selectedSeason)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono flex items-center gap-1.5 transition shadow-sm"
                title="Download Standalone Animated Game Reel (Offline HTML)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download All Play Animations</span>
                <span className="sm:hidden">Download Reel</span>
              </button>
            </div>

            {onNavigateToPlayByPlay && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToPlayByPlay();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Full PBP Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-white/10 bg-[#0c0c0f] overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('pbp')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'pbp'
                ? 'border-amber-500 text-amber-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>🏈 Live Play-By-Play &amp; Field Animations</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              {filteredPlays.length} Plays
            </span>
          </button>

          <button
            onClick={() => setActiveTab('possession_redzone')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'possession_redzone'
                ? 'border-rose-500 text-rose-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>🔥 Live Possession &amp; Red Zone Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('all_animations')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'all_animations'
                ? 'border-emerald-500 text-emerald-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4 text-emerald-400" />
            <span>🎬 View All Play Animations in One</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              Theater Reel
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-sky-500 text-sky-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-sky-400" />
            <span>📊 Box Score &amp; Player Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('momentum')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'momentum'
                ? 'border-purple-500 text-purple-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>📈 Win Probability &amp; Momentum Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('betting_odds')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'betting_odds'
                ? 'border-amber-500 text-amber-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>🎲 Sportsbook Odds &amp; Spreads</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: PLAY-BY-PLAY WITH TACTICAL ANIMATIONS & STEPPER */}
          {activeTab === 'pbp' && (
            <div className="space-y-5">
              {/* Stepper Control Ribbon */}
              <div className="bg-[#141418] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Step Back & Forward */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={handlePrevPlay}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition"
                      title="Step Backward (Left Arrow ◄)"
                    >
                      <SkipBack className="w-3.5 h-3.5 text-amber-400" />
                      <span>Prev Play</span>
                    </button>
                    <button
                      onClick={handleNextPlay}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition"
                      title="Step Forward (Right Arrow ►)"
                    >
                      <span>Next Play</span>
                      <SkipForward className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>

                  {/* Auto Play Drive Reel */}
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                      isAutoPlaying
                        ? 'bg-amber-500 text-slate-950 font-extrabold animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                    }`}
                  >
                    {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoPlaying ? 'Reel Running' : 'Auto Play Reel'}</span>
                  </button>

                  {/* Speed Multiplier */}
                  <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-white/10 text-[10px] font-mono text-slate-400">
                    <span>Speed:</span>
                    {[1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setAutoSpeed(spd)}
                        className={`px-1.5 py-0.5 rounded ${
                          autoSpeed === spd ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Quarter Filter */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
                    {(['ALL', 1, 2, 3, 4] as const).map((q) => (
                      <button
                        key={String(q)}
                        onClick={() => setSelectedQuarter(q)}
                        className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[10px] transition ${
                          selectedQuarter === q
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {q === 'ALL' ? 'All' : `Q${q}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Play Counter & Keyboard Hint */}
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="hidden sm:inline text-[11px] text-slate-500">Keyboard: ◄ Left / Right ►</span>
                  <span className="bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                    Play <strong className="text-amber-400">{filteredPlays.findIndex((p) => p.PlayID === activePlay.PlayID) + 1}</strong> of <strong className="text-white">{filteredPlays.length}</strong>
                  </span>
                </div>
              </div>

              {/* Gridiron Tactical Canvas (Animation for the Play) */}
              <GridironTacticalCanvas
                playConcept={activePlayConcept}
                playEvent={activePlay}
                isAnimating={isRoutesAnimating}
                onToggleAnimate={() => setIsRoutesAnimating(!isRoutesAnimating)}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                teamHome={game.HomeTeam}
                teamAway={game.AwayTeam}
                showControls={true}
                showCoachingNotes={true}
                showPlayMetadata={true}
              />

              {/* Sequential Play Strip */}
              <div className="bg-[#141418] border border-white/10 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Layers className="w-3.5 h-3.5 text-amber-500" /> Drive Plays Sequence ({filteredPlays.length} Events)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Click card to jump to tactical animation</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {filteredPlays.map((p, idx) => {
                    const isSelected = p.PlayID === activePlay.PlayID;
                    return (
                      <button
                        key={p.PlayID}
                        onClick={() => {
                          setSelectedPlayId(p.PlayID);
                          setSelectedNodeId(null);
                        }}
                        className={`shrink-0 p-2.5 rounded-xl border text-left font-mono transition min-w-[155px] ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500'
                            : 'bg-[#09090b] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-white">#{idx + 1} Q{p.Quarter}</span>
                          <span className="text-amber-400">{p.TimeRemaining}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-white mb-0.5">
                          <span>{p.Possession} {p.Down}&{p.Distance}</span>
                          <span className={p.YardsGained >= 15 ? 'text-amber-400' : 'text-emerald-400'}>
                            +{p.YardsGained}y
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {p.playConceptName || p.PlayType}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: POSSESSION & RED ZONE TELEMETRY MATRIX */}
          {activeTab === 'possession_redzone' && (
            <div className="space-y-4">
              <LivePossessionRedZoneStats
                game={{
                  id: game.GameKey,
                  gameKey: game.GameKey,
                  name: `${game.AwayTeam} at ${game.HomeTeam}`,
                  shortName: `${game.AwayTeam} @ ${game.HomeTeam}`,
                  date: game.Date || '2026-09-10',
                  status: (game.Status as any) || 'InProgress',
                  statusDetail: `${game.Quarter} ${game.TimeRemaining}`,
                  quarter: typeof game.Quarter === 'number' ? `Q${game.Quarter}` : (game.Quarter || 'Q4'),
                  clock: game.TimeRemaining || '02:15',
                  venue: `${game.StadiumName}, ${game.StadiumCity}`,
                  broadcast: game.Channel || 'NBC',
                  possession: activePlay?.Possession || game.HomeTeam,
                  downDistance: `${activePlay?.Down || 1} & ${activePlay?.Distance || 10} at OPP 14`,
                  isRedZone: true,
                  awayTeam: {
                    name: game.AwayTeam,
                    abbreviation: game.AwayTeam,
                    score: game.AwayScore || 20,
                    record: '1-0',
                    color: '#241773'
                  },
                  homeTeam: {
                    name: game.HomeTeam,
                    abbreviation: game.HomeTeam,
                    score: game.HomeScore || 27,
                    record: '1-0',
                    color: '#E31837'
                  }
                }}
              />
            </div>
          )}

          {/* TAB 2: VIEW ALL PLAY ANIMATIONS IN ONE (THEATER REEL) */}
          {activeTab === 'all_animations' && (
            <div className="space-y-6">
              {/* Theater Mode Action Bar */}
              <div className="bg-[#141418] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-emerald-400" />
                    <span>Complete Game Tactical Animation Reel</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      All {filteredPlays.length} Plays
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review all play animations in one continuous film room or download the standalone interactive package.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => exportPlayAnimationsAsHtml(filteredPlays, `${game.AwayTeam} vs ${game.HomeTeam}`, selectedSeason)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Standalone HTML Reel</span>
                  </button>
                  <button
                    onClick={() => exportPlayAnimationsAsJson(filteredPlays, `${game.AwayTeam}_vs_${game.HomeTeam}_PBP`)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition"
                  >
                    <span>JSON Data</span>
                  </button>
                  <button
                    onClick={() => exportCoachingReport(filteredPlays, `${game.AwayTeam} vs ${game.HomeTeam}`)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition"
                  >
                    <span>Coaching Report</span>
                  </button>
                </div>
              </div>

              {/* Multi-Play Animation Grid / Filmstrip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPlays.map((p, idx) => {
                  const concept = getPlayTacticalConcept(p);
                  return (
                    <div
                      key={p.PlayID}
                      className="bg-[#0b130e] border border-emerald-500/30 rounded-2xl p-4 shadow-xl space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                              PLAY #{idx + 1} &bull; Q{p.Quarter} {p.TimeRemaining}
                            </span>
                            {p.IsBigPlay && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                ⚡ BIG PLAY
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1">{concept.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{p.Description}</p>
                        </div>
                        <div className="text-right font-mono">
                          <span className={`text-sm font-black ${p.YardsGained >= 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            +{p.YardsGained} YDS
                          </span>
                          <div className="text-[10px] text-slate-400">{p.Possession} {p.Down}&{p.Distance}</div>
                        </div>
                      </div>

                      {/* Tactical Mini-Canvas */}
                      <GridironTacticalCanvas
                        playConcept={concept}
                        playEvent={p}
                        isAnimating={true}
                        showControls={false}
                        showCoachingNotes={false}
                        showPlayMetadata={false}
                        aspectRatioClass="aspect-[16/9] min-h-[220px]"
                        teamHome={game.HomeTeam}
                        teamAway={game.AwayTeam}
                      />

                      {/* Key reads */}
                      <div className="text-[11px] text-emerald-400/90 font-mono bg-black/40 p-2 rounded-lg border border-emerald-500/20">
                        <strong>Formation:</strong> {concept.formation} &bull; <span className="text-rose-400">vs {concept.defensiveCoverage}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BOX SCORE & ALL STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Team Totals Comparison Matrix */}
              <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 shadow-xl">
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4 flex items-center gap-2 font-mono">
                  <BarChart2 className="w-4 h-4 text-sky-400" /> Team Stats Comparison ({game.AwayTeam} vs {game.HomeTeam})
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  {teamComparison.map((row) => (
                    <div key={row.stat} className="space-y-1">
                      <div className="flex justify-between items-center text-slate-300">
                        <strong className="text-white text-sm">{row.KC}</strong>
                        <span className="text-slate-400 text-xs uppercase tracking-wide">{row.stat}</span>
                        <strong className="text-white text-sm">{row.BAL}</strong>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${(row.KC / (row.KC + row.BAL)) * 100}%` }}
                        />
                        <div
                          className="bg-purple-600 h-full"
                          style={{ width: `${(row.BAL / (row.KC + row.BAL)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passing Leader Stats Table */}
              <div className="bg-[#141418] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-3.5 bg-[#09090b] border-b border-white/10 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase font-mono">🎯 Passing Leaders</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Comp/Att &bull; Yds &bull; TD &bull; INT &bull; Rating</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead className="bg-white/5 uppercase text-[10px] text-slate-500">
                      <tr>
                        <th className="py-2.5 px-4">Player</th>
                        <th className="py-2.5 px-3">Team</th>
                        <th className="py-2.5 px-3 text-right">C/ATT</th>
                        <th className="py-2.5 px-3 text-right">YDS</th>
                        <th className="py-2.5 px-3 text-right">TD</th>
                        <th className="py-2.5 px-3 text-right">INT</th>
                        <th className="py-2.5 px-3 text-right">RATE</th>
                        <th className="py-2.5 px-4 text-right">EPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {passingStats.map((p) => (
                        <tr key={p.player} className="hover:bg-white/5">
                          <td className="py-3 px-4 font-bold text-white">{p.player}</td>
                          <td className="py-3 px-3 text-amber-400 font-bold">{p.team}</td>
                          <td className="py-3 px-3 text-right">{p.compAtt}</td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-400">{p.yds}</td>
                          <td className="py-3 px-3 text-right font-bold text-white">{p.td}</td>
                          <td className="py-3 px-3 text-right text-slate-400">{p.int}</td>
                          <td className="py-3 px-3 text-right font-bold text-amber-400">{p.rate}</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">{p.epa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rushing & Receiving Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rushing Table */}
                <div className="bg-[#141418] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-3 bg-[#09090b] border-b border-white/10">
                    <h4 className="text-xs font-bold text-white uppercase font-mono">🏃 Rushing Yardage</h4>
                  </div>
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead className="bg-white/5 uppercase text-[10px] text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Player</th>
                        <th className="py-2 px-2 text-right">Att</th>
                        <th className="py-2 px-2 text-right">Yds</th>
                        <th className="py-2 px-2 text-right">Avg</th>
                        <th className="py-2 px-3 text-right">TD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rushingStats.map((r) => (
                        <tr key={r.player} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 font-bold text-white">{r.player}</td>
                          <td className="py-2.5 px-2 text-right">{r.att}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-emerald-400">{r.yds}</td>
                          <td className="py-2.5 px-2 text-right">{r.avg}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-amber-400">{r.td}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Receiving Table */}
                <div className="bg-[#141418] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-3 bg-[#09090b] border-b border-white/10">
                    <h4 className="text-xs font-bold text-white uppercase font-mono">🎯 Receiving Yardage</h4>
                  </div>
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead className="bg-white/5 uppercase text-[10px] text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Player</th>
                        <th className="py-2 px-2 text-right">Rec</th>
                        <th className="py-2 px-2 text-right">Tgt</th>
                        <th className="py-2 px-2 text-right">Yds</th>
                        <th className="py-2 px-3 text-right">TD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {receivingStats.map((rc) => (
                        <tr key={rc.player} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 font-bold text-white">{rc.player}</td>
                          <td className="py-2.5 px-2 text-right">{rc.rec}</td>
                          <td className="py-2.5 px-2 text-right">{rc.tgt}</td>
                          <td className="py-2.5 px-2 text-right font-bold text-emerald-400">{rc.yds}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-amber-400">{rc.td}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WIN PROBABILITY & MOMENTUM FLOW (D3 Interactive Area Chart) */}
          {activeTab === 'momentum' && (
            <div className="space-y-6">
              <D3WinProbabilityChart
                plays={allGamePlays}
                homeTeam={game.HomeTeam}
                awayTeam={game.AwayTeam}
                currentHomeScore={game.HomeScore || 0}
                currentAwayScore={game.AwayScore || 0}
                selectedPlayId={selectedPlayId}
                onSelectPlay={(playId) => {
                  setSelectedPlayId(playId);
                  setActiveTab('pbp');
                }}
                height={320}
              />
            </div>
          )}

          {/* TAB 5: BETTING ODDS & SPORTSBOOK SPREADS */}
          {activeTab === 'betting_odds' && (
            <div className="space-y-6">
              <BettingOddsWidget gameKey={game.GameKey} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
