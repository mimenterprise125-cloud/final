import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SessionTradesModal } from '@/components/modals/SessionTradesModal';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

// Hide scrollbars globally for tables
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

interface TradeData {
  trades: any[];
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// 7 Trading Sessions
const TRADING_SESSIONS = [
  { name: 'Sydney Open', range: '22:00-06:00', hours: [22, 23, 0, 1, 2, 3, 4, 5] },
  { name: 'Tokyo Open', range: '00:00-09:00', hours: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { name: 'London Open', range: '07:00-16:00', hours: [7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { name: 'London Close', range: '14:00-17:00', hours: [14, 15, 16] },
  { name: 'NY Open', range: '13:00-22:00', hours: [13, 14, 15, 16, 17, 18, 19, 20, 21] },
  { name: 'NY Close', range: '20:00-23:00', hours: [20, 21, 22] },
  { name: 'Asian Hours', range: '20:00-07:00', hours: [20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6] },
];

interface WeekdayAnalysisProps extends TradeData {
  accountSize?: number | string;
  dailyLossLimit?: number | string;
  maxDD?: number | string;
  selectedSetup?: string;
  targetProfit?: number | string;
  availableSetups?: string[];
}

export const WeekdayAnalysisSection = ({ 
  trades,
  accountSize: initialAccountSize = '',
  dailyLossLimit: initialDailyLossLimit = '',
  maxDD: initialMaxDD = '',
  selectedSetup: initialSelectedSetup = '',
  targetProfit: initialTargetProfit = '',
  availableSetups: initialAvailableSetups = []
}: WeekdayAnalysisProps) => {
  const [selectedDays] = useState<boolean[]>([true, true, true, true, true, true, true]);
  const [selectedSessionName, setSelectedSessionName] = useState<string | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedFilterSession, setSelectedFilterSession] = useState<string>('All Sessions');
  const [selectedFilterSymbol, setSelectedFilterSymbol] = useState<string | null>(null);
  
  // Funded Account Calculator States
  const [accountSize, setAccountSize] = useState<number | string>(initialAccountSize);
  const [dailyLossLimit, setDailyLossLimit] = useState<number | string>(initialDailyLossLimit || 5);
  const [maxDD, setMaxDD] = useState<number | string>(initialMaxDD || 10);
  const [selectedSetup, setSelectedSetup] = useState<string>(initialSelectedSetup);
  const [targetProfit, setTargetProfit] = useState<number | string>(initialTargetProfit || 10);
  const [availableSetups, setAvailableSetups] = useState<string[]>(initialAvailableSetups);
  const [riskPerTradeInput, setRiskPerTradeInput] = useState<number | string>(1); // Default 1%
  const [calculatorSessionFilter, setCalculatorSessionFilter] = useState<string>('All Sessions'); // Session filter for calculator

  // Prevent accidental value changes on numeric inputs when scrolling over them
  const preventNumberScroll = (e: React.WheelEvent<HTMLInputElement>) => {
    try { (e.target as HTMLInputElement).blur(); } catch (err) {}
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDay();
  };

  const getWeekdayIndex = (jsDay: number) => {
    return jsDay === 0 ? 6 : jsDay - 1;
  };

  const selectedTrades = useMemo(() => {
    return trades.filter(trade => {
      const dayIndex = getWeekdayIndex(getDayOfWeek(trade.entry_at || trade.created_at));
      return selectedDays[dayIndex];
    });
  }, [trades, selectedDays]);

  // Extract unique setups from trades
  const uniqueSetups = useMemo(() => {
    const setups = new Set<string>();
    trades.forEach(trade => {
      if (trade.setup) {
        setups.add(trade.setup);
      }
    });
    return Array.from(setups).sort();
  }, [trades]);

  // Get available sessions for the selected setup
  const availableSessionsForSetup = useMemo(() => {
    if (!selectedSetup) return [];
    
    const sessions = new Set<string>();
    selectedTrades.forEach(trade => {
      if (trade.setup === selectedSetup && trade.session) {
        sessions.add(trade.session);
      }
    });
    return Array.from(sessions).sort();
  }, [selectedTrades, selectedSetup]);

  const metrics = useMemo(() => {
    if (selectedTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        netPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        avgRRR: 0,
        bestDay: null,
        worstDay: null,
        sessionStats: [],
        symbolStats: [],
        setupStats: [],
        combinedStats: [],
        consistencyScore: 0,
      };
    }

    const pnlVals = selectedTrades.map(t => Number(t.realized_amount || 0)).filter(n => Number.isFinite(n));
    const wins = pnlVals.filter(p => p > 0).length;
    const losses = pnlVals.filter(p => p < 0).length;
    const winRate = (wins / selectedTrades.length) * 100;
    const netPnL = pnlVals.reduce((sum, p) => sum + p, 0);
    const avgWin = wins > 0 ? pnlVals.filter(p => p > 0).reduce((sum, p) => sum + p, 0) / wins : 0;
    const avgLoss = losses > 0 ? pnlVals.filter(p => p < 0).reduce((sum, p) => sum + p, 0) / losses : 0;
    const avgRRR = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;

    // Trades by day
    const tradesByDay = WEEKDAYS.map((day, idx) => {
      const dayTrades = selectedTrades.filter(t => getWeekdayIndex(getDayOfWeek(t.entry_at || t.created_at)) === idx);
      const dayPnL = dayTrades.reduce((sum, t) => sum + Number(t.realized_amount || 0), 0);
      const dayWins = dayTrades.filter(t => Number(t.realized_amount || 0) > 0).length;
      const dayWinRate = dayTrades.length > 0 ? (dayWins / dayTrades.length) * 100 : 0;
      return { day: day.substring(0, 3), trades: dayTrades.length, winRate: dayWinRate, pnl: dayPnL, fullDay: day };
    }).filter(d => selectedDays[WEEKDAYS.indexOf(d.fullDay)]);

    // Best and worst day
    const sortedDays = [...tradesByDay].sort((a, b) => b.pnl - a.pnl);
    const bestDay = sortedDays.length > 0 ? sortedDays[0] : null;
    const worstDay = sortedDays.length > 1 ? sortedDays[sortedDays.length - 1] : null;

    // 7 Session Stats - Use session field from journal entries, include all predefined sessions
    const sessionMap: Record<string, any> = {};
    
    // Initialize all 7 sessions (matching AddJournalDialog)
    const SESSIONS = [
      'No Session',
      'London',
      'Asia',
      'New York',
      'London Killzone',
      'Asia Killzone',
      'New York Killzone'
    ];
    
    SESSIONS.forEach(session => {
      sessionMap[session] = { name: session, trades: 0, wins: 0, pnl: 0 };
    });
    
    // Populate with actual trade data
    selectedTrades.forEach(t => {
      const session = t.session || 'No Session';
      const pnl = Number(t.realized_amount || 0);
      if (!sessionMap[session]) {
        sessionMap[session] = { name: session, trades: 0, wins: 0, pnl: 0 };
      }
      sessionMap[session].trades += 1;
      sessionMap[session].pnl += pnl;
      if (pnl > 0) sessionMap[session].wins += 1;
    });
    const sessionStats = Object.entries(sessionMap).map(([key, data]: [string, any]) => ({
      name: data.name,
      trades: data.trades,
      pnl: data.pnl,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    }));

    // Symbol Stats
    const symbolMap: Record<string, any> = {};
    selectedTrades.forEach(t => {
      const symbol = t.symbol || 'Unknown';
      const pnl = Number(t.realized_amount || 0);
      if (!symbolMap[symbol]) symbolMap[symbol] = { trades: 0, wins: 0, pnl: 0 };
      symbolMap[symbol].trades += 1;
      symbolMap[symbol].pnl += pnl;
      if (pnl > 0) symbolMap[symbol].wins += 1;
    });
    const symbolStats = Object.entries(symbolMap).map(([symbol, data]: [string, any]) => ({
      symbol,
      trades: data.trades,
      wins: data.wins,
      winRate: (data.wins / data.trades) * 100,
      pnl: data.pnl,
    })).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));

    // Setup Stats
    const setupMap: Record<string, any> = {};
    selectedTrades.forEach(t => {
      const setup = t.setup || 'Unknown';
      const pnl = Number(t.realized_amount || 0);
      if (!setupMap[setup]) setupMap[setup] = { trades: 0, wins: 0, pnl: 0 };
      setupMap[setup].trades += 1;
      setupMap[setup].pnl += pnl;
      if (pnl > 0) setupMap[setup].wins += 1;
    });
    const setupStats = Object.entries(setupMap).map(([setup, data]: [string, any]) => ({
      setup,
      trades: data.trades,
      wins: data.wins,
      winRate: (data.wins / data.trades) * 100,
      pnl: data.pnl,
    })).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));

