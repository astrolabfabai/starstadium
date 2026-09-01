import React, { useState, useEffect } from 'react';
import { UserProfile, ViewMode, SeasonCode } from '../../types';
import { NFL_TEAMS } from '../../data/sportsDataMock';
import {
  User,
  Shield,
  Bell,
  Sliders,
  Bookmark,
  Check,
  Star,
  Award,
  Zap,
  Radio,
  Flame,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface UserAccountViewProps {
  selectedSeason?: SeasonCode;
  onNavigateToView?: (view: ViewMode) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Bryant Ross Jr.',
  email: 'bryantrossjr@gmail.com',
  roleTitle: 'Lead NFL Tactical Analyst',
  avatarEmoji: '🏈',
  favoriteTeam: 'KC',
  favoriteConference: 'AFC',
  scoringFormat: 'PPR',
  primaryDfsSite: 'DraftKings',
  notifications: {
    redZoneAlerts: true,
    fourthDownDecisions: true,
    injuryUpdates: true,
    oddsLineMovement: false,
    bigPlays: true
  },
  preferences: {
    defaultLandingView: 'scoreboard',
    autoRefreshSecs: 10,
    highContrastMode: true,
    dualEngineAi: true
  },
  savedPlayConcepts: ['trips-mesh-cross', 'spread-y-cross', 'rpo-glance-post']
};

export const UserAccountView: React.FC<UserAccountViewProps> = ({
  selectedSeason = '2026REG',
  onNavigateToView
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('starstadium_user_profile');
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load user profile from storage', e);
    }
    return DEFAULT_PROFILE;
  });

  const [isSavedBanner, setIsSavedBanner] = useState(false);

  const saveProfile = () => {
    try {
      localStorage.setItem('starstadium_user_profile', JSON.stringify(profile));
      setIsSavedBanner(true);
      setTimeout(() => setIsSavedBanner(false), 2500);
    } catch (e) {
      console.warn('Could not persist user profile', e);
    }
  };

  const selectedTeamData = NFL_TEAMS.find((t) => t.Key === profile.favoriteTeam) || NFL_TEAMS[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#18181b] via-[#121214] to-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          <div className="w-18 h-18 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-3xl shadow-xl">
            <span>{profile.avatarEmoji}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide font-serif italic">
                {profile.name}
              </h2>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" /> Pro Member
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{profile.email}</p>
            <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-2">
              <span className="text-amber-400 font-semibold">{profile.roleTitle}</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400">{selectedSeason} Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={saveProfile}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
          <button
            onClick={() => setProfile(DEFAULT_PROFILE)}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Save Toast */}
      {isSavedBanner && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile and analytical preferences saved successfully.</span>
          </div>
          <span className="text-[10px] opacity-75 font-mono">Local State Sync</span>
        </div>
      )}

      {/* 2-Column Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Team & Alignment Card */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Favorite NFL Franchise
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
              {profile.favoriteTeam}
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-slate-300 font-medium block">
              Select Primary Team for Instant Insights & Radar
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {NFL_TEAMS.map((team) => {
                const isSelected = profile.favoriteTeam === team.Key;
                return (
                  <button
                    key={team.Key}
                    onClick={() => setProfile((p) => ({ ...p, favoriteTeam: team.Key }))}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-[#09090b] border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-mono font-black">{team.Key}</span>
                    <span className="text-[9px] truncate w-full opacity-80">{team.City}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Franchise Info */}
            <div className="bg-[#09090b] border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{selectedTeamData.FullName}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedTeamData.Conference} {selectedTeamData.Division} &bull; Coach: {selectedTeamData.HeadCoach}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-300">
                  {selectedTeamData.OffensiveScheme}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fantasy & DFS Customization */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Fantasy & DFS Scoring Profile
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {profile.scoringFormat}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                League Scoring Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PPR', 'HALF_PPR', 'STANDARD'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setProfile((p) => ({ ...p, scoringFormat: fmt }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      profile.scoringFormat === fmt
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-[#09090b] border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {fmt.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                Primary DFS Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['DraftKings', 'FanDuel'] as const).map((site) => (
                  <button
                    key={site}
                    onClick={() => setProfile((p) => ({ ...p, primaryDfsSite: site }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      profile.primaryDfsSite === site
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-[#09090b] border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {site} Matrix
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gameday & Telemetry Live Alerts */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Gameday Telemetry Alerts
              </h3>
            </div>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Live HUD
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                key: 'redZoneAlerts' as const,
                label: 'Red-Zone Entry Triggers',
                desc: 'Alert when offensive possession moves inside the 20-yard line'
              },
              {
                key: 'fourthDownDecisions' as const,
                label: '4th Down Go-for-It Probabilities',
                desc: 'Highlight EPA mathematical recommendation on 4th & short'
              },
              {
                key: 'bigPlays' as const,
                label: 'Explosive Plays (>25 Yards)',
                desc: 'Instant HUD notice on deep balls and breakaway scrambles'
              },
              {
                key: 'injuryUpdates' as const,
                label: 'Injury Availability Shifts',
                desc: 'Notify when player status changes to Out/Doubtful during pregame'
              }
            ].map((alert) => (
              <label
                key={alert.key}
                className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-[#09090b] border border-white/5 hover:border-white/10 cursor-pointer transition-all"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">{alert.label}</p>
                  <p className="text-[11px] text-slate-400">{alert.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.notifications[alert.key]}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      notifications: { ...p.notifications, [alert.key]: e.target.checked }
                    }))
                  }
                  className="mt-1 w-4 h-4 rounded text-amber-500 bg-black border-white/20 focus:ring-amber-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Workspace & Studio Preferences */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Workspace Preferences
              </h3>
            </div>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              UX Setup
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium mb-1.5 block">
                Scoreboard Auto-Refresh Frequency
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() =>
                      setProfile((p) => ({
                        ...p,
                        preferences: { ...p.preferences, autoRefreshSecs: sec }
                      }))
                    }
                    className={`py-1.5 px-2 rounded-lg border text-xs font-mono font-bold transition-all text-center ${
                      profile.preferences.autoRefreshSecs === sec
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                        : 'bg-[#09090b] border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {sec}s Interval
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] border border-white/5 cursor-pointer">
                <div>
                  <p className="font-semibold text-white">Google AI Intelligence Engine</p>
                  <p className="text-[11px] text-slate-400">
                    Enable Gemini 3.7 Flash server analysis on game flow
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.dualEngineAi}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      preferences: { ...p.preferences, dualEngineAi: e.target.checked }
                    }))
                  }
                  className="w-4 h-4 rounded text-sky-500 bg-black border-white/20 focus:ring-sky-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
