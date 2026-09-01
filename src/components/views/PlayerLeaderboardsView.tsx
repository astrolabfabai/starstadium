import React, { useState } from 'react';
import { SeasonCode, SEASONS_LIST } from '../../types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import { PLAYER_STATS } from '../../data/sportsDataMock';
import { BarChart3, Search, TrendingUp, Zap, Target, Calendar } from 'lucide-react';

interface PlayerLeaderboardsViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
}

export const PlayerLeaderboardsView: React.FC<PlayerLeaderboardsViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Passing' | 'Rushing' | 'Receiving' | 'Fantasy'>('Passing');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStats = PLAYER_STATS.filter((p) => {
    if (searchQuery && !p.Name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Scatter data: Yards vs TDs
  const scatterData = filteredStats.map((p) => ({
    name: p.Name,
    team: p.Team,
    yards: selectedCategory === 'Passing' ? p.PassingYards : selectedCategory === 'Rushing' ? p.RushingYards : p.ReceivingYards,
    tds: selectedCategory === 'Passing' ? p.PassingTDs : selectedCategory === 'Rushing' ? p.RushingTDs : p.ReceivingTDs,
    fantasy: p.FantasyPoints
  }));

  // Leaderboard Bar Data
  const barLeaderboardData = [...filteredStats]
    .sort((a, b) => b.FantasyPoints - a.FantasyPoints)
    .map((p) => ({
      name: p.Name,
      FantasyPoints: p.FantasyPoints,
      PassingYards: p.PassingYards,
      RushingYards: p.RushingYards
    }));

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-[#121214] border border-white/10 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <BarChart3 className="w-3.5 h-3.5" /> Endpoint 05 &bull; Season Analytics & Scatter Matrix
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide font-serif italic">Player Leaderboards & Efficiency Scatter</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Endpoint: <code className="text-amber-400 font-mono">/v3/nfl/stats/json/PlayerSeasonStats/{selectedSeason}</code></p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Season Inline Picker */}
            <div className="flex items-center gap-1.5 bg-[#09090b] px-2.5 py-1 rounded border border-white/10 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Season:</span>
              <select
                value={selectedSeason}
                onChange={(e) => onSeasonChange && onSeasonChange(e.target.value as SeasonCode)}
                className="bg-transparent text-amber-400 font-bold font-mono focus:outline-none cursor-pointer"
              >
                {SEASONS_LIST.map((s) => (
                  <option key={s.code} value={s.code} className="bg-[#121214] text-slate-200">
                    {s.label} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Toggle */}
            <div className="bg-[#09090b] p-1 rounded flex items-center gap-1 border border-white/10">
              {(['Passing', 'Rushing', 'Receiving', 'Fantasy'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#09090b] text-slate-200 text-xs rounded pl-9 pr-3 py-1.5 border border-white/10 focus:outline-none focus:border-amber-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scatter Plot Chart */}
          <div className="bg-[#09090b] rounded p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Efficiency Scatter: Yards vs Touchdowns
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis type="number" dataKey="yards" name="Yards" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis type="number" dataKey="tds" name="TDs" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Scatter name="Players" data={scatterData} fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fantasy Points Leaderboard Bar */}
          <div className="bg-[#09090b] rounded p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" /> Fantasy Points Production Ranking
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barLeaderboardData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis type="number" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Bar dataKey="FantasyPoints" name="Fantasy Pts" fill="#f59e0b" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#121214] border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-[#09090b]">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">
            Comprehensive Stat Matrix ({filteredStats.length} Players)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c0c0e] uppercase font-bold text-[10px] tracking-widest text-slate-500 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3">Pos</th>
                <th className="py-3 px-3 text-right">GP</th>
                <th className="py-3 px-3 text-right">Pass Yds</th>
                <th className="py-3 px-3 text-right">Pass TD</th>
                <th className="py-3 px-3 text-right">INT</th>
                <th className="py-3 px-3 text-right">Rush Yds</th>
                <th className="py-3 px-3 text-right">Rush TD</th>
                <th className="py-3 px-3 text-right">Rec Yds</th>
                <th className="py-3 px-3 text-right">Rec TD</th>
                <th className="py-3 px-4 text-right">Fantasy Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredStats.map((p) => (
                <tr key={p.PlayerID} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">{p.Name}</td>
                  <td className="py-3 px-3 text-amber-500 font-bold">{p.Team}</td>
                  <td className="py-3 px-3 text-amber-400 font-bold">{p.Position}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{p.Played}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">{p.PassingYards}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{p.PassingTDs}</td>
                  <td className="py-3 px-3 text-right text-rose-400">{p.Interceptions}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">{p.RushingYards}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{p.RushingTDs}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">{p.ReceivingYards}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{p.ReceivingTDs}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-500 text-sm">{p.FantasyPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
