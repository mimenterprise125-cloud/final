import React from "react";
import { motion } from "framer-motion";

interface ConnectorProps {
  from: { x: number; y: number };
  to?: { x: number; y: number };
}

const ModalConnector: React.FC<ConnectorProps> = ({ from, to }) => {
  const target = to ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // We will draw a simple SVG line from origin to center, positioned absolutely
  const x = Math.min(from.x, target.x) - 8;
  const y = Math.min(from.y, target.y) - 8;
  const width = Math.abs(dx) + 16;
  const height = Math.abs(dy) + 16;

  const p1 = { x: from.x - x, y: from.y - y };
  const p2 = { x: target.x - x, y: target.y - y };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed top-0 left-0 z-40"
      style={{ left: 0, top: 0 }}
    >
      <svg width={width} height={height} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
        <defs>
          <linearGradient id="connectorGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <motion.line
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke="url(#connectorGradient)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.95 }}
          animate={{ pathLength: 1, opacity: 1 }}
          exit={{ pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.36 }}
        />
      </svg>
    </motion.div>
  );
};

export default ModalConnector;
