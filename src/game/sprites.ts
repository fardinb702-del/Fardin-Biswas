/**
 * Cadillacs & Dinosaurs: Apex Arcade - HD Vector Sprite Drawing Engine
 * High-definition procedural canvas rendering with dynamic poses, shadows, weapons, and vehicles
 */
import { CHARACTERS } from './constants';
import { CharacterId, DestructibleObject, Entity, ItemDrop, WeaponType } from './types';

export class SpriteRenderer {
  /**
   * Draws ground contact shadow for any entity, scaled by height off ground
   */
  public drawShadow(ctx: CanvasRenderingContext2D, x: number, z: number, y: number, radiusX: number = 32, radiusZ: number = 14) {
    ctx.save();
    // Shadow shrinks and diffuses as entity rises
    const factor = Math.max(0.2, 1 - y / 280);
    const rx = radiusX * factor;
    const rz = radiusZ * factor;
    const alpha = Math.max(0.1, 0.45 * factor);

    ctx.translate(x, z);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, rz, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws a Player Character
   */
  public drawPlayer(ctx: CanvasRenderingContext2D, entity: Entity) {
    const char = CHARACTERS[entity.charId || 'jack'];
    ctx.save();

    // Position at (x, z - y)
    ctx.translate(entity.x, entity.z - entity.y);
    if (entity.facing === -1) {
      ctx.scale(-1, 1);
    }

    // Invincibility flashing
    if (entity.invincibleTimer > 0 && Math.floor(entity.invincibleTimer * 15) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const { state, animFrame, weapon } = entity;
    const primary = char.primaryColor;
    const secondary = char.secondaryColor;
    const accent = char.accentColor;

    // Body parts geometry based on animation state
    switch (state) {
      case 'idle':
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -80 + Math.sin(animFrame * 0.1) * 2,
          torsoTilt: 0,
          leftLegAngle: -0.1,
          rightLegAngle: 0.1,
          leftArmAngle: 0.2 + Math.sin(animFrame * 0.1) * 0.05,
          rightArmAngle: -0.2 - Math.sin(animFrame * 0.1) * 0.05,
          primary, secondary, accent, weapon
        });
        break;

      case 'walk':
      case 'run':
        {
          const stride = state === 'run' ? 0.75 : 0.45;
          const cycle = animFrame * (state === 'run' ? 0.25 : 0.16);
          const leg1 = Math.sin(cycle) * stride;
          const leg2 = -leg1;
          const bounce = Math.abs(Math.sin(cycle)) * (state === 'run' ? 8 : 4);

          this.drawHumanoid(ctx, entity.charId || 'jack', {
            headY: -80 - bounce,
            torsoTilt: state === 'run' ? 0.2 : 0.08,
            leftLegAngle: leg1,
            rightLegAngle: leg2,
            leftArmAngle: -leg1 * 1.1,
            rightArmAngle: -leg2 * 1.1,
            primary, secondary, accent, weapon
          });
        }
        break;

      case 'jump':
      case 'jump_attack':
        {
          const isAttack = state === 'jump_attack';
          this.drawHumanoid(ctx, entity.charId || 'jack', {
            headY: -82,
            torsoTilt: isAttack ? 0.35 : 0,
            leftLegAngle: isAttack ? -0.5 : -0.6,
            rightLegAngle: isAttack ? 1.2 : 0.7, // Extended jump kick leg!
            leftArmAngle: isAttack ? -0.8 : -0.5,
            rightArmAngle: isAttack ? 0.9 : 0.5,
            primary, secondary, accent, weapon
          });

          // Kick swoosh trail
          if (isAttack) {
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(35, -40, 45, -0.4, 0.4);
            ctx.stroke();
          }
        }
        break;

      case 'attack1':
        // Straight jab
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -80,
          torsoTilt: 0.1,
          leftLegAngle: -0.2,
          rightLegAngle: 0.3,
          leftArmAngle: -0.2,
          rightArmAngle: 1.4, // Right fist thrust forward
          primary, secondary, accent, weapon
        });
        // Strike spark line
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(35, -55);
        ctx.lineTo(60, -55);
        ctx.stroke();
        break;

