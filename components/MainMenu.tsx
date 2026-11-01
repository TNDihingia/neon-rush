'use client';

import React from 'react';
import { Play, Trophy, Coins, Flame, Palette, Award, Settings, HelpCircle, Volume2, VolumeX, PlaySquare } from 'lucide-react';
import { GameStatistics, PlayerSkin, DailyChallenge } from '@/lib/types';
import { AdBanner } from './AdBanner';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenSkins: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onToggleSound: () => void;
  onEarnCoinsAd?: () => void;
  stats: GameStatistics;
  currentSkin: PlayerSkin;
  dailyChallenge: DailyChallenge;
  isMuted: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenSkins,
  onOpenAchievements,
  onOpenSettings,
  onOpenTutorial,
  onToggleSound,
  onEarnCoinsAd,
  stats,
  currentSkin,
  dailyChallenge,
  isMuted,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full p-4 sm:p-5 max-w-4xl mx-auto select-none overflow-y-auto">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between gap-2 z-10">
        {/* Stats Pills */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyber-card border border-neon-cyan/30 text-neon-cyan shadow-sm backdrop-blur-md">
            <Trophy className="w-4 h-4 text-neon-amber" />
            <span className="text-xs font-semibold tracking-wider text-gray-300">BEST:</span>
            <span className="font-bold text-sm tracking-wide text-white">{stats.highScore}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyber-card border border-neon-amber/30 text-neon-amber shadow-sm backdrop-blur-md">
            <Coins className="w-4 h-4 text-neon-amber animate-pulse" />
            <span className="font-bold text-sm text-white">{stats.totalCoins}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyber-card border border-neon-pink/30 text-neon-pink shadow-sm backdrop-blur-md">
            <Flame className="w-4 h-4 text-neon-pink" />
            <span className="text-xs font-bold text-white">{stats.dailyStreak}D STREAK</span>
          </div>
        </div>

        {/* Quick Sound, Ad Coins & Settings */}
        <div className="flex items-center gap-2">
          {onEarnCoinsAd && (
            <button
              onClick={onEarnCoinsAd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-amber/15 border border-neon-amber/40 hover:border-neon-amber text-neon-amber text-xs font-bold font-mono transition-all active:scale-95 shadow-sm"
              title="Watch Ad for 50 Free Coins"
            >
              <PlaySquare className="w-3.5 h-3.5 fill-neon-amber" />
              <span>+50 COINS</span>
            </button>
          )}

          <button
            onClick={onToggleSound}
            aria-label="Toggle sound"
            className="p-2 rounded-full bg-cyber-card border border-white/10 hover:border-neon-cyan/50 text-gray-300 hover:text-neon-cyan transition-all duration-200 active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neon-red" /> : <Volume2 className="w-4 h-4 text-neon-cyan" />}
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 rounded-full bg-cyber-card border border-white/10 hover:border-neon-cyan/50 text-gray-300 hover:text-neon-cyan transition-all duration-200 active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Title & Logo Section */}
      <div className="flex flex-col items-center justify-center my-auto py-4 text-center z-10">
        {/* Glowing Geometric Core Icon */}
        <div className="relative mb-3 group cursor-pointer" onClick={onOpenSkins}>
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 shadow-neon-cyan transition-transform duration-300 group-hover:scale-105"
            style={{
              borderColor: currentSkin.primaryColor,
              backgroundColor: 'rgba(5, 5, 20, 0.85)',
              boxShadow: `0 0 25px ${currentSkin.glowColor}80`,
            }}
          >
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rotate-45 border-2 transition-all duration-500 group-hover:rotate-90"
              style={{
                borderColor: currentSkin.secondaryColor,
                backgroundColor: currentSkin.primaryColor,
                boxShadow: `0 0 15px ${currentSkin.glowColor}`,
              }}
            />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-widest bg-cyber-dark border border-neon-cyan/40 text-neon-cyan whitespace-nowrap">
            {currentSkin.name}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase font-mono italic">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-pink drop-shadow-[0_0_25px_rgba(0,240,255,0.8)]">
            NEON
          </span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan drop-shadow-[0_0_25px_rgba(255,0,127,0.8)]">
            RUSH
          </span>
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">
          High-Velocity Cyber Arcade
        </p>

        {/* Big Glowing Play Button */}
        <div className="mt-6 flex flex-col items-center">
          <button
            onClick={onStartGame}
            className="relative group px-10 py-3.5 sm:px-12 sm:py-4 rounded-2xl font-black text-lg sm:text-xl tracking-wider uppercase text-black bg-gradient-to-r from-neon-cyan via-white to-neon-pink shadow-neon-cyan hover:shadow-neon-pink transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
            <span>PLAY NOW</span>
          </button>
          <span className="mt-2 text-[11px] tracking-widest uppercase text-gray-400 font-mono">
            Press <span className="text-neon-cyan font-bold">[Space]</span> or Tap to Start
          </span>
        </div>
      </div>

      {/* Daily Challenge & Secondary Actions */}
      <div className="w-full flex flex-col sm:flex-row items-stretch justify-between gap-3 z-10 mt-auto">
        {/* Daily Challenge Card */}
        <div className="flex-1 p-3 rounded-xl bg-cyber-card border border-neon-purple/30 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-neon-purple/20 text-neon-purple border border-neon-purple/40">
                DAILY MISSION
              </span>
              <span className="text-xs font-semibold text-gray-300">{dailyChallenge.title}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">{dailyChallenge.description}</p>
          </div>
          <div className="flex flex-col items-end pl-3">
            <span className="flex items-center gap-1 text-neon-amber font-bold text-xs">
              <Coins className="w-3 h-3" /> +{dailyChallenge.rewardCoins}
            </span>
            <span className={`text-[9px] font-bold uppercase mt-0.5 ${dailyChallenge.completed ? 'text-neon-lime' : 'text-gray-400'}`}>
              {dailyChallenge.completed ? 'COMPLETED' : 'INCOMPLETE'}
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onOpenSkins}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyber-card border border-white/10 hover:border-neon-cyan/50 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-200 hover:bg-neon-cyan/10 active:scale-95"
          >
            <Palette className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Skins</span>
          </button>

          <button
            onClick={onOpenAchievements}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyber-card border border-white/10 hover:border-neon-amber/50 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-200 hover:bg-neon-amber/10 active:scale-95"
          >
            <Award className="w-3.5 h-3.5 text-neon-amber" />
            <span>Badges</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="flex items-center justify-center p-2.5 rounded-xl bg-cyber-card border border-white/10 hover:border-neon-pink/50 text-white transition-all duration-200 hover:bg-neon-pink/10 active:scale-95"
            title="How to Play"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neon-pink" />
          </button>
        </div>
      </div>

      {/* AdSense Placement Banner */}
      <div className="w-full mt-2.5 z-10">
        <AdBanner slotId="1122334455" format="horizontal" />
      </div>
    </div>
  );
};
