/**
 * Cadillacs & Dinosaurs: Apex Arcade - High Performance Canvas Component
 * Isolated 60fps requestAnimationFrame loop with sub-millisecond input handling
 */
import React, { useEffect, useRef } from 'react';
import { gameEngine } from './engine';
import { InputState } from './types';

interface ArcadeCanvasProps {
  onPauseToggle?: () => void;
  crtScanlines?: boolean;
}

export const ArcadeCanvas: React.FC<ArcadeCanvasProps> = ({ crtScanlines = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Input state refs (persisted across render loops without triggering React re-renders)
  const inputRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
    jump: false,
    special: false,
    dash: false,
    callCadillac: false,
    attackJustPressed: false,
    jumpJustPressed: false,
    specialJustPressed: false,
    cadillacJustPressed: false,
    lastTapDir: null,
    lastTapTime: 0
  });

  useEffect(() => {
    setGlobalInputRef(inputRef.current);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI sizing
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // KEYBOARD INPUT LISTENER
    const handleKeyDown = (e: KeyboardEvent) => {
      const inp = inputRef.current;
      const key = e.key.toLowerCase();

      // Prevent scroll on arrows & space
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      if (key === 'w' || key === 'arrowup') inp.up = true;
      if (key === 's' || key === 'arrowdown') inp.down = true;

      if (key === 'a' || key === 'arrowleft') {
        if (!inp.left) {
          const now = performance.now();
          if (inp.lastTapDir === 'left' && now - inp.lastTapTime < 280) {
            inp.dash = true;
          }
          inp.lastTapDir = 'left';
          inp.lastTapTime = now;
        }
        inp.left = true;
      }

      if (key === 'd' || key === 'arrowright') {
        if (!inp.right) {
          const now = performance.now();
          if (inp.lastTapDir === 'right' && now - inp.lastTapTime < 280) {
            inp.dash = true;
          }
          inp.lastTapDir = 'right';
          inp.lastTapTime = now;
        }
        inp.right = true;
      }

      if (key === 'shift') inp.dash = true;

      // Attack: J, Z, or Keypad 1
      if (key === 'j' || key === 'z' || key === '1') {
        if (!inp.attack) inp.attackJustPressed = true;
        inp.attack = true;
      }

      // Jump: K, X, Space, or Keypad 2
      if (key === 'k' || key === 'x' || key === ' ' || key === '2') {
        if (!inp.jump) inp.jumpJustPressed = true;
        inp.jump = true;
      }

      // Special: L, C, or Keypad 3
      if (key === 'l' || key === 'c' || key === '3') {
        if (!inp.special) inp.specialJustPressed = true;
        inp.special = true;
      }

      // Call Cadillac: E or Q
      if (key === 'e' || key === 'q') {
        if (!inp.callCadillac) inp.cadillacJustPressed = true;
        inp.callCadillac = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const inp = inputRef.current;
      const key = e.key.toLowerCase();

      if (key === 'w' || key === 'arrowup') inp.up = false;
      if (key === 's' || key === 'arrowdown') inp.down = false;
      if (key === 'a' || key === 'arrowleft') {
        inp.left = false;
        inp.dash = false;
      }
      if (key === 'd' || key === 'arrowright') {
        inp.right = false;
        inp.dash = false;
      }
      if (key === 'shift') inp.dash = false;

      if (key === 'j' || key === 'z' || key === '1') inp.attack = false;
      if (key === 'k' || key === 'x' || key === ' ' || key === '2') inp.jump = false;
      if (key === 'l' || key === 'c' || key === '3') inp.special = false;
      if (key === 'e' || key === 'q') inp.callCadillac = false;
    };

    const handleBlur = () => {
      // Clear held keys on blur
      const inp = inputRef.current;
      inp.up = false;
      inp.down = false;
      inp.left = false;
      inp.right = false;
      inp.attack = false;
      inp.jump = false;
      inp.special = false;
      inp.dash = false;
      inp.callCadillac = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // 60FPS GAME LOOP
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent physics tunneling
      lastTime = currentTime;

      const inp = inputRef.current;

      // Update simulation
      gameEngine.update(dt, inp);

      // Reset edge-triggered inputs for next frame
      inp.attackJustPressed = false;
      inp.jumpJustPressed = false;
      inp.specialJustPressed = false;
      inp.cadillacJustPressed = false;

      // Render frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      gameEngine.render(ctx, canvas.width, canvas.height);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-black">
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Optional Authentic Arcade CRT Scanline & Phosphor Overlay */}
      {crtScanlines && (
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px)',
            backgroundSize: '100% 2px'
          }}
        />
      )}
    </div>
  );
};

// Global input dispatcher for virtual gamepad touch buttons
let globalInputRef: InputState | null = null;

export const setGlobalInputRef = (ref: InputState | null) => {
  globalInputRef = ref;
};

export const triggerVirtualInput = (action: keyof InputState, active: boolean) => {
  if (!globalInputRef) return;

  (globalInputRef[action] as boolean) = active;
  if (active) {
    if (action === 'attack') globalInputRef.attackJustPressed = true;
    if (action === 'jump') globalInputRef.jumpJustPressed = true;
    if (action === 'special') globalInputRef.specialJustPressed = true;
    if (action === 'callCadillac') globalInputRef.cadillacJustPressed = true;
  }
};
