import React, { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import supabase from "@/lib/supabase";
import { ViewJournalDialog } from "@/components/modals/ViewJournalDialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatDateKey(dt: string | Date) {
  const d = new Date(dt);
  return d.toISOString().slice(0, 10);
}

interface CalendarViewProps {
  entries: any[];
  onOpenEntry: (e: any) => void;
}

function CalendarView({ entries, onOpenEntry }: CalendarViewProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = firstOfMonth.getFullYear();
  const month = firstOfMonth.getMonth();
  const startDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: string; trades: any[]; total: number }[] = [];
  const mapByDate = new Map<string, any[]>();
  for (const e of entries) {
    const ts = e.entry_at || e.created_at;
    if (!ts) continue;
    const k = formatDateKey(ts);
    if (!mapByDate.has(k)) mapByDate.set(k, []);
    mapByDate.get(k)!.push(e);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = new Date(year, month, d).toISOString().slice(0, 10);
    const list = mapByDate.get(key) ?? [];
    const total = list.reduce((s: any, t: any) => s + Number(t.realized_amount ?? t.realized_points ?? 0), 0);
    cells.push({ date: key, trades: list, total });
  }

  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded hover:bg-accent/10"
            onClick={() => setMonthOffset(m => m - 1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-medium border border-border rounded-md px-3 py-1">
            {firstOfMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button
            className="p-1 rounded hover:bg-accent/10"
            onClick={() => setMonthOffset(m => m + 1)}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div />
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm">
        <div className="font-medium">Sun</div>
        <div className="font-medium">Mon</div>
        <div className="font-medium">Tue</div>
        <div className="font-medium">Wed</div>
        <div className="font-medium">Thu</div>
        <div className="font-medium">Fri</div>
        <div className="font-medium">Sat</div>
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {cells.map(c => (
          <div key={c.date} className="p-2 border rounded cursor-pointer relative" onClick={() => setSelectedDay(c)}>
            <div className="absolute top-1 left-1 text-xs font-semibold">{Number(c.date.slice(8, 10))}</div>
            <div className="flex flex-col items-center justify-center text-center min-h-[56px]">
              <div className="text-xs">
                {c.trades.length} trade{c.trades.length !== 1 ? 's' : ''}
              </div>
              <div className={`text-xs mt-1 ${c.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {c.total >= 0 ? '+' : ''}${c.total.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDay && (
        <div className="mt-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">
                {selectedDay.date} — {selectedDay.trades.length} trade(s)
              </div>
              <div>
                <Button variant="ghost" onClick={() => setSelectedDay(null)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {selectedDay.trades.map((t: any) => (
                <div key={t.id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {t.symbol} • {t.setup}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.direction} • {(t.realized_amount ?? t.realized_points) >= 0 ? '+' : ''}$
                      {Number(t.realized_amount ?? t.realized_points ?? 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => onOpenEntry(t)}>
                      <Image className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

interface MonthlyViewProps {
  entries: any[];
  selectedMonth?: string;
  onOpenDay?: (date: string) => void;
  showWeekTotals?: boolean;
  onMobileSelect?: (date: string, trades: number, pnl: number) => void;
}

function MonthlyView({
  entries,
  selectedMonth,
  onOpenDay,
  showWeekTotals,
  onMobileSelect
}: MonthlyViewProps) {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  let year: number, m: number;
  if (selectedMonth) {
    const [y, mm] = selectedMonth.split('-').map(x => Number(x));
    year = y;
    m = mm - 1;
  } else {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    year = firstOfMonth.getFullYear();
    m = firstOfMonth.getMonth();
  }

  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const mapByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const e of entries) {
      const ts = e.entry_at || e.created_at;
      if (!ts) continue;
      const k = new Date(ts).toISOString().slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return map;
  }, [entries]);

  const startDay = new Date(year, m, 1).getDay();
  const weeks: Array<({ date: string; trades: any[]; total: number } | null)[]> = [];
  let curWeek: ({ date: string; trades: any[]; total: number } | null)[] = [];
  for (let i = 0; i < startDay; i++) curWeek.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = new Date(year, m, d).toISOString().slice(0, 10);
    const list = mapByDate.get(key) ?? [];
    const total = list.reduce((s: any, t: any) => s + Number(t.realized_amount ?? t.realized_points ?? 0), 0);
    curWeek.push({ date: key, trades: list, total });
    if (curWeek.length === 7) {
      weeks.push(curWeek);
      curWeek = [];
    }
  }
  if (curWeek.length) {
    while (curWeek.length < 7) curWeek.push(null);
    weeks.push(curWeek);
  }

  const selMonth = selectedMonth ?? `${year}-${String(m + 1).padStart(2, '0')}`;
  const list = useMemo(
    () =>
      entries.filter(e => {
        const ts = e.entry_at || e.created_at;
        return ts && ts.startsWith(selMonth);
      }),
    [entries, selMonth]
  );
  const totalTrades = list.length;
  const totalPnl = list.reduce((s: any, t: any) => s + Number(t.realized_amount ?? t.realized_points ?? 0), 0);

  return (
    <div>
      <div className="mb-3 sm:mb-4 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 sm:p-2 rounded hover:bg-accent/10 transition-colors"
            onClick={() => setMonthOffset(o => o - 1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-xs sm:text-sm font-medium border border-border rounded-md px-2 sm:px-3 py-1 whitespace-nowrap">
            {new Date(year, m, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button
            className="p-1.5 sm:p-2 rounded hover:bg-accent/10 transition-colors"
            onClick={() => setMonthOffset(o => o + 1)}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div />
      </div>

      <div className="text-xs sm:text-sm mb-2 sm:mb-4 grid grid-cols-7 gap-1 sm:gap-2">
        <div className="font-medium text-center text-muted-foreground text-xs">S</div>
        <div className="font-medium text-center text-muted-foreground text-xs">M</div>
        <div className="font-medium text-center text-muted-foreground text-xs">T</div>
        <div className="font-medium text-center text-muted-foreground text-xs">W</div>
        <div className="font-medium text-center text-muted-foreground text-xs">T</div>
        <div className="font-medium text-center text-muted-foreground text-xs">F</div>
        <div className="font-medium text-center text-muted-foreground text-xs">S</div>
      </div>

      <div className="mb-4 space-y-2">
        {weeks.map((week, wi) => (
          <div key={wi}>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {week.map((c, ci) =>
                c ? (
                  <div
                    key={c.date}
                    className={`border-2 rounded cursor-pointer hover:shadow-md transition-all relative aspect-square sm:aspect-auto sm:min-h-[110px] flex flex-col p-2 sm:p-3 overflow-hidden ${
                      c.trades.length === 0
                        ? 'sm:bg-card/40 bg-card/30 border-border sm:border-border sm:hover:border-primary/50'
                        : c.total >= 0
                        ? 'sm:bg-card/40 bg-emerald-500/20 border-emerald-500/50 sm:border-border sm:hover:border-primary/50'
                        : 'sm:bg-card/40 bg-rose-500/20 border-rose-500/50 sm:border-border sm:hover:border-primary/50'
                    }`}
                    title={`${c.trades.length} trades, P&L: ${c.total >= 0 ? '+' : ''}$${c.total.toFixed(2)}`}
                    onClick={() => {
                      if (window.innerWidth < 768 && onMobileSelect) {
                        onMobileSelect(c.date, c.trades.length, c.total);
                      } else if (onOpenDay) {
                        onOpenDay(c.date);
                      }
                    }}
                  >
                    <div className="hidden sm:block">
                      <div className="text-xs sm:text-sm font-bold text-muted-foreground mb-auto">
                        {Number(c.date.slice(8, 10))}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="text-xs font-medium text-foreground leading-tight truncate">
                          {c.trades.length} trade{c.trades.length !== 1 ? 's' : ''}
                        </div>
                        <div
                          className={`text-xs sm:text-sm font-bold leading-tight truncate ${
                            c.trades.length === 0
                              ? 'text-slate-500'
                              : c.total >= 0
                              ? 'text-emerald-500'
                              : 'text-rose-500'
                          }`}
                        >
                          {c.trades.length === 0
                            ? 'No trades'
                            : `${c.total >= 0 ? '+' : ''}$${Math.abs(c.total).toFixed(2)}`}
                        </div>
                      </div>
                    </div>

                    <div className="sm:hidden flex flex-col justify-between h-full w-full">
                      <div className={`text-xs font-bold ${c.trades.length === 0 ? 'text-muted-foreground' : 'text-white'}`}>
                        {Number(c.date.slice(8, 10))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={`pad-${wi}-${ci}`} />
                )
              )}
            </div>
            {showWeekTotals && (
              <div className="text-right text-xs sm:text-sm text-muted-foreground mt-2 px-1">
                Week:{' '}
                {(() => {
                  const wtot = week.reduce((s: any, c: any) => s + (c ? Number(c.total || 0) : 0), 0);
                  return (wtot >= 0 ? '+' : '') + '$' + Math.abs(wtot).toFixed(2);
                })()}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Total trades (selected month)</div>
          <div className="text-xl sm:text-2xl font-bold">{totalTrades}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Net P&L (selected month)</div>
          <div className="text-xl sm:text-2xl font-bold">{totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg P&L per trade</div>
          <div className="text-xl sm:text-2xl font-bold">{totalTrades ? `$${(totalPnl / totalTrades).toFixed(2)}` : '-'}</div>
        </Card>
      </div>
    </div>
  );
}

function YearlyView({
  entries,
  onDrillMonth
}: {
  entries: any[];
  onDrillMonth?: (ym: string) => void;
}) {
  const [yearOffset, setYearOffset] = useState(0);
  const now = new Date();
  const year = now.getFullYear() + yearOffset;

  const monthAgg = useMemo(() => {
    const agg: Record<number, number> = {};
    for (const e of entries) {
      const ts = e.entry_at || e.created_at;
      if (!ts) continue;
      const d = new Date(ts);
      if (d.getFullYear() !== year) continue;
      const m = d.getMonth();
      agg[m] = (agg[m] || 0) + Number(e.realized_amount ?? e.realized_points ?? 0);
    }
    return agg;
  }, [entries, year]);

  const total = Object.values(monthAgg).reduce((s, n) => s + n, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-accent/10" onClick={() => setYearOffset(y => y - 1)} aria-label="Previous year">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-medium border border-border rounded-md px-3 py-1">{year}</div>
          <button className="p-1 rounded hover:bg-accent/10" onClick={() => setYearOffset(y => y + 1)} aria-label="Next year">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div />
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const val = monthAgg[i] ?? 0;
          const monthName = new Date(year, i, 1).toLocaleString(undefined, { month: 'short' });
          const tradesCount = entries.filter((e: any) => {
            const ts = e.entry_at || e.created_at;
            return ts && new Date(ts).getFullYear() === year && new Date(ts).getMonth() === i;
          }).length;
          return (
            <Card
              key={i}
              className="p-2 sm:p-3 cursor-pointer flex flex-col items-center justify-center text-center"
              onClick={() => onDrillMonth && onDrillMonth(`${year}-${String(i + 1).padStart(2, '0')}`)}
            >
              <div className="text-xs sm:text-sm text-muted-foreground">{monthName}</div>
              <div className={`text-sm sm:text-lg font-semibold mt-1 ${val >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {val >= 0 ? '+' : ''}${val.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {tradesCount} trade{tradesCount !== 1 ? 's' : ''}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Net P&L (year)</div>
          <div className="text-xl sm:text-2xl font-bold">{total >= 0 ? '+' : ''}${total.toFixed(2)}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg monthly</div>
          <div className="text-xl sm:text-2xl font-bold">{`$${(total / 12).toFixed(2)}`}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Best month</div>
          <div className="text-sm sm:text-lg font-bold">
            {(() => {
              const bestIdx = Object.entries(monthAgg).sort((a: any, b: any) => b[1] - a[1])[0];
              return bestIdx
                ? `${new Date(year, Number(bestIdx[0]), 1).toLocaleString(undefined, { month: 'short' })} ${bestIdx[1] >= 0 ? '+' : ''}$${Number(bestIdx[1]).toFixed(2)}`
                : '-';
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
}

const JournalDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [view, setView] = useState<'calendar' | 'monthly' | 'weekly' | 'daily'>('calendar');
  const [calendarGranularity, setCalendarGranularity] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [drilledMonth, setDrilledMonth] = useState<string | null>(null);
  const [openEntry, setOpenEntry] = useState<any | null>(null);
  const [mobileModalData, setMobileModalData] = useState<{ date: string; trades: number; pnl: number } | null>(null);

  // Fetch journals
  useEffect(() => {
    let mounted = true;
    setJournalLoading(true);

    const fetchJ = async () => {
      try {
        const userId = user?.id ?? null;
        const { data, error } = await supabase.from('journals').select('*');
        if (error) {
          console.error('Failed to fetch journals', error);
          return [];
        }

        let rows = data || [];

        rows = rows.sort((a: any, b: any) => {
          const aTime = new Date(a.entry_at || a.created_at || 0).getTime();
          const bTime = new Date(b.entry_at || b.created_at || 0).getTime();
          return bTime - aTime;
        });

        return rows;
      } catch (err) {
        console.error('Unexpected error fetching journals for dashboard', err);
        return [];
      }
    };

    (async () => {
      const rows = await fetchJ();
      if (!mounted) return;
      setEntries(rows);
      setJournalLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
          Journal Analytics
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Monitor your trading performance and track progress across all your journal entries
        </p>
      </motion.div>

      {/* Journal Navigation */}
      <motion.div
        className="flex justify-between items-center pb-4 border-b border-border/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-2">
          {drilledMonth && (
            <Button
              variant="outline"
              onClick={() => {
                setDrilledMonth(null);
              }}
              className="hover:bg-accent/10 transition-colors"
            >
              {'← Back to Year View'}
            </Button>
          )}
        </div>
      </motion.div>

      {journalLoading && (
        <motion.div
          className="text-sm text-muted-foreground animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading journal...
        </motion.div>
      )}

      {/* --- Calendar (top) --- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <Card className="p-3 sm:p-6 mb-6 border border-cyan-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-cyan-500/5 via-background to-background/80 hover:border-cyan-500/40 overflow-visible">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Trading Calendar
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Click a day to view all trades from that date</p>
            </div>
            <div className="relative w-full sm:w-auto flex-shrink-0">
              <select
                value={calendarGranularity}
                onChange={(e) => setCalendarGranularity(e.target.value as any)}
                className="appearance-none w-full sm:w-auto text-xs sm:text-sm bg-slate-800 text-cyan-100 border-2 border-cyan-500 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 hover:border-cyan-400 hover:bg-slate-700 hover:text-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/70 focus:outline-none transition-colors duration-200 font-semibold cursor-pointer shadow-lg"
              >
                <option value="monthly" className="bg-slate-900 text-cyan-100">
                  Monthly View
                </option>
                <option value="weekly" className="bg-slate-900 text-cyan-100">
                  Weekly View
                </option>
                <option value="yearly" className="bg-slate-900 text-cyan-100">
                  Yearly View
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-cyan-400">
                <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="border border-cyan-500/20 rounded-xl p-3 sm:p-5 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-sm hover:border-cyan-500/40 transition-colors duration-200 mt-4 sm:mt-5 overflow-hidden">
            {drilledMonth ? (
              <MonthlyView
                entries={entries}
                selectedMonth={drilledMonth}
                onOpenDay={(d) => navigate(`/dashboard/journal?date=${d}`)}
                onMobileSelect={(date, trades, pnl) => setMobileModalData({ date, trades, pnl })}
              />
            ) : (
              <>
                {calendarGranularity === 'weekly' && (
                  <MonthlyView
                    entries={entries}
                    showWeekTotals
                    onOpenDay={(d) => navigate(`/dashboard/journal?date=${d}`)}
                    onMobileSelect={(date, trades, pnl) => setMobileModalData({ date, trades, pnl })}
                  />
                )}
                {calendarGranularity === 'monthly' && (
                  <MonthlyView
                    entries={entries}
                    onOpenDay={(d) => navigate(`/dashboard/journal?date=${d}`)}
                    onMobileSelect={(date, trades, pnl) => setMobileModalData({ date, trades, pnl })}
                  />
                )}
                {calendarGranularity === 'yearly' && (
                  <YearlyView
                    entries={entries}
                    onDrillMonth={(m) => {
                      setDrilledMonth(m);
                    }}
                  />
                )}
              </>
            )}
          </div>
        </Card>
      </motion.div>

      {/* View Full Journal Button - Below Calendar */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
      >
        <Button
          onClick={() => navigate('/dashboard/journal')}
          className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all duration-200 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold"
        >
          View Full Journal
        </Button>
      </motion.div>

      {/* --- Journal analytics panels --- */}
      <motion.div
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Win/Loss Overview */}
        <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-emerald-500/5 via-background to-background">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Trades</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">{entries.length}</div>
          <div className="mt-3 sm:mt-4 grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-3 text-xs">
            <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden">
              <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs truncate">Wins</div>
              <div className="font-bold text-emerald-400 text-xs sm:text-sm truncate">{entries.filter(e => e.win).length}</div>
            </div>
            <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 overflow-hidden">
              <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs truncate">Losses</div>
              <div className="font-bold text-rose-400 text-xs sm:text-sm truncate">{entries.filter(e => !e.win).length}</div>
            </div>
            <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden">
              <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs truncate">Win %</div>
              <div className="font-bold text-blue-400 text-xs sm:text-sm truncate">
                {entries.length > 0 ? ((entries.filter(e => e.win).length / entries.length) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>
        </Card>

        {/* Total Realized P&L */}
        <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-500/5 via-background to-background">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Total P&L</div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold ${
              (() => {
                const total = entries.reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0);
                return total >= 0 ? 'text-emerald-400' : 'text-rose-400';
              })()
            }`}
          >
            {(() => {
              const total = entries.reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0);
              return (total >= 0 ? '+' : '') + total.toFixed(2);
            })()}
          </div>
          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-xs">
            <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30 overflow-hidden">
              <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs truncate">Per Trade</div>
              <div className="font-bold text-cyan-400 text-xs sm:text-sm truncate">
                ${entries.length > 0 ? (entries.reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0) / entries.length).toFixed(2) : 0}
              </div>
            </div>
            <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30 overflow-hidden">
              <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs truncate">View</div>
              <div className="font-bold text-muted-foreground capitalize text-xs sm:text-sm truncate">{view}</div>
            </div>
          </div>
        </Card>

        {/* Avg Trade Profit & Profit Factor */}
        <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-500/5 via-background to-background">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Win/Loss</div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">Avg Win</div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-400">
                ${(() => {
                  const wins = entries.filter(e => Number(e.realized_amount ?? e.realized_points ?? 0) > 0);
                  return wins.length > 0 
                    ? (wins.reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0) / wins.length).toFixed(2)
                    : '0.00';
                })()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">Avg Loss</div>
              <div className="text-lg sm:text-2xl font-bold text-rose-400">
                ${(() => {
                  const losses = entries.filter(e => Number(e.realized_amount ?? e.realized_points ?? 0) < 0);
                  return losses.length > 0 
                    ? (losses.reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0) / losses.length).toFixed(2)
                    : '0.00';
                })()}
              </div>
            </div>
          </div>
        </Card>

        {/* Profit Factor */}
        <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-yellow-500/5 via-background to-background">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Profit Factor</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
            {(() => {
              const totalWins = entries.filter(e => Number(e.realized_amount ?? e.realized_points ?? 0) > 0)
                .reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0);
              const totalLosses = Math.abs(entries.filter(e => Number(e.realized_amount ?? e.realized_points ?? 0) < 0)
                .reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0));
              const pf = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : '∞';
              return pf;
            })()}
          </div>
          <div className="mt-3 sm:mt-4 text-xs text-muted-foreground">
            <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30">
              <div className="text-xs">Wins ÷ Losses</div>
              <div className="text-xs text-muted-foreground mt-1">
                {(() => {
                  const totalWins = entries.filter(e => Number(e.realized_amount ?? e.realized_points ?? 0) > 0)
                    .reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0);
                  const totalLosses = Math.abs(entries.filter(e => Number(e.realized_amount ?? e.realized_points ?? 0) < 0)
                    .reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0));
                  return `$${totalWins.toFixed(0)} ÷ $${totalLosses.toFixed(0)}`;
                })()}
              </div>
            </div>
          </div>
        </Card>

        {/* Best/Worst Trade */}
        <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-cyan-500/5 via-background to-background">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Extremes</div>
            <Badge variant="outline" className="bg-accent/10 text-xs sm:text-sm">
              Range
            </Badge>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">Best Trade</div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-400">
                ${(() => {
                  const best = Math.max(...entries.map((e: any) => Number(e.realized_amount ?? e.realized_points ?? 0)));
                  return best === -Infinity ? '0.00' : best.toFixed(2);
                })()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">Worst Trade</div>
              <div className="text-lg sm:text-2xl font-bold text-rose-400">
                ${(() => {
                  const worst = Math.min(...entries.map((e: any) => Number(e.realized_amount ?? e.realized_points ?? 0)));
                  return worst === Infinity ? '0.00' : worst.toFixed(2);
                })()}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Period Summary */}
        <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-500/5 via-background to-background">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Period Summary</div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-xs">
            <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30 overflow-hidden">
              <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs truncate">This Month</div>
              <div className="font-bold text-cyan-400 text-xs sm:text-sm truncate">
                {(() => {
                  const m = new Date().toISOString().slice(0, 7);
                  const list = entries.filter(e => e.executed_at && e.executed_at.startsWith(m));
                  return '$' + list.reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0).toFixed(2);
                })()}
              </div>
            </div>
            <div className="p-1 xs:p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30 overflow-hidden">
              <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs truncate">Last Week</div>
              <div className="font-bold text-cyan-400 text-xs sm:text-sm truncate">
                {(() => {
                  const now = new Date();
                  const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                  const list = entries.filter(e => {
                    if (!e.executed_at) return false;
                    const d = new Date(e.executed_at);
                    return d >= lastWeekStart;
                  });
                  return '$' + list.reduce((s: any, e: any) => s + Number(e.realized_amount ?? e.realized_points ?? 0), 0).toFixed(2);
                })()}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Profit Consistency Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <Card className="p-3 sm:p-6 border border-teal-500/30 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-teal-600/5 via-background to-cyan-600/5 hover:border-teal-500/50 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Profit Consistency Chart
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Cumulative daily gains/losses over time</p>
            </div>
            <Badge className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/40 text-teal-300 text-xs">
              Daily Cumulative
            </Badge>
          </div>
          <div className="border border-teal-500/20 rounded-xl p-2 sm:p-4 bg-gradient-to-b from-slate-800/30 via-slate-900/20 to-background/40 backdrop-blur-sm hover:border-teal-500/30 transition-colors duration-200" style={{ height: 320 }}>
            {(() => {
              const map: Record<string, number> = {};
              for (const e of entries) {
                const ts = e.entry_at || e.created_at || e.executed_at;
                if (!ts) continue;
                const key = new Date(ts).toISOString().slice(0, 10);
                map[key] = (map[key] || 0) + Number(e.realized_points || e.realized_amount || 0);
              }
              const days = Object.keys(map).sort();
              let cum = 0;
              const data = days.map(d => {
                cum += map[d];
                return { date: d, cum, daily: map[d] };
              });

              return data.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorCumGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="shadowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(20, 184, 166, 0.3)" />
                        <stop offset="100%" stopColor="rgba(20, 184, 166, 0)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" opacity={0.4} />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgb(148, 163, 184)" 
                      style={{ fontSize: '11px' }}
                      tick={{ fill: 'rgb(148, 163, 184)' }}
                    />
                    <YAxis 
                      stroke="rgb(148, 163, 184)" 
                      style={{ fontSize: '11px' }}
                      tick={{ fill: 'rgb(148, 163, 184)' }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "rgba(15, 23, 42, 0.95)", 
                        border: "2px solid rgb(20, 184, 166)", 
                        borderRadius: "10px",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
                      }}
                      formatter={(value: any, name: any) => {
                        if (name === 'cum') return [`$${Number(value).toFixed(2)}`, 'Cumulative P&L'];
                        return [`$${Number(value).toFixed(2)}`, 'Daily'];
                      }}
                      labelFormatter={(label) => `${label}`}
                      cursor={{ stroke: 'rgba(20, 184, 166, 0.5)', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cum"
                      stroke="rgb(20, 184, 166)"
                      strokeWidth={3}
                      dot={{ fill: 'rgb(20, 184, 166)', r: 4, opacity: 0.7 }}
                      activeDot={{ r: 6, fill: 'rgb(6, 182, 212)' }}
                      isAnimationActive={true}
                      animationDuration={1000}
                      fillOpacity={1}
                      fill="url(#shadowGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
                  <div className="text-3xl">📊</div>
                  <p>No trades yet. Start logging trades to see your profit consistency!</p>
                </div>
              )
            })()}
          </div>
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <div className="w-2 h-2 rounded-full bg-teal-400"></div>
              <span>Cumulative P&L</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/20 border border-slate-600/30">
              <span className="text-xs">Tip: Click on points to see daily details</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Dialogs */}
      <ViewJournalDialog
        open={!!openEntry}
        entry={openEntry}
        onOpenChange={(v) => {
          if (!v) setOpenEntry(null);
        }}
      />

      {/* Mobile Calendar Date Details Modal */}
      <AlertDialog open={!!mobileModalData} onOpenChange={(open) => { if (!open) setMobileModalData(null); }}>
        <AlertDialogContent className="w-[90vw] max-w-sm z-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Trading Details</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg overflow-hidden">
                    <p className="text-xs text-muted-foreground mb-1 truncate">Date</p>
                    <p className="text-sm sm:text-base font-semibold truncate">
                      {mobileModalData ? new Date(mobileModalData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg overflow-hidden">
                    <p className="text-xs text-muted-foreground mb-1 truncate">Trades</p>
                    <p className="text-sm sm:text-base font-semibold">{mobileModalData?.trades ?? 0}</p>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg overflow-hidden ${mobileModalData && mobileModalData.pnl >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}
                >
                  <p className="text-xs text-muted-foreground mb-2 truncate">P&L</p>
                  <p
                    className={`text-lg sm:text-2xl font-bold truncate ${mobileModalData && mobileModalData.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                  >
                    {mobileModalData ? `${mobileModalData.pnl >= 0 ? '+' : '-'}$${Math.abs(mobileModalData.pnl).toFixed(2)}` : '$0.00'}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 mt-4">
            <AlertDialogCancel className="flex-1">Close</AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              onClick={() => {
                if (mobileModalData) {
                  navigate(`/dashboard/journal?date=${mobileModalData.date}`);
                  setMobileModalData(null);
                }
              }}
            >
              View Journal
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JournalDashboard;
