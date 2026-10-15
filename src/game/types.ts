/**
 * Cadillacs & Dinosaurs: Apex Arcade - Core Type Definitions
 */

export type GameState = 
  | 'TITLE'
  | 'CHAR_SELECT'
  | 'STAGE_INTRO'
  | 'PLAYING'
  | 'STAGE_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY';

export type CharacterId = 'jack' | 'maya' | 'mustapha' | 'mess' | 'valerie';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  moniker: string;
  archetype: string;
  bio: string;
  quote: string;
  speed: number;      // 1-10
  power: number;      // 1-10
  reach: number;      // 1-10
  health: number;     // base max HP (e.g. 100 - 140)
  specialCost: number;// HP penalty on connecting special (e.g. 8)
  specialName: string;
  specialDescription: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export type WeaponType = 
  | 'fists'
  | 'wrench'
  | 'iron_pipe'
  | 'hunting_knife'
  | 'shotgun'
  | 'uzi'
  | 'grenade';

export interface WeaponDef {
  type: WeaponType;
  name: string;
  isFirearm: boolean;
  maxAmmo: number;
  damage: number;
  range: number;
  knockback: number;
}

export type EnemyCategory = 
  | 'poacher_brawler'
  | 'poacher_knife'
  | 'poacher_shotgun'
  | 'poacher_bruiser'
  | 'velociraptor'
  | 'carnotaurus'
  | 'boss_vice'
  | 'boss_carnotaur_pack'
  | 'boss_fessenden'
  | 'boss_apex_rex';

export interface GroundShadow {
  x: number;
  z: number;
  radiusX: number;
  radiusZ: number;
  alpha: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  z: number;
  text: string;
  color: string;
  fontSize: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'spark' | 'smoke' | 'blood' | 'dust' | 'debris' | 'shell';
}

export interface ItemDrop {
  id: string;
  x: number;
  y: number;
  z: number;
  vy: number;
  itemType: 'roast_chicken' | 'cheeseburger' | 'medkit' | 'gold_bar' | 'diamond' | 'shotgun' | 'uzi' | 'grenade' | 'pipe';
  ammo?: number;
  value: number;
  isBouncing: boolean;
}

export interface DestructibleObject {
  id: string;
  x: number;
  z: number;
  type: 'oil_barrel' | 'wooden_crate' | 'dino_cage';
  hp: number;
  maxHp: number;
  contains: ItemDrop['itemType'];
  containsAmmo?: number;
}

export interface Entity {
  id: string;
  isPlayer: boolean;
  charId?: CharacterId;
  enemyType?: EnemyCategory;
  name: string;
  
  // 2.5D coordinates
  x: number;
  y: number; // height off ground (0 is standing, >0 is in air)
  z: number; // depth plane (0 to 220)
  
  vx: number;
  vy: number;
  vz: number;
  
  facing: 1 | -1; // 1 = right, -1 = left
  
  hp: number;
  maxHp: number;
  
  state: 
    | 'idle'
    | 'walk'
    | 'run'
    | 'jump'
    | 'attack1'
    | 'attack2'
    | 'attack3'
    | 'dash_attack'
    | 'jump_attack'
    | 'grab'
    | 'throw'
    | 'special'
    | 'hurt'
    | 'knockdown'
    | 'getup'
    | 'dead';
    
  stateTimer: number;
  animFrame: number;
  
  comboStep: number;
  comboResetTimer: number;
  
  weapon: WeaponType;
  ammo: number;
  
  invincibleTimer: number;
  grabbedTargetId?: string;
  grabbedById?: string;
  
  // AI specific
  aiActionTimer: number;
  aiState?: 'roam' | 'approach' | 'circle' | 'windup' | 'attack' | 'flee' | 'frenzy';
  targetX?: number;
  targetZ?: number;
  
  // Dinosaur specific state (peaceful vs enraged)
  dinoEnraged?: boolean;
}

export interface CadillacVehicle {
  active: boolean;
  mode: 'summon_strike' | 'drivable';
  x: number;
  z: number;
  speed: number;
  targetX: number;
  nitroActive: boolean;
  hitEnemies: Set<string>;
  hornTimer: number;
}

export interface StageDef {
  id: number;
  name: string;
  subTitle: string;
  length: number; // total world width, e.g. 4000px
  bossType: EnemyCategory;
  bossName: string;
  environmentType: 'coastal_highway' | 'cretaceous_jungle' | 'underground_lab' | 'volcanic_caldera';
  ambientColor: string;
  waveCheckpoints: number[]; // X thresholds where camera locks until all enemies are defeated
}

export interface PlayerStats {
  score: number;
  highScore: number;
  lives: number;
  credits: number;
  comboCount: number;
  maxCombo: number;
  enemiesDefeated: number;
  cadillacSummonsAvailable: number;
  specialGauge: number; // 0 to 100
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  jump: boolean;
  special: boolean;
  dash: boolean;
  callCadillac: boolean;
  
  // Edge-triggered just pressed flags
  attackJustPressed: boolean;
  jumpJustPressed: boolean;
  specialJustPressed: boolean;
  cadillacJustPressed: boolean;
  
  // Double-tap dash buffer
  lastTapDir: 'left' | 'right' | null;
  lastTapTime: number;
}
