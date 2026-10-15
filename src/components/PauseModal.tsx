/**
 * Cadillacs & Dinosaurs: Apex Arcade - Pause Menu Modal
 */
import React from 'react';
import { Volume2, VolumeX, Monitor, Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestartStage: () => void;
  onQuitToTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  crtScanlines: boolean;
  onToggleCrt: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartStage,
  onQuitToTitle,
  isMuted,
  onToggleMute,
  crtScanlines,
  onToggleCrt
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-white flex flex-col items-center gap-5">
        
        <div className="text-center">
          <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">ARCADE SIMULATION</span>
          <h3 className="text-2xl font-black italic uppercase tracking-wider mt-0.5">GAME PAUSED</h3>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black tracking-wider uppercase rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME MISSION</span>
          </button>

          <button
            onClick={onRestartStage}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 font-bold uppercase flex items-center justify-center gap-2 cursor-pointer text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART STAGE</span>
          </button>

          <button
            onClick={onQuitToTitle}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white font-bold uppercase flex items-center justify-center gap-2 cursor-pointer text-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>QUIT TO TITLE</span>
          </button>
        </div>

        {/* Toggles */}
        <div className="w-full pt-3 border-t border-slate-800 flex items-center justify-around text-xs text-slate-400">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>

          <button
            onClick={onToggleCrt}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${crtScanlines ? 'text-amber-400' : 'hover:text-white'}`}
          >
            <Monitor className="w-4 h-4" />
            <span>CRT SCANLINES</span>
          </button>
        </div>

      </div>
    </div>
  );
};
