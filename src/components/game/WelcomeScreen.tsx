"use client";
import React, { useEffect, useState } from 'react';
import { User, Loader2, Sparkles, Play, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import GridBackground from './GridBackground';

type Props = {
onGuestLogin: () => void;
onSyncLogin: () => void;
isPlatformReady: boolean;
isLoading: boolean;
error: string | null;
};

export default function WelcomeScreen({ onGuestLogin, onSyncLogin, isPlatformReady, isLoading, error }: Props) {
const { t } = useI18n();
const [visible, setVisible] = useState(false);

useEffect(() => {
const tm = setTimeout(() => setVisible(true), 100);
return () => clearTimeout(tm);
}, []);

if (!isPlatformReady && !error) {
return (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
    <Loader2 className="h-16 w-16 animate-spin text-primary" />
  </div>
);
}

return (
<div className={cn(
  "fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-1000",
  visible ? "opacity-100" : "opacity-0"
)}>
  <GridBackground />
  <div className="relative z-10 w-[calc(100%-3rem)] max-w-md mx-auto px-6 py-10 bg-white/70 backdrop-blur-3xl rounded-[3rem] border-4 border-white/50 shadow-[0_32px_64px_rgba(0,0,0,0.15)] text-center">
    <div className="mb-10">
      <div className="flex justify-center mb-6">
        <div className="bg-primary/20 p-5 rounded-full animate-bounce shadow-lg">
          <Sparkles className="w-12 h-12 text-primary fill-current" />
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none text-foreground drop-shadow-sm">
        BubbleBlast
        <span className="block text-primary text-3xl sm:text-4xl mt-1">Arena</span>
      </h1>
      <div className="mt-6 flex justify-center">
        <div className="bg-muted/50 px-4 py-1.5 rounded-full border border-white/50">
          <p className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest opacity-80">
            {t('welcome.subtitle')}
          </p>
        </div>
      </div>
    </div>
    <div className="space-y-4">
      <Button 
        size="lg" 
        className="w-full h-16 sm:h-20 text-xl sm:text-2xl font-black rounded-3xl shadow-[0_8px_24px_rgba(var(--primary),0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 px-4 overflow-hidden" 
        onClick={onSyncLogin} 
        disabled={isLoading || !!error}
      >
        {isLoading ? <Loader2 className="h-8 w-8 animate-spin shrink-0" /> : <Play className="h-8 w-8 fill-current shrink-0" />}
        <span className="truncate">{isLoading ? t('welcome.connecting') : t('welcome.syncButton')}</span>
      </Button>
      <Button 
        variant="ghost" 
        size="lg" 
        className="w-full h-14 sm:h-16 text-lg sm:text-xl font-black rounded-2xl hover:bg-white/40 transition-all text-muted-foreground hover:text-foreground" 
        onClick={onGuestLogin} 
        disabled={isLoading}
      >
        <User className="mr-2 h-6 w-6" />
        {t('welcome.guestButton')}
      </Button>
    </div>
    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">
      <ShieldCheck className="h-4 w-4" />
      {t('welcome.guestWarning')}
    </div>
    {error && (
      <div className="mt-6 p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/20 text-destructive text-sm font-black uppercase">
        {error}
      </div>
    )}
  </div>
</div>
);
}
