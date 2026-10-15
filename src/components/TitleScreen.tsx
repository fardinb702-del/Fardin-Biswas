/**
 * Cadillacs & Dinosaurs: Apex Arcade - Title Screen
 * Bespoke inline SVG title lockup, atmospheric hero centerpiece, controls hint, and arcade attract mode
 */
import React, { useState } from 'react';
import { sound } from '../game/sound';
import { Volume2, VolumeX, Monitor, Shield, Zap, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenControls: () => void;
  crtScanlines: boolean;
  onToggleCrt: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenControls,
  crtScanlines,
  onToggleCrt,
  isMuted,
  onToggleMute
}) => {
  const [insertCoinBlink, setInsertCoinBlink] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setInsertCoinBlink(b => !b);
    }, 550);
    return () => clearInterval(interval);
  }, []);

  const handleStartGame = () => {
    sound.init();
    sound.playCoin();
    onStart();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center bg-slate-950 text-white select-none overflow-hidden p-6 md:p-10">
      {/* Background Graphic: Atmospheric Dino Shadow & Highway Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-red-600/30 via-amber-500/20 to-sky-600/30 blur-3xl rounded-full" />
        {/* Silhouette of T-Rex skull and 1953 Cadillac tailfin */}
        <svg className="w-full h-full object-cover opacity-20" viewBox="0 0 1200 600" fill="none">
          <path d="M-50 480 Q 250 450 600 480 T 1250 480 L 1250 650 L -50 650 Z" fill="#0f172a" />
          <path d="M400 380 Q 480 320 540 380 L 590 350 Q 640 420 560 480 Z" fill="#1e293b" />
          {/* Cadillac tailfin curve */}
          <path d="M220 480 L 260 420 L 340 480 Z" fill="#b91c1c" />
        </svg>
      </div>

      {/* Top Bar: Clean arcade header with Free Play and Options */}
      <div className="relative z-10 w-full flex items-center justify-between text-xs md:text-sm font-semibold tracking-wider text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-bold tracking-widest font-mono">CREDIT 03</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400">FREE PLAY READY</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleCrt}
            className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors text-xs ${
              crtScanlines 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                : 'border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Retro CRT Scanlines"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>CRT SCANLINES</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-md border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Centerpiece: Bespoke inline SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl text-center my-auto">
        <div className="text-amber-400 text-xs md:text-sm tracking-[0.35em] font-extrabold uppercase mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>CAPCOM CLASSIC REIMAGINED IN HD</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Bespoke Title Logo */}
        <div className="relative py-2">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            <span className="bg-gradient-to-b from-red-400 via-red-600 to-amber-900 bg-clip-text text-transparent">
              CADILLACS
            </span>
            <span className="mx-3 text-amber-400 font-serif not-italic text-3xl md:text-5xl">&amp;</span>
            <span className="bg-gradient-to-b from-emerald-300 via-emerald-500 to-teal-900 bg-clip-text text-transparent">
              DINOSAURS
            </span>
          </h1>
          <div className="mt-1 text-2xl md:text-3xl font-black tracking-[0.25em] text-amber-300 drop-shadow">
            APEX ARCADE
          </div>
        </div>

        {/* Subtitle description */}
        <p className="mt-4 text-slate-300 text-sm md:text-base max-w-xl font-medium leading-relaxed">
          The 26th Century. Poachers threaten the resurrected titans of the Jurassic. Take the wheel of the cherry-red '53 Cadillac and fight through 4 brutal stages to protect the apex predators.
        </p>

        {/* Start Game Action */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleStartGame}
            className="group relative px-10 py-4 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-slate-950 font-black text-xl md:text-2xl tracking-widest uppercase rounded-lg shadow-[0_0_35px_rgba(245,158,11,0.5)] transform active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Zap className="w-6 h-6 fill-current text-slate-950" />
              PRESS START / ENTER
            </span>
          </button>

          {/* Flashing Insert Coin */}
          <div className={`text-xs md:text-sm tracking-widest font-bold ${insertCoinBlink ? 'text-amber-400' : 'text-slate-600'} transition-colors`}>
            ★ INSERT COIN TO PLAY ★
          </div>

          <button
            onClick={onOpenControls}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors mt-1"
          >
            View Controls &amp; Move List
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line & Cabinet Footer */}
      <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900 pt-4 gap-2">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Shield className="w-4 h-4 text-amber-500" />
          <span>WASD Move · J Attack · K Jump · L Special · E Call Cadillac · Esc Pause</span>
        </div>
        <div className="text-slate-500">
          5 PLAYABLE HEROES · 4 STAGES · 60 FPS SIMULATION
        </div>
      </div>
    </div>
  );
};
