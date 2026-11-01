'use client';

import React from 'react';
import { X, Play, ArrowUp, Zap, ShieldAlert, Sparkles, Coins } from 'lucide-react';

interface GameTutorialProps {
  onClose: () => void;
  onPlay: () => void;
}

export const GameTutorial: React.FC<GameTutorialProps> = ({ onClose, onPlay }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-cyber-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider uppercase text-white">
              HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tutorial Steps */}
        <div className="mt-5 flex flex-col gap-4">
          {/* Step 1 */}
          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan flex items-center justify-center shrink-0">
              <ArrowUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Jump & Double Jump</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Press <span className="text-neon-cyan font-bold">Spacebar</span>, <span className="text-neon-cyan font-bold">Arrow Up</span>, or <span className="text-neon-cyan font-bold">Tap Screen</span> to leap. Tap again while in mid-air to trigger an emergency double-jump!
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-neon-red/20 border border-neon-red/50 text-neon-red flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dodge Cyber Hazards</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Neon ground spikes, ceiling lasers, and pulsing energy gates will terminate your run on contact. Jump over or fly through safe gaps!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-neon-amber/20 border border-neon-amber/50 text-neon-amber flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Collect Neon Cores</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Grab glowing golden energy cores to boost your score and bank currency to unlock new futuristic skins in the Locker.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-neon-pink/20 border border-neon-pink/50 text-neon-pink flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Near-Miss & Combos</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Skim past obstacles within razor-thin margins to trigger <span className="text-neon-cyan font-bold">NEAR MISS (+50 pts)</span> and ramp up your combo multiplier to a scorching <span className="text-neon-pink font-bold">5x MAX OVERDRIVE</span>!
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onPlay}
          className="mt-6 w-full py-4 rounded-xl font-black text-lg tracking-wider uppercase text-black bg-gradient-to-r from-neon-cyan via-white to-neon-pink shadow-neon-cyan transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-black" />
          <span>START PLAYING</span>
        </button>
      </div>
    </div>
  );
};
