import React, { useState } from 'react';
import { SeasonCode, SEASONS_LIST } from '../../types';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { STANDINGS_DATA, NFL_TEAMS } from '../../data/sportsDataMock';
import { Trophy, Search, Filter, Shield, Award, ArrowUpDown, Calendar, BarChart2, Layers, TrendingUp } from 'lucide-react';
import { TeamStandingsWidget } from '../widgets/TeamStandingsWidget';

interface StandingsViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
}

type BarChartMode = 'grouped' | 'stacked' | 'differential';

export const StandingsView: React.FC<StandingsViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange
}) => {
  const [selectedConf, setSelectedConf] = useState<'ALL' | 'AFC' | 'NFC'>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof typeof STANDINGS_DATA[0]>('Wins');
  const [sortAsc, setSortAsc] = useState(false);
  const [chartMode, setChartMode] = useState<BarChartMode>('grouped');

  const filteredStandings = STANDINGS_DATA.filter((st) => {
    if (selectedConf !== 'ALL' && st.Conference !== selectedConf) return false;
    if (selectedDivision !== 'ALL' && !st.Division.toLowerCase().includes(selectedDivision.toLowerCase())) return false;
    if (searchQuery && !st.Name.toLowerCase().includes(searchQuery.toLowerCase()) && !st.Team.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  // Recharts Bar Chart Data for Team Win-Loss Records
  const winLossBarData = filteredStandings.map((st) => {
    const teamInfo = NFL_TEAMS.find((t) => t.Key === st.Team);
    return {
      team: st.Team,
      fullName: st.Name,
      wins: st.Wins,
      losses: st.Losses,
      ties: st.Ties,
      winPct: Math.round(st.Percentage * 100),
      pointsDiff: st.PointDifferential,
      pointsFor: st.PointsFor,
      pointsAgainst: st.PointsAgainst,
      primaryColor: teamInfo?.PrimaryColor || '#f59e0b'
    };
  });

  // Radar chart data comparing point diff, win %, home wins, away wins, TDs
  const radarChartData = filteredStandings.slice(0, 6).map((st) => ({
    team: st.Team,
    WinPct: Math.round(st.Percentage * 100),
    PointsDiff: Math.max(0, st.PointDifferential + 100) / 3,
    HomeWins: st.HomeWins * 10,
    AwayWins: st.AwayWins * 10,
    Touchdowns: st.Touchdowns
  }));

  // Home vs Away wins stacked bar chart
  const homeAwayData = filteredStandings.map((st) => ({
    name: st.Team,
    HomeWins: st.HomeWins,
    AwayWins: st.AwayWins,
    PointsFor: st.PointsFor,
    PointsAgainst: st.PointsAgainst
  }));

  const handleSort = (field: keyof typeof STANDINGS_DATA[0]) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Custom Tooltip for Win-Loss Recharts Bar Graph
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#121214] border border-amber-500/30 p-3 rounded shadow-xl text-xs space-y-1.5 font-mono">
          <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: data.primaryColor }}
            />
            <span className="font-bold font-sans text-white text-sm">{data.fullName}</span>
            <span className="text-slate-400 font-mono">({data.team})</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
            <div>Wins: <span className="text-emerald-400 font-bold">{data.wins}</span></div>
            <div>Losses: <span className="text-rose-400 font-bold">{data.losses}</span></div>
            <div>Win PCT: <span className="text-amber-400 font-bold">{data.winPct}%</span></div>
            <div>Diff: <span className={data.pointsDiff >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {data.pointsDiff >= 0 ? `+${data.pointsDiff}` : data.pointsDiff}
            </span></div>
            <div>PF: <span className="text-slate-200">{data.pointsFor}</span></div>
            <div>PA: <span className="text-slate-200">{data.pointsAgainst}</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Flagship Team Standings & Division Rankings Widget */}
      <TeamStandingsWidget
        initialSeason={selectedSeason}
      />

      {/* Advanced Visualizations & Recharts Analytics */}
      <div className="bg-[#121214] border border-white/10 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <Trophy className="w-3.5 h-3.5" /> Analytics Engine &bull; Visual Record Diagnostics
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide font-serif italic">Comparative Team Analytics ({selectedSeason})</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Endpoint: <code className="text-amber-400 font-mono">/v3/nfl/scores/json/Standings/{selectedSeason}</code></p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Conference Selector */}
            <div className="bg-[#09090b] p-1 rounded-lg flex items-center gap-1 border border-white/10">
              {(['ALL', 'AFC', 'NFC'] as const).map((conf) => (
                <button
                  key={conf}
                  onClick={() => setSelectedConf(conf)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    selectedConf === conf
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>

            {/* Division Filter */}
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-[#09090b] text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-white/10 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Divisions</option>
              <option value="East">East</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>

        {/* Primary Recharts Bar Graph: Win-Loss Records Visualization */}
        <div className="bg-[#09090b] rounded-xl p-5 border border-white/10 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-500" /> Team Win-Loss Records ({selectedSeason})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Interactive Recharts bar graph visualizing wins vs. losses across all {winLossBarData.length} teams in the selection
              </p>
            </div>

            {/* Chart Display Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setChartMode('grouped')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                  chartMode === 'grouped' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3 h-3" /> Grouped
              </button>
              <button
                onClick={() => setChartMode('stacked')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                  chartMode === 'stacked' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" /> Stacked
              </button>
              <button
                onClick={() => setChartMode('differential')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                  chartMode === 'differential' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3 h-3" /> Differential
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winLossBarData} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.6} />
                <XAxis
                  dataKey="team"
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                />

                {chartMode === 'grouped' && (
                  <>
                    <Bar dataKey="wins" name="Wins (W)" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="losses" name="Losses (L)" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </>
                )}

                {chartMode === 'stacked' && (
                  <>
                    <Bar dataKey="wins" name="Wins (W)" stackId="record" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="losses" name="Losses (L)" stackId="record" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </>
                )}

                {chartMode === 'differential' && (
                  <Bar dataKey="pointsDiff" name="Point Differential (+/-)" radius={[3, 3, 0, 0]}>
                    {winLossBarData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pointsDiff >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-[#09090b] rounded-xl p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Multi-Attribute Team Radar (Top Contenders)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="team" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" />
                  <Radar name="Win Pct (%)" dataKey="WinPct" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Radar name="Touchdowns" dataKey="Touchdowns" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Home vs Away Stacked Bar */}
          <div className="bg-[#09090b] rounded-xl p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" /> Home vs Away Win Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={homeAwayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Legend />
                  <Bar dataKey="HomeWins" name="Home Wins" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="AwayWins" name="Away Wins" fill="#3f3f46" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


