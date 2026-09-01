import React, { useState, useMemo } from 'react';
import { SeasonCode } from '../../types';
import {
  NFL_TEAMS,
  STANDINGS_DATA,
  PLAYERS_DATA,
  SCHEDULES_DATA,
  PLAYER_STATS,
  PLAY_BY_PLAY_EVENTS,
  DEPTH_CHARTS,
  INJURIES_DATA,
  BETTING_LINES,
  FANTASY_DFS_PLAYERS,
  NEWS_ARTICLES,
  TRANSACTIONS_DATA
} from '../../data/sportsDataMock';
import { API_DOCS_REGISTRY } from '../../data/apiDocsRegistry';
import {
  Database,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Table as TableIcon,
  Code,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  Play,
  Terminal,
  FileSpreadsheet,
  Info,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

interface DbViewerViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
}

interface TableDefinition {
  id: string;
  name: string;
  category: string;
  primaryKey: string;
  description: string;
  getData: (season?: SeasonCode | string) => any[];
}

export const DbViewerView: React.FC<DbViewerViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange
}) => {
  // Table Registry
  const tables: TableDefinition[] = useMemo(() => [
    {
      id: 'teams',
      name: 'nfl_teams',
      category: 'Roster & Franchise',
      primaryKey: 'Key',
      description: 'NFL franchise profiles, stadium metadata, coaches, colors, offensive/defensive schemes',
      getData: () => NFL_TEAMS
    },
    {
      id: 'standings',
      name: 'team_standings',
      category: 'Standings',
      primaryKey: 'Team',
      description: 'Conference, division standings, win-loss-tie records, streaks, point differentials, TDs',
      getData: () => STANDINGS_DATA
    },
    {
      id: 'schedules',
      name: 'game_schedules',
      category: 'Schedules & Venues',
      primaryKey: 'GameKey',
      description: 'Season 2026/2024 games, venues, broadcast channels, betting spreads, weather & scores',
      getData: (season) => {
        if (!season) return SCHEDULES_DATA;
        const yr = parseInt(season.substring(0, 4)) || 2026;
        const type = season.substring(4) || 'REG';
        const match = SCHEDULES_DATA.filter((s) => s.Season === yr && s.SeasonType === type);
        return match.length > 0 ? match : SCHEDULES_DATA;
      }
    },
    {
      id: 'players',
      name: 'player_rosters',
      category: 'Roster & Franchise',
      primaryKey: 'PlayerID',
      description: 'Active NFL players, numbers, positions, ages, colleges, contract salaries & draft status',
      getData: () => PLAYERS_DATA
    },
    {
      id: 'player_stats',
      name: 'player_statistics',
      category: 'Analytics',
      primaryKey: 'PlayerID',
      description: 'Quarterback, running back, receiver, defensive metrics and fantasy scoring points',
      getData: () => PLAYER_STATS
    },
    {
      id: 'play_by_play',
      name: 'play_by_play_events',
      category: 'Live & Play Sequence',
      primaryKey: 'PlayID',
      description: 'Quarter-by-quarter drive sequence, down & distance, play type, yardage and probabilities',
      getData: () => PLAY_BY_PLAY_EVENTS
    },
    {
      id: 'depth_charts',
      name: 'depth_charts',
      category: 'Lineups',
      primaryKey: 'Position',
      description: 'Team depth hierarchies: starters, 2nd string, 3rd string across offense, defense, ST',
      getData: () => DEPTH_CHARTS
    },
    {
      id: 'injuries',
      name: 'injury_reports',
      category: 'Lineups & Health',
      primaryKey: 'InjuryID',
      description: 'Official injury listings, affected body parts, practice participation status and timeline',
      getData: () => INJURIES_DATA
    },
    {
      id: 'betting_lines',
      name: 'betting_odds_lines',
      category: 'Sportsbook & Odds',
      primaryKey: 'GameID',
      description: 'DraftKings, FanDuel, BetMGM opening/current spreads, moneylines, over/under totals',
      getData: () => BETTING_LINES
    },
    {
      id: 'fantasy_dfs',
      name: 'fantasy_dfs_projections',
      category: 'Fantasy & DFS',
      primaryKey: 'PlayerID',
      description: 'DFS player salaries, baseline & ceiling points, projected ownership percentage and value scores',
      getData: () => FANTASY_DFS_PLAYERS
    },
    {
      id: 'news',
      name: 'news_articles',
      category: 'News & Wire',
      primaryKey: 'NewsID',
      description: 'RotoBaller & SportsData.io NFL headlines, content summaries, impact levels and tags',
      getData: () => NEWS_ARTICLES
    },
    {
      id: 'transactions',
      name: 'transactions_wire',
      category: 'News & Wire',
      primaryKey: 'TransactionID',
      description: 'Waiver claims, signings, elevations, trades and injured reserve roster transactions',
      getData: () => TRANSACTIONS_DATA
    },
    {
      id: 'api_endpoints',
      name: 'api_endpoints_registry',
      category: 'System & Schema',
      primaryKey: 'id',
      description: 'SportsData.io v3 NFL endpoint route patterns, parameters, polling frequencies & specifications',
      getData: () => API_DOCS_REGISTRY
    }
  ], []);

  // Active State
  const [selectedTableId, setSelectedTableId] = useState<string>('teams');
  const [viewTab, setViewTab] = useState<'grid' | 'schema' | 'sql'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [inspectRecord, setInspectRecord] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedRecord, setCopiedRecord] = useState<boolean>(false);

  // Condition filter
  const [filterColumn, setFilterColumn] = useState<string>('ALL');
  const [filterOperator, setFilterOperator] = useState<string>('contains');
  const [filterValue, setFilterValue] = useState<string>('');

  // SQL Sandbox state
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM nfl_teams WHERE Conference = "AFC"');
  const [sqlResult, setSqlResult] = useState<{ rows: any[]; error?: string; queryTimeMs?: number } | null>(null);

  // Active table metadata
  const activeTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || tables[0];
  }, [tables, selectedTableId]);

  // Raw Data for active table
  const rawData = useMemo(() => {
    return activeTable.getData(selectedSeason);
  }, [activeTable, selectedSeason]);

  // Extract all columns
  const columns = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    const colSet = new Set<string>();
    rawData.forEach((row) => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach((k) => colSet.add(k));
      }
    });
    return Array.from(colSet);
  }, [rawData]);

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = [...rawData];

    // Global Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) => {
        return Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') {
            return JSON.stringify(val).toLowerCase().includes(q);
          }
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Specific Condition Filter
    if (filterColumn !== 'ALL' && filterValue.trim()) {
      const fVal = filterValue.trim().toLowerCase();
      result = result.filter((row) => {
        const cellVal = row[filterColumn];
        if (cellVal === null || cellVal === undefined) return false;

        const strVal = String(cellVal).toLowerCase();
        const numCell = Number(cellVal);
        const numFilter = Number(filterValue);

        switch (filterOperator) {
          case '=':
            return strVal === fVal || (!isNaN(numCell) && !isNaN(numFilter) && numCell === numFilter);
          case '!=':
            return strVal !== fVal;
          case '>':
            return !isNaN(numCell) && !isNaN(numFilter) && numCell > numFilter;
          case '<':
            return !isNaN(numCell) && !isNaN(numFilter) && numCell < numFilter;
          case '>=':
            return !isNaN(numCell) && !isNaN(numFilter) && numCell >= numFilter;
          case '<=':
            return !isNaN(numCell) && !isNaN(numFilter) && numCell <= numFilter;
          case 'contains':
          default:
            return strVal.includes(fVal);
        }
      });
    }

    // Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [rawData, searchQuery, filterColumn, filterOperator, filterValue, sortColumn, sortDirection]);

  // Paginated rows
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Table Sorting Click Handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Export JSON
  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(processedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeTable.name}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const exportCsv = () => {
    if (processedData.length === 0) return;
    const headers = columns.join(',');
    const rows = processedData.map((row) =>
      columns
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers, ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `${activeTable.name}_export.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(processedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy Single Record
  const copyRecordJson = () => {
    if (!inspectRecord) return;
    navigator.clipboard.writeText(JSON.stringify(inspectRecord, null, 2));
    setCopiedRecord(true);
    setTimeout(() => setCopiedRecord(false), 2000);
  };

  // Execute SQL Sandbox
  const runSqlSandbox = () => {
    const startTime = performance.now();
    try {
      const clean = sqlQuery.trim();
      const match = clean.match(/SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?)?$/i);

      if (!match) {
        // Fallback simple search
        const qLower = clean.toLowerCase();
        let targetTable = tables.find((t) => qLower.includes(t.name) || qLower.includes(t.id)) || activeTable;
        let data = targetTable.getData(selectedSeason);
        const endTime = performance.now();
        setSqlResult({
          rows: data,
          queryTimeMs: Math.round((endTime - startTime) * 100) / 100
        });
        return;
      }

      const [, selectFields, tableName, whereClause, orderCol, orderDir] = match;
      const targetTable = tables.find((t) => t.name.toLowerCase() === tableName.toLowerCase() || t.id.toLowerCase() === tableName.toLowerCase());

      if (!targetTable) {
        setSqlResult({
          rows: [],
          error: `Table "${tableName}" does not exist in schema. Available tables: ${tables.map((t) => t.name).join(', ')}`
        });
        return;
      }

      let rows = targetTable.getData(selectedSeason);

      // Where filter parser
      if (whereClause) {
        const parts = whereClause.split(/\s+AND\s+/i);
        rows = rows.filter((row) => {
          return parts.every((cond) => {
            const operatorMatch = cond.match(/([a-zA-Z0-9_]+)\s*(=|!=|>=|<=|>|<|LIKE|contains)\s*['"]?([^'"]+)['"]?/i);
            if (!operatorMatch) return true;
            const [, col, op, valStr] = operatorMatch;
            const cellVal = row[col];
            if (cellVal === null || cellVal === undefined) return false;

            const numCell = Number(cellVal);
            const numVal = Number(valStr);
            const strCell = String(cellVal).toLowerCase();
            const strVal = valStr.toLowerCase();

            switch (op.toUpperCase()) {
              case '=':
                return strCell === strVal || (!isNaN(numCell) && !isNaN(numVal) && numCell === numVal);
              case '!=':
                return strCell !== strVal;
              case '>':
                return !isNaN(numCell) && !isNaN(numVal) && numCell > numVal;
              case '<':
                return !isNaN(numCell) && !isNaN(numVal) && numCell < numVal;
              case '>=':
                return !isNaN(numCell) && !isNaN(numVal) && numCell >= numVal;
              case '<=':
                return !isNaN(numCell) && !isNaN(numVal) && numCell <= numVal;
              case 'LIKE':
              case 'CONTAINS':
                return strCell.includes(strVal.replace(/%/g, ''));
              default:
                return true;
            }
          });
        });
      }

      // Order by
      if (orderCol) {
        const isDesc = orderDir && orderDir.toUpperCase() === 'DESC';
        rows.sort((a, b) => {
          const valA = a[orderCol];
          const valB = b[orderCol];
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (typeof valA === 'number' && typeof valB === 'number') {
            return isDesc ? valB - valA : valA - valB;
          }
          return isDesc
            ? String(valB).localeCompare(String(valA))
            : String(valA).localeCompare(String(valB));
        });
      }

      // Field projection
      if (selectFields.trim() !== '*') {
        const fields = selectFields.split(',').map((f) => f.trim());
        rows = rows.map((r) => {
          const projected: any = {};
          fields.forEach((f) => {
            if (r[f] !== undefined) projected[f] = r[f];
          });
          return projected;
        });
      }

      const endTime = performance.now();
      setSqlResult({
        rows,
        queryTimeMs: Math.round((endTime - startTime) * 100) / 100
      });
    } catch (err: any) {
      setSqlResult({
        rows: [],
        error: err.message || 'Syntax error in SQL statement'
      });
    }
  };

  // Schema inferred data
  const schemaInfo = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    const sample = rawData[0] || {};
    return columns.map((col) => {
      const val = sample[col];
      let typeStr: string = typeof val;
      if (val === null) typeStr = 'nullable';
      else if (Array.isArray(val)) typeStr = 'array[]';
      else if (typeof val === 'object') typeStr = 'json object';

      const isKey = col === activeTable.primaryKey;
      return {
        column: col,
        type: typeStr,
        isPrimaryKey: isKey,
        sampleValue: val !== undefined ? String(typeof val === 'object' ? JSON.stringify(val).substring(0, 40) + '...' : val) : 'null'
      };
    });
  }, [rawData, columns, activeTable]);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-500/20">
              <Database className="w-3.5 h-3.5" /> Database Core &bull; Schema Inspector & SQL Sandbox
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide font-serif italic">
              SportsData Live Database Viewer
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Inspecting active collection: <code className="text-amber-400 font-bold">{activeTable.name}</code> &bull; Primary Key: <code className="text-amber-400 font-mono">{activeTable.primaryKey}</code>
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-[#121214] p-1 rounded border border-white/10 text-xs">
              <button
                onClick={() => setViewTab('grid')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition-all ${
                  viewTab === 'grid' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Data Grid
              </button>
              <button
                onClick={() => setViewTab('schema')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition-all ${
                  viewTab === 'schema' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Schema
              </button>
              <button
                onClick={() => {
                  setViewTab('sql');
                  if (!sqlResult) runSqlSandbox();
                }}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition-all ${
                  viewTab === 'sql' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> SQL Sandbox
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-1 bg-[#121214] p-1 rounded border border-white/10 text-xs">
              <button
                onClick={exportJson}
                title="Export current table data to JSON"
                className="px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-500" /> JSON
              </button>
              <button
                onClick={exportCsv}
                title="Export current table data to CSV"
                className="px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> CSV
              </button>
              <button
                onClick={copyToClipboard}
                title="Copy current table data as JSON to clipboard"
                className="px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Database Metrics Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 font-mono text-xs">
          <div className="bg-[#09090b] p-3 rounded border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Total Records</span>
            <span className="text-xl font-bold text-white mt-1 block">{rawData.length.toLocaleString()}</span>
          </div>
          <div className="bg-[#09090b] p-3 rounded border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Filtered Rows</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{processedData.length.toLocaleString()}</span>
          </div>
          <div className="bg-[#09090b] p-3 rounded border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Columns / Fields</span>
            <span className="text-xl font-bold text-slate-200 mt-1 block">{columns.length}</span>
          </div>
          <div className="bg-[#09090b] p-3 rounded border border-white/5">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Active Season Context</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">{selectedSeason}</span>
          </div>
        </div>
      </div>

      {/* Main Database Split Layout: Tables Sidebar + Main Table View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tables Navigation List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-500" /> Database Collections
              </span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-amber-400 font-bold">
                {tables.length} Tables
              </span>
            </div>

            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {tables.map((t) => {
                const isSelected = selectedTableId === t.id;
                const rowCount = t.getData(selectedSeason).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTableId(t.id);
                      setCurrentPage(1);
                      setFilterColumn('ALL');
                      setFilterValue('');
                      setSortColumn(null);
                    }}
                    className={`w-full text-left p-2.5 rounded text-xs transition-all border ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white font-bold shadow-sm'
                        : 'border-white/5 bg-[#121214] text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-amber-400 flex items-center gap-1.5 font-bold">
                        <TableIcon className="w-3 h-3 text-slate-400" /> {t.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400'
                      }`}>
                        {rowCount} rows
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Data Grid / Schema / SQL Sandbox */}
        <div className="lg:col-span-9 space-y-4">
          {/* TAB 1: DATA GRID */}
          {viewTab === 'grid' && (
            <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-5 shadow-xl space-y-4">
              {/* Search & Filter Controls Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Global Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={`Search across ${columns.length} columns in ${activeTable.name}...`}
                    className="w-full bg-[#121214] border border-white/10 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Structured Condition Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 bg-[#121214] p-1 rounded border border-white/10 text-xs">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500 ml-1.5" />
                    <select
                      value={filterColumn}
                      onChange={(e) => {
                        setFilterColumn(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-transparent text-white font-medium text-xs rounded px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL" className="bg-[#121214]">Any Column</option>
                      {columns.map((c) => (
                        <option key={c} value={c} className="bg-[#121214]">
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterOperator}
                      onChange={(e) => setFilterOperator(e.target.value)}
                      className="bg-transparent text-amber-400 font-mono text-xs rounded px-1.5 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="contains" className="bg-[#121214]">contains</option>
                      <option value="=" className="bg-[#121214]">=</option>
                      <option value="!=" className="bg-[#121214]">!=</option>
                      <option value=">" className="bg-[#121214]">&gt;</option>
                      <option value="<" className="bg-[#121214]">&lt;</option>
                      <option value=">=" className="bg-[#121214]">&gt;=</option>
                      <option value="<=" className="bg-[#121214]">&lt;=</option>
                    </select>

                    <input
                      type="text"
                      value={filterValue}
                      onChange={(e) => {
                        setFilterValue(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Filter value..."
                      className="bg-[#09090b] border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-slate-500 w-28 focus:outline-none focus:border-amber-500"
                    />

                    {(filterColumn !== 'ALL' || filterValue) && (
                      <button
                        onClick={() => {
                          setFilterColumn('ALL');
                          setFilterValue('');
                        }}
                        className="px-1.5 py-1 text-slate-400 hover:text-white"
                        title="Clear condition filter"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Page Size Selector */}
                  <div className="flex items-center gap-1 bg-[#121214] px-2 py-1 rounded border border-white/10 text-xs">
                    <span className="text-slate-400 text-[11px]">Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                    >
                      <option value={10} className="bg-[#121214]">10</option>
                      <option value={15} className="bg-[#121214]">15</option>
                      <option value={25} className="bg-[#121214]">25</option>
                      <option value={50} className="bg-[#121214]">50</option>
                      <option value={-1} className="bg-[#121214]">All</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-white/10 rounded-lg overflow-hidden bg-[#09090b]">
                <div className="overflow-x-auto max-h-[520px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-20 bg-[#121214] border-b border-white/10 text-slate-400 font-mono text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center bg-[#121214] border-r border-white/5 text-slate-500">
                          #
                        </th>
                        <th className="py-2.5 px-3 w-16 text-center bg-[#121214] border-r border-white/5">
                          Inspect
                        </th>
                        {columns.map((col) => {
                          const isPrimary = col === activeTable.primaryKey;
                          const isSorted = sortColumn === col;
                          return (
                            <th
                              key={col}
                              onClick={() => handleSort(col)}
                              className="py-2.5 px-3.5 whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors select-none"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className={isPrimary ? 'text-amber-400 font-bold' : 'text-slate-200 font-semibold'}>
                                  {col}
                                </span>
                                {isPrimary && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-normal">
                                    PK
                                  </span>
                                )}
                                {isSorted ? (
                                  sortDirection === 'asc' ? (
                                    <ArrowUp className="w-3 h-3 text-amber-500" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3 text-amber-500" />
                                  )
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-40 hover:opacity-100" />
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length + 2} className="py-12 text-center text-slate-500 font-sans">
                            <Info className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                            No records found matching current query or filters in <code className="text-amber-400 font-mono">{activeTable.name}</code>.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((row, idx) => {
                          const rowIndex = pageSize === -1 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                          return (
                            <tr
                              key={idx}
                              className="hover:bg-white/5 transition-colors cursor-pointer group"
                              onClick={() => setInspectRecord(row)}
                            >
                              <td className="py-2.5 px-3 text-center text-slate-500 border-r border-white/5 select-none">
                                {rowIndex}
                              </td>
                              <td className="py-2.5 px-3 text-center border-r border-white/5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectRecord(row);
                                  }}
                                  className="p-1 rounded bg-white/5 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-all"
                                  title="Inspect full JSON record"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              </td>
                              {columns.map((col) => {
                                const val = row[col];
                                const isPrimary = col === activeTable.primaryKey;
                                let displayVal = String(val);

                                if (val === null || val === undefined) {
                                  displayVal = 'null';
                                } else if (typeof val === 'boolean') {
                                  displayVal = val ? 'true' : 'false';
                                } else if (typeof val === 'object') {
                                  displayVal = JSON.stringify(val);
                                }

                                return (
                                  <td
                                    key={col}
                                    className="py-2.5 px-3.5 whitespace-nowrap max-w-xs truncate"
                                    title={displayVal}
                                  >
                                    {val === null || val === undefined ? (
                                      <span className="text-slate-600 italic">null</span>
                                    ) : typeof val === 'boolean' ? (
                                      <span className={val ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                        {displayVal}
                                      </span>
                                    ) : isPrimary ? (
                                      <span className="text-amber-400 font-bold">{displayVal}</span>
                                    ) : typeof val === 'number' ? (
                                      <span className="text-sky-300">{displayVal}</span>
                                    ) : (
                                      <span className="text-slate-300 font-sans">{displayVal}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls Footer */}
              {pageSize !== -1 && processedData.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs font-mono text-slate-400">
                  <div>
                    Showing <span className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="text-white font-bold">
                      {Math.min(currentPage * pageSize, processedData.length)}
                    </span>{' '}
                    of <span className="text-amber-400 font-bold">{processedData.length}</span> rows
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 rounded border border-white/10 bg-[#121214] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <span className="px-3 py-1.5 text-white font-bold bg-[#121214] rounded border border-white/10">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1.5 rounded border border-white/10 bg-[#121214] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCHEMA DEFINITION */}
          {viewTab === 'schema' && (
            <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" /> Table Schema: <span className="font-mono text-amber-400">{activeTable.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Field attributes, data type annotations, nullability constraints and sample values
                  </p>
                </div>
                <div className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-amber-400">
                  Primary Key: {activeTable.primaryKey}
                </div>
              </div>

              <div className="border border-white/10 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-[#121214] border-b border-white/10 text-slate-400 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Field Name</th>
                      <th className="py-2.5 px-4">Inferred Type</th>
                      <th className="py-2.5 px-4">Constraints</th>
                      <th className="py-2.5 px-4">Sample Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {schemaInfo.map((f) => (
                      <tr key={f.column} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-bold text-white">
                          {f.column}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px]">
                            {f.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {f.isPrimaryKey ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              PRIMARY KEY (NOT NULL)
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">OPTIONAL / INDEXABLE</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans max-w-sm truncate">
                          {f.sampleValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SQL SANDBOX */}
          {viewTab === 'sql' && (
            <div className="bg-[#0c0c0e] border border-white/10 rounded-lg p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-500" /> Interactive SQL Query Sandbox
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Execute real-time mock SQL statements across in-memory NFL datasets
                  </p>
                </div>

                {sqlResult?.queryTimeMs !== undefined && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Query Time: {sqlResult.queryTimeMs} ms &bull; {sqlResult.rows.length} rows returned
                  </span>
                )}
              </div>

              {/* Preset SQL queries */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Quick Preset Queries:</span>
                <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                  {[
                    `SELECT * FROM nfl_teams WHERE Conference = "AFC"`,
                    `SELECT * FROM team_standings WHERE Wins >= 10 ORDER BY PointDifferential DESC`,
                    `SELECT * FROM game_schedules WHERE Surface = "Grass"`,
                    `SELECT * FROM player_rosters WHERE Position = "QB"`,
                    `SELECT * FROM injury_reports WHERE Status = "Questionable"`
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => {
                        setSqlQuery(preset);
                      }}
                      className="px-2.5 py-1 rounded bg-[#121214] border border-white/10 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 text-[11px] transition-all text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL Query Editor Box */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="Enter SQL query e.g. SELECT * FROM player_rosters WHERE Position = 'QB'..."
                    className="w-full bg-[#09090b] border border-amber-500/40 rounded p-3 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                  <button
                    onClick={runSqlSandbox}
                    className="absolute right-3 bottom-4 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded hover:bg-amber-400 flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Run Query
                  </button>
                </div>
              </div>

              {/* SQL Error Box */}
              {sqlResult?.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs font-mono">
                  Error: {sqlResult.error}
                </div>
              )}

              {/* SQL Results Table */}
              {sqlResult?.rows && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono uppercase">
                      Query Results ({sqlResult.rows.length} rows)
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(sqlResult.rows, null, 2));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-2 py-1 text-xs rounded bg-[#121214] border border-white/10 text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3 text-amber-500" /> Copy JSON Result
                    </button>
                  </div>

                  <div className="border border-white/10 rounded overflow-hidden max-h-[380px] overflow-x-auto bg-[#09090b]">
                    {sqlResult.rows.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">No records matched the SQL query filter.</div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse font-mono">
                        <thead className="bg-[#121214] border-b border-white/10 text-slate-400 text-[11px] sticky top-0">
                          <tr>
                            {Object.keys(sqlResult.rows[0] || {}).map((k) => (
                              <th key={k} className="py-2 px-3 whitespace-nowrap text-slate-200 font-semibold">
                                {k}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[11px]">
                          {sqlResult.rows.map((r, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/5">
                              {Object.keys(sqlResult.rows[0] || {}).map((k) => (
                                <td key={k} className="py-2 px-3 whitespace-nowrap max-w-xs truncate text-slate-300">
                                  {typeof r[k] === 'object' ? JSON.stringify(r[k]) : String(r[k] ?? 'null')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Record Inspector Drawer / Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-amber-500/40 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#121214]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Record Inspector: <span className="font-mono text-amber-400">{activeTable.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Primary Key [{activeTable.primaryKey}]: {String(inspectRecord[activeTable.primaryKey] || 'N/A')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyRecordJson}
                  className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-all"
                >
                  {copiedRecord ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  {copiedRecord ? 'Copied JSON' : 'Copy JSON'}
                </button>
                <button
                  onClick={() => setInspectRecord(null)}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content: Key-Value Table & Raw JSON View */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Formatted Key-Value Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-2">
                  <TableIcon className="w-3.5 h-3.5 text-amber-500" /> Field Value Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(inspectRecord).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded bg-[#09090b] border border-white/5 flex justify-between items-start gap-2">
                      <span className="text-slate-400 font-semibold">{k}:</span>
                      <span className="text-amber-300 text-right break-all">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v ?? 'null')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw JSON Block */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-amber-500" /> Raw JSON Document
                </h4>
                <pre className="p-4 rounded bg-[#09090b] border border-white/10 text-slate-300 text-xs font-mono overflow-x-auto max-h-56">
                  {JSON.stringify(inspectRecord, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#121214] flex justify-end">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
