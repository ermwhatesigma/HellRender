import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { PlayerStats } from '../types/game';
import { Trophy, Skull, Play, RotateCcw, Flame, Map, ChevronDown, ChevronUp } from 'lucide-react';

interface VictoryDefeatModalProps {
  mode: 'victory' | 'defeat' | null;
  stats: PlayerStats;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onSelectLevel: (levelId: string) => void;
  onOpenLevelSelect: () => void;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  mode,
  stats,
  hasNextLevel,
  onNextLevel,
  onRestart,
  onSelectLevel,
  onOpenLevelSelect,
}) => {
  const [showArenaPicker, setShowArenaPicker] = useState<boolean>(false);

  useEffect(() => {
    if (mode === 'victory') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
      });
    } else if (mode === 'defeat') {
      setShowArenaPicker(false);
    }
  }, [mode]);

  if (!mode) return null;

  const isVictory = mode === 'victory';

  // Stats calculations
  const minutes = Math.floor(stats.timeElapsed / 60);
  const seconds = Math.floor(stats.timeElapsed % 60);
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const killPercent = stats.totalEnemies > 0 ? Math.round((stats.kills / stats.totalEnemies) * 100) : 100;
  const secretPercent = stats.totalSecrets > 0 ? Math.round((stats.secretsFound / stats.totalSecrets) * 100) : 100;

  const handleAction = (action: () => void, e?: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    action();
  };

  const levelList = [
    { id: 'arena', title: 'THE MEAT GRINDER (SURVIVAL ARENA)', tag: 'Horde', color: 'text-purple-400 border-purple-600 bg-purple-950/60' },
    { id: 'e1m1', title: 'E1M1: PHOBOS OUTPOST', tag: 'Tech', color: 'text-green-400 border-green-600 bg-green-950/60' },
    { id: 'e1m2', title: 'E1M2: TOXIC REFINERY', tag: 'Slime', color: 'text-yellow-400 border-yellow-600 bg-yellow-950/60' },
    { id: 'e1m3', title: 'E1M3: CYBER HELLGATE', tag: 'Hell', color: 'text-red-400 border-red-600 bg-red-950/60' },
    { id: 'e1m4', title: 'E1M4: CONTAINMENT AREA', tag: 'Lab', color: 'text-orange-400 border-orange-600 bg-orange-950/60' },
    { id: 'e1m5', title: 'E1M5: TOWER OF BABEL', tag: 'Bosses', color: 'text-purple-400 border-purple-600 bg-purple-950/60' },
    { id: 'e1m6', title: 'E1M6: SUB-ZERO CRYO LAB', tag: 'Cryo', color: 'text-cyan-400 border-cyan-600 bg-cyan-950/60' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-mono"
      onPointerDown={e => e.stopPropagation()}
    >
      <div
        className={`border-2 sm:border-3 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center max-h-[95vh] overflow-y-auto ${
          isVictory ? 'bg-neutral-900 border-yellow-500' : 'bg-neutral-950 border-red-700'
        }`}
      >
        {isVictory ? (
          <>
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center text-yellow-400 mb-2 animate-bounce">
              <Trophy size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-yellow-400 uppercase tracking-widest mb-1">
              LEVEL COMPLETED!
            </h2>
            <p className="text-[11px] text-neutral-400 uppercase mb-4">Demonic Presence Purged</p>

            {/* Scoreboard */}
            <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-neutral-300">
                <span className="flex items-center gap-1.5"><Skull size={13} className="text-red-400" /> KILLS:</span>
                <span className="font-black text-red-400">{killPercent}% ({stats.kills}/{stats.totalEnemies})</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span className="flex items-center gap-1.5"><Flame size={13} className="text-purple-400" /> SECRETS:</span>
                <span className="font-black text-purple-400">{secretPercent}% ({stats.secretsFound}/{stats.totalSecrets})</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span>TIME ELAPSED:</span>
                <span className="font-black text-yellow-400">{formattedTime}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300 pt-2 border-t border-neutral-800 text-sm">
                <span className="font-bold text-neutral-200">TOTAL SCORE:</span>
                <span className="font-black text-yellow-300">{stats.score} PTS</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              {hasNextLevel ? (
                <button
                  onPointerDown={e => handleAction(onNextLevel, e)}
                  onClick={e => handleAction(onNextLevel, e)}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 active:scale-95 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yellow-950 transition cursor-pointer"
                >
                  <Play size={16} /> PROCEED TO NEXT LEVEL
                </button>
              ) : (
                <button
                  onPointerDown={e => handleAction(onOpenLevelSelect, e)}
                  onClick={e => handleAction(onOpenLevelSelect, e)}
                  className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 active:scale-95 text-white font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Trophy size={16} /> CAMPAIGN COMPLETED! MISSION SELECT
                </button>
              )}

              <button
                onPointerDown={e => handleAction(onRestart, e)}
                onClick={e => handleAction(onRestart, e)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw size={14} /> REPLAY LEVEL
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-red-950 border-2 border-red-600 flex items-center justify-center text-red-500 mb-2 animate-pulse">
              <Skull size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-red-600 uppercase tracking-widest mb-0.5 drop-shadow-md">
              YOU DIED
            </h2>
            <p className="text-[11px] text-neutral-400 uppercase mb-4">The Demons Claimed Your Soul</p>

            <div className="w-full space-y-2.5">
              {/* Respawn Button */}
              <button
                onPointerDown={e => handleAction(onRestart, e)}
                onClick={e => handleAction(onRestart, e)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition cursor-pointer"
              >
                <RotateCcw size={16} /> RESPAWN & RETRY
              </button>

              {/* Quick Arena / Level Switcher Toggle */}
              <button
                onPointerDown={e => handleAction(() => setShowArenaPicker(prev => !prev), e)}
                onClick={e => handleAction(() => setShowArenaPicker(prev => !prev), e)}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 active:scale-95 text-yellow-400 font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
              >
                <Map size={14} /> CHANGE ARENA OR MISSION {showArenaPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Dropdown Quick Arena / Level Picker */}
              {showArenaPicker && (
                <div className="w-full space-y-1.5 bg-neutral-950 p-2 border border-neutral-800 rounded-xl text-left max-h-48 overflow-y-auto">
                  {levelList.map(lvl => (
                    <button
                      key={lvl.id}
                      onPointerDown={e => handleAction(() => onSelectLevel(lvl.id), e)}
                      onClick={e => handleAction(() => onSelectLevel(lvl.id), e)}
                      className="w-full p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-600 rounded-lg flex items-center justify-between gap-2 transition active:scale-95 cursor-pointer text-left"
                    >
                      <span className="text-[11px] font-bold text-neutral-200 truncate">{lvl.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black uppercase shrink-0 ${lvl.color}`}>
                        {lvl.tag}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Full Level Select Modal Button */}
              <button
                onPointerDown={e => handleAction(onOpenLevelSelect, e)}
                onClick={e => handleAction(onOpenLevelSelect, e)}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 active:scale-95 text-neutral-400 font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                BROWSE FULL MISSION BRIEFING
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
