"use client";
import React from 'react';
import { Star, Target, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, dropStyle } from '@/lib/utils';
import type { BubbleColor } from '@/lib/game-types';
import { useI18n } from '@/hooks/useI18n';

const StatCard = ({ icon, value, title }: { icon: React.ReactNode; value: React.ReactNode; title: string }) => (
<div className="flex items-center gap-4 p-4 rounded-3xl bg-white/60 backdrop-blur-md border-2 border-white/50 shadow-lg"> 
  <div className="text-primary">{icon}</div> 
  <div className='flex flex-col'> 
    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">{title}</span> 
    <span className="text-2xl font-black leading-tight mt-1">{value}</span> 
  </div> 
</div> 
);

type Props = { score: number; level: number; nextBubble: BubbleColor; onSwap: () => void; shotsUntilDrop: number; shotsBeforeDrop: number; gameStatus: string; theme: 'light' | 'dark' };

const LeftPanel: React.FC<Props> = ({ score, level, nextBubble, onSwap, shotsUntilDrop, shotsBeforeDrop, gameStatus, theme }) => {
const { t } = useI18n();
return (
<aside className="w-60 bg-sidebar/80 backdrop-blur-lg p-6 hidden lg:flex flex-col justify-between border-r-2 shadow-2xl relative z-10"> 
  <div> 
    <div className="space-y-6 pt-4"> 
      <StatCard icon={<Target className="w-8 h-8" />} value={level} title={t('leftPanel.level')} /> 
      <StatCard icon={<Star className="w-8 h-8 text-yellow-400 fill-current" />} value={score} title={t('leftPanel.score')} /> 
    </div> 
    <div className="mt-10"> 
      <h3 className="text-[10px] font-black uppercase text-center text-muted-foreground mb-4 tracking-widest opacity-70">{t('leftPanel.shotsUntilDrop')}</h3> 
      <div className="flex justify-center gap-2"> 
        {[...Array(shotsBeforeDrop)].map((_, i) => ( 
          <div key={i} className={cn("w-4 h-4 rounded-full border-2 transition-all duration-300", i < shotsUntilDrop ? "bg-accent border-accent scale-110 shadow-sm" : "bg-transparent border-border")}></div> 
        ))} 
      </div> 
    </div> 
  </div> 
  <div className="flex flex-col items-center gap-6"> 
    <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-70">{t('leftPanel.next')}</h3> 
    <div className="flex items-center gap-4"> 
      <div className="w-20 h-20 border-4 border-white bg-white/50 backdrop-blur p-1 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.05)]"> 
        {nextBubble && <div style={dropStyle(nextBubble, theme)} />} 
      </div> 
      <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all bg-white hover:bg-white border-2 border-primary/20" onClick={onSwap} disabled={gameStatus !== 'playing'}> 
        <ArrowRightLeft className="w-6 h-6 text-primary" /> 
      </Button> 
    </div> 
  </div> 
</aside> 
); };
export default LeftPanel;
