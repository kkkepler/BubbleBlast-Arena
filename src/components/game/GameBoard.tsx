"use client";
import React, { useRef, useEffect, useCallback } from 'react';
import { BUBBLE_DIAMETER, BUBBLE_RADIUS, GAME_WIDTH, GAME_HEIGHT, GRID_COLS, GRID_ROWS } from '@/lib/constants';
import type { GameState, PoppedBubble, Trajectory, Particle, BubbleColor } from '@/lib/game-types';
import { cn, getBubbleCanvasStyle, dropStyle } from "@/lib/utils";
import { getBubbleCenterPosition } from '@/lib/game-logic';
import GridBackground from './GridBackground';

const drawBubble = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, theme: 'light' | 'dark', d: number = BUBBLE_DIAMETER) => {
  if (!color) return;
  getBubbleCanvasStyle(ctx, color, x, y, d, theme);
};

type Props = {
  state: GameState;
  poppingBubbles: PoppedBubble[];
  trajectoryPath: Trajectory;
  particlesRef: React.MutableRefObject<Particle[]>;
  shooterData: { position: { x: number; y: number }; color: BubbleColor; diameter: number };
  theme: 'light' | 'dark';
  clearEffectPhase: 'idle' | 'prepare' | 'burst' | 'complete';
  screenFlash: string | null;
};

export default function GameBoard({ state, poppingBubbles, trajectoryPath, particlesRef, shooterData, theme, clearEffectPhase, screenFlash }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const trajRef = useRef(trajectoryPath);
  const themeRef = useRef(theme);
  const shootRef = useRef(shooterData);
  const particlesLocalRef = useRef(particlesRef.current);
  const lastTimeRef = useRef(0);
  const animationIdRef = useRef<number>();

  useEffect(() => { 
    stateRef.current = state; 
  }, [state]);
  
  useEffect(() => { 
    trajRef.current = trajectoryPath; 
  }, [trajectoryPath]);
  
  useEffect(() => { 
    themeRef.current = theme; 
  }, [theme]);
  
  useEffect(() => { 
    shootRef.current = shooterData; 
  }, [shooterData]);
  
  useEffect(() => { 
    particlesLocalRef.current = particlesRef.current; 
  }, [particlesRef.current]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
  }, []);

  // Очистка частиц при размонтировании
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      particlesRef.current = [];
    };
  }, [particlesRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dashOff = 0, ringP = 0;

    const render = (timestamp: number) => {
      const s = stateRef.current;
      const traj = trajRef.current;
      const curTheme = themeRef.current;
      const shoot = shootRef.current;
      const particles = particlesLocalRef.current;
      
      // Delta time для плавной анимации
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dashOff -= 0.7 * deltaTime;
      ringP += 0.08 * deltaTime;

      // Эффект паники
      if (s.panicModeActive) {
        ctx.save();
        ctx.globalAlpha = 0.15 + Math.sin(Date.now() / 150) * 0.1;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.restore();
      }

      // Отрисовка сетки пузырей
      for (let r = 0; r < GRID_ROWS; r++) {
        const row = s.grid[r];
        if (!row) continue;
        const cols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
        for (let c = 0; c < cols; c++) {
          const color = row[c];
          if (color && typeof color === 'string') {
            const { x, y } = getBubbleCenterPosition(r, c);
            drawBubble(ctx, x - BUBBLE_RADIUS, y - BUBBLE_RADIUS, color, curTheme);
          }
        }
      }

      // Отрисовка траектории
      if (s.status === 'playing' && !s.flyingBubble && !s.panicModeActive && traj.points.length > 1 && traj.color && typeof traj.color === 'string') {
        const tc = traj.color as string;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([12, 18]);
        ctx.lineDashOffset = dashOff;
        ctx.strokeStyle = tc;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.moveTo(traj.points[0].x, traj.points[0].y);
        for (let i = 1; i < traj.points.length; i++) ctx.lineTo(traj.points[i].x, traj.points[i].y);
        ctx.stroke();

        if (traj.endBubble?.color) {
          const e = traj.endBubble;
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(e.x + BUBBLE_RADIUS, e.y + BUBBLE_RADIUS, BUBBLE_RADIUS * (1 + Math.sin(ringP * 4) * 0.15), 0, Math.PI * 2);
          ctx.strokeStyle = e.color as string;
          ctx.lineWidth = 4;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Физика и отрисовка частиц (оптимизировано)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Физика с учётом времени
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vy += 0.35 * deltaTime;
        
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.lifespan -= 2.0 * deltaTime;

        if (p.lifespan <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        const opacity = Math.max(0, p.lifespan / 50);
        const radius = Math.max(0.5, p.size * (p.lifespan / 45));
        
        ctx.globalAlpha = opacity;
        
        if (p.type === 'spark') {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, radius);
          ctx.stroke();
        } else if (p.type === 'glow') {
          const grad = ctx.createRadialGradient(p.x - 2, p.y - 2, 0, p.x, p.y, radius);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Отрисовка летящего пузыря
      if (s.flyingBubble?.color && typeof s.flyingBubble.color === 'string') {
        const fb = s.flyingBubble;
        ctx.save();
        ctx.translate(fb.x, fb.y);
        ctx.rotate((fb.angle * Math.PI) / 180);
        ctx.scale(0.85, 1.15);
        drawBubble(ctx, -BUBBLE_RADIUS, -BUBBLE_RADIUS, fb.color as string, curTheme, fb.diameter);
        ctx.restore();
      }

      // Отрисовка снаряда в пушке
      if (s.status === 'playing' && !s.flyingBubble && shoot.color && typeof shoot.color === 'string') {
        drawBubble(ctx, shoot.position.x, shoot.position.y, shoot.color as string, curTheme, shoot.diameter);
      }

      animationIdRef.current = requestAnimationFrame(render);
    };

    animationIdRef.current = requestAnimationFrame(render);
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      <GridBackground />
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="absolute top-0 left-0 z-10 pointer-events-none" />
      
      <div className="absolute left-0 right-0 border-t-4 border-solid border-destructive/40 z-20 pointer-events-none" style={{ top: `${GAME_HEIGHT - BUBBLE_DIAMETER * 2.1}px` }} />
      
      {poppingBubbles.map(({ key, x, y, color, type }) => (
        <div key={key} className={cn("absolute z-20", type === 'fall' ? "animate-fall" : "animate-splat")} style={{ width: `${BUBBLE_DIAMETER}px`, height: `${BUBBLE_DIAMETER}px`, left: `${x}px`, top: `${y}px` }}>
          {color && typeof color === 'string' && <div style={dropStyle(color, theme)} />}
        </div>
      ))}
      
      {state.clearedColor && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <div className={cn(
            "w-48 h-48",
            clearEffectPhase === 'prepare' ? "animate-shake-bubble" : "animate-swell-and-burst"
          )}>
            <div className="w-full h-full rounded-none" style={dropStyle(state.clearedColor.color as string, theme)} />
          </div>
        </div>
      )}
      
      {screenFlash && (
        <div className="absolute inset-0 z-[150] pointer-events-none animate-color-flash" style={{ backgroundColor: screenFlash, opacity: 0.2 }} />
      )}
    </div>
  );
}