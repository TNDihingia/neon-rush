import { Achievement, GameStatistics } from './types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_leap',
    title: 'First Flight',
    description: 'Perform your first jump into the neon grid.',
    icon: 'Rocket',
    unlocked: false,
    rewardCoins: 10,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'score_25',
    title: 'Neon Initiate',
    description: 'Score 25 points in a single run.',
    icon: 'Sparkles',
    unlocked: false,
    rewardCoins: 25,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: 'score_50',
    title: 'Cyber Surfer',
    description: 'Score 50 points in a single run.',
    icon: 'Zap',
    unlocked: false,
    rewardCoins: 50,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'score_100',
    title: 'Hyper Legend',
    description: 'Score 100 points in a single run.',
    icon: 'Trophy',
    unlocked: false,
    rewardCoins: 100,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'near_miss_10',
    title: 'Living on the Edge',
    description: 'Trigger 10 near-miss dodges.',
    icon: 'ShieldAlert',
    unlocked: false,
    rewardCoins: 30,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'near_miss_50',
    title: 'Matrix Dodger',
    description: 'Trigger 50 total near-miss dodges.',
    icon: 'Eye',
    unlocked: false,
    rewardCoins: 75,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'coins_50',
    title: 'Coin Collector',
    description: 'Accumulate 50 Neon Coins.',
    icon: 'Coins',
    unlocked: false,
    rewardCoins: 30,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'coins_200',
    title: 'Crypto Tycoon',
    description: 'Accumulate 200 Neon Coins.',
    icon: 'Crown',
    unlocked: false,
    rewardCoins: 80,
    progress: 0,
    maxProgress: 200,
  },
  {
    id: 'combo_3',
    title: 'Flow State',
    description: 'Reach a 3x combo multiplier.',
    icon: 'Flame',
    unlocked: false,
    rewardCoins: 20,
    progress: 1,
    maxProgress: 3,
  },
  {
    id: 'combo_5',
    title: 'Overdrive Mastery',
    description: 'Max out the combo multiplier at 5x.',
    icon: 'FlameKindling',
    unlocked: false,
    rewardCoins: 60,
    progress: 1,
    maxProgress: 5,
  },
  {
    id: 'streak_3',
    title: 'Dedicated Runner',
    description: 'Maintain a 3-day consecutive play streak.',
    icon: 'Calendar',
    unlocked: false,
    rewardCoins: 50,
    progress: 1,
    maxProgress: 3,
  },
];

const STORAGE_KEY = 'neon_rush_achievements';

export const achievementsManager = {
  getAchievements(): Achievement[] {
    if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return INITIAL_ACHIEVEMENTS;
      const stored: Achievement[] = JSON.parse(data);
      return INITIAL_ACHIEVEMENTS.map((initial) => {
        const found = stored.find((s) => s.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  },

  saveAchievements(list: Achievement[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }
  },

  // Check stats and return any newly unlocked achievements
  evaluate(stats: GameStatistics, currentScore: number, currentCombo: number): Achievement[] {
    const list = this.getAchievements();
    const newlyUnlocked: Achievement[] = [];

    list.forEach((ach) => {
      if (ach.unlocked) return;

      let currentProg = ach.progress;

      switch (ach.id) {
        case 'first_leap':
          currentProg = Math.min(ach.maxProgress, stats.totalJumps);
          break;
        case 'score_25':
        case 'score_50':
        case 'score_100':
          currentProg = Math.min(ach.maxProgress, Math.max(stats.highScore, currentScore));
          break;
        case 'near_miss_10':
        case 'near_miss_50':
          currentProg = Math.min(ach.maxProgress, stats.totalNearMisses);
          break;
        case 'coins_50':
        case 'coins_200':
          currentProg = Math.min(ach.maxProgress, stats.totalCoins);
          break;
        case 'combo_3':
        case 'combo_5':
          currentProg = Math.min(ach.maxProgress, Math.max(stats.maxComboAllTime, currentCombo));
          break;
        case 'streak_3':
          currentProg = Math.min(ach.maxProgress, stats.dailyStreak);
          break;
      }

      ach.progress = currentProg;

      if (currentProg >= ach.maxProgress) {
        ach.unlocked = true;
        newlyUnlocked.push(ach);
      }
    });

    this.saveAchievements(list);
    return newlyUnlocked;
  },
};
