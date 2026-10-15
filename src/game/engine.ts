/**
 * Cadillacs & Dinosaurs: Apex Arcade - Core 60fps Simulation Engine
 * Manages player physics, combo mechanics, enemy AI, collisions, camera tracking, and Cadillac action
 */
import { CHARACTERS, GRAVITY, STAGES, WEAPONS, WORLD_Z_MAX, WORLD_Z_MIN } from './constants';
import { environmentRenderer } from './environments';
import { sound } from './sound';
import { spriteRenderer } from './sprites';
import {
  CadillacVehicle,
  CharacterId,
  DestructibleObject,
  EnemyCategory,
  Entity,
  FloatingText,
  GameState,
  InputState,
  ItemDrop,
  Particle,
  PlayerStats,
  WeaponType
} from './types';

export class GameEngine {
  public gameState: GameState = 'TITLE';
  public currentStageId: number = 1;
  public selectedCharacter: CharacterId = 'jack';

  public player: Entity;
  public enemies: Entity[] = [];
  public destructibles: DestructibleObject[] = [];
  public items: ItemDrop[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  public cadillac: CadillacVehicle;
  public stats: PlayerStats;

  // Viewport & Camera
  public cameraX: number = 0;
  public canvasWidth: number = 1280;
  public canvasHeight: number = 720;
  public cameraShake: number = 0;
  public hitstopTimer: number = 0;

  // Checkpoints & Wave Locks
  public currentWaveIndex: number = 0;
  public waveLocked: boolean = false;
  public showGoIndicator: boolean = false;
  public goIndicatorBlink: number = 0;

  // Callbacks for React HUD updates
  public onStateChange?: (state: GameState) => void;
  public onStatsUpdate?: (stats: PlayerStats, playerHp: number, playerMaxHp: number, boss?: Entity) => void;

  constructor() {
    this.stats = {
      score: 0,
      highScore: parseInt(localStorage.getItem('apex_caddy_highscore') || '50000', 10),
      lives: 3,
      credits: 3,
      comboCount: 0,
      maxCombo: 0,
      enemiesDefeated: 0,
      cadillacSummonsAvailable: 2,
      specialGauge: 100
    };

    this.cadillac = {
      active: false,
      mode: 'summon_strike',
      x: -300,
      z: 110,
      speed: 0,
      targetX: 0,
      nitroActive: false,
      hitEnemies: new Set(),
      hornTimer: 0
    };

    this.player = this.createPlayerEntity('jack');
  }

  public setCharacter(charId: CharacterId) {
    this.selectedCharacter = charId;
    this.player = this.createPlayerEntity(charId);
  }

  public startStage(stageId: number) {
    this.currentStageId = stageId;
    this.player = this.createPlayerEntity(this.selectedCharacter);
    this.enemies = [];
    this.destructibles = [];
    this.items = [];
    this.particles = [];
    this.floatingTexts = [];
    this.cameraX = 0;
    this.currentWaveIndex = 0;
    this.waveLocked = false;
    this.showGoIndicator = false;

    // Spawn initial stage layout
    this.spawnStageEntities(stageId);

    this.gameState = 'PLAYING';
    sound.startStageMusic(stageId);
    if (this.onStateChange) this.onStateChange('PLAYING');
  }

  private createPlayerEntity(charId: CharacterId): Entity {
    const char = CHARACTERS[charId];
    return {
      id: 'player_1',
      isPlayer: true,
      charId,
      name: char.name,
      x: 150,
      y: 0,
      z: 100,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: 1,
      hp: char.health,
      maxHp: char.health,
      state: 'idle',
      stateTimer: 0,
      animFrame: 0,
      comboStep: 0,
      comboResetTimer: 0,
      weapon: 'fists',
      ammo: 0,
      invincibleTimer: 1.0,
      aiActionTimer: 0
    };
  }

  private spawnStageEntities(stageId: number) {
    const stage = STAGES.find(s => s.id === stageId) || STAGES[0];

    // Spawn destructibles along the level
    for (let x = 400; x < stage.length - 400; x += 450 + Math.random() * 300) {
      const typeChoice: DestructibleObject['type'] = 
        Math.random() < 0.4 ? 'oil_barrel' : (Math.random() < 0.7 ? 'wooden_crate' : 'dino_cage');
      const itemChoice: ItemDrop['itemType'] = 
        Math.random() < 0.35 ? 'roast_chicken' : (Math.random() < 0.65 ? 'cheeseburger' : (Math.random() < 0.85 ? 'shotgun' : 'uzi'));

      this.destructibles.push({
        id: `destruct_${x}`,
        x,
        z: WORLD_Z_MIN + 20 + Math.random() * (WORLD_Z_MAX - WORLD_Z_MIN - 40),
        type: typeChoice,
        hp: typeChoice === 'dino_cage' ? 50 : 25,
        maxHp: typeChoice === 'dino_cage' ? 50 : 25,
        contains: itemChoice,
        containsAmmo: itemChoice === 'shotgun' ? 6 : (itemChoice === 'uzi' ? 30 : undefined)
      });
    }

    // Spawn wave 1 enemies
    this.spawnWaveEnemies(0);
  }

  private spawnWaveEnemies(waveIdx: number) {
    const stage = STAGES.find(s => s.id === this.currentStageId) || STAGES[0];
    const baseSpawnX = (stage.waveCheckpoints[waveIdx] || 800) + 150;

    const waveRosters: Record<number, EnemyCategory[][]> = {
      1: [
        ['poacher_brawler', 'poacher_brawler', 'poacher_knife'],
        ['poacher_brawler', 'poacher_knife', 'velociraptor'],
        ['poacher_bruiser', 'poacher_shotgun', 'velociraptor', 'velociraptor'],
        ['boss_vice', 'poacher_brawler', 'poacher_shotgun']
      ],
      2: [
        ['poacher_knife', 'velociraptor', 'velociraptor'],
        ['velociraptor', 'velociraptor', 'poacher_bruiser'],
        ['carnotaurus', 'poacher_shotgun', 'velociraptor'],
        ['boss_carnotaur_pack', 'velociraptor', 'velociraptor']
      ],
      3: [
        ['poacher_knife', 'poacher_shotgun', 'poacher_bruiser'],
        ['velociraptor', 'velociraptor', 'poacher_shotgun', 'poacher_bruiser'],
        ['carnotaurus', 'poacher_shotgun', 'poacher_shotgun'],
        ['boss_fessenden', 'carnotaurus', 'velociraptor']
      ],
      4: [
        ['poacher_bruiser', 'velociraptor', 'velociraptor'],
        ['carnotaurus', 'carnotaurus', 'poacher_shotgun'],
        ['carnotaurus', 'velociraptor', 'velociraptor', 'poacher_bruiser'],
        ['boss_apex_rex', 'velociraptor', 'velociraptor']
      ]
    };

    const roster = waveRosters[this.currentStageId]?.[waveIdx] || ['poacher_brawler', 'velociraptor'];
    roster.forEach((type, i) => {
      this.enemies.push(this.createEnemyEntity(type, baseSpawnX + i * 70, WORLD_Z_MIN + 30 + (i * 35) % (WORLD_Z_MAX - WORLD_Z_MIN - 40)));
    });
  }

  private createEnemyEntity(type: EnemyCategory, x: number, z: number): Entity {
    let hp = 45;
    let name = 'Street Poacher';
    if (type === 'poacher_knife') { hp = 40; name = 'Blade Scavenger'; }
    if (type === 'poacher_shotgun') { hp = 55; name = 'Hunter Trooper'; }
    if (type === 'poacher_bruiser') { hp = 100; name = 'Crusher Enforcer'; }
    if (type === 'velociraptor') { hp = 65; name = 'Wild Velociraptor'; }
    if (type === 'carnotaurus') { hp = 160; name = 'Horned Carnotaurus'; }
    if (type === 'boss_vice') { hp = 320; name = 'Vice "Ironclaw"'; }
    if (type === 'boss_carnotaur_pack') { hp = 380; name = 'Hogg & Alpha Carno'; }
    if (type === 'boss_fessenden') { hp = 440; name = 'Dr. Fessenden (Cyborg)'; }
    if (type === 'boss_apex_rex') { hp = 650; name = 'APEX CYBER-REX'; }

    return {
      id: `enemy_${Date.now()}_${Math.random()}`,
      isPlayer: false,
      enemyType: type,
      name,
      x,
      y: 0,
      z,
      vx: 0,
      vy: 0,
      vz: 0,
      facing: -1,
      hp,
      maxHp: hp,
      state: 'idle',
      stateTimer: 0,
      animFrame: Math.floor(Math.random() * 20),
      comboStep: 0,
      comboResetTimer: 0,
      weapon: type === 'poacher_shotgun' ? 'shotgun' : (type === 'poacher_knife' ? 'hunting_knife' : 'fists'),
      ammo: 99,
      invincibleTimer: 0.3,
      aiActionTimer: 0.5 + Math.random() * 0.8,
      aiState: 'approach',
      dinoEnraged: type.startsWith('boss') || false
    };
  }

  /**
   * Main 60fps Tick Update
   */
  public update(dt: number, input: InputState) {
    if (this.gameState !== 'PLAYING') return;

    // Hitstop freeze for heavy impacts
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Camera shake decay
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 25);
    }