    // Combined Symbol + Setup + Session Stats - Use session field from journal
    const combinedMap: Record<string, any> = {};
    selectedTrades.forEach(t => {
      const symbol = t.symbol || 'Unknown';
      const setup = t.setup || 'Unknown';
      const sessionName = t.session || 'No Session';
      const pnl = Number(t.realized_amount || 0);
      
      // Calculate RR using money amounts
      let rr = 0;
      const riskAmount = Number(t.risk_amount || 0);
      const profitAmount = Number(t.profit_target || 0);
      const realizedAmount = Number(t.realized_amount || 0);
      
      if (riskAmount > 0 && profitAmount > 0) {
        // Money-based RR calculation: profit / risk
        rr = profitAmount / riskAmount;
        rr = Math.min(Math.max(rr, 0), 50);
      }
      
      // Handle manual exits with amount-based RR
      if (t.result === 'MANUAL' && riskAmount > 0) {
        rr = realizedAmount / riskAmount;
        rr = Math.min(Math.max(rr, -10), 50);
      }
      
      const key = `${symbol}|${setup}|${sessionName}`;
      if (!combinedMap[key]) {
        combinedMap[key] = { symbol, setup, session: sessionName, trades: 0, wins: 0, pnl: 0, totalRR: 0 };
      }
      combinedMap[key].trades += 1;
      combinedMap[key].pnl += pnl;
      combinedMap[key].totalRR += rr;
      if (pnl > 0) combinedMap[key].wins += 1;
    });
    const combinedStats = Object.values(combinedMap).map((item: any) => ({
      ...item,
      winRate: (item.wins / item.trades) * 100,
      avgRR: item.totalRR / Math.max(item.trades, 1),
    })).sort((a: any, b: any) => Math.abs(b.pnl) - Math.abs(a.pnl));

