/**
 * Cadillacs & Dinosaurs: Apex Arcade - Game Constants & Data Registry
 */
import { CharacterDef, CharacterId, StageDef, WeaponDef, WeaponType } from './types';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  jack: {
    id: 'jack',
    name: 'Jack Vance',
    moniker: 'The Outlaw Mechanic',
    archetype: 'Balanced All-Rounder',
    bio: 'A hot-tempered gearhead and Cadillac restorer who refuses to let poachers exterminate the reclaimed dinosaurs of the 26th century.',
    quote: "Nobody touches my 53 Caddy, and nobody touches these dinosaurs!",
    speed: 7,
    power: 7,
    reach: 7,
    health: 120,
    specialCost: 8,
    specialName: 'Jack-Knife Cyclone',
    specialDescription: 'A 360-degree spinning aerial sweep kick with invincibility that blows away all encroaching thugs and beasts.',
    primaryColor: '#2563eb', // blue shirt
    secondaryColor: '#ffffff', // white trousers
    accentColor: '#dc2626'   // red bandana
  },
  maya: {
    id: 'maya',
    name: 'Dr. Maya Delgado',
    moniker: 'The Dino-Biologist',
    archetype: 'High Agility & Speed',
    bio: 'Brilliant field researcher equipped with tactical agility and bio-chemical daggers, fighting to preserve the prehistoric ecosystem.',
    quote: "These creatures are a scientific miracle—and I will protect them with my life.",
    speed: 10,
    power: 6,
    reach: 6,
    health: 100,
    specialCost: 7,
    specialName: 'Acrobatic Moon-Sault',
    specialDescription: 'A lightning-fast vertical backflip axe-kick sending shockwaves outward in both directions.',
    primaryColor: '#10b981', // emerald field vest
    secondaryColor: '#1e293b', // tactical slate pants
    accentColor: '#f59e0b'   // amber scarf
  },
  mustapha: {
    id: 'mustapha',
    name: 'Mustapha Cairo',
    moniker: 'The Flying Cyclone',
    archetype: 'Kick Master & Speed',
    bio: 'Fan-favorite acrobatic engineer known for lethal leaping dropkicks and lightning sprint strikes across the battlefield.',
    quote: "Too slow, man! You can't hit what you can't catch!",
    speed: 9,
    power: 7,
    reach: 8,
    health: 110,
    specialCost: 8,
    specialName: 'Tornado Sweep',
    specialDescription: 'A devastating multi-hit spinning hurricane sweep that knocks enemies airborne and opens juggle opportunities.',
    primaryColor: '#facc15', // iconic bright yellow shirt
    secondaryColor: '#1e293b', // dark tactical pants
    accentColor: '#16a34a'   // green baseball cap
  },
  mess: {
    id: 'mess',
    name: 'Mess "Grizzly" Briggs',
    moniker: 'The Heavy Grappler',
    archetype: 'Maximum Power Tank',
    bio: 'Colossal mountain of muscle who can lift full-grown Velociraptors over his head and suplex poachers into concrete.',
    quote: "You want a piece of me? Line up, I'll flatten all of you at once!",
    speed: 5,
    power: 10,
    reach: 8,
    health: 150,
    specialCost: 10,
    specialName: 'Megaton Seismic Breaker',
    specialDescription: 'Slams both fists into the ground with volcanic force, launching an earthquake shockwave.',
    primaryColor: '#ea580c', // orange sleeveless vest
    secondaryColor: '#374151', // heavy denim
    accentColor: '#78716c'   // metal studded gauntlets
  },
  valerie: {
    id: 'valerie',
    name: 'Sgt. Valerie Cross',
    moniker: 'The Ex-Mercenary',
    archetype: 'Tactical Weapon Specialist',
    bio: 'NEW CHARACTER: Rogue spec-ops commando equipped with dual trench blades, tactical slide tackles, and lethal firearm expertise.',
    quote: "Mission parameters: neutralize the syndicate, secure the apex predators.",
    speed: 8,
    power: 8,
    reach: 9,
    health: 115,
    specialCost: 8,
    specialName: 'Dual Viper Vortex',
    specialDescription: 'Slashes with dual military combat blades in a blinding dual vortex that shreds shields and knockbacks bosses.',
    primaryColor: '#9333ea', // cyber purple jacket
    secondaryColor: '#0f172a', // stealth black
    accentColor: '#06b6d4'   // cyan optics
  }
};

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  fists: {
    type: 'fists',
    name: 'Bare Knuckles',
    isFirearm: false,
    maxAmmo: Infinity,
    damage: 12,
    range: 48,
    knockback: 6
  },
  wrench: {
    type: 'wrench',
    name: 'Heavy Pipe Wrench',
    isFirearm: false,
    maxAmmo: 12,
    damage: 28,
    range: 65,
    knockback: 10
  },
  iron_pipe: {
    type: 'iron_pipe',
    name: 'Steel Conduit Pipe',
    isFirearm: false,
    maxAmmo: 15,
    damage: 26,
    range: 75,
    knockback: 12
  },
  hunting_knife: {
    type: 'hunting_knife',
    name: 'Bowie Combat Knife',
    isFirearm: false,
    maxAmmo: 10,
    damage: 24,
    range: 45,
    knockback: 5
  },
  shotgun: {
    type: 'shotgun',
    name: '12-Gauge Riot Shotgun',
    isFirearm: true,
    maxAmmo: 6,
    damage: 55,
    range: 340,
    knockback: 18
  },
  uzi: {
    type: 'uzi',
    name: 'Rapid 9mm Submachine Gun',
    isFirearm: true,
    maxAmmo: 30,
    damage: 16,
    range: 300,
    knockback: 4
  },
  grenade: {
    type: 'grenade',
    name: 'M67 Frag Grenade',
    isFirearm: true,
    maxAmmo: 3,
    damage: 85,
    range: 220,
    knockback: 22
  }
};

