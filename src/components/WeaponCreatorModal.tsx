import React, { useState, useRef, useEffect } from 'react';
import { WeaponDef } from '../types/game';
import { saveCustomWeapon, loadCustomWeapons } from '../core/WeaponSystem';
import { soundManager } from '../audio/SoundSystem';
import { Wrench, RotateCcw, X, Sparkles, Volume2, Flame, Crosshair, Zap, PaintBucket, Edit3 } from 'lucide-react';

interface WeaponCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEquipCustomWeapon: (weapon: WeaponDef) => void;
}

const PALETTE = [
  'transparent',
  '#000000',
  '#1e293b',
  '#475569',
  '#94a3b8',
  '#f8fafc',
  '#450a0a',
  '#991b1b',
  '#ef4444',
  '#ea580c',
  '#f97316',
  '#eab308',
  '#fde047',
  '#14532d',
  '#16a34a',
  '#22c55e',
  '#082f49',
  '#0284c7',
  '#38bdf8',
  '#581c87',
  '#a855f7',
  '#c084fc',
  '#831843',
  '#ec4899',
  '#78350f',
  '#b45309',
  '#e0a87c',
  '#b87856',
];

const PRESETS: Record<string, string[][]> = {
  pistol: [
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','#1e293b','#475569','#475569','#475569','#475569','#475569','#475569','#1e293b','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','#0f172a','#94a3b8','#f8fafc','#94a3b8','#94a3b8','#f8fafc','#94a3b8','#0f172a','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','#0f172a','#475569','#94a3b8','#475569','#475569','#94a3b8','#475569','#0f172a','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','#020617','#1e293b','#475569','#475569','#475569','#475569','#1e293b','#020617','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#0f172a','#1e293b','#475569','#475569','#1e293b','#0f172a','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','#0f172a','#78350f','#78350f','#0f172a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','#0f172a','#b45309','#b45309','#0f172a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','#0f172a','#78350f','#78350f','#0f172a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','#0f172a','#451a03','#451a03','#0f172a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','#e0a87c','#e0a87c','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','#b87856','#b87856','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent']
  ],
  blaster: [
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#082f49','#0284c7','#0284c7','#0284c7','#082f49','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','#0284c7','#38bdf8','#f8fafc','#38bdf8','#38bdf8','#0284c7','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','#0284c7','#38bdf8','#0284c7','#082f49','#082f49','#0284c7','#38bdf8','#0284c7','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','#082f49','#38bdf8','#f8fafc','#38bdf8','#38bdf8','#f8fafc','#38bdf8','#082f49','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','#0284c7','#082f49','#38bdf8','#38bdf8','#38bdf8','#38bdf8','#082f49','#0284c7','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','#082f49','#0284c7','#0284c7','#0284c7','#0284c7','#082f49','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#0f172a','#1e293b','#1e293b','#0f172a','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#0f172a','#38bdf8','#38bdf8','#0f172a','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#0f172a','#0284c7','#0284c7','#0f172a','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#0f172a','#1e293b','#1e293b','#0f172a','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','#e0a87c','#e0a87c','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','#b87856','#b87856','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent']
  ],
  hellcannon: [
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#450a0a','#991b1b','#ef4444','#991b1b','#450a0a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','#450a0a','#991b1b','#fde047','#fde047','#991b1b','#450a0a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','#450a0a','#991b1b','#ea580c','#f97316','#ea580c','#991b1b','#450a0a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','#991b1b','#ef4444','#ea580c','#fde047','#ea580c','#ef4444','#991b1b','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','#450a0a','#991b1b','#ea580c','#f97316','#ea580c','#991b1b','#450a0a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','#450a0a','#991b1b','#ef4444','#ef4444','#991b1b','#450a0a','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#1e293b','#475569','#475569','#1e293b','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#1e293b','#ef4444','#ef4444','#1e293b','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#1e293b','#991b1b','#991b1b','#1e293b','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','#1e293b','#475569','#475569','#1e293b','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','#e0a87c','#e0a87c','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','#b87856','#b87856','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent'],
    ['transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent','transparent']
  ]
};

