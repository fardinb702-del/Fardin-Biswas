/**
 * Cadillacs & Dinosaurs: Apex Arcade - Grand Campaign Victory Ending
 */
import React from 'react';
import { PlayerStats } from '../game/types';
import { Trophy, Flame, RotateCcw, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  stats: PlayerStats;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onRestart }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-400 rounded-xl p-6 md:p-8 shadow-[0_0_60px_rgba(245,158,11,0.4)] text-white flex flex-col items-center gap-6 text-center">
        
        {/* Title */}
        <div>
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>THE APEX CRUSADE COMPLETE</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow">
            VICTORY!
          </h2>
          <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">
            THE DINOSAURS ARE FREE · THE 26TH CENTURY IS SAVED
          </div>
        </div>

        {/* Narrative Ending Description */}
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-950/70 border border-slate-800 p-4 rounded-lg text-left">
          With Dr. Fessenden and the Cyber-Rex defeated, the syndicate's poacher ring collapses. Jack Vance climbs behind the wheel of the iconic cherry-red '53 Cadillac Coupe Deville, revving the V8 engine into the sunset with his crew. The dinosaurs roam wild once more across the reclaimed ruins.
        </p>

        {/* Final Stats Table */}
        <div className="w-full grid grid-cols-3 gap-3 font-mono text-center">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">FINAL SCORE</span>
            <span className="text-xl md:text-2xl font-black text-amber-400 tabular-nums">
              {stats.score.toString().padStart(6, '0')}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">MAX COMBO</span>
            <span className="text-xl md:text-2xl font-black text-sky-400 tabular-nums">
              {stats.maxCombo} HITS
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">POACHERS DEFEATED</span>
            <span className="text-xl md:text-2xl font-black text-emerald-400 tabular-nums">
              {stats.enemiesDefeated}
            </span>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-xl tracking-widest uppercase rounded-lg shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>PLAY AGAIN</span>
        </button>

      </div>
    </div>
  );
};
