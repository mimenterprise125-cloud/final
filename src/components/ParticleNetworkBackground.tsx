import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * ParticleNetworkBackground
 * Stable, single-init particle network for landing / auth pages.
 */

interface NodePoint {
  x: number;
  y: number;
  angle: number;
  radius: number;
  orbitRadius: number;
  speed: number;
}

export default function ParticleNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodes = useRef<NodePoint[]>([]);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const animation = useRef<number | null>(null);

  const NODE_COUNT = 85;
  const CONNECT_DISTANCE = 150;

  const initNodes = (w: number, h: number) => {
    nodes.current = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const r = Math.random() * 1.8 + 0.8; // node size
      const orbit = Math.random() * 40 + 20; // orbital radius
      const a = Math.random() * Math.PI * 2;
      nodes.current.push({
        x: Math.random() * w,
        y: Math.random() * h,
        angle: a,
        radius: r,
        orbitRadius: orbit,
        speed: (Math.random() * 0.003) + 0.0012,
      });
    }
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#070b18");
    gradient.addColorStop(1, "#0c1226");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w/2, h/2, 40, w/2, h/2, 900);
    glow.addColorStop(0, "rgba(0,140,255,0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,w,h);

    const px = (mouse.current.x - w / 2) * 0.02;
    const py = (mouse.current.y - h / 2) * 0.02;

    nodes.current.forEach((n) => {
      n.angle += n.speed;
      n.x += Math.cos(n.angle) * 0.35;
      n.y += Math.sin(n.angle) * 0.35;

      const ox = Math.cos(n.angle) * n.orbitRadius;
      const oy = Math.sin(n.angle) * n.orbitRadius;
      const nx = n.x + ox + px;
      const ny = n.y + oy + py;

      ctx.beginPath();
      ctx.arc(nx, ny, n.radius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,170,255,0.06)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nx, ny, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,200,255,0.92)';
      ctx.fill();
    });

    for (let i = 0; i < nodes.current.length; i++) {
      for (let j = i + 1; j < nodes.current.length; j++) {
        const a = nodes.current[i];
        const b = nodes.current[j];
        const ax = a.x + Math.cos(a.angle) * a.orbitRadius + px;
        const ay = a.y + Math.sin(a.angle) * a.orbitRadius + py;
        const bx = b.x + Math.cos(b.angle) * b.orbitRadius + px;
        const by = b.y + Math.sin(b.angle) * b.orbitRadius + py;
        const dx = ax - bx;
        const dy = ay - by;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DISTANCE) {
          const opacity = 1 - dist / CONNECT_DISTANCE;
          ctx.strokeStyle = `rgba(0,180,255,${Math.max(0, opacity * 0.5)})`;
          ctx.lineWidth = opacity * 1.2;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }
    }
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFrame(ctx, canvas.width, canvas.height);
    animation.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initNodes(canvas.width, canvas.height);
    animation.current = requestAnimationFrame(loop);

    const handleMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes(canvas.width, canvas.height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animation.current) cancelAnimationFrame(animation.current);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    />
  );
}

