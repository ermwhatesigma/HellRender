import React, { useEffect, useRef, useState } from 'react';
import { WeaponType } from '../types/game';
import { WEAPON_REGISTRY, loadCustomWeapons } from '../core/WeaponSystem';

interface WeaponViewportProps {
  weapon: WeaponType;
  lastFireTime: number;
  isReloading: boolean;
  bobbingOffset: { x: number; y: number };
}

export const WeaponViewport: React.FC<WeaponViewportProps> = ({
  weapon,
  lastFireTime,
  isReloading,
  bobbingOffset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animState, setAnimState] = useState<{ frame: number; time: number }>({ frame: 0, time: 0 });

  useEffect(() => {
    setAnimState({ frame: 1, time: performance.now() });
    const timer = setTimeout(() => {
      setAnimState({ frame: 0, time: 0 });
    }, 180);
    return () => clearTimeout(timer);
  }, [lastFireTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 320, 240);
    ctx.imageSmoothingEnabled = false;

    // Ensure custom weapons are up to date
    loadCustomWeapons();
    const weaponDef = WEAPON_REGISTRY[weapon];

    const isFiring = animState.frame > 0;
    const recoilY = isFiring ? 18 : 0;
    const reloadY = isReloading ? 50 : 0;
    const bobX = bobbingOffset.x * 200;
    const bobY = bobbingOffset.y * 200;

    const centerX = 160 + bobX;
    const baseY = 240 + recoilY + reloadY - bobY;

    // Check if Custom Weapon with custom pixel art
    if (weaponDef?.isCustom && weaponDef.customPixelData) {
      const grid = weaponDef.customPixelData;
      const pixelSize = 7.5; // Bigger, bolder pixel art scale
      const numCols = grid[0]?.length || 16;
      const numRows = grid.length || 16;
      const gunWidth = numCols * pixelSize;
      const startX = centerX - gunWidth / 2;
      const startY = baseY - numRows * pixelSize - 10;

      // Draw custom pixel sprite
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < (grid[r]?.length || 0); c++) {
          const color = grid[r][c];
          if (color && color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
          }
        }
      }

      // Draw Doom Guy marine hands gripping the gun base
      ctx.fillStyle = '#e0a87c';
      ctx.fillRect(centerX - 35, baseY - 50, 30, 45);
      ctx.fillRect(centerX + 5, baseY - 40, 35, 45);
      ctx.fillStyle = '#b87856';
      ctx.fillRect(centerX - 35, baseY - 20, 30, 20);
      ctx.fillRect(centerX + 5, baseY - 15, 35, 20);

      // Firing Muzzle Flash
      if (isFiring) {
        const flashColor = weaponDef.color || '#fbbf24';
        ctx.fillStyle = flashColor;
        ctx.beginPath();
        ctx.arc(centerX, startY - 15, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, startY - 15, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (weapon === 'fist') {
      // Berserk Fists
      ctx.fillStyle = '#b87856';
      if (isFiring) {
        ctx.fillRect(centerX - 40, baseY - 130, 80, 80);
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(centerX - 35, baseY - 100, 70, 20);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(centerX - 42, baseY - 135, 84, 12);
      } else {
        ctx.fillRect(centerX - 60, baseY - 70, 70, 70);
        ctx.fillRect(centerX + 10, baseY - 60, 60, 60);
      }
    } else if (weapon === 'pistol') {
      // UAC Semi-Automatic Pistol
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(centerX - 16, baseY - 100, 32, 90);
      ctx.fillStyle = '#475569';
      ctx.fillRect(centerX - 18, baseY - 110 + (isFiring ? 12 : 0), 36, 30);
      ctx.fillStyle = '#020617';
      ctx.fillRect(centerX - 8, baseY - 112, 16, 6);
      ctx.fillStyle = '#e0a87c';
      ctx.fillRect(centerX - 30, baseY - 60, 60, 60);

      if (isFiring) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 126, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 126, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'shotgun') {
      // Combat Pump-Action Shotgun
      ctx.fillStyle = '#334155';
      ctx.fillRect(centerX - 12, baseY - 140, 24, 120);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(centerX - 8, baseY - 146, 16, 10);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(centerX - 14, baseY - 80, 28, 30);
      ctx.fillStyle = '#b87856';
      ctx.fillRect(centerX - 35, baseY - 65, 30, 40);
      ctx.fillRect(centerX + 10, baseY - 45, 35, 45);

      if (isFiring) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 160, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 160, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'supershotgun') {
      // Super Shotgun (Double Barrel)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(centerX - 24, baseY - 130, 20, 110);
      ctx.fillRect(centerX + 4, baseY - 130, 20, 110);
      ctx.fillStyle = '#020617';
      ctx.fillRect(centerX - 20, baseY - 136, 14, 8);
      ctx.fillRect(centerX + 8, baseY - 136, 14, 8);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(centerX - 22, baseY - 60, 44, 60);

      if (isFiring) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(centerX - 12, baseY - 150, 32, 0, Math.PI * 2);
        ctx.arc(centerX + 12, baseY - 150, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 150, 22, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'quadshotgun') {
      // Quad-Barrel Heavy Annihilator
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(centerX - 36, baseY - 130, 16, 110);
      ctx.fillRect(centerX - 16, baseY - 130, 16, 110);
      ctx.fillRect(centerX + 4, baseY - 130, 16, 110);
      ctx.fillRect(centerX + 24, baseY - 130, 16, 110);
      ctx.fillStyle = '#020617';
      ctx.fillRect(centerX - 34, baseY - 136, 12, 8);
      ctx.fillRect(centerX - 14, baseY - 136, 12, 8);
      ctx.fillRect(centerX + 6, baseY - 136, 12, 8);
      ctx.fillRect(centerX + 26, baseY - 136, 12, 8);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(centerX - 32, baseY - 60, 64, 60);

      if (isFiring) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 155, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 155, 26, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'chaingun') {
      // Triple Gatling Chaingun
      ctx.fillStyle = '#475569';
      ctx.fillRect(centerX - 28, baseY - 120, 56, 100);
      ctx.fillStyle = '#0f172a';
      const rotOffset = (animState.frame > 0 ? (Date.now() % 3) * 6 : 0);
      ctx.fillRect(centerX - 20 + rotOffset, baseY - 140, 12, 30);
      ctx.fillRect(centerX + 4 - rotOffset, baseY - 140, 12, 30);

      if (isFiring) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 150, 34, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'rocketlauncher') {
      // Heavy Rocket Launcher
      ctx.fillStyle = '#3f4e3c';
      ctx.fillRect(centerX - 35, baseY - 130, 70, 110);
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(centerX, baseY - 130, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.stroke();

      if (isFiring) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 140, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 140, 24, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'flamethrower') {
      // Hellfire Flamethrower
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(centerX - 28, baseY - 110, 56, 90);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(centerX - 14, baseY - 135, 28, 26);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(centerX, baseY - 138, 6, 0, Math.PI * 2);
      ctx.fill();

      if (isFiring) {
        const grad = ctx.createRadialGradient(centerX, baseY - 160, 10, centerX, baseY - 160, 50);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.4, '#ea580c');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, baseY - 160, 50, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'plasmarifle') {
      // High-Tech Plasma Rifle
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(centerX - 30, baseY - 120, 60, 100);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(centerX - 24, baseY - 90, 48, 12);
      ctx.fillRect(centerX - 24, baseY - 60, 48, 12);

      if (isFiring) {
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 140, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 140, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'railgun') {
      // Particle Railgun
      ctx.fillStyle = '#581c87';
      ctx.fillRect(centerX - 18, baseY - 145, 36, 130);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(centerX - 24, baseY - 125, 10, 80);
      ctx.fillRect(centerX + 14, baseY - 125, 10, 80);

      if (isFiring) {
        ctx.fillStyle = '#f3e8ff';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 160, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 160, 18, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'unmaker') {
      // Demonic Unmaker
      ctx.fillStyle = '#831843';
      ctx.fillRect(centerX - 30, baseY - 130, 60, 110);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(centerX, baseY - 95, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe4e6';
      ctx.beginPath();
      ctx.arc(centerX, baseY - 95, 6, 0, Math.PI * 2);
      ctx.fill();

      if (isFiring) {
        ctx.fillStyle = '#fda4af';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 155, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 155, 24, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (weapon === 'bfg9000') {
      // BFG 9000 Super Weapon
      ctx.fillStyle = '#14532d';
      ctx.fillRect(centerX - 45, baseY - 140, 90, 120);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(centerX, baseY - 80, 24, 0, Math.PI * 2);
      ctx.fill();

      if (isFiring) {
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 160, 56, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f0fdf4';
        ctx.beginPath();
        ctx.arc(centerX, baseY - 160, 32, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [weapon, animState, isReloading, bobbingOffset]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-end justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        className="w-[380px] sm:w-[480px] md:w-[560px] h-auto object-contain max-h-[70vh]"
      />
    </div>
  );
};
