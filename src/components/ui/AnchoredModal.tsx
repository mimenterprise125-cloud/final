import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AnchoredModalProps {
  open: boolean;
  origin?: { x: number; y: number } | null;
  onOpenChange: (v: boolean) => void;
  width?: number;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const AnchoredModal: React.FC<AnchoredModalProps> = ({ open, origin, onOpenChange, width = 520, title, description, children }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>(() => {
    const w = Math.min(width, window.innerWidth - 64);
    const leftCenter = origin ? origin.x : window.innerWidth / 2;
    const leftEdge = Math.min(Math.max(Math.round(leftCenter - w / 2), 12), Math.max(12, window.innerWidth - w - 12));
    const navEl = document.querySelector("header");
    const navBottom = navEl ? Math.round(navEl.getBoundingClientRect().bottom) : 64;
    const initialTop = Math.min(Math.max(navBottom + 8, 12), Math.max(12, window.innerHeight - 220 - 12));
    return { left: leftEdge, top: initialTop };
  });

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const w = Math.min(width, window.innerWidth - 64);
      const leftCenter = origin ? origin.x : window.innerWidth / 2;
      const leftEdge = Math.min(Math.max(Math.round(leftCenter - w / 2), 12), Math.max(12, window.innerWidth - w - 12));

      const el = cardRef.current;
      const height = el ? el.offsetHeight : 220;
      const navEl = document.querySelector("header");
      const navBottom = navEl ? Math.round(navEl.getBoundingClientRect().bottom) : 64;
      const minTop = Math.max(12, navBottom + 8);
      const maxTop = Math.max(12, window.innerHeight - height - 12);
      const top = Math.min(Math.max(minTop, minTop), maxTop);

      setPos({ left: leftEdge, top });
    };

    // measure immediately and on resize
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, origin, width]);

  const cardWidth = Math.min(width, window.innerWidth - 64);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <motion.div
          ref={cardRef}
          style={{ position: "fixed", left: pos.left, top: pos.top, width: cardWidth, zIndex: 60 }}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.26 }}
        >
          <div className="bg-background/30 backdrop-blur-md p-5 rounded-lg border shadow-sm">
            {(title || description) && (
              <DialogHeader>
                {title && <DialogTitle>{title}</DialogTitle>}
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
            )}

            <div className="mt-2 text-sm text-muted-foreground">{children}</div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AnchoredModal;
