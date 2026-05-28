"use client"
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/simple-avatar";
import { Crosshair, Store, VolumeX, Volume2, Pause, Play, Settings, Trophy, Medal, RefreshCcw, LogIn, LogOut, HelpCircle, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BonusType, GameStatus } from '@/lib/game-types';
import { useI18n } from '@/hooks/useI18n';

export type RightPanelProps = {
bombCount: number; activeBonus: BonusType | null; onSelectBonus: (bonus: BonusType) => void;
gameStatus: GameStatus; isPaused: boolean; onPauseToggle: () => void; isMuted: boolean; onMuteToggle: () => void;
onShowLeaderboard: () => void; onShowAchievements: () => void; onShowHowToPlay: () => void; onShowShop: () => void;
onRestartLevel: () => void; isAuthorized: boolean; onLogin: () => void;
playerInfo: { name: string; avatar: string } | null; isAdShowing: boolean; onLogout: () => void;
}

const RightPanel = ({ bombCount, activeBonus, onSelectBonus, gameStatus, isPaused, onPauseToggle, isMuted, onMuteToggle, onShowLeaderboard, onShowAchievements, onShowHowToPlay, onShowShop, onRestartLevel, isAuthorized, onLogin, playerInfo, onLogout }: RightPanelProps) => {
const { t, language, setLanguage } = useI18n();
const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

return (
<aside className="w-60 bg-sidebar/80 backdrop-blur-lg p-6 hidden lg:flex flex-col justify-between border-l-2 shadow-2xl relative z-10"> 
  <div> 
    <h2 className="text-[10px] font-black uppercase text-center mb-8 tracking-widest text-muted-foreground/60">{t('rightPanel.bonuses')}</h2> 
    <div className="space-y-6"> 
      <Button 
        variant={activeBonus === 'bomb' ? 'default' : 'secondary'} 
        className={cn("w-full h-20 justify-start p-4 rounded-3xl relative transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm", activeBonus === 'bomb' && "ring-4 ring-primary shadow-xl scale-105")} 
        onClick={() => onSelectBonus('bomb')} 
        disabled={gameStatus !== 'playing' || bombCount === 0}
      > 
        <div className="flex items-center gap-3"> 
          <div className={cn("p-2 rounded-2xl", activeBonus === 'bomb' ? "bg-white/20" : "bg-primary/10")}> 
            <Crosshair className="w-7 h-7" />
          </div> 
          <span className="text-lg font-black">{t('rightPanel.bomb')}</span> 
        </div> 
        <Badge className={cn("absolute -top-2 -right-2 h-7 min-w-7 text-base font-black rounded-2xl flex items-center justify-center p-0", activeBonus === 'bomb' ? "bg-accent" : "bg-primary shadow-md")}>
          {bombCount}
        </Badge> 
      </Button> 
    </div> 
  </div> 
  <div className="space-y-3"> 
    {isAuthorized && playerInfo ? ( 
      <div className="flex items-center gap-3 p-4 rounded-3xl bg-white/60 backdrop-blur-md border-2 border-white/50 shadow-md mb-4"> 
        <Avatar className="h-10 w-10 border-2 border-primary"> 
          <AvatarImage src={playerInfo.avatar} /> 
          <AvatarFallback className="font-black text-lg">{playerInfo.name?.[0]}</AvatarFallback> 
        </Avatar> 
        <div className="min-w-0 flex-1"> 
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider leading-none">{t('rightPanel.loggedInAs')}</p> 
          <p className="font-black text-sm truncate leading-tight mt-1">{playerInfo.name}</p> 
        </div> 
      </div> 
    ) : ( 
      <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black text-base hover:bg-primary/5 mb-4 shadow-sm" onClick={onLogin}> 
        <LogIn className="mr-3 h-5 w-5" />{t('header.login')} 
      </Button> 
    )} 
    <Button variant="ghost" className="w-full justify-start h-12 rounded-2xl font-black text-sm hover:bg-primary/5 transition-all group" onClick={onShowShop}> 
      <Store className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />{t('rightPanel.shop')} 
    </Button> 
    <Button variant="ghost" className="w-full justify-start h-12 rounded-2xl font-black text-sm hover:bg-primary/5 transition-all group" onClick={onPauseToggle}> 
      {isPaused ? <Play className="mr-3 h-5 w-5 group-hover:scale-110" /> : <Pause className="mr-3 h-5 w-5 group-hover:scale-110" />} 
      {isPaused ? t('rightPanel.resume') : t('rightPanel.pause')} 
    </Button> 
    <div className="relative">
      <Button variant="ghost" className="w-full justify-start h-12 rounded-2xl font-black text-sm hover:bg-primary/5 group" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
        <Settings className="mr-3 h-5 w-5 group-hover:rotate-45 transition-transform" />{t('rightPanel.settings')}
      </Button>
      {isSettingsOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl bg-popover border shadow-lg p-2 z-50">
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
            <RefreshCcw className='inline mr-3 h-5 w-5' />{t('header.restartLevel')}
          </div>
          <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md" onClick={onMuteToggle}>
            {isMuted ? <VolumeX className="inline mr-3 h-5 w-5" /> : <Volume2 className="inline mr-3 h-5 w-5" />}
            {isMuted ? t('header.unmute') : t('header.mute')}
          </div>
          <hr className="my-1" />
          <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md" onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}>
            <Languages className='inline mr-3 h-5 w-5' />{language === 'ru' ? 'English' : 'Русский'}
          </div>
          {isAuthorized && (
            <>
              <hr className="my-1" />
              <div className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md text-destructive" onClick={onLogout}>
                <LogOut className='inline mr-3 h-5 w-5' />{t('header.logout')}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  </div> 
</aside> 
); };
export default RightPanel;