'use client';
import React, { useState, useEffect, useReducer, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GameBoard from './GameBoard';
import GameHeader from './GameHeader';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import GameOverDialog from './GameOverDialog';
import ShopDialog from './ShopDialog';
import LeaderboardDialog from './LeaderboardDialog';
import AchievementsDialog from './AchievementsDialog';
import AchievementUnlockedDialog from './AchievementToast';
import LoginDialog from './LoginDialog';
import HowToPlayDialog from './HowToPlayDialog';
import LevelCompleteStats from './LevelCompleteStats';
import WelcomeScreen from './WelcomeScreen';
import FlashEffect from './FlashEffect';
import { GRID_ROWS, GRID_COLS, BUBBLE_DIAMETER, BUBBLE_RADIUS, GAME_WIDTH, GAME_HEIGHT, BASE_SCORE, SCORE_MULTIPLIER_INCREMENT, FALLING_BUBBLE_SCORE, STONE_BUBBLE, COMBO_BONUS } from '@/lib/constants';
import { getLevel, getAvailableColors } from '@/lib/levels';
import { getBubbleCenterPosition, getNeighbors } from '@/lib/game-logic';
import { dropStyle, cn } from '@/lib/utils';
import type { Action, GameState, GameStatus, BonusType, PoppedBubble, Trajectory, BubbleColor, Particle } from '@/lib/game-types';
import { useI18n } from '@/hooks/useI18n';
import { useAchievements } from '@/hooks/useAchievements';
import { platform } from '@/lib/platform';
import { ArrowRightLeft, Crosshair, Palette, AlertTriangle } from 'lucide-react';

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_LEVEL': {
      const ld = getLevel(action.level);
      const grid = JSON.parse(JSON.stringify(ld.grid));
      const colors = getAvailableColors(grid);
      const isNew = !action.savedState;
      const base = {
        score: isNew ? 0 : (action.savedState?.score ?? 0),
        bombBonusCount: isNew ? 0 : (action.savedState?.bombBonusCount ?? 0),
        bonusesUsed: isNew ? 0 : (action.savedState?.bonusesUsed ?? 0),
        totalScoreSpent: isNew ? 0 : (action.savedState?.totalScoreSpent ?? 0),
        pacifistLevelsWon: isNew ? 0 : (action.savedState?.pacifistLevelsWon ?? 0),
        swapsUsed: isNew ? 0 : (action.savedState?.swapsUsed ?? 0),
        totalRestarts: isNew ? 0 : (action.savedState?.totalRestarts ?? 0),
        sniperShots: isNew ? 0 : (action.savedState?.sniperShots ?? 0),
        maxBubblesClearedInOneShot: isNew ? 0 : (action.savedState?.maxBubblesClearedInOneShot ?? 0),
      };
      return {
        ...state, ...base,
        level: action.level, grid, availableColors: colors,
        status: 'playing',
        currentBubble: colors[Math.floor(Math.random() * colors.length)],
        nextBubble: colors[Math.floor(Math.random() * colors.length)],
        flyingBubble: null, activeBonus: null, comboCounter: 0,
        poppingBubbles: [], bombExploded: false, bombExplosionPosition: null,
        gridDropKey: state.gridDropKey + 1,
        levelStartTime: Date.now(),
        successfulShotsThisLevel: 0, bubblesPoppedThisLevel: 0, maxComboThisLevel: 0,
        levelStartState: base as any, clearedColor: null,
        panicModeActive: false, panicModeTimer: 0,
        shotsUntilPanic: Math.floor(Math.random() * 11) + 15,
        shotsSinceDrop: 0, shotsBeforeDrop: 5,
      };
    }
    case 'SHOOT_BUBBLE': {
      if (state.status !== 'playing' || state.flyingBubble) return state;
      
      let fc = state.currentBubble;
      let bc = state.bombBonusCount;
      
      if (state.activeBonus === 'bomb' && bc > 0) { 
        fc = 'bomb'; 
        bc--; 
      }
      
      const newShotsUntilPanic = state.panicModeActive ? Math.floor(Math.random() * 11) + 15 : state.shotsUntilPanic - 1;
      const isActivatingPanic = !state.panicModeActive && newShotsUntilPanic <= 0;
      
      return {
        ...state,
        flyingBubble: { 
          x: GAME_WIDTH / 2, 
          y: GAME_HEIGHT - BUBBLE_RADIUS, 
          color: fc, 
          angle: action.angle, 
          diameter: BUBBLE_DIAMETER * 0.95 
        },
        currentBubble: state.nextBubble,
        nextBubble: state.availableColors[Math.floor(Math.random() * state.availableColors.length)],
        shotsTaken: state.shotsTaken + 1,
        activeBonus: null,
        bombBonusCount: Math.max(0, bc),
        poppingBubbles: [], 
        bombExploded: false, 
        bombExplosionPosition: null,
        panicModeActive: isActivatingPanic,
        panicModeTimer: isActivatingPanic ? 5 : 0,
        shotsUntilPanic: isActivatingPanic ? Math.floor(Math.random() * 11) + 15 : newShotsUntilPanic,
      };
    }
    case 'PANIC_TICK': {
      if (!state.panicModeActive) return state;
      return { ...state, panicModeTimer: Math.max(0, state.panicModeTimer - 1) };
    }
    case 'UPDATE_FLYING_BUBBLE': {
      return { ...state, flyingBubble: action.flyingBubble };
    }
    case 'PROCESS_ATTACHED_BUBBLE': {
      const { row, col } = action;
      if (!state.flyingBubble) return state;
      
      const oldColorsSet = new Set(state.availableColors);
      let ng = JSON.parse(JSON.stringify(state.grid));
      const popped: PoppedBubble[] = [];
      let ascore = 0, exploded = false, explosionPos = null;
      const fc = state.flyingBubble.color;
      let hasMatch = false;

      if (row !== -1 && col !== -1) {
        if (fc === 'bomb') {
          exploded = true;
          explosionPos = { x: state.flyingBubble.x, y: state.flyingBubble.y };
          const center = getBubbleCenterPosition(row, col);
          const rad = BUBBLE_DIAMETER * 2.5;
          for (let r = 0; r < GRID_ROWS; r++) {
            const cols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
            for (let c = 0; c < cols; c++) {
              if (ng[r] && ng[r][c] && ng[r][c] !== STONE_BUBBLE) {
                const p = getBubbleCenterPosition(r, c);
                if (Math.hypot(center.x - p.x, center.y - p.y) < rad) {
                  popped.push({ key: `b-${r}-${c}-${Date.now()}-${Math.random()}`, x: p.x - BUBBLE_RADIUS, y: p.y - BUBBLE_RADIUS, color: ng[r][c], type: 'pop' });
                  ng[r][c] = null; ascore += 10;
                }
              }
            }
          }
          hasMatch = true;
        } else {
          ng[row][col] = fc;
          const match = ng[row][col];
          const cluster: [number, number][] = [];
          const q: [number, number][] = [[row, col]];
          const seen = new Set([`${row},${col}`]);
          
          while (q.length > 0) {
            const [r, c] = q.shift()!;
            cluster.push([r, c]);
            getNeighbors(r, c).forEach(([nr, nc]) => {
              if (ng[nr] && ng[nr][nc] === match && !seen.has(`${nr},${nc}`)) { 
                seen.add(`${nr},${nc}`); 
                q.push([nr, nc]); 
              }
            });
          }
          
          if (cluster.length >= 3) {
            hasMatch = true;
            cluster.forEach(([r, c]) => {
              const p = getBubbleCenterPosition(r, c);
              popped.push({ key: `p-${r}-${c}-${Date.now()}-${Math.random()}`, x: p.x - BUBBLE_RADIUS, y: p.y - BUBBLE_RADIUS, color: ng[r][c], type: 'pop' });
              ng[r][c] = null;
            });
            ascore += BASE_SCORE + (cluster.length - 3) * SCORE_MULTIPLIER_INCREMENT;
          }
        }
        
        const connected = new Set<string>();
        const qf: [number, number][] = [];
        for (let c = 0; c < GRID_COLS; c++) { 
          if (ng[0] && ng[0][c]) { 
            connected.add(`0,${c}`); 
            qf.push([0, c]); 
          }
        }
        while (qf.length > 0) {
          const [r, c] = qf.shift()!;
          getNeighbors(r, c).forEach(([nr, nc]) => {
            if (ng[nr] && ng[nr][nc] && !connected.has(`${nr},${nc}`)) { 
              connected.add(`${nr},${nc}`); 
              qf.push([nr, nc]); 
            }
          });
        }
        for (let r = 0; r < GRID_ROWS; r++) {
          const cols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
          for (let c = 0; c < cols; c++) {
            if (ng[r] && ng[r][c] && !connected.has(`${r},${c}`)) {
              const p = getBubbleCenterPosition(r, c);
              popped.push({ key: `f-${r}-${c}-${Date.now()}-${Math.random()}`, x: p.x - BUBBLE_RADIUS, y: p.y - BUBBLE_RADIUS, color: ng[r][c], type: 'fall' });
              ng[r][c] = null; 
              ascore += FALLING_BUBBLE_SCORE;
            }
          }
        }
      }

      let newShotsSinceDrop = state.shotsSinceDrop;
      if (!hasMatch) {
        newShotsSinceDrop++;
      }

      if (newShotsSinceDrop >= state.shotsBeforeDrop) {
        newShotsSinceDrop = 0;
        const newRow = Array(GRID_COLS).fill(null).map(() => {
          const available = getAvailableColors(ng);
          return Math.random() > 0.3 && available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
        });
        ng.unshift(newRow);
        ng.pop();
      }

      let isGO = false;
      const line = GAME_HEIGHT - BUBBLE_DIAMETER * 2.1;
      for (let r = 0; r < GRID_ROWS; r++) {
        const rowData = ng[r];
        if (rowData) {
          for (let c = 0; c < rowData.length; c++) {
            if (rowData[c]) {
              const { y } = getBubbleCenterPosition(r, c);
              if (y + BUBBLE_RADIUS >= line) { isGO = true; break; }
            }
          }
        }
        if (isGO) break;
      }

      const nextColorsAll = getAvailableColors(ng);
      const nextColorsSet = new Set(nextColorsAll);
      const clearedColor = Array.from(oldColorsSet).find(c => c && c !== STONE_BUBBLE && !nextColorsSet.has(c));
      
      let nextColors = nextColorsAll;
      if (clearedColor && nextColors.includes(clearedColor)) nextColors = nextColors.filter(c => c !== clearedColor);

      let newCur = state.currentBubble, newNext = state.nextBubble;
      if (newCur && !nextColors.includes(newCur as string)) newCur = nextColors.length > 0 ? nextColors[Math.floor(Math.random() * nextColors.length)] : null;
      if (newNext && !nextColors.includes(newNext as string)) newNext = nextColors.length > 0 ? nextColors[Math.floor(Math.random() * nextColors.length)] : null;

      let bubblesRemaining = false;
      for (let r = 0; r < GRID_ROWS; r++) {
        const row = ng[r];
        if (row) {
          for (let c = 0; c < row.length; c++) {
            if (row[c] && row[c] !== STONE_BUBBLE) {
              bubblesRemaining = true;
              break;
            }
          }
        }
        if (bubblesRemaining) break;
      }

      let status: GameStatus = bubblesRemaining ? state.status : 'level_complete';
      if (isGO) status = 'lost';

      const newCombo = popped.length > 0 ? state.comboCounter + 1 : 0;

      return {
        ...state, grid: ng,
        score: state.score + ascore + (popped.length > 0 ? COMBO_BONUS * state.comboCounter : 0),
        status, poppingBubbles: popped, flyingBubble: null, bombExploded: exploded, bombExplosionPosition: explosionPos,
        availableColors: nextColors,
        currentBubble: newCur,
        nextBubble: newNext || (nextColors.length > 0 ? nextColors[Math.floor(Math.random() * nextColors.length)] : null),
        comboCounter: newCombo,
        bubblesPoppedThisLevel: state.bubblesPoppedThisLevel + popped.length,
        successfulShotsThisLevel: popped.length > 0 ? state.successfulShotsThisLevel + 1 : state.successfulShotsThisLevel,
        maxComboThisLevel: Math.max(state.maxComboThisLevel, newCombo),
        clearedColor: clearedColor ? { color: clearedColor, key: `cl-${Date.now()}` } : null,
        shotsSinceDrop: newShotsSinceDrop,
      };
    }
    case 'CLEAR_CLEARED_COLOR': return { ...state, clearedColor: null };
    case 'SWAP_BUBBLES': return { ...state, currentBubble: state.nextBubble, nextBubble: state.currentBubble, swapsUsed: state.swapsUsed + 1 };
    case 'PAUSE_TOGGLE': return { ...state, status: state.status === 'paused' ? 'playing' : 'paused' };
    case 'START_NEW_GAME': return gameReducer(state, { type: 'START_LEVEL', level: 1 });
    case 'NEXT_LEVEL': return gameReducer(state, { type: 'START_LEVEL', level: state.level + 1, savedState: state });
    case 'PROCEED_TO_SHOP': return { ...state, status: 'shop' };
    case 'REVIVE_GAME': return { ...state, status: 'playing', grid: state.grid.map((r, i) => i < GRID_ROWS - 6 ? r : r.map(() => null)) as any };
    case 'SELECT_BONUS': {
      if (state.activeBonus === action.bonus) {
        return { ...state, activeBonus: null };
      }
      const hasBonus = state.bombBonusCount > 0;
      if (!hasBonus) return state;
      return { ...state, activeBonus: action.bonus };
    }
    case 'BUY_BONUS': return { ...state, score: state.score - action.cost, bombBonusCount: state.bombBonusCount + 1, totalScoreSpent: state.totalScoreSpent + action.cost };
    case 'ADD_BONUS': return { ...state, bombBonusCount: state.bombBonusCount + 1 };
    case 'ADD_SCORE': return { ...state, score: state.score + action.amount };
    default: return state;
  }
}

