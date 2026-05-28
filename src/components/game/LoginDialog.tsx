'use client';
import { Button } from "@/components/ui/button";
import { Cloud, LogIn, Trophy, Loader2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogDescription, SimpleDialogFooter } from "@/components/ui/simple-dialog";

type Props = { isOpen: boolean; onGuestLogin: () => void; onConfirmLogin: () => void; onOpenChange: (open: boolean) => void; isProcessing?: boolean; isAlreadyAuthorized?: boolean; isPlatformReady?: boolean; };

export default function LoginDialog({ isOpen, onGuestLogin, onConfirmLogin, onOpenChange, isProcessing = false, isPlatformReady = true }: Props) {
const { t } = useI18n();
return (
<SimpleDialog open={isOpen} onOpenChange={onOpenChange} className="sm:max-w-[450px]">
  <div>
    <SimpleDialogHeader className="text-center">
      <SimpleDialogTitle className="flex items-center justify-center gap-2 text-xl">
        <LogIn className="w-6 h-6" />
        {t('loginDialog.title')}
      </SimpleDialogTitle>
      <SimpleDialogDescription className="pt-2 text-base">
        {t('loginDialog.description')}
      </SimpleDialogDescription>
    </SimpleDialogHeader>
    <div className="py-4 space-y-4">
      <div className="flex items-start gap-3">
        <Cloud className="h-5 w-5 text-primary mt-1" />
        <p className="text-muted-foreground">{t('loginDialog.benefitCloud')}</p>
      </div>
      <div className="flex items-start gap-3">
        <Trophy className="h-5 w-5 text-primary mt-1" />
        <p className="text-muted-foreground">{t('loginDialog.benefitLeaderboard')}</p>
      </div>
    </div>
    <p className="text-center text-sm text-muted-foreground">{t('loginDialog.guestInfo')}</p>
    <SimpleDialogFooter className="flex-col gap-2 pt-4">
      <Button size="lg" onClick={onConfirmLogin} disabled={isProcessing || !isPlatformReady} className="w-full">
        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
        {isProcessing ? t('loginDialog.processing') : t('loginDialog.loginButton')}
      </Button>
      <Button size="lg" variant="ghost" onClick={onGuestLogin} disabled={isProcessing}>
        {t('loginDialog.cancelButton')}
      </Button>
    </SimpleDialogFooter>
  </div>
</SimpleDialog>
);
}
