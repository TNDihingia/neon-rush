'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameSettings, GameStatistics, PlayerSkin, DailyChallenge, Achievement } from '@/lib/types';
import { storage } from '@/lib/storage';
import { achievementsManager } from '@/lib/achievements';
import { audio } from '@/lib/audio';
import { adManager } from '@/lib/adsense';
import { MainMenu } from '@/components/MainMenu';
import { GameCanvas } from '@/components/GameCanvas';
import { SettingsModal } from '@/components/SettingsModal';
import { SkinsModal } from '@/components/SkinsModal';
import { AchievementsModal } from '@/components/AchievementsModal';
import { GameTutorial } from '@/components/GameTutorial';
import { Trophy } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>('MENU');

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showSkins, setShowSkins] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Data & Settings
  const [settings, setSettings] = useState<GameSettings>(storage.getSettings());
  const [stats, setStats] = useState<GameStatistics>(storage.getStats());
  const [skins, setSkins] = useState<PlayerSkin[]>(storage.getSkins());
  const [selectedSkinId, setSelectedSkinId] = useState<string>(storage.getSelectedSkinId());
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(storage.getDailyChallenge());
  const [achievements, setAchievements] = useState<Achievement[]>(achievementsManager.getAchievements());

  // Unlock Toast Alert
  const [unlockedToast, setUnlockedToast] = useState<string | null>(null);

  // Sync client data on mount
  useEffect(() => {
    setMounted(true);
    const loadedSettings = storage.getSettings();
    const loadedStats = storage.getStats();
    const loadedSkins = storage.getSkins();
    const loadedSkinId = storage.getSelectedSkinId();
    const loadedDaily = storage.getDailyChallenge();
    const loadedAch = achievementsManager.getAchievements();

    setSettings(loadedSettings);
    setStats(loadedStats);
    setSkins(loadedSkins);
    setSelectedSkinId(loadedSkinId);
    setDailyChallenge(loadedDaily);
    setAchievements(loadedAch);

    // Update streak
    const streak = storage.updateDailyStreak();
    setStats((prev) => ({ ...prev, dailyStreak: streak }));

    // Apply audio settings
    audio.setSettings(loadedSettings);

    // Show tutorial if first time player
    if (loadedStats.gamesPlayed === 0) {
      setShowTutorial(true);
    }
  }, []);

  const currentSkin = skins.find((s) => s.id === selectedSkinId) || skins[0];

  // Start Game
  const handleStartGame = useCallback(() => {
    setGameState('PLAYING');
    audio.playClick();
    if (!settings.musicMuted) {
      audio.startMusic();
    }
  }, [settings.musicMuted]);

  // Keyboard shortcut to start game from Menu
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'MENU' && e.code === 'Space') {
        if (!showSettings && !showSkins && !showAchievements && !showTutorial) {
          e.preventDefault();
          handleStartGame();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, showSettings, showSkins, showAchievements, showTutorial, handleStartGame]);

  // Return to Main Menu
  const handleMainMenu = () => {
    setGameState('MENU');
    audio.stopMusic();
    audio.playClick();
  };

  // Game Over Handler
  const handleGameOver = (
    finalScore: number,
    coinsEarned: number,
    maxCombo: number,
    isNewHigh: boolean
  ) => {
    setGameState('GAMEOVER');

    // Update statistics
    const newStats: GameStatistics = {
      ...stats,
      highScore: Math.max(stats.highScore, finalScore),
      totalCoins: stats.totalCoins + coinsEarned,
      gamesPlayed: stats.gamesPlayed + 1,
      maxComboAllTime: Math.max(stats.maxComboAllTime, maxCombo),
    };

    // Check Daily Challenge
    if (!dailyChallenge.completed && finalScore >= dailyChallenge.targetScore) {
      const updatedDaily: DailyChallenge = {
        ...dailyChallenge,
        completed: true,
      };
      newStats.totalCoins += dailyChallenge.rewardCoins;
      setDailyChallenge(updatedDaily);
      storage.saveDailyChallenge(updatedDaily);
      setUnlockedToast(`DAILY CHALLENGE COMPLETE: +${dailyChallenge.rewardCoins} COINS!`);
      setTimeout(() => setUnlockedToast(null), 4000);
    }

    // Check achievements
    const newlyUnlocked = achievementsManager.evaluate(newStats, finalScore, maxCombo);
    if (newlyUnlocked.length > 0) {
      let bonusCoins = 0;
      newlyUnlocked.forEach((ach) => {
        bonusCoins += ach.rewardCoins;
      });
      newStats.totalCoins += bonusCoins;
      setAchievements(achievementsManager.getAchievements());
      setUnlockedToast(`ACHIEVEMENT UNLOCKED: ${newlyUnlocked[0].title}! (+${newlyUnlocked[0].rewardCoins} COINS)`);
      setTimeout(() => setUnlockedToast(null), 4500);
    }

    setStats(newStats);
    storage.saveStats(newStats);
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    audio.setSettings(newSettings);
    if (newSettings.musicMuted) {
      audio.stopMusic();
    } else if (gameState === 'PLAYING') {
      audio.startMusic();
    }
  };

  // Quick sound toggle
  const handleToggleSound = () => {
    const isMuted = settings.sfxMuted && settings.musicMuted;
    const newSettings: GameSettings = {
      ...settings,
      sfxMuted: !isMuted,
      musicMuted: !isMuted,
    };
    handleUpdateSettings(newSettings);
  };

  // Select Skin
  const handleSelectSkin = (skinId: string) => {
    setSelectedSkinId(skinId);
    storage.saveSelectedSkinId(skinId);
  };

  // Unlock Skin
  const handleUnlockSkin = (skinId: string, cost: number): boolean => {
    if (stats.totalCoins >= cost) {
      const newCoins = stats.totalCoins - cost;
      const updatedSkins = skins.map((s) => (s.id === skinId ? { ...s, unlocked: true } : s));
      const updatedStats = { ...stats, totalCoins: newCoins };

      setSkins(updatedSkins);
      setStats(updatedStats);
      storage.saveSkins(updatedSkins);
      storage.saveStats(updatedStats);
      return true;
    }
    return false;
  };

  // Rewarded Ad: Claim 50 free coins
  const handleEarnCoinsWithAd = () => {
    adManager.showRewardedAd({
      rewardName: 'free_coins_50',
      onRewardEarned: () => {
        const bonusCoins = 50;
        const newStats = {
          ...stats,
          totalCoins: stats.totalCoins + bonusCoins,
        };
        setStats(newStats);
        storage.saveStats(newStats);
        audio.playCoin();
        setUnlockedToast('REWARD CLAIMED: +50 NEON COINS!');
        setTimeout(() => setUnlockedToast(null), 3500);
      },
    });
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-cyber-dark text-white font-mono">
        <div className="w-12 h-12 rounded-xl border-2 border-neon-cyan border-t-transparent animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest text-neon-cyan">
          INITIALIZING NEON GRID...
        </span>
      </div>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-background flex flex-col items-center justify-center">
      {/* Background Ambience Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-accent/30 via-background to-background pointer-events-none" />

      {/* Main Game Surface */}
      <div className="relative w-full h-full max-w-5xl max-h-[720px] sm:aspect-video flex items-center justify-center">
        {gameState === 'MENU' ? (
          <MainMenu
            onStartGame={handleStartGame}
            onOpenSkins={() => setShowSkins(true)}
            onOpenAchievements={() => setShowAchievements(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenTutorial={() => setShowTutorial(true)}
            onToggleSound={handleToggleSound}
            onEarnCoinsAd={handleEarnCoinsWithAd}
            stats={stats}
            currentSkin={currentSkin}
            dailyChallenge={dailyChallenge}
            isMuted={settings.sfxMuted && settings.musicMuted}
          />
        ) : (
          <GameCanvas
            gameState={gameState}
            currentSkin={currentSkin}
            settings={settings}
            highScore={stats.highScore}
            onGameOver={handleGameOver}
            onMainMenu={handleMainMenu}
            onOpenSkins={() => setShowSkins(true)}
            onToggleSound={handleToggleSound}
          />
        )}
      </div>

      {/* Achievement Unlocked Toast Notification */}
      {unlockedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-cyber-card border border-neon-amber text-white font-mono text-xs font-bold shadow-neon-cyan animate-bounce backdrop-blur-md">
          <Trophy className="w-4 h-4 text-neon-amber shrink-0" />
          <span>{unlockedToast}</span>
        </div>
      )}

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showSkins && (
        <SkinsModal
          skins={skins}
          selectedSkinId={selectedSkinId}
          totalCoins={stats.totalCoins}
          onSelectSkin={handleSelectSkin}
          onUnlockSkin={handleUnlockSkin}
          onEarnCoinsAd={handleEarnCoinsWithAd}
          onClose={() => setShowSkins(false)}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          onPlay={() => {
            setShowTutorial(false);
            handleStartGame();
          }}
        />
      )}
    </main>
  );
}
