"use client";
import { Button } from "@/components/ui/button";
import { Crosshair, Star, Sparkles, Video } from "lucide-react";
import type { BonusType, GameStatus } from "@/lib/game-types";
import { useI18n } from "@/hooks/useI18n";
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogDescription, SimpleDialogFooter } from "@/components/ui/simple-dialog";

type Props = { isOpen: boolean; onClose: () => void; status: GameStatus; score: number; bombCount: number; onBuyBonus: (bonus: BonusType, cost: number) => void; onNextLevel: () => void; onWatchAd: (bonus: BonusType) => void; }

export default function ShopDialog({ isOpen, onClose, status, score, bombCount, onBuyBonus, onNextLevel, onWatchAd }: Props) {
const { t } = useI18n();
const isEnd = status === 'shop';
const bombCost = Math.max(1, Math.floor(score * 0.10));

return (
<SimpleDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} className="w-[calc(100%-2rem)] max-w-lg">
  <div>
    <SimpleDialogHeader>
      {isEnd ? (
        <>
          <Sparkles className="w-20 h-20 mx-auto text-primary" />
          <SimpleDialogTitle className="text-center">{t('shop.levelCompleteTitle')}</SimpleDialogTitle>
          <SimpleDialogDescription className="text-center">{t('shop.levelCompleteDescription')}</SimpleDialogDescription>
        </>
      ) : (
        <SimpleDialogTitle className="text-center">{t('shop.title')}</SimpleDialogTitle>
      )}
    </SimpleDialogHeader>
    <div className="text-center mb-4">
      <p className="text-5xl font-black text-primary">
        <Star className="w-10 h-10 inline text-yellow-500" /> {score}
      </p>
    </div>
    <div className="space-y-3">
      <div className="flex justify-between items-center p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-4">
          <Crosshair className="w-10 h-10 text-primary" />
          <div>
            <h4 className="font-bold">{t('shop.bombName')}</h4>
            <p className="text-sm text-muted-foreground">{t('shop.bombDescription')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">{bombCost} <Star className="w-4 h-4 inline text-yellow-500" /></p>
          <p className="text-xs text-muted-foreground">{bombCount}/10</p>
          <Button size="sm" className="mt-1" disabled={score < bombCost || bombCount >= 10} onClick={() => onBuyBonus('bomb', bombCost)}>
            {t('shop.buy')}
          </Button>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t text-center">
      <p className="font-bold mb-2">{t('shop.freeBonusesTitle')}</p>
      <div className="flex gap-2 justify-center">
        <Button variant="secondary" onClick={() => onWatchAd('bomb')}>
          <Video className="w-4 h-4 mr-1" />{t('shop.bombName')}
        </Button>
      </div>
    </div>
    <SimpleDialogFooter>
      {isEnd ? (
        <Button size="lg" className="w-full" onClick={onNextLevel}>{t('shop.nextLevel')}</Button>
      ) : (
        <Button size="lg" variant="outline" className="w-full" onClick={onClose}>{t('shop.continue')}</Button>
      )}
    </SimpleDialogFooter>
  </div>
</SimpleDialog>
);
}