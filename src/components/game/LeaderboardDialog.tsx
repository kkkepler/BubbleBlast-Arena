"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/simple-avatar";
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';
import { platform } from '@/lib/platform';
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogFooter } from "@/components/ui/simple-dialog";
import type { PlatformLeaderboardEntry } from '@/lib/platform/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isAuthorized: boolean;
  currentScore: number;
  leaderboardName: string;
}

const LeaderboardDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  isAuthorized,
  currentScore,
  leaderboardName
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<PlatformLeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<PlatformLeaderboardEntry | null>(null);

  const fetch = useCallback(async () => {
    if (!isAuthorized) { setEntries([]); return; }
    setLoading(true);
    try {
      const r = await platform.getLeaderboardEntries(leaderboardName, currentScore);
      setEntries(r.entries);
      setUserEntry(r.userEntry);
    } catch {} finally { setLoading(false); }
  }, [currentScore, isAuthorized, leaderboardName]);

  useEffect(() => { if (isOpen) fetch(); }, [isOpen, fetch]);

  return (
    <SimpleDialog open={isOpen} onOpenChange={onClose} className="sm:max-w-[500px]">
      <div>
        <SimpleDialogHeader>
          <SimpleDialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {t('leaderboard.title')}
          </SimpleDialogTitle>
        </SimpleDialogHeader>
        {!isAuthorized ? (
          <p className="text-center py-8 text-muted-foreground">{t('leaderboard.authMessage')}</p>
        ) : loading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {entries.map(e => (
              <div key={e.uniqueID} className={cn("flex items-center gap-3 p-2 rounded-xl", userEntry?.uniqueID === e.uniqueID && "bg-primary/10")}>
                <span className="w-8 text-center font-black">{e.rank}</span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={e.avatar} />
                  <AvatarFallback>{e.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-bold truncate">{e.name}</span>
                <span className="font-bold text-lg px-3 py-1 rounded-lg bg-muted">{e.score}</span>
              </div>
            ))}
            {userEntry && !entries.find(e => e.uniqueID === userEntry.uniqueID) && (
              <div className="border-t-2 pt-2 mt-2">
                <p className="text-xs text-center text-muted-foreground mb-1">{t('leaderboard.yourPosition')}</p>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/10">
                  <span className="w-8 text-center font-black">{userEntry.rank}</span>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userEntry.avatar} />
                    <AvatarFallback>{userEntry.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-bold truncate">{userEntry.name}</span>
                  <span className="font-bold text-lg px-3 py-1 rounded-lg bg-muted">{userEntry.score}</span>
                </div>
              </div>
            )}
          </div>
        )}
        <SimpleDialogFooter>
          <Button variant="outline" size="lg" className="w-full" onClick={onClose}>
            {t('leaderboard.close')}
          </Button>
        </SimpleDialogFooter>
      </div>
    </SimpleDialog>
  );
};
export default LeaderboardDialog;
