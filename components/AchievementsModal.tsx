'use client';

import React from 'react';
import { X, Trophy, CheckCircle2, Lock, Rocket, Sparkles, Zap, ShieldAlert, Eye, Coins, Crown, Flame, FlameKindling, Calendar } from 'lucide-react';
import { Achievement } from '@/lib/types';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  Coins: <Coins className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  FlameKindling: <FlameKindling className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-cyber-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-neon-amber" />
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider uppercase text-white">
              ACHIEVEMENTS
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-neon-cyan px-2.5 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30">
              {unlockedCount} / {achievements.length} UNLOCKED
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Badges */}
        <div className="mt-4 flex flex-col gap-3 overflow-y-auto pr-1">
          {achievements.map((ach) => {
            const progressRatio = Math.min(1, ach.progress / ach.maxProgress);
            const icon = ICON_MAP[ach.icon] || <Trophy className="w-5 h-5" />;

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all ${
                  ach.unlocked
                    ? 'border-neon-amber/40 bg-neon-amber/5'
                    : 'border-white/5 bg-black/40 opacity-75'
                }`}
              >
                {/* Badge Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'border-neon-amber bg-neon-amber/20 text-neon-amber shadow-sm'
                      : 'border-white/10 bg-white/5 text-gray-500'
                  }`}
                >
                  {ach.unlocked ? icon : <Lock className="w-4 h-4" />}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        ach.unlocked ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {ach.title}
                    </h4>
                    <span className="text-xs font-mono font-bold text-neon-amber flex items-center gap-1 shrink-0">
                      <Coins className="w-3 h-3" /> +{ach.rewardCoins}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-0.5">{ach.description}</p>

                  {/* Progress Bar if not yet completed */}
                  {!ach.unlocked && (
                    <div className="w-full mt-2">
                      <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
                        <span>PROGRESS</span>
                        <span>
                          {ach.progress} / {ach.maxProgress}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neon-cyan transition-all"
                          style={{ width: `${progressRatio * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                {ach.unlocked && (
                  <CheckCircle2 className="w-5 h-5 text-neon-lime shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-mono tracking-widest uppercase transition-colors shrink-0"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
