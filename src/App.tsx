/**
 * Cadillacs & Dinosaurs: Apex Arcade - Master Game Shell
 * Orchestrates Game State Machine: Title -> Character Select -> Playing -> Stage Clear / Game Over / Victory
 */
import React, { useEffect, useState } from 'react';
import { ArcadeCanvas } from './game/ArcadeCanvas';
import { STAGES } from './game/constants';
import { gameEngine } from './game/engine';
import { sound } from './game/sound';
import { CharacterId, Entity, GameState, PlayerStats, WeaponType } from './game/types';

import { CharacterSelect } from './components/CharacterSelect';
import { ControlsModal } from './components/ControlsModal';
import { GameOverModal } from './components/GameOverModal';
import { HUD } from './components/HUD';
import { PauseModal } from './components/PauseModal';
import { StageClearModal } from './components/StageClearModal';
import { TitleScreen } from './components/TitleScreen';
import { VirtualGamepad } from './components/VirtualGamepad';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [crtScanlines, setCrtScanlines] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTouchGamepad, setShowTouchGamepad] = useState<boolean>(false);

  // Synced Engine State for React HUD
  const [stats, setStats] = useState<PlayerStats>(gameEngine.stats);
  const [playerHp, setPlayerHp] = useState<number>(120);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(120);
  const [characterId, setCharacterId] = useState<CharacterId>('jack');
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('fists');
  const [ammo, setAmmo] = useState<number>(0);
  const [activeBoss, setActiveBoss] = useState<Entity | undefined>(undefined);

  // Auto-detect touch device
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowTouchGamepad(isTouch);
  }, []);

  // Hook up Game Engine Event Callbacks
  useEffect(() => {
    gameEngine.onStateChange = (newState: GameState) => {
      setGameState(newState);
      setIsPaused(false);
    };

    gameEngine.onStatsUpdate = (
      newStats: PlayerStats,
      hp: number,
      maxHp: number,
      boss?: Entity
    ) => {
      setStats({ ...newStats });
      setPlayerHp(hp);
      setPlayerMaxHp(maxHp);
      setCurrentWeapon(gameEngine.player.weapon);
      setAmmo(gameEngine.player.ammo);
      setActiveBoss(boss);
    };

    // Keyboard listener for Pause (`Escape` or `P`)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (gameEngine.gameState === 'PLAYING') {
          setIsPaused(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartFromTitle = () => {
    sound.init();
    setGameState('CHAR_SELECT');
  };

  const handleSelectCharacter = (charId: CharacterId) => {
    setCharacterId(charId);
    gameEngine.setCharacter(charId);
    gameEngine.startStage(1);
    setGameState('PLAYING');
  };

  const handleToggleMute = () => {
    sound.init();
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleCrt = () => {
    setCrtScanlines(prev => !prev);
  };

  const handleRestartStage = () => {
    setIsPaused(false);
    gameEngine.startStage(gameEngine.currentStageId);
  };

  const handleQuitToTitle = () => {
    setIsPaused(false);
    sound.stopMusic();
    gameEngine.gameState = 'TITLE';
    setGameState('TITLE');
  };

  const currentStage = STAGES.find(s => s.id === gameEngine.currentStageId) || STAGES[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      
      {/* Active Game Canvas Viewport */}
      <ArcadeCanvas crtScanlines={crtScanlines} />

      {/* Title Screen Overlay */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStart={handleStartFromTitle}
          onOpenControls={() => setShowControls(true)}
          crtScanlines={crtScanlines}
          onToggleCrt={handleToggleCrt}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Character Select Overlay */}
      {gameState === 'CHAR_SELECT' && (
        <CharacterSelect
          onSelectCharacter={handleSelectCharacter}
          onBack={() => setGameState('TITLE')}
        />
      )}

      {/* Gameplay HUD */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            stats={stats}
            playerHp={playerHp}
            playerMaxHp={playerMaxHp}
            characterId={characterId}
            weapon={currentWeapon}
            ammo={ammo}
            stageName={currentStage.name}
            activeBoss={activeBoss}
            onCallCadillac={() => gameEngine.callCadillacStrike()}
            onPauseToggle={() => setIsPaused(true)}
          />

          {/* Virtual Gamepad for touch devices */}
          {showTouchGamepad && (
            <VirtualGamepad onPauseToggle={() => setIsPaused(true)} />
          )}
        </>
      )}

      {/* Pause Menu Modal */}
      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestartStage={handleRestartStage}
          onQuitToTitle={handleQuitToTitle}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          crtScanlines={crtScanlines}
          onToggleCrt={handleToggleCrt}
        />
      )}

      {/* Stage Clear Score Tally Modal */}
      {gameState === 'STAGE_CLEAR' && (
        <StageClearModal
          stage={currentStage}
          stats={stats}
          onNextStage={() => gameEngine.nextStageOrVictory()}
        />
      )}

      {/* 9-Second Continue Game Over Screen */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={stats}
          onContinue={() => gameEngine.insertCreditAndContinue()}
          onQuit={handleQuitToTitle}
        />
      )}

      {/* Grand Campaign Victory Ending Modal */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          stats={stats}
          onRestart={() => {
            gameEngine.startStage(1);
            setGameState('PLAYING');
          }}
        />
      )}

      {/* Controls Manual & Move List Modal */}
      {showControls && (
        <ControlsModal onClose={() => setShowControls(false)} />
      )}

    </div>
  );
}
