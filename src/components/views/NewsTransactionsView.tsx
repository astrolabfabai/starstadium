import React, { useState } from 'react';
import { SeasonCode, SEASONS_LIST } from '../../types';
import { NEWS_ARTICLES, TRANSACTIONS_DATA } from '../../data/sportsDataMock';
import { Newspaper, FileText, ArrowRightLeft, AlertCircle, Clock, ExternalLink, Calendar } from 'lucide-react';

interface NewsTransactionsViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
}

export const NewsTransactionsView: React.FC<NewsTransactionsViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredNews = NEWS_ARTICLES.filter((n) => {
    if (selectedCategory !== 'ALL' && !n.Categories.includes(selectedCategory)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-[#121214] border border-white/10 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <Newspaper className="w-3.5 h-3.5" /> Endpoint 10 &bull; News Wire & Roster Transactions
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide font-serif italic">RotoBaller News & Transaction Wire</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Endpoints: <code className="text-amber-400 font-mono">/v3/nfl/news-rotoballer/json/RotoBallerPremiumNews</code> & <code className="text-amber-400 font-mono">/v3/nfl/scores/json/TransactionsByDate/{selectedSeason}</code></p>
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
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">Category:</span>
              {(['ALL', 'Injury Report', 'Preview', 'Analytics'] as const).map((cat) => (
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
          </div>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {filteredNews.map((news) => (
            <div key={news.NewsID} className="bg-[#09090b] rounded p-5 border border-white/10 flex flex-col justify-between hover:border-amber-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded bg-white/5 text-amber-400 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-widest">
                    {news.Team} &bull; {news.Source}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-widest uppercase ${
                    news.ImpactLevel === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    {news.ImpactLevel} Impact
                  </span>
                </div>

                {news.PlayerPhotoUrl && (
                  <img
                    src={news.PlayerPhotoUrl}
                    alt={news.Title}
                    className="w-12 h-12 rounded-full object-cover mb-3 border border-white/10"
                  />
                )}

                <h3 className="text-sm font-bold text-white mb-2 leading-snug font-serif italic">{news.Title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{news.Content}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> {new Date(news.Updated).toLocaleTimeString()}</span>
                <span className="text-amber-500 font-sans font-semibold">RotoBaller Feed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Transaction Log Table */}
      <div className="bg-[#121214] border border-white/10 rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-[#09090b] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-amber-500" /> Official Roster Transactions Wire ({TRANSACTIONS_DATA.length} Entries)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c0c0e] uppercase font-bold text-[10px] tracking-widest text-slate-500 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3">Transaction Type</th>
                <th className="py-3 px-3">Player</th>
                <th className="py-3 px-3">Pos</th>
                <th className="py-3 px-4">Official Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {TRANSACTIONS_DATA.map((t) => (
                <tr key={t.TransactionID} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-sans text-slate-400">{t.Date}</td>
                  <td className="py-3 px-3 font-sans font-bold text-amber-500">{t.Team}</td>
                  <td className="py-3 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[10px]">
                      {t.Type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans font-bold text-white">{t.PlayerName}</td>
                  <td className="py-3 px-3 font-sans text-amber-400 font-bold">{t.Position}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{t.Details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
