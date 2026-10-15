/**
 * Cadillacs & Dinosaurs: Apex Arcade - Stage Clear Score Tally Modal
 */
import React from 'react';
import { PlayerStats, StageDef } from '../game/types';
import { Sparkles, Trophy, ChevronRight } from 'lucide-react';

interface StageClearModalProps {
  stage: StageDef;
  stats: PlayerStats;
  onNextStage: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({ stage, stats, onNextStage }) => {
  const stageBonus = 10000;
  const lifeBonus = stats.lives * 2500;
  const dinoBonus = 5000;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-xl p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-white flex flex-col items-center gap-6">
        
        {/* Banner */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>MISSION ACCOMPLISHED</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow">
            STAGE CLEAR!
          </h2>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
            {stage.name}
          </div>
        </div>

        {/* Score Breakdown Table */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs md:text-sm">
          <div className="flex justify-between items-center text-slate-300">
            <span>STAGE COMPLETION BONUS</span>
            <span className="text-amber-400 font-bold tabular-nums">+{stageBonus} PTS</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>LIFE RESERVES BONUS ({stats.lives} LIVES)</span>
            <span className="text-emerald-400 font-bold tabular-nums">+{lifeBonus} PTS</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>DINO PRESERVATION BONUS</span>
            <span className="text-sky-400 font-bold tabular-nums">+{dinoBonus} PTS</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-base md:text-lg font-black text-white">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              TOTAL SCORE
            </span>
            <span className="text-amber-300 tabular-nums">
              {stats.score.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* Next Stage Button */}
        <button
          onClick={onNextStage}
          className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-lg md:text-xl tracking-widest uppercase rounded-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>PROCEED TO NEXT STAGE</span>
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};
