import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScoringNotifications } from '../../context/ScoringNotificationContext';
import { ScoreType, ScoringDriveAlert } from '../../types';
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  Flame,
  Activity,
  Trophy,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
  CheckCheck,
  Play,
  Pause,
  Filter,
  TrendingUp,
  Radio,
  Sliders
} from 'lucide-react';

interface ScoringNotificationCenterModalProps {
  onSelectGame?: (gameKey: string) => void;
  onOpenAiWithPrompt?: (prompt: string, context?: any) => void;
}

export const ScoringNotificationCenterModal: React.FC<ScoringNotificationCenterModalProps> = ({
  onSelectGame,
  onOpenAiWithPrompt
}) => {
  const {
    alerts,
    unreadCount,
    isSoundEnabled,
    isNotificationsEnabled,
    isAutoSimulationActive,
    setIsSoundEnabled,
    setIsNotificationsEnabled,
    setIsAutoSimulationActive,
    markAllAsRead,
    clearAlertHistory,
    triggerSampleScoringDrive,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen
  } = useScoringNotifications();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TD' | 'FG' | 'DEF' | 'REDZONE'>('ALL');

  if (!isNotificationCenterOpen) return null;

  const filteredAlerts = alerts.filter((alert) => {
    if (activeFilter === 'TD') return alert.scoreType === 'TOUCHDOWN';
    if (activeFilter === 'FG') return alert.scoreType === 'FIELD_GOAL';
    if (activeFilter === 'DEF')
      return alert.scoreType === 'PICK_SIX' || alert.scoreType === 'FUMBLE_RETURN_TD' || alert.scoreType === 'SAFETY';
    if (activeFilter === 'REDZONE') return alert.isRedZoneStrike;
    return true;
  });

  const handleJumpToGame = (gameKey: string) => {
    if (onSelectGame) {
      onSelectGame(gameKey);
    }
    setIsNotificationCenterOpen(false);
  };

  const handleAiBreakdown = (alert: ScoringDriveAlert) => {
    if (onOpenAiWithPrompt) {
      const prompt = `Provide a coaching and tactical analysis of this scoring drive: ${alert.scoringTeamName} vs ${alert.opponentTeamName}. Scoring play: "${alert.scoringPlayer}". Drive summary: ${alert.drivePlays} plays, ${alert.driveYards} yards in ${alert.driveTimeOfPossession}. EPA: +${alert.epaGain ?? 3.5}. Explain the offensive concept, defensive vulnerability, and impact on win probability.`;
      onOpenAiWithPrompt(prompt, { scoringDrive: alert });
    }
    setIsNotificationCenterOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click backdrop to close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => setIsNotificationCenterOpen(false)}
        aria-label="Close notification center"
      />

      {/* Slide-over panel */}
      <div
        id="scoring-notification-drawer"
        className="relative w-full max-w-lg bg-[#0e0e11] border-l border-white/10 shadow-2xl h-full flex flex-col z-10"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 bg-[#121216] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black flex items-center justify-center border-2 border-[#121216]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2 font-serif italic">
                <span>Real-Time Scoring Drive Alerts</span>
                <span className="text-[10px] font-mono not-italic px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                  Live Feed
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Instant notifications across all active NFL slate matchups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsNotificationCenterOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Settings & Controls Bar */}
        <div className="px-4 py-2.5 bg-[#16161c] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Sound Toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`px-2.5 py-1 rounded-xl border font-mono font-bold flex items-center gap-1.5 transition-all text-xs ${
              isSoundEnabled
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
            title={isSoundEnabled ? 'Disable Chimes' : 'Enable Chimes'}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isSoundEnabled ? '🔊 Sound On' : '🔇 Muted'}</span>
          </button>

          {/* Auto Simulation Toggle */}
          <button
            onClick={() => setIsAutoSimulationActive(!isAutoSimulationActive)}
            className={`px-2.5 py-1 rounded-xl border font-mono font-bold flex items-center gap-1.5 transition-all text-xs ${
              isAutoSimulationActive
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {isAutoSimulationActive ? (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>🟢 Auto-Sim</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-500" />
                <span>⏸️ Paused</span>
              </>
            )}
          </button>

          {/* Test Alert Emoji Action Chips */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => triggerSampleScoringDrive('TOUCHDOWN')}
              className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase font-mono hover:bg-amber-400 transition flex items-center gap-1"
              title="Test Touchdown Alert"
            >
              <span>⚡</span>
              <span>TD Sim</span>
            </button>
            <button
              onClick={() => triggerSampleScoringDrive('FIELD_GOAL')}
              className="px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] uppercase font-mono hover:bg-emerald-400 transition flex items-center gap-1"
              title="Test Field Goal Alert"
            >
              <span>🎯</span>
              <span>FG Sim</span>
            </button>
            <button
              onClick={() => triggerSampleScoringDrive('PICK_SIX')}
              className="px-2 py-1 rounded-lg bg-purple-500 text-white font-black text-[10px] uppercase font-mono hover:bg-purple-400 transition flex items-center gap-1"
              title="Test Pick-Six Alert"
            >
              <span>🛡️</span>
              <span>Pick 6</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs with Emojis */}
        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto bg-[#0a0a0d] no-scrollbar">
          {[
            { id: 'ALL', label: `🌐 All (${alerts.length})` },
            { id: 'TD', label: '⚡ Touchdowns' },
            { id: 'FG', label: '🎯 Field Goals' },
            { id: 'REDZONE', label: '🚩 Red Zone' },
            { id: 'DEF', label: '🛡️ Defensive' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alert List Timeline */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-300">No Scoring Alerts Recorded Yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Alerts will trigger automatically as scoring drives finish, or you can trigger a sample alert above.
                </p>
              </div>
              <button
                onClick={() => triggerSampleScoringDrive('TOUCHDOWN')}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-mono shadow-md"
              >
                Trigger Sample Touchdown Alert
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-[#131318] border border-white/10 hover:border-white/20 transition-all space-y-2.5 relative overflow-hidden group"
                style={{
                  borderLeftColor: alert.scoringTeamColor || '#f59e0b',
                  borderLeftWidth: '4px'
                }}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono tracking-wider ${
                        alert.scoreType === 'TOUCHDOWN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : alert.scoreType === 'FIELD_GOAL'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : alert.scoreType === 'PICK_SIX'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {alert.scoreType.replace('_', ' ')} (+{alert.pointsAdded})
                    </span>

                    {alert.isRedZoneStrike && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold font-mono">
                        RZ
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 font-mono">
                      {alert.quarter} {alert.timeRemaining}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold text-slate-200">
                    <span className={alert.scoringTeam === alert.awayTeam ? 'text-amber-400 font-bold' : ''}>
                      {alert.awayTeam} {alert.updatedAwayScore}
                    </span>
                    <span className="text-slate-600 mx-1">-</span>
                    <span className={alert.scoringTeam === alert.homeTeam ? 'text-amber-400 font-bold' : ''}>
                      {alert.homeTeam} {alert.updatedHomeScore}
                    </span>
                  </div>
                </div>

                {/* Main Player & Play Text */}
                <p className="text-xs font-medium text-slate-200 leading-snug">
                  {alert.scoringPlayer}
                </p>

                {/* Drive Telemetry Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5">
                    📊 {alert.drivePlays} plays &bull; {alert.driveYards} yds
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5">
                    ⏱️ TOP {alert.driveTimeOfPossession}
                  </span>
                  {alert.epaGain !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      EPA +{alert.epaGain.toFixed(1)}
                    </span>
                  )}
                  {alert.winProbShift !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                      +{alert.winProbShift.toFixed(1)}% Win Shift
                    </span>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAiBreakdown(alert)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>AI Analyze</span>
                    </button>
                    <button
                      onClick={() => handleJumpToGame(alert.gameKey)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 text-[11px] font-black transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Jump to Game</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-[#121216] flex items-center justify-between">
          <button
            onClick={clearAlertHistory}
            disabled={alerts.length === 0}
            className="text-xs text-rose-400 hover:text-rose-300 disabled:opacity-40 flex items-center gap-1.5 font-mono font-bold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            {alerts.length} drive alerts logged
          </span>
        </div>
      </div>
    </div>
  );
};
