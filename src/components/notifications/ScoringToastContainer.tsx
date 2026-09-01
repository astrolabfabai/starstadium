import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScoringDriveAlert } from '../../types';
import { useScoringNotifications } from '../../context/ScoringNotificationContext';
import {
  Trophy,
  X,
  ExternalLink,
  Sparkles,
  Flame,
  TrendingUp,
  Clock,
  Activity,
  Layers,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';

interface ScoringToastContainerProps {
  onSelectGame?: (gameKey: string) => void;
  onOpenAiWithPrompt?: (prompt: string, context?: any) => void;
}

const TOAST_DURATION_MS = 8500;

export const ScoringToastContainer: React.FC<ScoringToastContainerProps> = ({
  onSelectGame,
  onOpenAiWithPrompt
}) => {
  const { activeToasts, dismissToast, isSoundEnabled, setIsSoundEnabled, setIsNotificationCenterOpen } =
    useScoringNotifications();

  return (
    <div
      id="scoring-toast-container"
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-2 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((alert) => (
          <ScoringToastCard
            key={alert.id}
            alert={alert}
            onDismiss={() => dismissToast(alert.id)}
            onSelectGame={onSelectGame}
            onOpenAiWithPrompt={onOpenAiWithPrompt}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ScoringToastCardProps {
  alert: ScoringDriveAlert;
  onDismiss: () => void;
  onSelectGame?: (gameKey: string) => void;
  onOpenAiWithPrompt?: (prompt: string, context?: any) => void;
}

const ScoringToastCard: React.FC<ScoringToastCardProps> = ({
  alert,
  onDismiss,
  onSelectGame,
  onOpenAiWithPrompt
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // Auto-dismiss countdown timer using timestamp calculation
  useEffect(() => {
    if (isHovered) return;

    const startTime = Date.now();
    const duration = TOAST_DURATION_MS;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (elapsed >= duration) {
        clearInterval(timer);
        onDismissRef.current();
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isHovered]);

  const getScoreBadge = () => {
    switch (alert.scoreType) {
      case 'TOUCHDOWN':
        return {
          label: 'TOUCHDOWN',
          points: `+${alert.pointsAdded}`,
          bg: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950',
          border: 'border-amber-400/50',
          icon: <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
        };
      case 'PICK_SIX':
      case 'FUMBLE_RETURN_TD':
        return {
          label: 'DEFENSIVE TD',
          points: `+${alert.pointsAdded}`,
          bg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
          border: 'border-purple-400/50',
          icon: <Trophy className="w-3.5 h-3.5 text-white" />
        };
      case 'FIELD_GOAL':
        return {
          label: 'FIELD GOAL',
          points: `+${alert.pointsAdded}`,
          bg: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950',
          border: 'border-emerald-400/50',
          icon: <Activity className="w-3.5 h-3.5 text-slate-950" />
        };
      case 'SAFETY':
        return {
          label: 'SAFETY',
          points: `+${alert.pointsAdded}`,
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
          border: 'border-blue-400/50',
          icon: <Activity className="w-3.5 h-3.5 text-white" />
        };
      default:
        return {
          label: 'SCORING DRIVE',
          points: `+${alert.pointsAdded}`,
          bg: 'bg-amber-500 text-slate-950',
          border: 'border-amber-400',
          icon: <Trophy className="w-3.5 h-3.5" />
        };
    }
  };

  const badge = getScoreBadge();

  const handleViewGame = () => {
    if (onSelectGame) {
      onSelectGame(alert.gameKey);
    }
    onDismiss();
  };

  const handleAiBreakdown = () => {
    if (onOpenAiWithPrompt) {
      const prompt = `Analyze this scoring drive: ${alert.scoringTeamName} vs ${alert.opponentTeamName}. Scoring play: "${alert.scoringPlayer}". Drive summary: ${alert.drivePlays} plays, ${alert.driveYards} yards in ${alert.driveTimeOfPossession}. EPA gain: +${alert.epaGain ?? 3.5}, Win Prob Shift: +${alert.winProbShift ?? 15}%. Explain the tactical concept, red-zone execution, and key matchups.`;
      onOpenAiWithPrompt(prompt, { scoringDrive: alert });
    }
    onDismiss();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, y: -16, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pointer-events-auto rounded-2xl bg-[#121216]/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/80 overflow-hidden relative group"
      style={{
        borderLeftColor: alert.scoringTeamColor || '#f59e0b',
        borderLeftWidth: '4px'
      }}
    >
      {/* Top Header Row */}
      <div className="p-3.5 pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {/* Scoring Type Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase font-mono shadow-sm ${badge.bg}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
              <span className="opacity-90 font-mono font-extrabold ml-0.5">{badge.points}</span>
            </span>

            {/* Red Zone Badge */}
            {alert.isRedZoneStrike && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold uppercase font-mono">
                Red Zone Strike
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>
                {alert.quarter} {alert.timeRemaining}
              </span>
            </span>

            <button
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game Matchup & Score Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: alert.scoringTeamColor || '#f59e0b' }}
            />
            <span className="text-sm font-extrabold text-white tracking-wide">
              {alert.scoringTeamName}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono font-black text-sm text-slate-200 bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/5">
            <span
              className={
                alert.scoringTeam === alert.awayTeam ? 'text-amber-400 font-bold' : 'text-slate-300'
              }
            >
              {alert.awayTeam} {alert.updatedAwayScore}
            </span>
            <span className="text-slate-500 font-normal">-</span>
            <span
              className={
                alert.scoringTeam === alert.homeTeam ? 'text-amber-400 font-bold' : 'text-slate-300'
              }
            >
              {alert.homeTeam} {alert.updatedHomeScore}
            </span>
          </div>
        </div>

        {/* Scoring Play Detail */}
        <p className="text-xs text-amber-200/90 font-medium mt-2 leading-relaxed">
          {alert.scoringPlayer}
        </p>

        {/* Drive Telemetry Micro-Badges */}
        <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-bold">
            📊 {alert.drivePlays}p, {alert.driveYards}y
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
            ⏱️ {alert.driveTimeOfPossession}
          </span>
          {alert.epaGain !== undefined && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              ⚡ +{alert.epaGain.toFixed(1)} EPA
            </span>
          )}
          {alert.winProbShift !== undefined && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-indigo-400" />
              <span>+{alert.winProbShift.toFixed(1)}% Win</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Footer Button Chips */}
      <div className="px-3 py-1.5 bg-black/50 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={handleViewGame}
          className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <span>🏈 Game Center</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        <button
          onClick={handleAiBreakdown}
          className="py-1.5 px-3 rounded-xl bg-white/10 text-slate-200 hover:text-white hover:bg-white/20 border border-white/15 text-xs font-bold transition-all flex items-center gap-1.5"
          title="Break down with Google AI Coach"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>✨ AI Recap</span>
        </button>
      </div>

      {/* Visual Countdown Progress Bar */}
      <div className="h-1 w-full bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