      case 'attack2':
        // Cross / Body hook
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -79,
          torsoTilt: 0.2,
          leftLegAngle: 0.3,
          rightLegAngle: -0.3,
          leftArmAngle: 1.3,
          rightArmAngle: -0.4,
          primary, secondary, accent, weapon
        });
        break;

      case 'attack3':
        // Fierce Knockback Finisher (Roundhouse / Power blow)
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -80,
          torsoTilt: 0.25,
          leftLegAngle: -0.4,
          rightLegAngle: 1.3, // High roundhouse kick
          leftArmAngle: -0.6,
          rightArmAngle: 0.8,
          primary, secondary, accent, weapon
        });
        // Power arc
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(20, -50, 50, -0.8, 0.6);
        ctx.stroke();
        break;

      case 'dash_attack':
        // Flying Knee / Sliding Dropkick
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -65,
          torsoTilt: 0.6,
          leftLegAngle: 0.8,
          rightLegAngle: 1.4,
          leftArmAngle: -0.8,
          rightArmAngle: 0.9,
          primary, secondary, accent, weapon
        });
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-20, -40);
        ctx.lineTo(55, -40);
        ctx.stroke();
        break;

      case 'special':
        // 360 Cyclone Spin
        {
          const spinRot = (animFrame * 0.4) % (Math.PI * 2);
          ctx.save();
          ctx.rotate(Math.sin(spinRot) * 0.15);
          this.drawHumanoid(ctx, entity.charId || 'jack', {
            headY: -82,
            torsoTilt: 0,
            leftLegAngle: 1.1,
            rightLegAngle: -1.1,
            leftArmAngle: 1.4,
            rightArmAngle: -1.4,
            primary, secondary, accent, weapon
          });
          ctx.restore();

          // Luminous cyclone aura
          ctx.save();
          ctx.strokeStyle = accent;
          ctx.lineWidth = 6;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.ellipse(0, -50, 65, 25, spinRot, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        break;

      case 'grab':
      case 'throw':
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -80,
          torsoTilt: -0.15,
          leftLegAngle: -0.2,
          rightLegAngle: 0.3,
          leftArmAngle: 1.2,
          rightArmAngle: 1.2, // Both arms grabbing forward
          primary, secondary, accent, weapon
        });
        break;

      case 'hurt':
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -76,
          torsoTilt: -0.35, // Recoil backward
          leftLegAngle: -0.4,
          rightLegAngle: 0.1,
          leftArmAngle: -0.5,
          rightArmAngle: -0.7,
          primary, secondary, accent, weapon
        });
        break;

      case 'knockdown':
      case 'dead':
        // Airborne tumble / lying on ground
        ctx.save();
        ctx.rotate(-Math.PI / 2.3);
        ctx.translate(-40, 10);
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -80,
          torsoTilt: 0,
          leftLegAngle: 0.2,
          rightLegAngle: -0.2,
          leftArmAngle: 0.5,
          rightArmAngle: -0.5,
          primary, secondary, accent, weapon
        });
        ctx.restore();
        break;

      default:
        this.drawHumanoid(ctx, entity.charId || 'jack', {
          headY: -80,
          torsoTilt: 0,
          leftLegAngle: 0,
          rightLegAngle: 0,
          leftArmAngle: 0,
          rightArmAngle: 0,
          primary, secondary, accent, weapon
        });
        break;
    }

    ctx.restore();
  }

  /**
   * Universal Humanoid Body Builder (Jack, Maya, Mustapha, Mess, Valerie)
   */
  private drawHumanoid(
    ctx: CanvasRenderingContext2D,
    charId: CharacterId,
    p: {
      headY: number;
      torsoTilt: number;
      leftLegAngle: number;
      rightLegAngle: number;
      leftArmAngle: number;
      rightArmAngle: number;
      primary: string;
      secondary: string;
      accent: string;
      weapon?: WeaponType;
    }
  ) {
    const isMess = charId === 'mess';
    const isMaya = charId === 'maya';
    const isValerie = charId === 'valerie';
    const isMustapha = charId === 'mustapha';

    const scaleMult = isMess ? 1.22 : 1.0;
    ctx.scale(scaleMult, scaleMult);

    // 1. Back Arm
    ctx.save();
    ctx.translate(-4, p.headY + 22);
    ctx.rotate(p.leftArmAngle);
    ctx.fillStyle = p.primary;
    ctx.fillRect(-5, 0, 10, 24); // Upper arm
    // Forearm
    ctx.fillStyle = '#fcd34d'; // Skin tone
    ctx.fillRect(-4, 20, 8, 20);
    // Fist
    ctx.beginPath();
    ctx.arc(0, 42, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Back Leg
    ctx.save();
    ctx.translate(-6, p.headY + 54);
    ctx.rotate(p.leftLegAngle);
    ctx.fillStyle = p.secondary;
    ctx.fillRect(-6, 0, 12, 26); // Thigh
    // Shin & Boots
    ctx.fillStyle = '#0f172a'; // Boot
    ctx.fillRect(-6, 24, 12, 24);
    ctx.restore();

    // 3. Front Leg
    ctx.save();
    ctx.translate(6, p.headY + 54);
    ctx.rotate(p.rightLegAngle);
    ctx.fillStyle = p.secondary;
    ctx.fillRect(-7, 0, 13, 26); // Thigh
    // Shin & Boots
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-7, 24, 13, 24);
    // Boot toe
    ctx.fillRect(0, 42, 10, 6);
    ctx.restore();

    // 4. Torso
    ctx.save();
    ctx.translate(0, p.headY + 18);
    ctx.rotate(p.torsoTilt);
    ctx.fillStyle = p.primary;
    const torsoW = isMess ? 32 : (isMaya ? 20 : 25);
    ctx.fillRect(-torsoW / 2, 0, torsoW, 36);

    // Belt & Buckle
    ctx.fillStyle = '#475569';
    ctx.fillRect(-torsoW / 2, 32, torsoW, 7);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-4, 32, 8, 7);

    // Vest / Details
    if (isMess) {
      // Open vest chest
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, 24);
      ctx.closePath();
      ctx.fill();
    } else if (isMustapha) {
      // Mustapha's green trim
      ctx.fillStyle = p.accent;
      ctx.fillRect(-torsoW / 2, 0, 4, 32);
      ctx.fillRect(torsoW / 2 - 4, 0, 4, 32);
    }
    ctx.restore();

    // 5. Head & Face
    ctx.save();
    ctx.translate(0, p.headY);
    // Neck
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(-5, 10, 10, 10);
    // Head base
    ctx.beginPath();
    ctx.arc(0, 4, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Headgear based on character
    if (charId === 'jack') {
      // Jack's black hair & red bandana
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 1, 13, Math.PI, Math.PI * 2);
      ctx.fill();
      // Red bandana
      ctx.fillStyle = p.accent;
      ctx.fillRect(-12, 0, 24, 5);
      // Bandana tail flapping behind
      ctx.beginPath();
      ctx.moveTo(-12, 2);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-12, 6);
      ctx.fill();
    } else if (isMaya) {
      // Maya's sleek ponytail
      ctx.fillStyle = '#451a03'; // Brown hair
      ctx.beginPath();
      ctx.arc(0, 2, 12, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      // Ponytail tail
      ctx.fillRect(-18, 0, 10, 18);
    } else if (isMustapha) {
      // Mustapha's green backwards baseball cap
      ctx.fillStyle = p.accent;
      ctx.beginPath();
      ctx.arc(0, 2, 13, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-18, 0, 12, 4); // Visor pointing back
    } else if (isMess) {
      // Mess's shaved head with flat top / scars
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-12, -8, 24, 4);
    } else if (isValerie) {
      // Valerie's high-tech cyber headset & cropped silver-purple hair
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, 2, 13, Math.PI, Math.PI * 2);
      ctx.fill();
      // Cyan visor line
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(2, 2, 8, 3);
    }
    ctx.restore();

    // 6. Front Arm & Weapon
    ctx.save();
    ctx.translate(6, p.headY + 22);
    ctx.rotate(p.rightArmAngle);
    ctx.fillStyle = p.primary;
    ctx.fillRect(-5, 0, 10, 24); // Upper arm
    ctx.fillStyle = '#fcd34d'; // Forearm
    ctx.fillRect(-4, 20, 8, 20);

    // Hand
    ctx.beginPath();
    ctx.arc(0, 42, 6, 0, Math.PI * 2);
    ctx.fill();

    // Render held weapon in front hand
    if (p.weapon && p.weapon !== 'fists') {
      this.drawWeaponInHand(ctx, p.weapon);
    }

    ctx.restore();
  }

  /**
   * Draws weapon attached to front hand
   */
  private drawWeaponInHand(ctx: CanvasRenderingContext2D, weapon: WeaponType) {
    ctx.save();
    ctx.translate(0, 42);

    switch (weapon) {
      case 'wrench':
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-4, -5, 8, 36);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-8, 24, 16, 12);
        break;

      case 'iron_pipe':
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-3, -15, 6, 55);
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(-3, -15, 6, 55);
        break;

      case 'hunting_knife':
        ctx.fillStyle = '#475569';
        ctx.fillRect(-3, -2, 6, 12); // Handle
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(-3, 10);
        ctx.lineTo(8, 28);
        ctx.lineTo(3, 10);
        ctx.closePath();
        ctx.fill();
        break;

      case 'shotgun':
        // Wooden stock & dual barrel
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-18, -4, 20, 8);
        ctx.fillStyle = '#334155';
        ctx.fillRect(2, -5, 42, 7);
        // Pump grip
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(14, 2, 14, 4);
        break;

      case 'uzi':
        // Compact submachine gun
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-6, -6, 26, 10);
        ctx.fillRect(2, 4, 8, 16); // Extended clip
        ctx.fillStyle = '#64748b';
        ctx.fillRect(18, -4, 10, 4); // Barrel
        break;

      case 'grenade':
        ctx.fillStyle = '#15803d'; // OD Green
        ctx.beginPath();
        ctx.ellipse(4, 4, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(1, -6, 6, 4);
        break;
    }

    ctx.restore();
  }

  /**
   * Draws Enemies & Prehistoric Beasts
   */
  public drawEnemy(ctx: CanvasRenderingContext2D, entity: Entity) {
    ctx.save();
    ctx.translate(entity.x, entity.z - entity.y);
    if (entity.facing === -1) {
      ctx.scale(-1, 1);
    }

    if (entity.invincibleTimer > 0 && Math.floor(entity.invincibleTimer * 15) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const type = entity.enemyType || 'poacher_brawler';

    if (type === 'velociraptor') {
      this.drawVelociraptor(ctx, entity);
    } else if (type === 'carnotaurus' || type === 'boss_carnotaur_pack') {
      this.drawCarnotaurus(ctx, entity);
    } else if (type === 'boss_apex_rex') {
      this.drawApexRex(ctx, entity);
    } else {
      // Human poachers & bosses
      this.drawHumanPoacher(ctx, entity);
    }

    ctx.restore();
  }

  /**
   * Draws Velociraptor (Agile, lethal, feathers, sickle claw, angry red eye)
   */
  private drawVelociraptor(ctx: CanvasRenderingContext2D, entity: Entity) {
    const isEnraged = entity.dinoEnraged;
    const bodyColor = isEnraged ? '#dc2626' : '#15803d'; // Green -> Crimson
    const bellyColor = isEnraged ? '#f87171' : '#86efac';
    const cycle = entity.animFrame * 0.2;
    const isAttacking = entity.state === 'attack1' || entity.state === 'jump_attack';
    const isHurt = entity.state === 'hurt' || entity.state === 'knockdown';

    ctx.save();
    if (isHurt) {
      ctx.rotate(-0.4);
      ctx.translate(-15, 0);
    }

    // 1. Long counterbalanced tail
    ctx.save();
    ctx.translate(-25, -35);
    const tailWag = Math.sin(cycle) * 0.15;
    ctx.rotate(-0.1 + tailWag);
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-45, -10, -75, -25);
    ctx.stroke();
    // Tail tip feathers
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(-72, -26, 8, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Muscular Hind Legs & Sickle Claw
    const leg1 = Math.sin(cycle) * 0.4;
    const leg2 = -leg1;

    // Back leg
    ctx.save();
    ctx.translate(-10, -30);
    ctx.rotate(leg1);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-8, 0, 14, 20); // Thigh
    ctx.fillRect(-4, 18, 8, 16);  // Shin
    // Foot & sickle claw
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, 32, 18, 5);
    ctx.restore();

    // 3. Body Torso
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -40, 32, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Underbelly
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, -34, 22, 10, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 4. Front leg
    ctx.save();
    ctx.translate(6, -30);
    ctx.rotate(leg2);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-8, 0, 16, 22);
    ctx.fillRect(-4, 20, 9, 18);
    // Foot
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, 36, 20, 5);
    // Vicious raised sickle claw!
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(6, 30, 8, -Math.PI / 2, 0.2);
    ctx.stroke();
    ctx.restore();

    // 5. Forearms / Claws
    ctx.save();
    ctx.translate(18, -42);
    ctx.rotate(isAttacking ? 0.6 : 0.2);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(0, 0, 18, 6);
    // Three sharp grasping talons
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(16, -2, 6, 2);
    ctx.fillRect(17, 1, 6, 2);
    ctx.fillRect(16, 4, 6, 2);
    ctx.restore();

    // 6. Snapping Head & Tooth-Filled Jaws
    ctx.save();
    ctx.translate(26, -55);
    const jawOpen = isAttacking ? 0.4 : 0.08;
    // Upper snout
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(34, -4);
    ctx.lineTo(36, 6);
    ctx.lineTo(8, 12);
    ctx.closePath();
    ctx.fill();

    // Sharp white serrated teeth
    ctx.fillStyle = '#ffffff';
    for (let i = 12; i < 34; i += 5) {
      ctx.fillRect(i, 5, 2, 4);
    }

    // Lower jaw
    ctx.save();
    ctx.translate(8, 12);
    ctx.rotate(jawOpen);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(0, 0, 26, 6);
    // Lower teeth
    ctx.fillStyle = '#ffffff';
    for (let i = 4; i < 24; i += 5) {
      ctx.fillRect(i, -3, 2, 3);
    }
    ctx.restore();

    // Fierce glowing eye
    ctx.fillStyle = isEnraged ? '#facc15' : '#e11d48';
    ctx.beginPath();
    ctx.arc(10, 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(9, 0, 2, 4); // Slit pupil

    ctx.restore();
    ctx.restore();
  }

  /**
   * Draws Carnotaurus / Horned Beast
   */
  private drawCarnotaurus(ctx: CanvasRenderingContext2D, entity: Entity) {
    ctx.save();
    const cycle = entity.animFrame * 0.15;
    const bodyColor = '#9a3412'; // Rust brown scales
    const bellyColor = '#fed7aa';

    ctx.scale(1.4, 1.4); // Larger than raptor

    // Tail
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(-25, -35);
    ctx.quadraticCurveTo(-60, -20, -90, -35);
    ctx.stroke();

    // Heavy legs
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-15, -20, 18, 30);
    ctx.fillRect(10, -20, 18, 30);

    // Thick torso
    ctx.beginPath();
    ctx.ellipse(0, -42, 42, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Underbelly
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, -34, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head with demonic brow horns
    ctx.save();
    ctx.translate(35, -55);
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 16, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Bull Horns!
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(2, -12);
    ctx.lineTo(8, -26);
    ctx.lineTo(14, -12);
    ctx.closePath();
    ctx.fill();

    // Snapping jaw
    ctx.fillStyle = '#ffffff';
    for (let i = -5; i < 20; i += 6) {
      ctx.fillRect(i, 8, 3, 5);
    }
    // Eye
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(6, -2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  /**
   * Draws APEX CYBER-REX (Massive Stage 4 Boss Titan)
   */
  private drawApexRex(ctx: CanvasRenderingContext2D, entity: Entity) {
    ctx.save();
    ctx.scale(2.2, 2.2); // Colossal scale!

    const bodyColor = '#1e293b'; // Slate armor scales
    const cyberGlow = '#ef4444'; // Red glowing cyber implants
    const underbelly = '#475569';

    // Massive tail
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-30, -40);
    ctx.quadraticCurveTo(-80, -25, -130, -45);
    ctx.stroke();

    // Spines along spine
    ctx.fillStyle = cyberGlow;
    for (let x = -80; x < 20; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, -58);
      ctx.lineTo(x + 5, -72);
      ctx.lineTo(x + 10, -58);
      ctx.fill();
    }

    // Heavy T-Rex Hind Leg
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-12, -25, 24, 38);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, 10, 32, 10); // Massive taloned foot

    // Torso
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -50, 52, 32, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Cyber Power Core on chest
    ctx.fillStyle = cyberGlow;
    ctx.beginPath();
    ctx.ellipse(-2, -50, 12, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiny vestigial arms
    ctx.fillStyle = bodyColor;
    ctx.fillRect(26, -42, 14, 6);
    ctx.fillRect(36, -42, 4, 8);

    // Colossal Skull & Jaws
    ctx.save();
    ctx.translate(46, -75);
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(55, -8);
    ctx.lineTo(50, 22);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fill();

    // Giant teeth
    ctx.fillStyle = '#ffffff';
    for (let i = 10; i < 50; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 16);
      ctx.lineTo(i + 4, 27);
      ctx.lineTo(i + 8, 16);
      ctx.fill();
    }

    // Lower jaw
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(5, 22, 42, 10);

    // Cyber visor eye
    ctx.fillStyle = cyberGlow;
    ctx.fillRect(15, -4, 18, 5);

    ctx.restore();
    ctx.restore();
  }

  /**
   * Draws Human Poachers & Human Bosses (Vice, Fessenden)
   */
  private drawHumanPoacher(ctx: CanvasRenderingContext2D, entity: Entity) {
    const isVice = entity.enemyType === 'boss_vice';
    const isFessenden = entity.enemyType === 'boss_fessenden';
    const isShotgun = entity.enemyType === 'poacher_shotgun';
    const isBruiser = entity.enemyType === 'poacher_bruiser';

    let primary = '#dc2626'; // Red punk
    let secondary = '#1e293b';
    let accent = '#f59e0b';

    if (isVice) {
      primary = '#4c0519'; // Burgundy biker vest
      secondary = '#0f172a';
      accent = '#fbbf24';
    } else if (isFessenden) {
      primary = '#f8fafc'; // Mad scientist white coat
      secondary = '#0369a1';
      accent = '#a855f7';
    } else if (isShotgun) {
      primary = '#15803d'; // Hunter green
      secondary = '#78350f';
    } else if (isBruiser) {
      primary = '#7c2d12';
      secondary = '#1e293b';
    }

    const scaleMult = (isBruiser || isVice) ? 1.25 : (isFessenden ? 1.15 : 0.95);
    ctx.scale(scaleMult, scaleMult);

    this.drawHumanoid(ctx, 'jack', {
      headY: -80,
      torsoTilt: entity.state === 'hurt' ? -0.3 : 0,
      leftLegAngle: entity.state === 'walk' ? Math.sin(entity.animFrame * 0.2) * 0.4 : 0,
      rightLegAngle: entity.state === 'walk' ? -Math.sin(entity.animFrame * 0.2) * 0.4 : 0,
      leftArmAngle: entity.state === 'attack1' ? 1.2 : 0,
      rightArmAngle: entity.state === 'attack1' ? 1.3 : 0,
      primary, secondary, accent,
      weapon: isShotgun ? 'shotgun' : (entity.enemyType === 'poacher_knife' ? 'hunting_knife' : undefined)
    });

    // Special Boss Equipment
    if (isVice) {
      // Iron chain swinging
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(20, -50, 30, 0, Math.PI * 1.5);
      ctx.stroke();
    } else if (isFessenden) {
      // Cybernetic glow arm
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(8, -55);
      ctx.lineTo(24, -40);
      ctx.stroke();
    }
  }

  /**
   * Draws the Legendary 1953 Red Custom Cadillac Coupe Deville!
   */
  public drawCadillac(ctx: CanvasRenderingContext2D, caddy: { x: number; z: number; nitroActive: boolean; speed: number }) {
    ctx.save();
    ctx.translate(caddy.x, caddy.z);

    // Ground shadow for vehicle
    this.drawShadow(ctx, 0, 10, 0, 130, 32);

    // 1. Sleek Red Chassis (1953 Cadillac Coupe Deville profile)
    // Nitro speed flame trail
    if (caddy.nitroActive) {
      ctx.save();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-110, -12);
      ctx.lineTo(-170 - Math.random() * 40, -16);
      ctx.lineTo(-110, -20);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-110, -14);
      ctx.lineTo(-145 - Math.random() * 25, -16);
      ctx.lineTo(-110, -18);
      ctx.fill();
      ctx.restore();
    }

    // Lower body
    ctx.fillStyle = '#b91c1c'; // Deep cherry red
    ctx.beginPath();
    ctx.roundRect(-110, -28, 220, 26, [8, 14, 4, 6]);
    ctx.fill();

    // Chrome body trim stripe
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-105, -16, 210, 3);

    // Iconic 50s Tailfin!
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-105, -28);
    ctx.lineTo(-115, -45); // Tailfin point
    ctx.lineTo(-80, -28);
    ctx.closePath();
    ctx.fill();
    // Red bullet taillight
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-112, -40, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cabin & Curved Windshield
    ctx.fillStyle = '#1e293b'; // Tinted glass
    ctx.beginPath();
    ctx.moveTo(-50, -28);
    ctx.lineTo(-30, -52); // Rear pillar
    ctx.lineTo(35, -52);  // Roof line
    ctx.lineTo(60, -28);  // Windshield slant
    ctx.closePath();
    ctx.fill();

    // Chrome roof trim
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-32, -52);
    ctx.lineTo(37, -52);
    ctx.stroke();

    // Jack & Crew silhouettes inside cabin!
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(10, -38, 8, 0, Math.PI * 2); // Driver head
    ctx.fill();
    // Red bandana
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, -42, 12, 3);

    // Front Chrome Grille & Bumper
    ctx.fillStyle = '#f8fafc'; // Chrome bumper
    ctx.fillRect(100, -26, 15, 18);
    ctx.fillStyle = '#94a3b8'; // Grille slats
    ctx.fillRect(95, -22, 6, 12);

    // Dual Headlights casting Volumetric Light Beam!
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(105, -22, 6, 0, Math.PI * 2);
    ctx.fill();

    // Light beam onto the road
    const beamGrad = ctx.createRadialGradient(105, -22, 5, 260, -10, 180);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(105, -22);
    ctx.lineTo(340, -50);
    ctx.lineTo(340, 35);
    ctx.closePath();
    ctx.fill();

    // Chrome Side Mirror & Door Handle
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(42, -34, 5, 3);
    ctx.fillRect(-10, -18, 8, 2);

    // Heavy Whitewall Wheels with Chrome Hubcaps
    this.drawWheel(ctx, -65, 0, caddy.speed);
    this.drawWheel(ctx, 65, 0, caddy.speed);

    ctx.restore();
  }

  private drawWheel(ctx: CanvasRenderingContext2D, x: number, y: number, speed: number) {
    ctx.save();
    ctx.translate(x, y);

    // Black tire
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Whitewall ring
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Chrome Hubcap
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Spinning spokes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draws Destructible Crates, Barrels & Dino Cages
   */
  public drawDestructible(ctx: CanvasRenderingContext2D, obj: DestructibleObject) {
    ctx.save();
    ctx.translate(obj.x, obj.z);

    // Shadow
    this.drawShadow(ctx, 0, 0, 0, 24, 10);

    if (obj.type === 'oil_barrel') {
      // Red hazard oil barrel with metal ribs
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.roundRect(-16, -42, 32, 42, 4);
      ctx.fill();

      // Metal bands
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-16, -34, 32, 3);
      ctx.fillRect(-16, -18, 32, 3);

      // Skull or hazard emblem
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -26, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (obj.type === 'wooden_crate') {
      // Wooden crate with cross braces
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-18, -36, 36, 36);

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.strokeRect(-18, -36, 36, 36);
      // Cross brace
      ctx.beginPath();
      ctx.moveTo(-18, -36);
      ctx.lineTo(18, 0);
      ctx.moveTo(18, -36);
      ctx.lineTo(-18, 0);
      ctx.stroke();
    } else {
      // Dino cage with iron bars
      ctx.fillStyle = '#334155';
      ctx.fillRect(-22, -45, 44, 45);
      // Vertical bars
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      for (let bx = -16; bx <= 16; bx += 8) {
        ctx.beginPath();
        ctx.moveTo(bx, -45);
        ctx.lineTo(bx, 0);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Draws Item Drops (Roast Chicken, Cheeseburger, Medkit, Diamond, Weapons)
   */
  public drawItem(ctx: CanvasRenderingContext2D, item: ItemDrop) {
    ctx.save();
    ctx.translate(item.x, item.z - item.y);

    // Gentle floating bob
    const bob = Math.sin(Date.now() * 0.006) * 3;
    ctx.translate(0, bob);

    // Glowing item halo
    ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
    ctx.beginPath();
    ctx.arc(0, -12, 20, 0, Math.PI * 2);
    ctx.fill();

    switch (item.itemType) {
      case 'roast_chicken':
        // Golden roasted turkey on silver platter!
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(0, -4, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Golden chicken
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, -12, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Drumstick bone
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(8, -16, 8, 4);
        break;

      case 'cheeseburger':
        // Bun
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -14, 10, Math.PI, Math.PI * 2);
        ctx.fill();
        // Patty & Cheese
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-9, -13, 18, 4);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-10, -9, 20, 2);
        // Bottom bun
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-9, -7, 18, 4);
        break;

      case 'medkit':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -20, 20, 16);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-3, -17, 6, 10);
        ctx.fillRect(-6, -15, 12, 6);
        break;

      case 'diamond':
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(12, -14);
        ctx.lineTo(0, -4);
        ctx.lineTo(-12, -14);
        ctx.closePath();
        ctx.fill();
        break;

      case 'gold_bar':
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-12, -14, 24, 10);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-10, -12, 20, 3);
        break;

      case 'shotgun':
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, -14, 12, 5);
        ctx.fillStyle = '#475569';
        ctx.fillRect(-2, -15, 26, 4);
        break;

      case 'uzi':
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, -16, 20, 8);
        ctx.fillRect(-2, -8, 6, 8);
        break;

      case 'grenade':
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -10, 7, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'pipe':
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-2, -26, 4, 30);
        break;
    }

    ctx.restore();
  }
}

export const spriteRenderer = new SpriteRenderer();
