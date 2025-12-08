import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, Edit, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddJournalDialog } from "@/components/modals/AddJournalDialog";
import { EditJournalDialog } from "@/components/modals/EditJournalDialog";
import { ViewJournalDialog } from "@/components/modals/ViewJournalDialog";
import supabase from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import { useMemo } from "react";

const TradingJournal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [viewEntry, setViewEntry] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const location = useLocation();
  const navigate = useNavigate();
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    setLoading(true);

    // support optional ?date=YYYY-MM-DD param and be resilient if executed_at column is missing
    const params = new URLSearchParams(location.search);
    const filterDate = params.get('date');

    const fetchJournals = async () => {
      try {
        const userId = user.id;

        // Build search filter for database query
        const dbSearch = search.trim().toLowerCase();

        // Fetch journals with optional search filter
        try {
          let query = supabase
            .from('journals')
            .select('*')
            .eq('user_id', userId);

          // Apply search filter to database query if provided
          if (dbSearch) {
            // Use ilike for case-insensitive search on symbol, setup, notes
            // Note: For complex multi-field search, we fetch all and filter client-side
            // This is more reliable than trying to use OR with ilike
          }

          const { data, error } = await query;

          if (error) {
            console.error('Failed to fetch journals', error);
            return [];
          }

          let rows = data || [];

          // If a date filter was requested, perform client-side filtering
          if (filterDate) {
            rows = rows.filter((row: any) => {
              const timestamp = row.entry_at || row.created_at;
              if (!timestamp || typeof timestamp !== 'string') return false;
              return timestamp.startsWith(filterDate);
            });
          }

          // Client-side search filter for multi-field search
          if (dbSearch) {
            rows = rows.filter((row: any) => {
              const sym = String(row.symbol || '').toLowerCase();
              const setup = Array.isArray(row.setup) 
                ? row.setup.join(' ').toLowerCase() 
                : String(row.setup || '').toLowerCase();
              const notes = String(row.notes || '').toLowerCase();
              return sym.includes(dbSearch) || setup.includes(dbSearch) || notes.includes(dbSearch);
            });
          }

          // Sort by most recent timestamp (entry_at, then created_at)
          rows = rows.sort((a: any, b: any) => {
            const aTime = new Date(a.entry_at || a.created_at || 0).getTime();
            const bTime = new Date(b.entry_at || b.created_at || 0).getTime();
            return bTime - aTime; // descending order
          });

          return rows;
        } catch (err: any) {
          console.error('Error fetching journals:', err?.message || err);
          return [];
        }
      } catch (err) {
        console.error('Unexpected error fetching journals', err);
        return [];
      }
    };

    (async () => {
      const rows = await fetchJournals();
      if (!mounted) return;
      setEntries(rows);
      setFilteredEntries(rows);
      setPage(1);
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [user, location.search, search]);

  return (
    <div className="space-y-6">
      {/* Header Section - Enhanced */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-1 sm:mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Trading Journal
              </motion.h1>
              <motion.p 
                className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                📊 Track and analyze all your trades in one place. Monitor your performance metrics and improve your trading strategy.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="w-full sm:w-auto"
            >
              <Button 
                onClick={() => setOpenAdd(true)} 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-200 text-white font-semibold px-4 sm:px-6 text-sm sm:text-base"
              >
                <Plus className="mr-2 w-4 sm:w-5 h-4 sm:h-5" /> Add Entry
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <AddJournalDialog open={openAdd} onOpenChange={setOpenAdd} onSaved={async () => {
        // refresh list after save
        if (!user) return;
        const userId = user.id;
        const { data, error } = await supabase.from('journals').select('*').eq('user_id', userId);
        if (!error) {
          setEntries(data || []);
          setFilteredEntries(data || []);
        }
      }} />

      {/* Search and Filter Bar - Enhanced */}
      <motion.div 
        className="glass p-3 sm:p-5 rounded-xl space-y-3 border border-border/40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 relative min-w-0">
            <Input 
              placeholder="🔍 Search symbol, setup, or notes..." 
              value={search} 
              onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} 
              className="bg-background/50 border-border/50 focus:border-accent focus:bg-background/80 transition-colors pl-3 sm:pl-4 py-2 sm:py-2.5 text-xs sm:text-sm"
            />
          </div>
          <div className="flex gap-2 items-center whitespace-nowrap">
            <label className="text-xs sm:text-sm text-muted-foreground font-medium">Per page:</label>
            <select 
              value={pageSize} 
              onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} 
              className="px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg bg-background/50 border border-border/50 text-foreground text-xs sm:text-sm focus:border-accent focus:outline-none transition-colors font-medium hover:border-accent/50"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Date Filter Indicator */}
        {(() => {
          const params = new URLSearchParams(location.search);
          const fd = params.get('date');
          return fd ? (
            <motion.div 
              className="flex items-center justify-between p-3 bg-accent/15 border border-accent/40 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-sm font-medium">
                Filtered for <span className="text-accent font-semibold">{new Date(fd).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/journal')}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors text-xs"
              >
                ✕ Clear
              </Button>
            </motion.div>
          ) : null;
        })()}

        {/* Search Status */}
        {search && (
          <motion.div 
            className="text-xs text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            Found <span className="text-accent">{entries.length}</span> result{entries.length !== 1 ? 's' : ''} for "<span className="font-semibold">{search}</span>"
          </motion.div>
        )}
      </motion.div>

      {/* Table Section */}
      <motion.div 
        className="glass rounded-xl overflow-hidden border border-border/40 -mx-3 sm:mx-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-xs sm:text-sm text-muted-foreground border-b border-border/30 bg-gradient-to-r from-background/60 to-background/40">
                <th className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-left font-semibold whitespace-nowrap text-xs">Date</th>
                <th className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-left font-semibold whitespace-nowrap text-xs">Symbol</th>
                <th className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-left font-semibold whitespace-nowrap text-xs hidden sm:table-cell">Dir</th>
                <th className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-left font-semibold whitespace-nowrap text-xs hidden md:table-cell">Setup</th>
                <th className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-left font-semibold hidden lg:table-cell whitespace-nowrap text-xs">Stop/Target</th>
                <th className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-right font-semibold whitespace-nowrap text-xs">P&L</th>
                <th className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-right font-semibold whitespace-nowrap text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {(() => {
                const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
                const safePage = Math.min(page, totalPages);
                const start = (safePage - 1) * pageSize;
                const pageItems = entries.slice(start, start + pageSize);
                
                return pageItems.map((e:any) => {
                  const ts = e.entry_at || e.created_at;
                  const timestamp = ts ? new Date(ts) : null;
                  const realized = Number(e.realized_amount ?? e.realized_points ?? 0);
                  const isWin = realized > 0;
                  const isLoss = realized < 0;
                  return (
                    <motion.tr 
                      key={e.id} 
                      className="hover:bg-accent/8 transition-colors align-top text-xs sm:text-sm border-opacity-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 align-top text-muted-foreground font-medium whitespace-nowrap text-xs">{timestamp ? timestamp.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '—'}</td>
                      <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 font-bold align-top text-foreground text-blue-400 whitespace-nowrap text-xs sm:text-sm">{e.symbol || '—'}</td>
                      <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 align-top text-muted-foreground hidden sm:table-cell whitespace-nowrap text-xs">{e.direction || '—'}</td>
                      <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 align-top text-muted-foreground text-xs hidden md:table-cell max-w-[80px] truncate">{Array.isArray(e.setup) ? e.setup.join(', ') : (e.setup || '—')}</td>
                      <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 align-top text-muted-foreground hidden lg:table-cell text-xs whitespace-nowrap">{(e.stop_loss_points || e.stop_loss_price) ? `${e.stop_loss_points || e.stop_loss_price} / ${e.target_points || e.target_price || '—'}` : '—'}</td>
                      <td className={`py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-right align-top font-bold text-xs whitespace-nowrap ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-muted-foreground'}`}>
                        {isWin && '💰'} {isLoss && '📉'} <span className="hidden xs:inline">{realized>=0? '+' : ''}{realized.toFixed(2)}</span><span className="xs:hidden">{realized>=0? '+' : ''}{Math.abs(realized).toFixed(0)}</span>
                      </td>
                      <td className="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 text-right align-top">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setViewEntry(e)} className="h-6 xs:h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm hover:bg-accent/30 transition-colors">
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditEntry(e)} className="h-6 xs:h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                });
              })()}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination Controls - Sticky at Bottom */}
      {(() => {
        const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
        const safePage = Math.min(page, totalPages);
        
        return (
            <motion.div 
            className="sticky bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur border-t border-border/40 z-30 rounded-b-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex flex-col xs:flex-row items-center justify-between gap-3 xs:gap-4">
              <div className="text-xs xs:text-sm text-muted-foreground font-medium text-center xs:text-left">
                <span className="text-foreground font-bold">{entries.length}</span> total • Page <span className="font-bold text-accent">{safePage}</span>/<span className="font-bold text-accent">{totalPages}</span>
              </div>
              <div className="flex gap-1 xs:gap-2 items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={()=> setPage(p => Math.max(1, p-1))}
                  disabled={safePage === 1}
                  className="hover:bg-accent/20 hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-2 h-7 xs:h-9"
                >
                  ← Prev
                </Button>
                <div className="px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg bg-background border border-border/50 text-xs xs:text-sm font-semibold text-foreground min-w-[35px] xs:min-w-[45px] text-center">
                  {safePage}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={()=> setPage(p => (p < totalPages ? p + 1 : p))}
                  disabled={safePage >= totalPages}
                  className="hover:bg-accent/20 hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs xs:text-sm px-2 xs:px-3 py-1 xs:py-2 h-7 xs:h-9"
                >
                  Next →
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Spacer removed - sticky positioning handles this */}

      {/* Loading and Empty States */}
      {loading && (
        <motion.div 
          className="glass p-8 sm:p-12 rounded-xl text-center border border-border/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="inline-block"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⏳</div>
          </motion.div>
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Loading your trading journal entries...</div>
        </motion.div>
      )}

      {!loading && entries.length === 0 && (
        <motion.div 
          className="glass p-6 sm:p-12 rounded-xl text-center border border-border/40"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="text-4xl sm:text-6xl mb-2 sm:mb-4 inline-block"
            initial={{ y: 0 }}
            animate={{ y: -5 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            📖
          </motion.div>
          <div className="text-muted-foreground">
            <p className="text-base sm:text-lg font-bold mb-1 sm:mb-2">No journal entries yet</p>
            <p className="text-xs sm:text-sm mb-4 sm:mb-6 max-w-md mx-auto">Start documenting your trades to build a comprehensive trading journal. Track every trade, analyze your patterns, and improve your strategy.</p>
            <Button onClick={() => setOpenAdd(true)} className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 shadow-lg text-white font-semibold w-full sm:w-auto text-xs sm:text-base">
              <Plus className="mr-2 w-3 sm:w-4 h-3 sm:h-4" /> Create Your First Entry
            </Button>
          </div>
        </motion.div>
      )}

      {!loading && entries.length > 0 && entries.every((x:any) => {
        const q = search.toLowerCase();
        const sym = String(x.symbol || '').toLowerCase();
        const setup = Array.isArray(x.setup) ? x.setup.join(' ').toLowerCase() : String(x.setup || '').toLowerCase();
        const notes = String(x.notes || '').toLowerCase();
        return !sym.includes(q) && !setup.includes(q) && !notes.includes(q);
      }) && search && (
        <motion.div 
          className="glass p-12 rounded-xl text-center border border-border/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-muted-foreground">
            <p className="text-base font-semibold mb-2">No results found</p>
            <p className="text-sm">Try searching with different keywords or clear the search filter</p>
          </div>
        </motion.div>
      )}

      <EditJournalDialog open={!!editEntry} entry={editEntry} onOpenChange={(open) => { if (!open) setEditEntry(null) }} />

      <ViewJournalDialog open={!!viewEntry} entry={viewEntry} onOpenChange={(open) => { if (!open) setViewEntry(null) }} />
    </div>
  );
};

function MonthlyView({ entries }: { entries: any[] }){
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7)) // YYYY-MM
  const list = useMemo(()=> entries.filter(e => e.executed_at && e.executed_at.startsWith(month)), [entries, month])

  const total = list.length
  const wins = list.filter((t:any)=> t.win).length
  const losses = total - wins
  const winRate = total>0 ? Math.round((wins/total)*100) : 0
  const avgReward = list.filter((t:any)=> t.realized_points>0).reduce((s:any,t:any)=> s + Number(t.realized_points||0),0) / Math.max(1, list.filter((t:any)=> t.realized_points>0).length)
  const avgLoss = list.filter((t:any)=> t.realized_points<0).reduce((s:any,t:any)=> s + Math.abs(Number(t.realized_points||0)),0) / Math.max(1, list.filter((t:any)=> t.realized_points<0).length)
  const best = list.reduce((best:any,cur:any)=>(!best|| cur.realized_points>best.realized_points)?cur:best, null)
  const worst = list.reduce((worst:any,cur:any)=>(!worst|| cur.realized_points<worst.realized_points)?cur:worst, null)
  const totalRealized = list.reduce((s:any,t:any)=> s + Number(t.realized_points||0),0)

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input 
          type="month" 
          value={month} 
          onChange={(e)=>setMonth(e.target.value)} 
          className="text-sm bg-slate-800 text-cyan-100 border-2 border-cyan-500 rounded-xl px-4 py-2.5 hover:border-cyan-400 hover:bg-slate-700 hover:text-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/70 focus:outline-none transition-all duration-300 font-semibold cursor-pointer shadow-lg hover:shadow-xl"
        />
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Total trades</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{total}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Wins</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{wins}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Losses</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{losses}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Win rate</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{winRate}%</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg reward</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{isNaN(avgReward) ? '-' : avgReward.toFixed(1)}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg loss</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{isNaN(avgLoss) ? '-' : avgLoss.toFixed(1)}</div>
        </Card>
        <Card className="p-3 sm:p-4 xs:col-span-2 md:col-span-2">
          <div className="text-xs sm:text-sm text-muted-foreground">Best trade</div>
          <div className="text-base sm:text-lg font-bold mt-1">{best ? `${best.symbol} ${best.realized_points} pts` : '-'}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Worst trade</div>
          <div className="text-base sm:text-lg font-bold mt-1">{worst ? `${worst.symbol} ${worst.realized_points} pts` : '-'}</div>
        </Card>
        <Card className="p-3 sm:p-4 xs:col-span-2 md:col-span-3">
          <div className="text-xs sm:text-sm text-muted-foreground">Total realized points</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{totalRealized}</div>
        </Card>
      </div>
    </div>
  )
}

function WeeklyView({ entries }: { entries: any[] }){
  // compute by ISO weeks (simple Mon-Sun grouping)
  const weeks: { range:string; trades:any[]; total:number; wins:number }[] = []
  const sorted = [...entries].sort((a,b)=> new Date(a.executed_at).getTime() - new Date(b.executed_at).getTime())
  // group into calendar weeks for the last 8 weeks
  const now = new Date()
  for (let w=0; w<8; w++){
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay()) - (7*w)) // last Sunday
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6)
    const list = sorted.filter((t:any)=>{
      if (!t.executed_at) return false
      const d = new Date(t.executed_at)
      return d >= start && d <= end
    })
    const total = list.reduce((s:any,t:any)=> s + Number(t.realized_points||0),0)
    const wins = list.filter((t:any)=> t.win).length
    weeks.push({ range: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, trades: list, total, wins })
  }

  // top/worst pairs
  const pairAgg = entries.reduce((acc:any, t:any)=>{ const s = t.symbol||'N/A'; acc[s] = acc[s]||0; acc[s]+= Number(t.realized_points||0); return acc }, {})
  const pairs = Object.entries(pairAgg).map(([k,v])=>({pair:k, total:v})).sort((a:any,b:any)=> b.total - a.total)

  // avg RRR = average of (target/stop) across trades with stop>0
  const rr = entries.filter((t:any)=> t.stop_loss_points>0).map((t:any)=> Number(t.target_points || 0)/Number(t.stop_loss_points||1))
  const avgRRR = rr.length? (rr.reduce((s:any,x:any)=>s+x,0)/rr.length): 0
  const avgDuration = entries.length? (entries.reduce((s:any,t:any)=> s + Number(t.duration_minutes||0),0)/entries.length) : 0

  return (
    <div>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg RRR</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{avgRRR? avgRRR.toFixed(2) : '-'}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Avg duration (min)</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{avgDuration? Math.round(avgDuration) : '-'}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">Top pairs</div>
          <div className="text-sm sm:text-lg font-bold mt-1">{pairs.slice(0,3).map(p=>`${p.pair} (${Math.round(Number(p.total))})`).join(', ') || '-'}</div>
        </Card>
      </div>

      <div className="mt-4 space-y-2">
        {weeks.map((w,i)=> (
          <Card key={i} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4" title={w.range}>
            <div className="min-w-0">
              <div className="font-medium text-sm sm:text-base">Week {i+1}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{w.range}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-semibold text-sm">Trades: {w.trades.length}</div>
              <div className="text-xs sm:text-sm">Wins: {w.wins} • Realized: {w.total}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TradingJournal;