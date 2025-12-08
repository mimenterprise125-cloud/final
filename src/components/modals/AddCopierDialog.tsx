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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface AddCopierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddCopierDialog = ({ open, onOpenChange }: AddCopierDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    slaveAccount: "",
    riskMode: "",
    multiplier: "",
    allowedSymbols: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const user = (await supabase.auth.getUser()).data?.user
        const payload: any = {
          slave_account: formData.slaveAccount,
          risk_mode: formData.riskMode,
          multiplier: formData.multiplier,
          allowed_symbols: formData.allowedSymbols,
          status: 'Active',
          created_at: new Date().toISOString(),
        }
        if (user?.id) payload.user_id = user.id
        const { error } = await supabase.from('copy_rules').insert([payload])
        if (error) throw error
        toast({ title: 'Mapping added', description: 'Trade copier mapping has been created successfully.' })
        onOpenChange(false)
      } catch (err: any) {
        toast({ title: 'Create failed', description: err?.message || String(err), variant: 'destructive' })
      }
    })()
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Copier Mapping</DialogTitle>
          <DialogDescription>
            Configure a new slave account for trade copying
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slaveAccount">Slave Account</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, slaveAccount: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FTMO - 123456">FTMO - 123456</SelectItem>
                  <SelectItem value="The5ers - 789012">The5ers - 789012</SelectItem>
                  <SelectItem value="MyForexFunds - 345678">MyForexFunds - 345678</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskMode">Risk Mode</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, riskMode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed Lot">Fixed Lot</SelectItem>
                  <SelectItem value="Risk %">Risk %</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="multiplier">Multiplier</Label>
              <Input
                id="multiplier"
                value={formData.multiplier}
                onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
                placeholder="1.0"
                type="number"
                step="0.1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedSymbols">Allowed Symbols</Label>
              <Input
                id="allowedSymbols"
                value={formData.allowedSymbols}
                onChange={(e) => setFormData({ ...formData, allowedSymbols: e.target.value })}
                placeholder="All or EUR/USD, GBP/USD"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Mapping</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};