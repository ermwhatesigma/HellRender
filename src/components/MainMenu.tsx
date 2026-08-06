import React, { useState } from 'react';
import { Play, Flame, Wrench, Settings, BookOpen, Volume2, VolumeX, Skull, Crosshair, Sparkles, Map } from 'lucide-react';
import { soundManager } from '../audio/SoundSystem';

interface MainMenuProps {
  onStartGame: (levelId: string) => void;
  onOpenLevelSelect: () => void;
  onOpenLevelEditor: () => void;
  onOpenWeaponWorkshop: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenLevelEditor,
  onOpenWeaponWorkshop,
  onOpenSettings,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleStart = (levelId: string = 'e1m1') => {
    soundManager.playWeaponPickup();
    onStartGame(levelId);
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 flex flex-col items-center justify-between p-4 sm:p-6 select-none font-mono text-neutral-200">
      {/* Background Hell Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/40 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.18)_0,transparent_70%)] pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-xs text-red-500 font-bold tracking-widest uppercase">
          <Flame size={18} className="animate-pulse" /> UAC COMBAT SIMULATOR v3.2
        </div>
        <button
          onClick={toggleSound}
          className="p-2 sm:p-2.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 transition active:scale-95 flex items-center gap-2 text-xs"
        >
          {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-green-400" />}
          <span className="hidden sm:inline">{isMuted ? 'UNMUTE AUDIO' : 'AUDIO ACTIVE'}</span>
        </button>
      </div>

      {/* Hero Title */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        <div className="relative mb-2">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-orange-500 to-yellow-500 drop-shadow-[0_10px_20px_rgba(239,68,68,0.5)]">
            HELLRENDER
          </h1>
          <div className="text-xs sm:text-sm md:text-base font-black text-red-400 tracking-[0.3em] uppercase mt-1">
            RETRO 3D FPS CHRONICLES
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-5 leading-relaxed px-4">
          Choose your mission, create custom weapons, or forge massive 2D levels in authentic 90s FPS action.
        </p>

        {/* Menu Buttons */}
        <div className="w-full max-w-xs space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStart('e1m1')}
              className="py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl shadow-red-950/60 transition group"
            >
              <Play size={16} className="group-hover:scale-110 transition" /> QUICK PLAY
            </button>

            <button
              onClick={onOpenLevelSelect}
              className="py-3 bg-red-950/80 hover:bg-red-900 border border-red-700/80 active:scale-95 text-red-200 font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition"
            >
              <Map size={16} className="text-red-400" /> SELECT LEVEL
            </button>
          </div>

          <button
            onClick={() => handleStart('arena')}
            className="w-full py-2.5 bg-purple-900/80 hover:bg-purple-800 border border-purple-600/70 active:scale-95 text-purple-200 font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <Skull size={15} className="text-purple-400" /> SURVIVAL HORDE ARENA
          </button>

          <button
            onClick={onOpenWeaponWorkshop}
            className="w-full py-2.5 bg-yellow-950/70 hover:bg-yellow-900/80 border border-yellow-600/70 active:scale-95 text-yellow-300 font-black text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow transition"
          >
            <Sparkles size={15} className="text-yellow-400 animate-spin" /> CUSTOM GUN WORKSHOP
          </button>

          <button
            onClick={onOpenLevelEditor}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 active:scale-95 text-neutral-200 font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <Wrench size={15} className="text-neutral-400" /> 2D LEVEL DESIGNER
          </button>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={onOpenSettings}
              className="py-2 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 active:scale-95 text-neutral-300 font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
            >
              <Settings size={14} /> SETTINGS & CHEATS
            </button>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="py-2 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 active:scale-95 text-neutral-300 font-bold text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
            >
              <BookOpen size={14} /> HOW TO PLAY
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-500 z-10 gap-2 border-t border-neutral-900 pt-3">
        <div className="flex items-center gap-4">
          <span>🎮 PC Keyboard & Mouse</span>
          <span>📱 Touch Controls & Joystick</span>
          <span>🧭 Gyroscope Sensor</span>
        </div>
        <div>Engineered with Three.js & Web Audio API</div>
      </div>

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-red-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="text-base font-black text-red-500 uppercase tracking-wider flex items-center gap-2">
                <Crosshair size={18} /> COMBAT PROTOCOLS
              </h3>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold uppercase"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <span className="font-bold text-yellow-400">Desktop Controls:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-neutral-400">
                  <li><strong className="text-neutral-200">WASD:</strong> Movement (Forward, Back, Strafe)</li>
                  <li><strong className="text-neutral-200">Mouse:</strong> Look around (Click screen to lock mouse)</li>
                  <li><strong className="text-neutral-200">Left Mouse / Space:</strong> Fire weapon</li>
                  <li><strong className="text-neutral-200">R:</strong> Reload</li>
                  <li><strong className="text-neutral-200">E / F:</strong> Open Doors & Activate Switches</li>
                  <li><strong className="text-neutral-200">1-9 / Scroll Wheel:</strong> Switch weapons</li>
                  <li><strong className="text-neutral-200">TAB / M:</strong> Automap radar (Press TAB/M or ESC to close)</li>
                  <li><strong className="text-neutral-200">ESC / P:</strong> Pause & Cheats Menu</li>
                </ul>
              </div>

              <div>
                <span className="font-bold text-yellow-400">Mobile & Touch Controls:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-neutral-400">
                  <li><strong className="text-neutral-200">Left Joystick:</strong> 360° Movement</li>
                  <li><strong className="text-neutral-200">Right Screen Drag:</strong> Aim & camera view</li>
                  <li><strong className="text-neutral-200">Action Buttons:</strong> Fire, Reload, Jump, Use</li>
                  <li><strong className="text-neutral-200">Weapon Switcher:</strong> Tap eye icon to hide/show weapon bar</li>
                  <li><strong className="text-neutral-200">Gyroscope:</strong> Tilt device to fine-aim</li>
                </ul>
              </div>

              <div>
                <span className="font-bold text-yellow-400">Demonic Cheats Available:</span>
                <p className="text-neutral-400 mt-1">
                  Open Settings / Pause menu and click the <strong>💀 CHEAT MATRIX</strong> tab to toggle God Mode (IDDQD), Unlock All Weapons (IDKFA), Walk through walls Ghost Mode (IDCLIP), Speed Demon, and Nuke all demons!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition cursor-pointer"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
