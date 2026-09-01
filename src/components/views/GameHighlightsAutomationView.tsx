import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HighlightVideoItem, HighlightCategory, HighlightDownloadQueueItem, YtPlaylistScraperConfig } from '../../types';
import { MOCK_HIGHLIGHT_VIDEOS, DEFAULT_SCRAPER_CONFIG } from '../../data/highlightVideosData';
import {
  parseYouTubeVideoTitle,
  generateYtdlpBashScript,
  generatePythonScraperScript,
  generateN8nWorkflowJson,
  generateWebExtensionFiles
} from '../../utils/highlightMatcher';
import { NFL_TEAMS, SCHEDULES_DATA } from '../../data/sportsDataMock';
import {
  Play,
  Download,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Radio,
  FileDown,
  Globe,
  Sliders,
  X,
  Volume2,
  Trophy,
  Activity,
  AlertCircle
} from 'lucide-react';

interface GameHighlightsAutomationViewProps {
  selectedSeason?: string;
  selectedGameKey?: string;
  onSelectGameKey?: (key: string) => void;
  onNavigateToGame?: (gameKey: string) => void;
}

export const GameHighlightsAutomationView: React.FC<GameHighlightsAutomationViewProps> = ({
  selectedSeason = '2026REG',
  selectedGameKey,
  onSelectGameKey,
  onNavigateToGame
}) => {
  const [videos, setVideos] = useState<HighlightVideoItem[]>(MOCK_HIGHLIGHT_VIDEOS);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [activeModalVideo, setActiveModalVideo] = useState<HighlightVideoItem | null>(null);

  // Script Generator Modal & Tabs
  const [activeScriptTab, setActiveScriptTab] = useState<'bash' | 'python' | 'n8n' | 'extension'>('bash');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Scraper Engine Config State
  const [config, setConfig] = useState<YtPlaylistScraperConfig>(DEFAULT_SCRAPER_CONFIG);
  const [isMatchingRunning, setIsMatchingRunning] = useState<boolean>(false);
  const [matchStatusLog, setMatchStatusLog] = useState<string>('Idle. Ready to match playlists.');
  const [manualTitleInput, setManualTitleInput] = useState<string>(
    'Ravens vs. Chiefs Week 1 Highlights | NFL 2026'
  );
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  // Active Download Queue State
  const [downloadQueue, setDownloadQueue] = useState<HighlightDownloadQueueItem[]>([
    {
      id: 'q-1',
      videoId: 'kc_bal_q4_2026',
      title: 'Baltimore Ravens vs. Kansas City Chiefs Game Highlights',
      gameMatchup: 'BAL @ KC (Q4)',
      playlistTitle: '2026 Week 1 Game Highlights',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      format: 'mp4',
      status: 'COMPLETED',
      progress: 100,
      speed: '12.4 MB/s',
      eta: '00:00',
      addedAt: Date.now() - 1000 * 60 * 15,
      downloadPath: '~/NFL/downloads/2026_Season/Week_01/KC_vs_BAL/'
    }
  ]);

  // Handle live matching test from title string
  const handleTestParse = () => {
    const res = parseYouTubeVideoTitle(manualTitleInput);
    setParsedPreview(res);
  };

  // Run automated scan & matching simulation
  const handleRunAutoMatcher = () => {
    setIsMatchingRunning(true);
    setMatchStatusLog('Connecting to YouTube API / Scraper endpoint...');

    setTimeout(() => {
      setMatchStatusLog('Harvesting playlists from https://www.youtube.com/@NFL/playlists...');
    }, 800);

    setTimeout(() => {
      setMatchStatusLog('Parsing ytInitialData and matching video titles against SportsData.io NFL schedules...');
    }, 1600);

    setTimeout(() => {
      setIsMatchingRunning(false);
      setMatchStatusLog(`✅ Matched ${videos.length} highlight clips with 98% confidence.`);
    }, 2400);
  };

  // Trigger download for a video
  const handleStartDownload = (video: HighlightVideoItem) => {
    const newItem: HighlightDownloadQueueItem = {
      id: `q-${Date.now()}`,
      videoId: video.videoId,
      title: video.title,
      gameMatchup: `${video.awayTeam} @ ${video.homeTeam}`,
      playlistTitle: video.playlistTitle,
      url: video.youtubeUrl,
      format: video.downloadFormat.startsWith('mp3') ? 'mp3' : 'mp4',
      status: 'ACTIVE',
      progress: 15,
      speed: '9.8 MB/s',
      eta: '00:18',
      addedAt: Date.now(),
      downloadPath: `~/NFL/downloads/${video.season}/${video.week}/${video.homeTeam}_vs_${video.awayTeam}/`
    };

    setDownloadQueue((prev) => [newItem, ...prev]);

    // Simulate progress animation
    let currentProg = 15;
    const interval = setInterval(() => {
      currentProg += 20;
      if (currentProg >= 100) {
        clearInterval(interval);
        setDownloadQueue((prev) =>
          prev.map((q) =>
            q.id === newItem.id
              ? { ...q, status: 'COMPLETED', progress: 100, eta: '00:00', speed: 'Done' }
              : q
          )
        );
      } else {
        setDownloadQueue((prev) =>
          prev.map((q) => (q.id === newItem.id ? { ...q, progress: currentProg } : q))
        );
      }
    }, 400);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFileBlob = (content: string, filename: string, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Videos
  const filteredVideos = videos.filter((v) => {
    if (activeCategory !== 'ALL' && v.category !== activeCategory) return false;
    if (selectedTeamFilter !== 'ALL' && v.homeTeam !== selectedTeamFilter && v.awayTeam !== selectedTeamFilter)
      return false;
    if (
      searchQuery &&
      !v.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.matchedPlayer?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-[#101014] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Auto Video Highlight Engine</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              yt-dlp &bull; SportsData.io Matching &bull; Automated Transcoding
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-serif italic tracking-tight">
            Game Highlights & Video Automation Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Automatically harvest, correlate, and download NFL highlight reels, red-zone touchdowns, mic’d up audio,
            and game-recap footage directly from official playlists using yt-dlp pipelines.
          </p>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={() => setIsScriptModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1c1c24] hover:bg-[#252530] text-amber-400 hover:text-white border border-amber-500/30 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Export Automation Scripts</span>
          </button>

          <button
            onClick={handleRunAutoMatcher}
            disabled={isMatchingRunning}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black uppercase font-mono hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isMatchingRunning ? 'animate-spin' : ''}`} />
            <span>{isMatchingRunning ? 'Matching Playlists...' : '⚡ Scan & Match Highlights'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Title Regex & AI Matcher Sandbox */}
      <div className="p-5 rounded-2xl bg-[#121217] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Highlight Title Correlation Sandbox</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Regex Matcher: <code className="text-amber-400">Season &bull; Week &bull; Teams &bull; Play Type</code>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={manualTitleInput}
              onChange={(e) => setManualTitleInput(e.target.value)}
              placeholder="Paste raw YouTube video title (e.g., Packers vs Eagles Week 1 Highlights)..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#09090b] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={handleTestParse}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-mono hover:bg-amber-400 transition whitespace-nowrap"
          >
            ⚡ Test Auto-Match
          </button>
        </div>

        {/* Live Matching Output Tag Bar */}
        {parsedPreview && (
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Matched Entities:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              🗓️ {parsedPreview.season} ({parsedPreview.week})
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
              🏈 {parsedPreview.matchedAwayTeam} vs {parsedPreview.matchedHomeTeam}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              🏷️ Category: {parsedPreview.category}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
              🎯 Confidence: {parsedPreview.matchConfidence}%
            </span>
            <span className="text-slate-400 ml-auto text-[11px]">
              Game Key: <strong className="text-white">{parsedPreview.matchedGameKey}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {[
            { id: 'ALL', label: '🎬 All Highlights' },
            { id: 'GAME_RECAP', label: '🏆 Game Recaps' },
            { id: 'TOUCHDOWNS', label: '⚡ Touchdowns' },
            { id: 'REDZONE_DRIVES', label: '🚩 Red Zone' },
            { id: 'BIG_PLAYS', label: '🔥 Big Plays' },
            { id: 'DEFENSIVE_STOPS', label: '🛡️ Defense & Pick-6' },
            { id: 'MIC_D_UP', label: "🎙️ Mic'd Up" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#141418] text-slate-400 hover:text-white hover:bg-[#1f1f26] border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Team Selector & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            aria-label="Filter highlights by team"
            className="px-3 py-2 rounded-xl bg-[#141418] border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All NFL Teams</option>
            {NFL_TEAMS.map((t) => (
              <option key={t.Key} value={t.Key}>
                {t.FullName} ({t.Key})
              </option>
            ))}
          </select>

          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search highlights..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#141418] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="rounded-2xl bg-[#111116] border border-white/10 overflow-hidden hover:border-white/20 transition-all flex flex-col group shadow-lg"
          >
            {/* Thumbnail Header */}
            <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setActiveModalVideo(video)}>
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Category Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-amber-400 border border-white/10 text-[10px] font-mono font-bold uppercase">
                  {video.category.replace('_', ' ')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/80 text-slate-950 text-[10px] font-mono font-black">
                  {video.matchConfidence}% MATCH
                </span>
              </div>

              {/* Duration Chip */}
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] font-bold text-white">
                {video.duration}
              </div>

              {/* Play Overlay Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>
              </div>
            </div>

            {/* Video Body Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-amber-400 font-bold">
                    {video.awayTeam} @ {video.homeTeam} &bull; {video.week}
                  </span>
                  <span>{video.viewsCount}</span>
                </div>

                <h3
                  onClick={() => setActiveModalVideo(video)}
                  className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 cursor-pointer leading-snug"
                >
                  {video.title}
                </h3>

                {video.matchedPlayer && (
                  <p className="text-[11px] text-indigo-300/90 font-mono">
                    ⭐ Key Matchup: {video.matchedPlayer}
                  </p>
                )}
              </div>

              {/* yt-dlp Command Preview Box */}
              <div className="p-2 rounded-lg bg-black/50 border border-white/5 font-mono text-[10px] text-slate-400 truncate flex items-center justify-between gap-2">
                <span className="truncate text-slate-400">
                  <code className="text-amber-400/90">yt-dlp</code> -f "{video.downloadFormat}" ...
                </span>
                <button
                  onClick={() => copyToClipboard(video.ytdlpCommand, video.id)}
                  className="text-slate-400 hover:text-white"
                  title="Copy yt-dlp download command"
                >
                  {copiedKey === video.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalVideo(video)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold font-mono transition flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-slate-300" />
                  <span>Watch Clip</span>
                </button>

                <button
                  onClick={() => handleStartDownload(video)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black font-mono transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3 h-3" />
                  <span>Download MP4</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Download Queue Section */}
      <div className="p-6 rounded-3xl bg-[#101014] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase">
                Active yt-dlp Video Download Queue
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Real-time transcoding & progress pipeline from YouTube playlists
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadFileBlob(
                  generateYtdlpBashScript(videos, config),
                  'download_all_nfl_highlights.sh',
                  'text/x-sh'
                )
              }
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono font-bold transition flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Batch .sh</span>
            </button>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="space-y-2">
          {downloadQueue.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#14141a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-white font-bold">{item.gameMatchup}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-300 truncate max-w-xs">{item.title}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Path: <code className="text-slate-400">{item.downloadPath}</code>
                </div>
              </div>

              <div className="flex items-center gap-4 min-w-[200px] justify-between sm:justify-end">
                <div className="space-y-1 w-28">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.speed}</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <span className="text-[11px] text-slate-400">{item.eta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#0f0f13] border border-white/15 rounded-3xl overflow-hidden shadow-2xl space-y-4">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#141419]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                  {activeModalVideo.category.replace('_', ' ')}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-lg font-serif">
                  {activeModalVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Player Simulated Interface */}
            <div className="px-6 space-y-4">
              <div className="relative aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center group">
                <img
                  src={activeModalVideo.thumbnailUrl}
                  alt={activeModalVideo.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                  <a
                    href={`https://www.youtube.com/watch?v=${activeModalVideo.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 transition-transform transform hover:scale-110 shadow-2xl flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 fill-slate-950 ml-1" />
                  </a>
                  <p className="text-xs text-slate-300 font-mono">
                    Click to Open Official NFL Broadcast Stream
                  </p>
                </div>
              </div>

              {/* Telemetry and Action Row */}
              <div className="p-4 rounded-2xl bg-[#141419] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <p className="text-slate-400">
                    Matchup: <strong className="text-white">{activeModalVideo.awayTeam} vs {activeModalVideo.homeTeam}</strong> &bull; {activeModalVideo.duration}
                  </p>
                  <p className="text-slate-500">
                    Playlist: {activeModalVideo.playlistTitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartDownload(activeModalVideo)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </button>

                  <a
                    href={activeModalVideo.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold transition flex items-center gap-1.5"
                  >
                    <span>Open YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#141419] border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveModalVideo(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Script & Pipeline Exporter Modal (From PDFs) */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#0f0f13] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141419]">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Automation & Downloader Script Generator
                </h3>
              </div>
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Script Navigation Tabs */}
            <div className="px-5 py-2.5 bg-[#0a0a0d] border-b border-white/10 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'bash', label: '📜 yt-dlp Smart Bash (ytdl.sh)' },
                { id: 'python', label: '🐍 Python Scraper (scraper.py)' },
                { id: 'n8n', label: '🔄 n8n Workflow JSON' },
                { id: 'extension', label: '🧩 Browser Add-on (WebExtension)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveScriptTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap ${
                    activeScriptTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Script Code Preview */}
            <div className="flex-1 p-5 overflow-y-auto bg-[#070709] font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {activeScriptTab === 'bash' && generateYtdlpBashScript(videos, config)}
                {activeScriptTab === 'python' && generatePythonScraperScript(config)}
                {activeScriptTab === 'n8n' && generateN8nWorkflowJson(config)}
                {activeScriptTab === 'extension' && generateWebExtensionFiles(config).popupJs}
              </pre>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-[#141419] border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Derived directly from your document automation specifications
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    let code = '';
                    if (activeScriptTab === 'bash') code = generateYtdlpBashScript(videos, config);
                    if (activeScriptTab === 'python') code = generatePythonScraperScript(config);
                    if (activeScriptTab === 'n8n') code = generateN8nWorkflowJson(config);
                    if (activeScriptTab === 'extension') code = generateWebExtensionFiles(config).popupJs;
                    copyToClipboard(code, 'modal-code');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-mono transition flex items-center gap-1.5"
                >
                  {copiedKey === 'modal-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>Copy Code</span>
                </button>

                <button
                  onClick={() => {
                    if (activeScriptTab === 'bash') {
                      downloadFileBlob(generateYtdlpBashScript(videos, config), 'ytdl.sh', 'text/x-sh');
                    } else if (activeScriptTab === 'python') {
                      downloadFileBlob(generatePythonScraperScript(config), 'scraper.py', 'text/x-python');
                    } else if (activeScriptTab === 'n8n') {
                      downloadFileBlob(generateN8nWorkflowJson(config), 'nfl_yt_dlp_workflow.json', 'application/json');
                    } else {
                      downloadFileBlob(generateWebExtensionFiles(config).popupJs, 'popup.js', 'text/javascript');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black font-mono hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
