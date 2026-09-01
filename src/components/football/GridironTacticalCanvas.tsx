import React, { useState, useEffect } from 'react';
import { FootballPlayConcept, FootballPlayerNode, PlayByPlayEvent } from '../../types';
import { Play, Pause, RotateCcw, Target, Shield, Zap, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface GridironTacticalCanvasProps {
  playConcept: FootballPlayConcept;
  playEvent?: PlayByPlayEvent | null;
  stepNumber?: number | null;
  totalSteps?: number | null;
  isAnimating?: boolean;
  onToggleAnimate?: () => void;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  showControls?: boolean;
  showCoachingNotes?: boolean;
  showPlayMetadata?: boolean;
  aspectRatioClass?: string;
  teamHome?: string;
  teamAway?: string;
  animationSpeed?: number;
}

export const GridironTacticalCanvas: React.FC<GridironTacticalCanvasProps> = ({
  playConcept,
  playEvent,
  stepNumber = null,
  totalSteps = null,
  isAnimating = true,
  onToggleAnimate,
  selectedNodeId = null,
  onSelectNode,
  showControls = true,
  showCoachingNotes = true,
  showPlayMetadata = true,
  aspectRatioClass = 'aspect-[16/9] min-h-[360px] sm:min-h-[460px]',
  teamHome = 'KC',
  teamAway = 'BAL',
  animationSpeed = 1
}) => {
  const [internalSelectedNode, setInternalSelectedNode] = useState<string | null>(selectedNodeId);
  const [ballProgress, setBallProgress] = useState<number>(0);
  const [internalAnimating, setInternalAnimating] = useState<boolean>(isAnimating);

  const activeNodeId = selectedNodeId !== undefined ? selectedNodeId : internalSelectedNode;
  const activeAnimating = isAnimating !== undefined ? isAnimating : internalAnimating;

  const handleSelectNode = (id: string | null) => {
    if (onSelectNode) {
      onSelectNode(id);
    } else {
      setInternalSelectedNode(id);
    }
  };

  const handleToggleAnimate = () => {
    if (onToggleAnimate) {
      onToggleAnimate();
    } else {
      setInternalAnimating(!internalAnimating);
    }
  };

  // Ball flight / route animation tick
  useEffect(() => {
    if (!activeAnimating) return;
    const interval = setInterval(() => {
      setBallProgress((prev) => (prev >= 1 ? 0 : prev + 0.04 * animationSpeed));
    }, 50);
    return () => clearInterval(interval);
  }, [activeAnimating, animationSpeed]);

  // Compute primary target node or ball carrier
  const primaryTargetNode =
    playConcept.offensiveNodes.find((n) => n.passTarget) ||
    playConcept.offensiveNodes.find((n) => n.role === 'WR' || n.role === 'TE' || n.role === 'RB') ||
    playConcept.offensiveNodes[0];

  const qbNode = playConcept.offensiveNodes.find((n) => n.role === 'QB') || playConcept.offensiveNodes[0];

  // Calculate ball coordinates along trajectory
  const getBallPosition = () => {
    if (!qbNode || !primaryTargetNode || !primaryTargetNode.routePath || primaryTargetNode.routePath.length === 0) {
      return { x: playConcept.losYard, y: 26.6 };
    }
    const startX = qbNode.startX;
    const startY = qbNode.startY;
    const endPoint = primaryTargetNode.routePath[primaryTargetNode.routePath.length - 1];
    const endX = endPoint.x;
    const endY = endPoint.y;

    return {
      x: startX + (endX - startX) * ballProgress,
      y: startY + (endY - startY) * ballProgress
    };
  };

  const ballPos = getBallPosition();
  const activeNode = [...playConcept.offensiveNodes, ...playConcept.defensiveNodes].find(
    (n) => n.id === activeNodeId
  );

  const yardsGained = playEvent?.YardsGained ?? (playConcept.firstDownYard - playConcept.losYard);
  const forwardProgressYard = Math.min(90, Math.max(10, playConcept.losYard + yardsGained));

  return (
    <div className="bg-[#0b130e] border-2 border-emerald-600/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col space-y-4">
      {/* Visualizer Top Bar & Tactical Metadata */}
      {showPlayMetadata && (
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
              {playConcept.emoji || '🏈'}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {stepNumber !== null && stepNumber !== undefined && (
                  <span className="text-[10.5px] uppercase font-mono font-black px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
                    <span>STEP #{stepNumber}</span>
                    {totalSteps ? <span className="opacity-75 font-medium">OF {totalSteps}</span> : null}
                  </span>
                )}
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {playEvent ? `Q${playEvent.Quarter} • ${playEvent.TimeRemaining}` : 'Tactical Chalkboard'}
                </span>
                {playEvent?.IsBigPlay && (
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Big Play ({playEvent.YardsGained} yds)
                  </span>
                )}
                {playEvent?.PlayType && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {playEvent.PlayType}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide truncate mt-0.5">
                {playConcept.name.replace(/&bull;/g, '•')}
              </h3>
              <p className="text-xs text-emerald-400/90 font-mono truncate">
                {playConcept.formation} &bull; {playConcept.personnel} &bull; <span className="text-rose-400">vs {playConcept.defensiveCoverage}</span>
              </p>
            </div>
          </div>

          {/* Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {playEvent && (
              <>
                <div className="bg-black/50 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-mono">
                  <span className="text-slate-400">Down: </span>
                  <strong className="text-white font-bold">{playEvent.Down} & {playEvent.Distance}</strong>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                  playEvent.YardsGained >= 15 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-black/50 border-emerald-500/30 text-white'
                }`}>
                  <span className="text-slate-400">Gain: </span>
                  <strong>+{playEvent.YardsGained} YDS</strong>
                </div>
                {playEvent.epa !== undefined && (
                  <div className="bg-black/50 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-mono">
                    <span className="text-slate-400">EPA: </span>
                    <strong className={playEvent.epa >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {playEvent.epa >= 0 ? `+${playEvent.epa.toFixed(2)}` : playEvent.epa.toFixed(2)}
                    </strong>
                  </div>
                )}
                <div className="bg-black/50 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-mono">
                  <span className="text-slate-400">Win Prob: </span>
                  <strong className="text-amber-400">{Math.round(playEvent.WinProbabilityPct)}%</strong>
                </div>
              </>
            )}

            {showControls && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  onClick={handleToggleAnimate}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    activeAnimating
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                  title={activeAnimating ? 'Pause Route Animation' : 'Start Route Animation'}
                  aria-label={activeAnimating ? 'Pause Route Animation' : 'Start Route Animation'}
                >
                  {activeAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{activeAnimating ? 'Routes Live' : 'Play Routes'}</span>
                </button>
                <button
                  onClick={() => {
                    handleSelectNode(null);
                    setBallProgress(0);
                  }}
                  className="p-1.5 rounded-lg bg-black/50 border border-white/10 text-slate-400 hover:text-white"
                  title="Reset Ball & Selection"
                  aria-label="Reset Ball & Selection"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SVG Interactive Turf Field */}
      <div className={`w-full ${aspectRatioClass} bg-[#164326] relative rounded-xl border border-emerald-500/40 overflow-hidden shadow-inner select-none`}>
        <svg className="w-full h-full" viewBox="0 0 100 53.3" preserveAspectRatio="none">
          <defs>
            {/* Endzones */}
            <linearGradient id="ezLeftGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#172554" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="ezRightGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#991b1b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.95" />
            </linearGradient>
            <pattern id="turfStripes" width="10" height="53.3" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="5" height="53.3" fill="#153e24" />
              <rect x="5" y="0" width="5" height="53.3" fill="#194c2c" />
            </pattern>
            {/* Route Glow Filter */}
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.45" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="ballGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Alternating 5-Yard Turf Background */}
          <rect x="0" y="0" width="100" height="53.3" fill="url(#turfStripes)" />

          {/* Left Endzone (0 - 10) */}
          <rect x="0" y="0" width="10" height="53.3" fill="url(#ezLeftGrad)" />
          <text
            x="5"
            y="27"
            fill="#ffffff"
            fillOpacity="0.35"
            fontSize="4.5"
            fontWeight="900"
            textAnchor="middle"
            transform="rotate(-90 5 27)"
            letterSpacing="2"
          >
            {teamHome || 'CHIEFS'}
          </text>

          {/* Right Endzone (90 - 100) */}
          <rect x="90" y="0" width="10" height="53.3" fill="url(#ezRightGrad)" />
          <text
            x="95"
            y="27"
            fill="#ffffff"
            fillOpacity="0.35"
            fontSize="4.5"
            fontWeight="900"
            textAnchor="middle"
            transform="rotate(90 95 27)"
            letterSpacing="2"
          >
            {teamAway || 'RAVENS'}
          </text>

          {/* 5-Yard & 10-Yard Yard Lines */}
          {[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90].map((x) => (
            <g key={`line-${x}`}>
              <line
                x1={x}
                y1="0"
                x2={x}
                y2="53.3"
                stroke="#ffffff"
                strokeWidth={x % 10 === 0 ? '0.35' : '0.15'}
                strokeOpacity={x % 10 === 0 ? '0.6' : '0.25'}
              />
              {x % 10 === 0 && x >= 20 && x <= 80 && (
                <>
                  <text
                    x={x}
                    y="6"
                    fill="#ffffff"
                    fillOpacity="0.45"
                    fontSize="2.4"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {x <= 50 ? x - 10 : 90 - x}
                  </text>
                  <text
                    x={x}
                    y="49.5"
                    fill="#ffffff"
                    fillOpacity="0.45"
                    fontSize="2.4"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {x <= 50 ? x - 10 : 90 - x}
                  </text>
                </>
              )}
            </g>
          ))}

          {/* Hashes */}
          {Array.from({ length: 81 }, (_, i) => 10 + i).map((x) => (
            <g key={`hash-${x}`}>
              <line x1={x} y1="0.5" x2={x} y2="1.5" stroke="#ffffff" strokeWidth="0.12" strokeOpacity="0.35" />
              <line x1={x} y1="21.5" x2={x} y2="22.5" stroke="#ffffff" strokeWidth="0.12" strokeOpacity="0.35" />
              <line x1={x} y1="30.8" x2={x} y2="31.8" stroke="#ffffff" strokeWidth="0.12" strokeOpacity="0.35" />
              <line x1={x} y1="51.8" x2={x} y2="52.8" stroke="#ffffff" strokeWidth="0.12" strokeOpacity="0.35" />
            </g>
          ))}

          {/* 50-Yard Center Field Logo */}
          <circle cx="50" cy="26.65" r="4" fill="#000000" fillOpacity="0.25" stroke="#ffffff" strokeWidth="0.2" strokeOpacity="0.4" />
          <text x="50" y="27.6" fill="#f59e0b" fontSize="3" textAnchor="middle" fontWeight="bold">🏈</text>

          {/* Forward Progress / Yardage Gained Highlight Box */}
          {yardsGained > 0 && (
            <rect
              x={Math.min(playConcept.losYard, forwardProgressYard)}
              y="2"
              width={Math.abs(forwardProgressYard - playConcept.losYard)}
              height="49.3"
              fill={yardsGained >= 15 ? '#f59e0b' : '#10b981'}
              fillOpacity="0.15"
              stroke={yardsGained >= 15 ? '#f59e0b' : '#10b981'}
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />
          )}

          {/* Line of Scrimmage (Blue) */}
          <line
            x1={playConcept.losYard}
            y1="0"
            x2={playConcept.losYard}
            y2="53.3"
            stroke="#38bdf8"
            strokeWidth="0.5"
            strokeDasharray="1.5 0.8"
          />
          <rect x={playConcept.losYard - 4.5} y="1" width="9" height="2.2" rx="0.5" fill="#0284c7" fillOpacity="0.85" />
          <text x={playConcept.losYard} y="2.6" fill="#ffffff" fontSize="1.2" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            SCRIMMAGE
          </text>

          {/* Line to Gain / 1st Down (Yellow) */}
          <line
            x1={playConcept.firstDownYard}
            y1="0"
            x2={playConcept.firstDownYard}
            y2="53.3"
            stroke="#eab308"
            strokeWidth="0.55"
          />
          <rect x={playConcept.firstDownYard - 4.5} y="50" width="9" height="2.2" rx="0.5" fill="#ca8a04" fillOpacity="0.9" />
          <text x={playConcept.firstDownYard} y="51.6" fill="#000000" fontSize="1.2" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            1ST DOWN
          </text>

          {/* Animated Offensive Play Routes */}
          {playConcept.offensiveNodes.map((node) => {
            if (!node.routePath || node.routePath.length === 0) return null;

            const isSelected = activeNodeId === node.id;
            let pathD = `M ${node.startX} ${node.startY}`;
            node.routePath.forEach((pt) => {
              pathD += ` L ${pt.x} ${pt.y}`;
            });

            return (
              <g key={`route-${node.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={node.passTarget ? '#f59e0b' : '#38bdf8'}
                  strokeWidth={isSelected ? '1.0' : node.passTarget ? '0.7' : '0.5'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={activeAnimating ? '2 1' : 'none'}
                  className={activeAnimating ? 'animate-pulse' : ''}
                  filter="url(#glowFilter)"
                />

                {/* Route Arrow Tip */}
                {node.routePath.length > 0 && (
                  <circle
                    cx={node.routePath[node.routePath.length - 1].x}
                    cy={node.routePath[node.routePath.length - 1].y}
                    r={isSelected ? '1.2' : '0.8'}
                    fill={node.passTarget ? '#fbbf24' : '#60a5fa'}
                    stroke="#ffffff"
                    strokeWidth="0.2"
                  />
                )}
              </g>
            );
          })}

          {/* Animated Football Trajectory */}
          {activeAnimating && (
            <g transform={`translate(${ballPos.x}, ${ballPos.y})`} filter="url(#ballGlow)">
              <circle r="1.4" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.3" />
              <text x="0" y="0.4" fontSize="1.2" textAnchor="middle">🏈</text>
            </g>
          )}

          {/* Offensive Players (Circles) */}
          {playConcept.offensiveNodes.map((node) => {
            const isSelected = activeNodeId === node.id;
            return (
              <g
                key={`off-${node.id}`}
                onClick={() => handleSelectNode(node.id)}
                className="cursor-pointer group"
              >
                <circle
                  cx={node.startX}
                  cy={node.startY}
                  r={isSelected ? '1.8' : '1.4'}
                  fill={node.role === 'QB' ? '#f59e0b' : node.passTarget ? '#3b82f6' : '#1e40af'}
                  stroke={isSelected ? '#ffffff' : '#93c5fd'}
                  strokeWidth={isSelected ? '0.5' : '0.2'}
                />
                <text
                  x={node.startX}
                  y={node.startY + 0.45}
                  fill="#ffffff"
                  fontSize={node.role === 'OL' ? '0.85' : '1.0'}
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {node.label.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Defensive Players (Crimson Circles) */}
          {playConcept.defensiveNodes.map((node) => {
            const isSelected = activeNodeId === node.id;
            return (
              <g
                key={`def-${node.id}`}
                onClick={() => handleSelectNode(node.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={node.startX}
                  cy={node.startY}
                  r={isSelected ? '1.8' : '1.35'}
                  fill={isSelected ? '#dc2626' : '#991b1b'}
                  stroke={isSelected ? '#ffffff' : '#fca5a5'}
                  strokeWidth={isSelected ? '0.5' : '0.2'}
                />
                <text
                  x={node.startX}
                  y={node.startY + 0.45}
                  fill="#ffffff"
                  fontSize="0.9"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {node.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Legend */}
        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-slate-300 flex items-center gap-3 font-mono flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-300"></span>
            <span>Target / QB</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-blue-400"></span>
            <span>Offense Route</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-rose-400"></span>
            <span>Defense Shell</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-yellow-400"></span>
            <span>Line to Gain</span>
          </div>
        </div>
      </div>

      {/* Selected Node Details or Coaching Progression */}
      {showCoachingNotes && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Selected Assignment */}
          <div className="bg-[#09090b] p-3 rounded-xl border border-white/10">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-500" />
              {activeNode ? `${activeNode.label} Assignment` : 'Target Player Focus'}
            </h4>
            {activeNode ? (
              <div className="space-y-1">
                <p className="text-white font-bold">{activeNode.label} ({activeNode.position})</p>
                <p className="text-emerald-400 font-mono text-[11px]">{activeNode.actionText || 'Standard alignment assignment'}</p>
                {activeNode.passTarget && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                    Primary Pass Target
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-white font-bold">{primaryTargetNode.label} ({primaryTargetNode.position})</p>
                <p className="text-emerald-400 font-mono text-[11px]">{primaryTargetNode.actionText || 'Primary Progression Route'}</p>
                <p className="text-[10px] text-slate-400 italic">Click any player circle to inspect individual assignment.</p>
              </div>
            )}
          </div>

          {/* Progression Sequence */}
          <div className="bg-[#09090b] p-3 rounded-xl border border-white/10">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> QB Read Progression
            </h4>
            <div className="space-y-1 font-mono text-[11px] text-slate-300">
              {playConcept.progression && playConcept.progression.length > 0 ? (
                playConcept.progression.slice(0, 3).map((step, idx) => (
                  <div key={idx} className="truncate">
                    <span className="text-amber-500 font-bold">{idx + 1}.</span> {step.replace(/^\d+\.\s*/, '')}
                  </div>
                ))
              ) : (
                <p className="text-slate-400">1. Primary receiver on rhythm &bull; 2. Underneath checkdown</p>
              )}
            </div>
          </div>

          {/* Coaching Keys & Coverage Beater */}
          <div className="bg-[#09090b] p-3 rounded-xl border border-white/10">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Scheme Notes & Keys
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
              {playConcept.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
