/**
 * Cadillacs & Dinosaurs: Apex Arcade - HD Parallax Environment Renderer
 * Multi-layer realistic backgrounds, dynamic road surfaces, weather, and volumetric lighting
 */
import { STAGES, WORLD_Z_MAX, WORLD_Z_MIN } from './constants';

export class EnvironmentRenderer {
  private emberParticles: Array<{ x: number; y: number; speedY: number; speedX: number; size: number; alpha: number }> = [];

  constructor() {
    // Pre-seed ambient atmospheric ember particles for volcanic & swamp stages
    for (let i = 0; i < 60; i++) {
      this.emberParticles.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        speedY: -0.5 - Math.random() * 1.5,
        speedX: (Math.random() - 0.5) * 1.0,
        size: 1 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
  }

  public drawEnvironment(
    ctx: CanvasRenderingContext2D,
    stageId: number,
    cameraX: number,
    viewportW: number,
    viewportH: number
  ) {
    const stage = STAGES.find(s => s.id === stageId) || STAGES[0];

    switch (stage.environmentType) {
      case 'coastal_highway':
        this.drawCoastalHighway(ctx, cameraX, viewportW, viewportH);
        break;
      case 'cretaceous_jungle':
        this.drawCretaceousJungle(ctx, cameraX, viewportW, viewportH);
        break;
      case 'underground_lab':
        this.drawUndergroundLab(ctx, cameraX, viewportW, viewportH);
        break;
      case 'volcanic_caldera':
        this.drawVolcanicCaldera(ctx, cameraX, viewportW, viewportH);
        break;
    }

    // Dynamic weather & ambient effects
    this.drawAtmosphericEffects(ctx, stage.environmentType, viewportW, viewportH);
  }

  /**
   * STAGE 1: Coastal Sunken Highway & City Ruins
   */
  private drawCoastalHighway(ctx: CanvasRenderingContext2D, cameraX: number, w: number, h: number) {
    const horizonY = h * 0.42;

    // 1. Sky & Sun Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0284c7'); // Deep coastal azure
    skyGrad.addColorStop(0.6, '#38bdf8');
    skyGrad.addColorStop(1, '#fed7aa'); // Warm horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Warm sun
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w * 0.75, horizonY * 0.4, 45, 0, Math.PI * 2);
    ctx.fill();

    // 2. Parallax Layer 1: Distant Ocean & Sunken Overgrown Skyscrapers (0.15x scroll)
    const p1 = cameraX * 0.15;
    ctx.save();
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, horizonY - 45, w, 45); // Ocean surface

    // Distant ruined skyline
    ctx.fillStyle = '#0f766e'; // Mossy overgrown towers
    for (let x = -p1 % 180 - 180; x < w + 180; x += 110) {
      const bldH = 50 + Math.sin(x * 0.05) * 35;
      ctx.fillRect(x, horizonY - 45 - bldH, 70, bldH);
      // Windows
      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      for (let wy = horizonY - 45 - bldH + 8; wy < horizonY - 45 - 8; wy += 14) {
        ctx.fillRect(x + 12, wy, 8, 6);
        ctx.fillRect(x + 35, wy, 8, 6);
      }
      ctx.fillStyle = '#0f766e';
    }
    ctx.restore();

