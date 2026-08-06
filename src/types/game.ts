export type BuiltinWeaponType = 
  | 'fist'
  | 'pistol'
  | 'shotgun'
  | 'supershotgun'
  | 'quadshotgun'
  | 'chaingun'
  | 'rocketlauncher'
  | 'plasmarifle'
  | 'railgun'
  | 'flamethrower'
  | 'unmaker'
  | 'bfg9000';

export type WeaponType = BuiltinWeaponType | string;

export interface WeaponDef {
  id: WeaponType;
  name: string;
  slot: number;
  damage: number;
  ammoType: 'none' | 'bullets' | 'shells' | 'rockets' | 'cells';
  ammoPerShot: number;
  clipSize: number;
  fireRate: number; // in ms between shots
  reloadTime: number; // in ms
  spread: number; // spread angle in radians
  pellets: number; // number of projectiles per shot
  projectileSpeed: number; // 0 for hitscan
  splashRadius: number; // 0 for non-explosive
  recoilAmount: number;
  range: number;
  unlocked: boolean;
  color: string;
  isCustom?: boolean;
  customPixelData?: string[][]; // 16x16 grid of hex colors
  projectileType?: 'hitscan' | 'bullet' | 'fireball' | 'rocket' | 'plasma' | 'bfg' | 'laser' | 'flame';
  soundType?: 'pistol' | 'shotgun' | 'chaingun' | 'rocket' | 'plasma' | 'bfg' | 'laser' | 'flame';
}

export type EnemyType = 
  | 'zombie'
  | 'imp'
  | 'demon'
  | 'lostsoul'
  | 'cacodemon'
  | 'baron'
  | 'cyberdemon';

export interface EnemyDef {
  type: EnemyType;
  name: string;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackRange: number;
  attackCooldown: number;
  isRanged: boolean;
  projectileType?: 'fireball' | 'bullet' | 'plasma' | 'rocket' | 'cacoball' | 'laser';
  scoreValue: number;
  radius: number;
  height: number;
  flying?: boolean;
  color: string;
}

export type PickupType = 
  | 'health_small'
  | 'health_medium'
  | 'health_mega'
  | 'armor_green'
  | 'armor_blue'
  | 'ammo_bullets'
  | 'ammo_shells'
  | 'ammo_rockets'
  | 'ammo_cells'
  | 'ammo_backpack'
  | 'weapon_shotgun'
  | 'weapon_supershotgun'
  | 'weapon_quadshotgun'
  | 'weapon_chaingun'
  | 'weapon_rocketlauncher'
  | 'weapon_plasmarifle'
  | 'weapon_railgun'
  | 'weapon_flamethrower'
  | 'weapon_unmaker'
  | 'weapon_bfg9000'
  | 'key_blue'
  | 'key_yellow'
  | 'key_red'
  | 'powerup_berserk'
  | 'powerup_invulnerability'
  | 'powerup_quad';

export interface PickupItem {
  id: string;
  type: PickupType;
  x: number;
  z: number;
  y?: number;
  active: boolean;
  respawnTime?: number;
  isStatic?: boolean;
}

export interface InteractiveDoor {
  id: string;
  x: number;
  z: number;
  state: 'closed' | 'opening' | 'open' | 'closing';
  progress: number; // 0 (closed) to 1 (open)
  requiredKey?: 'blue' | 'yellow' | 'red';
  isExitDoor?: boolean;
  orientation: 'horizontal' | 'vertical';
}

export interface ExplosiveBarrel {
  id: string;
  x: number;
  z: number;
  hp: number;
  exploded: boolean;
  fuseTimer?: number;
}

export interface SwitchTrigger {
  id: string;
  x: number;
  z: number;
  targetDoorId: string;
  activated: boolean;
}

export interface Teleporter {
  id: string;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
}

export interface SecretArea {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  found: boolean;
  message: string;
}

export interface LevelDefinition {
  id: string;
  title: string;
  subtitle: string;
  theme: 'tech' | 'toxic' | 'hell' | 'arena' | 'cryo';
  grid: number[][]; // 0: empty, 1: wall1, 2: wall2, 3: wall3, 4: door, 5: acid, 6: lava, 7: exit, 8: secret_wall
  width: number;
  height: number;
  playerStart: { x: number; z: number; angle: number };
  doors: InteractiveDoor[];
  barrels: ExplosiveBarrel[];
  switches: SwitchTrigger[];
  teleporters: Teleporter[];
  pickups: PickupItem[];
  enemies: {
    id: string;
    type: EnemyType;
    x: number;
    z: number;
  }[];
  secrets: SecretArea[];
  parTimeSeconds: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  armor: number;
  maxArmor: number;
  ammo: {
    bullets: number;
    shells: number;
    rockets: number;
    cells: number;
  };
  maxAmmo: {
    bullets: number;
    shells: number;
    rockets: number;
    cells: number;
  };
  clips: {
    [weaponId: string]: number;
  };
  keys: {
    blue: boolean;
    yellow: boolean;
    red: boolean;
  };
  score: number;
  kills: number;
  totalEnemies: number;
  secretsFound: number;
  totalSecrets: number;
  itemsFound: number;
  totalItems: number;
  timeElapsed: number;
  currentWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
  powerups: {
    berserkTimer: number;
    invulnerabilityTimer: number;
    quadDamageTimer: number;
  };
  // Cheats
  isGodMode?: boolean;
  isNoClip?: boolean;
  isInfiniteAmmo?: boolean;
  isSpeedBoost?: boolean;
  isQuadDamage?: boolean;
  isOneHitKill?: boolean;
}

export interface GameSettings {
  brightness: number; // 0.5 - 1.5
  mouseSensitivity: number; // 0.1 - 3.0
  touchSensitivity: number; // 0.1 - 3.0
  gyroEnabled: boolean;
  gyroSensitivity: number;
  invertY: boolean;
  soundVolume: number; // 0 - 1
  musicVolume: number; // 0 - 1
  fov: number; // 60 - 110
  resolutionScale: 'low' | 'medium' | 'high';
  crtFilter: boolean;
  screenShake: boolean;
  bloodGore: 'high' | 'low' | 'off';
  showMinimap: boolean;
  showFps: boolean;
  autoReload: boolean;
  mobileLayout: 'default' | 'compact' | 'lefthanded' | 'custom';
  showWeaponSwitcherMobile?: boolean;
  buttonPositions?: {
    [key: string]: { x: number; y: number; size?: number };
  };
}

export interface FloatingNotification {
  id: string;
  text: string;
  color?: string;
  icon?: string;
  duration?: number;
}

export interface HitEffect {
  x: number;
  y: number;
  damage: number;
  isCrit?: boolean;
}

export type GameState = 
  | 'menu'
  | 'playing'
  | 'paused'
  | 'level_clear'
  | 'game_over'
  | 'victory'
  | 'level_editor'
  | 'weapon_workshop';
