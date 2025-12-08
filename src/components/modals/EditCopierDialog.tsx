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

interface EditCopierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: any;
}

export const EditCopierDialog = ({ open, onOpenChange, mapping }: EditCopierDialogProps) => {
  const { toast } = useToast();
  const [multiplier, setMultiplier] = useState("");

  useEffect(() => {
    if (mapping) {
      setMultiplier(mapping.multiplier);
    }
  }, [mapping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
  if (!mapping?.id) throw new Error('Missing mapping id')
  const { error } = await supabase.from('copy_rules').update({ multiplier }).eq('id', mapping.id)
        if (error) throw error
        toast({ title: "Mapping updated", description: "Trade copier mapping has been updated successfully." });
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
          <DialogTitle>Edit Copier Mapping</DialogTitle>
          <DialogDescription>
            Update trade copier settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="multiplier">Multiplier</Label>
              <Input
                id="multiplier"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                type="number"
                step="0.1"
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