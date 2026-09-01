import React, { useState } from 'react';
import { SeasonCode, SEASONS_LIST } from '../../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PLAYERS_DATA, NFL_TEAMS } from '../../data/sportsDataMock';
import { Users, Search, DollarSign, Award, Shirt, ShieldAlert, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

interface TeamsRostersViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
}

export const TeamsRostersView: React.FC<TeamsRostersViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange
}) => {
  const [selectedTeamKey, setSelectedTeamKey] = useState<string>('KC');
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeTeam = NFL_TEAMS.find((t) => t.Key === selectedTeamKey) || NFL_TEAMS[0];

  const filteredPlayers = PLAYERS_DATA.filter((p) => {
    if (selectedTeamKey !== 'ALL' && p.Team !== selectedTeamKey) return false;
    if (selectedPos !== 'ALL' && p.Position !== selectedPos) return false;
    if (searchQuery && !`${p.FirstName} ${p.LastName}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Position count for Donut chart
  const posCounts = PLAYERS_DATA.reduce((acc, p) => {
    acc[p.Position] = (acc[p.Position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(posCounts).map(([name, value]) => ({ name, value }));

  // Salary & Age bar chart data
  const salaryAgeData = filteredPlayers.map((p) => ({
    name: `${p.FirstName[0]}. ${p.LastName}`,
    SalaryMillions: Math.round((p.Salary / 1000000) * 10) / 10,
    Age: p.Age,
    Experience: p.Experience
  }));

  return (
    <div className="space-y-6">
      {/* View Header & Team Picker */}
      <div className="bg-[#121214] border border-white/10 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <Users className="w-3.5 h-3.5" /> Endpoint 02 &bull; Team Profiles & Salary Ratios
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide font-serif italic">Teams & Roster Analytics Explorer</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Endpoints: <code className="text-amber-400 font-mono">/v3/nfl/scores/json/Teams/{selectedSeason}</code> & <code className="text-amber-400 font-mono">/v3/nfl/scores/json/Players/{selectedTeamKey}</code></p>
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

            {/* Team Dropdown */}
            <div className="flex items-center gap-2 bg-[#09090b] p-1.5 rounded border border-white/10">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">Team:</span>
              <select
                value={selectedTeamKey}
                onChange={(e) => setSelectedTeamKey(e.target.value)}
                className="bg-[#121214] text-white font-semibold text-xs rounded px-3 py-1 border border-white/10 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Teams (32)</option>
                {NFL_TEAMS.map((t) => (
                  <option key={t.Key} value={t.Key}>
                    {t.City} {t.Name} ({t.Key})
                  </option>
                ))}
              </select>
            </div>

            {/* Position Filter */}
            <select
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="bg-[#09090b] text-slate-200 text-xs rounded px-3 py-1.5 border border-white/10 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Positions</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
              <option value="DB">DB</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#09090b] text-slate-200 text-xs rounded pl-9 pr-3 py-1.5 border border-white/10 focus:outline-none focus:border-amber-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Selected Team Profile Card */}
        {selectedTeamKey !== 'ALL' && activeTeam && (
          <div
            className="p-4 rounded border flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-inner bg-[#09090b]"
            style={{
              borderColor: `${activeTeam.PrimaryColor}60`
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded flex items-center justify-center font-bold text-white text-lg shadow-lg border"
                style={{ backgroundColor: activeTeam.PrimaryColor, borderColor: activeTeam.SecondaryColor }}
              >
                {activeTeam.Key}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-serif">{activeTeam.FullName}</h3>
                <p className="text-xs text-slate-300">
                  {activeTeam.Conference} {activeTeam.Division} &bull; Coach: <span className="text-white font-medium">{activeTeam.HeadCoach}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Stadium: {activeTeam.StadiumName} &bull; Scheme: {activeTeam.OffensiveScheme} / {activeTeam.DefensiveScheme}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-right text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase tracking-widest text-[9px] block">Roster Size</span>
                <span className="text-sm font-bold text-white">{filteredPlayers.length} Players</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-widest text-[9px] block">Avg Salary</span>
                <span className="text-sm font-bold text-amber-500">
                  ${Math.round(filteredPlayers.reduce((acc, p) => acc + p.Salary, 0) / (filteredPlayers.length || 1) / 1000000)}M
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart: Position Breakdown */}
          <div className="bg-[#09090b] rounded p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2">
              <Shirt className="w-4 h-4 text-amber-500" /> Positional Distribution Ratio
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Salary in Millions */}
          <div className="bg-[#09090b] rounded p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" /> Player Contract Values ($ Millions)
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryAgeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Bar dataKey="SalaryMillions" name="Salary ($M)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Cards / Data Table */}
      <div className="bg-[#121214] border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-[#09090b] flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">
            Player Roster Matrix ({filteredPlayers.length} Active Profiles)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c0c0e] uppercase font-bold text-[10px] tracking-widest text-slate-500 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3">Pos</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Age</th>
                <th className="py-3 px-3 text-right">Height / Wt</th>
                <th className="py-3 px-3">College</th>
                <th className="py-3 px-3">Draft Info</th>
                <th className="py-3 px-4 text-right">Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredPlayers.map((p) => (
                <tr key={p.PlayerID} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-bold">#{p.Number}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-white flex items-center gap-3">
                    <img
                      src={p.PhotoUrl}
                      alt={p.LastName}
                      className="w-8 h-8 rounded-full object-cover border border-white/10 bg-[#09090b]"
                    />
                    <div>
                      <div>{p.FirstName} {p.LastName}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{p.Experience} Yrs Exp</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans font-bold text-amber-500">{p.Team}</td>
                  <td className="py-3 px-3 font-sans font-bold text-amber-400">{p.Position}</td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.Status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {p.Status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">{p.Age}</td>
                  <td className="py-3 px-3 text-right text-slate-400">{p.Height} / {p.Weight}lbs</td>
                  <td className="py-3 px-3 font-sans text-slate-300">{p.College}</td>
                  <td className="py-3 px-3 font-sans text-slate-400">
                    {p.DraftYear ? `'${p.DraftYear % 100} R${p.DraftRound} P${p.DraftPick}` : 'UFA'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-500">
                    ${(p.Salary / 1000000).toFixed(1)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
