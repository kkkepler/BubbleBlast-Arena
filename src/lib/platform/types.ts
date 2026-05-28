export interface PlatformPlayer {
getAvatar(): string;
getName(): string;
getUniqueID(): string;
}

export interface PlatformLeaderboardEntry {
rank: number;
score: number;
name: string;
avatar: string;
isCurrentUser: boolean;
uniqueID: string;
}

export interface IPlatform {
readonly platformId: 'yandex';
isReady: boolean;
init(): Promise<void>;
gameReady(): void;
getPlayer(): Promise<PlatformPlayer | null>;
isAuthorized(): Promise<boolean>;
openAuthDialog(): Promise<boolean>;
canShowAds?(): boolean;
getLeaderboardEntries(leaderboardName: string, currentScore?: number): Promise<{ userEntry: PlatformLeaderboardEntry | null; entries: PlatformLeaderboardEntry[] }>;
setLeaderboardScore(leaderboardName: string, score: number): Promise<void>;
showFullscreenAd(callbacks: { onClose?: (wasShown: boolean) => void; onError?: (error: any) => void }): void;
showRewardedVideo(callbacks: { onOpen?: () => void; onRewarded?: () => void; onClose?: (wasShown: boolean) => void; onError?: (error: any) => void }): void;
getLang(): string;
gameplay: { start(): void; stop(): void; ready(): void };
adv: { showBanner(): Promise<void>; hideBanner(): Promise<void> };
playerData: { get(keys?: string[]): Promise<any>; set(data: object, flush?: boolean): Promise<void> };
}
