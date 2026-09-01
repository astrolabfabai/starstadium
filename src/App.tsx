import React, { useState, useEffect } from 'react';
import { ViewMode, SeasonCode } from './types';
import { Sidebar } from './components/Sidebar';
import { DashboardGrid } from './components/DashboardGrid';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { GoogleAiAssistant } from './components/GoogleAiAssistant';
import { OllamaAssistant } from './components/OllamaAssistant';
import { ScoringNotificationProvider } from './context/ScoringNotificationContext';
import { ScoringToastContainer } from './components/notifications/ScoringToastContainer';
import { ScoringNotificationCenterModal } from './components/notifications/ScoringNotificationCenterModal';
import { NotificationBellButton } from './components/notifications/NotificationBellButton';
import { Menu, Sparkles, User, Shield, Radio, Activity } from 'lucide-react';

function AppContent() {
  const [activeView, setActiveView] = useState<ViewMode>('scoreboard');
  const [selectedSeason, setSelectedSeason] = useState<SeasonCode>('2026REG');
  const [selectedGameKey, setSelectedGameKey] = useState<string>('202610101');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [aiContextData, setAiContextData] = useState<any>(null);
  const [isOllamaOpen, setIsOllamaOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectGame = (gameKey: string) => {
    setSelectedGameKey(gameKey);
    setActiveView('playbyplay');
  };

  // Fetch current season from SportsData API endpoint to dynamically decide what season to display
  useEffect(() => {
    const fetchCurrentSeason = async () => {
      try {
        const res = await fetch('/api/sportsdata/current-season');
        if (res.ok) {
          const data = await res.json();
          if (data && data.season) {
            setSelectedSeason(data.season as SeasonCode);
          }
        }
      } catch (err) {
        console.warn('Could not fetch current season from API, fallback to active 2026REG:', err);
      }
    };

    fetchCurrentSeason();
  }, []);

  const handleOpenAiWithPrompt = (prompt?: string, context?: any) => {
    setAiInitialPrompt(prompt || '');
    setAiContextData(context || null);
    setIsAiAssistantOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col lg:flex-row relative">
      {/* Real-time Scoring Drive Toast Notifications Overlay */}
      <ScoringToastContainer
        onSelectGame={handleSelectGame}
        onOpenAiWithPrompt={handleOpenAiWithPrompt}
      />

      {/* Slide-over Scoring Notification Center History Drawer */}
      <ScoringNotificationCenterModal
        onSelectGame={handleSelectGame}
        onOpenAiWithPrompt={handleOpenAiWithPrompt}
      />

      {/* Left Combined Sidebar Menu */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        selectedSeason={selectedSeason}
        onSeasonChange={setSelectedSeason}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenGoogleAi={() => handleOpenAiWithPrompt()}
        onOpenOllama={() => setIsOllamaOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Area (Offset by left sidebar on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Mobile Header with Hamburger & Alert Bell Trigger */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0c0c0e]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-[#18181b] text-slate-300 hover:text-white border border-white/10"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏈</span>
              <h1 className="text-base font-bold text-white uppercase italic tracking-wider font-serif">
                Star<span className="text-amber-500 font-sans not-italic font-black">Stadium</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBellButton />
            <button
              onClick={() => setActiveView('user_account')}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                activeView === 'user_account' ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-[#18181b] text-sky-400 border-white/10'
              }`}
              title="User Account"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                activeView === 'admin' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-[#18181b] text-amber-400 border-white/10'
              }`}
              title="Server Admin"
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenAiWithPrompt()}
              className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:text-white border border-amber-500/30 text-xs font-bold flex items-center gap-1"
              title="Google AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Desktop Top Status & Alert Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-2.5 bg-[#0d0d10] border-b border-white/5 text-xs">
          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE BROADCAST FEEDS</span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">
              Season: <strong className="text-amber-400 font-semibold">{selectedSeason}</strong>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Drive Toast Telemetry Active</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-Time Notification Bell Action */}
            <NotificationBellButton showLabel />

            <button
              onClick={() => handleOpenAiWithPrompt('Analyze key offensive and red zone trends across the current NFL slate.')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 text-amber-400 hover:text-white hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Coach Assistant</span>
            </button>
          </div>
        </div>

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <DashboardGrid
            activeView={activeView}
            onViewChange={setActiveView}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={setSelectedGameKey}
          />
        </main>

        {/* App Footer */}
        <footer className="border-t border-white/10 bg-[#0c0c0e] py-6 text-center text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              🏈 StarStadium Analytics Studio &bull; SportsData.io NFL Feeds &bull; {selectedSeason}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              Chalkboard &bull; 4th Down Engine &bull; EPA Matrix &bull; Real-Time Scoring Alert Engine
            </span>
          </div>
        </footer>
      </div>

      {/* API Inspector Modal */}
      <ApiInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      {/* Google AI Coach Assistant Drawer (Gemini 3.7 Flash & Dual Ollama Engine) */}
      <GoogleAiAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        initialPrompt={aiInitialPrompt}
        activeContextData={aiContextData}
      />

      {/* Local Ollama Assistant Drawer (Optional standalone) */}
      <OllamaAssistant
        isOpen={isOllamaOpen}
        onClose={() => setIsOllamaOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ScoringNotificationProvider>
      <AppContent />
    </ScoringNotificationProvider>
  );
}

