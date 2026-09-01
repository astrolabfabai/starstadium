import React, { useState } from 'react';
import { SeasonCode, SEASONS_LIST } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { SCHEDULES_DATA } from '../../data/sportsDataMock';
import { Calendar, CloudSun, MapPin, Tv, Thermometer, Wind, Filter } from 'lucide-react';

const SURFACE_COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

interface ScheduleVenueViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  onSelectGame?: (gameKey: string) => void;
}

export const ScheduleVenueView: React.FC<ScheduleVenueViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange,
  onSelectGame
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number | 'ALL'>('ALL');
  const [selectedSurface, setSelectedSurface] = useState<string>('ALL');

  const targetYear = parseInt(selectedSeason.substring(0, 4)) || 2026;
  const targetType = selectedSeason.substring(4) || 'REG';

  // Filter schedules matching target season year and type
  const seasonMatch = SCHEDULES_DATA.filter((s) => s.Season === targetYear && s.SeasonType === targetType);
  const yearMatch = SCHEDULES_DATA.filter((s) => s.Season === targetYear);
  const activeSchedulesList = seasonMatch.length > 0 ? seasonMatch : (yearMatch.length > 0 ? yearMatch : SCHEDULES_DATA);

  const availableWeeks = Array.from(new Set(activeSchedulesList.map((s) => s.Week)))
    .filter((w) => typeof w === 'number' && w > 0)
    .sort((a, b) => a - b);

  const filteredSchedules = activeSchedulesList.filter((s) => {
    if (selectedWeek !== 'ALL' && s.Week !== Number(selectedWeek)) return false;
    if (selectedSurface !== 'ALL' && s.Surface !== selectedSurface) return false;
    return true;
  });

  // Surface distribution based on active season
  const surfaceCounts = activeSchedulesList.reduce((acc, s) => {
    acc[s.Surface] = (acc[s.Surface] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const surfaceData = Object.entries(surfaceCounts).map(([name, value]) => ({ name, value }));

  // Weather & Temperature chart data
  const weatherData = filteredSchedules.map((s) => ({
    matchup: `${s.AwayTeam} @ ${s.HomeTeam}`,
    Temp: s.ForecastTemp,
    Wind: s.ForecastWindSpeed,
    Spread: Math.abs(s.PointSpread)
  }));

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-[#121214] border border-white/10 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <Calendar className="w-3.5 h-3.5" /> Endpoint 03 &bull; Schedules, Venues & Weather
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide font-serif italic">Schedules & Stadium Environment Hub</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Endpoints: <code className="text-amber-400 font-mono">/v3/nfl/scores/json/Schedules/{selectedSeason}</code> & <code className="text-amber-400 font-mono">/v3/nfl/scores/json/Stadiums</code></p>
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

            {/* Week Filter */}
            <div className="flex items-center gap-2 bg-[#09090b] p-1.5 rounded border border-white/10">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">Week:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="bg-[#121214] text-white font-semibold text-xs rounded px-3 py-1 border border-white/10 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Weeks ({activeSchedulesList.length} Games)</option>
                {availableWeeks.map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Surface Filter */}
            <select
              value={selectedSurface}
              onChange={(e) => setSelectedSurface(e.target.value)}
              className="bg-[#09090b] text-slate-200 text-xs rounded px-3 py-1.5 border border-white/10 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Turf Types</option>
              <option value="Grass">Natural Grass</option>
              <option value="FieldTurf">FieldTurf</option>
            </select>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather & Temp Bar Chart */}
          <div className="bg-[#09090b] rounded p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-500" /> Forecast Temperature (°F) & Wind Speed
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weatherData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="matchup" stroke="#71717a" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Legend />
                  <Bar dataKey="Temp" name="Temp (°F)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Wind" name="Wind (mph)" fill="#3f3f46" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Playing Surface Ratio Pie Chart */}
          <div className="bg-[#09090b] rounded p-4 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" /> Playing Surface Breakdown
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={surfaceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {surfaceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SURFACE_COLORS[index % SURFACE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-[#121214] border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-[#09090b] flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">
            Matchup Schedule & Game Day Weather ({filteredSchedules.length} Games)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c0c0e] uppercase font-bold text-[10px] tracking-widest text-slate-500 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-3">Wk</th>
                <th className="py-3 px-4">Matchup</th>
                <th className="py-3 px-3">Result / Score</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-4">Stadium / Location</th>
                <th className="py-3 px-3">Surface</th>
                <th className="py-3 px-3">Weather</th>
                <th className="py-3 px-3 text-right">Spread</th>
                <th className="py-3 px-3 text-right">O/U Total</th>
                <th className="py-3 px-4 text-center">Plays &amp; Film</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredSchedules.map((s, idx) => (
                <tr key={s.GameKey || `${s.HomeTeam}-${s.AwayTeam}-${s.Week}-${idx}`} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-sans text-slate-300">
                    <div className="font-semibold text-white">{s.Date || 'TBD'}</div>
                    <span className="text-[10px] text-slate-500">{s.Time ? `${s.Time} ET` : 'TBD'}</span>
                  </td>
                  <td className="py-3 px-3 text-amber-500 font-bold">Wk {s.Week}</td>
                  <td className="py-3 px-4 font-sans">
                    {s.AwayTeam === 'BYE' ? (
                      <div className="flex items-center gap-2 font-bold text-amber-400">
                        <span>BYE WEEK</span>
                        <span className="text-slate-500 font-normal">({s.HomeTeam})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>{s.AwayTeam}</span>
                        <span className="text-slate-500 font-normal">@</span>
                        <span>{s.HomeTeam}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {s.Status === 'Final' ? (
                      <span className="font-bold text-emerald-400 font-mono">
                        {s.AwayScore} - {s.HomeScore} (FINAL)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-sans">
                        {s.Status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-[#09090b] text-slate-200 border border-white/10 flex items-center gap-1 w-fit">
                      <Tv className="w-3 h-3 text-amber-500" /> {s.Channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300">
                    <div>{s.StadiumName}</div>
                    <span className="text-[10px] text-slate-500">{s.StadiumCity}</span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      s.Surface === 'Grass' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {s.Surface} {s.IsDome ? '(Dome)' : ''}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">
                    <div className="flex items-center gap-1">
                      <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{s.ForecastTemp}°F</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{s.ForecastDescription}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-500">
                    {s.PointSpread > 0 ? `+${s.PointSpread}` : s.PointSpread}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-400">{s.OverUnder}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    {s.AwayTeam !== 'BYE' && onSelectGame && (
                      <button
                        onClick={() => onSelectGame(s.GameKey)}
                        className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 hover:border-amber-500 text-[11px] font-bold transition flex items-center gap-1 mx-auto"
                        title={`View play-by-play animation reel for ${s.AwayTeam} @ ${s.HomeTeam}`}
                      >
                        <span>🎬 Plays</span>
                      </button>
                    )}
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
