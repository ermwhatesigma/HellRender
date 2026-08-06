import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Engine3D } from '../core/Engine3D';
import { ALL_LEVELS } from '../core/LevelData';
import { GameSettings, LevelDefinition, PlayerStats, WeaponType, FloatingNotification, WeaponDef } from '../types/game';
import { HUD } from './HUD';
import { WeaponViewport } from './WeaponViewport';
import { MobileControls } from './MobileControls';
import { MiniMap } from './MiniMap';
import { SettingsModal } from './SettingsModal';
import { PauseModal } from './PauseModal';
import { VictoryDefeatModal } from './VictoryDefeatModal';
import { LevelSelectModal } from './LevelSelectModal';
import { LevelEditorModal } from './LevelEditorModal';
import { WeaponCreatorModal } from './WeaponCreatorModal';
import { NotificationToast } from './NotificationToast';
import { soundManager } from '../audio/SoundSystem';
import { WEAPON_REGISTRY, loadCustomWeapons } from '../core/WeaponSystem';

interface GameCanvasProps {
  initialLevelId?: string;
  initialWeaponId?: string;
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

export const GameCanvas: React.FC<GameCanvasProps> = ({
  initialLevelId = 'e1m1',
  initialWeaponId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine3D | null>(null);

  // Settings State with LocalStorage
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('doom_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return {
      brightness: 1.0,
      mouseSensitivity: 1.0,
      touchSensitivity: 1.2,
      gyroEnabled: false,
      gyroSensitivity: 1.0,
      invertY: false,
      soundVolume: 0.7,
      musicVolume: 0.5,
      fov: 75,
      resolutionScale: 'high',
      crtFilter: false,
      screenShake: true,
      bloodGore: 'high',
      showMinimap: false,
      showFps: false,
      autoReload: true,
      mobileLayout: 'default',
    };
  });

  // Current Level
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition>(() => ALL_LEVELS[initialLevelId] || ALL_LEVELS['e1m1']);

  // Load custom weapons from storage
  const customGuns = loadCustomWeapons();
  const customGunIds = customGuns.map(w => w.id);
  const startGun = initialWeaponId || (customGunIds.length > 0 ? customGunIds[customGunIds.length - 1] : 'pistol');

