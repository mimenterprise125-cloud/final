import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddAccountDialog = ({ open, onOpenChange }: AddAccountDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    propFirm: "",
    accountType: "",
    accountLogin: "",
    platform: "",
    balance: "",
    password: ""
  });
  const [accountCategory, setAccountCategory] = useState<'funded'|'personal'>('funded')
  const [personalName, setPersonalName] = useState('')
  const [serverInput, setServerInput] = useState('')
  const [personalLogin, setPersonalLogin] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [propFirmName, setPropFirmName] = useState('')
  const [propFirms, setPropFirms] = useState<Array<any>>([])
  const [selectedPropFirmId, setSelectedPropFirmId] = useState<string | null>(null)
  const [servers, setServers] = useState<string[]>([])
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [newServerName, setNewServerName] = useState('')
  const [showAddServer, setShowAddServer] = useState(false)
  const [showAddPropFirm, setShowAddPropFirm] = useState(false)
  const [newPropFirmName, setNewPropFirmName] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        setIsSaving(true)
        const user = (await supabase.auth.getUser()).data?.user
  // Map form fields to the canonical trading_accounts schema
        // Prepare payload depending on chosen category
        let providerName = accountCategory === 'personal' ? 'Personal' : (formData.propFirm || propFirmName || '');
        let accountIdentifier = accountCategory === 'personal' ? personalName : formData.accountLogin;
        const serverToUse = selectedServer ?? serverInput

        let payload: any = {
          provider: providerName,
          account_identifier: accountIdentifier,
          name: accountCategory === 'personal' ? personalName : `${providerName} ${formData.accountLogin}`,
          balance: null,
          currency: 'USD',
          metadata: {
            platform: formData.platform,
            account_type: formData.accountType,
            category: accountCategory,
            server: serverToUse,
          },
          created_at: new Date().toISOString(),
        }
        if (user?.id) payload.user_id = user.id

        // For funded/professional we allow setting an initial balance from the form
        if (accountCategory !== 'personal') {
          const numericBalance = Number(String(formData.balance).replace(/[^0-9.-]+/g, '')) || 0
          payload.balance = numericBalance
        }

        const { data: inserted, error } = await supabase.from('trading_accounts').insert([payload]).select().single()
        if (error) throw error
        toast({ title: 'Account added', description: 'Your account has been added successfully.' })

        // send credentials to backend endpoint which will store them securely and fetch balance
        try {
          const session = (await supabase.auth.getSession()).data?.session
          const token = session?.access_token
          await fetch(import.meta.env.VITE_CREDENTIALS_ENDPOINT || '/api/store-account-credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              account_id: inserted?.id,
              credentials: {
                account_name: accountCategory === 'personal' ? personalName : formData.propFirm || propFirmName,
                login: accountCategory === 'personal' ? personalLogin : formData.accountLogin,
                password: formData.password,
                server: serverToUse,
                platform: formData.platform
              }
            })
          })
        } catch (err) {
          // don't block the UI if backend call fails; notify user
          toast({ title: 'Background fetch failed', description: 'Could not send credentials to worker. Please contact support.', variant: 'destructive' })
        }

        onOpenChange(false)
      } catch (err: any) {
        toast({ title: 'Create failed', description: err?.message || String(err), variant: 'destructive' })
      } finally {
        setIsSaving(false)
      }
    })()
  };

  // simplified: user provides server text which will be saved in trading_accounts.metadata and credentials posted to backend

  // load prop firms on mount
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('prop_firms').select('id, name')
        if (!error && data) setPropFirms(data)
      } catch (err) {
        console.error('load prop firms', err)
      }
    })()
  }, [])

  const handleAddPropFirm = async () => {
    if (!newPropFirmName) return
    try {
      const { data, error } = await supabase.from('prop_firms').insert([{ name: newPropFirmName }]).select().single()
      if (error) throw error
      // refresh list and select newly created
      const { data: all, error: e2 } = await supabase.from('prop_firms').select('id, name')
      if (!e2 && all) setPropFirms(all)
      setSelectedPropFirmId(data.id)
      setNewPropFirmName('')
      setShowAddPropFirm(false)
      toast({ title: 'Prop firm added', description: 'New prop firm available for all users.' })
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message || String(err), variant: 'destructive' })
    }
  }

  // load servers when prop firm changes
  useEffect(() => {
    (async () => {
      try {
        if (!selectedPropFirmId) {
          setServers([])
          setSelectedServer(null)
          return
        }
        const { data, error } = await supabase.from('saved_servers').select('id, name').eq('prop_firm_id', selectedPropFirmId)
        if (!error && data) {
          const names = (data as any[]).map(d => d.name)
          setServers(names)
          if (names.length) setSelectedServer(names[0])
        }
      } catch (err) {
        console.error('load servers', err)
      }
    })()
  }, [selectedPropFirmId])

  const handleAddServerToDB = async () => {
    if (!selectedPropFirmId) {
      toast({ title: 'Select prop firm first', variant: 'destructive' })
      return
    }
    if (!newServerName) return
    try {
      const { data, error } = await supabase.from('saved_servers').insert([{ prop_firm_id: selectedPropFirmId, name: newServerName }]).select().single()
      if (error) throw error
      setServers(prev => [...prev, newServerName])
      setSelectedServer(newServerName)
      setNewServerName('')
      setShowAddServer(false)
      toast({ title: 'Server saved', description: 'Server added for the prop firm.' })
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message || String(err), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>
            Connect a new prop firm account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Account Category</Label>
              <div className="flex gap-2">
                <Button variant={accountCategory === 'funded' ? 'default' : 'ghost'} onClick={() => setAccountCategory('funded')}>Funded</Button>
                <Button variant={accountCategory === 'personal' ? 'default' : 'ghost'} onClick={() => setAccountCategory('personal')}>Personal</Button>
              </div>
            </div>

            {accountCategory === 'personal' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="personalName">Account Name</Label>
                  <Input
                    id="personalName"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    placeholder="My Personal MT5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalServer">Server</Label>
                  <Input
                    id="personalServer"
                    value={serverInput}
                    onChange={(e) => setServerInput(e.target.value)}
                    placeholder="broker-server.example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalLogin">Login ID</Label>
                  <Input
                    id="personalLogin"
                    value={personalLogin}
                    onChange={(e) => setPersonalLogin(e.target.value)}
                    placeholder="12345678"
                    required
                  />
                </div>
              </>
            ) : (
              <>

                <div className="space-y-2">
                  <Label htmlFor="propFirm">Prop Firm</Label>
                  <div className="flex gap-2 items-center">
                    <Select onValueChange={(val) => {
                      setSelectedPropFirmId(val || null)
                      const pf = propFirms.find(p => p.id === val)
                      setFormData({ ...formData, propFirm: pf?.name ?? '' })
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select prop firm" />
                      </SelectTrigger>
                      <SelectContent>
                        {propFirms.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" onClick={() => setShowAddPropFirm(v => !v)}>Add</Button>
                  </div>

                  {showAddPropFirm && (
                    <div className="mt-2 space-y-2 p-2 border rounded">
                      <Input placeholder="New prop firm name" value={newPropFirmName} onChange={(e) => setNewPropFirmName(e.target.value)} />
                      <div className="flex gap-2">
                        <Button onClick={handleAddPropFirm}>Save</Button>
                        <Button variant="outline" onClick={() => setShowAddPropFirm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server">Server</Label>
                  <div className="flex gap-2 items-center">
                    <Select onValueChange={(val) => setSelectedServer(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select server" />
                      </SelectTrigger>
                      <SelectContent>
                        {servers.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" onClick={() => setShowAddServer(v => !v)}>Add</Button>
                  </div>

                  {showAddServer && (
                    <div className="mt-2 space-y-2 p-2 border rounded">
                      <Input placeholder="New server name" value={newServerName} onChange={(e) => setNewServerName(e.target.value)} />
                      <div className="flex gap-2">
                        <Button onClick={handleAddServerToDB}>Save</Button>
                        <Button variant="outline" onClick={() => setShowAddServer(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, accountType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Evaluation">Evaluation</SelectItem>
                      <SelectItem value="Funded">Funded</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MT4">MetaTrader 4</SelectItem>
                      <SelectItem value="MT5">MetaTrader 5</SelectItem>
                      <SelectItem value="cTrader">cTrader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountLogin">Account Login</Label>
                  <Input
                    id="accountLogin"
                    value={formData.accountLogin}
                    onChange={(e) => setFormData({ ...formData, accountLogin: e.target.value })}
                    placeholder="12345678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance">Initial Balance</Label>
                  <Input
                    id="balance"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    placeholder="$10,000"
                    required
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};