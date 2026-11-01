export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface PlayerSkin {
  id: string;
  name: string;
  description: string;
  primaryColor: string; // Main neon stroke & fill
  secondaryColor: string; // Inner core glow
  glowColor: string; // Canvas shadow color
  trailColor: string; // Hex / rgba for motion trail
  cost: number; // In Neon Coins
  unlocked: boolean;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  rotation: number;
  isGrounded: boolean;
  canDoubleJump: boolean;
  jumpCount: number;
  trail: { x: number; y: number; alpha: number; rotation: number }[];
  trailTimer: number;
}

export type ObstacleType = 
  | 'GROUND_SPIKE'       // Triangular neon barrier
  | 'DOUBLE_SPIKE'       // Two adjacent spikes
  | 'CEILING_HAZARD'     // Hanging neon beam / laser
  | 'FLOATING_PULSE'     // Mid-air diamond oscillating vertically
  | 'GATE_PORTAL';       // Top and bottom barrier leaving a gap

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  glowColor: string;
  oscillationOffset?: number;
  oscillationSpeed?: number;
  oscillationRange?: number;
  passed: boolean;
  nearMissAwarded: boolean;
  gapY?: number; // for gate portal
  gapHeight?: number;
}

export type CollectibleType = 'COIN' | 'HYPER_ORB';

export interface Collectible {
  id: number;
  type: CollectibleType;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  collected: boolean;
  value: number;
  oscillationOffset: number;
  spin: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'line';
  rotation?: number;
  vRot?: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  life: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rewardCoins: number;
  progress: number;
  maxProgress: number;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  targetScore: number;
  rewardCoins: number;
  completed: boolean;
}

export interface GameSettings {
  sfxVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  sfxMuted: boolean;
  musicMuted: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  showFps: boolean;
  scanlines: boolean;
}

export interface GameStatistics {
  highScore: number;
  totalCoins: number;
  gamesPlayed: number;
  totalJumps: number;
  totalNearMisses: number;
  maxComboAllTime: number;
  dailyStreak: number;
  lastPlayedDate: string;
  distanceTraveled: number;
}
