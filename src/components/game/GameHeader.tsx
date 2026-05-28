"use client";
import React from 'react';
import { Star, Target, Settings, Trophy, Store, Volume2, VolumeX, Medal, RefreshCcw, LogIn, LogOut, HelpCircle, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/simple-avatar";
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';

type Props = {
score: number; level: number;
onShowLeaderboard: () => void; onShowShop: () => void; onShowAchievements: () => void; onShowHowToPlay: () => void;
className?: string; isMuted: boolean; onMuteToggle: () => void;
onRestartLevel: () => void; isAuthorized: boolean; onLogin: () => void;
playerInfo: { name: string; avatar: string } | null; onLogout: () => void;
};

const StatCard = ({ icon, value, title }: { icon: React.ReactElement; value: React.ReactNode; title: string }) => (
<div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/60 backdrop-blur shadow-sm border border-white/50"> 
  <div className="text-primary animate-pulse">{icon}</div> 
  <div className="flex flex-col"> 
    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{title}</span> 
    <p className="text-lg font-black leading-none mt-0.5">{value}</p> 
  </div> 
</div> 
);

const GameHeader = ({ score, level, onShowLeaderboard, onShowShop, onShowAchievements, onShowHowToPlay, className, isMuted, onMuteToggle, onRestartLevel, isAuthorized, onLogin, playerInfo, onLogout }: Props) => {
const { t, setLanguage, language } = useI18n();
const [isMenuOpen, setIsMenuOpen] = React.useState(false);

return (
<header className={cn("relative w-full p-3 z-40 bg-white/80 backdrop-blur-md border-b-2 shrink-0", className)}> 
  <div className="flex items-center justify-between"> 
    <div className="flex items-center gap-2"> 
      <StatCard icon={<Target className="w-5 h-5" />} value={level} title={t('header.level')} /> 
      <StatCard icon={<Star className="w-5 h-5 text-yellow-500 fill-current" />} value={score} title={t('header.score')} /> 
    </div> 
    <div className="flex items-center gap-2"> 
      <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-sm hover:scale-105" onClick={onShowShop}> 
        <Store className="h-6 w-6 text-primary" /> 
      </Button> 
      <div className="relative">
        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-sm hover:rotate-45 transition-transform" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Settings className="h-6 w-6" />
        </Button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-popover border shadow-lg p-2 z-50">
            {isAuthorized && playerInfo && (
              <>
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-primary/5 mb-2">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src={playerInfo.avatar} />
                    <AvatarFallback className="font-black">{playerInfo.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">{t('rightPanel.loggedInAs')}</span>
                    <span className="font-black truncate block text-base">{playerInfo.name}</span>
                  </div>
                </div>
                <hr className="my-1" />
              </>
            )}
            <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md" onClick={onShowHowToPlay}>
              <HelpCircle className='inline mr-3 h-5 w-5' />{t('header.howToPlay')}
            </div>
            <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md" onClick={onShowAchievements}>
              <Medal className='inline mr-3 h-5 w-5' />{t('header.achievements')}
            </div>
            <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md" onClick={onShowLeaderboard}>
              <Trophy className='inline mr-3 h-5 w-5' />{t('header.leaderboard')}
            </div>
            <hr className="my-1" />
            <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md" onClick={onRestartLevel}>
              <RefreshCcw className="inline mr-3 h-5 w-5" />{t('header.restartLevel')}
            </div>
            <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md" onClick={onMuteToggle}>
              {isMuted ? <VolumeX className="inline mr-3 h-5 w-5" /> : <Volume2 className="inline mr-3 h-5 w-5" />}
              {isMuted ? t('header.unmute') : t('header.mute')}
            </div>
            <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md" onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}>
              <Languages className="inline mr-3 h-5 w-5" />{language === 'ru' ? 'English' : 'Русский'}
            </div>
            <hr className="my-1" />
            {!isAuthorized ? (
              <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md text-primary" onClick={onLogin}>
                <LogIn className="inline mr-3 h-5 w-5" />{t('header.login')}
              </div>
            ) : (
              <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md text-destructive" onClick={onLogout}>
                <LogOut className="inline mr-3 h-5 w-5" />{t('header.logout')}
              </div>
            )}
          </div>
        )}
      </div>
    </div> 
  </div> 
</header> 
); };
export default GameHeader;
