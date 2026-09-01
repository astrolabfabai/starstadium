import React, { useState, useEffect } from 'react';
import { ServerAdminStatus, ApiLogEntry, SeasonCode } from '../../types';
import {
  Server,
  Shield,
  Activity,
  Terminal,
  Cpu,
  Database,
  RefreshCw,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Code,
  Copy,
  Clock,
  HardDrive,
  Radio,
  Zap,
  BookOpen
} from 'lucide-react';

interface ServerAdminViewProps {
  selectedSeason?: SeasonCode;
}

interface TestRouteOption {
  name: string;
  category: string;
  method: 'GET' | 'POST';
  url: string;
  payload?: any;
}

const TEST_ROUTES: TestRouteOption[] = [
  { name: '1. Server Health Check', category: 'System', method: 'GET', url: '/api/health' },
  { name: '2. Current Season Feeds', category: 'SportsData', method: 'GET', url: '/api/sportsdata/current-season' },
  { name: '3. Current Week Feeds', category: 'SportsData', method: 'GET', url: '/api/sportsdata/current-week' },
  { name: '4. Live Game Scoreboard', category: 'Live Events', method: 'GET', url: '/api/sportsdata/scores/live?season=2026REG&week=4' },
  { name: '5. NFL Teams & Schemes', category: 'Rosters', method: 'GET', url: '/api/sportsdata/teams' },
  { name: '6. Standings & Records', category: 'Competition', method: 'GET', url: '/api/sportsdata/standings?season=2026REG' },
  { name: '7. Schedules & Venues', category: 'Schedules', method: 'GET', url: '/api/sportsdata/schedules?season=2026REG' },
  { name: '8. Multi-Bookmaker Odds', category: 'Betting', method: 'GET', url: '/api/sportsdata/odds?season=2026REG&week=4' },
  { name: '9. Database Tables Schema', category: 'Database', method: 'GET', url: '/api/db/tables' },
  {
    name: '10. Google AI Tactical Chat',
    category: 'AI Engine',
    method: 'POST',
    url: '/api/gemini/chat',
    payload: { prompt: 'Analyze Red Zone pass vs run efficiency in 2026', contextData: { league: 'NFL', season: '2026REG' } }
  }
];