export const WeaponCreatorModal: React.FC<WeaponCreatorModalProps> = ({
  isOpen,
  onClose,
  onEquipCustomWeapon,
}) => {
  const gridSize = 16;
  const [pixels, setPixels] = useState<string[][]>(() => PRESETS.blaster);
  const [currentColor, setCurrentColor] = useState<string>('#38bdf8');
  const [drawTool, setDrawTool] = useState<'pen' | 'bucket'>('pen');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Weapon Properties
  const [name, setName] = useState<string>('Custom Super Blaster');
  const [damage, setDamage] = useState<number>(75);
  const [fireRate, setFireRate] = useState<number>(120);
  const [ammoType, setAmmoType] = useState<'none' | 'bullets' | 'shells' | 'rockets' | 'cells'>('cells');
  const [ammoPerShot, setAmmoPerShot] = useState<number>(1);
  const [pellets, setPellets] = useState<number>(1);
  const [spread, setSpread] = useState<number>(0.03);
  const [projectileType, setProjectileType] = useState<'hitscan' | 'bullet' | 'rocket' | 'plasma' | 'laser' | 'flame' | 'bfg'>('laser');
  const [soundType, setSoundType] = useState<'pistol' | 'shotgun' | 'chaingun' | 'rocket' | 'plasma' | 'laser' | 'flame' | 'bfg'>('laser');
  const [recoilAmount, setRecoilAmount] = useState<number>(0.06);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [testFiring, setTestFiring] = useState<boolean>(false);
  const [savedWeapons, setSavedWeapons] = useState<WeaponDef[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedWeapons(loadCustomWeapons());
    }
  }, [isOpen]);

  // Live Canvas Preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 160, 160);
    ctx.imageSmoothingEnabled = false;

    const scale = 160 / gridSize;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const color = pixels[r]?.[c];
        if (color && color !== 'transparent') {
          ctx.fillStyle = color;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }

    if (testFiring) {
      ctx.fillStyle = currentColor || '#fbbf24';
      ctx.beginPath();
      ctx.arc(80, 20, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [pixels, testFiring, currentColor]);

  if (!isOpen) return null;

  const paintPixel = (r: number, c: number) => {
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;
    if (drawTool === 'bucket') {
      const targetColor = pixels[r][c];
      if (targetColor === currentColor) return;
      const next = pixels.map(row => [...row]);
      
      const floodFill = (row: number, col: number) => {
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;
        if (next[row][col] !== targetColor) return;
        next[row][col] = currentColor;
        floodFill(row + 1, col);
        floodFill(row - 1, col);
        floodFill(row, col + 1);
        floodFill(row, col - 1);
      };
      
      floodFill(r, c);
      setPixels(next);
    } else {
      const next = pixels.map(row => [...row]);
      next[r][c] = currentColor;
      setPixels(next);
    }
  };

  // Touch drawing support
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gridContainerRef.current) return;
    const touch = e.touches[0];
    const rect = gridContainerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const cellSize = rect.width / gridSize;
    const c = Math.floor(x / cellSize);
    const r = Math.floor(y / cellSize);
    paintPixel(r, c);
  };

  const handleTestFire = () => {
    setTestFiring(true);
    if (soundType === 'pistol') soundManager.playPistol();
    else if (soundType === 'shotgun') soundManager.playShotgun();
    else if (soundType === 'chaingun') soundManager.playChaingun();
    else if (soundType === 'rocket') soundManager.playRocketLaunch();
    else if (soundType === 'plasma') soundManager.playPlasma();
    else if (soundType === 'laser') soundManager.playLaser();
    else if (soundType === 'flame') soundManager.playFlamethrower();
    else if (soundType === 'bfg') soundManager.playBFGFire();

    setTimeout(() => {
      setTestFiring(false);
    }, 150);
  };

  const handleSaveAndEquip = () => {
    const weaponId = 'custom_' + Date.now();
    const newWeapon: WeaponDef = {
      id: weaponId,
      name: name.trim() || 'Custom Blaster',
      slot: 9,
      damage,
      ammoType,
      ammoPerShot,
      clipSize: 50,
      fireRate,
      reloadTime: 1500,
      spread,
      pellets,
      projectileSpeed: projectileType === 'hitscan' ? 0 : projectileType === 'rocket' ? 26 : projectileType === 'laser' ? 45 : projectileType === 'flame' ? 18 : 34,
      splashRadius: projectileType === 'rocket' ? 6 : projectileType === 'bfg' ? 12 : 0,
      recoilAmount,
      range: 100,
      unlocked: true,
      color: currentColor === 'transparent' ? '#38bdf8' : currentColor,
      isCustom: true,
      customPixelData: pixels,
      projectileType,
      soundType,
    };

    saveCustomWeapon(newWeapon);
    onEquipCustomWeapon(newWeapon);
    onClose();
  };

  const handleLoadPreset = (presetKey: string) => {
    if (PRESETS[presetKey]) {
      setPixels(PRESETS[presetKey]);
    }
  };

  const handleClearCanvas = () => {
    setPixels(Array(gridSize).fill('transparent').map(() => Array(gridSize).fill('transparent')));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-mono">
      <div className="bg-neutral-900 border-2 border-yellow-500 rounded-2xl max-w-4xl w-full p-4 sm:p-5 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800 mb-3">
          <div className="flex items-center gap-2">
            <Wrench className="text-yellow-400" size={24} />
            <h2 className="text-base sm:text-lg font-black text-neutral-100 uppercase tracking-widest truncate">
              CUSTOM WEAPON WORKSHOP & GUN FORGE
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 sm:gap-5 overflow-y-auto pr-1">
          {/* Left: Pixel Art Drawing Canvas */}
          <div className="flex flex-col items-center gap-2.5 bg-neutral-950 p-3.5 border border-neutral-800 rounded-xl">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDrawTool('pen')}
                  className={`p-1.5 rounded text-xs font-bold ${drawTool === 'pen' ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}
                  title="Pen Tool"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setDrawTool('bucket')}
                  className={`p-1.5 rounded text-xs font-bold ${drawTool === 'bucket' ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}
                  title="Fill Bucket"
                >
                  <PaintBucket size={14} />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleLoadPreset('pistol')}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-bold uppercase"
                >
                  Pistol
                </button>
                <button
                  onClick={() => handleLoadPreset('blaster')}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-bold uppercase"
                >
                  Blaster
                </button>
                <button
                  onClick={() => handleLoadPreset('hellcannon')}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-bold uppercase"
                >
                  Hellfire
                </button>
                <button
                  onClick={handleClearCanvas}
                  className="px-1.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 rounded text-[10px] font-bold uppercase flex items-center gap-1"
                >
                  <RotateCcw size={10} />
                </button>
              </div>
            </div>

            {/* Drawing Grid with Mouse & Touch support */}
            <div
              ref={gridContainerRef}
              className="grid gap-0.5 bg-neutral-900 p-2 rounded-lg border border-neutral-800 select-none cursor-crosshair touch-none"
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
              onMouseDown={() => setIsDrawing(true)}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
              onTouchStart={handleTouchMove}
              onTouchMove={handleTouchMove}
            >
              {pixels.map((row, r) =>
                row.map((color, c) => (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={() => paintPixel(r, c)}
                    onMouseEnter={() => isDrawing && paintPixel(r, c)}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-xs transition-colors border border-black/20"
                    style={{
                      backgroundColor: color === 'transparent' ? '#171717' : color,
                    }}
                  />
                ))
              )}
            </div>

            {/* Color Palette */}
            <div className="w-full">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Palette</span>
              <div className="grid grid-cols-7 gap-1">
                {PALETTE.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentColor(col)}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded border transition-all ${
                      currentColor === col ? 'scale-110 border-white ring-2 ring-yellow-400 z-10' : 'border-neutral-700'
                    }`}
                    style={{
                      backgroundColor: col === 'transparent' ? '#262626' : col,
                    }}
                    title={col === 'transparent' ? 'Eraser' : col}
                  >
                    {col === 'transparent' && <span className="text-[8px] text-neutral-400 font-bold">ERA</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Weapon Attributes & Live Test Fire */}
          <div className="flex-1 space-y-3.5 text-xs">
            {/* Weapon Name */}
            <div>
              <label className="font-bold text-neutral-300 block mb-1">Weapon Designation Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-yellow-300 font-bold focus:outline-none focus:border-yellow-400"
                placeholder="e.g. Hellfire Laser Destroyer"
              />
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950 p-3 border border-neutral-800 rounded-xl">
              {/* Damage */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-neutral-300">Base Damage</span>
                  <span className="text-red-400 font-bold">{damage} DMG</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="600"
                  step="5"
                  value={damage}
                  onChange={e => setDamage(parseInt(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Fire Rate */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-neutral-300">Fire Rate (Cooldown)</span>
                  <span className="text-yellow-400 font-bold">{fireRate}ms</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={fireRate}
                  onChange={e => setFireRate(parseInt(e.target.value))}
                  className="w-full accent-yellow-500 cursor-pointer"
                />
              </div>

              {/* Pellets */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-neutral-300">Pellets / Beams</span>
                  <span className="text-sky-400 font-bold">{pellets}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={pellets}
                  onChange={e => setPellets(parseInt(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Spread */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-neutral-300">Accuracy Spread</span>
                  <span className="text-neutral-400 font-bold">{(spread * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.25"
                  step="0.01"
                  value={spread}
                  onChange={e => setSpread(parseFloat(e.target.value))}
                  className="w-full accent-neutral-400 cursor-pointer"
                />
              </div>

              {/* Ammo Type */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-neutral-300">Ammunition Type</span>
                  <span className="text-yellow-400 font-bold uppercase">{ammoType}</span>
                </div>
                <select
                  value={ammoType}
                  onChange={e => setAmmoType(e.target.value as typeof ammoType)}
                  className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-xs"
                >
                  <option value="none">None (Infinite Ammo)</option>
                  <option value="bullets">Bullets (Standard)</option>
                  <option value="shells">Shotgun Shells</option>
                  <option value="rockets">Rockets (Explosive)</option>
                  <option value="cells">Energy Cells</option>
                </select>
              </div>

              {/* Ammo Per Shot & Recoil */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-neutral-300">Ammo Cost / Shot</span>
                  <span className="text-orange-400 font-bold">{ammoPerShot}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={ammoPerShot}
                  onChange={e => setAmmoPerShot(parseInt(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Projectile & Sound Type */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-neutral-300 block mb-1 flex items-center gap-1">
                  <Flame size={12} className="text-orange-400" /> Ballistics
                </label>
                <select
                  value={projectileType}
                  onChange={e => setProjectileType(e.target.value as typeof projectileType)}
                  className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200 text-xs focus:outline-none"
                >
                  <option value="hitscan">Hitscan Bullet (Instant)</option>
                  <option value="plasma">Cyan Plasma Bolt</option>
                  <option value="laser">Pink Demonic Laser</option>
                  <option value="flame">Napalm Flame Stream</option>
                  <option value="rocket">Explosive Rocket</option>
                  <option value="bfg">Cataclysmic BFG Orb</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1 flex items-center gap-1">
                  <Volume2 size={12} className="text-green-400" /> Audio Synth
                </label>
                <select
                  value={soundType}
                  onChange={e => setSoundType(e.target.value as typeof soundType)}
                  className="w-full px-2 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-200 text-xs focus:outline-none"
                >
                  <option value="laser">Futuristic Laser</option>
                  <option value="plasma">Plasma Bolt</option>
                  <option value="flame">Flamethrower</option>
                  <option value="shotgun">Heavy Shotgun Blast</option>
                  <option value="chaingun">Rapid Gatling</option>
                  <option value="rocket">Rocket Launcher</option>
                  <option value="bfg">BFG Blast</option>
                  <option value="pistol">Pistol Shot</option>
                </select>
              </div>
            </div>

            {/* Recoil Slider */}
            <div className="bg-neutral-950 p-2.5 border border-neutral-800 rounded-xl">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-neutral-300">Recoil Amount</span>
                <span className="text-yellow-400 font-bold">{Math.round(recoilAmount * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.4"
                step="0.02"
                value={recoilAmount}
                onChange={e => setRecoilAmount(parseFloat(e.target.value))}
                className="w-full accent-yellow-500 cursor-pointer"
              />
            </div>

            {/* Saved Custom Weapons Library */}
            {savedWeapons.length > 0 && (
              <div className="bg-neutral-950 p-2.5 border border-neutral-800 rounded-xl">
                <div className="text-[10px] text-neutral-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                  <Zap size={12} className="text-yellow-400" /> Saved Custom Arsenal
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {savedWeapons.map(w => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setName(w.name);
                        setDamage(w.damage);
                        setFireRate(w.fireRate);
                        setAmmoType(w.ammoType);
                        setPellets(w.pellets);
                        if (w.customPixelData) setPixels(w.customPixelData);
                      }}
                      className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[10px] text-yellow-300 flex items-center gap-1 font-bold"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Test Fire & Visual Preview */}
            <div className="bg-neutral-950 p-2.5 border border-neutral-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <canvas ref={previewCanvasRef} width={160} height={160} className="w-14 h-14 bg-neutral-900 rounded border border-neutral-700 object-contain" />
                <div>
                  <div className="font-black text-yellow-400 truncate max-w-[120px]">{name}</div>
                  <div className="text-[10px] text-neutral-400">
                    DPS: ~{Math.round((damage * pellets * 1000) / fireRate)} / sec
                  </div>
                </div>
              </div>

              <button
                onClick={handleTestFire}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-bold rounded-lg border border-neutral-600 flex items-center gap-1.5 shadow"
              >
                <Crosshair size={14} className="text-red-400" /> TEST FIRE
              </button>
            </div>

            {/* Save & Equip Button */}
            <div className="pt-1 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-bold uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndEquip}
                className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 active:scale-95 text-neutral-950 font-black rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-2 text-xs"
              >
                <Sparkles size={15} /> SAVE & EQUIP TO ARSENAL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
