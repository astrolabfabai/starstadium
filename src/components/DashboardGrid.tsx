import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewMode, WidgetConfig, SeasonCode } from '../types';
import { StandingsView } from './views/StandingsView';
import { TeamsRostersView } from './views/TeamsRostersView';
import { ScheduleVenueView } from './views/ScheduleVenueView';
import { ScoreboardLiveView } from './views/ScoreboardLiveView';
import { GameHighlightsAutomationView } from './views/GameHighlightsAutomationView';
import { PlayerLeaderboardsView } from './views/PlayerLeaderboardsView';
import { PlayByPlayView } from './views/PlayByPlayView';
import { DepthInjuryView } from './views/DepthInjuryView';
import { BettingOddsView } from './views/BettingOddsView';
import { FantasyDfsView } from './views/FantasyDfsView';
import { DraftPickAnalyzerView } from './views/DraftPickAnalyzerView';
import { DraftMockSimulatorView } from './views/DraftMockSimulatorView';
import { NewsTransactionsView } from './views/NewsTransactionsView';
import { DbViewerView } from './views/DbViewerView';
import { UserAccountView } from './views/UserAccountView';
import { ServerAdminView } from './views/ServerAdminView';
import { LayoutGrid, Eye, EyeOff, Move, RotateCcw } from 'lucide-react';