export const STAGES: StageDef[] = [
  {
    id: 1,
    name: 'STAGE 1: THE SUNKEN COAST HIGHWAY',
    subTitle: 'Reclaimed Overpasses & The Smuggler Patrol',
    length: 3600,
    bossType: 'boss_vice',
    bossName: 'Vice "Ironclaw" Terhune',
    environmentType: 'coastal_highway',
    ambientColor: '#38bdf8',
    waveCheckpoints: [900, 1800, 2700, 3400]
  },
  {
    id: 2,
    name: 'STAGE 2: THE DEEP CRETACEOUS SWAMP',
    subTitle: 'Jurassic Canopy & Dinosaur Enclosures',
    length: 4000,
    bossType: 'boss_carnotaur_pack',
    bossName: 'Hogg the Beastmaster & Carnotaurus',
    environmentType: 'cretaceous_jungle',
    ambientColor: '#22c55e',
    waveCheckpoints: [1000, 2000, 3000, 3800]
  },
  {
    id: 3,
    name: 'STAGE 3: SUBTERRANEAN GENE LAB & BUNKER',
    subTitle: 'Mutant Incubation Vats & Automated Defense',
    length: 4200,
    bossType: 'boss_fessenden',
    bossName: 'Dr. Simon Fessenden (Cyborg)',
    environmentType: 'underground_lab',
    ambientColor: '#a855f7',
    waveCheckpoints: [1100, 2200, 3200, 4000]
  },
  {
    id: 4,
    name: 'STAGE 4: THE VOLCANIC CALDERA APEX',
    subTitle: 'Lava Fissures & The Ultimate Apex Titan',
    length: 4500,
    bossType: 'boss_apex_rex',
    bossName: 'APEX CYBER-REX (TITAN)',
    environmentType: 'volcanic_caldera',
    ambientColor: '#ef4444',
    waveCheckpoints: [1200, 2400, 3400, 4300]
  }
];

export const WORLD_Z_MIN = 30;
export const WORLD_Z_MAX = 200;
export const GRAVITY = 0.65;
