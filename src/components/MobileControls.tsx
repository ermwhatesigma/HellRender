import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GameSettings, WeaponType } from '../types/game';
import { Crosshair, RotateCcw, ArrowUp, Hand, ChevronRight, ChevronLeft, Settings, Compass, Zap, Eye, EyeOff } from 'lucide-react';
import { WEAPON_REGISTRY } from '../core/WeaponSystem';

interface MobileControlsProps {
  settings: GameSettings;
  unlockedWeapons: WeaponType[];
  currentWeapon: WeaponType;
  onMove: (x: number, y: number) => void;
  onLook: (dx: number, dy: number) => void;
  onShoot: () => void;
  onReload: () => void;
  onJump: () => void;
  onInteract: () => void;
  onNextWeapon: () => void;
  onPrevWeapon: () => void;
  onOpenSettings: () => void;
  onToggleGyro?: () => void;
  forceShow?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  settings,
  currentWeapon,
  onMove,
  onLook,
  onShoot,
  onReload,
  onJump,
  onInteract,
  onNextWeapon,
  onPrevWeapon,
  onOpenSettings,
  onToggleGyro,
  forceShow = false,
}) => {
  const [showWeaponBar, setShowWeaponBar] = useState<boolean>(true);

  // Virtual Joystick State
  const joystickRef = useRef<HTMLDivElement>(null);
  const [joystickTouchId, setJoystickTouchId] = useState<number | null>(null);
  const [joystickPos, setJoystickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch Look Surface State (Right half)
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Continuous shooting on hold
  const isShootingRef = useRef<boolean>(false);
  const shootIntervalRef = useRef<number | null>(null);
  const [isFiringVisual, setIsFiringVisual] = useState<boolean>(false);

  // Detect touch capability
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Action debouncing
  const lastActionTimes = useRef<Record<string, number>>({});
  const lastToggleTime = useRef<number>(0);

  const triggerAction = useCallback((actionName: string, action: () => void, e?: React.TouchEvent | React.MouseEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = performance.now();
    const last = lastActionTimes.current[actionName] || 0;
    if (now - last < 280) return;
    lastActionTimes.current[actionName] = now;
    action();
  }, []);

  const handleToggleWeaponBar = useCallback((e?: React.TouchEvent | React.MouseEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = performance.now();
    if (now - lastToggleTime.current < 350) return;
    lastToggleTime.current = now;
    setShowWeaponBar(prev => !prev);
  }, []);

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch || forceShow);
  }, [forceShow]);

  // 1. Virtual Joystick Handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (joystickTouchId !== null) return;
    const touch = e.changedTouches[0];
    setJoystickTouchId(touch.identifier);

    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      joystickOrigin.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId) {
        const dx = touch.clientX - joystickOrigin.current.x;
        const dy = touch.clientY - joystickOrigin.current.y;
        const maxDist = 44;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(maxDist, dist);
        const angle = Math.atan2(dy, dx);

        const posX = Math.cos(angle) * clampedDist;
        const posY = Math.sin(angle) * clampedDist;

        setJoystickPos({ x: posX, y: posY });
        onMove(posX / maxDist, -posY / maxDist);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId) {
        setJoystickTouchId(null);
        setJoystickPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  // 2. Touch Look Surface Handlers (Dedicated Touch-Look Area)
  const handleLookTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier !== joystickTouchId && lookTouchId.current === null) {
        lookTouchId.current = touch.identifier;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (lookTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        onLook(dx, dy);
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  };

  // 3. Continuous Fire button
  const startShooting = (e?: React.TouchEvent | React.MouseEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    isShootingRef.current = true;
    setIsFiringVisual(true);
    onShoot();
    if (!shootIntervalRef.current) {
      shootIntervalRef.current = window.setInterval(() => {
        if (isShootingRef.current) {
          onShoot();
        }
      }, 110);
    }
  };

  const stopShooting = (e?: React.TouchEvent | React.MouseEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    isShootingRef.current = false;
    setIsFiringVisual(false);
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (shootIntervalRef.current) clearInterval(shootIntervalRef.current);
    };
  }, []);

  const isLeftHanded = settings.mobileLayout === 'lefthanded';
  const isCompact = settings.mobileLayout === 'compact';

  if (!isTouchDevice && !forceShow) {
    return null;
  }

  const currentDef = WEAPON_REGISTRY[currentWeapon] || WEAPON_REGISTRY['pistol'];

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-30 font-mono">
      {/* 1. Touch-to-Look Area (Right side, cleanly bounded away from top and bottom bars) */}
      <div
        className={`absolute top-12 bottom-20 sm:bottom-28 ${isLeftHanded ? 'left-4 right-1/2' : 'left-1/2 right-4'} pointer-events-auto touch-none z-10`}
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
      >
        <div className="w-full h-full flex items-center justify-center opacity-10 pointer-events-none">
          <Crosshair size={44} className="text-white animate-pulse" />
        </div>
      </div>

      {/* 2. Virtual Joystick (Landscape & Portrait Responsive) */}
      <div
        className={`mobile-joystick-box absolute bottom-20 sm:bottom-24 ${isLeftHanded ? 'right-3 sm:right-6' : 'left-3 sm:left-6'} pointer-events-auto z-20`}
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        onTouchCancel={handleJoystickTouchEnd}
      >
        <div
          ref={joystickRef}
          className={`${isCompact ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-28 h-28 sm:w-32 sm:h-32'} rounded-full bg-neutral-950/80 border-2 border-red-500/40 backdrop-blur-md flex items-center justify-center relative shadow-2xl ring-2 ring-neutral-900/50`}
        >
          {/* Outer Direction Markers */}
          <div className="absolute top-1 text-[8px] sm:text-[9px] text-neutral-400 font-bold">▲</div>
          <div className="absolute bottom-1 text-[8px] sm:text-[9px] text-neutral-400 font-bold">▼</div>
          <div className="absolute left-1 text-[8px] sm:text-[9px] text-neutral-400 font-bold">◀</div>
          <div className="absolute right-1 text-[8px] sm:text-[9px] text-neutral-400 font-bold">▶</div>

          {/* Stick Knob */}
          <div
            className={`${isCompact ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-12 h-12 sm:w-14 sm:h-14'} rounded-full bg-gradient-to-br from-red-600 to-red-900 border-2 border-red-400 shadow-xl flex items-center justify-center transform transition-transform duration-75`}
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-red-300/80 shadow-inner" />
          </div>
        </div>
      </div>

      {/* 3. Action Buttons & Collapsible Weapon Switcher (Right-side thumb cluster) */}
      <div
        className={`mobile-action-cluster absolute bottom-20 sm:bottom-24 ${isLeftHanded ? 'left-3 sm:left-6' : 'right-3 sm:right-6'} pointer-events-auto z-20 flex flex-col items-end gap-1 sm:gap-2`}
      >
        {/* Toggleable Weapon Quick Switch Bar */}
        <div className="flex items-center gap-1 bg-neutral-950/85 p-0.5 sm:p-1 rounded-xl border border-neutral-700/80 backdrop-blur-sm shadow-lg mb-0.5 transition-all">
          {showWeaponBar ? (
            <>
              <button
                onPointerDown={e => triggerAction('prev_weapon', onPrevWeapon, e)}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-90 border border-neutral-600 flex items-center justify-center text-neutral-200 shadow"
                title="Prev Weapon"
              >
                <ChevronLeft size={14} />
              </button>
              
              <div
                onPointerDown={e => triggerAction('next_weapon', onNextWeapon, e)}
                className="px-1.5 py-0.5 flex items-center gap-1 min-w-[70px] sm:min-w-[90px] justify-center cursor-pointer active:scale-95 transition"
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0" style={{ backgroundColor: currentDef.color }} />
                <span className="text-[10px] sm:text-xs font-black text-yellow-400 uppercase tracking-tight truncate max-w-[65px] sm:max-w-[85px]">
                  {currentDef.name}
                </span>
              </div>

              <button
                onPointerDown={e => triggerAction('next_weapon', onNextWeapon, e)}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-90 border border-neutral-600 flex items-center justify-center text-neutral-200 shadow"
                title="Next Weapon"
              >
                <ChevronRight size={14} />
              </button>

              {onToggleGyro && (
                <button
                  onPointerDown={e => triggerAction('toggle_gyro', onToggleGyro, e)}
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center active:scale-90 shadow transition ${
                    settings.gyroEnabled ? 'bg-green-700 border-green-400 text-white' : 'bg-neutral-800 border-neutral-600 text-neutral-400'
                  }`}
                  title="Toggle Gyroscope"
                >
                  <Compass size={13} />
                </button>
              )}

              <button
                onPointerDown={e => triggerAction('open_settings', onOpenSettings, e)}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-90 border border-neutral-600 flex items-center justify-center text-neutral-200 shadow"
                title="Settings"
              >
                <Settings size={13} />
              </button>

              <button
                onPointerDown={handleToggleWeaponBar}
                className="w-6 h-7 sm:w-8 sm:h-9 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-90"
                title="Hide Weapon Bar"
              >
                <EyeOff size={12} />
              </button>
            </>
          ) : (
            /* Minimized Bar */
            <div className="flex items-center gap-1">
              <button
                onPointerDown={e => triggerAction('next_weapon', onNextWeapon, e)}
                className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-700 text-yellow-400 text-[9px] sm:text-[11px] font-bold flex items-center gap-1 shadow active:scale-95"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentDef.color }} />
                <span className="truncate max-w-[65px]">{currentDef.name}</span>
              </button>
              <button
                onPointerDown={handleToggleWeaponBar}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 flex items-center justify-center hover:bg-neutral-800 active:scale-90 shadow"
                title="Show Weapon Bar"
              >
                <Eye size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Tactical Buttons Cluster */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Interact / Use Door button */}
          <button
            onPointerDown={e => triggerAction('interact', onInteract, e)}
            className="mobile-action-btn w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-600/90 hover:bg-amber-500 active:scale-90 border-2 border-amber-400 flex items-center justify-center text-white shadow-lg font-bold flex-col gap-0.5 active:bg-amber-400"
            title="Interact (E/F)"
          >
            <Hand size={13} />
            <span className="text-[6px] sm:text-[8px] font-black leading-none">USE</span>
          </button>

          {/* Jump Button */}
          <button
            onPointerDown={e => triggerAction('jump', onJump, e)}
            className="mobile-action-btn w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-sky-600/90 hover:bg-sky-500 active:scale-90 border-2 border-sky-400 flex items-center justify-center text-white shadow-lg font-bold flex-col gap-0.5 active:bg-sky-400"
            title="Jump"
          >
            <ArrowUp size={13} />
            <span className="text-[6px] sm:text-[8px] font-black leading-none">JUMP</span>
          </button>

          {/* Reload Button */}
          <button
            onPointerDown={e => triggerAction('reload', onReload, e)}
            className="mobile-action-btn w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 active:scale-90 border-2 border-emerald-400 flex items-center justify-center text-white shadow-lg font-bold flex-col gap-0.5 active:bg-emerald-400"
            title="Reload (R)"
          >
            <RotateCcw size={13} />
            <span className="text-[6px] sm:text-[8px] font-black leading-none">RELOAD</span>
          </button>

          {/* Giant Primary Fire Button */}
          <button
            onPointerDown={startShooting}
            onPointerUp={stopShooting}
            onPointerCancel={stopShooting}
            onPointerLeave={stopShooting}
            className={`mobile-fire-btn w-14 h-14 sm:w-18 sm:h-18 rounded-2xl border-2 sm:border-3 flex items-center justify-center text-white shadow-2xl font-black flex-col gap-0.5 sm:gap-1 ring-3 sm:ring-4 ring-red-950/60 transition-all ${
              isFiringVisual
                ? 'bg-gradient-to-br from-yellow-500 to-red-600 border-yellow-300 scale-95 ring-yellow-500/50 shadow-red-500/50'
                : 'bg-gradient-to-br from-red-600 to-red-900 border-red-400 active:scale-90'
            }`}
            title="Primary Fire"
          >
            {isFiringVisual ? <Zap size={20} className="animate-spin text-yellow-200" /> : <Crosshair size={20} />}
            <span className="text-[7px] sm:text-[9px] tracking-widest font-black">FIRE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
