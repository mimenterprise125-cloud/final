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

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: any;
}

export const EditAccountDialog = ({ open, onOpenChange, account }: EditAccountDialogProps) => {
  const { toast } = useToast();
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (account) {
      setBalance(account.balance != null ? String(account.balance) : "");
    }
  }, [account]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
  if (!account?.id) throw new Error('Missing account id')
  const numericBalance = Number(String(balance).replace(/[^0-9.-]+/g, '')) || 0
  const { error } = await supabase.from('trading_accounts').update({ balance: numericBalance }).eq('id', account.id)
        if (error) throw error
        toast({ title: "Account updated", description: "Your account has been updated successfully." });
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
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update account information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Balance</Label>
              <Input
                id="balance"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
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