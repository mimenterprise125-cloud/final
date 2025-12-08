import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, TrendingUp, TrendingDown, Wallet, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import supabase from "@/lib/supabase";
import { ViewJournalDialog } from "@/components/modals/ViewJournalDialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { useDashboardMode } from "@/lib/DashboardContext";
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

function CalendarView({ entries, onOpenEntry }: { entries: any[]; onOpenEntry: (e: any) => void }){
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = firstOfMonth.getFullYear();
  const month = firstOfMonth.getMonth();
  const startDay = new Date(year, month, 1).getDay(); // 0=Sun

  // build dates for calendar grid (Sun-Sat)
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

  for (let d = 1; d <= daysInMonth; d++){
    const key = new Date(year, month, d).toISOString().slice(0,10);
    const list = mapByDate.get(key) ?? [];
    const total = list.reduce((s:any,t:any)=> s + Number(t.realized_amount ?? t.realized_points ?? 0), 0);
    cells.push({ date: key, trades: list, total });
  }

  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-accent/10" onClick={()=>setMonthOffset(m=>m-1)} aria-label="Previous month"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-sm font-medium border border-border rounded-md px-3 py-1">{firstOfMonth.toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
          <button className="p-1 rounded hover:bg-accent/10" onClick={()=>setMonthOffset(m=>m+1)} aria-label="Next month"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div />
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm">
        <div className="font-medium">Sun</div><div className="font-medium">Mon</div><div className="font-medium">Tue</div><div className="font-medium">Wed</div><div className="font-medium">Thu</div><div className="font-medium">Fri</div><div className="font-medium">Sat</div>
        {Array.from({length: startDay}).map((_,i)=>(<div key={`pad-${i}`} />))}
        {cells.map(c => (
          <div key={c.date} className="p-2 border rounded cursor-pointer relative" onClick={()=> setSelectedDay(c)}>
            <div className="absolute top-1 left-1 text-xs font-semibold">{Number(c.date.slice(8,10))}</div>
            <div className="flex flex-col items-center justify-center text-center min-h-[56px]">
              <div className="text-xs">{c.trades.length} trade{c.trades.length!==1 ? 's' : ''}</div>
              <div className={`text-xs mt-1 ${c.total>=0 ? 'text-emerald-600' : 'text-rose-600'}`}>{c.total>=0? '+' : ''}${c.total.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedDay && (
        <div className="mt-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">{selectedDay.date} — {selectedDay.trades.length} trade(s)</div>
              <div>
                <Button variant="ghost" onClick={()=>setSelectedDay(null)}>Close</Button>
              </div>
            </div>
            <div className="space-y-2">
              {selectedDay.trades.map((t:any) => (
                <div key={t.id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{t.symbol} • {t.setup}</div>
                    <div className="text-xs text-muted-foreground">{t.direction} • {(t.realized_amount ?? t.realized_points) >= 0 ? '+' : ''}${Number(t.realized_amount ?? t.realized_points ?? 0).toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={()=> onOpenEntry(t)}><Image className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          
        </div>
      )}
    </div>
  )
}

function MonthlyView({ entries, selectedMonth, onOpenDay, showWeekTotals, onMobileSelect }: { entries: any[], selectedMonth?: string, onOpenDay?: (date:string)=>void, showWeekTotals?: boolean, onMobileSelect?: (date: string, trades: number, pnl: number) => void }){
  // selectedMonth (YYYY-MM) optional: when provided we render that month and do not show month nav controls
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  let year: number, m: number;
  if (selectedMonth) {
    const [y,mm] = selectedMonth.split('-').map(x=>Number(x));
    year = y; m = (mm - 1);
  } else {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    year = firstOfMonth.getFullYear(); m = firstOfMonth.getMonth();
  }

  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const mapByDate = useMemo(()=>{
    const map = new Map<string, any[]>();
    for (const e of entries) {
      const ts = e.entry_at || e.created_at;
      if (!ts) continue;
      const k = new Date(ts).toISOString().slice(0,10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return map;
  }, [entries]);

  // build weeks: array of 7-item arrays (null for padding)
  const startDay = new Date(year, m, 1).getDay();
  const weeks: Array<( { date:string; trades:any[]; total:number } | null )[]> = [];
  let curWeek: ( { date:string; trades:any[]; total:number } | null )[] = [];
  for (let i=0;i<startDay;i++) curWeek.push(null);
  for (let d=1; d<=daysInMonth; d++){
    const key = new Date(year, m, d).toISOString().slice(0,10);
    const list = mapByDate.get(key) ?? [];
    const total = list.reduce((s:any,t:any)=> s + Number(t.realized_amount ?? t.realized_points ?? 0), 0);
    curWeek.push({ date: key, trades: list, total });
    if (curWeek.length === 7) { weeks.push(curWeek); curWeek = []; }
  }
  if (curWeek.length) { while(curWeek.length < 7) curWeek.push(null); weeks.push(curWeek); }

  const selMonth = selectedMonth ?? `${year}-${String(m+1).padStart(2,'0')}`;
  const list = useMemo(()=> entries.filter(e => {
    const ts = e.entry_at || e.created_at;
    return ts && ts.startsWith(selMonth);
  }), [entries, selMonth]);
  const totalTrades = list.length;
  const totalPnl = list.reduce((s:any,t:any)=> s + Number(t.realized_amount ?? t.realized_points ?? 0), 0);

  return (
    <div>
      <div className="mb-3 sm:mb-4 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
        <div className="flex items-center gap-2">
          <button className="p-1.5 sm:p-2 rounded hover:bg-accent/10 transition-colors" onClick={()=> setMonthOffset(o => o-1)} aria-label="Previous month"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-xs sm:text-sm font-medium border border-border rounded-md px-2 sm:px-3 py-1 whitespace-nowrap">{new Date(year, m, 1).toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
          <button className="p-1.5 sm:p-2 rounded hover:bg-accent/10 transition-colors" onClick={()=> setMonthOffset(o => o+1)} aria-label="Next month"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div />
      </div>

      <div className="text-xs sm:text-sm mb-2 sm:mb-4 grid grid-cols-7 gap-1 sm:gap-2">
        <div className="font-medium text-center text-muted-foreground text-xs">S</div><div className="font-medium text-center text-muted-foreground text-xs">M</div><div className="font-medium text-center text-muted-foreground text-xs">T</div><div className="font-medium text-center text-muted-foreground text-xs">W</div><div className="font-medium text-center text-muted-foreground text-xs">T</div><div className="font-medium text-center text-muted-foreground text-xs">F</div><div className="font-medium text-center text-muted-foreground text-xs">S</div>
      </div>

      <div className="mb-4 space-y-2">
        {weeks.map((week, wi) => (
          <div key={wi}>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {week.map((c,ci) => c ? (
                <div 
                  key={c.date} 
                  className={`border-2 rounded cursor-pointer hover:shadow-md transition-all relative min-h-[90px] sm:min-h-[110px] flex flex-col p-2 sm:p-3 overflow-hidden ${
                    c.trades.length === 0
                      ? 'sm:bg-card/40 bg-card/30 border-border sm:border-border sm:hover:border-primary/50'
                      : c.total >= 0 
                        ? 'sm:bg-card/40 bg-emerald-500/20 border-emerald-500/50 sm:border-border sm:hover:border-primary/50' 
                        : 'sm:bg-card/40 bg-rose-500/20 border-rose-500/50 sm:border-border sm:hover:border-primary/50'
                  }`}
                  title={`${c.trades.length} trades, P&L: ${c.total>=0? '+' : ''}$${c.total.toFixed(2)}`} 
                  onClick={() => {
                    // Mobile: show modal, Desktop: navigate
                    if (window.innerWidth < 768 && onMobileSelect) {
                      onMobileSelect(c.date, c.trades.length, c.total);
                    } else if (onOpenDay) {
                      onOpenDay(c.date);
                    }
                  }}
                >
                  {/* Desktop view: Show all info */}
                  <div className="hidden sm:block">
                    <div className="text-xs sm:text-sm font-bold text-muted-foreground mb-auto">{Number(c.date.slice(8,10))}</div>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="text-xs font-medium text-foreground leading-tight truncate">{c.trades.length} trade{c.trades.length!==1 ? 's' : ''}</div>
                      <div className={`text-xs sm:text-sm font-bold leading-tight truncate ${
                        c.trades.length === 0
                          ? 'text-slate-500'
                          : c.total>=0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {c.trades.length === 0 ? 'No trades' : `${c.total>=0? '+' : ''}$${Math.abs(c.total).toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile view: Show only colored box with date - no text overlay */}
                  <div className="sm:hidden flex flex-col justify-between h-full w-full">
                    <div className={`text-xs font-bold ${c.trades.length === 0 ? 'text-muted-foreground' : 'text-white'}`}>{Number(c.date.slice(8,10))}</div>
                  </div>
                </div>
              ) : (
                <div key={`pad-${wi}-${ci}`} />
              ))}
            </div>
            {showWeekTotals && (
              <div className="text-right text-xs sm:text-sm text-muted-foreground mt-2 px-1">Week: {(() => { const wtot = week.reduce((s:any,c:any)=> s + (c? Number(c.total||0) : 0), 0); return (wtot>=0? '+' : '') + '$' + Math.abs(wtot).toFixed(2) })()}</div>
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
          <div className="text-xl sm:text-2xl font-bold">{totalPnl>=0? '+' : ''}${totalPnl.toFixed(2)}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg P&L per trade</div>
          <div className="text-xl sm:text-2xl font-bold">{totalTrades? `$${(totalPnl/totalTrades).toFixed(2)}` : '-'}</div>
        </Card>
      </div>
    </div>
  )
}

function WeeklyView({ entries }: { entries: any[] }){
  // compute by ISO weeks (simple Mon-Sun grouping)
  const weeks: { range:string; trades:any[]; total:number; wins:number }[] = [];
  const sorted = [...entries].sort((a,b)=> {
    const aTime = new Date(a.entry_at || a.created_at || 0).getTime();
    const bTime = new Date(b.entry_at || b.created_at || 0).getTime();
    return aTime - bTime;
  });
  // group into calendar weeks for the last 8 weeks
  const now = new Date();
  for (let w=0; w<8; w++){
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay()) - (7*w)); // last Sunday
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
    const list = sorted.filter((t:any)=>{
      const ts = t.entry_at || t.created_at;
      if (!ts) return false;
      const d = new Date(ts);
      return d >= start && d <= end;
    })
    const total = list.reduce((s:any,t:any)=> s + Number(t.realized_amount ?? t.realized_points ?? 0),0);
    const wins = list.filter((t:any)=> t.win).length;
    weeks.push({ range: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, trades: list, total, wins });
  }

  const displayMonth = new Date().toLocaleString(undefined,{month:'long', year:'numeric'});

  // top/worst pairs
  const pairAgg = entries.reduce((acc:any, t:any)=>{ const s = t.symbol||'N/A'; acc[s] = acc[s]||0; acc[s]+= Number(t.realized_points||0); return acc }, {} as Record<string,number>);
  const pairs = Object.entries(pairAgg).map(([k,v])=>({pair:k, total:v})).sort((a:any,b:any)=> b.total - a.total);

  // avg RRR = average of (target/stop) across trades with stop>0
  const rr = entries.filter((t:any)=> t.stop_loss_points>0).map((t:any)=> Number(t.target_points || 0)/Number(t.stop_loss_points||1));
  const avgRRR = rr.length? (rr.reduce((s:any,x:any)=>s+x,0)/rr.length): 0;
  const avgDuration = entries.length? (entries.reduce((s:any,t:any)=> s + Number(t.duration_minutes||0),0)/entries.length) : 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium border border-border rounded-md px-3 py-1">{displayMonth}</div>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg RRR</div>
          <div className="text-xl sm:text-2xl font-bold">{avgRRR? avgRRR.toFixed(2) : '-'}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg duration (min)</div>
          <div className="text-xl sm:text-2xl font-bold">{avgDuration? Math.round(avgDuration) : '-'}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Top pairs</div>
          <div className="text-sm sm:text-lg font-bold">{pairs.slice(0,3).map(p=>`${p.pair} (${Math.round(Number(p.total))})`).join(', ') || '-'}</div>
        </Card>
      </div>

      <div className="mt-4 space-y-2">
        {weeks.map((w,i)=> (
          <Card key={i} className="p-3 flex justify-between items-center" title={w.range}>
            <div>
              <div className="font-medium">Week {i+1}</div>
              <div className="text-sm text-muted-foreground">{w.range}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">Trades: {w.trades.length}</div>
              <div className="text-sm">Wins: {w.wins} • P&L: {w.total>=0? '+' : ''}${w.total.toFixed(2)}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function YearlyView({ entries, onDrillMonth }: { entries: any[], onDrillMonth?: (ym: string) => void }){
  const [yearOffset, setYearOffset] = useState(0);
  const now = new Date();
  const year = now.getFullYear() + yearOffset;

  // aggregate per month
  const monthAgg = useMemo(()=>{
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

  const total = Object.values(monthAgg).reduce((s,n)=> s + n, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-accent/10" onClick={()=>setYearOffset(y=>y-1)} aria-label="Previous year"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-sm font-medium border border-border rounded-md px-3 py-1">{year}</div>
          <button className="p-1 rounded hover:bg-accent/10" onClick={()=>setYearOffset(y=>y+1)} aria-label="Next year"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div />
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {Array.from({length:12}).map((_,i)=> {
          const val = monthAgg[i] ?? 0;
          const monthName = new Date(year, i, 1).toLocaleString(undefined,{month:'short'});
          const tradesCount = entries.filter((e:any)=> {
            const ts = e.entry_at || e.created_at;
            return ts && new Date(ts).getFullYear()===year && new Date(ts).getMonth()===i;
          }).length;
          return (
            <Card key={i} className="p-2 sm:p-3 cursor-pointer flex flex-col items-center justify-center text-center" onClick={()=> onDrillMonth && onDrillMonth(`${year}-${String(i+1).padStart(2,'0')}`)}>
              <div className="text-xs sm:text-sm text-muted-foreground">{monthName}</div>
              <div className={`text-sm sm:text-lg font-semibold mt-1 ${val>=0? 'text-emerald-600' : 'text-rose-600'}`}>{val>=0? '+' : ''}${val.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">{tradesCount} trade{tradesCount!==1 ? 's' : ''}</div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Net P&L (year)</div>
          <div className="text-xl sm:text-2xl font-bold">{total>=0? '+' : ''}${total.toFixed(2)}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg monthly</div>
          <div className="text-xl sm:text-2xl font-bold">{`$${(total/12).toFixed(2)}`}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Best month</div>
          <div className="text-sm sm:text-lg font-bold">{(() => { const bestIdx = Object.entries(monthAgg).sort((a:any,b:any)=> b[1]-a[1])[0]; return bestIdx ? `${new Date(year, Number(bestIdx[0]),1).toLocaleString(undefined,{month:'short'})} ${bestIdx[1]>=0? '+' : ''}$${Number(bestIdx[1]).toFixed(2)}` : '-' })()}</div>
        </Card>
      </div>
    </div>
  )
}

function DailyView({ entries }: { entries: any[] }){
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const list = useMemo(()=> entries.filter(e => {
    const ts = e.entry_at || e.created_at;
    return ts && ts.startsWith(date);
  }), [entries, date]);
  const total = list.reduce((s:any,t:any)=> s + Number(t.realized_amount ?? t.realized_points ?? 0), 0);

  return (
    <div>
      <div className="mb-4 flex gap-2 items-center">
        <input type="date" className="input" value={date} onChange={(e)=>setDate(e.target.value)} />
        <div className="text-sm text-muted-foreground">Net P&L: <span className={total>=0? 'text-emerald-600':'text-rose-600'}>{total>=0? '+' : ''}${total.toFixed(2)}</span></div>
      </div>
      <div className="space-y-2">
        {list.map((t:any)=> (
          <Card key={t.id} className="p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{t.symbol} • {t.setup}</div>
              <div className="text-sm text-muted-foreground">{t.direction} • {(t.entry_at || t.created_at) ? new Date(t.entry_at || t.created_at).toLocaleTimeString() : ''}</div>
            </div>
            <div className={String(t.realized_amount ?? t.realized_points ?? 0).startsWith('-') ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>{(t.realized_amount ?? t.realized_points ?? 0)>=0? '+' : ''}${Number(t.realized_amount ?? t.realized_points ?? 0).toFixed(2)}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* Calendar/Monthly/Weekly helper components are declared above; they will be rendered inside the main Dashboard component below. */

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { viewMode } = useDashboardMode();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // journal/calendar state (rendered when viewMode === 'journal')
  const [entries, setEntries] = useState<any[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [view, setView] = useState<'calendar'|'monthly'|'weekly'|'daily'>('calendar');
  const [calendarGranularity, setCalendarGranularity] = useState<'weekly'|'monthly'|'yearly'>('monthly');
  const [drilledMonth, setDrilledMonth] = useState<string | null>(null); // format YYYY-MM when user drills from yearly -> month
  const [calendarSelectedDay, setCalendarSelectedDay] = useState<string | null>(null);
  const [openEntry, setOpenEntry] = useState<any | null>(null);
  const [mobileModalData, setMobileModalData] = useState<{ date: string; trades: number; pnl: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true)
        const userId = user?.id ?? null
        if (!userId) { setAccounts([]); setPayouts([]); return }
        const [accRes, payoutRes] = await Promise.all([
          supabase.from('trading_accounts').select('*').eq('user_id', userId),
          supabase.from('payouts').select('*').eq('user_id', userId)
        ])

        if (!mounted) return
        setAccounts(accRes.data ?? [])
        setPayouts(payoutRes.data ?? [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    })();

    return () => { mounted = false }
  }, [user]);

  // fetch journals
  useEffect(()=>{
    let mounted = true;
    setJournalLoading(true);

    const fetchJ = async () => {
      try {
        const userId = user?.id ?? null;
        // Fetch all journals unordered, then sort client-side
        // This avoids issues with server-side ordering by columns that may not exist
        const { data, error } = await supabase.from('journals').select('*');
        if (error) {
          console.error('Failed to fetch journals', error);
          return [];
        }
        
        let rows = data || [];
        
        // Sort by most recent (try entry_at, fall back to created_at)
        rows = rows.sort((a: any, b: any) => {
          const aTime = new Date(a.entry_at || a.created_at || 0).getTime();
          const bTime = new Date(b.entry_at || b.created_at || 0).getTime();
          return bTime - aTime; // descending order (newest first)
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

    return () => { mounted = false }
  },[]);

  // compute simple stats from accounts/payouts
  const totalCapital = accounts.reduce((sum, a) => sum + (parseFloat(String(a.balance).replace(/[$,]/g, '')) || 0), 0);
  const fundedCount = accounts.filter(a => String(a.account_type || a.type || '').toLowerCase().includes('funded')).length;
  const dailyPnl = 0; // placeholder until a trades table is available
  const nextPayout = payouts.length ? payouts.reduce((n, p) => {
    const d = new Date(p.date).getTime();
    return d < n ? d : n
  }, Infinity) : Infinity;

  const stats = [
    { title: 'Total Capital', value: `$${totalCapital.toLocaleString()}`, change: '', icon: Wallet, positive: true },
    { title: 'Funded Accounts', value: String(fundedCount), change: '', icon: TrendingUp, positive: true },
    { title: 'Daily PNL', value: `$${dailyPnl}`, change: '', icon: TrendingUp, positive: true },
    { title: 'Next Payout', value: nextPayout === Infinity ? '—' : `$${payouts.reduce((s,p)=>s+(parseFloat(String(p.amount).replace(/[$,]/g,''))||0),0).toLocaleString()}`, change: '', icon: DollarSign, positive: true }
  ];

  // build a simple equity series from account balances
  const equityCurveData = accounts.map((a, i) => ({ date: `A${i+1}`, equity: parseFloat(String(a.balance).replace(/[$,]/g,'')) || 0 }));

  return (
    <div className="space-y-6">
      {/* Header Section - Dynamic based on mode */}
      <motion.div 
        className="space-y-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'journal' ? (
          <>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Journal Analytics</h1>
            <p className="text-muted-foreground text-base">📊 Monitor your trading performance and track progress across all your journal entries</p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-muted-foreground text-base">🎯 Welcome back! Here's your complete trading overview</p>
          </>
        )}
      </motion.div>

      {viewMode === 'journal' ? (
        <div className="space-y-6">
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
                  onClick={()=>{ setDrilledMonth(null); }}
                  className="hover:bg-accent/10 transition-colors"
                >
                  {'← Back to Year View'}
                </Button>
              )}
            </div>
            <Button
              onClick={() => navigate('/dashboard/journal')}
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
            >
              → View Full Journal
            </Button>
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
                  <h3 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">📅 Trading Calendar</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">Click a day to view all trades from that date</p>
                </div>
                <div className="relative w-full sm:w-auto flex-shrink-0">
                  <select 
                    value={calendarGranularity} 
                    onChange={(e)=> setCalendarGranularity(e.target.value as any)} 
                    className="appearance-none w-full sm:w-auto text-xs sm:text-sm bg-slate-800 text-cyan-100 border-2 border-cyan-500 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 hover:border-cyan-400 hover:bg-slate-700 hover:text-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/70 focus:outline-none transition-colors duration-200 font-semibold cursor-pointer shadow-lg"
                  >
                    <option value="monthly" className="bg-slate-900 text-cyan-100">Monthly View</option>
                    <option value="weekly" className="bg-slate-900 text-cyan-100">Weekly View</option>
                    <option value="yearly" className="bg-slate-900 text-cyan-100">Yearly View</option>
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
                  <MonthlyView entries={entries} selectedMonth={drilledMonth} onOpenDay={(d)=> navigate(`/dashboard/journal?date=${d}`)} onMobileSelect={(date, trades, pnl) => setMobileModalData({ date, trades, pnl })} />
                ) : (
                  <>
                    {calendarGranularity === 'weekly' && <MonthlyView entries={entries} showWeekTotals onOpenDay={(d)=> navigate(`/dashboard/journal?date=${d}`)} onMobileSelect={(date, trades, pnl) => setMobileModalData({ date, trades, pnl })} />}
                    {calendarGranularity === 'monthly' && <MonthlyView entries={entries} onOpenDay={(d)=> navigate(`/dashboard/journal?date=${d}`)} onMobileSelect={(date, trades, pnl) => setMobileModalData({ date, trades, pnl })} />}
                    {calendarGranularity === 'yearly' && <YearlyView entries={entries} onDrillMonth={(m)=>{ setDrilledMonth(m); }} />}
                  </>
                )}
              </div>
            </Card>
          </motion.div>

          {/* --- Journal analytics panels --- */}
          <motion.div 
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {/* Win/Loss Overview */}
            <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-emerald-500/5 via-background to-background">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Trades</div>
                <Badge variant="outline" className="bg-accent/10 text-xs sm:text-sm">📊</Badge>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{entries.length}</div>
              <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3 text-xs">
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-muted-foreground mb-0.5 sm:mb-1">Wins</div>
                  <div className="font-bold text-emerald-400 text-xs sm:text-sm">{entries.filter(e=>e.win).length}</div>
                </div>
                <div className="p-1.5 sm:p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="text-muted-foreground mb-0.5 sm:mb-1">Losses</div>
                  <div className="font-bold text-rose-400 text-xs sm:text-sm">{entries.filter(e=>!e.win).length}</div>
                </div>
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-muted-foreground mb-0.5 sm:mb-1">Win %</div>
                  <div className="font-bold text-blue-400 text-xs sm:text-sm">{entries.length > 0 ? ((entries.filter(e=>e.win).length / entries.length) * 100).toFixed(0) : 0}%</div>
                </div>
              </div>
            </Card>

            {/* Total Realized P&L */}
            <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-500/5 via-background to-background">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Total P&L</div>
                <Badge variant="outline" className="bg-accent/10 text-xs sm:text-sm">💰</Badge>
              </div>
              <div className={`text-2xl sm:text-3xl font-bold ${(() => { const total = entries.reduce((s:any,e:any)=> s + Number(e.realized_amount ?? e.realized_points ?? 0), 0); return total >= 0 ? 'text-emerald-400' : 'text-rose-400' })()}`}>
                {(() => { const total = entries.reduce((s:any,e:any)=> s + Number(e.realized_amount ?? e.realized_points ?? 0), 0); return (total >= 0 ? '+' : '') + total.toFixed(2) })()}
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                <div className="p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30">
                  <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs">Avg Trade</div>
                  <div className="font-bold text-cyan-400 text-xs sm:text-sm">${(entries.length > 0 ? (entries.reduce((s:any,e:any)=> s + Number(e.realized_amount ?? e.realized_points ?? 0), 0) / entries.length).toFixed(2) : 0)}</div>
                </div>
                <div className="p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30">
                  <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs">View</div>
                  <div className="font-bold text-muted-foreground capitalize text-xs sm:text-sm">{view}</div>
                </div>
              </div>
            </Card>

            {/* Best/Worst Trade */}
            <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-cyan-500/5 via-background to-background">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Streaks</div>
                <Badge variant="outline" className="bg-accent/10 text-xs sm:text-sm">🔥</Badge>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">Best Trade</div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-400">${(() => { const best = Math.max(...entries.map((e:any) => Number(e.realized_amount ?? e.realized_points ?? 0))); return best === -Infinity ? '0' : best.toFixed(2) })()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">Worst Trade</div>
                  <div className="text-xl sm:text-2xl font-bold text-rose-400">${(() => { const worst = Math.min(...entries.map((e:any) => Number(e.realized_amount ?? e.realized_points ?? 0))); return worst === Infinity ? '0' : worst.toFixed(2) })()}</div>
                </div>
              </div>
            </Card>

            {/* Total Realized P&L */}
            <Card className="p-3 sm:p-5 border-border/50 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-500/5 via-background to-background">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="text-xs sm:text-sm font-semibold text-muted-foreground">Period Summary</div>
                <Badge variant="outline" className="bg-accent/10 text-xs sm:text-sm">📈</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                <div className="p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30">
                  <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs">This Month</div>
                  <div className="font-bold text-cyan-400 text-xs sm:text-sm">{(() => { const m = new Date().toISOString().slice(0,7); const list = entries.filter(e=> e.executed_at && e.executed_at.startsWith(m)); return '$' + (list.reduce((s:any,e:any)=> s + Number(e.realized_amount ?? e.realized_points ?? 0),0)).toFixed(2) })()}</div>
                </div>
                <div className="p-1.5 sm:p-2 rounded-lg bg-background/50 border border-border/30">
                  <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs">Last Week</div>
                  <div className="font-bold text-cyan-400 text-xs sm:text-sm">{(() => { const now = new Date(); const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); const list = entries.filter(e=>{ if(!e.executed_at) return false; const d=new Date(e.executed_at); return d >= lastWeekStart; }); return '$' + (list.reduce((s:any,e:any)=> s + Number(e.realized_amount ?? e.realized_points ?? 0),0)).toFixed(2) })()}</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Session-based performance & Strategy-based */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <Card className="p-3 sm:p-6 border border-emerald-500/20 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-emerald-500/5 via-background to-background hover:border-emerald-500/40">
              <div className="text-xs sm:text-sm font-semibold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text mb-3 sm:mb-4">🎯 Session Performance</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-emerald-500/20"><th className="text-left py-2 px-1 sm:px-2 font-medium">Session</th><th className="text-right py-2 px-1 sm:px-2 font-medium">Trades</th><th className="text-right py-2 px-1 sm:px-2 font-medium">Win%</th><th className="text-right py-2 px-1 sm:px-2 font-medium">Pts</th></tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const groups: Record<string, any[]> = {};
                      for (const e of entries) { const k = e.session || '—'; groups[k] = groups[k] || []; groups[k].push(e); }
                      return Object.entries(groups).map(([k,v]) => {
                        const trades = v.length;
                        const wins = v.filter(x=>x.win).length;
                        const points = v.reduce((s:any,x:any)=> s + Number(x.realized_points||0),0);
                        return <tr key={k} className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors"><td className="py-2 px-1 sm:px-2 font-medium truncate">{k}</td><td className="text-right py-2 px-1 sm:px-2">{trades}</td><td className="text-right py-2 px-1 sm:px-2">{trades? Math.round((wins/trades)*100) + '%' : '—'}</td><td className={`text-right py-2 px-1 sm:px-2 font-bold ${points>=0 ? 'text-emerald-400' : 'text-rose-400'}`}>{points>=0? '+' : ''}{points}</td></tr>
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-3 sm:p-6 border border-blue-500/20 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-500/5 via-background to-background hover:border-blue-500/40">
              <div className="text-xs sm:text-sm font-semibold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text mb-3 sm:mb-4">📈 Strategy Profitability</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-muted-foreground border-b border-blue-500/20"><th className="text-left py-2 px-1 sm:px-2 font-medium">Strategy</th><th className="text-right py-2 px-1 sm:px-2 font-medium">Trades</th><th className="text-right py-2 px-1 sm:px-2 font-medium">Win%</th><th className="text-right py-2 px-1 sm:px-2 font-medium">Pts</th></tr></thead>
                  <tbody>
                    {(() => {
                      const groups: Record<string, any[]> = {};
                      for (const e of entries) { const k = e.setup || '—'; groups[k] = groups[k] || []; groups[k].push(e); }
                      return Object.entries(groups).map(([k,v]) => {
                        const trades = v.length;
                        const wins = v.filter(x=>x.win).length;
                        const points = v.reduce((s:any,x:any)=> s + Number(x.realized_points||0),0);
                        return <tr key={k} className="border-b border-blue-500/10 hover:bg-blue-500/5 transition-colors"><td className="py-2 px-1 sm:px-2 font-medium truncate">{k}</td><td className="text-right py-2 px-1 sm:px-2">{trades}</td><td className="text-right py-2 px-1 sm:px-2">{trades? Math.round((wins/trades)*100) + '%' : '—'}</td><td className={`text-right py-2 px-1 sm:px-2 font-bold ${points>=0 ? 'text-emerald-400' : 'text-rose-400'}`}>{points>=0? '+' : ''}{points}</td></tr>
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* Analysis Cards */}
          <motion.div 
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Card className="p-3 sm:p-6 border border-amber-500/20 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-amber-500/5 via-background to-background hover:border-amber-500/40">
              <div className="text-xs sm:text-sm font-semibold text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text mb-2 sm:mb-3">📅 Day-of-Week</div>
              <div className="space-y-2 sm:space-y-3 text-xs">
                {(() => {
                  const dow: Record<string, any[]> = {};
                  for (const e of entries) {
                    const ts = e.entry_at || e.created_at || e.executed_at;
                    if (!ts) continue;
                    const d = new Date(ts);
                    const name = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
                    dow[name] = dow[name] || []; dow[name].push(e);
                  }
                  return Object.entries(dow).length > 0 ? Object.entries(dow).map(([k,v]) => {
                    const trades = v.length; const wins = v.filter(x=>x.win).length; const pts = v.reduce((s:any,x:any)=> s + Number(x.realized_points||0),0);
                    return <div key={k} className="flex justify-between items-center py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-colors"><div className="font-medium text-xs sm:text-sm">{k}</div><div className="text-right"><div className="font-semibold text-foreground text-xs">{trades}T</div><div className={`text-xs mt-0.5 ${pts>=0 ? 'text-emerald-400' : 'text-rose-400'}`}>{trades? Math.round((wins/trades)*100)+'%' : '—'} • {pts>=0? '+'+pts: pts}</div></div></div>
                  }) : <div className="text-center py-4 text-muted-foreground text-xs">No data available</div>
                })()}
              </div>
            </Card>

            <Card className="p-3 sm:p-6 border border-violet-500/20 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-violet-500/5 via-background to-background hover:border-violet-500/40">
              <div className="text-xs sm:text-sm font-semibold text-transparent bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text mb-2 sm:mb-3">⏰ Time-of-Day</div>
              <div className="space-y-2 sm:space-y-3 text-xs">
                {(() => {
                  const buckets: Record<string, any[]> = { '🌅 Morning': [], '☀️ Afternoon': [], '🌙 Night': [] };
                  for (const e of entries) {
                    const ts = e.entry_at || e.created_at || e.executed_at;
                    if (!ts) continue;
                    const h = new Date(ts).getHours();
                    const key = (h>=5 && h<12)?'🌅 Morning': (h>=12 && h<18)?'☀️ Afternoon':'🌙 Night';
                    buckets[key].push(e);
                  }
                  return Object.values(buckets).some(b=>b.length>0) ? Object.entries(buckets).map(([k,v]) => { const trades=v.length; const wins=v.filter(x=>x.win).length; return trades>0 ? <div key={k} className="flex justify-between items-center py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg bg-violet-500/5 border border-violet-500/10 hover:border-violet-500/30 transition-colors"><div className="font-medium text-xs sm:text-sm">{k}</div><div className="text-right"><div className="font-semibold text-foreground text-xs">{trades}T</div><div className="text-xs mt-0.5 text-cyan-400">{trades? Math.round((wins/trades)*100)+'%':'—'}</div></div></div> : null }) : <div className="text-center py-4 text-muted-foreground text-xs">No data available</div>
                })()}
              </div>
            </Card>

            <Card className="p-3 sm:p-6 border border-pink-500/20 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-pink-500/5 via-background to-background hover:border-pink-500/40">
              <div className="text-xs sm:text-sm font-semibold text-transparent bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text mb-2 sm:mb-3">⚖️ Risk/Reward</div>
              <div className="text-xs space-y-2 sm:space-y-3">
                {(() => {
                  const rr = entries.filter((t:any)=> t.stop_loss_points>0).map((t:any)=> Number(t.target_points || 0)/Number(t.stop_loss_points||1));
                  const avg = rr.length? (rr.reduce((s:any,x:any)=>s+x,0)/rr.length): 0;
                  const avgStop = entries.filter((t:any)=> t.stop_loss_points>0).reduce((s:any,t:any)=> s + Number(t.stop_loss_points||0),0) / Math.max(1, entries.filter((t:any)=> t.stop_loss_points>0).length);
                  const avgTarget = entries.filter((t:any)=> t.target_points>0).reduce((s:any,t:any)=> s + Number(t.target_points||0),0) / Math.max(1, entries.filter((t:any)=> t.target_points>0).length);
                  return <div>
                    <div className="p-2 sm:p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                      <div className="text-muted-foreground mb-0.5 sm:mb-1 text-xs">Avg R:R Ratio</div>
                      <div className="text-lg sm:text-2xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text">{avg? avg.toFixed(2) : '—'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-background/50 border border-rose-500/20">
                        <div className="text-muted-foreground text-xs mb-0.5 sm:mb-1">Avg Risk</div>
                        <div className="font-bold text-rose-400 text-xs sm:text-sm">{Math.round(avgStop) || '—'} pts</div>
                      </div>
                      <div className="p-1.5 sm:p-2 rounded-lg bg-background/50 border border-emerald-500/20">
                        <div className="text-muted-foreground text-xs mb-0.5 sm:mb-1">Avg Reward</div>
                        <div className="font-bold text-emerald-400 text-xs sm:text-sm">{Math.round(avgTarget) || '—'} pts</div>
                      </div>
                    </div>
                  </div>
                })()}
              </div>
            </Card>
          </motion.div>

          {/* Profit Consistency Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
          >
            <Card className="p-3 sm:p-6 border border-teal-500/20 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-teal-500/5 via-background to-background/80 hover:border-teal-500/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-5 gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text">📈 Profit Consistency (Daily Cumulative)</h3>
                  <p className="text-xs text-muted-foreground mt-1">Cumulative daily gains/losses over time</p>
                </div>
              </div>
              <div className="border border-teal-500/20 rounded-xl p-2 sm:p-4 bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-sm" style={{ height: 280 }}>
                {(() => {
                  const map: Record<string, number> = {};
                  for (const e of entries) { 
                    const ts = e.entry_at || e.created_at || e.executed_at;
                    if (!ts) continue; 
                    const key = new Date(ts).toISOString().slice(0,10); 
                    map[key] = (map[key]||0) + Number(e.realized_points||e.realized_amount||0); 
                  }
                  const days = Object.keys(map).sort(); 
                  let cum = 0; 
                  const data = days.map(d=>{ cum += map[d]; return { date: d, cum } });
                  
                  return data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "2px solid hsl(var(--primary))", borderRadius: "var(--radius)" }} 
                          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Cumulative P&L']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line type="monotone" dataKey="cum" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} isAnimationActive={true} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>
                  )
                })()}
              </div>
            </Card>
          </motion.div>

          {/* Dialogs */}
          <ViewJournalDialog open={!!openEntry} entry={openEntry} onOpenChange={(v)=>{ if (!v) setOpenEntry(null) }} />
        </div>
      ) : (
        <> 
          {/* Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass p-3 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                      <h3 className="text-lg sm:text-2xl font-bold mt-2">{stat.value}</h3>
                      <p className={`text-xs sm:text-sm mt-1 ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <stat.icon className={`w-6 sm:w-10 h-6 sm:h-10 flex-shrink-0 ${stat.positive ? 'text-success' : 'text-destructive'}`} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Equity Curve */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass p-3 sm:p-6">
              <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">Equity Curve</h2>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={equityCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Accounts Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass p-3 sm:p-6">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <h2 className="text-base sm:text-xl font-semibold">Active Accounts</h2>
                <Button className="w-full xs:w-auto">View All</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Prop Firm</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">Type</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Balance</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 hidden xs:table-cell">Status</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4">PNL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium">{account.prop_firm ?? account.firm}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">{account.account_type ?? account.type}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">{account.balance}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 hidden xs:table-cell">
                          <Badge variant={(account.status || 'Active') === "Active" ? "default" : "secondary"} className="text-xs">
                            {account.status ?? 'Active'}
                          </Badge>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span className={String(account.pnl || '').startsWith('+') ? 'text-success font-medium' : 'text-destructive font-medium'}>
                            {account.pnl ?? '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </>
      )}

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
                    <p className="text-sm sm:text-base font-semibold truncate">{mobileModalData ? new Date(mobileModalData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg overflow-hidden">
                    <p className="text-xs text-muted-foreground mb-1 truncate">Trades</p>
                    <p className="text-sm sm:text-base font-semibold">{mobileModalData?.trades ?? 0}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-lg overflow-hidden ${mobileModalData && mobileModalData.pnl >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  <p className="text-xs text-muted-foreground mb-2 truncate">P&L</p>
                  <p className={`text-lg sm:text-2xl font-bold truncate ${mobileModalData && mobileModalData.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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

export default Dashboard;