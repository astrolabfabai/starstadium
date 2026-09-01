import React, { useState } from 'react';
import { ViewMode, SeasonCode, SEASONS_LIST } from '../types';
import {
  Calendar,
  Sparkles,
  ChevronDown,
  User,
  Shield,
  Bell,
  Activity,
  Zap
} from 'lucide-react';
import { useScoringNotifications } from '../context/ScoringNotificationContext';

interface NavbarProps {
  activeView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  selectedSeason: SeasonCode;
  onSeasonChange: (season: SeasonCode) => void;
  onOpenOllama?: () => void;
  onOpenGoogleAi?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  selectedSeason,
  onSeasonChange,
  onOpenOllama,
  onOpenGoogleAi
}) => {
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const { unreadCount, setIsNotificationCenterOpen } = useScoringNotifications();

  const currentSeasonObj = SEASONS_LIST.find((s) => s.code === selectedSeason) || SEASONS_LIST[0];

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-white/10">
      {/* Top Brand & Telemetry Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Left: NFL Shield & Studio Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
            <span className="text-xl">🏈</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider uppercase italic font-serif text-white flex items-center">
                Star<span className="text-amber-500 font-sans not-italic font-extrabold ml-0.5">Stadium</span>
              </h1>
              {/* NFL League Shield Badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-gradient-to-r from-blue-600/20 to-red-600/20 border border-white/15 px-2 py-0.5 rounded-full text-slate-200 shadow-xs">
                <span>🛡️</span>
                <span>NFL PRO</span>
              </span>
              {/* Live Edge Telemetry Pill */}
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>EDGE LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5">
              <span>SportsData.io Feeds</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-amber-400 font-mono font-medium">Gemini 2.0 Flash</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Action Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Season Selector Chip */}
          <div className="relative">
            <button
              onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
              className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 flex items-center gap-1.5 shadow-sm transition-all font-mono"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentSeasonObj.label}</span>
              <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform ${showSeasonDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSeasonDropdown && (
              <div className="absolute right-0 mt-2 w-64 p-2 bg-[#121214] border border-white/10 rounded-xl shadow-2xl z-50 text-xs animate-fadeIn">
                <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider px-2 py-1 mb-1 flex items-center justify-between">
                  <span>Select Season</span>
                  <span className="text-amber-400">API Sync</span>
                </div>
                <div className="space-y-1">
                  {SEASONS_LIST.map((season) => (
                    <button
                      key={season.code}
                      onClick={() => {
                        onSeasonChange(season.code);
                        setShowSeasonDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex flex-col transition-all ${
                        selectedSeason === season.code
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-200 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{season.label}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            selectedSeason === season.code
                              ? 'bg-slate-950 text-amber-400 font-bold'
                              : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {season.code}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] mt-0.5 ${
                          selectedSeason === season.code ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {season.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scoring Alerts Bell Chip */}
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-[#121214] text-slate-200 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center gap-1.5 transition-all relative font-mono"
            title="Scoring Alerts Feed"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Google AI Studio Launcher Chip */}
          {onOpenGoogleAi && (
            <button
              onClick={onOpenGoogleAi}
              className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 flex items-center gap-1.5 transition-all shadow-sm font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>✨ AI Coach</span>
            </button>
          )}

          {/* User Account Chip */}
          <button
            onClick={() => onViewChange('user_account')}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all font-mono ${
              activeView === 'user_account'
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-[#121214] border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">👤 Account</span>
            <span className="sm:hidden">👤</span>
          </button>

          {/* Server Admin Chip */}
          <button
            onClick={() => onViewChange('admin')}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all font-mono ${
              activeView === 'admin'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-[#121214] border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">⚙️ Admin</span>
            <span className="sm:hidden">⚙️</span>
          </button>
        </div>
      </div>
    </header>
  );
};
