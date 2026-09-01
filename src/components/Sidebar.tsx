import React, { useState, useEffect } from 'react';
import { ViewMode, SeasonCode, SEASONS_LIST } from '../types';
import {
  Trophy,
  Users,
  Calendar,
  Radio,
  BarChart3,
  Activity,
  HeartPulse,
  TrendingUp,
  Sparkles,
  Newspaper,
  LayoutGrid,
  BookOpen,
  Bot,
  ChevronDown,
  Database,
  ChevronRight,
  Shield,
  PanelLeftClose,
  PanelLeft,
  X,
  Search,
  User,
  Server,
  Lock,
  Bell,
  Flame
} from 'lucide-react';
import { useScoringNotifications } from '../context/ScoringNotificationContext';

interface SidebarProps {
  activeView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  selectedSeason: SeasonCode;
  onSeasonChange: (season: SeasonCode) => void;
  onOpenInspector?: () => void;
  onOpenOllama?: () => void;
  onOpenGoogleAi?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  selectedSeason,
  onSeasonChange,
  onOpenInspector,
  onOpenOllama,
  onOpenGoogleAi,
  isMobileOpen,
  onCloseMobile
}) => {
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [tickerClockSeconds, setTickerClockSeconds] = useState(135); // 02:15
  const { unreadCount, setIsNotificationCenterOpen, isNotificationCenterOpen } = useScoringNotifications();

  // Live second-by-second countdown for sidebar ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerClockSeconds((prev) => (prev <= 0 ? 135 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTickerClock = (totalSecs: number) => {
    const mins = Math.floor(Math.max(0, totalSecs) / 60);
    const secs = Math.max(0, totalSecs) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSeasonObj = SEASONS_LIST.find((s) => s.code === selectedSeason) || SEASONS_LIST[0];

  interface NavItem {
    id: ViewMode;
    label: string;
    shortLabel: string;
    emoji: string;
    num: string;
    badge?: string;
    badgeColor?: string;
  }

  interface NavGroup {
    groupTitle: string;
    groupEmoji: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'Standings & Rosters',
      groupEmoji: '🏆',
      items: [
        { id: 'standings', label: '1. Standings & Radar', shortLabel: 'Standings', emoji: '🏆', num: '01', badge: 'AFC/NFC', badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
        { id: 'teams', label: '2. Teams & Depth Rosters', shortLabel: 'Teams', emoji: '👥', num: '02' }
      ]
    },
    {
      groupTitle: 'Gameday & Live Events',
      groupEmoji: '🏟️',
      items: [
        { id: 'schedule', label: '3. Schedules & Venues', shortLabel: 'Schedules', emoji: '📅', num: '03' },
        { id: 'scoreboard', label: '4. Live Scores & Clock', shortLabel: 'Scoreboard', emoji: '📻', num: '04', badge: 'LIVE', badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' },
        { id: 'highlights', label: '5. Highlights & Video Matcher', shortLabel: 'Highlights', emoji: '🎬', num: '05', badge: 'AUTO', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
        { id: 'playbyplay', label: '6. Tactical Film Room Reel', shortLabel: 'Film Room', emoji: '⚡', num: '06', badge: 'REEL', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' }
      ]
    },
    {
      groupTitle: 'Analytics, Draft & Fantasy',
      groupEmoji: '📊',
      items: [
        { id: 'stats', label: '7. Player Scatter Stats', shortLabel: 'Scatter Stats', emoji: '🎯', num: '07' },
        { id: 'depth_injuries', label: '8. Depth & Injury Wire', shortLabel: 'Injuries', emoji: '🩹', num: '08' },
        { id: 'betting', label: '9. Vegas Odds & Shifts', shortLabel: 'Vegas Odds', emoji: '💰', num: '09', badge: 'SPREAD', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
        { id: 'fantasy', label: '10. DFS & Projections', shortLabel: 'DFS Fantasy', emoji: '✨', num: '10', badge: 'PROJ', badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
        { id: 'draft_analyzer', label: '11. Draft Pick & Trade Analyzer', shortLabel: 'Draft Picks', emoji: '⚖️', num: '11', badge: 'TRADE', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
        { id: 'draft_simulator', label: '12. Draft Mock Simulator', shortLabel: 'Draft Mock', emoji: '🏈', num: '12', badge: 'MOCK', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' }
      ]
    },
    {
      groupTitle: 'League Feeds & Sandbox',
      groupEmoji: '🗄️',
      items: [
        { id: 'news', label: '13. RotoBaller News Wire', shortLabel: 'News', emoji: '📰', num: '13', badge: 'RSS', badgeColor: 'bg-white/10 text-slate-300' },
        { id: 'db_viewer', label: '14. Live DB & SQL Sandbox', shortLabel: 'DB Viewer', emoji: '🗄️', num: '14', badge: 'SQL', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
        { id: 'dashboard', label: 'Master Grid Workspace', shortLabel: 'All Grid', emoji: '🎛️', num: 'ALL' }
      ]
    },
    {
      groupTitle: 'Account & Administration',
      groupEmoji: '⚙️',
      items: [
        { id: 'user_account', label: 'User Account & Profile', shortLabel: 'Account', emoji: '👤', num: 'ME', badge: 'USER', badgeColor: 'bg-sky-500/20 text-sky-400 border border-sky-500/30' },
        { id: 'admin', label: 'Server & API Admin', shortLabel: 'Admin', emoji: '🛡️', num: 'ROOT', badge: 'BACKEND', badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' }
      ]
    }
  ];

  const handleItemClick = (id: ViewMode) => {
    onViewChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0c0c0e] border-r border-white/10 flex flex-col transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Brand & Studio Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#09090b]">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                <span className="text-2xl">🏈</span>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider uppercase italic font-serif text-white flex items-center">
                  Star<span className="text-amber-500 font-sans not-italic font-extrabold ml-1">Stadium</span>
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1">
                  <span>🛡️ NFL PRO</span>
                  <span>&bull;</span>
                  <span className="text-amber-400">{selectedSeason}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto text-xl">🏈</div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Season Selector Dropdown */}
        {!isCollapsed && (
          <div className="p-3 border-b border-white/10 bg-[#0e0e11] relative">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>NFL Season Campaign</span>
              <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 text-[9px]">
                API Auto-Sync
              </span>
            </label>
            <button
              onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
              className="w-full bg-[#141417] hover:bg-[#1a1a1f] border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{currentSeasonObj.label}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSeasonDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSeasonDropdown && (
              <div className="absolute top-full left-3 right-3 z-50 mt-1 bg-[#18181b] border border-white/15 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                <div className="p-1.5 space-y-1">
                  {SEASONS_LIST.map((season) => {
                    const isSelected = season.code === selectedSeason;
                    return (
                      <button
                        key={season.code}
                        onClick={() => {
                          onSeasonChange(season.code);
                          setShowSeasonDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{season.label}</p>
                          <p className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                            {season.description}
                          </p>
                        </div>
                        {season.code === '2026REG' && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-slate-900 text-amber-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Assistants Quick Action Bar */}
        {!isCollapsed && (
          <div className="p-3 border-b border-white/10 bg-[#09090b] grid grid-cols-2 gap-2">
            {onOpenGoogleAi && (
              <button
                onClick={onOpenGoogleAi}
                className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 text-amber-400 hover:text-white hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Google AI</span>
              </button>
            )}
            {onOpenOllama && (
              <button
                onClick={onOpenOllama}
                className="py-1.5 px-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-slate-300" />
                <span>Ollama AI</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Search */}
        {!isCollapsed && (
          <div className="p-3 pb-1 border-b border-white/5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter views..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full bg-[#141417] text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 border border-white/5 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Nav Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !menuSearch || item.label.toLowerCase().includes(menuSearch.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.groupTitle} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>{group.groupEmoji}</span>
                    <span>{group.groupTitle}</span>
                  </div>
                )}

                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full rounded-xl text-left flex items-center justify-between transition-all group ${
                          isCollapsed ? 'p-3 justify-center' : 'px-3 py-2'
                        } ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                            : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                        title={item.label}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`text-base shrink-0 ${isActive ? 'scale-110' : 'opacity-90'}`}>
                            {item.emoji}
                          </span>
                          {!isCollapsed && (
                            <span className="text-xs truncate font-medium">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && (
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {item.badge && (
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${item.badgeColor || 'bg-white/10 text-white'}`}>
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-slate-950 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-300'}`} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer with Live Gameday Snapshot */}
        <div className="p-3 border-t border-white/10 bg-[#09090b]">
          {!isCollapsed ? (
            <div className="space-y-2">
              {/* Mini Scoreboard Ticker */}
              <div className="bg-[#121214] p-2 rounded-lg border border-white/5 text-[11px] font-mono space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                  <span>🏈 Live Ticker</span>
                  <span className="text-rose-400 font-bold flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> Q4 {formatTickerClock(tickerClockSeconds)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>KC Chiefs</span>
                  <strong className="text-amber-400">27</strong>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>BAL Ravens</span>
                  <strong className="text-white">24</strong>
                </div>
              </div>

              {/* Scoring Alerts Quick Toggle */}
              <button
                onClick={() => {
                  setIsNotificationCenterOpen(!isNotificationCenterOpen);
                  onCloseMobile();
                }}
                className="w-full py-1.5 px-2.5 rounded-xl bg-[#141417] hover:bg-[#1c1c22] border border-white/10 text-xs font-bold transition-all flex items-center justify-between text-slate-300 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Scoring Alerts</span>
                </div>
                {unreadCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black">
                    {unreadCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
                )}
              </button>

              {/* Status */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  API Gateway Active
                </span>
                <span className="text-slate-400 font-bold">{selectedSeason}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Systems Operational" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
