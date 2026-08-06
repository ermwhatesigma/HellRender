import React from 'react';
import { ALL_LEVELS } from '../core/LevelData';
import { Play, Flame, Wrench, X, Shield, Skull } from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (levelId: string) => void;
  onOpenLevelEditor: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  onOpenLevelEditor,
}) => {
  if (!isOpen) return null;

  const campaignLevels = [
    {
      id: 'e1m1',
      level: ALL_LEVELS['e1m1'],
      difficulty: 'Easy',
      badgeColor: 'text-green-400 border-green-500/40 bg-green-950/40',
      enemies: '14 Demons',
      desc: 'Tech military base infested with zombies and imps. Find the blue keycard to reach the exit.',
    },
    {
      id: 'e1m2',
      level: ALL_LEVELS['e1m2'],
      difficulty: 'Medium',
      badgeColor: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/40',
      enemies: '16 Demons',
      desc: 'Corrosive chemical refinery with toxic acid pits, yellow/red security locks, and flying cacodemons.',
    },
    {
      id: 'e1m3',
      level: ALL_LEVELS['e1m3'],
      difficulty: 'Hellish / Boss',
      badgeColor: 'text-red-400 border-red-500/40 bg-red-950/40',
      enemies: 'Boss Encounter',
      desc: 'Demonic cathedral over rivers of lava. Acquire the secret BFG 9000 and destroy the Cyberdemon Lord.',
    },
    {
      id: 'e1m4',
      level: ALL_LEVELS['e1m4'],
      difficulty: 'Hard',
      badgeColor: 'text-orange-400 border-orange-500/40 bg-orange-950/40',
      enemies: '14 Demons',
      desc: 'Decontaminate hazardous test chambers, acquire the Quad-Shotgun & Flamethrower, and clear the Baron squad.',
    },
    {
      id: 'e1m5',
      level: ALL_LEVELS['e1m5'],
      difficulty: 'Nightmare / Dual Boss',
      badgeColor: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
      enemies: 'Dual Cyber Titans',
      desc: 'Ascend the colossal demonic colosseum, unlock The Unmaker demonic artifact, and purge twin Cyber Titans.',
    },
    {
      id: 'e1m6',
      level: ALL_LEVELS['e1m6'],
      difficulty: 'Master Tier',
      badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
      enemies: '11 Super Demons',
      desc: 'Sub-zero cryo facility with high-velocity Cyberdemon & Baron squads. Find the secret Particle Railgun.',
    },
  ];

  const handleSelect = (levelId: string, e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onSelectLevel(levelId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-mono"
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="bg-neutral-900 border-2 border-red-700 rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800 mb-3">
          <div className="flex items-center gap-2.5">
            <Flame className="text-red-500" size={24} />
            <h2 className="text-base sm:text-xl font-black text-neutral-100 uppercase tracking-widest">
              MISSION BRIEFING / LEVEL SELECT
            </h2>
          </div>
          <button
            onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {/* Campaign Episodes */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              EPISODE 1: KNEE-DEEP IN THE DEAD (6 MISSIONS)
            </div>
            {campaignLevels.map(c => (
              <div
                key={c.id}
                className="bg-neutral-950 border border-neutral-800 hover:border-red-600/70 rounded-xl p-3 sm:p-3.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-neutral-100 group-hover:text-red-400 transition">
                      {c.level.title}
                    </h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${c.badgeColor}`}>
                      {c.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{c.desc}</p>
                  <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-0.5">
                    <span className="flex items-center gap-1"><Skull size={12} /> {c.enemies}</span>
                    <span className="flex items-center gap-1"><Shield size={12} /> Par: {c.level.parTimeSeconds}s</span>
                  </div>
                </div>

                <button
                  onPointerDown={e => handleSelect(c.id, e)}
                  onClick={e => handleSelect(c.id, e)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shrink-0 transition cursor-pointer"
                >
                  <Play size={13} /> DEPLOY
                </button>
              </div>
            ))}
          </div>

          {/* Survival Mode */}
          <div className="pt-2">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              SURVIVAL / HORDE ARENA
            </div>
            <div className="bg-gradient-to-r from-red-950/60 to-purple-950/60 border border-red-800/80 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-yellow-400">THE MEAT GRINDER (ARENA)</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-purple-500/40 bg-purple-950 text-purple-300 font-bold">
                    Endless Horde
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  Survive infinite demonic horde waves with respawning weapon, ammo, and armor supply caches!
                </p>
              </div>

              <button
                onPointerDown={e => handleSelect('arena', e)}
                onClick={e => handleSelect('arena', e)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shrink-0 transition cursor-pointer"
              >
                <Play size={13} /> ENTER ARENA
              </button>
            </div>
          </div>
        </div>

        {/* Custom Level Editor Launch Button */}
        <div className="pt-3 border-t border-neutral-800 mt-2 flex justify-end">
          <button
            onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onClose(); onOpenLevelEditor(); }}
            onClick={() => {
              onClose();
              onOpenLevelEditor();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Wrench size={15} className="text-yellow-400" /> CUSTOM 2D LEVEL EDITOR
          </button>
        </div>
      </div>
    </div>
  );
};
