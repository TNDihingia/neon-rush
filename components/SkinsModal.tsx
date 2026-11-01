'use client';

import React, { useState } from 'react';
import { X, Coins, Check, Lock, Palette } from 'lucide-react';
import { PlayerSkin } from '@/lib/types';
import { audio } from '@/lib/audio';

interface SkinsModalProps {
  skins: PlayerSkin[];
  selectedSkinId: string;
  totalCoins: number;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string, cost: number) => boolean;
  onClose: () => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  skins,
  selectedSkinId,
  totalCoins,
  onSelectSkin,
  onUnlockSkin,
  onClose,
}) => {
  const [activeSkinId, setActiveSkinId] = useState<string>(selectedSkinId);
  const activeSkin = skins.find((s) => s.id === activeSkinId) || skins[0];

  const handleSelectOrUnlock = (skin: PlayerSkin) => {
    setActiveSkinId(skin.id);
    if (skin.unlocked) {
      onSelectSkin(skin.id);
      audio.playClick();
    }
  };

  const handlePurchase = (skin: PlayerSkin) => {
    if (totalCoins >= skin.cost) {
      const success = onUnlockSkin(skin.id, skin.cost);
      if (success) {
        audio.playCoin();
        onSelectSkin(skin.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-cyber-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-neon-pink" />
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider uppercase text-white">
              SKIN LOCKER
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-dark border border-neon-amber/40 text-neon-amber">
              <Coins className="w-4 h-4 text-neon-amber" />
              <span className="font-mono font-bold text-sm text-white">{totalCoins}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Preview Area */}
        <div className="my-6 p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Glowing Aura */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center border-2 transition-all duration-300"
            style={{
              borderColor: activeSkin.primaryColor,
              backgroundColor: 'rgba(8, 8, 24, 0.9)',
              boxShadow: `0 0 30px ${activeSkin.glowColor}90`,
            }}
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rotate-45 border-2 transition-all duration-500 animate-pulse"
              style={{
                borderColor: activeSkin.secondaryColor,
                backgroundColor: activeSkin.primaryColor,
                boxShadow: `0 0 20px ${activeSkin.glowColor}`,
              }}
            />
          </div>

          <h3 className="mt-4 text-lg font-black font-mono text-white tracking-wider">
            {activeSkin.name}
          </h3>
          <p className="text-xs text-gray-400 text-center max-w-xs mt-1">
            {activeSkin.description}
          </p>

          {/* Action button inside preview */}
          <div className="mt-4">
            {activeSkin.unlocked ? (
              activeSkin.id === selectedSkinId ? (
                <div className="px-5 py-2 rounded-xl bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> EQUIPPED
                </div>
              ) : (
                <button
                  onClick={() => onSelectSkin(activeSkin.id)}
                  className="px-6 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neon-cyan transition-colors"
                >
                  EQUIP SKIN
                </button>
              )
            ) : (
              <button
                onClick={() => handlePurchase(activeSkin)}
                disabled={totalCoins < activeSkin.cost}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-amber text-black font-black text-xs uppercase tracking-wider disabled:opacity-40 flex items-center gap-1.5 shadow-neon-pink hover:scale-105 active:scale-95 transition-all"
              >
                <Coins className="w-4 h-4 fill-black" />
                UNLOCK FOR {activeSkin.cost} COINS
              </button>
            )}
          </div>
        </div>

        {/* Skins Grid */}
        <div className="grid grid-cols-3 gap-3">
          {skins.map((skin) => {
            const isSelected = skin.id === selectedSkinId;
            const isActive = skin.id === activeSkinId;

            return (
              <button
                key={skin.id}
                onClick={() => handleSelectOrUnlock(skin)}
                className={`relative p-3 rounded-2xl border flex flex-col items-center text-center transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'border-neon-cyan bg-neon-cyan/10 shadow-neon-cyan/30'
                    : 'border-white/10 bg-black/30 hover:border-white/30'
                }`}
              >
                {/* Character Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all"
                  style={{
                    borderColor: skin.primaryColor,
                    backgroundColor: 'rgba(10,10,25,0.9)',
                    boxShadow: isSelected ? `0 0 15px ${skin.glowColor}` : 'none',
                  }}
                >
                  <div
                    className="w-5 h-5 rotate-45"
                    style={{
                      backgroundColor: skin.primaryColor,
                    }}
                  />
                </div>

                <span className="mt-2 text-xs font-bold text-gray-200 truncate w-full">
                  {skin.name}
                </span>

                {/* Status indicator */}
                <div className="mt-1">
                  {skin.unlocked ? (
                    isSelected ? (
                      <span className="text-[10px] font-bold text-neon-cyan uppercase">ACTIVE</span>
                    ) : (
                      <span className="text-[10px] text-gray-400 uppercase">READY</span>
                    )
                  ) : (
                    <span className="text-[10px] font-bold text-neon-amber flex items-center gap-0.5 justify-center">
                      <Lock className="w-2.5 h-2.5" /> {skin.cost}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-mono tracking-widest uppercase transition-colors"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
