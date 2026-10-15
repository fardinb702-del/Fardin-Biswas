/**
 * Cadillacs & Dinosaurs: Apex Arcade - World-Matched Low-Occlusion HUD
 * Keeps >85% playfield unobstructed, uses pointer-events-none wrappers and tabular-nums
 */
import React from 'react';
import { CHARACTERS } from '../game/constants';
import { CharacterId, Entity, PlayerStats, WeaponType } from '../game/types';
import { Shield, Zap, Flame, Crosshair } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  playerHp: number;
  playerMaxHp: number;
  characterId: CharacterId;
  weapon: WeaponType;
  ammo: number;
  stageName: string;
  activeBoss?: Entity;
  onCallCadillac?: () => void;
  onPauseToggle?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  playerHp,
  playerMaxHp,
  characterId,
  weapon,
  ammo,
  stageName,
  activeBoss,
  onCallCadillac,
  onPauseToggle
}) => {
  const char = CHARACTERS[characterId];
  const hpPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));

  // Combo rating label
  const getComboRating = (count: number) => {
    if (count >= 15) return { text: 'APEX TITAN!', color: '#ef4444' };
    if (count >= 10) return { text: 'DINO-MITE!!', color: '#f97316' };
    if (count >= 6) return { text: 'GREAT COMBO!', color: '#facc15' };
    if (count >= 3) return { text: 'GOOD!', color: '#38bdf8' };
    return null;
  };

  const comboRating = getComboRating(stats.comboCount);

  return (
    <div className="absolute inset-0 pointer-events-none select-none p-4 md:p-6 flex flex-col justify-between overflow-hidden">
      
      {/* Top Cluster: Player Health, Score, Weapon, Stage Title */}
      <div className="flex items-start justify-between w-full">
        
        {/* Top-Left: Player Status Bar */}
        <div className="flex items-center gap-3">
          {/* Character Avatar Icon */}
          <div 
            className="w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 border-amber-400 bg-slate-900 flex items-center justify-center shadow-lg shrink-0 overflow-hidden"
            style={{ borderColor: char.accentColor }}
          >
            <div 
              className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center font-black text-sm uppercase"
              style={{ backgroundColor: char.primaryColor }}
            >
              {char.name[0]}
            </div>
          </div>

          <div className="flex flex-col">
            {/* Player Name & Lives */}
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm md:text-base tracking-wider uppercase drop-shadow">
                1P {char.name}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-bold font-mono">
                <span>×</span>
                <span>{stats.lives}</span>
              </div>
            </div>

            {/* Health Bar (Layered Classic Arcade Style) */}
            <div className="w-44 md:w-60 h-4 bg-slate-950/90 rounded border border-slate-700 p-0.5 overflow-hidden shadow-md mt-0.5">
              <div 
                className="h-full rounded-sm transition-all duration-100"
                style={{
                  width: `${hpPercent}%`,
                  backgroundColor: hpPercent > 40 ? '#eab308' : '#ef4444' // Yellow -> Red
                }}
              />
            </div>

            {/* Special Gauge & Number */}
            <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-300">
              <span className="flex items-center gap-1 text-amber-300">
                <Zap className="w-3 h-3 fill-amber-300" />
                <span>SP: {Math.floor(stats.specialGauge)}%</span>
              </span>
              <span className="tabular-nums text-slate-400">
                {playerHp}/{playerMaxHp} HP
              </span>
            </div>
          </div>
        </div>

        {/* Top-Center: Weapon Ammo & Cadillac Call Status */}
        <div className="hidden sm:flex flex-col items-center gap-1.5">
          {weapon !== 'fists' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/85 border border-sky-400/60 rounded-md text-xs font-mono font-bold text-sky-300 shadow-md">
              <Crosshair className="w-3.5 h-3.5" />
              <span className="uppercase">{weapon.replace('_', ' ')}</span>
              <span className="text-white tabular-nums">[{ammo} ROUNDS]</span>
            </div>
          )}

          {stats.cadillacSummonsAvailable > 0 && (
            <button
              onClick={onCallCadillac}
              className="pointer-events-auto px-3 py-1 bg-red-600/90 hover:bg-red-500 border border-red-400 rounded-md text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>CADILLAC RAM ({stats.cadillacSummonsAvailable}) [KEY E]</span>
            </button>
          )}
        </div>

        {/* Top-Right: Score, High Score, Stage */}
        <div className="flex flex-col items-end text-right">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {stageName.split(':')[0]}
          </div>

          <div className="text-lg md:text-2xl font-black font-mono tracking-wider text-amber-400 tabular-nums drop-shadow">
            {stats.score.toString().padStart(6, '0')}
          </div>

          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
            HI: {stats.highScore.toString().padStart(6, '0')}
          </div>
        </div>

      </div>

      {/* Middle-Left: Dynamic Combo Counter */}
      <div className="flex items-center min-h-[90px]">
        {stats.comboCount >= 2 && comboRating && (
          <div className="flex flex-col animate-bounce">
            <div className="text-3xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {stats.comboCount} <span className="text-xl md:text-2xl not-italic font-bold">HITS!</span>
            </div>
            <div 
              className="text-xs md:text-sm font-black tracking-widest uppercase drop-shadow"
              style={{ color: comboRating.color }}
            >
              {comboRating.text}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Area: Active Boss Health Bar */}
      <div className="w-full flex flex-col items-center">
        {activeBoss && activeBoss.hp > 0 && (
          <div className="w-full max-w-lg bg-slate-950/90 border border-red-500/80 rounded-lg p-3 shadow-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-black tracking-wider text-red-400 uppercase">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 fill-red-500" />
                STAGE BOSS: {activeBoss.name}
              </span>
              <span className="font-mono text-white tabular-nums">
                {activeBoss.hp}/{activeBoss.maxHp} HP
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded border border-red-900 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 rounded-sm transition-all duration-75"
                style={{ width: `${Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
