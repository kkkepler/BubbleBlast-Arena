"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock, Target, TrendingUp, Zap, Aperture, Award } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogDescription, SimpleDialogFooter } from "@/components/ui/simple-dialog";

type Props = { isOpen: boolean; onContinue: () => void; shots: number; accuracy: number; bestCombo: number; bubblesPopped: number; timeSpent: number; };

const StatRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-2xl border">
    <span className="flex items-center gap-3 text-muted-foreground font-semibold">
      {icon}{label}
    </span>
    <span className="font-black text-xl">{value}</span>
  </div>
);

const LevelCompleteStats: React.FC<Props> = ({ isOpen, onContinue, shots, accuracy, bestCombo, bubblesPopped, timeSpent }) => {
  const { t } = useI18n();
  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <SimpleDialog open={isOpen} onOpenChange={(o) => !o && onContinue()} className="sm:max-w-md">
      <div>
        <SimpleDialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Award className="w-12 h-12 text-primary" />
          </div>
          <SimpleDialogTitle className="text-center text-2xl font-black uppercase">
            {t('levelComplete.title')}
          </SimpleDialogTitle>
          <SimpleDialogDescription className="text-center">
            {t('levelComplete.description')}
          </SimpleDialogDescription>
        </SimpleDialogHeader>
        <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto px-1">
          <StatRow icon={<Clock className="h-5 w-5 text-primary" />} label={t('levelComplete.time')} value={formatTime(timeSpent)} />
          <StatRow icon={<Target className="h-5 w-5 text-primary" />} label={t('levelComplete.shots')} value={shots} />
          <StatRow icon={<TrendingUp className="h-5 w-5 text-primary" />} label={t('levelComplete.accuracy')} value={`${accuracy}%`} />
          <StatRow icon={<Zap className="h-5 w-5 text-primary" />} label={t('levelComplete.bestCombo')} value={`x${bestCombo}`} />
          <StatRow icon={<Aperture className="h-5 w-5 text-primary" />} label={t('levelComplete.bubblesPopped')} value={bubblesPopped} />
        </div>
        <SimpleDialogFooter className="pt-2">
          <Button size="lg" className="w-full h-14 text-xl font-bold rounded-2xl shadow-xl active:scale-95 transition-transform" onClick={onContinue}>
            {t('levelComplete.continue')}
          </Button>
        </SimpleDialogFooter>
      </div>
    </SimpleDialog>
  );
};

export default LevelCompleteStats;
