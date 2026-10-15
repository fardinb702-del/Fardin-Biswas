/**
 * Cadillacs & Dinosaurs: Apex Arcade - Move List & Controls Manual
 */
import React from 'react';
import { X, Shield, Zap, Flame, Crosshair } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-6 md:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              COMBAT &amp; FLIGHT MANUAL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Move List Sections */}
        <div className="mt-5 space-y-5 text-xs md:text-sm">
          
          {/* Basic Controls */}
          <div>
            <h4 className="text-amber-400 font-bold uppercase tracking-wider mb-2">
              BASIC MOVEMENT &amp; ACTIONS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span>8-Way Walk</span>
                <span className="font-mono text-amber-300 font-bold">W / A / S / D or Arrows</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span>Sprint / Dash</span>
                <span className="font-mono text-amber-300 font-bold">Double-tap A/D or Shift</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span>Punch / Strike</span>
                <span className="font-mono text-amber-300 font-bold">J or Z</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span>Jump</span>
                <span className="font-mono text-amber-300 font-bold">K, X or Space</span>
              </div>
            </div>
          </div>

          {/* Advanced Moves */}
          <div>
            <h4 className="text-amber-400 font-bold uppercase tracking-wider mb-2">
              SIGNATURE ARCADE COMBOS
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">3-Hit Knockback Combo</span>
                  <span className="font-mono text-amber-300 font-bold">J &rarr; J &rarr; J</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Jab &rarr; Body Cross &rarr; Devastating Roundhouse kick that sends thugs flying across the screen!
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Dash Flying Attack</span>
                  <span className="font-mono text-amber-300 font-bold">Dash + J</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Flying knee or dropkick with massive forward velocity and knockback priority.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Jump Kick</span>
                  <span className="font-mono text-amber-300 font-bold">K &rarr; J (in air)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Airborne axe kick. Excellent for interrupting charging raptors and leaping over firearms!
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    360 Desperation Special
                  </span>
                  <span className="font-mono text-amber-300 font-bold">L or (J + K)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Full invincibility frame whirlwind. Hits every enemy in a radius. Requires 25 SP gauge.
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle & Weapons */}
          <div>
            <h4 className="text-amber-400 font-bold uppercase tracking-wider mb-2">
              THE 1953 CADILLAC &amp; FIREARMS
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="p-2.5 rounded bg-red-950/40 border border-red-500/50 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-red-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
                    Call Cadillac Nitro Ram
                  </span>
                  <span className="font-mono text-amber-300 font-bold">Key E or Q</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Calls the cherry red 1953 Cadillac Coupe Deville roaring across the lane, obliterating poachers with roaring exhaust flames!
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                    Pick Up Weapons &amp; Items
                  </span>
                  <span className="font-mono text-amber-300 font-bold">Walk Over + J</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Smash oil barrels and crates to uncover shotguns, uzis, and roast chicken to restore vitality!
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Close CTA */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase rounded-lg cursor-pointer transition-colors"
          >
            GOT IT, LET'S BRAWL
          </button>
        </div>

      </div>
    </div>
  );
};
