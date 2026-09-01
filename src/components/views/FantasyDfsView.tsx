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
  Bar
} from 'recharts';
import { FANTASY_DFS_PLAYERS } from '../../data/sportsDataMock';
import { Sparkles, DollarSign, Calculator, Target, Users, Calendar } from 'lucide-react';

interface FantasyDfsViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
}

export const FantasyDfsView: React.FC<FantasyDfsViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'DraftKings' | 'FanDuel'>('DraftKings');

  const scatterData = FANTASY_DFS_PLAYERS.map((p) => ({
    name: p.Name,
    salary: selectedPlatform === 'DraftKings' ? p.DraftKingsSalary : p.FanDuelSalary,
    projPoints: p.ProjectedPoints,
    value: p.ValueScore
  }));

  const valueBarData = FANTASY_DFS_PLAYERS.map((p) => ({
    name: p.Name,
    ValueScore: p.ValueScore,
    ProjectedPoints: p.ProjectedPoints
  }));

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-[#121214] border border-white/10 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Endpoint 09 &bull; Fantasy Projections & DFS Value Matrix
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide font-serif italic">Daily Fantasy (DFS) Salary & Value Optimizer</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Endpoint: <code className="text-amber-400 font-mono">/v3/nfl/projections/json/DfsSlatesByWeek/{selectedSeason}/1</code></p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Season Inline Picker */}
            <div className="flex items-center gap-1.5 bg-[#09090b] px-2.5 py-1.5 rounded border border-white/10 text-xs">
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

            <div className="flex items-center gap-2 bg-[#09090b] p-1.5 rounded border border-white/10">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">Platform:</span>
              {(['DraftKings', 'FanDuel'] as const).map((pf) => (
                <button
                  key={pf}
                  onClick={() => setSelectedPlatform(pf)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    selectedPlatform === pf
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {pf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scatter Chart: Salary vs Projected Points */}
          <div className="bg-[#09090b] rounded p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" /> Salary vs Projected Points Correlation
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis type="number" dataKey="salary" name="Salary ($)" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis type="number" dataKey="projPoints" name="Proj Pts" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Scatter name="DFS Players" data={scatterData} fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Value Score Bar Chart */}
          <div className="bg-[#09090b] rounded p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" /> Value Score (Points per $1k Salary)
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Bar dataKey="ValueScore" name="Value Score" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* DFS Slate Table */}
      <div className="bg-[#121214] border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-[#09090b]">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">
            DFS Projections & Salary Matrix ({FANTASY_DFS_PLAYERS.length} Players)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c0c0e] uppercase font-bold text-[10px] tracking-widest text-slate-500 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3">Pos</th>
                <th className="py-3 px-3">Opponent</th>
                <th className="py-3 px-3 text-right">DraftKings Salary</th>
                <th className="py-3 px-3 text-right">FanDuel Salary</th>
                <th className="py-3 px-3 text-right">Proj Pts</th>
                <th className="py-3 px-3 text-right">Floor / Ceiling</th>
                <th className="py-3 px-3 text-right">Proj Own %</th>
                <th className="py-3 px-4 text-right">Value Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {FANTASY_DFS_PLAYERS.map((p) => (
                <tr key={p.PlayerID} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">{p.Name}</td>
                  <td className="py-3 px-3 font-sans font-bold text-amber-500">{p.Team}</td>
                  <td className="py-3 px-3 font-sans font-bold text-amber-400">{p.Position}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{p.Opponent}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">${p.DraftKingsSalary}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">${p.FanDuelSalary}</td>
                  <td className="py-3 px-3 text-right font-bold text-amber-400 text-sm">{p.ProjectedPoints}</td>
                  <td className="py-3 px-3 text-right text-slate-400">{p.FloorPoints} - {p.CeilingPoints}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{p.ProjectedOwnershipPct}%</td>
                  <td className="py-3 px-4 text-right font-extrabold text-amber-500">{p.ValueScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
