'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/lib/gameEngine';
import { PlayerSkin, GameSettings, GameState } from '@/lib/types';
import { GameHUD } from './GameHUD';
import { GameOver } from './GameOver';

interface GameCanvasProps {
  gameState: GameState;
  currentSkin: PlayerSkin;
  settings: GameSettings;
  highScore: number;
  onGameOver: (score: number, coins: number, maxCombo: number, isNewHigh: boolean) => void;
  onMainMenu: () => void;
  onOpenSkins: () => void;
  onToggleSound: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  currentSkin,
  settings,
  highScore,
  onGameOver,
  onMainMenu,
  onOpenSkins,
  onToggleSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // HUD Reactive State
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(1);
  const [comboTimerRatio, setComboTimerRatio] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Game Over Dialog State
  const [finalScore, setFinalScore] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [maxCombo, setMaxCombo] = useState(1);
  const [isNewHigh, setIsNewHigh] = useState(false);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      currentSkin,
      settings,
      {
        onScoreUpdate: (newScore, newCombo) => {
          setScore(newScore);
          setCombo(newCombo);
        },
        onCoinsUpdate: (newCoins) => {
          setCoins(newCoins);
        },
        onNearMiss: (newCombo) => {
          setCombo(newCombo);
        },
        onSpeedIncrease: (newSpeedLevel) => {
          setSpeedLevel(newSpeedLevel);
        },
        onGameOver: (endScore, endCoins, runMaxCombo) => {
          const isHigh = endScore > highScore;
          setFinalScore(endScore);
          setFinalCoins(endCoins);
          setMaxCombo(runMaxCombo);
          setIsNewHigh(isHigh);
          onGameOver(endScore, endCoins, runMaxCombo, isHigh);
        },
      }
    );

    engineRef.current = engine;

    const handleResize = () => {
      engine.resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync Skin Changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSkin(currentSkin);
    }
  }, [currentSkin]);

  // Sync Settings Changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSettings(settings);
    }
  }, [settings]);

  // Handle Game State Transitions
  useEffect(() => {
    if (!engineRef.current) return;

    if (gameState === 'PLAYING') {
      setIsPaused(false);
      setScore(0);
      setCoins(0);
      setCombo(1);
      setSpeedLevel(1);
      engineRef.current.start();
    } else if (gameState === 'MENU') {
      engineRef.current.stop();
    }
  }, [gameState]);

  // Combo timer bar tick
  useEffect(() => {
    let animId: number;
    const updateComboRatio = () => {
      if (engineRef.current && gameState === 'PLAYING') {
        const remaining = engineRef.current.comboTimer;
        setComboTimerRatio(Math.max(0, remaining / 3.8));
      }
      animId = requestAnimationFrame(updateComboRatio);
    };
    animId = requestAnimationFrame(updateComboRatio);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  // Input Handling
  const triggerJump = useCallback(() => {
    if (engineRef.current && gameState === 'PLAYING' && !isPaused) {
      engineRef.current.handleJumpInput();
    }
  }, [gameState, isPaused]);

  const togglePause = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        engineRef.current?.pause();
      } else {
        engineRef.current?.resume();
      }
      return next;
    });
  }, [gameState]);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      setIsPaused(false);
      setScore(0);
      setCoins(0);
      setCombo(1);
      setSpeedLevel(1);
      engineRef.current.start();
    }
  }, []);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameState === 'GAMEOVER') {
          handleRestart();
        } else {
          triggerJump();
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, triggerJump, togglePause, handleRestart]);

  // Page Visibility Auto-Pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && gameState === 'PLAYING') {
        if (!isPaused) {
          togglePause();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameState, isPaused, togglePause]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black select-none touch-none">
      {/* HTML5 Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={triggerJump}
        onTouchStart={(e) => {
          e.preventDefault();
          triggerJump();
        }}
      />

      {/* Game HUD (Live Score, Multiplier, Speed) */}
      {gameState === 'PLAYING' && (
        <GameHUD
          score={score}
          highScore={highScore}
          coins={coins}
          combo={combo}
          comboTimerRatio={comboTimerRatio}
          speedLevel={speedLevel}
          isPaused={isPaused}
          isMuted={settings.sfxMuted && settings.musicMuted}
          onTogglePause={togglePause}
          onToggleSound={onToggleSound}
          onTouchJump={triggerJump}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOver
          score={finalScore}
          highScore={highScore}
          coinsEarned={finalCoins}
          maxCombo={maxCombo}
          isNewHigh={isNewHigh}
          onRestart={handleRestart}
          onMainMenu={onMainMenu}
          onOpenSkins={onOpenSkins}
        />
      )}
    </div>
  );
};
