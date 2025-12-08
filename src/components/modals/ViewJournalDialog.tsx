import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface ViewJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: any;
}

export const ViewJournalDialog = ({ open, onOpenChange, entry }: ViewJournalDialogProps) => {
  if (!entry) return null;

  const timestamp = entry.entry_at || entry.executed_at || entry.created_at;
  const date = timestamp ? new Date(timestamp) : null;
  const realized = Number(entry.realized_amount ?? entry.realized_points ?? 0);
  const isWin = realized > 0;
  const isLoss = realized < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong w-full max-w-3xl sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-hidden border border-border/40 p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            {entry.symbol} Trade
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {date ? date.toLocaleString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-150px)] overflow-y-auto space-y-4 sm:space-y-6 pr-3">
          
          {/* Trade Summary - Key Metrics */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
              <p className="text-xs text-muted-foreground font-medium">Direction</p>
              <p className="text-sm sm:text-base font-bold mt-1">{entry.direction || '—'}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
              <p className="text-xs text-muted-foreground font-medium">Session</p>
              <p className="text-sm sm:text-base font-bold mt-1">{entry.session || '—'}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
              <p className="text-xs text-muted-foreground font-medium">Setup</p>
              <p className="text-xs sm:text-sm font-bold mt-1 line-clamp-2">{Array.isArray(entry.setup) ? entry.setup.join(', ') : (entry.setup || '—')}</p>
            </Card>
            
            <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
              <p className="text-xs text-muted-foreground font-medium">Stop Loss</p>
              <p className="text-sm sm:text-base font-bold text-rose-400 mt-1">{entry.stop_loss_points || entry.stop_loss_price || '—'}</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
              <p className="text-xs text-muted-foreground font-medium">Target</p>
              <p className="text-sm sm:text-base font-bold text-emerald-400 mt-1">{entry.target_points || entry.target_price || '—'}</p>
            </Card>
            <Card className={`p-3 sm:p-4 border-border/30 ${isWin ? 'bg-emerald-500/10 border-emerald-500/30' : isLoss ? 'bg-rose-500/10 border-rose-500/30' : 'bg-background/40'}`}>
              <p className="text-xs text-muted-foreground font-medium">P&L</p>
              <p className={`text-sm sm:text-base font-bold mt-1 ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-foreground'}`}>
                {isWin && '💰 '}{isLoss && '📉 '}{realized >= 0 ? '+' : ''}{realized.toFixed(2)}
              </p>
            </Card>
          </div>

          {/* Trade Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Entry & Exit Times */}
            <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
              <p className="text-xs sm:text-sm font-semibold text-accent mb-2">Entry Time</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {entry.entry_at ? new Date(entry.entry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </p>
            </Card>
            <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
              <p className="text-xs sm:text-sm font-semibold text-accent mb-2">Exit Time</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {entry.exit_at ? new Date(entry.exit_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </p>
            </Card>

            {/* Additional Details */}
            {entry.execution_type && (
              <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
                <p className="text-xs sm:text-sm font-semibold text-accent mb-2">Execution</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{entry.execution_type}</p>
              </Card>
            )}
            {entry.duration && (
              <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
                <p className="text-xs sm:text-sm font-semibold text-accent mb-2">Duration</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{entry.duration}</p>
              </Card>
            )}
          </div>

          {/* Notes Section */}
          {entry.notes && (
            <div>
              <p className="text-xs sm:text-sm font-semibold text-accent mb-2">📝 Notes</p>
              <Card className="p-3 sm:p-4 bg-background/40 border-border/30">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {entry.notes}
                </p>
              </Card>
            </div>
          )}

          {/* Screenshots Section */}
          <div>
            <p className="text-xs sm:text-sm font-semibold text-accent mb-2">📸 Screenshots</p>
            {(!entry.screenshot_urls || entry.screenshot_urls.length === 0) ? (
              <Card className="p-4 sm:p-6 bg-background/40 border-border/30 flex items-center justify-center min-h-[100px]">
                <p className="text-xs sm:text-sm text-muted-foreground">No screenshots attached</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {(entry.screenshot_urls || []).map((url: string, idx: number) => (
                  <Card key={idx} className="p-2 sm:p-3 bg-background/40 border-border/30 overflow-hidden">
                    <div className="relative group cursor-pointer">
                      <img 
                        src={url} 
                        alt={`Screenshot ${idx + 1}`} 
                        className="w-full h-32 sm:h-40 object-cover rounded transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 sm:p-2 bg-accent rounded-full hover:bg-accent/80 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a 
                          href={url} 
                          download
                          className="p-1.5 sm:p-2 bg-accent rounded-full hover:bg-accent/80 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Loss Reason (if applicable) */}
          {entry.loss_reason && (
            <div>
              <p className="text-xs sm:text-sm font-semibold text-rose-400 mb-2">⚠️ Loss Reason</p>
              <Card className="p-3 sm:p-4 bg-rose-500/10 border-rose-500/30">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                  {entry.loss_reason}
                </p>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};