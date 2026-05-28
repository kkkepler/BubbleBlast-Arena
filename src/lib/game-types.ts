import type React from 'react';

export type BubbleColor = string | null;
export type Grid = BubbleColor[][];
export type FlyingBubble = { x: number; y: number; color: BubbleColor; angle: number; diameter: number };
export type GameStatus = 'ready' | 'playing' | 'won' | 'lost' | 'paused' | 'shop' | 'level_complete';
export type BonusType = 'bomb';
export type PoppedBubble = { key: string; x: number; y: number; color: BubbleColor; type: 'pop' | 'fall' | 'dissolve' };
export type Trajectory = { points: {x: number, y: number}[]; color: BubbleColor; endBubble: { x: number; y: number; color: BubbleColor } | null };
export type Particle = { key: string; x: number; y: number; vx: number; vy: number; lifespan: number; size: number; color: string; type: 'spark' | 'burst' | 'glitter' | 'smoke' | 'glow' | 'bubble' };

export type GameState = {
level: number; grid: Grid; availableColors: string[]; shotsTaken: number;
shotsSinceDrop: number; shotsBeforeDrop: number; score: number; status: GameStatus;
currentBubble: BubbleColor; nextBubble: BubbleColor; flyingBubble: FlyingBubble | null;
activeBonus: BonusType | null; bombBonusCount: number;
bonusesUsed: number; comboCounter: number; poppingBubbles: PoppedBubble[];
bombExploded: boolean; bombExplosionPosition: { x: number, y: number } | null;
comboDisplay: { count: number; x: number; y: number; key: string } | null;
gridDropKey: number; panicModeActive: boolean; panicModeTimer: number;
shotsUntilPanic: number; clearedColor: { color: BubbleColor; key: string } | null;
wasLastShotPanic: boolean; levelStartState: Partial<GameState> | null;
levelStartTime: number; successfulShotsThisLevel: number; bubblesPoppedThisLevel: number;
maxComboThisLevel: number; bonusesUsedThisLevel: number; pacifistLevelsWon: number;
swapsUsed: number; totalScoreSpent: number; totalRestarts: number;
sniperShots: number; maxBubblesClearedInOneShot: number;
};

export type Action =
| { type: 'START_LEVEL'; level: number; savedState?: Partial<GameState> }
| { type: 'SHOOT_BUBBLE'; angle: number; isPanicShot?: boolean }
| { type: 'PROCESS_ATTACHED_BUBBLE'; row: number; col: number }
| { type: 'UPDATE_FLYING_BUBBLE'; flyingBubble: FlyingBubble }
| { type: 'PAUSE_TOGGLE' }
| { type: 'START_NEW_GAME'; keepAchievements?: boolean }
| { type: 'NEXT_LEVEL' }
| { type: 'PROCEED_TO_SHOP' }
| { type: 'SELECT_BONUS'; bonus: BonusType }
| { type: 'BUY_BONUS'; bonus: BonusType; cost: number }
| { type: 'SWAP_BUBBLES' }
| { type: 'ACKNOWLEDGE_BOMB' }
| { type: 'ADD_BONUS'; bonus: BonusType }
| { type: 'ADD_SCORE'; amount: number }
| { type: 'PANIC_TICK' }
| { type: 'DEACTIVATE_PANIC_MODE' }
| { type: 'RESTART_LEVEL' }
| { type: 'REVIVE_GAME' }
| { type: 'CLEAR_CLEARED_COLOR' };

export type AchievementTier = { name: string; goal: number; reward: { score: number } };
export type Achievement = { id: string; name: string; description: string; icon: (tier: number) => { component: React.ElementType; className: string }; tiers: AchievementTier[] };
export type UnlockedAchievement = Achievement & { unlockedTier: AchievementTier; id: string };
export type PlayerAchievementsState = { [achievementId: string]: { currentTier: number; progress: number } };