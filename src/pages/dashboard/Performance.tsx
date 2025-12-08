import React, { useEffect, useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/AuthProvider'
import { useAdmin } from '@/lib/AdminContext'
import supabase from '@/lib/supabase'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Target, AlertCircle, Zap, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react'
import UnderDevelopment from '@/components/UnderDevelopment'

const MetricCard = ({ title, value, hint, icon: Icon, trend }: { title: string; value: string | number; hint?: string; icon?: any; trend?: 'up' | 'down' | 'neutral' }) => {
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-muted-foreground'
  return (
    <Card className="p-5 border border-primary/20 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/40">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <h3 className={`text-3xl font-bold mt-2 ${trendColor}`}>{value}</h3>
          {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
        </div>
        {Icon && <Icon className={`w-6 h-6 ${trendColor}`} />}
      </div>
    </Card>
  )
}

const SectionHeader = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
    <h2 className="text-2xl font-bold flex items-center gap-2">
      <span>{icon}</span>
      <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">{title}</span>
    </h2>
    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
  </motion.div>
)

// AI Insights Generator
const generateAIInsights = (metrics: any, entries: any[], sessionData: any[], setupData: any[]) => {
  const recentEntries = entries.slice(-20) // Last 20 trades
  
  // 1. TRADING SUMMARY INSIGHT
  const winRate = metrics.winRate || 0
  const hasImprovement = metrics.maxWinStreak >= 3
  const bestSession = metrics.bestSession?.name || 'N/A'
  const bestSetup = metrics.bestSetup?.name || 'N/A'
  const earlyExits = entries.filter((e: any) => {
    const entry = Number(e.entry_price)
    const target = Number(e.target_price)
    const exit = Number(e.exit_price)
    return entry && target && exit && Math.abs(exit - entry) < Math.abs(target - entry) * 0.5
  }).length
  
  let summaryInsight = ''
  if (winRate > 60 && hasImprovement) {
    summaryInsight = `✨ Strong performance this period! You're maintaining a ${winRate.toFixed(1)}% win rate with consistent ${metrics.maxWinStreak} trade winning streaks. Your best setup is **${bestSetup}** and you're most profitable during **${bestSession}** sessions. Focus on replicating these conditions.`
  } else if (winRate > 50) {
    summaryInsight = `📊 You're above 50% win rate at ${winRate.toFixed(1)}%. Your setup **${bestSetup}** is performing well. However, ${earlyExits} of your recent trades show early exits - consider holding through structure levels to capture full RR.`
  } else if (earlyExits > 5) {
    summaryInsight = `⚠️ Win rate is ${winRate.toFixed(1)}%. The main issue: You're exiting ${earlyExits} trades early before targets. This is likely costing you significant points. Practice patience and let trades reach your planned targets even if price is moving slowly.`
  } else {
    summaryInsight = `📈 You have ${metrics.totalTrades} recorded trades. To improve: Focus on **${bestSetup}** which shows the highest win rate, and trade during **${bestSession}** sessions when you're most profitable. Build consistency through repetition.`
  }
  
  // 2. MISTAKE COST EXPLANATION
  const topMistake = entries
    .filter((e: any) => Number(e.realized_points || e.realized_amount || 0) < 0)
    .sort((a: any, b: any) => Number(a.realized_points || a.realized_amount) - Number(b.realized_points || b.realized_amount))[0]
  
  let mistakeExplanation = ''
  let mistakeFix = ''
  if (topMistake) {
    const loss = Math.abs(Number(topMistake.realized_points || topMistake.realized_amount || 0))
    const lossReason = topMistake.loss_reason || 'unspecified'
    
    if (lossReason.toLowerCase().includes('early') || earlyExits > 5) {
      mistakeExplanation = `Your biggest loss cost **${loss.toFixed(2)} pts** and was related to exiting early. This is a pattern: ${earlyExits} of your recent trades closed before targets. You're leaving money on the table by not following your plan.`
      mistakeFix = `Commit to holding every trade until it reaches either your target price or stop loss. Use alerts instead of watching price, so you don't panic exit.`
    } else if (lossReason.toLowerCase().includes('entry') || lossReason.toLowerCase().includes('re-entry')) {
      mistakeExplanation = `Your biggest loss cost **${loss.toFixed(2)} pts** from a poor entry or re-entry. You're likely entering on weak setups or chasing prices after losses.`
      mistakeFix = `Add a rule: No re-entries within 30 minutes of a stop loss. Wait for a fresh setup confirmation before entering again.`
    } else {
      mistakeExplanation = `Your biggest loss cost **${loss.toFixed(2)} pts**. At your current win rate of ${winRate.toFixed(1)}%, each loss has outsized impact. Reduce position size or tighten stops to protect capital.`
      mistakeFix = `Focus on trades with 1:2+ RR only. Skip trades that don't meet your minimum R:R requirement, even if they look good.`
    }
  } else {
    mistakeExplanation = `Great job! You don't have any losing trades yet, or all your trades are still breakeven. Continue executing your trading plan and maintaining discipline.`
    mistakeFix = `Keep focusing on your entry rules and risk management. Every trade is a learning opportunity.`
  }
  
  // 3. NEXT WEEK ACTION PLAN
  const maxLoss = metrics.maxDD || 50
  const safeMaxTrades = Math.max(2, Math.floor(maxLoss / 15)) // Allow max 2 trades per day based on drawdown
  const safeMaxStopSize = Math.round(maxLoss / 2)
  
  const actionPlan = {
    rules: [
      `Trade only when market structure confirms your setup (no FOMO entries)`,
      `Stop after ${Math.max(1, Math.floor(metrics.maxLossStreak / 2))} consecutive losses`,
      `No re-entry into the same symbol within 1 hour of stop loss`,
      `Hold winners until minimum 2R structure or daily close`
    ],
    checklist: [
      { label: 'Max trades/day', value: safeMaxTrades },
      { label: 'Max SL size', value: `${safeMaxStopSize} pts` },
      { label: 'Min RR required', value: '1:1.5+' },
      { label: 'No trading after', value: '1:00 PM' }
    ]
  }
  
  return { summaryInsight, mistakeExplanation, mistakeFix, actionPlan }
}

const Performance = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<any>({})
  const [equityData, setEquityData] = useState<any[]>([])
  const [rrData, setRrData] = useState<any[]>([])
  const [mistakeData, setMistakeData] = useState<any[]>([])
  const [setupData, setSetupData] = useState<any[]>([])
  const [sessionData, setSessionData] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const userId = user?.id ?? null
        if (!userId) { setMetrics({}); return }

        // fetch journal rows for this user
        const { data: rows, error } = await supabase.from('journals').select('*').eq('user_id', userId).limit(10000)
        if (error) throw error
        const r = (rows || []).sort((a:any, b:any) => new Date(a.entry_at || a.created_at).getTime() - new Date(b.entry_at || b.created_at).getTime())

        // 1. BASIC METRICS
        const pnlVals = r.map((x:any) => Number(x.realized_points || x.realized_amount || 0)).filter((n:any) => Number.isFinite(n))
        const wins = pnlVals.filter((n:any) => n > 0).length
        const losses = pnlVals.filter((n:any) => n < 0).length
        const totalTrades = r.length
        const winRate = totalTrades ? (wins / totalTrades) * 100 : 0
        const avgWin = wins ? pnlVals.filter((n:any) => n > 0).reduce((s:any,a:any)=>s+a,0) / wins : 0
        const avgLoss = losses ? Math.abs(pnlVals.filter((n:any) => n < 0).reduce((s:any,a:any)=>s+a,0) / losses) : 0

        // 2. EXPECTANCY = (WinRate × AvgWin) - ((1−WinRate) × AvgLoss)
        const expectancy = (winRate/100 * avgWin) - ((1 - winRate/100) * avgLoss)
        const projectedGain = expectancy * 100

        // 3. STREAKS
        let currentStreak = 0, maxWinStreak = 0, maxLossStreak = 0, currentStreakType = ''
        for (const pnl of pnlVals) {
          const isWin = pnl > 0
          if (!currentStreakType) { currentStreakType = isWin ? 'win' : 'loss'; currentStreak = 1 }
          else if ((isWin && currentStreakType === 'win') || (!isWin && currentStreakType === 'loss')) { currentStreak++ }
          else { 
            if (currentStreakType === 'win') maxWinStreak = Math.max(maxWinStreak, currentStreak)
            else maxLossStreak = Math.max(maxLossStreak, currentStreak)
            currentStreakType = isWin ? 'win' : 'loss'
            currentStreak = 1
          }
        }

        // 4. DRAWDOWN
        let cumulative = 0, maxEquity = 0, maxDD = 0, avgDD = 0, ddCount = 0
        for (const pnl of pnlVals) {
          cumulative += pnl
          if (cumulative > maxEquity) maxEquity = cumulative
          const dd = maxEquity - cumulative
          if (dd > 0) { avgDD += dd; ddCount++ }
          maxDD = Math.max(maxDD, dd)
        }
        avgDD = ddCount ? avgDD / ddCount : 0

        // 5. EQUITY CURVE DATA
        let runningTotal = 0
        const eqData = r.map((trade:any, idx:number) => {
          runningTotal += Number(trade.realized_points || trade.realized_amount || 0)
          const date = new Date(trade.entry_at || trade.created_at)
          return { 
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
            equity: Math.round(runningTotal * 100) / 100,
            index: idx
          }
        }).filter((_, i) => r.length > 20 ? i % Math.ceil(r.length / 20) === 0 : true)
        if (mounted) setEquityData(eqData)

        // 6. RR EFFICIENCY
        const rrList: any[] = []
        for (const row of r) {
          const entry = Number(row.entry_price)
          const target = Number(row.target_price)
          const stop = Number(row.stop_loss_price)
          const exitPrice = Number(row.exit_price)
          const pnl = Number(row.realized_points || row.realized_amount || 0)
          
          // Calculate Target RR (planned) using entry_price and target_price/stop_loss_price
          if (entry && target && stop && Number.isFinite(entry) && Number.isFinite(target) && Number.isFinite(stop)) {
            const targetReward = Math.abs(target - entry)
            const actualRisk = Math.abs(entry - stop)
            
            // Calculate Achieved RR using entry_price and exit_price
            let achievedRR = 0
            if (exitPrice && Number.isFinite(exitPrice) && actualRisk > 0) {
              const achievedReward = Math.abs(exitPrice - entry)
              achievedRR = achievedReward / actualRisk
            } else if (actualRisk > 0) {
              // Fallback to using realized points
              const achievedReward = Math.abs(pnl)
              achievedRR = achievedReward / actualRisk
            }
            
            if (actualRisk > 0) {
              const targetRR = targetReward / actualRisk
              rrList.push({ target: targetRR, achieved: achievedRR, name: `Trade ${rrList.length + 1}` })
            }
          }
        }
        const avgTargetRR = rrList.length ? rrList.reduce((s:any, x:any) => s + x.target, 0) / rrList.length : 0
        const avgAchievedRR = rrList.length ? rrList.reduce((s:any, x:any) => s + x.achieved, 0) / rrList.length : 0
        if (mounted) setRrData(rrList.slice(-20))

        // 7. SETUP ANALYSIS
        const bySetup: Record<string, { wins:number, total:number }> = {}
        for (const row of r) {
          const setup = (row.setup || '—').toString()
          const pnl = Number(row.realized_points || row.realized_amount || 0)
          if (!bySetup[setup]) bySetup[setup] = { wins: 0, total: 0 }
          if (pnl > 0) bySetup[setup].wins += 1
          bySetup[setup].total += 1
        }
        const setupStats = Object.entries(bySetup).map(([name, obj]) => ({ name, winrate: obj.total ? (obj.wins/obj.total)*100 : 0, trades: obj.total })).sort((a,b) => b.winrate - a.winrate)
        if (mounted) setSetupData(setupStats.slice(0, 8))

        // 8. SESSION ANALYSIS
        const bySession: Record<string, { wins:number, total:number, pnl:number }> = {}
        for (const row of r) {
          const session = (row.session || '—').toString()
          const pnl = Number(row.realized_points || row.realized_amount || 0)
          if (!bySession[session]) bySession[session] = { wins: 0, total: 0, pnl: 0 }
          if (pnl > 0) bySession[session].wins += 1
          bySession[session].total += 1
          bySession[session].pnl += pnl
        }
        const sessionStats = Object.entries(bySession).map(([name, obj]) => ({ name, winrate: obj.total ? (obj.wins/obj.total)*100 : 0, pnl: Math.round(obj.pnl * 100) / 100, trades: obj.total }))
        if (mounted) setSessionData(sessionStats)

        // 9. TIME-OF-DAY ANALYSIS
        const byHour: Record<string, { wins:number, total:number }> = {}
        for (const row of r) {
          const hour = new Date(row.entry_at || row.created_at).getHours()
          const period = hour < 12 ? 'Morning (8-12)' : hour < 18 ? 'Afternoon (12-6)' : 'Evening (6+)'
          const pnl = Number(row.realized_points || row.realized_amount || 0)
          if (!byHour[period]) byHour[period] = { wins: 0, total: 0 }
          if (pnl > 0) byHour[period].wins += 1
          byHour[period].total += 1
        }

        // 10. MISTAKE COST
        const mistakes: { cost: number, reason: string }[] = []
        for (const row of r) {
          const pnl = Number(row.realized_points || row.realized_amount || 0)
          if (pnl < 0) {
            const reason = row.exit_reason || 'Unspecified loss'
            mistakes.push({ cost: Math.abs(pnl), reason })
          }
        }
        mistakes.sort((a,b) => b.cost - a.cost)
        if (mounted) setMistakeData(mistakes.slice(0, 5).map((m, i) => ({ ...m, name: `Loss #${i+1}` })))

        // 11. CONSISTENCY SCORE
        const emotionalTrades = r.filter((t:any) => t.emotional_trade === true).length
        const emotionalTradesPercent = totalTrades ? (emotionalTrades / totalTrades) * 100 : 0
        const consistencyScore = ((winRate/100) * avgAchievedRR / Math.max(0.1, emotionalTradesPercent/100)) * 10
        const finalScore = Math.min(100, Math.max(0, consistencyScore))

        if (!mounted) return
        setMetrics({ 
          expectancy: Math.round(expectancy * 100) / 100,
          projectedGain,
          winRate: Math.round(winRate * 10) / 10,
          maxWinStreak,
          maxLossStreak,
          maxDD: Math.round(maxDD * 100) / 100,
          avgDD: Math.round(avgDD * 100) / 100,
          avgWin: Math.round(avgWin * 100) / 100,
          avgLoss: Math.round(avgLoss * 100) / 100,
          avgTargetRR: Math.round(avgTargetRR * 100) / 100,
          avgAchievedRR: Math.round(avgAchievedRR * 100) / 100,
          totalTrades,
          wins,
          losses,
          totalPnL: Math.round(pnlVals.reduce((s:any,a:any)=>s+a,0) * 100) / 100,
          consistencyScore: Math.round(finalScore * 10) / 10,
          bestSetup: setupStats[0] || null,
          bestSession: sessionStats.sort((a,b) => b.pnl - a.pnl)[0] || null
        })
        setEntries(r)
      } catch (err) {
        console.error('Failed to load performance', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [user])

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Performance Analytics</h1>
          <p className="text-muted-foreground mt-2">Professional trading performance breakdown with advanced metrics</p>
        </div>
      </motion.div>

      {/* 🔷 PERFORMANCE OVERVIEW - KEY METRICS */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SectionHeader icon="🔷" title="Performance Overview" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Expectancy per Trade" value={`${metrics.expectancy ?? 0}${typeof metrics.expectancy === 'number' ? ' pts' : ''}`} hint={`Expected ${metrics.projectedGain?.toFixed(0)} pts per 100 trades`} icon={Target} trend={metrics.expectancy > 0 ? 'up' : 'down'} />
          <MetricCard title="Win Rate" value={`${metrics.winRate ?? 0}%`} hint={`${metrics.wins} wins / ${metrics.losses} losses`} icon={TrendingUp} trend={metrics.winRate > 50 ? 'up' : 'down'} />
          <MetricCard title="Max Win Streak" value={metrics.maxWinStreak ?? 0} hint="Consecutive winning trades" icon={Zap} trend="up" />
          <MetricCard title="Max Loss Streak" value={metrics.maxLossStreak ?? 0} hint="Longest losing sequence" icon={TrendingDown} trend="down" />
          <MetricCard title="Max Drawdown" value={`${metrics.maxDD ?? 0} pts`} hint={`Average: ${metrics.avgDD ?? 0} pts`} icon={AlertCircle} trend="down" />
          <MetricCard title="Consistency Score" value={`${metrics.consistencyScore ?? 0}/100`} hint="Overall trading discipline" icon={Target} trend={metrics.consistencyScore > 70 ? 'up' : 'neutral'} />
          <MetricCard title="RR Achieved" value={`1:${(metrics.avgAchievedRR ?? 0).toFixed(2)}`} hint={`Target: 1:${(metrics.avgTargetRR ?? 0).toFixed(2)}`} trend={metrics.avgAchievedRR >= metrics.avgTargetRR ? 'up' : 'down'} />
          <MetricCard title="Total P&L" value={`${metrics.totalPnL >= 0 ? '+' : ''}${metrics.totalPnL ?? 0} pts`} hint={`${metrics.totalTrades ?? 0} trades`} icon={TrendingUp} trend={metrics.totalPnL > 0 ? 'up' : 'down'} />
        </div>
      </motion.div>

      {/* 📈 EQUITY CURVE */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionHeader icon="📈" title="Equity Curve Simulator" />
        <Card className="p-6 border border-cyan-500/20 shadow-lg bg-gradient-to-br from-cyan-500/5 via-background to-background">
          <div style={{ height: 300 }}>
            {equityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "2px solid hsl(var(--primary))" }} />
                  <Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No trading data available</div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* ⚖️ RISK-TO-REWARD EXECUTION - Locked Section Start */}
      {(() => {
        const { adminSettings } = useAdmin();
        
        if (adminSettings.performance_analytics_locked) {
          return (
            <UnderDevelopment 
              title="Performance Analytics" 
              description="Detailed analytics about your trading performance are locked."
              type={adminSettings.performance_lock_type} 
            />
          );
        }
        
        return (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <SectionHeader icon="⚖️" title="Risk-to-Reward Execution" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-emerald-500/20 shadow-md bg-gradient-to-br from-emerald-500/5 via-background to-background">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-emerald-500/20">
                <span className="text-sm font-semibold">Target RR (Planned)</span>
                <span className="text-2xl font-bold text-emerald-400">1:{metrics.avgTargetRR?.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Based on: (Target Price - Entry Price) ÷ (Entry Price - Stop Loss Price)</p>
              <div className="flex justify-between items-center pb-3 border-b border-emerald-500/20">
                <span className="text-sm font-semibold">Achieved RR (Actual)</span>
                <span className="text-2xl font-bold text-cyan-400">1:{metrics.avgAchievedRR?.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Based on: (Exit Price - Entry Price) ÷ (Entry Price - Stop Loss Price)</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Efficiency</span>
                <span className={`text-xl font-bold ${metrics.avgAchievedRR >= metrics.avgTargetRR ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {metrics.avgAchievedRR && metrics.avgTargetRR ? ((metrics.avgAchievedRR / metrics.avgTargetRR) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                {metrics.avgAchievedRR < metrics.avgTargetRR ? '⚠️ You\'re exiting early and missing targets' : '✅ You\'re capturing your full RR'}
              </p>
            </div>
          </Card>

          <Card className="p-6 border border-blue-500/20 shadow-md bg-gradient-to-br from-blue-500/5 via-background to-background">
            <div style={{ height: 250 }}>
              {rrData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rrData.slice(-15)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '10px' }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="target" fill="hsl(var(--primary))" opacity={0.5} />
                    <Bar dataKey="achieved" fill="hsl(120, 100%, 50%)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No RR data</div>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      {/* 📊 STRATEGY BREAKDOWN */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <SectionHeader icon="📊" title="Strategy Breakdown" />
        <Card className="p-6 border border-violet-500/20 shadow-md bg-gradient-to-br from-violet-500/5 via-background to-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-violet-500/20">
                  <th className="text-left py-3 px-3 font-semibold">Setup Name</th>
                  <th className="text-right py-3 px-3 font-semibold">Trades</th>
                  <th className="text-right py-3 px-3 font-semibold">Win Rate</th>
                  <th className="text-right py-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {setupData.length > 0 ? setupData.map((setup, i) => (
                  <tr key={i} className="border-b border-violet-500/10 hover:bg-violet-500/5 transition-colors">
                    <td className="py-3 px-3 font-medium">{setup.name}</td>
                    <td className="text-right py-3 px-3">{setup.trades}</td>
                    <td className="text-right py-3 px-3"><Badge className={setup.winrate > 55 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>{setup.winrate.toFixed(1)}%</Badge></td>
                    <td className="text-right py-3 px-3">{setup.winrate > 55 ? '✅ Profitable' : '⚠️ Review'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No setup data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* 🕐 SESSION EFFICIENCY */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SectionHeader icon="🕐" title="Session Efficiency" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessionData.length > 0 && (
            <>
              <Card className="p-6 border border-amber-500/20 shadow-md bg-gradient-to-br from-amber-500/5 via-background to-background">
                <div className="space-y-3">
                  {sessionData.slice(0, 4).map((session, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div>
                        <p className="font-semibold text-sm">{session.name}</p>
                        <p className="text-xs text-muted-foreground">{session.trades} trades</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${session.winrate > 55 ? 'text-emerald-400' : 'text-rose-400'}`}>{session.winrate.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">{session.pnl >= 0 ? '+' : ''}{session.pnl} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6 border border-teal-500/20 shadow-md bg-gradient-to-br from-teal-500/5 via-background to-background">
                <p className="text-sm font-semibold text-muted-foreground mb-3">Best Session</p>
                {metrics.bestSession && (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-emerald-400">{metrics.bestSession.name}</p>
                    <p className="text-sm">Win Rate: <span className="font-semibold text-cyan-400">{metrics.bestSession.winrate.toFixed(1)}%</span></p>
                    <p className="text-sm">Trades: <span className="font-semibold">{metrics.bestSession.trades}</span></p>
                    <p className="text-sm">Total P&L: <span className={`font-semibold ${metrics.bestSession.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{metrics.bestSession.pnl >= 0 ? '+' : ''}{metrics.bestSession.pnl} pts</span></p>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </motion.div>

      {/* 🚫 MISTAKE COST ANALYSIS */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <SectionHeader icon="🚫" title="Mistake Cost Analysis" />
        <Card className="p-6 border border-rose-500/20 shadow-md bg-gradient-to-br from-rose-500/5 via-background to-background">
          <div className="space-y-3">
            {mistakeData.length > 0 ? mistakeData.map((mistake, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 transition-colors">
                <div>
                  <p className="font-semibold text-sm">Loss #{i+1}</p>
                  <p className="text-xs text-muted-foreground">{mistake.reason || 'Unspecified'}</p>
                </div>
                <p className="text-2xl font-bold text-rose-400">–{mistake.cost.toFixed(2)} pts</p>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No losing trades</p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* 🔥 CONSISTENCY SCORE BADGE */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="p-8 border-2 border-primary/40 shadow-xl bg-gradient-to-br from-primary/10 via-background to-background text-center">
          <p className="text-muted-foreground mb-2">Your Trading Discipline Score</p>
          <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text mb-2">
            {metrics.consistencyScore ?? 0}/100
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Based on win rate, RR execution, and emotional trading patterns. This score reflects your overall trading discipline and consistency.
          </p>
        </Card>
      </motion.div>

      {/* 🤖 AI COACHING INSIGHTS - FINAL SECTION */}
      {(() => {
        if (!metrics.totalTrades || metrics.totalTrades === 0) return null
        const aiInsights = generateAIInsights(metrics, entries, sessionData, setupData)
        return (
          <div className="space-y-6 pt-8 border-t border-border/50">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text mb-2">
                  🤖 AI Trading Coach
                </h2>
                <p className="text-muted-foreground">Personalized insights based on your trading data</p>
              </div>

              {/* 💡 Trading Summary */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.48 }} className="mb-6">
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-cyan-600/20 via-cyan-500/10 to-background">
                  <div className="p-8">
                    <div className="flex gap-4 items-start">
                      <div className="text-5xl">💡</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-cyan-300 mb-3">Trading Summary</h3>
                        <p className="text-base leading-relaxed text-foreground/90">{aiInsights.summaryInsight}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* ⚠️ Biggest Mistake Analysis */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.51 }} className="mb-6">
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-background">
                  <div className="p-8">
                    <div className="flex gap-4 items-start">
                      <div className="text-5xl">⚠️</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-amber-300 mb-4">Your Biggest Mistake Cost</h3>
                        <p className="text-base leading-relaxed text-foreground/90 mb-4">{aiInsights.mistakeExplanation}</p>
                        <div className="p-5 rounded-xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-sm">
                          <p className="text-sm font-semibold text-amber-200 mb-2">💡 The Fix:</p>
                          <p className="text-sm text-foreground/80">{aiInsights.mistakeFix}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 🎯 Next Week Action Plan */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.54 }}>
                <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-background">
                  <div className="p-8">
                    <div className="flex gap-4 items-start">
                      <div className="text-5xl">🎯</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-emerald-300 mb-6">Next Week Action Plan</h3>
                        
                        {/* Trading Rules */}
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-emerald-200 mb-4 flex items-center gap-2">
                            <span>📋</span>
                            <span>Trading Rules to Follow</span>
                          </h4>
                          <ul className="space-y-3">
                            {aiInsights.actionPlan.rules.map((rule, i) => (
                              <li key={i} className="flex gap-3 items-start p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors">
                                <span className="text-emerald-400 font-bold text-lg flex-shrink-0">✓</span>
                                <span className="text-sm text-foreground/90">{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Daily Checklist */}
                        <div>
                          <h4 className="text-lg font-semibold text-emerald-200 mb-4 flex items-center gap-2">
                            <span>📊</span>
                            <span>Daily Checklist</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiInsights.actionPlan.checklist.map((item, i) => (
                              <div key={i} className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15 transition-all">
                                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">{item.label}</p>
                                <p className="text-2xl font-bold text-emerald-300 mt-2">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        )
      })()}
            </>
          );
        })()}
    </div>
  )
}

export default Performance
