"use client";
import { Frown, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogDescription, SimpleDialogFooter } from "@/components/ui/simple-dialog";
import type { GameStatus } from "@/lib/game-types";
import { useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";

type Props = { status: GameStatus; score: number; onRestart: () => void; onContinueWithAd: () => void };

export default function GameOverDialog({ status, score, onRestart, onContinueWithAd }: Props) {
const { t } = useI18n();
const [isOpen, setIsOpen] = useState(false);

useEffect(() => { setIsOpen(status === "lost"); }, [status]);

return (
<SimpleDialog open={isOpen} onOpenChange={(open) => !open && onRestart()}>
  <div className="text-center">
    <div className="flex justify-center mb-4">
      <Frown className="w-24 h-24 text-destructive" />
    </div>
    <SimpleDialogTitle className="text-3xl">{t('gameOver.title')}</SimpleDialogTitle>
    <SimpleDialogDescription className="text-lg pt-2">
      {t('gameOver.description')}
    </SimpleDialogDescription>
    <div className="text-2xl font-bold mt-4">
      {t('gameOver.score')} {score}
    </div>
    <SimpleDialogFooter className="flex-col gap-2 mt-6">
      <Button variant="secondary" size="lg" className="w-full" onClick={onContinueWithAd}>
        <Video className="mr-2 h-5 w-5" />
        {t('gameOver.continueWithAd')}
      </Button>
      <Button variant="default" size="lg" className="w-full" onClick={onRestart}>
        {t('gameOver.restart')}
      </Button>
    </SimpleDialogFooter>
  </div>
</SimpleDialog>
);
}
