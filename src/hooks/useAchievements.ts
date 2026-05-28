"use client";
import { useState, useCallback, useRef } from 'react';
import { achievementsList } from '@/lib/achievements';
import type { PlayerAchievementsState, UnlockedAchievement, GameState } from '@/lib/game-types';

const initialAchievementsState: PlayerAchievementsState = achievementsList.reduce((acc, ach) => {
  acc[ach.id] = { currentTier: -1, progress: 0 };
  return acc;
}, {} as PlayerAchievementsState);

export const useAchievements = () => {
  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievementsState>(initialAchievementsState);
  const [unlockedQueue, setUnlockedQueue] = useState<UnlockedAchievement[]>([]);
  const stateRef = useRef(playerAchievements);
  stateRef.current = playerAchievements;

  const loadAchievements = useCallback((savedData: any) => {
    if (savedData && typeof savedData === 'object') {
      const newState = { ...initialAchievementsState };
      for (const id in savedData) {
        if (id in newState) {
          newState[id] = { currentTier: savedData[id].currentTier ?? -1, progress: savedData[id].progress ?? 0 };
        }
      }
      setPlayerAchievements(newState);
    }
  }, []);

  const saveAchievements = useCallback(() => stateRef.current, []);
  const resetAchievements = useCallback(() => { setPlayerAchievements(initialAchievementsState); }, []);

  const checkAndUnlockAchievements = useCallback((gameState: GameState) => {
    let newState = { ...stateRef.current };
    const newlyUnlocked: UnlockedAchievement[] = [];
    let rewards = { score: 0 };

    achievementsList.forEach(achievement => {
      const progress = newState[achievement.id];
      achievement.tiers.forEach((tier, tierIndex) => {
        if (tierIndex > progress.currentTier) {
          let val = progress.progress;
          switch (achievement.id) {
            case 'level_milestone': val = gameState.level; break;
            case 'score_milestone': val = gameState.score; break;
            case 'combo_master': val = Math.max(progress.progress, gameState.comboCounter); break;
            case 'bonus_user': val = gameState.bonusesUsed; break;
            case 'pacifist': val = gameState.pacifistLevelsWon; break;
            case 'quick_thinker': val = gameState.swapsUsed; break;
            case 'sniper': val = gameState.sniperShots; break;
            case 'perfectionist': val = gameState.totalRestarts; break;
            case 'chain_reaction': val = gameState.maxBubblesClearedInOneShot; break;
          }
          newState[achievement.id].progress = val;
          if (val >= tier.goal) {
            newState[achievement.id].currentTier = tierIndex;
            rewards.score += tier.reward.score || 0;
            newlyUnlocked.push({ ...achievement, unlockedTier: tier, id: `${achievement.id}-${tierIndex}-${Date.now()}` });
          }
        }
      });
    });

    if (newlyUnlocked.length > 0) { 
      setPlayerAchievements(newState); 
      setUnlockedQueue(prev => [...prev, ...newlyUnlocked]); 
    }
    return rewards;
  }, []);

  const acknowledgeUnlock = useCallback((id: string) => { 
    setUnlockedQueue(prev => prev.filter(item => item.id !== id)); 
  }, []);

  return { playerAchievements, unlockedQueue, loadAchievements, saveAchievements, checkAndUnlockAchievements, acknowledgeUnlock, resetAchievements };
};
