import React, { useState } from 'react';
import { API_DOCS_REGISTRY } from '../data/apiDocsRegistry';
import { ApiEndpointDoc } from '../types';
import { BookOpen, X, Code, Play, CheckCircle2, Copy, Search } from 'lucide-react';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDoc>(API_DOCS_REGISTRY[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredDocs = API_DOCS_REGISTRY.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.urlPattern.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const executeApiTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Map endpoint to secure backend proxy route
      let mockPath = '/api/sportsdata/standings';
      if (selectedEndpoint.id.includes('team')) mockPath = '/api/sportsdata/teams';
      if (selectedEndpoint.id.includes('player')) mockPath = '/api/sportsdata/players';
      if (selectedEndpoint.id.includes('schedule')) mockPath = '/api/sportsdata/schedules';
      if (selectedEndpoint.id.includes('score')) mockPath = '/api/live/scoreboard';
      if (selectedEndpoint.id.includes('stat')) mockPath = '/api/sportsdata/stats';
      if (selectedEndpoint.id.includes('pbp') || selectedEndpoint.id.includes('play')) mockPath = '/api/sportsdata/pbp';
      if (selectedEndpoint.id.includes('depth')) mockPath = '/api/sportsdata/depth';
      if (selectedEndpoint.id.includes('injur')) mockPath = '/api/sportsdata/injuries';
      if (selectedEndpoint.id.includes('odds') || selectedEndpoint.id.includes('bet')) mockPath = '/api/sportsdata/odds';
      if (selectedEndpoint.id.includes('dfs') || selectedEndpoint.id.includes('fantasy')) mockPath = '/api/sportsdata/fantasy';
      if (selectedEndpoint.id.includes('news')) mockPath = '/api/sportsdata/news';

      const res = await fetch(mockPath);
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResult(`Error testing backend endpoint: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(selectedEndpoint.urlPattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121214] border border-white/10 w-full max-w-5xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#09090b]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-serif italic">
              Star<span className="font-sans not-italic text-amber-500 font-bold ml-1">Stadium</span> &bull; SportsData.io NFL API Inspector
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Endpoint List Sidebar */}
          <div className="border-r border-white/10 p-4 flex flex-col overflow-hidden bg-[#0c0c0e]">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090b] text-slate-200 text-xs rounded pl-9 pr-3 py-2 border border-white/10 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredDocs.map((doc) => {
                const isSelected = doc.id === selectedEndpoint.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedEndpoint(doc);
                      setTestResult(null);
                    }}
                    className={`w-full text-left p-3 rounded border text-xs transition-all ${
                      isSelected
                        ? 'bg-white/10 border-amber-500 text-white font-bold'
                        : 'bg-[#09090b] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-amber-500">{doc.category}</span>
                      <span className="text-[9px] font-mono bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">{doc.method}</span>
                    </div>
                    <div className="font-semibold text-slate-100 truncate">{doc.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Endpoint Details & Execution Runner */}
          <div className="col-span-2 p-6 overflow-y-auto space-y-6 bg-[#121214]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                  {selectedEndpoint.method}
                </span>
                <span className="text-xs font-mono text-slate-400">Call Interval: {selectedEndpoint.callInterval}</span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif">{selectedEndpoint.name}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedEndpoint.description}</p>
            </div>

            {/* URL Pattern & Copy */}
            <div className="bg-[#09090b] p-3 rounded border border-white/10 flex justify-between items-center">
              <code className="text-xs font-mono text-amber-400 truncate pr-2">
                {selectedEndpoint.urlPattern} <span className="text-emerald-400 text-[11px]">(Server .env Protected)</span>
              </code>
              <button
                onClick={copyUrl}
                className="px-3 py-1.5 rounded bg-white/5 text-slate-200 text-xs hover:bg-white/10 border border-white/10 flex items-center gap-1.5 shrink-0"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy URL'}
              </button>
            </div>

            {/* Parameters Table */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">URL & Query Parameters</h4>
              <div className="bg-[#09090b] rounded border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs font-mono text-slate-300">
                  <thead className="bg-[#0c0c0e] border-b border-white/10 text-slate-400">
                    <tr>
                      <th className="p-2.5">Param</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Required</th>
                      <th className="p-2.5">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedEndpoint.urlParams.map((p) => (
                      <tr key={p.name}>
                        <td className="p-2.5 font-bold text-amber-400">{p.name}</td>
                        <td className="p-2.5 text-slate-400">{p.type}</td>
                        <td className="p-2.5 text-amber-500 font-bold">true</td>
                        <td className="p-2.5 text-slate-300">{p.examples || 'N/A'}</td>
                      </tr>
                    ))}
                    {selectedEndpoint.queryParams.map((p) => (
                      <tr key={p.name}>
                        <td className="p-2.5 font-bold text-amber-400">{p.name}</td>
                        <td className="p-2.5 text-slate-400">{p.type}</td>
                        <td className="p-2.5 text-amber-500 font-bold">{String(p.required)}</td>
                        <td className="p-2.5 text-slate-300">SportsData Key</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Test Runner */}
            <div>
              <button
                onClick={executeApiTest}
                disabled={isLoading}
                className="w-full py-3 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                {isLoading ? 'Executing Request...' : 'Execute Test Request'}
              </button>
            </div>

            {/* Test Results Output */}
            {testResult && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">JSON Response Payload</h4>
                <pre className="bg-[#09090b] p-4 rounded border border-white/10 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-64">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
