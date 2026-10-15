/**
 * Cadillacs & Dinosaurs: Apex Arcade - Character Selection Screen
 * Detailed fighter stats, signature moves, bios, and audio confirmation
 */
import React, { useState } from 'react';
import { CHARACTERS } from '../game/constants';
import { CharacterId } from '../game/types';
import { sound } from '../game/sound';
import { Zap, Shield, ChevronRight, Activity, Flame, Heart } from 'lucide-react';

interface CharacterSelectProps {
  onSelectCharacter: (charId: CharacterId) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelectCharacter, onBack }) => {
  const [selected, setSelected] = useState<CharacterId>('jack');
  const charIds: CharacterId[] = ['jack', 'maya', 'mustapha', 'mess', 'valerie'];
  const activeChar = CHARACTERS[selected];

  const handleSelect = (id: CharacterId) => {
    setSelected(id);
    sound.playPunch('light');
  };

  const handleConfirm = () => {
    sound.playPunch('knockout');
    sound.playCoin();
    onSelectCharacter(selected);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 text-white select-none overflow-hidden p-6 md:p-10">
      {/* Background ambient gradient */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${activeChar.primaryColor} 0%, transparent 65%)`
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">ROSTER SELECTION</span>
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tight uppercase">SELECT YOUR FIGHTER</h2>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded border border-slate-800 hover:border-slate-700 transition-colors"
        >
          &larr; BACK TO TITLE
        </button>
      </div>

      {/* Main 2-Column Split: Character Roster Grid & Detailed Dossier */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-stretch">
        
        {/* Left Column: 5 Character Selection Cards */}
        <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
          {charIds.map(id => {
            const char = CHARACTERS[id];
            const isSelected = selected === id;

            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={`flex items-center justify-between p-3.5 rounded-lg border transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] translate-x-2'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch Dot */}
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: char.primaryColor }}
                  />
                  <div>
                    <div className="font-black text-base md:text-lg tracking-wide uppercase flex items-center gap-2">
                      <span>{char.name}</span>
                      {id === 'valerie' && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-mono">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {char.archetype}
                    </div>
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Column: Fighter Dossier, Attributes & Special Move */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-amber-400 tracking-widest uppercase">
                  {activeChar.moniker}
                </span>
                <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-white mt-1">
                  {activeChar.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">BASE HEALTH</span>
                <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                  {activeChar.health} HP
                </div>
              </div>
            </div>

            {/* Fighter Quote */}
            <p className="mt-3 text-sm italic text-amber-200/90 border-l-2 border-amber-400 pl-3">
              "{activeChar.quote}"
            </p>

            {/* Bio */}
            <p className="mt-4 text-xs md:text-sm text-slate-300 leading-relaxed">
              {activeChar.bio}
            </p>

            {/* Stat Bars */}
            <div className="mt-6 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-sky-400" /> SPEED</span>
                  <span className="font-mono text-white tabular-nums">{activeChar.speed}/10</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${activeChar.speed * 10}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                  <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-red-500" /> POWER</span>
                  <span className="font-mono text-white tabular-nums">{activeChar.power}/10</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${activeChar.power * 10}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber-400" /> REACH / RANGE</span>
                  <span className="font-mono text-white tabular-nums">{activeChar.reach}/10</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${activeChar.reach * 10}%` }} />
                </div>
              </div>
            </div>

            {/* Signature Special Move */}
            <div className="mt-6 p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>SIGNATURE DESPERATION SPECIAL: {activeChar.specialName}</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                {activeChar.specialDescription}
              </p>
              <div className="mt-2 text-[11px] text-slate-400 font-mono">
                TRIGGER: Press <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300">L</kbd> or <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300">J+K</kbd> (Invincible 360 Hit · Consumes 25 Special)
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-8 flex items-center justify-end">
            <button
              onClick={handleConfirm}
              className="px-8 py-3.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-lg tracking-wider uppercase rounded-lg shadow-lg transform active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>CONFIRM FIGHTER</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 border-t border-slate-900 pt-3">
        SELECT WITH CLICK OR USE ARROW KEYS · PRESS ENTER TO DEPLOY
      </div>
    </div>
  );
};
