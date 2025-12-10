import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import supabase from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

const PropFirmDashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
        console.error('Failed to load prop firm data', err)
      } finally {
        setLoading(false)
      }
    })();

    return () => { mounted = false }
  }, [user]);

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
      {/* Header Section */}
      <motion.div 
        className="space-y-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-muted-foreground text-base">Your complete prop firm trading overview</p>
      </motion.div>

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
    </div>
  );
};

export default PropFirmDashboard;
