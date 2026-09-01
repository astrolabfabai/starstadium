import React, { useState, useEffect, useMemo } from 'react';
import { TeamStanding, SeasonCode, SEASONS_LIST, Team } from '../../types';
import { STANDINGS_DATA, NFL_TEAMS } from '../../data/sportsDataMock';
import {
  Trophy,
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  Layers,
  Table,
  LayoutGrid,
  Download,
  Copy,
  Check,
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';

export interface TeamStandingsWidgetProps {
  initialSeason?: SeasonCode;
  compact?: boolean;
  onSelectTeam?: (teamKey: string) => void;
  showChartsLink?: boolean;
  className?: string;
}

type DisplayLayout = 'divisions' | 'conference' | 'league';
type SortField = keyof TeamStanding;

const DIVISIONS = ['East', 'North', 'South', 'West'] as const;
const CONFERENCES = ['AFC', 'NFC'] as const;

export const TeamStandingsWidget: React.FC<TeamStandingsWidgetProps> = ({
  initialSeason = '2026REG',
  compact = false,
  onSelectTeam,
  showChartsLink = true,
  className = ''
}) => {
  const [season, setSeason] = useState<SeasonCode>(initialSeason);
  const [standings, setStandings] = useState<TeamStanding[]>(STANDINGS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'sportsdata_live' | 'sportsdata_cache' | 'mock'>('mock');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [layoutMode, setLayoutMode] = useState<DisplayLayout>('divisions');
  const [selectedConference, setSelectedConference] = useState<'ALL' | 'AFC' | 'NFC'>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('Percentage');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [inspectedTeam, setInspectedTeam] = useState<TeamStanding | null>(null);

  // Fetch standings data from SportsData API endpoint or fallback
  const fetchStandings = async (targetSeason: SeasonCode) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sportsdata/standings?season=${targetSeason}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          setStandings(json);
          setDataSource('sportsdata_cache');
        } else if (json.data && Array.isArray(json.data)) {
          setStandings(json.data);
          setDataSource(json.source === 'sportsdata_live_api' ? 'sportsdata_live' : 'sportsdata_cache');
        } else {
          setStandings(STANDINGS_DATA);
          setDataSource('mock');
        }
      } else {
        setStandings(STANDINGS_DATA);
        setDataSource('mock');
      }
    } catch (err) {
      console.warn('Failed to fetch from /api/sportsdata/standings, using local dataset:', err);
      setStandings(STANDINGS_DATA);
      setDataSource('mock');
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchStandings(season);
  }, [season]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // Default ascending for Losses or PointsAgainst, descending for others
      setSortAsc(field === 'Losses' || field === 'PointsAgainst' || field === 'DivisionLosses' || field === 'ConferenceLosses');
    }
  };

  // Helper to get matching NFL team metadata
  const getTeamInfo = (teamKey: string): Team | undefined => {
    return NFL_TEAMS.find((t) => t.Key === teamKey);
  };

  // Sort and filter helper
  const sortTeams = (teams: TeamStanding[]) => {
    return [...teams].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
  };

  // Filtered dataset for global searches or conference/division views
  const filteredTeams = useMemo(() => {
    return standings.filter((t) => {
      if (selectedConference !== 'ALL' && t.Conference !== selectedConference) return false;
      if (selectedDivision !== 'ALL' && !t.Division.toLowerCase().includes(selectedDivision.toLowerCase())) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = t.Name.toLowerCase().includes(query);
        const matchTeam = t.Team.toLowerCase().includes(query);
        const teamInfo = getTeamInfo(t.Team);
        const matchCity = teamInfo?.City.toLowerCase().includes(query) || false;
        if (!matchName && !matchTeam && !matchCity) return false;
      }
      return true;
    });
  }, [standings, selectedConference, selectedDivision, searchQuery]);

  // Grouped by Conference & Division
  const divisionGroups = useMemo(() => {
    const groups: { conference: 'AFC' | 'NFC'; division: string; teams: TeamStanding[] }[] = [];
    CONFERENCES.forEach((conf) => {
      if (selectedConference !== 'ALL' && selectedConference !== conf) return;
      DIVISIONS.forEach((div) => {
        if (selectedDivision !== 'ALL' && selectedDivision.toLowerCase() !== div.toLowerCase()) return;
        const divTeams = standings.filter(
          (t) => t.Conference === conf && t.Division.toLowerCase().includes(div.toLowerCase())
        );
        if (divTeams.length > 0) {
          // If searching, filter them
          const filtered = searchQuery
            ? divTeams.filter((t) => {
                const query = searchQuery.toLowerCase();
                const info = getTeamInfo(t.Team);
                return (
                  t.Name.toLowerCase().includes(query) ||
                  t.Team.toLowerCase().includes(query) ||
                  info?.City.toLowerCase().includes(query)
                );
              })
            : divTeams;

          if (filtered.length > 0) {
            groups.push({
              conference: conf,
              division: div,
              teams: sortTeams(filtered)
            });
          }
        }
      });
    });
    return groups;
  }, [standings, selectedConference, selectedDivision, searchQuery, sortField, sortAsc]);

  // Conference Standings (1-16 ranked with playoff cutoffs)
  const conferenceStandings = useMemo(() => {
    const afc = sortTeams(standings.filter((t) => t.Conference === 'AFC'));
    const nfc = sortTeams(standings.filter((t) => t.Conference === 'NFC'));
    return { afc, nfc };
  }, [standings, sortField, sortAsc]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Rank', 'Team', 'Name', 'Conference', 'Division', 'Wins', 'Losses', 'Ties', 'PCT', 'PF', 'PA', 'DIFF', 'Home', 'Away', 'Div', 'Conf', 'Streak'];
    const rows = filteredTeams.map((t, idx) => [
      idx + 1,
      t.Team,
      `"${t.Name}"`,
      t.Conference,
      t.Division,
      t.Wins,
      t.Losses,
      t.Ties,
      t.Percentage.toFixed(3),
      t.PointsFor,
      t.PointsAgainst,
      t.PointDifferential,
      `"${t.HomeWins}-${t.HomeLosses}"`,
      `"${t.AwayWins}-${t.AwayLosses}"`,
      `"${t.DivisionWins}-${t.DivisionLosses}"`,
      `"${t.ConferenceWins}-${t.ConferenceLosses}"`,
      t.Streak
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NFL_Standings_${season}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy JSON
  const copyTableJson = () => {
    navigator.clipboard.writeText(JSON.stringify(filteredTeams, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Sort Header Indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-amber-400 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-amber-400 font-bold" />
    );
  };

  // Render Playoff Tag
  const getPlayoffTag = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold tracking-tight">
          #1 SEED (BYE)
        </span>
      );
    }
    if (rank <= 4) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold tracking-tight">
          DIV LEADER (#{rank})
        </span>
      );
    }
    if (rank <= 7) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[9px] font-bold tracking-tight">
          WILD CARD (#{rank})
        </span>
      );
    }
    if (rank <= 10) {
      return (
        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-medium tracking-tight">
          IN HUNT
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`bg-[#121214] border border-white/10 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Widget Header Banner */}
      <div className="bg-[#0e0e11] border-b border-white/10 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide font-serif italic">
                  NFL Team Standings & Division Rankings
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                  SportsData.io v3 API
                </span>
                {dataSource === 'sportsdata_live' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Live Feed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5 flex items-center gap-2">
                <span>Official division hierarchies, playoff seeds, tiebreakers & point differentials</span>
                <span className="text-slate-600">&bull;</span>
                <span className="font-mono text-slate-500 text-[11px]">Synced: {lastUpdated}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Season Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Season Selector */}
            <div className="flex items-center gap-1.5 bg-[#18181b] px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Season:</span>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value as SeasonCode)}
                className="bg-transparent text-amber-400 font-bold font-mono focus:outline-none cursor-pointer text-xs"
              >
                {SEASONS_LIST.map((s) => (
                  <option key={s.code} value={s.code} className="bg-[#18181b] text-slate-200">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchStandings(season)}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-mono"
              title="Refresh Standings Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">🔄 Sync</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportToCSV}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-mono"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">📥 CSV</span>
            </button>

            {/* Copy JSON */}
            <button
              onClick={copyTableJson}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-mono"
              title="Copy JSON to Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : '📋 JSON'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher & Filters Bar */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Layout Mode Toggles */}
          <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setLayoutMode('divisions')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                layoutMode === 'divisions'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🏆</span>
              <span>Division Grid</span>
            </button>
            <button
              onClick={() => setLayoutMode('conference')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                layoutMode === 'conference'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🎖️</span>
              <span>Playoff Seeds</span>
            </button>
            <button
              onClick={() => setLayoutMode('league')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                layoutMode === 'league'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📊</span>
              <span>32-Team Table</span>
            </button>
          </div>

          {/* Conference Filter / Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Conference Selector */}
            <div className="flex items-center bg-[#18181b] p-0.5 rounded-lg border border-white/10">
              {(['ALL', 'AFC', 'NFC'] as const).map((conf) => (
                <button
                  key={conf}
                  onClick={() => setSelectedConference(conf)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    selectedConference === conf
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>

            {/* Division Filter */}
            {layoutMode !== 'conference' && (
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="bg-[#18181b] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-white/10 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All 4 Divisions</option>
                <option value="East">East</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="West">West</option>
              </select>
            )}

            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search team or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#18181b] text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-white/10 focus:outline-none focus:border-amber-500 w-full sm:w-44 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        {/* Division Grid Layout */}
        {layoutMode === 'divisions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
            {divisionGroups.map((group) => (
              <div
                key={`${group.conference}-${group.division}`}
                className="bg-[#0b0b0d] border border-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col"
              >
                {/* Division Header */}
                <div className="px-4 py-3 bg-[#151518] border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        group.conference === 'AFC' ? 'bg-rose-500' : 'bg-blue-500'
                      }`}
                    />
                    <h4 className="font-bold text-white text-sm font-sans tracking-wide">
                      {group.conference} {group.division}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Leader: {group.teams[0]?.Team} ({group.teams[0]?.Wins}-{group.teams[0]?.Losses})
                  </span>
                </div>

                {/* Division Standings Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#101014] uppercase text-[10px] font-bold font-mono tracking-wider text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="py-2.5 px-3">Team</th>
                        <th
                          onClick={() => handleSort('Wins')}
                          className="py-2.5 px-2 text-right cursor-pointer hover:text-white"
                        >
                          <div className="inline-flex items-center gap-0.5">W {renderSortIndicator('Wins')}</div>
                        </th>
                        <th
                          onClick={() => handleSort('Losses')}
                          className="py-2.5 px-2 text-right cursor-pointer hover:text-white"
                        >
                          <div className="inline-flex items-center gap-0.5">L {renderSortIndicator('Losses')}</div>
                        </th>
                        <th
                          onClick={() => handleSort('Percentage')}
                          className="py-2.5 px-2 text-right cursor-pointer hover:text-white"
                        >
                          <div className="inline-flex items-center gap-0.5">PCT {renderSortIndicator('Percentage')}</div>
                        </th>
                        <th
                          onClick={() => handleSort('PointDifferential')}
                          className="py-2.5 px-2 text-right cursor-pointer hover:text-white"
                        >
                          <div className="inline-flex items-center gap-0.5">DIFF {renderSortIndicator('PointDifferential')}</div>
                        </th>
                        <th className="py-2.5 px-2 text-center">DIV</th>
                        <th className="py-2.5 px-2 text-center">CONF</th>
                        <th
                          onClick={() => handleSort('Streak')}
                          className="py-2.5 px-3 text-center cursor-pointer hover:text-white"
                        >
                          STRK
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {group.teams.map((team, idx) => {
                        const teamInfo = getTeamInfo(team.Team);
                        const isLeader = idx === 0;
                        return (
                          <tr
                            key={team.Team}
                            onClick={() => {
                              setInspectedTeam(team);
                              if (onSelectTeam) onSelectTeam(team.Team);
                            }}
                            className="hover:bg-amber-500/5 transition-colors cursor-pointer group"
                          >
                            <td className="py-2.5 px-3 font-sans">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-4 text-[11px] font-bold font-mono ${
                                    isLeader ? 'text-amber-400' : 'text-slate-500'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: teamInfo?.PrimaryColor || '#f59e0b' }}
                                />
                                <div>
                                  <div className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                                    <span>{team.Name}</span>
                                    <span className="text-[11px] text-slate-500 font-mono">({team.Team})</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold text-emerald-400">{team.Wins}</td>
                            <td className="py-2.5 px-2 text-right text-rose-400">{team.Losses}</td>
                            <td className="py-2.5 px-2 text-right text-slate-200 font-bold">
                              {team.Percentage.toFixed(3)}
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  team.PointDifferential >= 0
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : 'text-rose-400 bg-rose-500/10'
                                }`}
                              >
                                {team.PointDifferential > 0 ? `+${team.PointDifferential}` : team.PointDifferential}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">
                              {team.DivisionWins}-{team.DivisionLosses}
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">
                              {team.ConferenceWins}-{team.ConferenceLosses}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-sans ${
                                  team.Streak.startsWith('W')
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {team.Streak}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Conference Playoff Seeding Layout */}
        {layoutMode === 'conference' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {(['AFC', 'NFC'] as const).map((conf) => {
              if (selectedConference !== 'ALL' && selectedConference !== conf) return null;
              const confList = conf === 'AFC' ? conferenceStandings.afc : conferenceStandings.nfc;
              return (
                <div
                  key={conf}
                  className="bg-[#0b0b0d] border border-white/10 rounded-xl overflow-hidden shadow-lg flex flex-col"
                >
                  <div className="p-4 bg-[#151518] border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${conf === 'AFC' ? 'text-rose-500' : 'text-blue-500'}`} />
                      <h4 className="font-bold text-white text-base font-sans">{conf} Conference Standings</h4>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">16 Teams &bull; Top 7 Qualify</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#101014] uppercase text-[10px] font-bold font-mono tracking-wider text-slate-400 border-b border-white/10">
                        <tr>
                          <th className="py-3 px-3">Seed & Team</th>
                          <th className="py-3 px-2">Div</th>
                          <th
                            onClick={() => handleSort('Wins')}
                            className="py-3 px-2 text-right cursor-pointer hover:text-white"
                          >
                            W
                          </th>
                          <th
                            onClick={() => handleSort('Losses')}
                            className="py-3 px-2 text-right cursor-pointer hover:text-white"
                          >
                            L
                          </th>
                          <th
                            onClick={() => handleSort('Percentage')}
                            className="py-3 px-2 text-right cursor-pointer hover:text-white"
                          >
                            PCT
                          </th>
                          <th
                            onClick={() => handleSort('PointDifferential')}
                            className="py-3 px-2 text-right cursor-pointer hover:text-white"
                          >
                            DIFF
                          </th>
                          <th className="py-3 px-2 text-center">HOME</th>
                          <th className="py-3 px-2 text-center">AWAY</th>
                          <th className="py-3 px-3 text-center">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {confList.map((team, idx) => {
                          const seed = idx + 1;
                          const teamInfo = getTeamInfo(team.Team);
                          const isCutoff = seed === 7;
                          return (
                            <React.Fragment key={team.Team}>
                              <tr
                                onClick={() => {
                                  setInspectedTeam(team);
                                  if (onSelectTeam) onSelectTeam(team.Team);
                                }}
                                className={`hover:bg-white/5 transition-colors cursor-pointer ${
                                  seed <= 7 ? 'bg-emerald-500/[0.02]' : ''
                                }`}
                              >
                                <td className="py-2.5 px-3 font-sans">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-5 text-xs font-bold font-mono ${
                                        seed <= 4
                                          ? 'text-amber-400'
                                          : seed <= 7
                                          ? 'text-cyan-400'
                                          : 'text-slate-500'
                                      }`}
                                    >
                                      #{seed}
                                    </span>
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: teamInfo?.PrimaryColor || '#f59e0b' }}
                                    />
                                    <span className="font-bold text-white hover:text-amber-400">{team.Name}</span>
                                    <span className="text-[11px] text-slate-500 font-mono">({team.Team})</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-2 text-slate-400 font-sans text-[11px]">{team.Division}</td>
                                <td className="py-2.5 px-2 text-right font-bold text-emerald-400">{team.Wins}</td>
                                <td className="py-2.5 px-2 text-right text-rose-400">{team.Losses}</td>
                                <td className="py-2.5 px-2 text-right text-slate-200 font-bold">
                                  {team.Percentage.toFixed(3)}
                                </td>
                                <td className="py-2.5 px-2 text-right">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      team.PointDifferential >= 0
                                        ? 'text-emerald-400 bg-emerald-500/10'
                                        : 'text-rose-400 bg-rose-500/10'
                                    }`}
                                  >
                                    {team.PointDifferential > 0 ? `+${team.PointDifferential}` : team.PointDifferential}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">
                                  {team.HomeWins}-{team.HomeLosses}
                                </td>
                                <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">
                                  {team.AwayWins}-{team.AwayLosses}
                                </td>
                                <td className="py-2.5 px-3 text-center">{getPlayoffTag(seed)}</td>
                              </tr>
                              {isCutoff && (
                                <tr className="bg-amber-500/10 border-y border-amber-500/30">
                                  <td colSpan={9} className="py-1 px-4 text-center text-[10px] font-bold uppercase tracking-widest text-amber-400 font-mono">
                                    ▲ PLAYOFF QUALIFICATION CUTOFF (TOP 7 SEEDS) ▲
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 32-Team Full League Sortable Table */}
        {layoutMode === 'league' && (
          <div className="bg-[#0b0b0d] border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="p-3 bg-[#151518] border-b border-white/10 flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Full 32-Team Ranking Matrix ({filteredTeams.length} Shown)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Click any column header to sort</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#101014] uppercase text-[10px] font-bold font-mono tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th onClick={() => handleSort('Name')} className="py-3 px-3 cursor-pointer hover:text-white">
                      <div className="flex items-center gap-1">Team {renderSortIndicator('Name')}</div>
                    </th>
                    <th onClick={() => handleSort('Conference')} className="py-3 px-2 cursor-pointer hover:text-white">
                      <div className="flex items-center gap-1">Conf {renderSortIndicator('Conference')}</div>
                    </th>
                    <th onClick={() => handleSort('Division')} className="py-3 px-2 cursor-pointer hover:text-white">
                      <div className="flex items-center gap-1">Div {renderSortIndicator('Division')}</div>
                    </th>
                    <th onClick={() => handleSort('Wins')} className="py-3 px-2 text-right cursor-pointer hover:text-white">
                      <div className="flex items-center justify-end gap-1">W {renderSortIndicator('Wins')}</div>
                    </th>
                    <th onClick={() => handleSort('Losses')} className="py-3 px-2 text-right cursor-pointer hover:text-white">
                      <div className="flex items-center justify-end gap-1">L {renderSortIndicator('Losses')}</div>
                    </th>
                    <th onClick={() => handleSort('Percentage')} className="py-3 px-2 text-right cursor-pointer hover:text-white">
                      <div className="flex items-center justify-end gap-1">PCT {renderSortIndicator('Percentage')}</div>
                    </th>
                    <th onClick={() => handleSort('PointsFor')} className="py-3 px-2 text-right cursor-pointer hover:text-white">
                      <div className="flex items-center justify-end gap-1">PF {renderSortIndicator('PointsFor')}</div>
                    </th>
                    <th onClick={() => handleSort('PointsAgainst')} className="py-3 px-2 text-right cursor-pointer hover:text-white">
                      <div className="flex items-center justify-end gap-1">PA {renderSortIndicator('PointsAgainst')}</div>
                    </th>
                    <th onClick={() => handleSort('PointDifferential')} className="py-3 px-2 text-right cursor-pointer hover:text-white">
                      <div className="flex items-center justify-end gap-1">DIFF {renderSortIndicator('PointDifferential')}</div>
                    </th>
                    <th className="py-3 px-2 text-center">HOME</th>
                    <th className="py-3 px-2 text-center">AWAY</th>
                    <th className="py-3 px-2 text-center">DIV REC</th>
                    <th onClick={() => handleSort('Streak')} className="py-3 px-3 text-center cursor-pointer hover:text-white">
                      STRK
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredTeams.map((team, idx) => {
                    const teamInfo = getTeamInfo(team.Team);
                    return (
                      <tr
                        key={team.Team}
                        onClick={() => {
                          setInspectedTeam(team);
                          if (onSelectTeam) onSelectTeam(team.Team);
                        }}
                        className="hover:bg-amber-500/5 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-3 px-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: teamInfo?.PrimaryColor || '#f59e0b' }}
                            />
                            <span className="font-bold text-white group-hover:text-amber-400 transition-colors">
                              {team.Name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">({team.Team})</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-300 font-sans">{team.Conference}</td>
                        <td className="py-3 px-2 text-slate-300 font-sans">{team.Division}</td>
                        <td className="py-3 px-2 text-right font-bold text-emerald-400">{team.Wins}</td>
                        <td className="py-3 px-2 text-right text-rose-400">{team.Losses}</td>
                        <td className="py-3 px-2 text-right font-bold text-white">{team.Percentage.toFixed(3)}</td>
                        <td className="py-3 px-2 text-right text-slate-300">{team.PointsFor}</td>
                        <td className="py-3 px-2 text-right text-slate-300">{team.PointsAgainst}</td>
                        <td className="py-3 px-2 text-right font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              team.PointDifferential >= 0
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                            }`}
                          >
                            {team.PointDifferential > 0 ? `+${team.PointDifferential}` : team.PointDifferential}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-400">{team.HomeWins}-{team.HomeLosses}</td>
                        <td className="py-3 px-2 text-center text-slate-400">{team.AwayWins}-{team.AwayLosses}</td>
                        <td className="py-3 px-2 text-center text-slate-400">{team.DivisionWins}-{team.DivisionLosses}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-sans ${
                              team.Streak.startsWith('W')
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {team.Streak}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Team Details Quick Drawer / Inspector Modal */}
      {inspectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setInspectedTeam(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const info = getTeamInfo(inspectedTeam.Team);
              return (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/20"
                      style={{ backgroundColor: info?.PrimaryColor || '#f59e0b' }}
                    >
                      {inspectedTeam.Team}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{info?.City} {inspectedTeam.Name}</h3>
                      <p className="text-xs text-amber-400 font-mono">
                        {inspectedTeam.Conference} {inspectedTeam.Division} &bull; {season}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#09090b] p-3 rounded-xl border border-white/5 text-center font-mono">
                    <div className="p-2 rounded bg-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Record</div>
                      <div className="text-sm font-bold text-emerald-400">
                        {inspectedTeam.Wins}-{inspectedTeam.Losses}{inspectedTeam.Ties > 0 ? `-${inspectedTeam.Ties}` : ''}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Win PCT</div>
                      <div className="text-sm font-bold text-white">
                        {inspectedTeam.Percentage.toFixed(3)}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-sans">Differential</div>
                      <div className={`text-sm font-bold ${inspectedTeam.PointDifferential >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {inspectedTeam.PointDifferential > 0 ? `+${inspectedTeam.PointDifferential}` : inspectedTeam.PointDifferential}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Head Coach:</span>
                      <span className="text-white font-semibold">{info?.HeadCoach || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Home Stadium:</span>
                      <span className="text-white font-semibold">{info?.StadiumName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Offensive Scheme:</span>
                      <span className="text-slate-200">{info?.OffensiveScheme || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Defensive Scheme:</span>
                      <span className="text-slate-200">{info?.DefensiveScheme || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Home / Away Splits:</span>
                      <span className="text-amber-400 font-mono">
                        Home {inspectedTeam.HomeWins}-{inspectedTeam.HomeLosses} | Away {inspectedTeam.AwayWins}-{inspectedTeam.AwayLosses}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Points (Scored / Allowed):</span>
                      <span className="text-slate-200 font-mono">
                        PF: {inspectedTeam.PointsFor} | PA: {inspectedTeam.PointsAgainst}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Current Streak:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inspectedTeam.Streak.startsWith('W') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {inspectedTeam.Streak}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setInspectedTeam(null)}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Close Inspector
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