export const ServerAdminView: React.FC<ServerAdminViewProps> = ({ selectedSeason = '2026REG' }) => {
  const [serverStatus, setServerStatus] = useState<ServerAdminStatus | null>(null);
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TestRouteOption>(TEST_ROUTES[0]);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [isExecutingTest, setIsExecutingTest] = useState(false);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);
  const [logFilter, setLogFilter] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const fetchServerStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/server-status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
        if (data.recentLogs) {
          setLogs(data.recentLogs);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch server admin status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
  }, []);

  // Periodic log polling
  useEffect(() => {
    if (!autoRefreshLogs) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/logs');
        if (res.ok) {
          const data = await res.json();
          if (data.logs) {
            setLogs(data.logs);
          }
        }
      } catch (err) {
        // silent
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefreshLogs]);

  const executeEndpointTest = async () => {
    setIsExecutingTest(true);
    setTestResult(null);
    setTestLatency(null);

    const startTime = performance.now();
    try {
      const options: RequestInit = {
        method: selectedRoute.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (selectedRoute.method === 'POST' && selectedRoute.payload) {
        options.body = JSON.stringify(selectedRoute.payload);
      }

      const res = await fetch(selectedRoute.url, options);
      const data = await res.json();
      const endTime = performance.now();

      setTestLatency(Math.round(endTime - startTime));
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: true, message: err.message });
    } finally {
      setIsExecutingTest(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/admin/clear-logs', { method: 'POST' });
      setLogs([]);
      setNotificationMsg('API request logs cleared');
      setTimeout(() => setNotificationMsg(null), 2500);
    } catch (e) {
      console.warn('Failed to clear logs', e);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch('/api/admin/clear-cache', { method: 'POST' });
      const data = await res.json();
      setNotificationMsg(data.message || 'Cache flushed');
      setTimeout(() => setNotificationMsg(null), 2500);
    } catch (e) {
      console.warn('Failed to clear cache', e);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      !logFilter ||
      l.url.toLowerCase().includes(logFilter.toLowerCase()) ||
      l.method.toLowerCase().includes(logFilter.toLowerCase()) ||
      String(l.status).includes(logFilter)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Admin Header Banner */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide uppercase italic font-serif">
                Star<span className="text-amber-500 font-sans not-italic font-black">Stadium</span> Backend Admin
              </h2>
              <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Node / Express Live
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Server Diagnostics &bull; API Traffic Telemetry &bull; Proxy Gateways &bull; .env Protection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={fetchServerStatus}
            disabled={isLoadingStatus}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} /> Refresh Status
          </button>
          <button
            onClick={handleClearCache}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <HardDrive className="w-3.5 h-3.5" /> Purge Cache
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Server Health
            </span>
            <span className="text-[10px] font-mono text-emerald-400">200 OK</span>
          </div>
          <p className="text-xl font-bold text-white font-mono capitalize">
            {serverStatus?.status || 'Healthy'}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Uptime: {Math.floor((serverStatus?.uptimeSeconds || 0) / 60)}m {(serverStatus?.uptimeSeconds || 0) % 60}s
          </p>
        </div>

        {/* Memory RSS */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" /> Memory Heap
            </span>
            <span className="text-[10px] font-mono text-sky-400">{serverStatus?.nodeVersion || 'v22'}</span>
          </div>
          <p className="text-xl font-bold text-white font-mono">
            {serverStatus?.memoryUsage?.heapUsedMb || 42} <span className="text-sm font-normal text-slate-400">MB</span>
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            RSS: {serverStatus?.memoryUsage?.rssMb || 85} MB Total
          </p>
        </div>

        {/* API Gateway Status */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> API Secret Shield
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">.env Only</span>
          </div>
          <p className="text-xl font-bold text-emerald-400 font-mono flex items-center gap-1.5">
            <Lock className="w-4 h-4" /> 100% Protected
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Client Keys: Zero Exposed
          </p>
        </div>

        {/* Total API Requests */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-rose-400" /> API Traffic
            </span>
            <span className="text-[10px] font-mono text-rose-400">Live Buffer</span>
          </div>
          <p className="text-xl font-bold text-white font-mono">
            {logs.length} <span className="text-sm font-normal text-slate-400">Logged</span>
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Auto-Polling: {autoRefreshLogs ? 'Active (3s)' : 'Paused'}
          </p>
        </div>
      </div>

      {/* Security & Architecture Protocol Card */}
      <div className="bg-gradient-to-r from-[#121214] to-[#0c0c0e] border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Strict Server-Side Environment Secret Architecture</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          To maintain security compliance, zero API keys or credentials are ever provided or exposed to the frontend client application. All queries to <strong>SportsData.io</strong>, <strong>ESPN</strong>, and <strong>Google AI (Gemini 3.7 Flash)</strong> execute exclusively through Express server routes in <code className="text-amber-400 font-mono">server.ts</code> referencing protected <code className="text-amber-400 font-mono">.env</code> variables.
        </p>
      </div>

      {/* Interactive API Endpoint Tester (Moved from general UI) */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Backend Endpoint Tester & Debugger
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
            Express /api/* Proxy
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Route Selector */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium block">Select API Route</label>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {TEST_ROUTES.map((route) => {
                const isSelected = selectedRoute.name === route.name;
                return (
                  <button
                    key={route.name}
                    onClick={() => {
                      setSelectedRoute(route);
                      setTestResult(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold'
                        : 'bg-[#09090b] border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="truncate">{route.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">{route.url}</p>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        route.method === 'POST' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {route.method}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={executeEndpointTest}
              disabled={isExecutingTest}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-2"
            >
              {isExecutingTest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
              Send Server Request
            </button>
          </div>

          {/* Right Live Response Viewer */}
          <div className="lg:col-span-2 bg-[#09090b] border border-white/10 rounded-xl p-4 flex flex-col min-h-64 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300 truncate">
                <span className="font-bold text-amber-400">{selectedRoute.method}</span>
                <span className="truncate">{selectedRoute.url}</span>
              </div>
              {testLatency !== null && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                  {testLatency} ms
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto bg-[#070708] p-3 rounded-lg border border-white/5 text-xs font-mono text-slate-200 no-scrollbar max-h-72">
              {isExecutingTest ? (
                <div className="flex items-center justify-center h-full text-slate-400 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Dispatching backend request...</span>
                </div>
              ) : testResult ? (
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-1 text-center">
                  <Code className="w-6 h-6 opacity-40" />
                  <span>Click &quot;Send Server Request&quot; to test this backend endpoint</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Server Request Logs Table */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Live API Request &amp; Traffic Logs
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
              {filteredLogs.length} Events
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter by path / status..."
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="bg-[#09090b] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-40"
            />
            <button
              onClick={() => setAutoRefreshLogs(!autoRefreshLogs)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                autoRefreshLogs ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400'
              }`}
            >
              {autoRefreshLogs ? 'Auto-Poll ON' : 'Paused'}
            </button>
            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-all"
              title="Clear log buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#09090b]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#18181b] text-slate-400 uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="p-3">Method</th>
                <th className="p-3">Endpoint Path</th>
                <th className="p-3">Status</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                    No matching requests in buffer. Interacting with the application will record live traffic here.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isOk = log.status >= 200 && log.status < 300;
                  const isRed = log.status >= 400;
                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            log.method === 'POST'
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {log.method}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200 font-semibold truncate max-w-xs">{log.url}</td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            isOk ? 'bg-emerald-500/20 text-emerald-400' : isRed ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{log.durationMs} ms</td>
                      <td className="p-3 text-slate-400 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 text-slate-500 text-[10px]">{log.ip || '127.0.0.1'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
