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
import { Download, ExternalLink, Info } from "lucide-react";
import { formatRealizedEntry } from "@/lib/display-utils";
import { useModalBackButton } from "@/hooks/useModalBackButton";
import { useState } from "react";

const scrollHideStyles = `
  .view-dialog-scroll::-webkit-scrollbar {
    display: none;
  }
  .view-dialog-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`;

interface ViewJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: any;
}

export const ViewJournalDialog = ({ open, onOpenChange, entry }: ViewJournalDialogProps) => {
  // Handle back button to close modal instead of navigating
  useModalBackButton(open, () => onOpenChange(false));
  const [showSetupDetails, setShowSetupDetails] = useState(false);
  
  if (!entry) return null;

  const timestamp = entry.entry_at || entry.executed_at || entry.created_at;
  const date = timestamp ? new Date(timestamp) : null;
  const realized = Number(entry.realized_amount ?? entry.realized_points ?? 0);
  const isWin = realized > 0;
  const isLoss = realized < 0;

  return (
    <>
      <style>{scrollHideStyles}</style>
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

          <div className="max-h-[calc(90vh-150px)] overflow-y-auto view-dialog-scroll space-y-3 sm:space-y-4 pr-3">
          
          {/* Top Row - Metrics Cards (1 per row on mobile, 2-3 per row on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <Card className="p-2 sm:p-3 bg-background/40 border-border/30">
              <p className="text-xs text-muted-foreground font-medium">Direction</p>
              <p className="text-xs sm:text-sm font-bold mt-1">{entry.direction || '—'}</p>
            </Card>
            <Card className="p-2 sm:p-3 bg-background/40 border-border/30">
              <p className="text-xs text-muted-foreground font-medium">Session</p>
              <p className="text-xs sm:text-sm font-bold mt-1">{entry.session || '—'}</p>
            </Card>
            <Card className="p-2 sm:p-3 bg-background/40 border-border/30">
              <p className="text-xs text-muted-foreground font-medium">Result</p>
              <p className="text-xs sm:text-sm font-bold mt-1">{entry.result || '—'}</p>
            </Card>
          </div>

          {/* Setup Card - Full Width with Clickable Details */}
          <button
            onClick={() => setShowSetupDetails(!showSetupDetails)}
            className="w-full text-left"
          >
            <Card className="p-2 sm:p-3 bg-background/40 border-border/30 hover:border-accent/50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Setup</p>
                  <p className="text-xs sm:text-sm font-bold mt-1 truncate">{Array.isArray(entry.setup) ? entry.setup.join(', ') : (entry.setup || '—')}</p>
                </div>
                <Info className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
              </div>
            </Card>
          </button>

          {/* Setup Details Expandable Section */}
          {showSetupDetails && entry.setup && (
            <Card className="p-3 sm:p-4 bg-accent/5 border border-accent/20">
              <p className="text-xs sm:text-sm font-semibold text-accent mb-2">Setup Details</p>
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {typeof entry.setup === 'string' ? entry.setup : Array.isArray(entry.setup) ? entry.setup.join('\n') : '—'}
              </p>
            </Card>
          )}

          {/* P&L Card - Full Width */}
          <Card className={`p-2 sm:p-3 border-border/30 ${isWin ? 'bg-emerald-500/10 border-emerald-500/30' : isLoss ? 'bg-rose-500/10 border-rose-500/30' : 'bg-background/40'}`}>
            <p className="text-xs text-muted-foreground font-medium">P&L Result</p>
            <p className={`text-lg sm:text-2xl font-bold mt-2 ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-foreground'}`}>
              {isWin && '💰 '}{isLoss && '📉 '}{formatRealizedEntry(entry)}
            </p>
          </Card>

          {/* Evidence & Notes Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Evidence Section */}
            <div>
              <p className="text-xs sm:text-sm font-semibold text-accent mb-2">📸 Evidence</p>
              {(!entry.screenshot_urls || entry.screenshot_urls.length === 0) ? (
                <Card className="p-4 sm:p-6 bg-background/40 border-border/30 flex items-center justify-center min-h-[120px]">
                  <p className="text-xs sm:text-sm text-muted-foreground">No evidence attached</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {(entry.screenshot_urls || []).map((url: string, idx: number) => (
                    <Card key={idx} className="p-2 sm:p-3 bg-background/40 border-border/30 overflow-hidden">
                      <div className="relative group cursor-pointer">
                        <img 
                          src={url} 
                          alt={`Evidence ${idx + 1}`} 
                          className="w-full h-36 sm:h-44 object-cover rounded transition-transform group-hover:scale-105"
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

            {/* Notes Section */}
            <div>
              <p className="text-xs sm:text-sm font-semibold text-accent mb-2">📝 Trade Notes</p>
              {entry.notes ? (
                <Card className="p-3 sm:p-4 bg-background/40 border-border/30 min-h-[120px]">
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {entry.notes}
                  </p>
                </Card>
              ) : (
                <Card className="p-3 sm:p-4 bg-background/40 border-border/30 min-h-[120px] flex items-center justify-center">
                  <p className="text-xs sm:text-sm text-muted-foreground italic">No notes added</p>
                </Card>
              )}
            </div>
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
    </>
  );
};