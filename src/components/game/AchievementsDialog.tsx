"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, Medal } from 'lucide-react';
import { achievementsList } from '@/lib/achievements';
import type { PlayerAchievementsState, Achievement } from '@/lib/game-types';
import { useI18n } from '@/hooks/useI18n';
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogFooter } from "@/components/ui/simple-dialog";

interface Props { isOpen: boolean; onClose: () => void; playerAchievements: PlayerAchievementsState; }

const AchievementRow = ({ achievement, progress }: { achievement: Achievement; progress: PlayerAchievementsState[string] }) => {
const { t } = useI18n();
const nextTier = achievement.tiers[progress.currentTier + 1];
const done = !nextTier;
const IconComponent = achievement.icon(done ? progress.currentTier : progress.currentTier + 1).component;

return (
<div className="flex items-start gap-4 p-4 border rounded-xl bg-card/50">
  <IconComponent className="w-8 h-8 text-primary" />
  <div className="flex-1">
    <h4 className="font-bold">{t(achievement.name)}</h4>
    <p className="text-sm text-muted-foreground">{t(achievement.description)}</p>
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{done ? t('achievements.unlocked') : t(nextTier.name)}</span>
        <span>{done ? achievement.tiers[progress.currentTier].goal : progress.progress} / {nextTier?.goal}</span>
      </div>
      <Progress value={done ? 100 : (progress.progress / (nextTier?.goal || 1)) * 100} />
    </div>
  </div>
  <div className="text-yellow-400 font-bold flex items-center gap-1">
    <Star className="w-4 h-4" />
    {done ? achievement.tiers[progress.currentTier].reward.score : nextTier?.reward.score}
  </div>
</div>
);
};

const AchievementsDialog: React.FC<Props> = ({ isOpen, onClose, playerAchievements }) => {
const { t } = useI18n();
return (
<SimpleDialog open={isOpen} onOpenChange={onClose} className="sm:max-w-xl">
  <div>
    <SimpleDialogHeader className="text-center">
      <SimpleDialogTitle className="flex items-center justify-center gap-3 text-3xl font-black">
        <Medal className="h-8 w-8 text-yellow-400" />
        {t('achievements.title')}
      </SimpleDialogTitle>
    </SimpleDialogHeader>
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      {achievementsList.map(ach => <AchievementRow key={ach.id} achievement={ach} progress={playerAchievements[ach.id]} />)}
    </div>
    <SimpleDialogFooter>
      <Button variant="outline" size="lg" className="w-full" onClick={onClose}>
        {t('achievements.close')}
      </Button>
    </SimpleDialogFooter>
  </div>
</SimpleDialog>
);
};
export default AchievementsDialog;
