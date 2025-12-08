import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import supabase from '@/lib/supabase'

interface ConnectFxbookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ConnectFxbookDialog = ({ open, onOpenChange }: ConnectFxbookDialogProps) => {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [linking, setLinking] = useState<Record<string, 'idle'|'loading'|'success'|'error'>>({})
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setAccounts([])
    setSelected({})
  }, [open])

  const handleLogin = async () => {
    try {
      setLoading(true)
      const session = (await supabase.auth.getSession()).data?.session
      const token = session?.access_token ?? session
      const res = await fetch('/fxbook/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        if (res.status === 401) {
          // User not authenticated with TradeOne (Supabase) — prompt to login
          throw new Error('You must be signed in to TradeOne to connect Myfxbook. Please sign in and try again.')
        }
        let txt = 'Login failed'
        try { const j = await res.json(); txt = j?.detail || j?.message || txt } catch (e) { try { txt = await res.text() } catch (e) {} }
        throw new Error(txt)
      }
      toast({ title: 'Connected', description: 'Myfxbook session saved.' })
      // fetch accounts
      await fetchAccounts()
    } catch (err: any) {
      toast({ title: 'Login failed', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const session = (await supabase.auth.getSession()).data?.session
      const token = session?.access_token ?? session
      const res = await fetch('/fxbook/accounts', { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } })
      if (!res.ok) {
        let text = 'Failed to fetch accounts'
        try { const j = await res.json(); text = j?.detail || j?.message || text } catch (e) {}
        throw new Error(text)
      }
      const payload = await res.json()
      // Myfxbook may return accounts under different keys; attempt to normalize
      const list = payload?.accounts ?? payload?.myAccounts ?? payload?.data ?? payload
      const arr = Array.isArray(list) ? list : (list?.accounts ?? [])
      setAccounts(arr)
      const sel: Record<string, boolean> = {}
      arr.forEach((a: any) => { sel[String(a.id ?? a.accountId ?? a.account_id ?? a.name)] = false })
      setSelected(sel)
      const linkingState: Record<string, 'idle'|'loading'|'success'|'error'> = {}
      arr.forEach((a: any) => { linkingState[String(a.id ?? a.accountId ?? a.account_id ?? a.name)] = 'idle' })
      setLinking(linkingState)
    } catch (err) {
      console.error('fetchAccounts', err)
      toast({ title: 'Fetch failed', description: 'Could not fetch Myfxbook accounts', variant: 'destructive' })
    }
  }

  const toggleSelect = (key: string) => {
    setSelected(s => ({ ...s, [key]: !s[key] }))
  }

  const linkSelected = async () => {
    try {
      setLoading(true)
      const session = (await supabase.auth.getSession()).data?.session
      const token = session?.access_token
      const toLink = accounts.filter(a => selected[String(a.id ?? a.accountId ?? a.account_id ?? a.name)])
      const errors: Record<string, string> = {}
      for (const a of toLink) {
        const key = String(a.id ?? a.accountId ?? a.account_id ?? a.name)
        try {
          setLinking(s => ({ ...s, [key]: 'loading' }))
          const body = {
            fxbook_account_id: Number(a.id ?? a.accountId ?? a.account_id),
            account_name: a.name ?? a.account_name ?? a.title,
            broker: a.broker ?? null,
            server: a.server ?? null
          }
          const res = await fetch('/fxbook/link-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token.access_token ?? token}` } : {})
            },
            body: JSON.stringify(body)
          })
          if (!res.ok) {
            let text = 'Failed to link account'
            try { const j = await res.json(); text = j?.detail || j?.message || text } catch (e) {}
            throw new Error(text)
          }
          setLinking(s => ({ ...s, [key]: 'success' }))
        } catch (e: any) {
          const msg = e?.message || String(e)
          errors[key] = msg
          setLinking(s => ({ ...s, [key]: 'error' }))
          setLinkErrors(prev => ({ ...prev, [key]: msg }))
        }
      }

      const failed = Object.keys(errors)
      if (failed.length === 0) {
        toast({ title: 'Linked', description: 'Selected accounts linked to TradeOne.' })
        onOpenChange(false)
      } else {
        toast({ title: 'Partial failure', description: `${failed.length} account(s) failed to link. See errors.` , variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Link failed', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] glass-strong">
        <DialogHeader>
          <DialogTitle>Connect Myfxbook</DialogTitle>
          <DialogDescription>Sign in with your Myfxbook credentials to import accounts.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@provider.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Myfxbook password" />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleLogin} disabled={loading}>{loading ? 'Connecting...' : 'Connect'}</Button>
            <Button variant="outline" onClick={fetchAccounts}>Fetch Accounts</Button>
          </div>

          {accounts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Myfxbook Accounts</h3>
              <div className="grid gap-2">
                {accounts.map((a: any) => {
                  const key = String(a.id ?? a.accountId ?? a.account_id ?? a.name)
                  return (
                    <label key={key} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox checked={!!selected[key]} onCheckedChange={() => toggleSelect(key)} />
                      <div>
                        <div className="font-medium">{a.name ?? a.title ?? key}</div>
                        <div className="text-sm text-muted-foreground">ID: {a.id ?? a.accountId ?? a.account_id}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={linkSelected}>Link Selected</Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConnectFxbookDialog
