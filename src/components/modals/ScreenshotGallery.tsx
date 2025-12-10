import React, { useState } from "react";
import { Camera, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { ScreenshotModal } from "./ScreenshotModal";

interface Screenshot {
  id: string;
  imageUrl: string;
  fileName?: string;
  uploadedAt?: string;
}

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

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  tradeDetails: TradeDetails;
  variant?: "mobile" | "desktop" | "compact";
  onDelete?: (screenshotId: string) => Promise<void>;
}

export function ScreenshotGallery({
  screenshots,
  tradeDetails,
  variant = "desktop",
  onDelete,
}: ScreenshotGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!screenshots.length) {
    return (
      <div className="text-center py-3 sm:py-4 text-muted-foreground text-xs sm:text-sm">
        <Camera size={16} className="mx-auto mb-1 opacity-50" />
        No screenshots
      </div>
    );
  }

  // Mobile variant: Show as action with primary screenshot only
  if (variant === "mobile") {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedIndex(0);
            setIsModalOpen(true);
          }}
          className="relative w-full aspect-square rounded-lg overflow-hidden border border-accent/30 hover:border-accent/60 transition-colors group"
        >
          <img
            src={screenshots[0].imageUrl}
            alt="Trade screenshot"
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-accent/90 p-2 rounded-full">
              <ChevronRight size={18} className="text-white" />
            </div>
          </div>

          {/* Badge for multiple screenshots */}
          {screenshots.length > 1 && (
            <div className="absolute top-2 right-2 bg-accent/90 text-white text-xs px-2 py-1 rounded">
              +{screenshots.length - 1}
            </div>
          )}
        </motion.button>

        <ScreenshotModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          screenshots={screenshots}
          initialIndex={selectedIndex}
          tradeDetails={tradeDetails}
          onDelete={onDelete}
        />
      </>
    );
  }

  // Compact variant: Small thumbnail grid
  if (variant === "compact") {
    return (
      <>
        <div className="flex gap-2 flex-wrap">
          {screenshots.slice(0, 3).map((ss, idx) => (
            <motion.button
              key={ss.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedIndex(idx);
                setIsModalOpen(true);
              }}
              className="w-16 h-16 rounded-lg overflow-hidden border border-border/50 hover:border-accent transition-colors group"
            >
              <img
                src={ss.imageUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
              />
            </motion.button>
          ))}

          {screenshots.length > 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedIndex(3);
                setIsModalOpen(true);
              }}
              className="w-16 h-16 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/20 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <span className="text-sm font-medium">+{screenshots.length - 3}</span>
            </motion.button>
          )}
        </div>

        <ScreenshotModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          screenshots={screenshots}
          initialIndex={selectedIndex}
          tradeDetails={tradeDetails}
          onDelete={onDelete}
        />
      </>
    );
  }

  // Desktop variant: Full width section
  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Camera size={16} className="text-accent" />
          Trade Screenshots
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {screenshots.map((ss, idx) => (
            <motion.button
              key={ss.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedIndex(idx);
                setIsModalOpen(true);
              }}
              className="relative aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-accent transition-colors group"
            >
              <img
                src={ss.imageUrl}
                alt={`Screenshot ${idx + 1}`}
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-accent/90 p-2 rounded-full">
                  <ChevronRight size={16} className="text-white" />
                </div>
              </div>

              {/* Index badge */}
              <div className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-2 py-1 rounded">
                {idx + 1}/{screenshots.length}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <ScreenshotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        screenshots={screenshots}
        initialIndex={selectedIndex}
        tradeDetails={tradeDetails}
        onDelete={onDelete}
      />
    </>
  );
}
