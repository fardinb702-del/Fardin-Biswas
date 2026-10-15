/**
 * Cadillacs & Dinosaurs: Apex Arcade - Touch Virtual Gamepad
 * Responsive 8-way directional pad & tactile action buttons for mobile and touch devices
 */
import React from 'react';
import { triggerVirtualInput } from '../game/ArcadeCanvas';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Flame, Crosshair, ArrowUpRight } from 'lucide-react';

interface VirtualGamepadProps {
  onPauseToggle: () => void;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({ onPauseToggle }) => {
  const handleTouch = (action: 'up' | 'down' | 'left' | 'right' | 'attack' | 'jump' | 'special' | 'callCadillac', active: boolean) => {
    triggerVirtualInput(action, active);
    if (active && navigator.vibrate) {
      navigator.vibrate(12);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex justify-between items-end p-4 md:p-6 z-30">
      
      {/* Left: 8-Way D-Pad Cluster */}
      <div className="pointer-events-auto relative w-36 h-36 bg-slate-950/60 border border-slate-800 rounded-full p-2 backdrop-blur-sm shadow-xl">
        {/* Up */}
        <button
          onPointerDown={() => handleTouch('up', true)}
          onPointerUp={() => handleTouch('up', false)}
          onPointerCancel={() => handleTouch('up', false)}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-slate-800/90 active:bg-amber-500 rounded-md flex items-center justify-center text-white"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Down */}
        <button
          onPointerDown={() => handleTouch('down', true)}
          onPointerUp={() => handleTouch('down', false)}
          onPointerCancel={() => handleTouch('down', false)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-11 h-11 bg-slate-800/90 active:bg-amber-500 rounded-md flex items-center justify-center text-white"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Left */}
        <button
          onPointerDown={() => handleTouch('left', true)}
          onPointerUp={() => handleTouch('left', false)}
          onPointerCancel={() => handleTouch('left', false)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-800/90 active:bg-amber-500 rounded-md flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right */}
        <button
          onPointerDown={() => handleTouch('right', true)}
          onPointerUp={() => handleTouch('right', false)}
          onPointerCancel={() => handleTouch('right', false)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-800/90 active:bg-amber-500 rounded-md flex items-center justify-center text-white"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Center Pivot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border border-slate-700" />
      </div>

      {/* Right: Arcade Push Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {/* Top Mini Buttons (Cadillac Nitro & Pause) */}
        <div className="flex items-center gap-2 mb-1">
          <button
            onPointerDown={() => handleTouch('callCadillac', true)}
            onPointerUp={() => handleTouch('callCadillac', false)}
            className="w-12 h-12 rounded-full bg-red-600 active:bg-red-500 border-2 border-red-400 text-white flex items-center justify-center shadow-lg"
            title="Call Cadillac"
          >
            <Flame className="w-6 h-6 fill-amber-300" />
          </button>

          <button
            onClick={onPauseToggle}
            className="px-3 py-1.5 rounded bg-slate-800/90 active:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-300 uppercase tracking-wider"
          >
            PAUSE
          </button>
        </div>

        {/* Big Action Buttons Cluster: Attack, Jump, Special */}
        <div className="relative w-40 h-40">
          {/* Attack Button (J) */}
          <button
            onPointerDown={() => handleTouch('attack', true)}
            onPointerUp={() => handleTouch('attack', false)}
            onPointerCancel={() => handleTouch('attack', false)}
            className="absolute bottom-1 left-2 w-16 h-16 rounded-full bg-red-600 active:bg-red-400 border-2 border-red-300 text-white font-black text-lg flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            <span>ATTACK</span>
            <span className="text-[9px] font-mono opacity-70">[J]</span>
          </button>

          {/* Jump Button (K) */}
          <button
            onPointerDown={() => handleTouch('jump', true)}
            onPointerUp={() => handleTouch('jump', false)}
            onPointerCancel={() => handleTouch('jump', false)}
            className="absolute top-2 right-1 w-16 h-16 rounded-full bg-amber-500 active:bg-amber-300 border-2 border-amber-200 text-slate-950 font-black text-lg flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform"
          >
            <span>JUMP</span>
            <span className="text-[9px] font-mono opacity-70">[K]</span>
          </button>

          {/* Special Button (L) */}
          <button
            onPointerDown={() => handleTouch('special', true)}
            onPointerUp={() => handleTouch('special', false)}
            onPointerCancel={() => handleTouch('special', false)}
            className="absolute top-1 left-4 w-12 h-12 rounded-full bg-cyan-600 active:bg-cyan-400 border-2 border-cyan-300 text-white font-bold text-xs flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span className="text-[8px] font-mono">[SP]</span>
          </button>
        </div>
      </div>

    </div>
  );
};
