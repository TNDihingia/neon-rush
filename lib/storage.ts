import { GameSettings, GameStatistics, PlayerSkin, Achievement, DailyChallenge } from './types';

export const DEFAULT_SKINS: PlayerSkin[] = [
  {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    description: 'The iconic glowing electric core of Neon Rush.',
    primaryColor: '#00f0ff',
    secondaryColor: '#ffffff',
    glowColor: '#00f0ff',
    trailColor: 'rgba(0, 240, 255, 0.45)',
    cost: 0,
    unlocked: true,
  },
  {
    id: 'synth-pink',
    name: 'Synth Pink',
    description: 'Vibrant retrowave aura pulsating with 80s nostalgia.',
    primaryColor: '#ff007f',
    secondaryColor: '#ffe6f2',
    glowColor: '#ff007f',
    trailColor: 'rgba(255, 0, 127, 0.45)',
    cost: 50,
    unlocked: false,
  },
  {
    id: 'acid-lime',
    name: 'Matrix Lime',
    description: 'Bio-luminescent cyber-matrix high-energy core.',
    primaryColor: '#39ff14',
    secondaryColor: '#eaffea',
    glowColor: '#39ff14',
    trailColor: 'rgba(57, 255, 20, 0.45)',
    cost: 100,
    unlocked: false,
  },
  {
    id: 'solar-gold',
    name: 'Solar Overdrive',
    description: 'Radiant golden plasma forged in cybernetic stars.',
    primaryColor: '#ffb703',
    secondaryColor: '#fff9e6',
    glowColor: '#fb8500',
    trailColor: 'rgba(255, 183, 3, 0.45)',
    cost: 175,
    unlocked: false,
  },
  {
    id: 'void-violet',
    name: 'Void Violet',
    description: 'Deep ultraviolet singularity capable of bending photons.',
    primaryColor: '#bd00ff',
    secondaryColor: '#f5e6ff',
    glowColor: '#bd00ff',
    trailColor: 'rgba(189, 0, 255, 0.45)',
    cost: 250,
    unlocked: false,
  },
  {
    id: 'phantom-ghost',
    name: 'Phantom Ghost',
    description: 'Translucent iridescent spectrum with hyper-velocity glow.',
    primaryColor: '#ffffff',
    secondaryColor: '#00ffff',
    glowColor: '#ffffff',
    trailColor: 'rgba(255, 255, 255, 0.6)',
    cost: 400,
    unlocked: false,
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  sfxVolume: 0.7,
  musicVolume: 0.5,
  sfxMuted: false,
  musicMuted: false,
  reducedMotion: false,
  highContrast: false,
  showFps: false,
  scanlines: true,
};

export const DEFAULT_STATS: GameStatistics = {
  highScore: 0,
  totalCoins: 0,
  gamesPlayed: 0,
  totalJumps: 0,
  totalNearMisses: 0,
  maxComboAllTime: 1,
  dailyStreak: 1,
  lastPlayedDate: '',
  distanceTraveled: 0,
};

const STORAGE_KEYS = {
  SETTINGS: 'neon_rush_settings',
  STATS: 'neon_rush_stats',
  SKINS: 'neon_rush_skins',
  SELECTED_SKIN: 'neon_rush_selected_skin',
  ACHIEVEMENTS: 'neon_rush_achievements',
  DAILY_CHALLENGE: 'neon_rush_daily_challenge',
};

export const storage = {
  getSettings(): GameSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: GameSettings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  },

  getStats(): GameStatistics {
    if (typeof window === 'undefined') return DEFAULT_STATS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  },

  saveStats(stats: GameStatistics) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  },

  getSkins(): PlayerSkin[] {
    if (typeof window === 'undefined') return DEFAULT_SKINS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SKINS);
      if (!data) return DEFAULT_SKINS;
      const storedSkins: PlayerSkin[] = JSON.parse(data);
      // Merge with default list to preserve new skins
      return DEFAULT_SKINS.map((def) => {
        const found = storedSkins.find((s) => s.id === def.id);
        return found ? { ...def, unlocked: found.unlocked } : def;
      });
    } catch {
      return DEFAULT_SKINS;
    }
  },

  saveSkins(skins: PlayerSkin[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SKINS, JSON.stringify(skins));
    } catch {
      // Ignore
    }
  },

  getSelectedSkinId(): string {
    if (typeof window === 'undefined') return DEFAULT_SKINS[0].id;
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_SKIN) || DEFAULT_SKINS[0].id;
    } catch {
      return DEFAULT_SKINS[0].id;
    }
  },

  saveSelectedSkinId(id: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_SKIN, id);
    } catch {
      // Ignore
    }
  },

  getDailyChallenge(): DailyChallenge {
    const today = new Date().toISOString().split('T')[0];
    const defaultChallenge: DailyChallenge = {
      date: today,
      title: 'Neon Overdrive',
      description: 'Score 50+ points in a single run',
      targetScore: 50,
      rewardCoins: 35,
      completed: false,
    };

    if (typeof window === 'undefined') return defaultChallenge;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);
      if (!data) return defaultChallenge;
      const parsed: DailyChallenge = JSON.parse(data);
      if (parsed.date === today) {
        return parsed;
      }
      // New day challenge
      return defaultChallenge;
    } catch {
      return defaultChallenge;
    }
  },

  saveDailyChallenge(challenge: DailyChallenge) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE, JSON.stringify(challenge));
    } catch {
      // Ignore
    }
  },

  updateDailyStreak(): number {
    const stats = this.getStats();
    const today = new Date().toISOString().split('T')[0];
    if (!stats.lastPlayedDate) {
      stats.dailyStreak = 1;
      stats.lastPlayedDate = today;
    } else if (stats.lastPlayedDate !== today) {
      const last = new Date(stats.lastPlayedDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        stats.dailyStreak += 1;
      } else if (diffDays > 1) {
        stats.dailyStreak = 1;
      }
      stats.lastPlayedDate = today;
    }
    this.saveStats(stats);
    return stats.dailyStreak;
  },
};
