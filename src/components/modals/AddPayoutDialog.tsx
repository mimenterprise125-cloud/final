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

interface AddPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPayoutDialog = ({ open, onOpenChange }: AddPayoutDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    propFirm: "",
    amount: "",
    date: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const user = (await supabase.auth.getUser()).data?.user
        const payload: any = {
          prop_firm: formData.propFirm,
          amount: formData.amount,
          date: formData.date,
          status: 'Pending',
          created_at: new Date().toISOString(),
        }
        if (user?.id) payload.user_id = user.id
        const { error } = await supabase.from('payouts').insert([payload])
        if (error) throw error
        toast({ title: 'Payout added', description: 'Payout entry has been added successfully.' })
        onOpenChange(false)
      } catch (err: any) {
        toast({ title: 'Create failed', description: err?.message || String(err), variant: 'destructive' })
      }
    })()
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong">
        <DialogHeader>
          <DialogTitle>Add Payout</DialogTitle>
          <DialogDescription>
            Record a new payout
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="propFirm">Prop Firm</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, propFirm: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prop firm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FTMO">FTMO</SelectItem>
                  <SelectItem value="The5ers">The5ers</SelectItem>
                  <SelectItem value="MyForexFunds">MyForexFunds</SelectItem>
                  <SelectItem value="FundedNext">FundedNext</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="$2,500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Expected Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Payout</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};