    // 1. Update Player
    this.updatePlayer(dt, input);

    // 2. Update Cadillac Super Strike
    this.updateCadillac(dt);

    // 3. Update Enemies
    this.updateEnemies(dt);

    // 4. Update Destructibles & Items
    this.updateItemsAndDestructibles(dt);

    // 5. Update Floating Texts & Particles
    this.updateEffects(dt);

    // 6. Camera Tracking & Wave Lock
    this.updateCameraAndCheckpoints(dt);

    // 7. Push stats update to UI
    if (this.onStatsUpdate) {
      const activeBoss = this.enemies.find(e => e.enemyType?.startsWith('boss') && e.hp > 0);
      this.onStatsUpdate(this.stats, this.player.hp, this.player.maxHp, activeBoss);
    }
  }

  /**
   * Player Movement, Combat, and Combos
   */
  private updatePlayer(dt: number, input: InputState) {
    const p = this.player;
    const char = CHARACTERS[p.charId || 'jack'];
    p.stateTimer += dt;
    p.animFrame++;

    if (p.invincibleTimer > 0) {
      p.invincibleTimer = Math.max(0, p.invincibleTimer - dt);
    }

    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) {
        p.comboStep = 0;
      }
    }

    // Regain special gauge over time
    if (this.stats.specialGauge < 100) {
      this.stats.specialGauge = Math.min(100, this.stats.specialGauge + dt * 15);
    }

    // Check Call Cadillac Strike
    if (input.cadillacJustPressed && this.stats.cadillacSummonsAvailable > 0 && !this.cadillac.active) {
      this.callCadillacStrike();
    }

    // Dead / Knockdown recovery
    if (p.state === 'knockdown') {
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= GRAVITY;
      if (p.y <= 0) {
        p.y = 0;
        p.vy = 0;
        p.vx = 0;
        if (p.stateTimer > 0.8) {
          p.state = 'getup';
          p.stateTimer = 0;
        }
      }
      return;
    }

    if (p.state === 'getup') {
      if (p.stateTimer > 0.4) {
        p.state = 'idle';
        p.invincibleTimer = 1.2;
      }
      return;
    }

    if (p.state === 'hurt') {
      p.x += p.vx;
      if (p.stateTimer > 0.28) {
        p.state = 'idle';
      }
      return;
    }

    // Jumping physics
    if (p.y > 0 || p.vy !== 0) {
      p.y += p.vy;
      p.vy -= GRAVITY;
      p.x += p.vx;
      p.z += p.vz;

      // Jump attack in mid-air
      if (input.attackJustPressed && p.state !== 'jump_attack') {
        p.state = 'jump_attack';
        sound.playPunch('heavy');
        this.performJumpAttackHit();
      }

      if (p.y <= 0) {
        p.y = 0;
        p.vy = 0;
        p.vx = 0;
        p.vz = 0;
        p.state = 'idle';
        this.spawnDust(p.x, p.z, 5);
      }
      return;
    }

    // Ground Attacks & Specials
    if (p.state === 'special') {
      if (p.stateTimer > 0.55) {
        p.state = 'idle';
      } else {
        // Multi-hit spin radius
        this.performSpecialSpinHits();
      }
      return;
    }

    if (p.state.startsWith('attack') || p.state === 'dash_attack') {
      if (p.stateTimer > (p.state === 'attack3' ? 0.38 : 0.24)) {
        p.state = 'idle';
      }
      return;
    }

    // SPECIAL MOVE TRIGGER (Attack + Jump simultaneously or Special key 'L')
    if (input.specialJustPressed || (input.attackJustPressed && input.jumpJustPressed)) {
      if (this.stats.specialGauge >= 25) {
        p.state = 'special';
        p.stateTimer = 0;
        p.invincibleTimer = 0.6;
        this.stats.specialGauge -= 25;
        p.hp = Math.max(1, p.hp - char.specialCost); // Classic C&D HP cost
        sound.playSpecial();
        this.cameraShake = 5;
        this.addFloatingText(p.x, p.z, -50, char.specialName, char.accentColor, 20);
        return;
      }
    }

    // JUMP TRIGGER
    if (input.jumpJustPressed && p.y === 0) {
      p.state = 'jump';
      p.vy = 12.5 * (char.speed / 7.5);
      p.vx = (input.right ? 4 : (input.left ? -4 : 0));
      p.vz = (input.down ? 2 : (input.up ? -2 : 0));
      sound.playJump();
      this.spawnDust(p.x, p.z, 4);
      return;
    }

    // ATTACK TRIGGER (Combos & Weapon firing)
    if (input.attackJustPressed) {
      // Check pickup items/weapons at player feet first!
      if (this.tryPickupAtFeet()) {
        return;
      }

      // Firearm shooting
      if (p.weapon === 'shotgun' || p.weapon === 'uzi') {
        this.firePlayerWeapon();
        return;
      }

      // Dash attack if sprinting
      if (p.state === 'run') {
        p.state = 'dash_attack';
        p.stateTimer = 0;
        p.vx = p.facing * 7;
        sound.playPunch('heavy');
        this.performDashAttackHit();
        return;
      }

      // Combo 1-2-3
      if (p.comboStep === 0) {
        p.state = 'attack1';
        p.comboStep = 1;
        p.comboResetTimer = 0.55;
        sound.playPunch('light');
        this.performMeleeHit(1, 14, 5);
      } else if (p.comboStep === 1) {
        p.state = 'attack2';
        p.comboStep = 2;
        p.comboResetTimer = 0.55;
        sound.playPunch('light');
        this.performMeleeHit(2, 18, 7);
      } else {
        // Combo Finisher!
        p.state = 'attack3';
        p.comboStep = 0;
        p.comboResetTimer = 0;
        sound.playPunch('knockout');
        this.performMeleeHit(3, 35, 16);
      }
      p.stateTimer = 0;
      return;
    }

    // Movement (8-way belt-scrolling)
    const moveSpeed = (input.dash ? 5.8 : 3.4) * (char.speed / 7);
    let dx = 0;
    let dz = 0;

    if (input.left) { dx -= 1; p.facing = -1; }
    if (input.right) { dx += 1; p.facing = 1; }
    if (input.up) { dz -= 0.7; }
    if (input.down) { dz += 0.7; }

    if (dx !== 0 || dz !== 0) {
      const len = Math.hypot(dx, dz);
      p.x += (dx / len) * moveSpeed;
      p.z += (dz / len) * moveSpeed;
      p.state = input.dash ? 'run' : 'walk';

      // Keep within world bounds
      p.z = Math.max(WORLD_Z_MIN, Math.min(WORLD_Z_MAX, p.z));
      const minX = this.cameraX + 40;
      const maxX = this.cameraX + this.canvasWidth - 60;
      p.x = Math.max(minX, Math.min(maxX, p.x));
    } else {
      p.state = 'idle';
    }
  }

  /**
   * Weapon Firing Logic
   */
  private firePlayerWeapon() {
    const p = this.player;
    if (p.ammo <= 0) {
      p.weapon = 'fists';
      return;
    }

    p.ammo--;
    p.state = 'attack1';
    p.stateTimer = 0;

    if (p.weapon === 'shotgun') {
      sound.playShotgun();
      this.cameraShake = 8;
      this.spawnMuzzleFlash(p.x + p.facing * 45, p.z, -55);
      
      // Shotgun blast cone knocks down everything
      this.enemies.forEach(e => {
        const dx = (e.x - p.x) * p.facing;
        const dz = Math.abs(e.z - p.z);
        if (dx > 0 && dx < 360 && dz < 45) {
          this.applyDamageToEnemy(e, 48, 16, 'shotgun');
        }
      });
      // Also damages barrels
      this.destructibles.forEach(d => {
        const dx = (d.x - p.x) * p.facing;
        const dz = Math.abs(d.z - p.z);
        if (dx > 0 && dx < 360 && dz < 40) {
          this.smashDestructible(d);
        }
      });
    } else if (p.weapon === 'uzi') {
      sound.playMachineGun();
      this.spawnMuzzleFlash(p.x + p.facing * 35, p.z, -52);
      
      // Rapid hitscan
      const target = this.enemies
        .filter(e => (e.x - p.x) * p.facing > 0 && Math.abs(e.z - p.z) < 30)
        .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];

      if (target) {
        this.applyDamageToEnemy(target, 16, 4, 'uzi');
      }
    }

    if (p.ammo <= 0) {
      p.weapon = 'fists';
      this.addFloatingText(p.x, p.z, -40, 'EMPTY!', '#ef4444', 16);
    }
  }

  /**
   * Melee Hit Detection (Combos 1, 2, 3)
   */
  private performMeleeHit(step: number, baseDmg: number, knockback: number) {
    const p = this.player;
    const char = CHARACTERS[p.charId || 'jack'];
    const dmg = Math.round(baseDmg * (char.power / 7));
    const range = 58;

    let hitAny = false;

    this.enemies.forEach(e => {
      if (e.hp <= 0 || e.state === 'knockdown' || e.state === 'dead') return;
      const dx = (e.x - p.x) * p.facing;
      const dz = Math.abs(e.z - p.z);

      if (dx > -10 && dx < range && dz < 28) {
        hitAny = true;
        this.applyDamageToEnemy(e, dmg, step === 3 ? knockback : 2, 'punch');
        
        // Dino Enrage trigger on hit!
        if (e.enemyType === 'velociraptor' || e.enemyType === 'carnotaurus') {
          e.dinoEnraged = true;
          sound.playDinoRoar();
        }
      }
    });

    // Check destructibles
    this.destructibles.forEach(d => {
      const dx = (d.x - p.x) * p.facing;
      const dz = Math.abs(d.z - p.z);
      if (dx > -10 && dx < range && dz < 25) {
        this.damageDestructible(d, dmg);
      }
    });

    if (hitAny) {
      this.incrementCombo();
      this.hitstopTimer = step === 3 ? 0.08 : 0.04;
    }
  }

  private performJumpAttackHit() {
    const p = this.player;
    this.enemies.forEach(e => {
      if (e.hp <= 0) return;
      const dist = Math.hypot(e.x - p.x, e.z - p.z);
      if (dist < 65) {
        this.applyDamageToEnemy(e, 30, 14, 'jump_kick');
        this.incrementCombo();
        this.hitstopTimer = 0.06;
      }
    });
  }

  private performDashAttackHit() {
    const p = this.player;
    this.enemies.forEach(e => {
      if (e.hp <= 0) return;
      const dx = (e.x - p.x) * p.facing;
      const dz = Math.abs(e.z - p.z);
      if (dx > 0 && dx < 70 && dz < 25) {
        this.applyDamageToEnemy(e, 35, 18, 'dash_attack');
        this.incrementCombo();
        this.hitstopTimer = 0.07;
      }
    });
  }

  private performSpecialSpinHits() {
    const p = this.player;
    this.enemies.forEach(e => {
      if (e.hp <= 0 || e.state === 'knockdown') return;
      const dist = Math.hypot(e.x - p.x, e.z - p.z);
      if (dist < 85) {
        const knockDir = e.x > p.x ? 1 : -1;
        e.facing = knockDir === 1 ? -1 : 1;
        this.applyDamageToEnemy(e, 26, 16, 'special');
        this.incrementCombo();
      }
    });
  }

  /**
   * Apply Damage to Enemy Entity
   */
  private applyDamageToEnemy(e: Entity, dmg: number, knockback: number, hitType: string) {
    e.hp -= dmg;
    this.stats.score += dmg * 10;
    this.stats.highScore = Math.max(this.stats.highScore, this.stats.score);
    localStorage.setItem('apex_caddy_highscore', this.stats.highScore.toString());

    // Floating combat text
    const textLabels = ['POW!', 'CRUNCH!', 'WHAM!', 'KABOOM!', 'SLAM!'];
    const label = textLabels[Math.floor(Math.random() * textLabels.length)];
    this.addFloatingText(e.x, e.z, -70, `${label} ${dmg}`, '#fef08a', 18);

    // Hit sparks & blood
    this.spawnHitSparks(e.x, e.z, -50);

    if (e.hp <= 0) {
      e.hp = 0;
      e.state = 'knockdown';
      e.vx = (e.x > this.player.x ? 1 : -1) * (knockback + 4);
      e.vy = 9;
      sound.playPunch('knockout');
      this.stats.enemiesDefeated++;
      this.stats.score += 500;
      this.addFloatingText(e.x, e.z, -90, 'K.O. +500', '#f97316', 22);

      // Random chance to drop item or weapon
      if (Math.random() < 0.4) {
        this.spawnItemDrop(e.x, e.z, Math.random() < 0.5 ? 'cheeseburger' : (Math.random() < 0.8 ? 'gold_bar' : 'uzi'));
      }
    } else {
      if (knockback > 8) {
        e.state = 'knockdown';
        e.vx = (e.x > this.player.x ? 1 : -1) * knockback;
        e.vy = 7;
      } else {
        e.state = 'hurt';
        e.stateTimer = 0;
        e.vx = (e.x > this.player.x ? 1 : -1) * 3;
      }
    }
  }

  /**
   * Destructibles & Items Logic
   */
  private damageDestructible(d: DestructibleObject, dmg: number) {
    d.hp -= dmg;
    sound.playBarrelSmash();
    this.spawnDust(d.x, d.z, 8);
    if (d.hp <= 0) {
      this.smashDestructible(d);
    }
  }

  private smashDestructible(d: DestructibleObject) {
    sound.playExplosion();
    this.cameraShake = 7;
    this.spawnExplosionParticles(d.x, d.z);

    // Spawn contained item
    this.spawnItemDrop(d.x, d.z, d.contains, d.containsAmmo);

    // Remove from array
    this.destructibles = this.destructibles.filter(item => item.id !== d.id);
  }

  private spawnItemDrop(x: number, z: number, itemType: ItemDrop['itemType'], ammo?: number) {
    this.items.push({
      id: `item_${Date.now()}_${Math.random()}`,
      x,
      y: 20,
      z,
      vy: 6,
      itemType,
      ammo: ammo || (itemType === 'shotgun' ? 6 : (itemType === 'uzi' ? 30 : undefined)),
      value: itemType === 'gold_bar' ? 1000 : (itemType === 'diamond' ? 2500 : 200),
      isBouncing: true
    });
  }

  private tryPickupAtFeet(): boolean {
    const p = this.player;
    const target = this.items.find(item => {
      return Math.hypot(item.x - p.x, item.z - p.z) < 45;
    });

    if (!target) return false;

    // Pick up
    if (target.itemType === 'roast_chicken') {
      p.hp = Math.min(p.maxHp, p.hp + 60);
      sound.playPickup('health');
      this.addFloatingText(p.x, p.z, -50, 'FULL HEAL! +60HP', '#22c55e', 18);
    } else if (target.itemType === 'cheeseburger') {
      p.hp = Math.min(p.maxHp, p.hp + 30);
      sound.playPickup('health');
      this.addFloatingText(p.x, p.z, -50, '+30HP', '#22c55e', 18);
    } else if (target.itemType === 'gold_bar' || target.itemType === 'diamond') {
      this.stats.score += target.value;
      sound.playPickup('treasure');
      this.addFloatingText(p.x, p.z, -50, `+${target.value} PTS`, '#facc15', 20);
    } else if (target.itemType === 'shotgun' || target.itemType === 'uzi' || target.itemType === 'pipe') {
      p.weapon = target.itemType === 'pipe' ? 'iron_pipe' : target.itemType;
      p.ammo = target.ammo || 10;
      sound.playPickup('weapon');
      this.addFloatingText(p.x, p.z, -50, `GOT ${p.weapon.toUpperCase()}!`, '#38bdf8', 18);
    }

    this.items = this.items.filter(i => i.id !== target.id);
    return true;
  }

  private updateItemsAndDestructibles(dt: number) {
    this.items.forEach(item => {
      if (item.y > 0 || item.vy !== 0) {
        item.y += item.vy;
        item.vy -= GRAVITY;
        if (item.y <= 0) {
          item.y = 0;
          if (item.isBouncing) {
            item.vy = 3;
            item.isBouncing = false;
          } else {
            item.vy = 0;
          }
        }
      }
    });
  }

  /**
   * The Iconic Cadillac Super Strike!
   */
  public callCadillacStrike() {
    this.stats.cadillacSummonsAvailable--;
    this.cadillac.active = true;
    this.cadillac.x = this.cameraX - 250;
    this.cadillac.z = this.player.z;
    this.cadillac.speed = 18;
    this.cadillac.nitroActive = true;
    this.cadillac.hitEnemies.clear();
    this.cadillac.hornTimer = 0.5;

    sound.playCadillacEngine();
    sound.playCadillacHorn();
    this.cameraShake = 12;
    this.addFloatingText(this.player.x, this.player.z, -110, 'CADILLAC NITRO RAM!', '#ef4444', 28);
  }

  private updateCadillac(dt: number) {
    const c = this.cadillac;
    if (!c.active) return;

    c.x += c.speed;
    this.spawnDust(c.x - 90, c.z, 3);

    // Horn timer
    if (c.hornTimer > 0) {
      c.hornTimer -= dt;
    }

    // Ram collision against all enemies in path!
    this.enemies.forEach(e => {
      if (e.hp <= 0 || c.hitEnemies.has(e.id)) return;
      const dist = Math.hypot(e.x - c.x, e.z - c.z);
      if (dist < 95) {
        c.hitEnemies.add(e.id);
        this.applyDamageToEnemy(e, 110, 24, 'cadillac');
        sound.playExplosion();
        this.cameraShake = 10;
        this.spawnExplosionParticles(e.x, e.z);
      }
    });

    // Remove when off-screen
    if (c.x > this.cameraX + this.canvasWidth + 300) {
      c.active = false;
    }
  }

  /**
   * Enemy AI Behavior & Attacks
   */
  private updateEnemies(dt: number) {
    const p = this.player;

    this.enemies.forEach(e => {
      e.stateTimer += dt;
      e.animFrame++;

      // Dead or dying
      if (e.state === 'dead' || (e.hp <= 0 && e.state === 'knockdown' && e.y <= 0)) {
        return;
      }

      // Knockdown physics
      if (e.state === 'knockdown') {
        e.x += e.vx;
        e.y += e.vy;
        e.vy -= GRAVITY;
        if (e.y <= 0) {
          e.y = 0;
          e.vy = 0;
          e.vx = 0;
          if (e.hp > 0 && e.stateTimer > 0.8) {
            e.state = 'getup';
            e.stateTimer = 0;
          }
        }
        return;
      }

      if (e.state === 'getup') {
        if (e.stateTimer > 0.4) {
          e.state = 'idle';
        }
        return;
      }

      if (e.state === 'hurt') {
        e.x += e.vx;
        if (e.stateTimer > 0.25) {
          e.state = 'idle';
        }
        return;
      }

      if (e.state === 'attack1') {
        if (e.stateTimer > 0.35) {
          e.state = 'idle';
        }
        return;
      }

      // AI Decision Cycle
      e.aiActionTimer -= dt;
      if (e.aiActionTimer <= 0) {
        e.aiActionTimer = 0.6 + Math.random() * 0.8;
        this.decideEnemyAction(e);
      }

      // Execute AI state
      this.executeEnemyMovement(e, dt);
    });

    // Filter out permanently dead enemies after timer
    this.enemies = this.enemies.filter(e => !(e.hp <= 0 && e.stateTimer > 3.0));
  }

  private decideEnemyAction(e: Entity) {
    const p = this.player;
    const dist = Math.hypot(p.x - e.x, p.z - e.z);

    // If close enough on Z and X plane, attack!
    if (Math.abs(p.z - e.z) < 20 && Math.abs(p.x - e.x) < 55) {
      e.state = 'attack1';
      e.stateTimer = 0;
      e.facing = e.x < p.x ? 1 : -1;

      // Attack execution
      if (e.enemyType === 'velociraptor') {
        sound.playDinoRoar();
      } else {
        sound.playSwing();
      }

      // Strike player if not invincible
      if (p.invincibleTimer <= 0 && p.state !== 'knockdown' && p.state !== 'special') {
        const dmg = e.enemyType?.startsWith('boss') ? 22 : 12;
        p.hp -= dmg;
        p.state = dmg > 15 ? 'knockdown' : 'hurt';
        p.stateTimer = 0;
        p.vx = e.facing * (dmg > 15 ? 8 : 4);
        p.vy = dmg > 15 ? 7 : 0;
        p.invincibleTimer = 0.8;
        sound.playPunch('heavy');
        this.cameraShake = 6;
        this.addFloatingText(p.x, p.z, -60, `-${dmg}`, '#ef4444', 18);
        this.resetCombo();

        if (p.hp <= 0) {
          this.handlePlayerLifeLost();
        }
      }
      return;
    }

    // Otherwise approach or circle
    e.aiState = Math.random() < 0.75 ? 'approach' : 'circle';
    e.targetX = p.x + (Math.random() < 0.5 ? 45 : -45);
    e.targetZ = p.z + (Math.random() - 0.5) * 30;
  }

  private executeEnemyMovement(e: Entity, dt: number) {
    if (e.state === 'attack1' || e.state === 'hurt' || e.state === 'knockdown') return;

    const tx = e.targetX || this.player.x;
    const tz = e.targetZ || this.player.z;
    const dx = tx - e.x;
    const dz = tz - e.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 15) {
      const speed = (e.enemyType === 'velociraptor' ? 4.2 : (e.enemyType?.startsWith('boss') ? 3.5 : 2.4));
      e.x += (dx / dist) * speed;
      e.z += (dz / dist) * speed * 0.7;
      e.facing = dx >= 0 ? 1 : -1;
      e.state = 'walk';
    } else {
      e.state = 'idle';
    }

    e.z = Math.max(WORLD_Z_MIN, Math.min(WORLD_Z_MAX, e.z));
  }

  private handlePlayerLifeLost() {
    this.stats.lives--;
    if (this.stats.lives > 0) {
      // Respawn
      const char = CHARACTERS[this.player.charId || 'jack'];
      this.player.hp = char.health;
      this.player.state = 'getup';
      this.player.stateTimer = 0;
      this.player.invincibleTimer = 3.0;
      this.addFloatingText(this.player.x, this.player.z, -80, `LIVES LEFT: ${this.stats.lives}`, '#facc15', 24);
    } else {
      // Game Over
      this.gameState = 'GAME_OVER';
      sound.stopMusic();
      if (this.onStateChange) this.onStateChange('GAME_OVER');
    }
  }

  /**
   * Camera Scrolling, Wave Locks & Checkpoints
   */
  private updateCameraAndCheckpoints(dt: number) {
    const stage = STAGES.find(s => s.id === this.currentStageId) || STAGES[0];
    const p = this.player;

    const currentCheckpoint = stage.waveCheckpoints[this.currentWaveIndex];

    // Check if enemies are remaining in current wave
    const aliveEnemies = this.enemies.filter(e => e.hp > 0);

    if (currentCheckpoint && p.x >= currentCheckpoint && !this.waveLocked && aliveEnemies.length > 0) {
      this.waveLocked = true;
      this.showGoIndicator = false;
    }

    if (this.waveLocked) {
      if (aliveEnemies.length === 0) {
        // Wave cleared!
        this.waveLocked = false;
        this.currentWaveIndex++;
        this.showGoIndicator = true;
        this.addFloatingText(this.cameraX + this.canvasWidth / 2, 100, -80, 'AREA CLEAR! GO ->', '#facc15', 28);
        sound.playPickup('treasure');

        // Check if level completely cleared (past final checkpoint)
        if (this.currentWaveIndex >= stage.waveCheckpoints.length) {
          this.handleStageClear();
          return;
        }

        // Spawn next wave
        this.spawnWaveEnemies(this.currentWaveIndex);
      }
    }

    // Camera follow player horizontally
    if (!this.waveLocked) {
      const targetCamX = p.x - this.canvasWidth * 0.35;
      this.cameraX = Math.max(this.cameraX, Math.min(stage.length - this.canvasWidth, targetCamX));
    }

    // Go indicator animation
    if (this.showGoIndicator) {
      this.goIndicatorBlink += dt * 4;
      if (p.x > this.cameraX + 250) {
        this.showGoIndicator = false;
      }
    }
  }

  private handleStageClear() {
    this.gameState = 'STAGE_CLEAR';
    sound.stopMusic();
    sound.playStageClear();

    // Bonus score calculation
    this.stats.score += 10000;
    this.stats.highScore = Math.max(this.stats.highScore, this.stats.score);

    if (this.onStateChange) this.onStateChange('STAGE_CLEAR');
  }

  public nextStageOrVictory() {
    if (this.currentStageId < 4) {
      this.startStage(this.currentStageId + 1);
    } else {
      this.gameState = 'VICTORY';
      sound.stopMusic();
      if (this.onStateChange) this.onStateChange('VICTORY');
    }
  }

  public insertCreditAndContinue() {
    sound.playCoin();
    this.stats.credits = Math.max(0, this.stats.credits - 1);
    this.stats.lives = 3;
    const char = CHARACTERS[this.player.charId || 'jack'];
    this.player.hp = char.health;
    this.player.state = 'idle';
    this.player.invincibleTimer = 3.0;
    this.gameState = 'PLAYING';
    sound.startStageMusic(this.currentStageId);
    if (this.onStateChange) this.onStateChange('PLAYING');
  }

  /**
   * Combo Counter Logic
   */
  private incrementCombo() {
    this.stats.comboCount++;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.comboCount);
  }

  private resetCombo() {
    this.stats.comboCount = 0;
  }

  /**
   * Visual Effects & Floating Texts
   */
  private addFloatingText(x: number, z: number, y: number, text: string, color: string, fontSize: number = 18) {
    this.floatingTexts.push({
      id: `text_${Date.now()}_${Math.random()}`,
      x,
      y,
      z,
      text,
      color,
      fontSize,
      life: 0.9,
      maxLife: 0.9,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -2.2
    });
  }

  private spawnDust(x: number, z: number, count: number = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: 2,
        z: z + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: 1 + Math.random() * 2,
        vz: 0,
        color: '#94a3b8',
        size: 3 + Math.random() * 4,
        alpha: 0.6,
        life: 0.4,
        maxLife: 0.4,
        shape: 'dust'
      });
    }
  }

  private spawnHitSparks(x: number, z: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y: y + (Math.random() - 0.5) * 20,
        z,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        vz: 0,
        color: Math.random() < 0.5 ? '#facc15' : '#ef4444',
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        shape: 'spark'
      });
    }
  }

  private spawnMuzzleFlash(x: number, z: number, y: number) {
    this.particles.push({
      x,
      y,
      z,
      vx: 0,
      vy: 0,
      vz: 0,
      color: '#fef08a',
      size: 18,
      alpha: 1,
      life: 0.08,
      maxLife: 0.08,
      shape: 'spark'
    });
  }

  private spawnExplosionParticles(x: number, z: number) {
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 25,
        y: -20 + (Math.random() - 0.5) * 25,
        z: z + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 12,
        vy: -4 - Math.random() * 10,
        vz: 0,
        color: Math.random() < 0.4 ? '#f97316' : (Math.random() < 0.7 ? '#ef4444' : '#1e293b'),
        size: 6 + Math.random() * 10,
        alpha: 1,
        life: 0.5,
        maxLife: 0.5,
        shape: 'debris'
      });
    }
  }

  private updateEffects(dt: number) {
    // Particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    });
    this.particles = this.particles.filter(p => p.life > 0);

    // Floating text
    this.floatingTexts.forEach(t => {
      t.x += t.vx;
      t.y += t.vy;
      t.life -= dt;
    });
    this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
  }

  /**
   * Main Render Dispatcher
   */
  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;

    ctx.save();

    // Apply Camera Shake
    if (this.cameraShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShake;
      const shakeY = (Math.random() - 0.5) * this.cameraShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw HD Multi-layer Parallax Environment
    environmentRenderer.drawEnvironment(ctx, this.currentStageId, this.cameraX, width, height);

    // Camera transform for 2.5D World
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // 2. Depth Sorting: All entities, destructibles, items and Cadillac must be sorted by Z-plane!
    interface RenderItem {
      z: number;
      draw: () => void;
    }

    const renderList: RenderItem[] = [];

    // Player Shadow & Sprite
    renderList.push({
      z: this.player.z,
      draw: () => {
        spriteRenderer.drawShadow(ctx, this.player.x, this.player.z, this.player.y, 32, 14);
        spriteRenderer.drawPlayer(ctx, this.player);
      }
    });

    // Cadillac
    if (this.cadillac.active) {
      renderList.push({
        z: this.cadillac.z,
        draw: () => {
          spriteRenderer.drawCadillac(ctx, this.cadillac);
        }
      });
    }

    // Enemies
    this.enemies.forEach(e => {
      renderList.push({
        z: e.z,
        draw: () => {
          spriteRenderer.drawShadow(ctx, e.x, e.z, e.y, e.enemyType?.startsWith('boss') ? 48 : 30, 14);
          spriteRenderer.drawEnemy(ctx, e);
        }
      });
    });

    // Destructibles
    this.destructibles.forEach(d => {
      renderList.push({
        z: d.z,
        draw: () => spriteRenderer.drawDestructible(ctx, d)
      });
    });

    // Items
    this.items.forEach(item => {
      renderList.push({
        z: item.z,
        draw: () => spriteRenderer.drawItem(ctx, item)
      });
    });

    // Sort by Z ascending (things further back drawn first)
    renderList.sort((a, b) => a.z - b.z);
    renderList.forEach(item => item.draw());

    // 3. Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.z - p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Floating texts (Popups)
    this.floatingTexts.forEach(t => {
      ctx.save();
      ctx.font = `900 ${t.fontSize}px 'Outfit', sans-serif`;
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(t.text, t.x, t.z + t.y);
      ctx.fillText(t.text, t.x, t.z + t.y);
      ctx.restore();
    });

    ctx.restore(); // Restore camera transform

    // 5. Flashing "GO ->" Indicator when sector cleared
    if (this.showGoIndicator && Math.floor(this.goIndicatorBlink) % 2 === 0) {
      ctx.save();
      ctx.font = "900 36px 'Chakra Petch', 'Outfit', sans-serif";
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      const text = 'GO  ▶▶▶';
      ctx.strokeText(text, width - 220, 140);
      ctx.fillText(text, width - 220, 140);
      ctx.restore();
    }

    ctx.restore(); // Restore camera shake
  }
}

export const gameEngine = new GameEngine();
