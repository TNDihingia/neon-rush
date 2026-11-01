'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, Home, Share2, Trophy, Coins, Flame, Palette, Check, PlaySquare, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { adManager } from '@/lib/adsense';
import { AdBanner } from './AdBanner';

interface GameOverProps {
  score: number;
  highScore: number;
  coinsEarned: number;
  maxCombo: number;
  isNewHigh: boolean;
  onRestart: () => void;
  onRevive?: () => void;
  hasRevived?: boolean;
  onMainMenu: () => void;
  onOpenSkins: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  score,
  highScore,
  coinsEarned,
  maxCombo,
  isNewHigh,
  onRestart,
  onRevive,
  hasRevived = false,
  onMainMenu,
  onOpenSkins,
}) => {
  const [copied, setCopied] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  useEffect(() => {
    if (isNewHigh && score > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff007f', '#bd00ff', '#ffb703'],
        });
      } catch {
        // Fallback
      }
    }
  }, [isNewHigh, score]);

  const handleShare = async () => {
    const text = `⚡ I just scored ${score} points in NEON RUSH with a ${maxCombo}x combo! Can you beat my high score? #NeonRush #Arcade`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEON RUSH Arcade Score',
          text,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleRestartWithAd = () => {
    adManager.showInterstitialAd({
      onComplete: () => {
        onRestart();
      },
    });
  };

  const handleWatchAdRevive = () => {
    if (!onRevive || hasRevived || isWatchingAd) return;
    setIsWatchingAd(true);

    adManager.showRewardedAd({
      rewardName: 'revive_run',
      onRewardEarned: () => {
        setIsWatchingAd(false);
        onRevive();
      },
      onDismissed: () => {
        setIsWatchingAd(false);
      },
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 max-w-md mx-auto select-none z-30 overflow-y-auto">
      {/* Game Over Container Card */}
      <div className="w-full p-5 sm:p-7 rounded-3xl bg-cyber-card border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
        {/* New High Score Pill */}
        {isNewHigh && (
          <div className="mb-2.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-neon-pink to-neon-amber text-black font-black text-xs uppercase tracking-widest animate-bounce shadow-neon-pink">
            ★ NEW PERSONAL BEST! ★
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-neon-red via-white to-neon-pink drop-shadow-[0_0_15px_rgba(255,42,95,0.7)]">
          CRASH DETECTED
        </h2>
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-mono mt-0.5">
          Grid Matrix Terminated
        </p>

        {/* Score Display Card */}
        <div className="my-4 w-full py-4 px-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col items-center">
          <span className="text-xs font-mono font-bold tracking-widest text-neon-cyan uppercase">
            FINAL SCORE
          </span>
          <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.8)] mt-0.5">
            {score}
          </span>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-3.5 border-t border-white/10 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                <Trophy className="w-3 h-3 text-neon-amber" /> BEST
              </span>
              <span className="font-mono font-bold text-sm text-gray-200 mt-0.5">
                {highScore}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                <Coins className="w-3 h-3 text-neon-amber" /> COINS
              </span>
              <span className="font-mono font-bold text-sm text-neon-amber mt-0.5">
                +{coinsEarned}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 text-neon-pink" /> COMBO
              </span>
              <span className="font-mono font-bold text-sm text-neon-pink mt-0.5">
                {maxCombo}x
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Rewarded Ad: Revive (Available once per run) */}
          {onRevive && !hasRevived && (
            <button
              onClick={handleWatchAdRevive}
              className="w-full py-3.5 rounded-xl font-black text-sm sm:text-base tracking-wider uppercase text-black bg-gradient-to-r from-neon-lime via-white to-neon-cyan shadow-neon-lime hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <PlaySquare className="w-4 h-4 fill-black" />
              <span>WATCH AD TO REVIVE (1 LEFT)</span>
              <Shield className="w-4 h-4 text-emerald-800" />
            </button>
          )}

          {/* Retry Button */}
          <button
            onClick={handleRestartWithAd}
            className="w-full py-3.5 rounded-xl font-black text-base tracking-wider uppercase text-black bg-gradient-to-r from-neon-cyan via-white to-neon-pink shadow-neon-cyan hover:shadow-neon-pink transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 fill-black" />
            <span>PLAY AGAIN</span>
          </button>

          {/* Share & Skin Customization */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 rounded-xl bg-cyber-dark border border-white/10 hover:border-neon-cyan/50 text-white font-bold text-xs uppercase tracking-wider transition-all hover:bg-neon-cyan/10 active:scale-95 flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-neon-lime" /> : <Share2 className="w-4 h-4 text-neon-cyan" />}
              <span>{copied ? 'COPIED!' : 'SHARE'}</span>
            </button>

            <button
              onClick={onOpenSkins}
              className="py-2.5 rounded-xl bg-cyber-dark border border-white/10 hover:border-neon-pink/50 text-white font-bold text-xs uppercase tracking-wider transition-all hover:bg-neon-pink/10 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Palette className="w-4 h-4 text-neon-pink" />
              <span>SKINS</span>
            </button>
          </div>

          {/* Main Menu Button */}
          <button
            onClick={onMainMenu}
            className="w-full py-2.5 rounded-xl bg-transparent border border-white/10 hover:border-white/30 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>

        {/* AdSense Display Banner Slot */}
        <div className="w-full mt-3">
          <AdBanner slotId="9876543210" format="horizontal" />
        </div>

        <span className="mt-2 text-[10px] font-mono tracking-widest uppercase text-gray-400">
          Press <span className="text-neon-cyan font-bold">[Space]</span> for instant restart
        </span>
      </div>
    </div>
  );
};
