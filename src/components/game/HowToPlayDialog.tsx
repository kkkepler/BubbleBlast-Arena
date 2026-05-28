"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { useI18n } from '@/hooks/useI18n';
import { MousePointer2, Target, Crosshair, Palette, Zap, AlertTriangle, ArrowDownToLine } from 'lucide-react';
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogFooter } from "@/components/ui/simple-dialog";

const HowToPlayDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
const { t } = useI18n();
return (
<SimpleDialog open={isOpen} onOpenChange={onClose} className="w-[calc(100%-2rem)] max-w-md rounded-[2.5rem] border-4 p-4 sm:p-6">
  <div>
    <SimpleDialogHeader className="text-center">
      <SimpleDialogTitle className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-primary">
        {t('howToPlay.title')}
      </SimpleDialogTitle>
    </SimpleDialogHeader>
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-start gap-4 p-4 rounded-3xl bg-primary/5 hover:bg-primary/10 transition-colors group">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
          <MousePointer2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        </div>
        <div>
          <h4 className="font-black text-base sm:text-lg">{t('howToPlay.controlsTitle')}</h4>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground leading-snug">{t('howToPlay.controlsDescription')}</p>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 rounded-3xl bg-accent/5 hover:bg-accent/10 transition-colors group">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0 group-hover:-rotate-6 transition-transform">
          <Target className="h-6 w-6 sm:h-7 sm:w-7 text-accent" />
        </div>
        <div>
          <h4 className="font-black text-base sm:text-lg">{t('howToPlay.matchTitle')}</h4>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground leading-snug">{t('howToPlay.matchDescription')}</p>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 rounded-3xl bg-orange-400/5 hover:bg-orange-400/10 transition-colors group">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-400/20 flex items-center justify-center shrink-0 group-hover:translate-y-1 transition-transform">
          <ArrowDownToLine className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
        </div>
        <div>
          <h4 className="font-black text-base sm:text-lg">{t('howToPlay.dropTitle')}</h4>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground leading-snug">{t('howToPlay.dropDescription')}</p>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 rounded-3xl bg-red-400/5 hover:bg-red-400/10 transition-colors group">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-400/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-red-600 animate-pulse" />
        </div>
        <div>
          <h4 className="font-black text-base sm:text-lg">{t('howToPlay.panicTitle')}</h4>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground leading-snug">{t('howToPlay.panicDescription')}</p>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 rounded-3xl bg-yellow-400/5 hover:bg-yellow-400/10 transition-colors group">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-yellow-400/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-600" />
        </div>
        <div>
          <h4 className="font-black text-base sm:text-lg">{t('howToPlay.bonusTitle')}</h4>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground leading-snug">{t('howToPlay.bonusDescription')}</p>
        </div>
      </div>
    </div>
    <SimpleDialogFooter>
      <Button size="lg" className="w-full h-14 sm:h-16 text-xl sm:text-2xl font-black rounded-2xl shadow-xl hover:scale-105 transition-transform" onClick={onClose}>
        {t('howToPlay.close')}
      </Button>
    </SimpleDialogFooter>
  </div>
</SimpleDialog>
);
};
export default HowToPlayDialog;