const Game = () => {
  const { t } = useI18n();
  const { playerAchievements, unlockedQueue, acknowledgeUnlock, saveAchievements, loadAchievements, checkAndUnlockAchievements } = useAchievements();
  
  const [welcomeState, setWelcomeState] = useState<'loading' | 'select' | 'playing'>('loading');
  const [platformError, setPlatformError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [state, dispatch] = useReducer(gameReducer, {
    level: 1, grid: [], availableColors: [], shotsTaken: 0, shotsSinceDrop: 0, shotsBeforeDrop: 5,
    score: 0, status: 'ready', currentBubble: null, nextBubble: null, flyingBubble: null,
    activeBonus: null, bombBonusCount: 0, bonusesUsed: 0, comboCounter: 0,
    poppingBubbles: [], bombExploded: false, bombExplosionPosition: null, comboDisplay: null,
    gridDropKey: 0, panicModeActive: false, panicModeTimer: 0, shotsUntilPanic: 15, clearedColor: null,
    wasLastShotPanic: false, levelStartState: null, levelStartTime: 0, successfulShotsThisLevel: 0,
    bubblesPoppedThisLevel: 0, maxComboThisLevel: 0, bonusesUsedThisLevel: 0, pacifistLevelsWon: 0,
    swapsUsed: 0, totalScoreSpent: 0, totalRestarts: 0, sniperShots: 0, maxBubblesClearedInOneShot: 0,
  } as any);

  const [scale, setScale] = useState(1);
  const [mousePos, setMousePos] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - BUBBLE_RADIUS });
  const [isMuted, setIsMuted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [adIsShowing, setAdIsShowing] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLoginProcessing, setIsLoginProcessing] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [comboDisplayContent, setComboDisplayContent] = useState<{ count: number; key: string } | null>(null);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [clearEffectPhase, setClearEffectPhase] = useState<'idle' | 'prepare' | 'burst' | 'complete'>('idle');
  
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const soundsRef = useRef<any>(null);
  const toneModuleRef = useRef<any>(null);
  const pannerRef = useRef<any>(null);
  const gameReadyCalled = useRef(false);
  const prevPanicActive = useRef(false);
  const stateRef = useRef(state);
  const animationIdRef = useRef<number | null>(null);
  const prevShotsSinceDropRef = useRef(0);
  const lastShotHitRef = useRef(false);

  // Флаг для предотвращения повторных вызовов
  const isProcessingExplosion = useRef(false);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { setIsMounted(true); }, []);

  const handleResize = useCallback(() => {
    const wrapper = gameWrapperRef.current;
    if (!wrapper) return;
    
    setTimeout(() => {
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const availableWidth = rect.width;
      const availableHeight = rect.height;
      
      if (availableWidth === 0 || availableHeight === 0) return;

      const scaleX = (availableWidth - 32) / GAME_WIDTH;
      const scaleY = (availableHeight - 32) / GAME_HEIGHT;
      
      let newScale = Math.min(scaleX, scaleY);
      newScale = Math.min(1.2, Math.max(0.4, newScale));
      
      setScale(newScale);
    }, 50);
  }, []);

  useLayoutEffect(() => {
    const onLoad = () => {
      setTimeout(handleResize, 150);
    };
    
    if (document.readyState === 'complete') {
      setTimeout(handleResize, 150);
    } else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, [handleResize]);

  useEffect(() => {
    if (!isMounted) return;
    
    const wrapper = gameWrapperRef.current;
    if (!wrapper) return;
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    resizeObserver.observe(wrapper);
    window.addEventListener('resize', handleResize);
    
    const timer = setTimeout(handleResize, 200);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isMounted, handleResize]);

  useEffect(() => {
    if (state.grid && state.grid.length > 0 && isMounted) {
      const timer = setTimeout(handleResize, 250);
      return () => clearTimeout(timer);
    }
  }, [state.grid, isMounted, handleResize]);

  // Функция для создания взрыва (один раз)
  const createExplosion = useCallback((x: number, y: number, color: string, isBig: boolean = false) => {
    // Защита от повторных вызовов
    if (isProcessingExplosion.current) return;
    isProcessingExplosion.current = true;
    
    const count = isBig ? 40 : 25;
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * (isBig ? 6 : 4);
      
      particles.push({
        key: `exp-${Date.now()}-${i}-${Math.random()}`,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        lifespan: 35 + Math.random() * 20,
        size: 2 + Math.random() * (isBig ? 4 : 3),
        color: i % 3 === 0 ? '#FFFFFF' : color,
        type: 'burst'
      });
    }
    
    particlesRef.current.push(...particles);
    
    // Сбрасываем флаг через таймер
    setTimeout(() => {
      isProcessingExplosion.current = false;
    }, 100);
  }, []);

  // Императивная обработка взрывов - вызывается напрямую из PROCESS_ATTACHED_BUBBLE
  // Добавим отдельный эффект, который срабатывает только при изменении bombExploded
  useEffect(() => {
    if (state.bombExploded && state.bombExplosionPosition && !isProcessingExplosion.current) {
      createExplosion(state.bombExplosionPosition.x, state.bombExplosionPosition.y, '#FF6600', true);
    }
  }, [state.bombExploded, state.bombExplosionPosition, createExplosion]);

  // Обработка появления poppingBubbles - создаём взрывы для каждого лопнувшего пузыря
  useEffect(() => {
    if (state.poppingBubbles.length > 0) {
      const validBubbles = state.poppingBubbles.filter(b => b.type === 'pop');
      
      if (validBubbles.length > 0 && !isProcessingExplosion.current) {
        validBubbles.forEach(b => {
          if (b.color) {
            createExplosion(b.x + BUBBLE_RADIUS, b.y + BUBBLE_RADIUS, b.color as string, false);
          }
        });
        
        // Звуки
        if (validBubbles.length >= 5) {
          safePlay('bigPop', "C4", "8n");
        } else if (validBubbles.length > 0) {
          const note = ["C4", "E4", "G4"][Math.min(validBubbles.length - 1, 2)] || "C4";
          safePlay('pop', note, "16n");
        }
        
        // Комбо эффект
        if (state.comboCounter >= 3 && (state.comboCounter % 3 === 0 || state.comboCounter === 3)) {
          setComboDisplayContent({ count: state.comboCounter, key: `combo-${Date.now()}` });
          const comboNote = ["C5", "E5", "G5", "C6"][Math.min(state.comboCounter - 3, 3)];
          safePlay('comboSound', comboNote, "8n");
          setTimeout(() => setComboDisplayContent(null), 1000);
        }
      }
    }
  }, [state.poppingBubbles, state.comboCounter, createExplosion]);

  const startAudio = async () => {
    if (toneModuleRef.current) {
      if (toneModuleRef.current.context.state !== 'running') await toneModuleRef.current.context.resume();
      return;
    }
    try {
      const tone = await import('tone');
      await tone.start();
      toneModuleRef.current = tone;
      
      const masterVolume = new tone.Volume(-4).toDestination();
      const mainLimiter = new tone.Limiter(-1).connect(masterVolume);
      
      const masterCompressor = new tone.Compressor({ 
        threshold: -22, 
        ratio: 4, 
        attack: 0.003, 
        release: 0.15 
      }).connect(mainLimiter);
      
      const gamePanner = new tone.Panner(0).connect(masterCompressor);
      pannerRef.current = gamePanner;
      
      const reverb = new tone.Reverb({ decay: 1.8, wet: 0.25 }).connect(gamePanner);
      const largeReverb = new tone.Reverb({ decay: 3.5, wet: 0.45 }).connect(masterCompressor);
      const delay = new tone.FeedbackDelay({ delayTime: 0.15, feedback: 0.2, wet: 0.15 }).connect(reverb);
      const chorus = new tone.Chorus(4, 2.0, 0.4).start().connect(reverb);
      
      const shoot = new tone.MonoSynth({
        oscillator: { type: 'triangle' },
        filter: { Q: 2, type: 'lowpass', frequency: 1200 },
        envelope: { attack: 0.002, decay: 0.08, sustain: 0.1, release: 0.05 },
        filterEnvelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05, baseFrequency: 300, octaves: 2.5 }
      }).connect(delay);
      shoot.volume.value = -6;
      
      const pop = new tone.FMSynth({ 
        harmonicity: 1.5, 
        modulationIndex: 4, 
        oscillator: { type: 'sine' },
        modulation: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.08 }
      }).connect(reverb);
      pop.volume.value = -10;
      
      const bigPop = new tone.FMSynth({ 
        harmonicity: 2, 
        modulationIndex: 6, 
        envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.15 } 
      }).connect(reverb);
      bigPop.volume.value = -8;
      
      const bombExplosion = new tone.MembraneSynth({ 
        pitchDecay: 0.2, 
        octaves: 10, 
        envelope: { attack: 0.001, decay: 0.8, sustain: 0.01, release: 0.5 } 
      }).connect(masterCompressor);
      bombExplosion.volume.value = 2;
      
      const explosionNoise = new tone.NoiseSynth({ 
        noise: { type: 'white' }, 
        envelope: { attack: 0.005, decay: 0.6, sustain: 0, release: 0.4 } 
      }).connect(new tone.Filter({
        type: 'lowpass',
        frequency: 2500,
        rolloff: -24
      }).connect(masterCompressor));
      explosionNoise.volume.value = -2;

      const colorClearSynth = new tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.12, sustain: 0.1, release: 0.3 }
      }).connect(chorus);
      colorClearSynth.volume.value = -8;

      const wallBounce = new tone.MonoSynth({
        oscillator: { type: 'triangle' },
        filter: { Q: 1, type: 'highpass', frequency: 1500 },
        envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 }
      }).connect(gamePanner);
      wallBounce.volume.value = -14;
      
      const victory = new tone.PolySynth(tone.Synth, { 
        oscillator: { type: 'fmsine', modulationType: 'sine', modulationIndex: 3 }, 
        envelope: { attack: 0.05, decay: 0.4, sustain: 0.6, release: 2.0 } 
      }).connect(largeReverb);
      victory.volume.value = -4;
      
      const lose = new tone.PolySynth(tone.Synth, { 
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.2, decay: 0.5, sustain: 0.4, release: 2.0 } 
      }).connect(new tone.FeedbackDelay(0.25, 0.4).connect(largeReverb));
      lose.volume.value = -10;
      
      const comboSound = new tone.Synth({ 
        oscillator: { type: 'triangle' }, 
        envelope: { attack: 0.005, decay: 0.15, sustain: 0.3, release: 0.2 } 
      }).connect(chorus);
      comboSound.volume.value = -6;
      
      const uiClick = new tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 }
      }).connect(masterCompressor);
      uiClick.volume.value = -12;
      
      const purchase = new tone.Synth({ 
        oscillator: { type: 'sine' }, 
        envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.15 } 
      }).connect(chorus);
      purchase.volume.value = -6;
      
      const achievementChord = new tone.PolySynth(tone.Synth, { 
        oscillator: { type: 'fatsine', count: 3, spread: 20 }, 
        envelope: { attack: 0.06, decay: 0.6, sustain: 0.5, release: 1.2 } 
      }).connect(largeReverb);
      achievementChord.volume.value = -10;
      
      const panicBeep = new tone.Synth({ 
        oscillator: { type: 'triangle' }, 
        envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 } 
      }).connect(masterCompressor);
      panicBeep.volume.value = -6;
      
      const panicStart = new tone.PolySynth(tone.Synth, { 
        oscillator: { type: 'sawtooth' }, 
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.3 } 
      }).connect(reverb);
      panicStart.volume.value = -12;
      
      const gridDrop = new tone.MonoSynth({
        oscillator: { type: 'sine' },
        filter: { type: 'lowpass', frequency: 300, Q: 2 },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.05, baseFrequency: 200, octaves: 2 }
      }).connect(masterCompressor);
      gridDrop.volume.value = -8;
      
      const missSound = new tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.002, decay: 0.05, sustain: 0, release: 0.04 }
      }).connect(masterCompressor);
      missSound.volume.value = -10;
      
      soundsRef.current = { 
        shoot, pop, bigPop, bombExplosion, explosionNoise, colorClearSynth, wallBounce, 
        victory, lose, comboSound, uiClick, purchase, achievementChord, panicBeep, panicStart,
        gridDrop, missSound
      };
      
      if (isMuted || adIsShowing) toneModuleRef.current.getDestination().mute = true;
    } catch (e) {
      console.error('Audio initialization error:', e);
    }
  };

  const safePlay = (name: string, note: string = "C4", duration: string = "8n", xPos?: number) => {
    if (isMuted || adIsShowing || !soundsRef.current || !toneModuleRef.current) return;
    const synth = soundsRef.current[name];
    if (!synth) return;
    try {
      if (toneModuleRef.current.context.state !== 'running') {
        toneModuleRef.current.context.resume();
      }
      
      if (pannerRef.current && typeof xPos === 'number') {
        const panValue = (xPos / GAME_WIDTH) * 2 - 1;
        pannerRef.current.pan.value = Math.max(-1, Math.min(1, panValue));
      } else if (pannerRef.current) {
        pannerRef.current.pan.value = 0;
      }

      const now = toneModuleRef.current.now();
      
      if (name === 'victory' || name === 'lose' || name === 'achievementChord') {
        const notes = note.split(',');
        synth.triggerAttackRelease(notes, duration, now);
      } else {
        synth.triggerAttackRelease(note, duration, now);
      }
    } catch (e) {}
  };

  const handlePointerUpdate = useCallback((e: React.PointerEvent) => {
    if (!gameContainerRef.current) return;
    const rect = gameContainerRef.current.getBoundingClientRect();
    let relativeX = (e.clientX - rect.left) / scale;
    let relativeY = (e.clientY - rect.top) / scale;
    setMousePos({ x: Math.max(0, Math.min(GAME_WIDTH, relativeX)), y: Math.max(0, Math.min(GAME_HEIGHT, relativeY)) });
  }, [scale]);

  const handleShoot = useCallback(async () => {
    await startAudio();
    if (stateRef.current.status !== 'playing' || stateRef.current.flyingBubble || adIsShowing) return;
    
    const sy = GAME_HEIGHT - BUBBLE_RADIUS;
    if (!stateRef.current.panicModeActive && mousePos.y >= sy) return;
    
    let shootAngle = (Math.atan2(mousePos.x - GAME_WIDTH / 2, sy - mousePos.y) * 180) / Math.PI;
    
    safePlay('shoot', "C3", "16n", mousePos.x);
    
    const currentBonus = stateRef.current.activeBonus;
    
    if (currentBonus === 'bomb' && stateRef.current.bombBonusCount > 0) {
      safePlay('uiClick', "G5", "32n");
    }
    
    lastShotHitRef.current = false;
    
    dispatch({ 
      type: 'SHOOT_BUBBLE', 
      angle: shootAngle
    });
  }, [adIsShowing, mousePos]);

  useEffect(() => {
    if (state.clearedColor && clearEffectPhase === 'idle') {
      const color = state.clearedColor.color as string;
      setClearEffectPhase('prepare');
      setShakeIntensity(15);
      setScreenFlash(color);
      
      safePlay('colorClearSynth', "C5", "4n");

      setTimeout(() => {
        setClearEffectPhase('burst');
        setShakeIntensity(20);
        
        safePlay('bombExplosion', "C2", "2n", GAME_WIDTH / 2);
        safePlay('explosionNoise', "C2", "2n", GAME_WIDTH / 2);
        
        createExplosion(GAME_WIDTH / 2, GAME_HEIGHT / 2.5, color, true);
        
        setTimeout(() => {
          setClearEffectPhase('complete');
          setShakeIntensity(0);
          setScreenFlash(null);
          dispatch({ type: 'CLEAR_CLEARED_COLOR' });
          setClearEffectPhase('idle');
        }, 800);
      }, 500);
    }
  }, [state.clearedColor, clearEffectPhase, createExplosion]);

  useEffect(() => {
    if (state.status === 'lost') {
      safePlay('lose', "C3,D#3,G3,C4", "1n");
    } else if (state.status === 'level_complete') {
      safePlay('victory', "C5,E5,G5,C6,E6,G6", "2n");
    }
  }, [state.status]);

  useEffect(() => {
    if (state.panicModeActive && state.status === 'playing') {
      if (!prevPanicActive.current) {
        safePlay('panicStart', "C4,E4", "8n");
        prevPanicActive.current = true;
      }
      const timer = setInterval(() => {
        const s = stateRef.current;
        if (s.panicModeTimer > 0) {
          const pitch = ["G4", "A4", "B4", "C5", "D5"][s.panicModeTimer - 1] || "G4";
          safePlay('panicBeep', pitch, "16n");
          dispatch({ type: 'PANIC_TICK' });
        } else {
          handleShoot();
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    } else {
      prevPanicActive.current = false;
    }
  }, [state.panicModeActive, state.status, handleShoot]);

  // Звук при опускании ряда
  useEffect(() => {
    if (prevShotsSinceDropRef.current !== 0 && 
        state.shotsSinceDrop === 0 && 
        state.shotsTaken > 0) {
      safePlay('gridDrop', "C2", "4n");
    }
    prevShotsSinceDropRef.current = state.shotsSinceDrop;
  }, [state.shotsSinceDrop, state.shotsTaken]);

  useEffect(() => {
    let active = true;
    const step = () => {
      if (!active) return;
      const s = stateRef.current;
      if (s.status === 'playing' && s.flyingBubble) {
        const fb = { ...s.flyingBubble };
        fb.x += 25 * Math.sin(fb.angle * Math.PI / 180);
        fb.y -= 25 * Math.cos(fb.angle * Math.PI / 180);
        
        if (fb.x <= BUBBLE_RADIUS || fb.x >= GAME_WIDTH - BUBBLE_RADIUS) { 
          fb.angle = -fb.angle; 
          fb.x = Math.max(BUBBLE_RADIUS, Math.min(fb.x, GAME_WIDTH - BUBBLE_RADIUS)); 
          
          safePlay('wallBounce', "G6", "32n", fb.x);
        }
        
        let hit = fb.y <= BUBBLE_RADIUS;
        if (!hit) {
          for (let r = 0; r < GRID_ROWS; r++) {
            const cols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
            for (let c = 0; c < cols; c++) {
              if (s.grid[r] && s.grid[r][c]) {
                const p = getBubbleCenterPosition(r, c);
                if (Math.hypot(fb.x - p.x, fb.y - p.y) < BUBBLE_DIAMETER * 0.75) { hit = true; break; }
              }
            }
            if (hit) break;
          }
        }
        if (hit) {
          let md = Infinity, hR = -1, hC = -1;
          for (let r = 0; r < GRID_ROWS; r++) {
            const cols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
            for (let c = 0; c < cols; c++) {
              if (!s.grid[r] || !s.grid[r][c]) {
                const p = getBubbleCenterPosition(r, c);
                const d = Math.hypot(fb.x - p.x, fb.y - p.y);
                if (d < md) { md = d; hR = r; hC = c; }
              }
            }
          }
          dispatch({ type: 'PROCESS_ATTACHED_BUBBLE', row: hR, col: hC });
        } else {
          dispatch({ type: 'UPDATE_FLYING_BUBBLE', flyingBubble: fb });
        }
      }
      animationIdRef.current = requestAnimationFrame(step);
    };
    animationIdRef.current = requestAnimationFrame(step);
    return () => { active = false; if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current); };
  }, []);

  const trajectory = useMemo(() => {
    if (state.status !== 'playing' || state.flyingBubble || state.panicModeActive) return { points: [], color: null, endBubble: null };
    const sy = GAME_HEIGHT - BUBBLE_RADIUS;
    const angle = (Math.atan2(mousePos.x - GAME_WIDTH / 2, sy - mousePos.y) * 180) / Math.PI;
    let sx = GAME_WIDTH / 2, sy2 = sy, sa = angle, pts = [{ x: sx, y: sy2 }], eb = null;
    for (let i = 0; i < 60; i++) {
      sx += 25 * Math.sin(sa * Math.PI / 180); sy2 -= 25 * Math.cos(sa * Math.PI / 180);
      if (sx <= BUBBLE_RADIUS || sx >= GAME_WIDTH - BUBBLE_RADIUS) { sa = -sa; sx = Math.max(BUBBLE_RADIUS, Math.min(sx, GAME_WIDTH - BUBBLE_RADIUS)); pts.push({ x: sx, y: sy2 }); }
      let hit = sy2 <= BUBBLE_RADIUS;
      if (!hit) {
        for (let r = 0; r < GRID_ROWS; r++) {
          const cols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
          for (let c = 0; c < cols; c++) {
            if (state.grid[r] && state.grid[r][c]) {
              const p = getBubbleCenterPosition(r, c);
              if (Math.hypot(sx - p.x, sy2 - p.y) < BUBBLE_DIAMETER * 0.75) { hit = true; break; }
            }
          }
          if (hit) break;
        }
      }
      if (hit) {
        pts.push({ x: sx, y: sy2 });
        let md = Infinity, hR = -1, hC = -1;
        for (let r = 0; r < GRID_ROWS; r++) {
          const cols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
          for (let c = 0; c < cols; c++) {
            if (!state.grid[r] || !state.grid[r][c]) {
              const p = getBubbleCenterPosition(r, c);
              const d = Math.hypot(sx - p.x, sy2 - p.y);
              if (d < md) { md = d; hR = r; hC = c; }
            }
          }
        }
        if (hR !== -1) { const pos = getBubbleCenterPosition(hR, hC); eb = { x: pos.x - BUBBLE_RADIUS, y: pos.y - BUBBLE_RADIUS, color: state.activeBonus || state.currentBubble }; }
        break;
      }
    }
    return { points: pts, color: state.activeBonus || state.currentBubble, endBubble: eb };
  }, [state.status, state.flyingBubble, state.grid, state.currentBubble, state.activeBonus, mousePos, state.panicModeActive]);

  const handleSyncLogin = async () => {
    setIsSyncing(true);
    try {
      let auth = false;
      try {
        auth = await platform.isAuthorized();
      } catch (e) {
        console.warn('isAuthorized error:', e);
      }
      if (!auth) { 
        try {
          if (!await platform.openAuthDialog()) { 
            setIsSyncing(false); 
            return; 
          }
        } catch (e) {
          console.warn('openAuthDialog error:', e);
          setIsSyncing(false);
          setSdkError(true);
          return;
        }
      }
      const p = await platform.getPlayer();
      if (p) {
        setIsAuthorized(true); 
        setPlayerInfo({ name: p.getName(), avatar: p.getAvatar() });
        try {
          const data = await platform.playerData.get(); 
          if (data?.achievements) loadAchievements(data.achievements);
          if (data?.level) dispatch({ type: 'START_LEVEL', level: data.level, savedState: data });
          else dispatch({ type: 'START_LEVEL', level: 1 });
        } catch (e) {
          console.warn('playerData.get error:', e);
          dispatch({ type: 'START_LEVEL', level: 1 });
        }
        setWelcomeState('playing'); 
        if (!gameReadyCalled.current) { 
          try {
            platform.gameReady(); 
            platform.gameplay.ready(); 
          } catch (e) {
            console.warn('gameReady error:', e);
          }
          gameReadyCalled.current = true; 
        }
      } else {
        dispatch({ type: 'START_LEVEL', level: 1 });
        setWelcomeState('playing');
      }
    } catch (e) { 
      console.error('Sync login error:', e);
      setSdkError(true);
      dispatch({ type: 'START_LEVEL', level: 1 });
      setWelcomeState('playing');
    } finally { 
      setIsSyncing(false); 
    }
  };

  const handleGuestLogin = () => { 
    setWelcomeState('playing'); 
    dispatch({ type: 'START_LEVEL', level: 1 }); 
    if (!gameReadyCalled.current) { 
      try {
        platform.gameReady(); 
        platform.gameplay.ready(); 
      } catch (e) {
        console.warn('gameReady error:', e);
      }
      gameReadyCalled.current = true; 
    } 
  };

  useEffect(() => {
    const init = async () => {
      try {
        await platform.init();
        setWelcomeState('select');
      } catch (e: any) {
        console.warn('Platform init failed, running in demo mode:', e?.message);
        setWelcomeState('select');
      }
    };
    init();
  }, []);

  useEffect(() => {
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  if (welcomeState !== 'playing') {
    return <WelcomeScreen onGuestLogin={handleGuestLogin} onSyncLogin={handleSyncLogin} isPlatformReady={welcomeState === 'select'} isLoading={isSyncing} error={platformError} />;
  }

  return (
    <div className="w-full h-full bg-sidebar flex flex-col lg:grid lg:grid-cols-[240px_1fr_240px] items-stretch justify-center shadow-2xl overflow-hidden" onPointerDown={startAudio} style={shakeIntensity > 0 ? { animation: `shake-screen ${shakeIntensity * 40}ms ease-out` } : {}}>
      <LeftPanel score={state.score} level={state.level} nextBubble={state.nextBubble} onSwap={() => { safePlay('uiClick', "G5", "32n"); dispatch({ type: 'SWAP_BUBBLES' }); }} shotsUntilDrop={state.shotsBeforeDrop - state.shotsSinceDrop} shotsBeforeDrop={state.shotsBeforeDrop} gameStatus={state.status} theme={theme} />
      <div className="flex flex-col flex-1 min-w-0 h-full relative overflow-hidden bg-background">
        <GameHeader score={state.score} level={state.level} onShowLeaderboard={() => { safePlay('uiClick', "G5", "32n"); setIsLeaderboardOpen(true); }} onShowShop={() => { safePlay('uiClick', "G5", "32n"); setIsShopOpen(true); }} onShowAchievements={() => { safePlay('uiClick', "G5", "32n"); setIsAchievementsOpen(true); }} onShowHowToPlay={() => { safePlay('uiClick', "G5", "32n"); setIsHowToPlayOpen(true); }} className="lg:hidden shrink-0" isMuted={isMuted} onMuteToggle={() => setIsMuted(!isMuted)} onRestartLevel={() => { safePlay('uiClick', "G5", "32n"); dispatch({ type: 'START_LEVEL', level: state.level }); }} isAuthorized={isAuthorized} onLogin={() => setLoginDialogOpen(true)} playerInfo={playerInfo} onLogout={() => window.location.reload()} />
        <main ref={gameWrapperRef} className="game-viewport">
          <div 
            ref={gameContainerRef} 
            onPointerDown={handlePointerUpdate} 
            onPointerMove={handlePointerUpdate} 
            onPointerUp={handleShoot} 
            className="game-container" 
            style={{ 
              width: GAME_WIDTH, 
              height: GAME_HEIGHT, 
              transform: `scale(${scale})`, 
              transformOrigin: 'center center',
              position: 'relative',
              margin: '0 auto',
              opacity: scale > 0 ? 1 : 0,
              transition: 'opacity 0.1s ease'
            }}
          >
            <GameBoard state={state} poppingBubbles={state.poppingBubbles} trajectoryPath={trajectory} particlesRef={particlesRef} shooterData={{ position: { x: GAME_WIDTH / 2 - BUBBLE_RADIUS, y: GAME_HEIGHT - BUBBLE_DIAMETER }, color: (state.status === 'playing' && !state.flyingBubble) ? (state.activeBonus || state.currentBubble) : null, diameter: BUBBLE_DIAMETER * 0.95 }} theme={theme} clearEffectPhase={clearEffectPhase} screenFlash={screenFlash} />
            {state.panicModeActive && (
              <div className="absolute top-10 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
                <div className="bg-destructive/90 text-destructive-foreground px-6 py-2 rounded-full flex items-center gap-3 animate-pulse shadow-2xl border-2 border-white/20">
                  <AlertTriangle className="w-8 h-8" />
                  <span className="text-4xl font-black">{state.panicModeTimer}s</span>
                </div>
                <div className="mt-2 text-destructive font-black text-2xl uppercase tracking-tighter" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Panic Mode!</div>
              </div>
            )}
            {comboDisplayContent && (
              <div key={comboDisplayContent.key} className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className="animate-combo text-center">
                  <span className="text-6xl font-black text-white" style={{ WebkitTextStroke: '3px hsl(var(--primary))', textShadow: '0 0 30px hsl(var(--primary))' }}>x{comboDisplayContent.count}</span>
                  <span className="block text-3xl font-bold text-accent mt-1" style={{ textShadow: '0 0 15px hsl(var(--accent))' }}>{t('game.combo')}</span>
                </div>
              </div>
            )}
            <FlashEffect active={flashActive} />
            {state.status === 'paused' && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-5xl font-black z-40" onClick={() => { safePlay('uiClick', "G5", "32n"); dispatch({ type: 'PAUSE_TOGGLE' }); }}>{t('game.paused')}</div>}
          </div>
        </main>
        <footer className='w-full p-2 border-t bg-background/90 backdrop-blur-sm z-20 lg:hidden shrink-0'>
          <div className="flex items-center justify-between gap-4 px-4 h-14">
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('game.nextBubbleLabel')}</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10">{state.nextBubble && <div style={dropStyle(state.nextBubble as string, theme)} />}</div>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); safePlay('uiClick', "G5", "32n"); dispatch({ type: 'SWAP_BUBBLES' }); }}>
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button 
                  variant={state.activeBonus === 'bomb' ? 'default' : 'secondary'} 
                  size="icon" 
                  className="h-10 w-10 rounded-xl" 
                  onClick={() => {
                    safePlay('uiClick', "G5", "32n");
                    if (state.activeBonus === 'bomb') {
                      dispatch({ type: 'SELECT_BONUS', bonus: 'bomb' });
                    } else if (state.bombBonusCount > 0) {
                      dispatch({ type: 'SELECT_BONUS', bonus: 'bomb' });
                    }
                  }}
                  disabled={state.bombBonusCount === 0}
                >
                  <Crosshair className="w-5 h-5" />
                </Button>
                <Badge className={cn("absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0.5 text-[10px] font-bold", state.activeBonus === 'bomb' && "bg-accent")}>
                  {state.bombBonusCount}
                </Badge>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <RightPanel 
        bombCount={state.bombBonusCount} 
        activeBonus={state.activeBonus} 
        onSelectBonus={(b) => { safePlay('uiClick', "G5", "32n"); dispatch({ type: 'SELECT_BONUS', bonus: b }); }} 
        gameStatus={state.status} 
        isPaused={state.status === 'paused'} 
        onPauseToggle={() => { safePlay('uiClick', "G5", "32n"); dispatch({ type: 'PAUSE_TOGGLE' }); }} 
        isMuted={isMuted} 
        onMuteToggle={() => setIsMuted(!isMuted)} 
        onShowLeaderboard={() => { safePlay('uiClick', "G5", "32n"); setIsLeaderboardOpen(true); }} 
        onShowAchievements={() => { safePlay('uiClick', "G5", "32n"); setIsAchievementsOpen(true); }} 
        onShowHowToPlay={() => { safePlay('uiClick', "G5", "32n"); setIsHowToPlayOpen(true); }} 
        onShowShop={() => { safePlay('uiClick', "G5", "32n"); setIsShopOpen(true); }} 
        onRestartLevel={() => { safePlay('uiClick', "G5", "32n"); dispatch({ type: 'START_LEVEL', level: state.level }); }} 
        isAuthorized={isAuthorized} 
        onLogin={() => setLoginDialogOpen(true)} 
        playerInfo={playerInfo} 
        isAdShowing={adIsShowing} 
        onLogout={() => window.location.reload()} 
      />
      <GameOverDialog status={state.status} score={state.score} onRestart={() => { safePlay('uiClick', "G5", "32n"); dispatch({ type: 'START_NEW_GAME' }); }} onContinueWithAd={() => platform.showRewardedVideo({ onRewarded: () => dispatch({ type: 'REVIVE_GAME' }) })} />
      <LevelCompleteStats isOpen={state.status === 'level_complete'} onContinue={() => { 
        platform.showFullscreenAd({}); 
        dispatch({ type: 'PROCEED_TO_SHOP' }); 
      }} shots={state.shotsTaken} accuracy={state.shotsTaken > 0 ? Math.round((state.successfulShotsThisLevel / state.shotsTaken) * 100) : 0} bestCombo={state.maxComboThisLevel} bubblesPopped={state.bubblesPoppedThisLevel} timeSpent={state.levelStartTime ? Math.round((Date.now() - state.levelStartTime) / 1000) : 0} />
      <ShopDialog 
        isOpen={state.status === 'shop' || isShopOpen} 
        status={state.status} 
        score={state.score} 
        bombCount={state.bombBonusCount} 
        onBuyBonus={(b, c) => { 
          safePlay('purchase', "G5", "8n");
          dispatch({ type: 'BUY_BONUS', bonus: b, cost: c }); 
        }} 
        onNextLevel={() => { safePlay('uiClick', "G5", "32n"); dispatch({ type: 'NEXT_LEVEL' }); }} 
        onClose={() => { safePlay('uiClick', "G5", "32n"); setIsShopOpen(false); }} 
        onWatchAd={(b) => platform.showRewardedVideo({ onRewarded: () => dispatch({ type: 'ADD_BONUS', bonus: b }) })} 
      />
      <LeaderboardDialog leaderboardName="mainLeaderboard" isOpen={isLeaderboardOpen} onClose={() => { safePlay('uiClick', "G5", "32n"); setIsLeaderboardOpen(false); }} currentScore={state.score} isAuthorized={isAuthorized} />
      <AchievementsDialog isOpen={isAchievementsOpen} onClose={() => { safePlay('uiClick', "G5", "32n"); setIsAchievementsOpen(false); }} playerAchievements={playerAchievements} />
      <HowToPlayDialog isOpen={isHowToPlayOpen} onClose={() => { safePlay('uiClick', "G5", "32n"); setIsHowToPlayOpen(false); }} />
      <LoginDialog isOpen={isLoginDialogOpen} onGuestLogin={() => setLoginDialogOpen(false)} onConfirmLogin={async () => { setIsLoginProcessing(true); if (!await platform.isAuthorized()) await platform.openAuthDialog(); const p = await platform.getPlayer(); if (p) { setIsAuthorized(true); setPlayerInfo({ name: p.getName(), avatar: p.getAvatar() }); } setIsLoginProcessing(false); setLoginDialogOpen(false); }} onOpenChange={setLoginDialogOpen} isProcessing={isLoginProcessing} isPlatformReady={true} />
      <AchievementUnlockedDialog achievement={unlockedQueue?.[0] || null} onClose={() => unlockedQueue?.[0] && acknowledgeUnlock(unlockedQueue[0].id)} onEmitParticles={() => {
        createExplosion(GAME_WIDTH / 2, GAME_HEIGHT / 2, '#FFD700', true);
        safePlay('achievementChord', "C4,E4,G4,C5", "2n");
      }} isClosing={false} />
    </div>
  );
};

export default Game;