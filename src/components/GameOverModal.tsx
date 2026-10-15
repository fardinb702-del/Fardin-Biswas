/**
 * Cadillacs & Dinosaurs: Apex Arcade - 9-Second Continue Screen
 */
import React, { useEffect, useState } from 'react';
import { PlayerStats } from '../game/types';
import { RotateCcw, Flame } from 'lucide-react';

interface GameOverModalProps {
  stats: PlayerStats;
  onContinue: () => void;
  onQuit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onContinue, onQuit }) => {
  const [countdown, setCountdown] = useState(9);

  useEffect(() => {
    if (countdown <= 0) {
      onQuit();
      return;
    }
    const timer = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onQuit]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-950 border-2 border-red-600 rounded-xl p-6 md:p-8 shadow-[0_0_60px_rgba(239,68,68,0.4)] text-white flex flex-col items-center gap-6 text-center">
        
        <div>
          <span className="text-red-500 text-xs font-bold tracking-[0.3em] uppercase">DON'T GIVE UP NOW!</span>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mt-1">
            CONTINUE?
          </h2>
        </div>

        {/* Big Arcade Countdown Number */}
        <div className="text-8xl md:text-9xl font-black font-mono text-red-500 tabular-nums animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
          {countdown}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          CREDITS REMAINING: <span className="text-amber-400 font-bold">{stats.credits}</span>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          {stats.credits > 0 ? (
            <button
              onClick={onContinue}
              className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-xl tracking-wider uppercase rounded-lg shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>CONTINUE (USE CREDIT)</span>
            </button>
          ) : (
            <button
              onClick={onContinue}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xl tracking-wider uppercase rounded-lg shadow-xl cursor-pointer"
            >
              <Flame className="w-5 h-5 inline mr-2" />
              <span>FREE PLAY CONTINUE</span>
            </button>
          )}

          <button
            onClick={onQuit}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors cursor-pointer"
          >
            GIVE UP &amp; RETURN TO TITLE
          </button>
        </div>

      </div>
    </div>
  );
};
