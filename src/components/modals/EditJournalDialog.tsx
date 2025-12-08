import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";

interface EditJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: any;
}

export const EditJournalDialog = ({ open, onOpenChange, entry }: EditJournalDialogProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (entry) {
      setForm({
        symbol: entry.symbol ?? '',
        date: entry.executed_at ? entry.executed_at.slice(0,10) : '',
        time: entry.executed_at ? entry.executed_at.slice(11,16) : '',
        session: entry.session ?? 'London',
        setup: entry.setup ?? '',
        execution_type: entry.execution_type ?? '',
        stop_loss_points: entry.stop_loss_points ?? 0,
        target_points: entry.target_points ?? 0,
        direction: entry.direction ?? 'Buy',
        result: entry.result ?? 'TP',
        duration_minutes: entry.duration_minutes ?? 0,
        notes: entry.notes ?? '',
      })
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        if (!entry?.id) throw new Error('Missing entry id')

        const stop = Number(form.stop_loss_points || 0)
        const target = Number(form.target_points || 0)
        let realized = 0
        if (form.result === 'TP') realized = target
        else if (form.result === 'SL') realized = -stop

        const payload: any = {
          symbol: form.symbol || null,
          executed_at: form.date && form.time ? new Date(`${form.date}T${form.time}:00Z`).toISOString() : null,
          session: form.session,
          setup: form.setup,
          execution_type: form.execution_type,
          stop_loss_points: stop || null,
          target_points: target || null,
          direction: form.direction,
          result: form.result,
          realized_points: realized,
          win: form.result === 'TP',
          duration_minutes: Number(form.duration_minutes) || null,
          notes: form.notes || null,
          updated_at: new Date().toISOString(),
        }

        const { error } = await supabase.from('journals').update(payload).eq('id', entry.id)
        if (error) throw error
        toast({ title: "Entry updated", description: "Journal entry has been updated successfully." });
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
          <DialogTitle>Edit Journal Entry</DialogTitle>
          <DialogDescription>
            Update trade notes
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes || ''}
                onChange={(e) => setForm((s: any) => ({ ...s, notes: e.target.value }))}
                rows={6}
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