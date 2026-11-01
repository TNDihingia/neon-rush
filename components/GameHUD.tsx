'use client';

import React from 'react';
import { Pause, Play, Coins, Trophy, Zap, Volume2, VolumeX } from 'lucide-react';

interface GameHUDProps {
  score: number;
  highScore: number;
  coins: number;
  combo: number;
  comboTimerRatio: number; // 0 to 1
  speedLevel: number;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onTouchJump: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  coins,
  combo,
  comboTimerRatio,
  speedLevel,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleSound,
  onTouchJump,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5">
      {/* Top Header Live Info */}
      <div className="w-full flex items-center justify-between gap-2 pointer-events-auto z-20">
        {/* Left: Score & High Score */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-neon-cyan uppercase">
              SCORE
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_12px_rgba(0,240,255,0.7)]">
              {score}
            </span>
          </div>

          <div className="hidden sm:flex flex-col pl-3 border-l border-white/10">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-1">
              <Trophy className="w-3 h-3 text-neon-amber" /> BEST
            </span>
            <span className="text-sm font-mono font-bold text-gray-300">
              {Math.max(score, highScore)}
            </span>
          </div>
        </div>

        {/* Center: Warp Speed Level */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-card border border-neon-cyan/40 backdrop-blur-md shadow-neon-cyan/20">
          <Zap className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-widest text-neon-cyan uppercase">
            WARP {speedLevel}
          </span>
        </div>

        {/* Right: Coins, Sound, Pause */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyber-card border border-neon-amber/30 text-neon-amber backdrop-blur-md">
            <Coins className="w-4 h-4 text-neon-amber" />
            <span className="font-mono font-bold text-sm text-white">{coins}</span>
          </div>

          {/* Quick Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded-full bg-cyber-card border border-white/10 hover:border-neon-cyan/50 text-gray-300 hover:text-neon-cyan transition-all active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neon-red" /> : <Volume2 className="w-4 h-4 text-neon-cyan" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            aria-label={isPaused ? "Resume" : "Pause"}
            className="p-2 rounded-full bg-cyber-card border border-white/10 hover:border-neon-pink/50 text-gray-300 hover:text-neon-pink transition-all active:scale-95"
          >
            {isPaused ? <Play className="w-4 h-4 text-neon-lime" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pause Overlay (when paused) */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto z-30">
          <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-neon-cyan/50 text-center max-w-sm w-full mx-4 shadow-neon-cyan">
            <h2 className="text-3xl font-black tracking-wider text-neon-cyan font-mono uppercase mb-2">
              GAME PAUSED
            </h2>
            <p className="text-xs text-gray-400 font-mono mb-6">
              Take a breath. The grid is waiting.
            </p>
            <button
              onClick={onTogglePause}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-pink text-black font-black tracking-widest text-lg uppercase shadow-neon-cyan transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" /> RESUME RUN
            </button>
          </div>
        </div>
      )}

      {/* Bottom Combo Bar & Mobile Tap Trigger */}
      <div className="w-full flex flex-col items-center gap-2 pointer-events-auto z-20">
        {/* Combo Multiplier Meter */}
        <div className={`transition-all duration-300 ${combo > 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyber-card border border-neon-pink/50 backdrop-blur-md shadow-neon-pink/30">
            <span className="text-[11px] font-mono font-bold tracking-wider text-neon-pink uppercase">
              COMBO
            </span>
            <span className="font-mono font-black text-lg text-white drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]">
              {combo}x
            </span>
          </div>

          {/* Combo Decay Bar */}
          <div className="w-28 h-1.5 bg-black/60 rounded-full mt-1 overflow-hidden border border-white/10 mx-auto">
            <div
              className="h-full bg-gradient-to-r from-neon-pink to-neon-amber transition-all duration-75"
              style={{ width: `${Math.max(0, Math.min(100, comboTimerRatio * 100))}%` }}
            />
          </div>
        </div>

        {/* Mobile Full Screen Tap Zone (Ergonomic trigger) */}
        <div
          onClick={onTouchJump}
          onTouchStart={(e) => {
            e.preventDefault();
            onTouchJump();
          }}
          className="w-full h-24 sm:h-28 rounded-2xl border border-white/5 hover:border-white/15 bg-white/[0.02] active:bg-neon-cyan/[0.08] transition-colors flex items-center justify-center cursor-pointer touch-none"
        >
          <span className="text-xs uppercase font-mono tracking-widest text-gray-500 font-semibold">
            Tap anywhere to jump / double jump
          </span>
        </div>
      </div>
    </div>
  );
};