interface DashboardGridProps {
  activeView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  selectedGameKey?: string;
  onSelectGameKey?: (key: string) => void;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: '1', title: '🏆 1. Standings & Win-Loss Radar', type: 'standings', category: 'Competition', w: 12, visible: true, order: 1 },
  { id: '2', title: '👥 2. Teams, Rosters & Schemes', type: 'teams', category: 'Roster', w: 12, visible: true, order: 2 },
  { id: '3', title: '📅 3. Schedules, Venues & Weather', type: 'schedule', category: 'Schedules', w: 12, visible: true, order: 3 },
  { id: '4', title: '📻 4. Live Scoreboard & Game Flow', type: 'scoreboard', category: 'Live Events', w: 12, visible: true, order: 4 },
  { id: '5', title: '🎬 5. Game Highlights & Video Matcher', type: 'highlights', category: 'Live Events', w: 12, visible: true, order: 5 },
  { id: '6', title: '🎯 6. Player Leaderboards & Multi-Stat Scatter', type: 'stats', category: 'Player Stats', w: 12, visible: true, order: 6 },
  { id: '7', title: '⚡ 7. Play-By-Play Drive Sequence Flow', type: 'playbyplay', category: 'Play by Play', w: 12, visible: true, order: 7 },
  { id: '8', title: '🩹 8. Depth Chart & Injury Availability Matrix', type: 'depth_injuries', category: 'Lineups', w: 12, visible: true, order: 8 },
  { id: '9', title: '💰 9. Live Betting Lines & Odds Shift', type: 'betting', category: 'Odds', w: 12, visible: true, order: 9 },
  { id: '10', title: '✨ 10. Fantasy Projections & DFS Value Matrix', type: 'fantasy', category: 'Fantasy', w: 12, visible: true, order: 10 },
  { id: '11', title: '⚖️ 11. Draft Pick & Trade Value Analyzer', type: 'draft_analyzer', category: 'Draft', w: 12, visible: true, order: 11 },
  { id: '12', title: '🏈 12. NFL Draft Mock Simulator', type: 'draft_simulator', category: 'Draft', w: 12, visible: true, order: 12 },
  { id: '13', title: '📰 13. RotoBaller News & Transaction Wire', type: 'news', category: 'News', w: 12, visible: true, order: 13 },
  { id: '14', title: '🗄️ 14. Live Database Core & SQL Sandbox', type: 'db_viewer', category: 'Database', w: 12, visible: true, order: 14 }
];

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  activeView,
  onViewChange,
  selectedSeason = '2026REG',
  onSeasonChange,
  selectedGameKey,
  onSelectGameKey
}) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isCustomizeMode, setIsCustomizeMode] = useState<boolean>(false);

  const toggleWidgetVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const handleGameSelectAndNavigate = (gameKey: string) => {
    if (onSelectGameKey) {
      onSelectGameKey(gameKey);
    }
    onViewChange('playbyplay');
  };

  const handleNavigateToHighlights = (gameKey: string) => {
    if (onSelectGameKey) {
      onSelectGameKey(gameKey);
    }
    onViewChange('highlights');
  };

  const renderActiveSingleView = (view: ViewMode) => {
    switch (view) {
      case 'standings':
        return <StandingsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'teams':
        return <TeamsRostersView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'schedule':
        return (
          <ScheduleVenueView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            onSelectGame={handleGameSelectAndNavigate}
          />
        );
      case 'scoreboard':
        return (
          <ScoreboardLiveView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
            onNavigateToPlayByPlay={handleGameSelectAndNavigate}
            onNavigateToHighlights={handleNavigateToHighlights}
          />
        );
      case 'highlights':
        return (
          <GameHighlightsAutomationView
            selectedSeason={selectedSeason}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
            onNavigateToGame={handleGameSelectAndNavigate}
          />
        );
      case 'stats':
        return <PlayerLeaderboardsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'playbyplay':
        return (
          <PlayByPlayView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
          />
        );
      case 'depth_injuries':
        return <DepthInjuryView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'betting':
        return <BettingOddsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'fantasy':
        return <FantasyDfsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'draft_analyzer':
        return <DraftPickAnalyzerView />;
      case 'draft_simulator':
        return <DraftMockSimulatorView onNavigateToTrades={() => onViewChange('draft_analyzer')} />;
      case 'news':
        return <NewsTransactionsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'db_viewer':
        return <DbViewerView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'user_account':
        return <UserAccountView selectedSeason={selectedSeason} onNavigateToView={onViewChange} />;
      case 'admin':
        return <ServerAdminView selectedSeason={selectedSeason} />;
      default:
        return (
          <ScoreboardLiveView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
            onNavigateToPlayByPlay={handleGameSelectAndNavigate}
          />
        );
    }
  };

  // If viewing a specific single view tab directly
  if (activeView !== 'dashboard') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {renderActiveSingleView(activeView)}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Master Dashboard View with customizable widget grid
  const renderWidgetContent = (type: ViewMode) => {
    switch (type) {
      case 'standings':
        return <StandingsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'teams':
        return <TeamsRostersView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'schedule':
        return <ScheduleVenueView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'scoreboard':
        return <ScoreboardLiveView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'highlights':
        return (
          <GameHighlightsAutomationView
            selectedSeason={selectedSeason}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
            onNavigateToGame={handleGameSelectAndNavigate}
          />
        );
      case 'stats':
        return <PlayerLeaderboardsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'playbyplay':
        return <PlayByPlayView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'depth_injuries':
        return <DepthInjuryView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'betting':
        return <BettingOddsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'fantasy':
        return <FantasyDfsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'draft_analyzer':
        return <DraftPickAnalyzerView />;
      case 'draft_simulator':
        return <DraftMockSimulatorView onNavigateToTrades={() => onViewChange('draft_analyzer')} />;
      case 'news':
        return <NewsTransactionsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'db_viewer':
        return <DbViewerView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'user_account':
        return <UserAccountView selectedSeason={selectedSeason} onNavigateToView={onViewChange} />;
      case 'admin':
        return <ServerAdminView selectedSeason={selectedSeason} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-workspace"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Customize Toolbar */}
        <div className="bg-[#121214] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
              <span className="text-xl">🏈</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide uppercase italic font-serif flex items-center gap-2">
                Star<span className="text-amber-500 font-sans not-italic font-extrabold">Stadium</span> Workspace
                <span className="text-[10px] font-mono not-italic text-slate-400 font-normal bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  All 12 Modules
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                SportsData.io NFL Feeds &bull; Full-Spectrum Football Analytics Canvas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomizeMode(!isCustomizeMode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                isCustomizeMode
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10'
              }`}
            >
              {isCustomizeMode ? <Eye className="w-4 h-4" /> : <Move className="w-4 h-4" />}
              {isCustomizeMode ? 'Finish Customizing' : 'Customize Layout'}
            </button>

            <button
              onClick={resetLayout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5"
              title="Reset to Default Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Customization Selector Drawer if active */}
        {isCustomizeMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0c0c0e] border border-amber-500/30 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Toggle Module Visibility on Master Canvas:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {widgets.filter((w) => w.visible).length} / {widgets.length} Active
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {widgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    widget.visible
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                  }`}
                >
                  <span className="truncate text-[11px] font-medium mr-1">{widget.title}</span>
                  {widget.visible ? (
                    <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dynamic Grid Layout for Widgets */}
        <div className="space-y-6">
          {widgets
            .filter((w) => w.visible)
            .map((widget) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full relative"
              >
                {renderWidgetContent(widget.type)}
              </motion.div>
            ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
