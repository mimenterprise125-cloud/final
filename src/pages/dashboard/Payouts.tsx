import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, Edit, CheckCircle, DollarSign, Calendar } from "lucide-react";
import { AddPayoutDialog } from "@/components/modals/AddPayoutDialog";
import { EditPayoutDialog } from "@/components/modals/EditPayoutDialog";
import supabase from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

const Payouts = () => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);

  const handleEdit = (payout: any) => {
    setSelectedPayout(payout);
    setEditOpen(true);
  };

  const handleMarkReceived = (id: number) => {
    (async () => {
      try {
        const { error } = await supabase.from('payouts').update({ status: 'Received' }).eq('id', id)
        if (error) throw error
        setRefreshKey(k => k + 1)
      } catch (err) {
        console.error('Failed to mark received', err)
      }
    })()
  };

  const totalPending = payouts
    .filter(p => p.status === "Pending")
    .reduce((sum, p) => sum + (parseFloat(String(p.amount).replace(/[$,]/g, "")) || 0), 0);

  const totalReceived = payouts
    .filter(p => p.status === "Received")
    .reduce((sum, p) => sum + (parseFloat(String(p.amount).replace(/[$,]/g, "")) || 0), 0);

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const userId = user?.id ?? null
        if (!userId) { setPayouts([]); return }
        const { data, error } = await supabase.from('payouts').select('*').eq('user_id', userId).order('date', { ascending: false })
        if (error) throw error
        if (!mounted) return
        setPayouts(data ?? [])
      } catch (err) {
        console.error('Failed to load payouts', err)
      } finally {
        setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [user, refreshKey])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Payouts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your prop firm payouts</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Payout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass p-3 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Upcoming Payouts</p>
                <h3 className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2 truncate">${totalPending.toLocaleString()}</h3>
              </div>
              <Calendar className="w-6 sm:w-10 h-6 sm:h-10 text-warning flex-shrink-0" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass p-3 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Received</p>
                <h3 className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2 truncate">${totalReceived.toLocaleString()}</h3>
              </div>
              <DollarSign className="w-6 sm:w-10 h-6 sm:h-10 text-success flex-shrink-0" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass p-3 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Next Payout</p>
                <h3 className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2">5 Days</h3>
              </div>
              <CheckCircle className="w-6 sm:w-10 h-6 sm:h-10 text-primary flex-shrink-0" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Payouts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Payout History</h2>
          <div className="overflow-x-auto -mx-3 sm:mx-0 sm:rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Firm</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Amount</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm hidden sm:table-cell">Date</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Status</th>
                  <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">{payout.propFirm}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-success font-semibold text-xs sm:text-sm">{payout.amount}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm hidden sm:table-cell text-muted-foreground">{payout.date}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <Badge variant={payout.status === "Received" ? "default" : "secondary"} className="text-xs">
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <div className="flex gap-1 xs:gap-2 justify-end">
                        {payout.status === "Pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkReceived(payout.id)}
                            className="text-xs px-2 py-1 h-7 xs:h-8"
                          >
                            <span className="hidden xs:inline">Mark Received</span>
                            <span className="xs:hidden">✓</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(payout)}
                          className="h-7 xs:h-8 w-7 xs:w-8"
                        >
                          <Edit className="w-3 xs:w-4 h-3 xs:h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <AddPayoutDialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setRefreshKey(k => k + 1) }} />
      <EditPayoutDialog
        open={editOpen}
        onOpenChange={(open) => { setEditOpen(open); if (!open) setRefreshKey(k => k + 1) }}
        payout={selectedPayout}
      />
    </div>
  );
};

export default Payouts;