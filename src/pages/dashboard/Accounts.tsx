import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { AddAccountDialog } from "@/components/modals/AddAccountDialog";
import { EditAccountDialog } from "@/components/modals/EditAccountDialog";
import { DeleteConfirmDialog } from "@/components/modals/DeleteConfirmDialog";
import { AccountDetailDialog } from "@/components/modals/AccountDetailDialog";
import supabase from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import ConnectFxbookDialog from '@/components/modals/ConnectFxbookDialog'

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [fxOpen, setFxOpen] = useState(false)
  const [fxConnected, setFxConnected] = useState(false)
  const [fxAccountsCount, setFxAccountsCount] = useState<number>(0)
  const [fxLastSynced, setFxLastSynced] = useState<string | null>(null)
  const [fxChecking, setFxChecking] = useState<boolean>(false)

  const checkFxConnected = async () => {
    setFxChecking(true)
    try {
      const session = (await supabase.auth.getSession()).data?.session
      const token = session?.access_token
      // 1) Verify backend session validity
      const res = await fetch('/fxbook/accounts', { headers: { ...(token ? { Authorization: `Bearer ${token.access_token ?? token}` } : {}) } })
      if (!res.ok) {
        setFxConnected(false)
        setFxAccountsCount(0)
        setFxLastSynced(null)
        setFxChecking(false)
        return
      }
      const payload = await res.json().catch(() => null)
      let connected = false
      if (!payload) connected = false
      else if (Array.isArray(payload)) connected = payload.length > 0
      else if (payload.accounts && Array.isArray(payload.accounts)) connected = payload.accounts.length > 0
      else if (payload.myAccounts && Array.isArray(payload.myAccounts)) connected = payload.myAccounts.length > 0
      else if (payload.session === true || payload.session) connected = true
      else if (payload.success === true) connected = true
      else connected = false
      setFxConnected(connected)

      // 2) Query Supabase for linked fxbook_accounts (owner-only) to display count and last_synced
      try {
        const userId = user?.id ?? null
        if (userId) {
          const { data, error } = await supabase.from('fxbook_accounts').select('fxbook_account_id,last_synced').eq('user_id', userId)
          if (!error && data) {
            setFxAccountsCount(data.length)
            // compute most recent last_synced
            const times = data.map((r: any) => r.last_synced).filter(Boolean).map((t: any) => new Date(t).getTime())
            if (times.length) {
              const mx = Math.max(...times)
              setFxLastSynced(new Date(mx).toLocaleString())
            } else {
              setFxLastSynced(null)
            }
          } else {
            setFxAccountsCount(0)
            setFxLastSynced(null)
          }
        }
      } catch (e) {
        setFxAccountsCount(0)
        setFxLastSynced(null)
      }
    } catch (e) {
      setFxConnected(false)
      setFxAccountsCount(0)
      setFxLastSynced(null)
    } finally {
      setFxChecking(false)
    }
  }

  const handleEdit = (account: any) => {
    setSelectedAccount(account);
    setEditOpen(true);
  };

  const handleDelete = (account: any) => {
    setSelectedAccount(account);
    setDeleteOpen(true);
  };

  const handleViewDetail = (account: any) => {
    setSelectedAccount(account);
    setDetailOpen(true);
  };

  const confirmDelete = () => {
    (async () => {
      try {
        if (!selectedAccount?.id) return;
        const { error } = await supabase.from('trading_accounts').delete().eq('id', selectedAccount.id)
        if (error) throw error
        setRefreshKey(k => k + 1)
      } catch (err) {
        console.error('Failed to delete account', err)
      } finally {
        setDeleteOpen(false)
      }
    })()
  };

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const userId = user?.id ?? null
        if (!userId) { setAccounts([]); return }
        const { data, error } = await supabase.from('trading_accounts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
        if (error) throw error
        if (!mounted) return
        setAccounts(data ?? [])
      } catch (err) {
        console.error('Failed to load accounts', err)
      } finally {
        setLoading(false)
      }
    })()

    // check fxbook session
    checkFxConnected()

    return () => { mounted = false }
  }, [user, refreshKey])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Accounts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage all your prop firm accounts</p>
        </div>
        
        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 w-full sm:w-auto">
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 flex-1 xs:flex-none">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className={`inline-flex items-center px-2 xs:px-3 py-1 rounded-full text-xs xs:text-sm font-medium ${fxConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                <span className={`w-2 h-2 rounded-full mr-1 xs:mr-2 ${fxConnected ? 'bg-green-600' : 'bg-gray-500'}`} />
                <span className="hidden xs:inline">{fxConnected ? 'Myfxbook Connected' : 'Myfxbook Disconnected'}</span>
                <span className="xs:hidden">{fxConnected ? 'Connected' : 'Disconnected'}</span>
              </span>
              {fxChecking ? <span className="text-xs text-muted-foreground">Checking…</span> : (
                <span className="text-xs text-muted-foreground hidden sm:inline">{fxAccountsCount > 0 ? `${fxAccountsCount}` : '0'}{fxLastSynced ? ` · ${fxLastSynced}` : ''}</span>
              )}
            </div>
            <Button onClick={() => setFxOpen(true)} className="w-full xs:w-auto text-xs xs:text-sm py-1.5 xs:py-2 h-8 xs:h-10">
              Myfxbook
            </Button>
          </div>
          <Button onClick={() => setAddOpen(true)} className="w-full xs:w-auto text-xs xs:text-sm py-1.5 xs:py-2 h-8 xs:h-10">
            <Plus className="w-4 h-4 mr-1 xs:mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Table Section - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass p-3 sm:p-6 overflow-hidden">
          <div className="overflow-x-auto -mx-3 sm:mx-0 sm:rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 sticky top-0">
                <tr className="border-b border-border">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm whitespace-nowrap">Provider</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm whitespace-nowrap hidden xs:table-cell">Type</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm whitespace-nowrap">ID</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Platform</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm whitespace-nowrap">Balance</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Created</th>
                  <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">{account.provider}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm hidden xs:table-cell">{account.metadata?.account_type ?? '—'}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-mono truncate">{account.account_identifier}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">{account.metadata?.platform ?? '—'}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold">{typeof account.balance === 'number' ? `$${account.balance.toLocaleString()}` : account.balance}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm hidden md:table-cell text-muted-foreground">{new Date(account.created_at).toLocaleDateString()}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <div className="flex gap-1 xs:gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetail(account)}
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(account)}
                          title="Edit account"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(account)}
                          title="Delete account"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No accounts yet. Create one to get started.</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Dialogs */}
      <AddAccountDialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setRefreshKey(k => k + 1) }} />
      <EditAccountDialog
        open={editOpen}
        onOpenChange={(open) => { setEditOpen(open); if (!open) setRefreshKey(k => k + 1) }}
        account={selectedAccount}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
      />
      <AccountDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        account={selectedAccount}
      />
      <ConnectFxbookDialog open={fxOpen} onOpenChange={(open) => { setFxOpen(open); if (!open) checkFxConnected() }} />
    </div>
  );
};

export default Accounts;