    // 3. Parallax Layer 2: Broken Highway Overpasses & Palm Trees (0.4x scroll)
    const p2 = cameraX * 0.4;
    ctx.save();
    // Overpass concrete pillars
    for (let x = -p2 % 350 - 350; x < w + 350; x += 280) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, horizonY - 70, 36, 70); // Pillar
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 20, horizonY - 75, 76, 12); // Concrete crossbeam

      // Prehistoric Palm Trees
      this.drawPalmTree(ctx, x + 120, horizonY);
    }
    ctx.restore();

    // 4. Ground Road Surface (Asphalt with lane lines & guard rails)
    this.drawRoadSurface(ctx, cameraX, w, h, horizonY, '#1e293b', '#eab308');
  }

  /**
   * STAGE 2: Deep Cretaceous Swamp & Smugglers' Jungle
   */
  private drawCretaceousJungle(ctx: CanvasRenderingContext2D, cameraX: number, w: number, h: number) {
    const horizonY = h * 0.42;

    // 1. Humid jungle sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#064e3b');
    skyGrad.addColorStop(0.7, '#10b981');
    skyGrad.addColorStop(1, '#86efac');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // 2. Parallax Layer 1: Ancient Giant Ferns & Redwood Canopy (0.2x scroll)
    const p1 = cameraX * 0.2;
    ctx.save();
    ctx.fillStyle = '#065f46';
    for (let x = -p1 % 160 - 160; x < w + 160; x += 140) {
      const treeH = 90 + Math.cos(x * 0.08) * 40;
      ctx.fillRect(x + 20, horizonY - treeH, 22, treeH); // Trunk
      // Canopy dome
      ctx.beginPath();
      ctx.arc(x + 31, horizonY - treeH, 55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Parallax Layer 2: Giant Dinosaur Ribcage Archways & Poacher Palisades (0.45x scroll)
    const p2 = cameraX * 0.45;
    ctx.save();
    for (let x = -p2 % 400 - 400; x < w + 400; x += 320) {
      // Ribcage bone arch
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(x + 80, horizonY + 20, 90, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Poacher palisade fence
      ctx.fillStyle = '#78350f';
      for (let fx = 0; fx < 80; fx += 14) {
        ctx.fillRect(x + fx, horizonY - 35, 8, 35);
      }
    }
    ctx.restore();

    // 4. Earthen Mud Road & Jurassic Puddles
    this.drawRoadSurface(ctx, cameraX, w, h, horizonY, '#3e2723', '#15803d', true);
  }

  /**
   * STAGE 3: Subterranean Gene Lab & Cyber Bunker
   */
  private drawUndergroundLab(ctx: CanvasRenderingContext2D, cameraX: number, w: number, h: number) {
    const horizonY = h * 0.42;

    // 1. Dark high-tech facility background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, horizonY);

    // 2. Parallax Layer 1: Giant Glowing Incubation Vats with Dinosaur Embryos! (0.25x scroll)
    const p1 = cameraX * 0.25;
    ctx.save();
    for (let x = -p1 % 260 - 260; x < w + 260; x += 220) {
      // Glass cylindrical tube
      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)'; // Glowing cyan bio-fluid
      ctx.fillRect(x, horizonY - 110, 48, 110);
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, horizonY - 110, 48, 110);

      // Metal base & top
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 4, horizonY - 116, 56, 8);
      ctx.fillRect(x - 4, horizonY - 2, 56, 8);

      // Embryonic raptor silhouette inside
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.ellipse(x + 24, horizonY - 55, 14, 24, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Parallax Layer 2: Server Racks & High-Voltage Conduits (0.5x scroll)
    const p2 = cameraX * 0.5;
    ctx.save();
    for (let x = -p2 % 180 - 180; x < w + 180; x += 150) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, horizonY - 80, 55, 80);

      // Blinking server lights
      const blink = Math.sin(Date.now() * 0.005 + x) > 0;
      ctx.fillStyle = blink ? '#22c55e' : '#ef4444';
      ctx.fillRect(x + 10, horizonY - 65, 5, 5);
      ctx.fillRect(x + 20, horizonY - 65, 5, 5);
      ctx.fillRect(x + 30, horizonY - 65, 5, 5);
    }
    ctx.restore();

    // 4. Metallic Catwalk Floor with Hazard Striping
    this.drawRoadSurface(ctx, cameraX, w, h, horizonY, '#111827', '#eab308', false, true);
  }

  /**
   * STAGE 4: Volcanic Caldera & Molten Lava Fissure
   */
  private drawVolcanicCaldera(ctx: CanvasRenderingContext2D, cameraX: number, w: number, h: number) {
    const horizonY = h * 0.42;

    // 1. Apocalyptic fiery sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#450a0a'); // Dark crimson smoke
    skyGrad.addColorStop(0.5, '#dc2626');
    skyGrad.addColorStop(1, '#f97316'); // Blazing horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // 2. Parallax Layer 1: Erupting Volcanic Peaks & Smoke Plumes (0.15x scroll)
    const p1 = cameraX * 0.15;
    ctx.save();
    ctx.fillStyle = '#1c1917'; // Obsidian mountain ridges
    for (let x = -p1 % 320 - 320; x < w + 320; x += 280) {
      ctx.beginPath();
      ctx.moveTo(x, horizonY);
      ctx.lineTo(x + 140, horizonY - 120);
      ctx.lineTo(x + 280, horizonY);
      ctx.fill();

      // Molten crater glow at the peak
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(x + 140, horizonY - 118, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1917';
    }
    ctx.restore();

    // 3. Parallax Layer 2: Collapsing Stone Pillars & Lava Falls (0.4x scroll)
    const p2 = cameraX * 0.4;
    ctx.save();
    for (let x = -p2 % 240 - 240; x < w + 240; x += 200) {
      ctx.fillStyle = '#292524';
      ctx.fillRect(x, horizonY - 80, 28, 80); // Basalt pillar

      // Cascading lava flow
      ctx.fillStyle = '#f97316';
      ctx.fillRect(x + 8, horizonY - 70, 8, 70);
    }
    ctx.restore();

    // 4. Cracked Basalt Obsidian Ground with Glowing Red Magma Veins
    this.drawRoadSurface(ctx, cameraX, w, h, horizonY, '#1c1917', '#ef4444', false, false, true);
  }

  /**
   * Universal Road Surface with 2.5D Depth, Curb, and Lane Dividers
   */
  private drawRoadSurface(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    w: number,
    h: number,
    horizonY: number,
    baseColor: string,
    stripeColor: string,
    isMuddy: boolean = false,
    isTechLab: boolean = false,
    isVolcanic: boolean = false
  ) {
    const roadH = h - horizonY;

    // Road gradient from horizon to foreground
    const roadGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    roadGrad.addColorStop(0, '#0f172a');
    roadGrad.addColorStop(0.3, baseColor);
    roadGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, horizonY, w, roadH);

    // Top Curb / Guardrail Barrier
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, horizonY, w, 12);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, horizonY + 10, w, 3);

    // Lane Dividers / Surface Features
    const laneY = horizonY + roadH * 0.48;
    const laneW = 80;
    const gapW = 70;
    const scrollOffset = cameraX % (laneW + gapW);

    ctx.save();
    if (isVolcanic) {
      // Glowing lava fissures cracking across the road!
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 4;
      for (let x = -cameraX % 300 - 300; x < w + 300; x += 220) {
        ctx.beginPath();
        ctx.moveTo(x, horizonY + 20);
        ctx.lineTo(x + 40, horizonY + roadH * 0.5);
        ctx.lineTo(x + 15, h);
        ctx.stroke();
      }
    } else if (isTechLab) {
      // High-voltage warning stripes
      ctx.fillStyle = stripeColor;
      for (let x = -scrollOffset - 100; x < w + 100; x += 60) {
        ctx.fillRect(x, horizonY + 12, 20, 6);
        ctx.fillRect(x, h - 14, 20, 6);
      }
    } else if (isMuddy) {
      // Mud tracks & green ferns along edges
      ctx.fillStyle = '#15803d';
      for (let x = -cameraX % 80 - 80; x < w + 80; x += 40) {
        ctx.beginPath();
        ctx.arc(x, horizonY + 8, 14, 0, Math.PI);
        ctx.fill();
      }
    } else {
      // Classic highway dashed yellow lines
      ctx.fillStyle = stripeColor;
      for (let x = -scrollOffset - laneW; x < w + laneW; x += laneW + gapW) {
        ctx.fillRect(x, laneY, laneW, 5);
      }
    }
    ctx.restore();
  }

  /**
   * Renders palm trees on highway
   */
  private drawPalmTree(ctx: CanvasRenderingContext2D, x: number, horizonY: number) {
    ctx.save();
    // Curved trunk
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x, horizonY);
    ctx.quadraticCurveTo(x - 15, horizonY - 45, x - 5, horizonY - 95);
    ctx.stroke();

    // Palm fronds
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    const frondAngles = [-0.6, -0.3, 0, 0.3, 0.6, 0.9, -0.9];
    frondAngles.forEach(ang => {
      ctx.beginPath();
      ctx.moveTo(x - 5, horizonY - 95);
      const fx = x - 5 + Math.cos(ang) * 45;
      const fy = horizonY - 95 + Math.sin(ang) * 35;
      ctx.quadraticCurveTo(x - 5, horizonY - 80, fx, fy);
      ctx.stroke();
    });
    ctx.restore();
  }

  /**
   * Atmospheric FX (Embers, heat waves, jungle mist)
   */
  private drawAtmosphericEffects(
    ctx: CanvasRenderingContext2D,
    type: string,
    w: number,
    h: number
  ) {
    if (type === 'volcanic_caldera') {
      // Floating glowing embers
      ctx.save();
      this.emberParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) p.y = h;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    } else if (type === 'cretaceous_jungle') {
      // Soft volumetric mist
      ctx.save();
      const mistGrad = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.65);
      mistGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      mistGrad.addColorStop(0.5, 'rgba(167, 243, 208, 0.08)');
      mistGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, h * 0.35, w, h * 0.3);
      ctx.restore();
    }
  }
}

export const environmentRenderer = new EnvironmentRenderer();
