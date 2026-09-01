import React, { useState } from 'react';
import { SeasonCode, SEASONS_LIST } from '../../types';
import { DEPTH_CHARTS, INJURIES_DATA } from '../../data/sportsDataMock';
import { Activity, HeartPulse, AlertTriangle, ShieldCheck, UserCheck, Stethoscope, Calendar } from 'lucide-react';

interface DepthInjuryViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
}

export const DepthInjuryView: React.FC<DepthInjuryViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredInjuries = INJURIES_DATA.filter((i) => {
    if (selectedStatus !== 'ALL' && i.Status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-[#121214] border border-white/10 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <HeartPulse className="w-3.5 h-3.5 text-amber-500" /> Endpoint 07 &bull; Depth Charts & Injury Availability
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide font-serif italic">Depth Chart Hierarchy & Injury Center</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Endpoints: <code className="text-amber-400 font-mono">/v3/nfl/scores/json/DepthChartsAll</code> & <code className="text-amber-400 font-mono">/v3/nfl/stats/json/Injuries/{selectedSeason}/1</code></p>
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
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">Status:</span>
              {(['ALL', 'Out', 'Questionable', 'IR'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    selectedStatus === st
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Depth Chart Hierarchy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {DEPTH_CHARTS.map((dc, idx) => (
            <div key={idx} className="bg-[#09090b] rounded p-4 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">{dc.Position}</h4>
                <span className="px-2 py-0.5 rounded bg-white/5 text-amber-400 border border-white/10 text-[9px] font-mono uppercase tracking-widest">{dc.Category}</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-widest">Starter (1st String)</span>
                    <span className="text-xs font-bold text-white">{dc.Starter.FirstName} {dc.Starter.LastName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-500">${(dc.Starter.Salary / 1000000).toFixed(1)}M</span>
                </div>

                {dc.SecondString && (
                  <div className="p-2.5 rounded bg-[#121214] border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-widest">2nd String</span>
                      <span className="text-xs font-semibold text-slate-300">{dc.SecondString.FirstName} {dc.SecondString.LastName}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">${(dc.SecondString.Salary / 1000000).toFixed(1)}M</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Injury Availability Log Table */}
      <div className="bg-[#121214] border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-[#09090b] flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Active Injury Availability Matrix ({filteredInjuries.length} Players)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c0c0e] uppercase font-bold text-[10px] tracking-widest text-slate-500 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3">Pos</th>
                <th className="py-3 px-3">Body Part</th>
                <th className="py-3 px-3">Game Status</th>
                <th className="py-3 px-3">Practice Participation</th>
                <th className="py-3 px-3">Declared Date</th>
                <th className="py-3 px-4">Medical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredInjuries.map((inj) => (
                <tr key={inj.InjuryID} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">{inj.Name}</td>
                  <td className="py-3 px-3 font-sans font-bold text-amber-500">{inj.Team}</td>
                  <td className="py-3 px-3 font-sans font-bold text-amber-400">{inj.Position}</td>
                  <td className="py-3 px-3 text-rose-300 font-sans">{inj.BodyPart}</td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inj.Status === 'Out' || inj.Status === 'IR'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {inj.Status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">{inj.PracticeStatus}</td>
                  <td className="py-3 px-3 text-slate-400">{inj.DeclaredDate}</td>
                  <td className="py-3 px-4 font-sans text-slate-300 max-w-sm">{inj.Notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
