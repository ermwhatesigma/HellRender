import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LevelDefinition } from '../types/game';
import { ActiveEnemy } from '../core/EnemyController';
import { ZoomIn, ZoomOut, RotateCcw, X, Skull, Flame, Shield } from 'lucide-react';

interface MiniMapProps {
  level: LevelDefinition;
  playerPos: { x: number; z: number; yaw: number };
  enemies: ActiveEnemy[];
  isOpen: boolean;
  onClose: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  level,
  playerPos,
  enemies,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset view when opening map
  useEffect(() => {
    if (isOpen) {
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleClose = useCallback((e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  }, [onClose]);

  // Keyboard shortcut listener inside Map
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'Tab' || e.code === 'KeyM') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Center pan & zoom
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    const mapMaxDim = Math.max(level.width, level.height);
    const cellSize = (width - 40) / mapMaxDim;
    const offsetX = (width - level.width * cellSize) / 2;
    const offsetY = (height - level.height * cellSize) / 2;

    // 1. Draw Grid Tiles
    for (let gz = 0; gz < level.height; gz++) {
      for (let gx = 0; gx < level.width; gx++) {
        const cell = level.grid[gz]?.[gx];
        const x = offsetX + gx * cellSize;
        const y = offsetY + gz * cellSize;

        if (cell === 1 || cell === 2 || cell === 3 || cell === 8) {
          ctx.fillStyle = '#475569'; // Solid wall
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, cellSize, cellSize);
        } else if (cell === 5) {
          ctx.fillStyle = '#15803d'; // Acid
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (cell === 6) {
          ctx.fillStyle = '#b91c1c'; // Lava
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (cell === 7) {
          ctx.fillStyle = '#22c55e'; // Exit
          ctx.fillRect(x, y, cellSize, cellSize);
        } else {
          ctx.fillStyle = '#0f172a'; // Walkable Floor
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    // 2. Draw Doors
    level.doors.forEach(door => {
      const x = offsetX + door.x * cellSize;
      const y = offsetY + door.z * cellSize;
      const col = door.requiredKey === 'blue' 
        ? '#0284c7' 
        : door.requiredKey === 'yellow' 
        ? '#ca8a04' 
        : door.requiredKey === 'red' 
        ? '#dc2626' 
        : '#94a3b8';
      ctx.fillStyle = col;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    });

    // 3. Draw Pickups
    level.pickups.forEach(p => {
      if (!p.active) return;
      const px = offsetX + p.x * cellSize;
      const py = offsetY + p.z * cellSize;
      ctx.fillStyle = p.type.includes('key') ? '#fbbf24' : p.type.includes('weapon') ? '#38bdf8' : '#22c55e';
      ctx.beginPath();
      ctx.arc(px + cellSize / 2, py + cellSize / 2, Math.max(2, cellSize / 4), 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw Enemies (red/orange radar dots)
    enemies.forEach(e => {
      if (e.hp <= 0) return;
      const ex = offsetX + (e.x / 2) * cellSize;
      const ey = offsetY + (e.z / 2) * cellSize;
      ctx.fillStyle = e.type === 'cyberdemon' || e.type === 'baron' ? '#ef4444' : '#f97316';
      ctx.beginPath();
      ctx.arc(ex, ey, Math.max(3, cellSize / 3), 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Draw Player (Green Indicator + View Cone)
    const px = offsetX + (playerPos.x / 2) * cellSize;
    const py = offsetY + (playerPos.z / 2) * cellSize;

    // View cone
    const viewLen = cellSize * 5;
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    const coneAngle = Math.PI / 3;
    const pAngle = -playerPos.yaw - Math.PI / 2;
    ctx.arc(px, py, viewLen, pAngle - coneAngle / 2, pAngle + coneAngle / 2);
    ctx.closePath();
    ctx.fill();

    // Player Directional Arrow
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(pAngle + Math.PI / 2);
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -cellSize * 0.9);
    ctx.lineTo(cellSize * 0.7, cellSize * 0.7);
    ctx.lineTo(0, cellSize * 0.35);
    ctx.lineTo(-cellSize * 0.7, cellSize * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }, [level, playerPos, enemies, zoom, pan, isOpen]);

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMousePos.current.x;
    const dy = e.touches[0].clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(3.0, prev + 0.15));
    } else {
      setZoom(prev => Math.max(0.6, prev - 0.15));
    }
  };

  if (!isOpen) return null;

  const totalEnemies = level.enemies.length;
  const aliveEnemies = enemies.filter(e => e.hp > 0).length;
  const killedEnemies = totalEnemies - aliveEnemies;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-mono"
      onPointerDown={e => {
        if (e.target === e.currentTarget) handleClose(e);
      }}
    >
      <div
        className="bg-neutral-900 border-2 border-green-500 rounded-2xl max-w-xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
        onPointerDown={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <h2 className="text-sm sm:text-base font-black text-green-400 uppercase tracking-widest truncate">
              {level.title} - AUTOMAP
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onPointerDown={e => { e.preventDefault(); e.stopPropagation(); setZoom(prev => Math.min(3.0, prev + 0.2)); }}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 rounded text-neutral-200 shadow"
              title="Zoom In (+)"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onPointerDown={e => { e.preventDefault(); e.stopPropagation(); setZoom(prev => Math.max(0.6, prev - 0.2)); }}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 rounded text-neutral-200 shadow"
              title="Zoom Out (-)"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onPointerDown={e => { e.preventDefault(); e.stopPropagation(); setZoom(1.0); setPan({ x: 0, y: 0 }); }}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 rounded text-neutral-200 shadow"
              title="Reset View"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onPointerDown={handleClose}
              onClick={handleClose}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-lg uppercase flex items-center gap-1 ml-1 shadow cursor-pointer"
            >
              <X size={16} /> CLOSE (TAB)
            </button>
          </div>
        </div>

        {/* Map Canvas Area */}
        <div
          className="relative bg-neutral-950 p-2 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing flex-1 min-h-[280px] touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
        >
          <canvas
            ref={canvasRef}
            width={380}
            height={320}
            className="w-full max-w-[380px] h-auto aspect-square object-contain block"
          />
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-neutral-900/80 rounded border border-neutral-800 text-[10px] text-neutral-400 pointer-events-none">
            Zoom: {Math.round(zoom * 100)}% (Drag to Pan)
          </div>
        </div>

        {/* Mission Stats & Legend Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 space-y-2 text-xs">
          {/* Mission Progress Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-1.5 bg-neutral-900 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase flex items-center justify-center gap-1">
                <Skull size={10} className="text-red-400" /> KILLS
              </span>
              <span className="font-black text-red-400">{killedEnemies} / {totalEnemies}</span>
            </div>
            <div className="p-1.5 bg-neutral-900 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase flex items-center justify-center gap-1">
                <Flame size={10} className="text-purple-400" /> SECRETS
              </span>
              <span className="font-black text-purple-400">{level.secrets?.filter(s => s.found).length || 0} / {level.secrets?.length || 1}</span>
            </div>
            <div className="p-1.5 bg-neutral-900 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase flex items-center justify-center gap-1">
                <Shield size={10} className="text-yellow-400" /> PAR TIME
              </span>
              <span className="font-black text-yellow-400">{level.parTimeSeconds}s</span>
            </div>
          </div>

          {/* Interactive Color Legend & Big Close Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-neutral-900">
            <div className="grid grid-cols-4 gap-2 text-[10px] text-neutral-300 w-full sm:w-auto">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-sm" /> Player
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-sm" /> Demons
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-sm" /> Pickups
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Exit
              </div>
            </div>

            <button
              onPointerDown={handleClose}
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-1.5 bg-green-600 hover:bg-green-500 text-neutral-950 font-black text-xs rounded-lg uppercase tracking-wider transition active:scale-95 shadow cursor-pointer"
            >
              RESUME PLAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
