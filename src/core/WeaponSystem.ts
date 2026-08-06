import { WeaponDef } from '../types/game';

export const BASE_WEAPON_REGISTRY: Record<string, WeaponDef> = {
  fist: {
    id: 'fist',
    name: 'Berserk Fists',
    slot: 1,
    damage: 45,
    ammoType: 'none',
    ammoPerShot: 0,
    clipSize: 0,
    fireRate: 320,
    reloadTime: 0,
    spread: 0.1,
    pellets: 1,
    projectileSpeed: 0,
    splashRadius: 0,
    recoilAmount: 0.04,
    range: 3.4,
    unlocked: true,
    color: '#ef4444',
  },
  pistol: {
    id: 'pistol',
    name: 'UAC Pistol',
    slot: 2,
    damage: 22,
    ammoType: 'bullets',
    ammoPerShot: 1,
    clipSize: 15,
    fireRate: 240,
    reloadTime: 1100,
    spread: 0.02,
    pellets: 1,
    projectileSpeed: 0,
    splashRadius: 0,
    recoilAmount: 0.05,
    range: 60,
    unlocked: true,
    color: '#94a3b8',
  },
  shotgun: {
    id: 'shotgun',
    name: 'Combat Shotgun',
    slot: 3,
    damage: 16, // 16 x 7 pellets = ~112 dmg
    ammoType: 'shells',
    ammoPerShot: 1,
    clipSize: 8,
    fireRate: 800,
    reloadTime: 1600,
    spread: 0.08,
    pellets: 7,
    projectileSpeed: 0,
    splashRadius: 0,
    recoilAmount: 0.14,
    range: 42,
    unlocked: true,
    color: '#ca8a04',
  },
  supershotgun: {
    id: 'supershotgun',
    name: 'Super Shotgun',
    slot: 4,
    damage: 18, // 18 x 14 pellets = ~252 dmg
    ammoType: 'shells',
    ammoPerShot: 2,
    clipSize: 2,
    fireRate: 1050,
    reloadTime: 1500,
    spread: 0.16,
    pellets: 14,
    projectileSpeed: 0,
    splashRadius: 0,
    recoilAmount: 0.22,
    range: 32,
    unlocked: false,
    color: '#ea580c',
  },
  quadshotgun: {
    id: 'quadshotgun',
    name: 'Quad-Barrel Shotgun',
    slot: 4,
    damage: 20, // 20 x 28 pellets = ~560 dmg!
    ammoType: 'shells',
    ammoPerShot: 4,
    clipSize: 4,
    fireRate: 1350,
    reloadTime: 2000,
    spread: 0.24,
    pellets: 28,
    projectileSpeed: 0,
    splashRadius: 0,
    recoilAmount: 0.35,
    range: 28,
    unlocked: false,
    color: '#b91c1c',
  },
  chaingun: {
    id: 'chaingun',
    name: 'Chaingun',
    slot: 5,
    damage: 18,
    ammoType: 'bullets',
    ammoPerShot: 1,
    clipSize: 50,
    fireRate: 100,
    reloadTime: 1800,
    spread: 0.05,
    pellets: 1,
    projectileSpeed: 0,
    splashRadius: 0,
    recoilAmount: 0.04,
    range: 58,
    unlocked: false,
    color: '#38bdf8',
  },
  rocketlauncher: {
    id: 'rocketlauncher',
    name: 'Rocket Launcher',
    slot: 6,
    damage: 150,
    ammoType: 'rockets',
    ammoPerShot: 1,
    clipSize: 6,
    fireRate: 700,
    reloadTime: 2000,
    spread: 0.01,
    pellets: 1,
    projectileSpeed: 26,
    splashRadius: 6.0,
    recoilAmount: 0.18,
    range: 100,
    unlocked: false,
    color: '#dc2626',
  },
  flamethrower: {
    id: 'flamethrower',
    name: 'Hellfire Flamethrower',
    slot: 6,
    damage: 28,
    ammoType: 'cells',
    ammoPerShot: 1,
    clipSize: 60,
    fireRate: 75,
    reloadTime: 1600,
    spread: 0.12,
    pellets: 2,
    projectileSpeed: 18,
    splashRadius: 1.5,
    recoilAmount: 0.02,
    range: 24,
    unlocked: false,
    color: '#f97316',
    projectileType: 'flame',
    soundType: 'flame',
  },
  plasmarifle: {
    id: 'plasmarifle',
    name: 'Plasma Rifle',
    slot: 7,
    damage: 32,
    ammoType: 'cells',
    ammoPerShot: 1,
    clipSize: 40,
    fireRate: 120,
    reloadTime: 1600,
    spread: 0.03,
    pellets: 1,
    projectileSpeed: 34,
    splashRadius: 1.4,
    recoilAmount: 0.03,
    range: 75,
    unlocked: false,
    color: '#06b6d4',
  },
  railgun: {
    id: 'railgun',
    name: 'Particle Railgun',
    slot: 7,
    damage: 280,
    ammoType: 'cells',
    ammoPerShot: 5,
    clipSize: 10,
    fireRate: 1200,
    reloadTime: 2200,
    spread: 0.001,
    pellets: 1,
    projectileSpeed: 0,
    splashRadius: 2.0,
    recoilAmount: 0.28,
    range: 120,
    unlocked: false,
    color: '#a855f7',
    soundType: 'laser',
  },
  unmaker: {
    id: 'unmaker',
    name: 'The Unmaker',
    slot: 8,
    damage: 85,
    ammoType: 'cells',
    ammoPerShot: 1,
    clipSize: 50,
    fireRate: 85,
    reloadTime: 1800,
    spread: 0.02,
    pellets: 3,
    projectileSpeed: 45,
    splashRadius: 1.8,
    recoilAmount: 0.08,
    range: 90,
    unlocked: false,
    color: '#ec4899',
    projectileType: 'laser',
    soundType: 'laser',
  },
  bfg9000: {
    id: 'bfg9000',
    name: 'BFG 9000',
    slot: 8,
    damage: 750,
    ammoType: 'cells',
    ammoPerShot: 40,
    clipSize: 40,
    fireRate: 1700,
    reloadTime: 2600,
    spread: 0.01,
    pellets: 1,
    projectileSpeed: 18,
    splashRadius: 14,
    recoilAmount: 0.32,
    range: 100,
    unlocked: false,
    color: '#22c55e',
  },
};

// Global Weapon Registry
export const WEAPON_REGISTRY: Record<string, WeaponDef> = { ...BASE_WEAPON_REGISTRY };

// Load custom weapons from localStorage and populate WEAPON_REGISTRY
export function loadCustomWeapons(): WeaponDef[] {
  try {
    const saved = localStorage.getItem('doom_custom_weapons');
    if (saved) {
      const parsed: WeaponDef[] = JSON.parse(saved);
      parsed.forEach(w => {
        WEAPON_REGISTRY[w.id] = w;
      });
      return parsed;
    }
  } catch (e) {
    console.error('Error loading custom weapons:', e);
  }
  return [];
}

// Save a new custom weapon
export function saveCustomWeapon(weapon: WeaponDef) {
  WEAPON_REGISTRY[weapon.id] = weapon;
  const current = loadCustomWeapons().filter(w => w.id !== weapon.id);
  current.push(weapon);
  localStorage.setItem('doom_custom_weapons', JSON.stringify(current));
}

// Get all available weapon IDs (built-in + custom)
export function getAllWeaponIds(): string[] {
  loadCustomWeapons();
  return Object.keys(WEAPON_REGISTRY);
}

// Initialize custom weapons on load
loadCustomWeapons();