  // Player Stats
  const [stats, setStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    armor: 0,
    maxArmor: 200,
    ammo: {
      bullets: 50,
      shells: 15,
      rockets: 5,
      cells: 40,
    },
    maxAmmo: {
      bullets: 200,
      shells: 50,
      rockets: 50,
      cells: 300,
    },
    clips: {
      pistol: 15,
      shotgun: 8,
      supershotgun: 2,
      chaingun: 50,
      rocketlauncher: 6,
      plasmarifle: 40,
      bfg9000: 40,
    },
    keys: {
      blue: false,
      yellow: false,
      red: false,
    },
    score: 0,
    kills: 0,
    totalEnemies: 14,
    secretsFound: 0,
    totalSecrets: 1,
    itemsFound: 0,
    totalItems: 12,
    timeElapsed: 0,
    currentWeapon: startGun,
    unlockedWeapons: Array.from(new Set(['fist', 'pistol', 'shotgun', ...customGunIds, startGun])),
    powerups: {
      berserkTimer: 0,
      invulnerabilityTimer: 0,
      quadDamageTimer: 0,
    },
    isGodMode: false,
    isNoClip: false,
    isSpeedBoost: false,
    isOneHitKill: false,
    isInfiniteAmmo: false,
  });

  // Modals & UI states
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isLevelEditorOpen, setIsLevelEditorOpen] = useState<boolean>(false);
  const [isWeaponWorkshopOpen, setIsWeaponWorkshopOpen] = useState<boolean>(false);
  const [victoryDefeatMode, setVictoryDefeatMode] = useState<'victory' | 'defeat' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const [hitmarkerActive, setHitmarkerActive] = useState<boolean>(false);

  // Engine Animation state mirror
  const [lastFireTime, setLastFireTime] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [damageFlash, setDamageFlash] = useState<number>(0);
  const [pickupFlash, setPickupFlash] = useState<number>(0);
  const [bobbingOffset, setBobbingOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Notifications
  const addNotification = useCallback((text: string, icon?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, text, icon }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2400);
  }, []);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('doom_settings', JSON.stringify(updated));
      soundManager.setVolumes(updated.soundVolume, updated.musicVolume);
      if (engineRef.current) {
        engineRef.current.setSettings(updated);
      }
      return updated;
    });
  };

  const handleResetDefaults = () => {
    const defaults: GameSettings = {
      brightness: 1.0,
      mouseSensitivity: 1.0,
      touchSensitivity: 1.2,
      gyroEnabled: false,
      gyroSensitivity: 1.0,
      invertY: false,
      soundVolume: 0.7,
      musicVolume: 0.5,
      fov: 75,
      resolutionScale: 'high',
      crtFilter: false,
      screenShake: true,
      bloodGore: 'high',
      showMinimap: false,
      showFps: false,
      autoReload: true,
      mobileLayout: 'default',
    };
    handleUpdateSettings(defaults);
  };

  // Cheat Matrix Handler
  const handleApplyCheat = (cheat: 'god' | 'all_weapons' | 'noclip' | 'one_hit_kill' | 'speed' | 'all_keys' | 'full_heal' | 'nuke_monsters') => {
    soundManager.playSecretRevealed();
    if (cheat === 'god') {
      setStats(prev => {
        const next = !prev.isGodMode;
        addNotification(next ? 'IDDQD GOD MODE ACTIVE!' : 'GOD MODE DEACTIVATED', '🛡️');
        return { ...prev, isGodMode: next, hp: next ? 200 : prev.hp };
      });
    } else if (cheat === 'all_weapons') {
      loadCustomWeapons();
      const allGunIds = Object.keys(WEAPON_REGISTRY);
      setStats(prev => {
        addNotification('IDKFA ALL WEAPONS & AMMO UNLOCKED!', '🔫');
        return {
          ...prev,
          unlockedWeapons: Array.from(new Set([...prev.unlockedWeapons, ...allGunIds])),
          ammo: { bullets: 200, shells: 50, rockets: 50, cells: 300 },
        };
      });
    } else if (cheat === 'noclip') {
      setStats(prev => {
        const next = !prev.isNoClip;
        if (engineRef.current) {
          engineRef.current.isNoClip = next;
        }
        addNotification(next ? 'IDCLIP NO-CLIP / GHOST MODE ACTIVE!' : 'NO-CLIP DISABLED', '👻');
        return { ...prev, isNoClip: next };
      });
    } else if (cheat === 'one_hit_kill') {
      setStats(prev => {
        const next = !prev.isOneHitKill;
        addNotification(next ? 'ONE-HIT KILL / QUAD DAMAGE ACTIVE!' : 'NORMAL DAMAGE RESTORED', '💥');
        return { ...prev, isOneHitKill: next };
      });
    } else if (cheat === 'speed') {
      setStats(prev => {
        const next = !prev.isSpeedBoost;
        addNotification(next ? 'SPEED DEMON 2X SPRINT ACTIVE!' : 'NORMAL SPEED RESTORED', '⚡');
        return { ...prev, isSpeedBoost: next };
      });
    } else if (cheat === 'all_keys') {
      setStats(prev => {
        addNotification('IDKEYS BLUE, YELLOW & RED KEYS GRANTED!', '🔑');
        return { ...prev, keys: { blue: true, yellow: true, red: true } };
      });
    } else if (cheat === 'full_heal') {
      setStats(prev => {
        addNotification('IDCHOP FULL HEALTH & ARMOR RESTORED!', '❤️');
        return { ...prev, hp: 200, armor: 200 };
      });
    } else if (cheat === 'nuke_monsters') {
      if (engineRef.current) {
        engineRef.current.nukeAllEnemies();
        addNotification('IDNUKE ALL ACTIVE DEMONS ELIMINATED!', '💀');
      }
    }
  };

  // Switch Weapon
  const handleSelectWeapon = useCallback((weapon: WeaponType) => {
    loadCustomWeapons();
    if (stats.unlockedWeapons.includes(weapon) || WEAPON_REGISTRY[weapon]) {
      setStats(prev => ({
        ...prev,
        currentWeapon: weapon,
        unlockedWeapons: Array.from(new Set([...prev.unlockedWeapons, weapon])),
      }));
      soundManager.playShotgunPump();
    }
  }, [stats.unlockedWeapons]);

  // Restart Current Level
  const handleRestartLevel = useCallback(() => {
    setVictoryDefeatMode(null);
    setIsPaused(false);
    setIsMapOpen(false);
    const customIds = loadCustomWeapons().map(w => w.id);
    setStats({
      hp: 100,
      maxHp: 100,
      armor: 0,
      maxArmor: 200,
      ammo: { bullets: 50, shells: 15, rockets: 5, cells: 40 },
      maxAmmo: { bullets: 200, shells: 50, rockets: 50, cells: 300 },
      clips: { pistol: 15, shotgun: 8, supershotgun: 2, chaingun: 50, rocketlauncher: 6, plasmarifle: 40, bfg9000: 40 },
      keys: { blue: false, yellow: false, red: false },
      score: 0,
      kills: 0,
      totalEnemies: currentLevel.enemies.length,
      secretsFound: 0,
      totalSecrets: currentLevel.secrets.length || 1,
      itemsFound: 0,
      totalItems: currentLevel.pickups.length,
      timeElapsed: 0,
      currentWeapon: stats.currentWeapon,
      unlockedWeapons: Array.from(new Set(['fist', 'pistol', 'shotgun', ...customIds, stats.currentWeapon])),
      powerups: { berserkTimer: 0, invulnerabilityTimer: 0, quadDamageTimer: 0 },
      isGodMode: false,
      isNoClip: false,
      isSpeedBoost: false,
      isOneHitKill: false,
      isInfiniteAmmo: false,
    });

    if (engineRef.current) {
      engineRef.current.isNoClip = false;
      engineRef.current.setLevel(currentLevel);
    }
  }, [currentLevel, stats.currentWeapon]);

  // Load New Level
  const handleSelectLevel = (levelId: string) => {
    const lvl = ALL_LEVELS[levelId];
    if (!lvl) return;
    setCurrentLevel(lvl);
    setVictoryDefeatMode(null);
    setIsPaused(false);
    setIsMapOpen(false);
    const customIds = loadCustomWeapons().map(w => w.id);
    setStats(prev => ({
      ...prev,
      hp: 100,
      armor: 0,
      ammo: { bullets: 50, shells: 15, rockets: 5, cells: 40 },
      keys: { blue: false, yellow: false, red: false },
      score: 0,
      kills: 0,
      totalEnemies: lvl.enemies.length,
      secretsFound: 0,
      totalSecrets: lvl.secrets.length || 1,
      itemsFound: 0,
      totalItems: lvl.pickups.length,
      timeElapsed: 0,
      unlockedWeapons: Array.from(new Set([...prev.unlockedWeapons, ...customIds])),
    }));

    if (engineRef.current) {
      engineRef.current.setLevel(lvl);
    }
  };

  const handlePlayCustomLevel = (customLevel: LevelDefinition) => {
    setCurrentLevel(customLevel);
    setIsLevelEditorOpen(false);
    setVictoryDefeatMode(null);
    setIsPaused(false);
    setIsMapOpen(false);
    const customIds = loadCustomWeapons().map(w => w.id);
    setStats(prev => ({
      ...prev,
      hp: 100,
      armor: 0,
      ammo: { bullets: 50, shells: 15, rockets: 5, cells: 40 },
      keys: { blue: false, yellow: false, red: false },
      score: 0,
      kills: 0,
      totalEnemies: customLevel.enemies.length,
      secretsFound: 0,
      totalSecrets: 1,
      itemsFound: 0,
      totalItems: customLevel.pickups.length,
      timeElapsed: 0,
      unlockedWeapons: Array.from(new Set(['fist', 'pistol', 'shotgun', 'chaingun', 'rocketlauncher', ...customIds])),
    }));

    if (engineRef.current) {
      engineRef.current.setLevel(customLevel);
    }
  };

  // Equip Custom Weapon from Forge
  const handleEquipCustomWeapon = (weapon: WeaponDef) => {
    soundManager.playWeaponPickup();
    addNotification(`CUSTOM GUN "${weapon.name.toUpperCase()}" EQUIPPED!`, '✨');
    setStats(prev => ({
      ...prev,
      unlockedWeapons: Array.from(new Set([...prev.unlockedWeapons, weapon.id])),
      currentWeapon: weapon.id,
      ammo: {
        ...prev.ammo,
        cells: Math.max(prev.ammo.cells, 50),
        bullets: Math.max(prev.ammo.bullets, 50),
      },
    }));
  };

  // Next Level Progression
  const handleNextLevel = () => {
    if (currentLevel.id === 'e1m1') handleSelectLevel('e1m2');
    else if (currentLevel.id === 'e1m2') handleSelectLevel('e1m3');
    else if (currentLevel.id === 'e1m3') handleSelectLevel('e1m4');
    else if (currentLevel.id === 'e1m4') handleSelectLevel('e1m5');
    else if (currentLevel.id === 'e1m5') handleSelectLevel('e1m6');
    else handleSelectLevel('arena');
  };

  const handleNextWeapon = useCallback(() => {
    const currentIndex = stats.unlockedWeapons.indexOf(stats.currentWeapon);
    const nextIndex = (currentIndex + 1) % stats.unlockedWeapons.length;
    handleSelectWeapon(stats.unlockedWeapons[nextIndex]);
  }, [stats.unlockedWeapons, stats.currentWeapon, handleSelectWeapon]);

  const handlePrevWeapon = useCallback(() => {
    const currentIndex = stats.unlockedWeapons.indexOf(stats.currentWeapon);
    const prevIndex = (currentIndex - 1 + stats.unlockedWeapons.length) % stats.unlockedWeapons.length;
    handleSelectWeapon(stats.unlockedWeapons[prevIndex]);
  }, [stats.unlockedWeapons, stats.currentWeapon, handleSelectWeapon]);

  // Firing action
  const handleShoot = useCallback(() => {
    if (engineRef.current && !isPaused && !victoryDefeatMode && !isMapOpen) {
      engineRef.current.shoot(stats);
      setLastFireTime(engineRef.current.lastFireTime);
    }
  }, [isPaused, victoryDefeatMode, isMapOpen, stats]);

  // Initialize Engine
  useEffect(() => {
    if (!containerRef.current) return;

    soundManager.setVolumes(settings.soundVolume, settings.musicVolume);

    const engine = new Engine3D(containerRef.current, currentLevel, settings, {
      onStatsUpdate: (fn) => setStats(fn),
      onNotification: (text, icon) => addNotification(text, icon),
      onLevelComplete: () => setVictoryDefeatMode('victory'),
      onGameOver: () => setVictoryDefeatMode('defeat'),
    });

    engine.onHitEnemyCallback = () => {
      setHitmarkerActive(true);
      setTimeout(() => setHitmarkerActive(false), 120);
    };

    engineRef.current = engine;

    // Time Elapsed Counter
    const timerInterval = setInterval(() => {
      setStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);

    // Sync HUD animation values and stats with engine loop
    const syncInterval = setInterval(() => {
      if (engineRef.current) {
        engineRef.current.currentStats = stats;
        setDamageFlash(engineRef.current.damageFlashAmount);
        setPickupFlash(engineRef.current.pickupFlashAmount);
        setBobbingOffset({ x: engineRef.current.bobbingOffset.x, y: engineRef.current.bobbingOffset.y });
        setIsReloading(engineRef.current.isReloading);
      }
    }, 50);

    // Resize and landscape/portrait orientation listener
    const handleResize = () => {
      if (containerRef.current && engineRef.current) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        engineRef.current.resize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearInterval(timerInterval);
      clearInterval(syncInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Run once on mount

  // Sync playerStats and NoClip with engine reference
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.currentStats = stats;
      engineRef.current.isNoClip = !!stats.isNoClip;
    }
  }, [stats]);

  // Desktop Pointer Lock & Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (engineRef.current) {
        engineRef.current.keys[e.code] = true;
      }

      // If map is open, close it on ESC or TAB or M
      if (isMapOpen) {
        if (e.code === 'Escape' || e.code === 'Tab' || e.code === 'KeyM') {
          e.preventDefault();
          e.stopPropagation();
          setIsMapOpen(false);
          return;
        }
      }

      if (e.code === 'KeyE' || e.code === 'KeyF') {
        engineRef.current?.interact(stats);
      } else if (e.code === 'Space') {
        engineRef.current?.jump();
      } else if (e.code === 'KeyR') {
        engineRef.current?.reload(stats);
      } else if (e.code === 'Tab' || e.code === 'KeyM') {
        e.preventDefault();
        setIsMapOpen(prev => !prev);
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (isMapOpen) {
          setIsMapOpen(false);
        } else {
          setIsPaused(prev => !prev);
        }
      } else if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        const slot = parseInt(e.code.replace('Digit', ''));
        if (slot === 9) {
          const customUnlocked = stats.unlockedWeapons.filter(w => WEAPON_REGISTRY[w]?.isCustom);
          if (customUnlocked.length > 0) {
            const curIdx = customUnlocked.indexOf(stats.currentWeapon);
            const nextIdx = (curIdx + 1) % customUnlocked.length;
            handleSelectWeapon(customUnlocked[nextIdx]);
          }
        } else {
          const tierGuns = WEAPON_TIERS[slot] || [];
          const unlockedInTier = tierGuns.filter(w => stats.unlockedWeapons.includes(w));
          if (unlockedInTier.length > 0) {
            const curIdx = unlockedInTier.indexOf(stats.currentWeapon);
            if (curIdx >= 0) {
              const nextIdx = (curIdx + 1) % unlockedInTier.length;
              handleSelectWeapon(unlockedInTier[nextIdx]);
            } else {
              handleSelectWeapon(unlockedInTier[0]);
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) {
        engineRef.current.keys[e.code] = false;
      }
    };

    const handleWindowBlur = () => {
      if (engineRef.current) {
        engineRef.current.keys = {};
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement && engineRef.current && !isPaused && !isMapOpen) {
        engineRef.current.handleMouseMove(e.movementX, e.movementY);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement) {
        handleShoot();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) handleNextWeapon();
      else if (e.deltaY < 0) handlePrevWeapon();
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('wheel', handleWheel);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [stats, isPaused, isMapOpen, handleNextWeapon, handlePrevWeapon, handleShoot, handleSelectWeapon]);

  // Request Pointer Lock on Click (only when not interacting with menus)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (
      e.target === containerRef.current ||
      (containerRef.current && containerRef.current.contains(e.target as Node))
    ) {
      if (!isPointerLocked && !isPaused && !isSettingsOpen && !isMapOpen && !victoryDefeatMode && !isWeaponWorkshopOpen) {
        containerRef.current?.requestPointerLock();
      }
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      onClick={handleCanvasClick}
    >
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* CRT Scanline Filter Overlay */}
      {settings.crtFilter && (
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      )}

      {/* 2.5D Animated First-Person Weapon Display (Optimized for Mobile Landscape) */}
      <WeaponViewport
        weapon={stats.currentWeapon}
        lastFireTime={lastFireTime}
        isReloading={isReloading}
        bobbingOffset={bobbingOffset}
      />

      {/* Heads Up Display */}
      <HUD
        stats={stats}
        currentWeapon={stats.currentWeapon}
        damageFlashAmount={damageFlash}
        pickupFlashAmount={pickupFlash}
        hitmarkerActive={hitmarkerActive}
        enemies={engineRef.current?.enemies.getEnemies() || []}
        onSelectWeapon={handleSelectWeapon}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenPause={() => setIsPaused(true)}
        onToggleMute={() => setIsMuted(soundManager.toggleMute())}
        isMuted={isMuted}
      />

      {/* Mobile Controls Overlay */}
      <MobileControls
        settings={settings}
        unlockedWeapons={stats.unlockedWeapons}
        currentWeapon={stats.currentWeapon}
        onMove={(x, y) => engineRef.current?.joystickVector.set(x, y)}
        onLook={(dx, dy) => engineRef.current?.handleTouchLook(dx, dy)}
        onShoot={handleShoot}
        onReload={() => engineRef.current?.reload(stats)}
        onJump={() => engineRef.current?.jump()}
        onInteract={() => engineRef.current?.interact(stats)}
        onNextWeapon={handleNextWeapon}
        onPrevWeapon={handlePrevWeapon}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleGyro={() => handleUpdateSettings({ gyroEnabled: !settings.gyroEnabled })}
      />

      {/* Floating Notifications */}
      <NotificationToast notifications={notifications} />

      {/* Full Automap Overlay */}
      <MiniMap
        level={currentLevel}
        playerPos={{
          x: engineRef.current?.playerPos.x || 2,
          z: engineRef.current?.playerPos.z || 2,
          yaw: engineRef.current?.playerYaw || 0,
        }}
        enemies={engineRef.current?.enemies.getEnemies() || []}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      {/* Settings & Cheat Matrix Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onResetDefaults={handleResetDefaults}
        playerStats={stats}
        onApplyCheat={handleApplyCheat}
      />

      {/* Custom Gun Creator Workshop Modal */}
      <WeaponCreatorModal
        isOpen={isWeaponWorkshopOpen}
        onClose={() => setIsWeaponWorkshopOpen(false)}
        onEquipCustomWeapon={handleEquipCustomWeapon}
      />

      {/* Pause Menu Modal */}
      <PauseModal
        isOpen={isPaused}
        isGodMode={!!stats.isGodMode}
        onResume={() => setIsPaused(false)}
        onRestart={handleRestartLevel}
        onOpenSettings={() => {
          setIsPaused(false);
          setIsSettingsOpen(true);
        }}
        onOpenLevelSelect={() => {
          setIsPaused(false);
          setIsLevelSelectOpen(true);
        }}
        onOpenWeaponWorkshop={() => {
          setIsPaused(false);
          setIsWeaponWorkshopOpen(true);
        }}
        onToggleGodMode={() => handleApplyCheat('god')}
      />

      {/* Level Select Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        onClose={() => setIsLevelSelectOpen(false)}
        onSelectLevel={handleSelectLevel}
        onOpenLevelEditor={() => setIsLevelEditorOpen(true)}
      />

      {/* Level Editor Modal */}
      <LevelEditorModal
        isOpen={isLevelEditorOpen}
        onClose={() => setIsLevelEditorOpen(false)}
        onPlayCustomLevel={handlePlayCustomLevel}
      />

      {/* Victory / Defeat Modal */}
      <VictoryDefeatModal
        mode={victoryDefeatMode}
        stats={stats}
        hasNextLevel={currentLevel.id !== 'arena' && currentLevel.id !== 'e1m6'}
        onNextLevel={handleNextLevel}
        onRestart={handleRestartLevel}
        onSelectLevel={handleSelectLevel}
        onOpenLevelSelect={() => {
          setVictoryDefeatMode(null);
          setIsLevelSelectOpen(true);
        }}
      />
    </div>
  );
};
