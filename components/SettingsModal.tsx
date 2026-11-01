'use client';

import React from 'react';
import { X, Volume2, VolumeX, Music, Eye, Monitor, Sparkles } from 'lucide-react';
import { GameSettings } from '@/lib/types';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const toggleSfx = () => {
    onUpdateSettings({ ...settings, sfxMuted: !settings.sfxMuted });
  };

  const toggleMusic = () => {
    onUpdateSettings({ ...settings, musicMuted: !settings.musicMuted });
  };

  const toggleReducedMotion = () => {
    onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
  };

  const toggleScanlines = () => {
    onUpdateSettings({ ...settings, scanlines: !settings.scanlines });
  };

  const handleSfxVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, sfxVolume: parseFloat(e.target.value) });
  };

  const handleMusicVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-cyber-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider uppercase text-neon-cyan flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-cyan" /> SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="mt-6 flex flex-col gap-5">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
            Audio Configuration
          </span>

          {/* SFX Volume */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleSfx}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-neon-cyan transition-colors"
              >
                {settings.sfxMuted ? <VolumeX className="w-4 h-4 text-neon-red" /> : <Volume2 className="w-4 h-4 text-neon-cyan" />}
                <span>Sound FX</span>
              </button>
              <span className="text-xs font-mono text-gray-400">
                {settings.sfxMuted ? 'MUTED' : `${Math.round(settings.sfxVolume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={settings.sfxMuted}
              value={settings.sfxVolume}
              onChange={handleSfxVolume}
              className="w-full accent-neon-cyan cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Music Volume */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleMusic}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-neon-pink transition-colors"
              >
                {settings.musicMuted ? <VolumeX className="w-4 h-4 text-neon-red" /> : <Music className="w-4 h-4 text-neon-pink" />}
                <span>Synthwave Music</span>
              </button>
              <span className="text-xs font-mono text-gray-400">
                {settings.musicMuted ? 'MUTED' : `${Math.round(settings.musicVolume * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={settings.musicMuted}
              value={settings.musicVolume}
              onChange={handleMusicVolume}
              className="w-full accent-neon-pink cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Visual & Accessibility */}
        <div className="mt-6 flex flex-col gap-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
            Display & Accessibility
          </span>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-neon-amber" />
              <div>
                <div className="text-sm font-semibold text-white">Reduced Motion</div>
                <div className="text-[11px] text-gray-400">Disables intense screen shake</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={toggleReducedMotion}
              className="w-5 h-5 accent-neon-cyan cursor-pointer"
            />
          </div>

          {/* Scanlines Effect */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-2.5">
              <Monitor className="w-4 h-4 text-neon-cyan" />
              <div>
                <div className="text-sm font-semibold text-white">Retro Scanlines</div>
                <div className="text-[11px] text-gray-400">Classic arcade CRT monitor lines</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.scanlines}
              onChange={toggleScanlines}
              className="w-5 h-5 accent-neon-cyan cursor-pointer"
            />
          </div>
        </div>

        {/* Controls Info */}
        <div className="mt-6 p-4 rounded-xl bg-cyber-dark border border-white/10 text-xs text-gray-400 font-mono">
          <div className="font-bold text-gray-200 uppercase mb-2">Controls:</div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span>Jump / Double Jump:</span>
            <span className="text-neon-cyan font-semibold">Space / Up / Tap</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Pause Game:</span>
            <span className="text-neon-pink font-semibold">Esc / P</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-pink text-black font-black font-mono tracking-widest uppercase transition-transform active:scale-95"
        >
          APPLY & CLOSE
        </button>
      </div>
    </div>
  );
};