    const winLossVariance = Math.abs(wins - losses) / Math.max(wins + losses, 1) * 100;
    const rrrStability = Math.min(avgRRR * 20, 50);
    const consistencyScore = Math.round(Math.max(0, 100 - winLossVariance + (rrrStability - 20)));

    return {
      totalTrades: selectedTrades.length,
      winRate,
      netPnL,
      avgWin,
      avgLoss,
      avgRRR,
      bestDay,
      worstDay,
      sessionStats,
      symbolStats,
      setupStats,
      combinedStats,
      consistencyScore,
    };
  }, [selectedTrades]);

  if (trades.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-6 h-6 text-cyan-400" />
                Weekday Analysis
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Analyze performance by day of week</p>
            </div>
            <Badge className="bg-cyan-500/30 text-cyan-300">0 trades</Badge>
          </div>

          <Card className="p-12 text-center border-dashed border-2 border-cyan-500/30 bg-cyan-500/5">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-cyan-400 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Trades Yet</h3>
            <p className="text-muted-foreground mb-4">
              To view full weekday analytics, start by journaling your first trade
            </p>
            <p className="text-sm text-cyan-400 font-medium">
              Track your best & worst trading days, win rates by weekday, and more
            </p>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      {metrics.totalTrades === 0 ? (
        <Card className="p-6 text-center text-muted-foreground"><p>No trades</p></Card>
      ) : (
        <div className="space-y-6">

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: SESSION PERFORMANCE */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}

          <div className="pt-6 pb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
               Session Performance
              <div className="h-px flex-1 bg-gradient-to-l from-blue-500/50 to-transparent"></div>
            </h2>
          </div>

          {/* 7 Session Performance - Compact Cards */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {metrics.sessionStats.map((session, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="h-full"
                >
                  <Card 
                    onClick={() => {
                      setSelectedSessionName(session.name);
                      setSessionModalOpen(true);
                    }}
                    className={`h-full flex flex-col border transition-all cursor-pointer hover:shadow-md ${
                      session.trades === 0 
                        ? 'border-slate-700/40 bg-slate-950/50 hover:border-slate-600/50' 
                        : session.pnl >= 0 
                          ? 'border-emerald-500/40 bg-slate-950/50 hover:border-emerald-500/60 hover:bg-emerald-500/5' 
                          : 'border-rose-500/40 bg-slate-950/50 hover:border-rose-500/60 hover:bg-rose-500/5'
                    }`}>
                    <div className="flex flex-col gap-2 p-2 h-full">
                      {/* Session Name - Header */}
                      <div className="pb-1 border-b border-slate-700/30 h-8 flex items-center">
                        <p className="text-xs font-bold text-foreground truncate">{session.name}</p>
                      </div>
                      
                      {/* Trades Count */}
                      <div className="flex-1 flex items-center justify-between text-xs px-1 py-0.5 bg-slate-900/30 rounded border border-slate-700/30">
                        <span className="text-muted-foreground">Trades</span>
                        <span className="font-bold text-foreground">{session.trades}</span>
                      </div>
                      
                      {/* Win Rate */}
                      <div className="flex-1 flex items-center justify-between text-xs px-1 py-0.5 bg-slate-900/30 rounded border border-slate-700/30">
                        <span className="text-muted-foreground">WR</span>
                        <span className="font-bold text-indigo-400">
                          {session.trades > 0 ? session.winRate.toFixed(0) : '—'}%
                        </span>
                      </div>
                      
                      {/* P&L */}
                      <div className={`flex-1 mt-auto rounded border-2 p-1 flex items-center justify-center text-center ${
                        session.trades === 0 
                          ? 'border-slate-700/40 bg-slate-900/30' 
                          : session.pnl >= 0 
                            ? 'border-emerald-500/50 bg-emerald-500/10' 
                            : 'border-rose-500/50 bg-rose-500/10'
                      }`}>
                        <p className={`text-xs font-bold ${
                          session.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {session.pnl >= 0 ? '+' : ''}${Math.abs(session.pnl).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* SECTION 3: SETUP PERFORMANCE */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}

          <div className="pt-6 pb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent"></div>
               Setup Performance
              <div className="h-px flex-1 bg-gradient-to-l from-violet-500/50 to-transparent"></div>
            </h2>
          </div>

          {/* Setup Performance */}
          {metrics.setupStats.length > 0 && (
            <Card className="p-5 border border-violet-500/30 bg-violet-500/5">
              <div className="space-y-4">
                {/* Scrollable Table Container */}
                <div className="relative border border-violet-500/30 rounded-lg overflow-hidden">
                  <div className="overflow-y-auto max-h-80 scrollbar-hide">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-900 border-b border-violet-500/30 z-10">
                        <tr className="text-muted-foreground">
                          <th className="text-left py-3 px-4 font-semibold">Setup</th>
                          <th className="text-center py-3 px-4 font-semibold">Trades</th>
                          <th className="text-center py-3 px-4 font-semibold">Win Rate</th>
                          <th className="text-right py-3 px-4 font-semibold">P&L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-violet-500/20">
                        {metrics.setupStats.map((item, idx) => (
                          <tr key={idx} className="hover:bg-violet-500/20 transition">
                            <td className="py-3 px-4 font-semibold text-foreground">{item.setup}</td>
                            <td className="py-3 px-4 text-center text-foreground font-semibold">{item.trades}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={`text-xs ${item.winRate > 55 ? 'bg-emerald-500/30 text-emerald-400' : item.winRate > 45 ? 'bg-slate-500/30 text-slate-300' : 'bg-rose-500/30 text-rose-400'}`}>
                                {item.winRate.toFixed(1)}%
                              </Badge>
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* SECTION 4: SYMBOL + SETUP + SESSION DETAILS */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}

          <div className="pt-6 pb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
               Symbol + Setup + Session Details
              <div className="h-px flex-1 bg-gradient-to-l from-indigo-500/50 to-transparent"></div>
            </h2>
          </div>

          {/* Combined Symbol + Setup + Session Details - With Dropdowns */}
          {metrics.combinedStats.length > 0 && (
            <Card className="p-5 border border-indigo-500/30 bg-indigo-500/5">
              <div className="space-y-4">
                {/* Filter Controls */}
                <div className="flex flex-wrap gap-4 items-end">
                  {/* Symbol Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-muted-foreground">Symbol</label>
                    <select 
                      value={selectedFilterSymbol || ''}
                      onChange={(e) => setSelectedFilterSymbol(e.target.value || null)}
                      className="px-3 py-2 text-xs bg-slate-900/50 border border-indigo-500/30 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer min-w-[120px]"
                    >
                      <option value="">All Symbols</option>
                      {Array.from(new Set(metrics.combinedStats.map((item: any) => item.symbol)))
                        .sort()
                        .map((symbol: string) => (
                          <option key={symbol} value={symbol}>{symbol}</option>
                        ))}
                    </select>
                  </div>

                  {/* Session Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-muted-foreground">Session</label>
                    <select 
                      value={selectedFilterSession}
                      onChange={(e) => setSelectedFilterSession(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-900/50 border border-indigo-500/30 rounded text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer min-w-[140px]"
                    >
                      <option value="All Sessions">All Sessions</option>
                      <option value="No Session">No Session</option>
                      <option value="London">London</option>
                      <option value="Asia">Asia</option>
                      <option value="New York">New York</option>
                      <option value="London Killzone">London Killzone</option>
                      <option value="Asia Killzone">Asia Killzone</option>
                      <option value="New York Killzone">New York Killzone</option>
                    </select>
                  </div>

                  {/* Setup Display - Text Only */}
                  {selectedFilterSymbol && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">Setup</label>
                      <div className="px-3 py-2 text-xs bg-slate-900/50 border border-indigo-500/30 rounded text-foreground">
                        {Array.from(new Set(
                          metrics.combinedStats
                            .filter((item: any) => item.symbol === selectedFilterSymbol)
                            .map((item: any) => item.setup)
                        )).join(', ') || '—'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Scrollable Table */}
                <div className="relative border border-indigo-500/30 rounded-lg overflow-hidden">
                  <div className="overflow-y-auto max-h-80 scrollbar-hide">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-900 border-b border-indigo-500/30 z-10">
                        <tr className="text-muted-foreground">
                          <th className="text-left py-3 px-4 font-semibold">Symbol</th>
                          <th className="text-left py-3 px-4 font-semibold">Setup</th>
                          <th className="text-left py-3 px-4 font-semibold">Session</th>
                          <th className="text-center py-3 px-4 font-semibold">Trades</th>
                          <th className="text-center py-3 px-4 font-semibold">WR</th>
                          <th className="text-center py-3 px-4 font-semibold">Avg RR</th>
                          <th className="text-right py-3 px-4 font-semibold">P&L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-500/20">
                        {metrics.combinedStats
                          .filter((item: any) => {
                            const matchSymbol = !selectedFilterSymbol || item.symbol === selectedFilterSymbol;
                            const matchSession = selectedFilterSession === 'All Sessions' || item.session === selectedFilterSession;
                            return matchSymbol && matchSession;
                          })
                          .map((item: any, idx) => (
                          <tr key={idx} className="hover:bg-indigo-500/20 transition">
                            <td className="py-3 px-4 font-semibold text-foreground">{item.symbol}</td>
                            <td className="py-3 px-4 text-foreground">{item.setup}</td>
                            <td className="py-3 px-4 text-muted-foreground">{item.session}</td>
                            <td className="py-3 px-4 text-center text-foreground font-semibold">{item.trades}</td>
                            <td className="py-3 px-4 text-center text-indigo-400 font-semibold">{item.winRate.toFixed(0)}%</td>
                            <td className="py-3 px-4 text-center text-orange-400 font-semibold">1:{item.avgRR.toFixed(2)}</td>
                            <td className={`py-3 px-4 text-right font-bold ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* No Data Message */}
                {metrics.combinedStats.filter((item: any) => {
                  const matchSymbol = !selectedFilterSymbol || item.symbol === selectedFilterSymbol;
                  const matchSession = selectedFilterSession === 'All Sessions' || item.session === selectedFilterSession;
                  return matchSymbol && matchSession;
                }).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    <p>No data available for the selected filters</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════ */}
          {/* SECTION 5: CONSISTENCY SCORE */}
          {/* ═══════════════════════════════════════════════════════════════════════ */}

          <div className="pt-6 pb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent"></div>
              📊 Weekly Consistency Score
              <div className="h-px flex-1 bg-gradient-to-l from-violet-500/50 to-transparent"></div>
            </h2>
          </div>

          {/* Consistency Score */}
          <Card className="p-4 border border-violet-500/30 bg-violet-500/5">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-muted-foreground font-semibold mb-1">Consistency Score</p><p className="text-xs text-muted-foreground">Higher = more stable performance</p></div>
              <div className="text-right"><p className="text-4xl font-bold text-violet-400">{metrics.consistencyScore}</p><p className="text-xs text-muted-foreground mt-1">/100</p></div>
            </div>
            <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500" initial={{ width: 0 }} animate={{ width: `${metrics.consistencyScore}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
            </div>
          </Card>

          {/* Session Trades Modal */}
          <SessionTradesModal 
            open={sessionModalOpen}
            onOpenChange={setSessionModalOpen}
            sessionName={selectedSessionName}
            trades={selectedTrades}
          />
        </div>
      )}
    </motion.div>
    </>
  );
};

export default WeekdayAnalysisSection;