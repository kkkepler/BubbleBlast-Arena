"use client";
import React, { useRef, useEffect } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/constants';

interface SoapBubble {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  shimmerPhase: number;
  wobble: number;
  hue: number;
}

const GridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<SoapBubble[]>([]);
  const dimsRef = useRef({ w: GAME_WIDTH, h: GAME_HEIGHT });

  useEffect(() => {
    if (bubblesRef.current.length > 0) return;
    const b: SoapBubble[] = [];
    for (let i = 0; i < 18; i++) {
      const r = 35 + Math.random() * 65;
      b.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        radius: r,
        baseRadius: r,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.25 - Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
        shimmerPhase: Math.random() * Math.PI * 2,
        wobble: Math.random() * Math.PI * 2,
        hue: Math.random() * 360
      });
    }
    bubblesRef.current = b;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      const w = p.clientWidth, h = p.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        dimsRef.current = { w, h };
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    let id: number;
    const anim = (t: number) => {
      const { w, h } = dimsRef.current;
      const sx = w / GAME_WIDTH, sy = h / GAME_HEIGHT, sc = Math.min(sx, sy);
      const ox = (w - GAME_WIDTH * sc) / 2, oy = (h - GAME_HEIGHT * sc) / 2;

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#e3f2fd');
      bg.addColorStop(0.5, '#f5faff');
      bg.addColorStop(1, '#e1f5fe');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(sc, sc);

      bubblesRef.current.forEach(b => {
        b.x += b.vx + Math.sin(t * 0.001 * b.speed + b.phase) * 0.5;
        b.y += b.vy;
        b.shimmerPhase += 0.015;
        b.wobble += 0.025;
        const pulse = 1 + Math.sin(t * 0.0015 + b.phase) * 0.04;
        const currentRadius = b.baseRadius * pulse;

        if (b.x - currentRadius > GAME_WIDTH + 150) b.x = -currentRadius - 150;
        if (b.x + currentRadius < -150) b.x = GAME_WIDTH + currentRadius + 150;
        if (b.y + currentRadius < -150) b.y = GAME_HEIGHT + currentRadius + 150;
        if (b.y - currentRadius > GAME_HEIGHT + 150) b.y = -currentRadius - 150;

        const iridescenceHue = (t * 0.04 + b.hue) % 360;

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(
          b.x - currentRadius * 0.3, b.y - currentRadius * 0.4, currentRadius * 0.05,
          b.x, b.y, currentRadius
        );
        g.addColorStop(0, `hsla(${iridescenceHue}, 80%, 95%, 0.15)`);
        g.addColorStop(0.7, `hsla(${(iridescenceHue + 120) % 360}, 60%, 80%, 0.05)`);
        g.addColorStop(0.92, `hsla(${(iridescenceHue + 240) % 360}, 75%, 85%, 0.25)`);
        g.addColorStop(1, 'rgba(255, 255, 255, 0.45)');
        ctx.fillStyle = g;
        ctx.fill();

        ctx.strokeStyle = `hsla(${iridescenceHue}, 100%, 90%, ${0.35 + Math.sin(b.shimmerPhase) * 0.15})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(
          b.x - currentRadius * 0.4,
          b.y - currentRadius * 0.4,
          currentRadius * 0.35,
          currentRadius * 0.18,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x + currentRadius * 0.45, b.y + currentRadius * 0.45, currentRadius * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      id = requestAnimationFrame(anim);
    };

    id = requestAnimationFrame(anim);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 z-0 pointer-events-none" />;
};

export default GridBackground;
