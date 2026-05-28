import type { IPlatform, PlatformPlayer, PlatformLeaderboardEntry } from './types';

class SimplePlayer implements PlatformPlayer {
  getName() { return 'Player'; }
  getAvatar() { return ''; }
  getUniqueID() { return 'local-' + Date.now(); }
}

export class SimplePlatform implements IPlatform {
  platformId = 'yandex' as const;
  isReady = true;

  async init() {
    console.log('Simple platform initialized');
  }

  gameReady() {}

  async getPlayer(): Promise<PlatformPlayer | null> {
    return new SimplePlayer();
  }

  async isAuthorized(): Promise<boolean> {
    return false;
  }

  async openAuthDialog(): Promise<boolean> {
    return false;
  }

  async getLeaderboardEntries(name: string, score?: number) {
    return { userEntry: null, entries: [] };
  }

  async setLeaderboardScore(name: string, score: number) {}

  showFullscreenAd(c: { onClose?: (s: boolean) => void; onError?: (e: any) => void }) {
    setTimeout(() => c.onClose?.(false), 100);
  }

  showRewardedVideo(c: { onRewarded?: () => void; onClose?: (s: boolean) => void; onError?: (e: any) => void }) {
    setTimeout(() => {
      c.onRewarded?.();
      c.onClose?.(true);
    }, 100);
  }

  getLang() {
    return 'ru';
  }

  gameplay = {
    start: () => {},
    stop: () => {},
    ready: () => {}
  };

  adv = {
    showBanner: async () => {},
    hideBanner: async () => {}
  };

  playerData = {
    get: async (keys?: string[]) => {
      return {};
    },
    set: async (data: object, flush?: boolean) => {}
  };
}
