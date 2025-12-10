import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TradeDetails {
  symbol: string;
  entryPrice?: number;
  exitPrice?: number;
  realizedPoints?: number;
  realizedAmount?: number;
  setup?: string;
  session?: string;
  executionType?: string;
  result?: string;
  win?: boolean;
  notes?: string;
  durationMinutes?: number;
}

interface Screenshot {
  id: string;
  imageUrl: string;
  fileName?: string;
  uploadedAt?: string;
}

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: Screenshot[];
  initialIndex?: number;
  tradeDetails: TradeDetails;
  onDelete?: (screenshotId: string) => Promise<void>;
}

export function ScreenshotModal({
  isOpen,
  onClose,
  screenshots,
  initialIndex = 0,
  tradeDetails,
  onDelete,
}: ScreenshotModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !screenshots.length) return null;

  const current = screenshots[currentIndex];

  const handleNext = () => {
    if (currentIndex < screenshots.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm("Delete this screenshot?")) return;
    setIsDeleting(true);
    try {
      await onDelete(current.id);
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = current.imageUrl;
    link.download = current.fileName || `screenshot-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border/50 px-4 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {tradeDetails.symbol}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Screenshot {currentIndex + 1} of {screenshots.length}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {/* Screenshot Section */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-background/50 rounded-lg border border-border/50 overflow-hidden">
                  <img
                    src={current.imageUrl}
                    alt={`Screenshot ${currentIndex + 1}`}
                    className="w-full h-auto object-contain max-h-96 sm:max-h-full"
                  />
                </div>

                {/* Navigation */}
                {screenshots.length > 1 && (
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="h-9"
                    >
                      <ChevronLeft size={18} />
                    </Button>

                    {/* Thumbnail Gallery */}
                    <div className="flex gap-2 overflow-x-auto flex-1 px-2">
                      {screenshots.map((ss, idx) => (
                        <button
                          key={ss.id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-colors ${
                            idx === currentIndex
                              ? "border-accent"
                              : "border-border/50 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={ss.imageUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={currentIndex === screenshots.length - 1}
                      className="h-9"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                )}

                {/* File Info */}
                {current.fileName && (
                  <p className="text-xs text-muted-foreground">
                    📁 {current.fileName} • {current.uploadedAt && new Date(current.uploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Trade Details Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-foreground">Trade Details</h3>

                  <div className="space-y-3 text-sm">
                    {/* Symbol */}
                    <div className="pb-3 border-b border-border/30">
                      <p className="text-muted-foreground">Symbol</p>
                      <p className="font-medium text-accent">{tradeDetails.symbol}</p>
                    </div>

                    {/* Entry & Exit Prices */}
                    {tradeDetails.entryPrice !== undefined && (
                      <div className="pb-3 border-b border-border/30">
                        <p className="text-muted-foreground">Entry Price</p>
                        <p className="font-medium text-foreground">
                          {tradeDetails.entryPrice.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {tradeDetails.exitPrice !== undefined && (
                      <div className="pb-3 border-b border-border/30">
                        <p className="text-muted-foreground">Exit Price</p>
                        <p className="font-medium text-foreground">
                          {tradeDetails.exitPrice.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* P&L Section */}
                    <div className="pb-3 border-b border-border/30">
                      {tradeDetails.realizedPoints !== undefined && (
                        <>
                          <p className="text-muted-foreground">Realized Points</p>
                          <p
                            className={`font-semibold ${
                              tradeDetails.realizedPoints >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {tradeDetails.realizedPoints >= 0 ? "+" : ""}
                            {tradeDetails.realizedPoints} pts
                          </p>
                        </>
                      )}
                      {tradeDetails.realizedAmount !== undefined && (
                        <p
                          className={`text-xs font-semibold mt-1 ${
                            tradeDetails.realizedAmount >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {tradeDetails.realizedAmount >= 0 ? "+" : ""}
                          ${tradeDetails.realizedAmount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Setup & Session */}
                    {tradeDetails.setup && (
                      <div className="pb-3 border-b border-border/30">
                        <p className="text-muted-foreground">Setup</p>
                        <p className="font-medium text-foreground">
                          {tradeDetails.setup}
                        </p>
                      </div>
                    )}

                    {tradeDetails.session && (
                      <div className="pb-3 border-b border-border/30">
                        <p className="text-muted-foreground">Session</p>
                        <p className="font-medium text-foreground">
                          {tradeDetails.session}
                        </p>
                      </div>
                    )}

                    {/* Execution Type */}
                    {tradeDetails.executionType && (
                      <div className="pb-3 border-b border-border/30">
                        <p className="text-muted-foreground">Execution</p>
                        <p className="font-medium text-foreground">
                          {tradeDetails.executionType}
                        </p>
                      </div>
                    )}

                    {/* Result */}
                    {tradeDetails.result && (
                      <div className="pb-3 border-b border-border/30">
                        <p className="text-muted-foreground">Result</p>
                        <p
                          className={`font-semibold ${
                            tradeDetails.win ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {tradeDetails.result}
                        </p>
                      </div>
                    )}

                    {/* Duration */}
                    {tradeDetails.durationMinutes !== undefined && (
                      <div className="pb-3 border-b border-border/30">
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium text-foreground">
                          {tradeDetails.durationMinutes} min
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {tradeDetails.notes && (
                      <div>
                        <p className="text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm text-foreground bg-background/50 p-2 rounded border border-border/30 max-h-24 overflow-y-auto">
                          {tradeDetails.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-background border-t border-border/50 px-4 sm:px-6 py-4 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-9 flex items-center gap-2"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Download</span>
              </Button>

              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-9 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              )}

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onClose}
                className="h-9"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
