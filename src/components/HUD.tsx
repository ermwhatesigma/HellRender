import React, { useCallback } from 'react';
import { PlayerStats, WeaponType } from '../types/game';
import { DoomFace } from './DoomFace';
import { WEAPON_REGISTRY, loadCustomWeapons } from '../core/WeaponSystem';
import { ActiveEnemy } from '../core/EnemyController';
import { Pause, Map, Volume2, VolumeX, Shield, Heart, Zap, Crosshair as CrosshairIcon } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  currentWeapon: WeaponType;
  damageFlashAmount: number;
  pickupFlashAmount: number;
  hitmarkerActive: boolean;
  enemies: ActiveEnemy[];
  onSelectWeapon: (w: WeaponType) => void;
  onOpenMap: () => void;
  onOpenPause: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

const WEAPON_TIERS: Record<number, string[]> = {
  1: ['fist'],
  2: ['pistol'],
  3: ['shotgun'],
  4: ['supershotgun', 'quadshotgun'],
  5: ['chaingun'],
  6: ['rocketlauncher', 'flamethrower'],
  7: ['plasmarifle', 'railgun'],
  8: ['bfg9000', 'unmaker'],
};

export const HUD: React.FC<HUDProps> = ({
  stats,
  currentWeapon,
  damageFlashAmount,
  pickupFlashAmount,
  hitmarkerActive,
  enemies,
  onSelectWeapon,
  onOpenMap,
  onOpenPause,
  onToggleMute,
  isMuted,
}) => {
  loadCustomWeapons();
  const currentWeaponDef = WEAPON_REGISTRY[currentWeapon] || WEAPON_REGISTRY['pistol'];
  const activeBoss = enemies.find(e => (e.type === 'cyberdemon' || e.type === 'baron') && e.hp > 0);

  const currentAmmoCount = currentWeaponDef?.ammoType === 'none' 
    ? '∞' 
    : stats.ammo[currentWeaponDef?.ammoType || 'bullets'];

  const handleSlotClick = useCallback((slot: number, e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (slot === 9) {
      const customUnlocked = stats.unlockedWeapons.filter(w => WEAPON_REGISTRY[w]?.isCustom);
      if (customUnlocked.length === 0) return;
      const curIdx = customUnlocked.indexOf(currentWeapon);
      const nextIdx = (curIdx + 1) % customUnlocked.length;
      onSelectWeapon(customUnlocked[nextIdx]);
      return;
    }

    const tierGuns = WEAPON_TIERS[slot] || [];
    const unlockedInTier = tierGuns.filter(w => stats.unlockedWeapons.includes(w));
    if (unlockedInTier.length === 0) return;

    const curIdx = unlockedInTier.indexOf(currentWeapon);
    if (curIdx >= 0) {
      const nextIdx = (curIdx + 1) % unlockedInTier.length;
      onSelectWeapon(unlockedInTier[nextIdx]);
    } else {
      onSelectWeapon(unlockedInTier[0]);
    }
  }, [currentWeapon, stats.unlockedWeapons, onSelectWeapon]);

  const handleButtonClick = (action: () => void, e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const customUnlockedCount = stats.unlockedWeapons.filter(w => WEAPON_REGISTRY[w]?.isCustom).length;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none overflow-hidden z-20 font-mono">
      {/* 1. Screen Vignette / Flash overlays */}
      {damageFlashAmount > 0.05 && (
        <div
          className="absolute inset-0 bg-red-600/40 pointer-events-none transition-opacity duration-75"
          style={{ opacity: damageFlashAmount }}
        />
      )}
      {pickupFlashAmount > 0.05 && (
        <div
          className="absolute inset-0 bg-yellow-400/20 pointer-events-none transition-opacity duration-75"
          style={{ opacity: pickupFlashAmount }}
        />
      )}

      {/* Critical Low Health Pulsing Vignette */}
      {stats.hp <= 25 && stats.hp > 0 && (
        <div className="absolute inset-0 border-4 sm:border-8 border-red-600/60 pointer-events-none animate-pulse" />
      )}

      {/* 2. Top Header Bar */}
      <div className="w-full px-2 sm:px-4 py-0.5 sm:py-2 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onPointerDown={e => handleButtonClick(onOpenPause, e)}
            className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 border border-neutral-700 rounded-lg text-neutral-200 text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-md transition"
            title="Pause Menu (ESC)"
          >
            <Pause size={12} /> <span className="hidden sm:inline">PAUSE</span>
          </button>
          <button
            onPointerDown={e => handleButtonClick(onOpenMap, e)}
            className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 border border-neutral-700 rounded-lg text-neutral-200 text-[10px] sm:text-xs font-bold flex items-center gap-1 shadow-md transition"
            title="Automap (TAB)"
          >
            <Map size={12} /> <span className="hidden sm:inline">MAP</span>
          </button>
          <button
            onPointerDown={e => handleButtonClick(onToggleMute, e)}
            className="p-1 sm:p-1.5 bg-neutral-900/90 hover:bg-neutral-800 active:scale-95 border border-neutral-700 rounded-lg text-neutral-200 text-[10px] sm:text-xs font-bold flex items-center shadow-md transition"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} className="text-green-400" />}
          </button>
        </div>

        {/* Boss HP Bar */}
        {activeBoss && (
          <div className="flex-1 max-w-xs sm:max-w-md mx-2 flex flex-col items-center">
            <div className="text-[8px] sm:text-xs font-black text-red-500 uppercase tracking-widest mb-0.5 flex items-center gap-1 animate-pulse truncate">
              <Zap size={10} /> {activeBoss.def.name}
            </div>
            <div className="w-full h-1.5 sm:h-3 bg-neutral-950 border border-red-700 rounded-full overflow-hidden shadow-lg">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 transition-all duration-200"
                style={{ width: `${Math.max(0, (activeBoss.hp / activeBoss.def.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Top Right Counters */}
        <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-xs font-bold text-neutral-300">
          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-neutral-950/90 border border-neutral-800 rounded shadow-sm">
            KILLS: <span className="text-red-400 font-black">{stats.kills}</span>
          </div>
          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-neutral-950/90 border border-neutral-800 rounded shadow-sm">
            PTS: <span className="text-yellow-400 font-black">{stats.score}</span>
          </div>
        </div>
      </div>

      {/* 3. Center Crosshair & Hitmarker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {hitmarkerActive ? (
          <div className="relative flex items-center justify-center animate-ping">
            <span className="text-red-500 font-black text-xl sm:text-2xl leading-none drop-shadow-[0_0_8px_rgba(239,68,68,1)]">
              ✕
            </span>
          </div>
        ) : (
          <CrosshairIcon size={18} className="text-red-500/80 drop-shadow-md" />
        )}
      </div>

      {/* 4. Classic DOOM Bottom Status Bar (Compact in landscape via .hud-bottom-bar) */}
      <div className="hud-bottom-bar w-full bg-neutral-900/95 border-t-2 sm:border-t-3 border-neutral-700 shadow-2xl p-1 sm:p-2 pointer-events-auto z-20 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 sm:gap-3">
          {/* Main Ammo Display */}
          <div className="hud-metric-box flex flex-col items-center bg-neutral-950 px-1.5 sm:px-3 py-0.5 sm:py-1 border border-neutral-800 rounded min-w-[46px] sm:min-w-[70px]">
            <span className="hud-metric-label text-[7px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider">AMMO</span>
            <span className="hud-metric-value text-sm sm:text-2xl font-black text-yellow-400 leading-tight">
              {currentAmmoCount}
            </span>
          </div>

          {/* Health Display */}
          <div className="hud-metric-box flex flex-col items-center bg-neutral-950 px-1.5 sm:px-3 py-0.5 sm:py-1 border border-neutral-800 rounded min-w-[50px] sm:min-w-[80px]">
            <span className="hud-metric-label text-[7px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-0.5 sm:gap-1">
              <Heart size={8} className="text-red-500" /> HEALTH
            </span>
            <span className={`hud-metric-value text-sm sm:text-2xl font-black leading-tight ${stats.hp <= 25 ? 'text-red-500 animate-pulse' : stats.hp <= 50 ? 'text-orange-400' : 'text-red-400'}`}>
              {stats.hp}%
            </span>
          </div>

          {/* Full 9-Tier Arms Slot Selector */}
          <div className="hud-arms-container flex flex-col items-center bg-neutral-950 px-1 py-0.5 border border-neutral-800 rounded">
            <span className="hud-metric-label text-[7px] sm:text-[8px] font-bold text-neutral-400 uppercase">ARMS</span>
            <div className="hud-arms-grid grid grid-cols-5 sm:grid-cols-9 gap-0.5 sm:gap-1 text-xs font-bold mt-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(slot => {
                const tierGuns = slot === 9 
                  ? stats.unlockedWeapons.filter(w => WEAPON_REGISTRY[w]?.isCustom)
                  : (WEAPON_TIERS[slot] || []);
                const unlockedInTier = slot === 9 
                  ? tierGuns
                  : tierGuns.filter(w => stats.unlockedWeapons.includes(w));
                const isUnlocked = unlockedInTier.length > 0;
                const isCurrentActive = unlockedInTier.includes(currentWeapon);

                return (
                  <button
                    key={slot}
                    onPointerDown={e => handleSlotClick(slot, e)}
                    disabled={!isUnlocked}
                    className={`hud-arms-btn w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center rounded text-[8px] sm:text-[11px] font-bold transition active:scale-90 relative ${
                      isCurrentActive
                        ? 'bg-yellow-500 text-neutral-950 font-black shadow'
                        : isUnlocked
                        ? 'bg-neutral-800 text-yellow-400 hover:bg-neutral-700'
                        : 'bg-neutral-900 text-neutral-700 cursor-not-allowed opacity-40'
                    }`}
                    title={slot === 9 ? `Custom Weapons (${customUnlockedCount})` : `Tier ${slot} Weapons`}
                  >
                    {slot === 9 ? '★' : slot}
                    {unlockedInTier.length > 1 && (
                      <span className="absolute -top-0.5 -right-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-sky-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Doom Guy Face */}
          <DoomFace
            hp={stats.hp}
            maxHp={stats.maxHp}
            isGodMode={stats.isGodMode}
            damageFlash={damageFlashAmount > 0.1}
            pickupFlash={pickupFlashAmount > 0.1}
          />

          {/* Armor Display */}
          <div className="hud-metric-box flex flex-col items-center bg-neutral-950 px-1.5 sm:px-3 py-0.5 sm:py-1 border border-neutral-800 rounded min-w-[50px] sm:min-w-[80px]">
            <span className="hud-metric-label text-[7px] sm:text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-0.5 sm:gap-1">
              <Shield size={8} className="text-blue-500" /> ARMOR
            </span>
            <span className="hud-metric-value text-sm sm:text-2xl font-black text-sky-400 leading-tight">
              {stats.armor}%
            </span>
          </div>

          {/* Keycards Indicator */}
          <div className="hud-keys-box flex flex-col items-center bg-neutral-950 px-1 sm:px-2 py-0.5 sm:py-1 border border-neutral-800 rounded min-w-[36px] sm:min-w-[56px]">
            <span className="hud-metric-label text-[7px] sm:text-[8px] font-bold text-neutral-400 uppercase">KEYS</span>
            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
              <div
                className={`hud-keycard-dot w-2 sm:w-2.5 h-2.5 sm:h-3.5 rounded-xs border ${
                  stats.keys.blue ? 'bg-blue-500 border-blue-300 shadow-sm shadow-blue-500' : 'bg-neutral-900 border-neutral-800'
                }`}
                title="Blue Keycard"
              />
              <div
                className={`hud-keycard-dot w-2 sm:w-2.5 h-2.5 sm:h-3.5 rounded-xs border ${
                  stats.keys.yellow ? 'bg-yellow-500 border-yellow-300 shadow-sm shadow-yellow-500' : 'bg-neutral-900 border-neutral-800'
                }`}
                title="Yellow Keycard"
              />
              <div
                className={`hud-keycard-dot w-2 sm:w-2.5 h-2.5 sm:h-3.5 rounded-xs border ${
                  stats.keys.red ? 'bg-red-500 border-red-300 shadow-sm shadow-red-500' : 'bg-neutral-900 border-neutral-800'
                }`}
                title="Red Keycard"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
