import React from 'react';
import { Play, RotateCcw, Settings, Grid, ShieldAlert, Sparkles } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  isGodMode: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenLevelSelect: () => void;
  onOpenWeaponWorkshop: () => void;
  onToggleGodMode: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  isGodMode,
  onResume,
  onRestart,
  onOpenSettings,
  onOpenLevelSelect,
  onOpenWeaponWorkshop,
  onToggleGodMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border-2 border-red-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-3xl font-black font-mono text-red-500 tracking-widest uppercase mb-1 drop-shadow-md">
          GAME PAUSED
        </h2>
        <p className="text-xs font-mono text-neutral-400 mb-5 uppercase">Mission On Hold</p>

        <div className="w-full space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-mono font-bold text-sm rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition"
          >
            <Play size={18} /> RESUME MISSION
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-mono font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <RotateCcw size={15} /> RESTART LEVEL
          </button>

          <button
            onClick={onOpenWeaponWorkshop}
            className="w-full py-2.5 bg-yellow-950/70 hover:bg-yellow-900 border border-yellow-600/70 active:scale-95 text-yellow-300 font-mono font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition shadow"
          >
            <Sparkles size={15} className="text-yellow-400" /> CUSTOM GUN WORKSHOP
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-mono font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <Settings size={15} /> SETTINGS & CHEAT MATRIX
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-mono font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <Grid size={15} /> LEVEL SELECT & EDITOR
          </button>

          <button
            onClick={onToggleGodMode}
            className={`w-full py-2 border rounded-xl font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
              isGodMode
                ? 'bg-yellow-900/60 border-yellow-500 text-yellow-300'
                : 'bg-neutral-950/60 border-neutral-800 text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <ShieldAlert size={14} /> IDDQD GOD MODE: {isGodMode ? 'ACTIVE' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};
