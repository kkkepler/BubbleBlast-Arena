"use client";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Star, Check } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import type { UnlockedAchievement } from '@/lib/game-types';
import { cn } from '@/lib/utils';
import { SimpleDialog } from "@/components/ui/simple-dialog";

type Props = {
  achievement: UnlockedAchievement | null;
  onClose: () => void;
  onEmitParticles: () => void;
  isClosing: boolean;
};

const AchievementUnlockedDialog = ({ achievement, onClose, onEmitParticles }: Props) => {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const isOpen = !!achievement;

  useEffect(() => {
    if (isOpen) {
      const tm = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(tm);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!achievement) return null;

  const IconData = achievement.icon(achievement.tiers.findIndex(tier => tier.goal === achievement.unlockedTier.goal));
  const IconComponent = IconData.component;

  const handleConfirm = () => {
    onEmitParticles();
    onClose();
  };

  return (
    <SimpleDialog open={isOpen} onOpenChange={(o) => !o && onClose()} className="max-w-xs">
      <div className={cn("rounded-3xl border-4 border-primary/30 bg-card p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-all duration-500", show ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 rotate-12")}>
        <div className="flex flex-col items-center">
          <div className="relative mb-6 flex justify-center w-full h-16">
            <div className="animate-bounce absolute -top-16 h-32 w-32 rounded-full border-4 border-white bg-primary p-4 flex items-center justify-center shadow-xl">
              <IconComponent className={cn("h-16 w-16 text-white")} />
            </div>
          </div>
          <h2 className="mt-8 text-sm font-black uppercase tracking-widest text-primary animate-pulse">{t('achievements.toastTitle')}</h2>
          <h3 className="text-3xl font-black mt-2 leading-tight">{t(achievement.name)}</h3>
          <p className="text-xl font-bold text-accent mt-1">{t(achievement.unlockedTier.name)}</p>
          <div className="my-6 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <p className="text-sm font-bold text-muted-foreground uppercase">{t('achievements.reward')}</p>
          <div className="mt-2 flex items-center justify-center gap-3 text-4xl font-black text-yellow-400">
            <Star className="h-10 w-10 fill-current" />
            <span>+{achievement.unlockedTier.reward.score}</span>
          </div>
          <Button size="lg" className="mt-8 w-full h-16 text-2xl font-black rounded-2xl shadow-lg transform active:scale-95 transition-all" onClick={handleConfirm}>
            <Check className="mr-2 h-6 w-6 stroke-[4]" />
            {t('game.ok')}
          </Button>
        </div>
      </div>
    </SimpleDialog>
  );
};
export default AchievementUnlockedDialog;
