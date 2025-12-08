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
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface EditPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payout: any;
}

export const EditPayoutDialog = ({ open, onOpenChange, payout }: EditPayoutDialogProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState("");

  useEffect(() => {
    if (payout) {
      setDate(payout.date);
    }
  }, [payout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        if (!payout?.id) throw new Error('Missing payout id')
        const { error } = await supabase.from('payouts').update({ date }).eq('id', payout.id)
        if (error) throw error
        toast({ title: "Payout updated", description: "Payout entry has been updated successfully." });
        onOpenChange(false);
      } catch (err: any) {
        toast({ title: 'Update failed', description: err?.message || String(err), variant: 'destructive' })
      }
    })()
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong">
        <DialogHeader>
          <DialogTitle>Edit Payout</DialogTitle>
          <DialogDescription>
            Update payout date
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Expected Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};