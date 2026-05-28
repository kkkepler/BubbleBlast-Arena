import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type React from "react";
import { COLORS, STONE_BUBBLE } from "./constants";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

function shadeColor(color: string, percent: number) {
  if (color.length !== 7 || color[0] !== '#') return color;
  const f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent;
  const R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
  return `#${(0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1)}`;
}

export function getBubbleCanvasStyle(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, diameter: number, theme: 'light' | 'dark'): void {
  if (!color) return;
  
  // Каменные пузыри рисуем по-особенному
  if (color === STONE_BUBBLE) {
    const radius = diameter / 2, bubbleX = x + radius, bubbleY = y + radius;
    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#888888';
    ctx.fill();
    ctx.fillStyle = '#666666';
    ctx.font = `${radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💎', bubbleX, bubbleY);
    ctx.restore();
    return;
  }
  
  const radius = diameter / 2, bubbleX = x + radius, bubbleY = y + radius;
  ctx.save();
  if (theme === 'dark') { ctx.shadowColor = color !== STONE_BUBBLE ? color : 'rgba(255,255,255,0.3)'; ctx.shadowBlur = 8; }
  else { ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4; }
  const baseColor = color === 'bomb' ? '#333333' : color;
  const lightShade = theme === 'dark' ? 0.7 : 0.5, darkShade = theme === 'dark' ? -0.35 : -0.5;
  const bodyGradient = ctx.createRadialGradient(bubbleX, bubbleY, 0, bubbleX, bubbleY, radius);
  bodyGradient.addColorStop(0, shadeColor(baseColor, lightShade)); 
  bodyGradient.addColorStop(0.5, baseColor); 
  bodyGradient.addColorStop(1, shadeColor(baseColor, darkShade));
  ctx.beginPath(); ctx.arc(bubbleX, bubbleY, radius, 0, Math.PI * 2); ctx.fillStyle = bodyGradient; ctx.fill();
  if (theme === 'dark') { ctx.beginPath(); ctx.arc(bubbleX, bubbleY, radius - 0.5, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(bubbleX - radius * 0.4, bubbleY - radius * 0.4, radius * 0.15, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
  ctx.restore();
}

export function dropStyle(color: string, theme: 'light' | 'dark'): React.CSSProperties {
  if (!color) return {};
  
  if (color === STONE_BUBBLE) {
    return { 
      borderRadius: '50%', 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      background: '#888888',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
    };
  }
  
  const boxShadow = theme === 'dark' ? `0 0 8px ${color !== STONE_BUBBLE ? color : 'rgba(255,255,255,0.3)'}` : '3px 3px 6px rgba(0,0,0,0.25)';
  const baseColor = color === 'bomb' ? '#333333' : color;
  const lightShade = theme === 'dark' ? 0.7 : 0.5, darkShade = theme === 'dark' ? -0.35 : -0.5;
  const body = `radial-gradient(circle at 50% 50%, ${shadeColor(baseColor, lightShade)}, ${baseColor} 50%, ${shadeColor(baseColor, darkShade)} 100%)`;
  const highlight = 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 15%)';
  
  return { borderRadius: '50%', position: 'relative', width: '100%', height: '100%', boxShadow, background: `${highlight}, ${body}` };
}