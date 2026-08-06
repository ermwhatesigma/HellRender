import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EnemyType, LevelDefinition, PickupType } from '../types/game';
import { Play, RotateCcw, X, Grid, Plus, Minus, Square, PaintBucket, Edit3, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/SoundSystem';

interface LevelEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayCustomLevel: (level: LevelDefinition) => void;
}

type DrawMode = 'pen' | 'room' | 'box' | 'fill' | 'eraser';

type ToolCategory = 'architecture' | 'doors_hazards' | 'enemies' | 'weapons_items';

export const LevelEditorModal: React.FC<LevelEditorModalProps> = ({
  isOpen,
  onClose,
  onPlayCustomLevel,
}) => {
  const [gridSize, setGridSize] = useState<number>(24);
  const [levelTitle, setLevelTitle] = useState<string>('CUSTOM DEMONIC FORTRESS');
  const [theme, setTheme] = useState<'tech' | 'toxic' | 'hell' | 'cryo'>('tech');
  const [parTime, setParTime] = useState<number>(120);

  // Tools & State
  const [drawMode, setDrawMode] = useState<DrawMode>('pen');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('architecture');
  const [activeTileValue, setActiveTileValue] = useState<number>(1); // 0: floor, 1: wall1, 2: wall2, 3: wall3, 5: acid, 6: lava, 7: exit, 8: secret_wall
  const [activePlacementType, setActivePlacementType] = useState<string>('wall');

  // Canvas Pan & Zoom
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef<boolean>(false);
  const isDrawing = useRef<boolean>(false);
  const startDragCoord = useRef<{ gx: number; gz: number }>({ gx: 0, gz: 0 });
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Level Matrix Data
  const [grid, setGrid] = useState<number[][]>(() => {
    const initial = Array(24).fill(0).map(() => Array(24).fill(0));
    for (let i = 0; i < 24; i++) {
      initial[0][i] = 1;
      initial[23][i] = 1;
      initial[i][0] = 1;
      initial[i][23] = 1;
    }
    return initial;
  });

  const [playerStart, setPlayerStart] = useState<{ x: number; z: number }>({ x: 2, z: 2 });
  const [entities, setEntities] = useState<{
    enemies: { id: string; x: number; z: number; type: EnemyType }[];
    pickups: { id: string; x: number; z: number; type: PickupType }[];
    barrels: { id: string; x: number; z: number }[];
    doors: { id: string; x: number; z: number; key?: 'blue' | 'yellow' | 'red'; isExit?: boolean }[];
  }>({
    enemies: [
      { id: 'e1', x: 8, z: 8, type: 'imp' },
      { id: 'e2', x: 12, z: 12, type: 'zombie' },
      { id: 'e3', x: 18, z: 18, type: 'demon' },
    ],
    pickups: [
      { id: 'p1', x: 3, z: 2, type: 'weapon_shotgun' },
      { id: 'p2', x: 4, z: 2, type: 'health_medium' },
      { id: 'p3', x: 10, z: 10, type: 'weapon_chaingun' },
    ],
    barrels: [{ id: 'b1', x: 6, z: 6 }, { id: 'b2', x: 14, z: 14 }],
    doors: [{ id: 'd1', x: 22, z: 22, isExit: true }],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resize Grid helper
  const handleSetGridSize = (newSize: number) => {
    if (newSize === gridSize) return;
    setGridSize(newSize);
    const newGrid = Array(newSize).fill(0).map(() => Array(newSize).fill(0));
    for (let r = 0; r < newSize; r++) {
      for (let c = 0; c < newSize; c++) {
        if (r === 0 || r === newSize - 1 || c === 0 || c === newSize - 1) {
          newGrid[r][c] = 1;
        } else if (r < grid.length && c < (grid[0]?.length || 0)) {
          newGrid[r][c] = grid[r][c];
        }
      }
    }
    setGrid(newGrid);
    // Filter entities within bounds
    setEntities(prev => ({
      enemies: prev.enemies.filter(e => e.x < newSize - 1 && e.z < newSize - 1),
      pickups: prev.pickups.filter(p => p.x < newSize - 1 && p.z < newSize - 1),
      barrels: prev.barrels.filter(b => b.x < newSize - 1 && b.z < newSize - 1),
      doors: prev.doors.filter(d => d.x < newSize - 1 && d.z < newSize - 1),
    }));
  };

  // Redraw Canvas
  const renderEditorCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    const cellSize = (width - 40) / gridSize;
    const offsetX = (width - gridSize * cellSize) / 2;
    const offsetY = (height - gridSize * cellSize) / 2;

    // 1. Draw Grid Tiles
    for (let gz = 0; gz < gridSize; gz++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const cell = grid[gz]?.[gx] || 0;
        const x = offsetX + gx * cellSize;
        const y = offsetY + gz * cellSize;

        if (cell === 1 || cell === 2 || cell === 3) {
          ctx.fillStyle = theme === 'hell' ? '#450a0a' : theme === 'cryo' ? '#0c4a6e' : theme === 'toxic' ? '#3f4e3c' : '#334155';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, cellSize, cellSize);
        } else if (cell === 8) {
          // Secret push wall
          ctx.fillStyle = '#6b21a8';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = '#c084fc';
          ctx.strokeRect(x, y, cellSize, cellSize);
        } else if (cell === 5) {
          // Acid
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (cell === 6) {
          // Lava
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (cell === 7) {
          // Exit
          ctx.fillStyle = '#059669';
          ctx.fillRect(x, y, cellSize, cellSize);
        } else {
          // Walkable Floor
          ctx.fillStyle = '#090d16';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }

    // 2. Draw Doors
    entities.doors.forEach(door => {
      const x = offsetX + door.x * cellSize;
      const y = offsetY + door.z * cellSize;
      const col = door.key === 'blue' ? '#0284c7' : door.key === 'yellow' ? '#ca8a04' : door.key === 'red' ? '#dc2626' : door.isExit ? '#10b981' : '#94a3b8';
      ctx.fillStyle = col;
      ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(8, cellSize * 0.4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(door.key ? '🔑' : '🚪', x + cellSize / 2, y + cellSize / 2);
    });

    // 3. Draw Barrels
    entities.barrels.forEach(barrel => {
      const x = offsetX + barrel.x * cellSize;
      const y = offsetY + barrel.z * cellSize;
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = `bold ${Math.max(8, cellSize * 0.4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛢️', x + cellSize / 2, y + cellSize / 2);
    });

    // 4. Draw Pickups
    entities.pickups.forEach(p => {
      const x = offsetX + p.x * cellSize;
      const y = offsetY + p.z * cellSize;
      ctx.fillStyle = p.type.includes('weapon') ? '#38bdf8' : p.type.includes('key') ? '#fbbf24' : '#22c55e';
      ctx.beginPath();
      ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(8, cellSize * 0.4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.type.includes('weapon') ? '🔫' : p.type.includes('key') ? '🔑' : '❤️', x + cellSize / 2, y + cellSize / 2);
    });

    // 5. Draw Enemies
    entities.enemies.forEach(e => {
      const x = offsetX + e.x * cellSize;
      const y = offsetY + e.z * cellSize;
      ctx.fillStyle = e.type === 'cyberdemon' || e.type === 'baron' ? '#ef4444' : '#f97316';
      ctx.beginPath();
      ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(8, cellSize * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.type === 'cyberdemon' ? '👹' : '👾', x + cellSize / 2, y + cellSize / 2);
    });

    // 6. Draw Player Spawn Point
    const px = offsetX + playerStart.x * cellSize;
    const py = offsetY + playerStart.z * cellSize;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.max(8, cellSize * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▲', px + cellSize / 2, py + cellSize / 2);

    ctx.restore();
  }, [grid, gridSize, theme, entities, playerStart, zoom, pan]);

  useEffect(() => {
    if (isOpen) {
      renderEditorCanvas();
    }
  }, [isOpen, renderEditorCanvas]);

  if (!isOpen) return null;

  // Grid Coordinate resolver from screen mouse/touch position
  const getGridCoordsFromEvent = (clientX: number, clientY: number): { gx: number; gz: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const width = canvas.width;
    const height = canvas.height;

    const screenX = ((clientX - rect.left) / rect.width) * width;
    const screenY = ((clientY - rect.top) / rect.height) * height;

    const centeredX = (screenX - (width / 2 + pan.x)) / zoom + width / 2;
    const centeredY = (screenY - (height / 2 + pan.y)) / zoom + height / 2;

    const cellSize = (width - 40) / gridSize;
    const offsetX = (width - gridSize * cellSize) / 2;
    const offsetY = (height - gridSize * cellSize) / 2;

    const gx = Math.floor((centeredX - offsetX) / cellSize);
    const gz = Math.floor((centeredY - offsetY) / cellSize);

    if (gx < 0 || gx >= gridSize || gz < 0 || gz >= gridSize) return null;
    return { gx, gz };
  };

  // Apply placement at grid coordinate
  const applyTilePlacement = (gx: number, gz: number) => {
    if (drawMode === 'eraser') {
      const next = grid.map(row => [...row]);
      next[gz][gx] = 0;
      setGrid(next);
      setEntities(prev => ({
        enemies: prev.enemies.filter(e => e.x !== gx || e.z !== gz),
        pickups: prev.pickups.filter(p => p.x !== gx || p.z !== gz),
        barrels: prev.barrels.filter(b => b.x !== gx || b.z !== gz),
        doors: prev.doors.filter(d => d.x !== gx || d.z !== gz),
      }));
      return;
    }

    if (activePlacementType === 'wall') {
      const next = grid.map(row => [...row]);
      next[gz][gx] = activeTileValue;
      setGrid(next);
    } else if (activePlacementType === 'hazard') {
      const next = grid.map(row => [...row]);
      next[gz][gx] = activeTileValue;
      setGrid(next);
    } else if (activePlacementType === 'player') {
      setPlayerStart({ x: gx, z: gz });
    } else if (activePlacementType === 'door') {
      const key = activeTileValue === 41 ? 'blue' : activeTileValue === 42 ? 'yellow' : activeTileValue === 43 ? 'red' : undefined;
      const isExit = activeTileValue === 44;
      const next = grid.map(row => [...row]);
      next[gz][gx] = isExit ? 7 : 4;
      setGrid(next);
      setEntities(prev => ({
        ...prev,
        doors: [...prev.doors.filter(d => d.x !== gx || d.z !== gz), { id: `d_${Date.now()}_${gx}_${gz}`, x: gx, z: gz, key, isExit }],
      }));
    } else if (activePlacementType === 'barrel') {
      setEntities(prev => ({
        ...prev,
        barrels: [...prev.barrels.filter(b => b.x !== gx || b.z !== gz), { id: `b_${Date.now()}_${gx}_${gz}`, x: gx, z: gz }],
      }));
    } else if (activePlacementType.startsWith('enemy_')) {
      const eType = activePlacementType.replace('enemy_', '') as EnemyType;
      setEntities(prev => ({
        ...prev,
        enemies: [...prev.enemies.filter(e => e.x !== gx || e.z !== gz), { id: `e_${Date.now()}_${gx}_${gz}`, x: gx, z: gz, type: eType }],
      }));
    } else if (activePlacementType.startsWith('pickup_')) {
      const pType = activePlacementType.replace('pickup_', '') as PickupType;
      setEntities(prev => ({
        ...prev,
        pickups: [...prev.pickups.filter(p => p.x !== gx || p.z !== gz), { id: `p_${Date.now()}_${gx}_${gz}`, x: gx, z: gz, type: pType }],
      }));
    }
  };

  // Mouse / Touch Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.button === 2 || e.shiftKey || e.altKey) {
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const coords = getGridCoordsFromEvent(e.clientX, e.clientY);
    if (!coords) return;

    isDrawing.current = true;
    startDragCoord.current = coords;

    if (drawMode === 'fill') {
      const targetVal = grid[coords.gz]?.[coords.gx] || 0;
      const next = grid.map(row => [...row]);
      const flood = (r: number, c: number) => {
        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;
        if (next[r][c] !== targetVal || next[r][c] === activeTileValue) return;
        next[r][c] = activeTileValue;
        flood(r + 1, c); flood(r - 1, c); flood(r, c + 1); flood(r, c - 1);
      };
      flood(coords.gz, coords.gx);
      setGrid(next);
      return;
    }

    if (drawMode === 'pen' || drawMode === 'eraser') {
      applyTilePlacement(coords.gx, coords.gz);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    if (!isDrawing.current) return;
    const coords = getGridCoordsFromEvent(e.clientX, e.clientY);
    if (!coords) return;

    if (drawMode === 'pen' || drawMode === 'eraser') {
      applyTilePlacement(coords.gx, coords.gz);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPanning.current = false;
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const coords = getGridCoordsFromEvent(e.clientX, e.clientY);
    if (!coords) return;

    if (drawMode === 'room') {
      const minX = Math.min(startDragCoord.current.gx, coords.gx);
      const maxX = Math.max(startDragCoord.current.gx, coords.gx);
      const minZ = Math.min(startDragCoord.current.gz, coords.gz);
      const maxZ = Math.max(startDragCoord.current.gz, coords.gz);

      const next = grid.map(row => [...row]);
      for (let r = minZ; r <= maxZ; r++) {
        for (let c = minX; c <= maxX; c++) {
          if (r === minZ || r === maxZ || c === minX || c === maxX) {
            next[r][c] = activeTileValue || 1;
          } else {
            next[r][c] = 0; // Hollow room inside
          }
        }
      }
      setGrid(next);
    } else if (drawMode === 'box') {
      const minX = Math.min(startDragCoord.current.gx, coords.gx);
      const maxX = Math.max(startDragCoord.current.gx, coords.gx);
      const minZ = Math.min(startDragCoord.current.gz, coords.gz);
      const maxZ = Math.max(startDragCoord.current.gz, coords.gz);

      const next = grid.map(row => [...row]);
      for (let r = minZ; r <= maxZ; r++) {
        for (let c = minX; c <= maxX; c++) {
          next[r][c] = activeTileValue;
        }
      }
      setGrid(next);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(2.5, prev + 0.15));
    } else {
      setZoom(prev => Math.max(0.5, prev - 0.15));
    }
  };

  // Procedural Generator (Maze / Arena)
  const handleGenerateArena = () => {
    const next = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (r === 0 || r === gridSize - 1 || c === 0 || c === gridSize - 1) {
          next[r][c] = 1;
        } else if ((r % 4 === 0 && c % 4 === 0) || (r % 6 === 0 && c % 6 === 0)) {
          next[r][c] = 1;
        } else if (r === Math.floor(gridSize / 2) && c === Math.floor(gridSize / 2)) {
          next[r][c] = 6; // Lava core
        }
      }
    }
    setGrid(next);
    setPlayerStart({ x: 3, z: 3 });
  };

  const handleClearMap = () => {
    const fresh = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    for (let i = 0; i < gridSize; i++) {
      fresh[0][i] = 1;
      fresh[gridSize - 1][i] = 1;
      fresh[i][0] = 1;
      fresh[i][gridSize - 1] = 1;
    }
    setGrid(fresh);
    setEntities({ enemies: [], pickups: [], barrels: [], doors: [] });
    setPlayerStart({ x: 2, z: 2 });
  };

  // Launch 3D Play
  const handlePlayLevel = () => {
    soundManager.playWeaponPickup();
    const customLevel: LevelDefinition = {
      id: 'custom_' + Date.now(),
      title: levelTitle.trim() || 'CUSTOM DEMONIC LEVEL',
      subtitle: `${gridSize}x${gridSize} Demonic Fortress`,
      theme,
      width: gridSize,
      height: gridSize,
      parTimeSeconds: parTime,
      playerStart: { x: playerStart.x, z: playerStart.z, angle: 0 },
      grid,
      doors: entities.doors.map((d, i) => ({
        id: `cd_${i}`,
        x: d.x,
        z: d.z,
        state: 'closed',
        progress: 0,
        requiredKey: d.key,
        isExitDoor: d.isExit,
        orientation: 'horizontal',
      })),
      barrels: entities.barrels.map((b, i) => ({
        id: `cb_${i}`,
        x: b.x,
        z: b.z,
        hp: 20,
        exploded: false,
      })),
      switches: [],
      teleporters: [],
      pickups: entities.pickups.map((p, i) => ({
        id: `cp_${i}`,
        type: p.type,
        x: p.x,
        z: p.z,
        active: true,
      })),
      enemies: entities.enemies.map((e, i) => ({
        id: `ce_${i}`,
        type: e.type,
        x: e.x,
        z: e.z,
      })),
      secrets: [
        { id: 'cs1', x: 1, z: 1, width: 4, depth: 4, found: false, message: 'SECRET CHAMBER DISCOVERED!' }
      ],
    };

    onPlayCustomLevel(customLevel);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-mono">
      <div className="bg-neutral-900 border-2 border-yellow-500 rounded-2xl max-w-6xl w-full p-3 sm:p-4 shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-2.5 border-b border-neutral-800 mb-2">
          <div className="flex items-center gap-2">
            <Grid className="text-yellow-400" size={22} />
            <h2 className="text-sm sm:text-base font-black text-neutral-100 uppercase tracking-widest truncate">
              2D HELLRENDER MAP BUILDER & LEVEL FORGE
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Grid Size Buttons */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {[
                { size: 16, label: '16x16' },
                { size: 24, label: '24x24' },
                { size: 32, label: '32x32' },
                { size: 40, label: '40x40' },
              ].map(s => (
                <button
                  key={s.size}
                  onClick={() => handleSetGridSize(s.size)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                    gridSize === s.size ? 'bg-yellow-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden">
          {/* Center Canvas Area */}
          <div className="flex-1 flex flex-col bg-neutral-950 p-2 border border-neutral-800 rounded-xl overflow-hidden relative">
            {/* Tool Modes Strip */}
            <div className="flex items-center justify-between gap-2 mb-2 z-10">
              <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-lg border border-neutral-700 shadow">
                <button
                  onClick={() => setDrawMode('pen')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    drawMode === 'pen' ? 'bg-yellow-500 text-black' : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                  title="Pencil / Single Placement"
                >
                  <Edit3 size={13} /> Pencil
                </button>
                <button
                  onClick={() => setDrawMode('room')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    drawMode === 'room' ? 'bg-yellow-500 text-black' : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                  title="Draw 4-Wall Room Box"
                >
                  <Square size={13} /> Room Tool
                </button>
                <button
                  onClick={() => setDrawMode('box')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    drawMode === 'box' ? 'bg-yellow-500 text-black' : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                  title="Filled Box Tool"
                >
                  <Square size={13} className="fill-current" /> Fill Box
                </button>
                <button
                  onClick={() => setDrawMode('fill')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    drawMode === 'fill' ? 'bg-yellow-500 text-black' : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                  title="Flood Fill Bucket"
                >
                  <PaintBucket size={13} /> Flood Fill
                </button>
                <button
                  onClick={() => setDrawMode('eraser')}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    drawMode === 'eraser' ? 'bg-red-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                  title="Eraser Tool"
                >
                  Eraser
                </button>
              </div>

              {/* Zoom & Quick Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoom(prev => Math.min(2.5, prev + 0.2))}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-300"
                  title="Zoom In"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-300"
                  title="Zoom Out"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-300"
                  title="Reset Pan & Zoom"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={handleGenerateArena}
                  className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-300 rounded text-[11px] font-bold flex items-center gap-1 shadow"
                  title="Generate Procedural Arena"
                >
                  <Sparkles size={12} /> Auto Arena
                </button>
                <button
                  onClick={handleClearMap}
                  className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[11px] font-bold shadow"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Interactive Grid Canvas */}
            <div
              className="flex-1 w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair relative touch-none bg-neutral-950"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
            >
              <canvas ref={canvasRef} width={560} height={560} className="w-full h-full max-w-[560px] max-h-[560px] object-contain aspect-square block" />
            </div>

            <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1.5 border-t border-neutral-900">
              <span>Drag to draw / Right-click or Shift+Drag to Pan / Scroll to Zoom</span>
              <span>Map: {gridSize}x{gridSize} Tiles | Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Right Palette & Properties Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-3 font-mono text-xs overflow-y-auto pr-1">
            {/* Level Settings Box */}
            <div className="bg-neutral-950 p-3 border border-neutral-800 rounded-xl space-y-2.5">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Mission Title</label>
                <input
                  type="text"
                  value={levelTitle}
                  onChange={e => setLevelTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-yellow-300 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Theme</label>
                  <select
                    value={theme}
                    onChange={e => setTheme(e.target.value as typeof theme)}
                    className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-xs"
                  >
                    <option value="tech">Tech Outpost</option>
                    <option value="toxic">Toxic Refinery</option>
                    <option value="hell">Hell Demonic</option>
                    <option value="cryo">Sub-Zero Cryo</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Par Time (s)</label>
                  <input
                    type="number"
                    value={parTime}
                    onChange={e => setParTime(parseInt(e.target.value) || 60)}
                    className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[10px] font-bold">
              {[
                { id: 'architecture', label: 'Walls' },
                { id: 'doors_hazards', label: 'Doors' },
                { id: 'enemies', label: 'Demons' },
                { id: 'weapons_items', label: 'Arsenal' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as ToolCategory)}
                  className={`py-1.5 rounded uppercase transition ${
                    activeCategory === tab.id ? 'bg-yellow-500 text-black shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Elements Palette */}
            <div className="flex-1 bg-neutral-950 p-3 border border-neutral-800 rounded-xl space-y-2 max-h-[35vh] overflow-y-auto">
              {activeCategory === 'architecture' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'wall', val: 1, label: '🧱 Solid Wall', type: 'wall' },
                    { id: 'secret_wall', val: 8, label: '🔮 Secret Wall', type: 'wall' },
                    { id: 'acid', val: 5, label: '🧪 Acid Pit', type: 'hazard' },
                    { id: 'lava', val: 6, label: '🔥 Lava Hazard', type: 'hazard' },
                    { id: 'floor', val: 0, label: '⬛ Floor Walkway', type: 'hazard' },
                    { id: 'player_spawn', val: 99, label: '▲ Player Start', type: 'player' },
                    { id: 'barrel_prop', val: 98, label: '🛢️ Barrel Prop', type: 'barrel' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePlacementType(item.type);
                        setActiveTileValue(item.val);
                      }}
                      className={`p-2 rounded border text-left text-[11px] font-bold transition ${
                        activePlacementType === item.type && activeTileValue === item.val
                          ? 'bg-yellow-500 text-black border-yellow-400 shadow'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {activeCategory === 'doors_hazards' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'door_norm', val: 4, label: '🚪 Standard Door', type: 'door' },
                    { id: 'door_blue', val: 41, label: '🔑 Blue Key Door', type: 'door' },
                    { id: 'door_yellow', val: 42, label: '🔑 Yellow Door', type: 'door' },
                    { id: 'door_red', val: 43, label: '🔑 Red Key Door', type: 'door' },
                    { id: 'door_exit', val: 44, label: '🏁 Exit Elevator', type: 'door' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePlacementType(item.type);
                        setActiveTileValue(item.val);
                      }}
                      className={`p-2 rounded border text-left text-[11px] font-bold transition ${
                        activePlacementType === item.type && activeTileValue === item.val
                          ? 'bg-yellow-500 text-black border-yellow-400 shadow'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {activeCategory === 'enemies' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'enemy_zombie', label: '🧟 Zombie Soldier' },
                    { id: 'enemy_imp', label: '🔥 Imp' },
                    { id: 'enemy_demon', label: '🐂 Pinky Demon' },
                    { id: 'enemy_lostsoul', label: '💀 Lost Soul' },
                    { id: 'enemy_cacodemon', label: '👁️ Cacodemon' },
                    { id: 'enemy_baron', label: '👹 Baron of Hell' },
                    { id: 'enemy_cyberdemon', label: '🤖 Cyberdemon Titan' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePlacementType(item.id);
                        setActiveTileValue(50);
                      }}
                      className={`p-2 rounded border text-left text-[11px] font-bold transition ${
                        activePlacementType === item.id
                          ? 'bg-red-600 text-white border-red-400 shadow'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {activeCategory === 'weapons_items' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'pickup_weapon_shotgun', label: '🔫 Shotgun' },
                    { id: 'pickup_weapon_supershotgun', label: '🔫 Super Shotgun' },
                    { id: 'pickup_weapon_quadshotgun', label: '🔫 Quad Shotgun' },
                    { id: 'pickup_weapon_chaingun', label: '🔫 Chaingun' },
                    { id: 'pickup_weapon_rocketlauncher', label: '🚀 Rocket Launcher' },
                    { id: 'pickup_weapon_flamethrower', label: '🔥 Flamethrower' },
                    { id: 'pickup_weapon_plasmarifle', label: '⚡ Plasma Rifle' },
                    { id: 'pickup_weapon_railgun', label: '✨ Particle Railgun' },
                    { id: 'pickup_weapon_unmaker', label: '🔮 The Unmaker' },
                    { id: 'pickup_weapon_bfg9000', label: '💥 BFG 9000' },
                    { id: 'pickup_health_medium', label: '❤️ Medkit (+25)' },
                    { id: 'pickup_health_mega', label: '💖 Mega Sphere (+100)' },
                    { id: 'pickup_armor_green', label: '🛡️ Green Armor (+100)' },
                    { id: 'pickup_armor_blue', label: '🛡️ Mega Armor (+200)' },
                    { id: 'pickup_key_blue', label: '🔑 Blue Keycard' },
                    { id: 'pickup_key_yellow', label: '🔑 Yellow Keycard' },
                    { id: 'pickup_key_red', label: '🔑 Red Keycard' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePlacementType(item.id);
                        setActiveTileValue(60);
                      }}
                      className={`p-2 rounded border text-left text-[11px] font-bold transition ${
                        activePlacementType === item.id
                          ? 'bg-sky-600 text-white border-sky-400 shadow'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Launch Game Button */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handlePlayLevel}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 active:scale-95 text-neutral-950 font-black text-xs rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={16} /> PLAY LEVEL NOW IN 3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
