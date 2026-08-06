import React, { useState } from 'react';
import { GameSettings, PlayerStats } from '../types/game';
import { Settings, Volume2, Eye, Gamepad2, Sparkles, X, RotateCcw, Skull, Shield, Zap, Flame, Key, Heart } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetDefaults: () => void;
  playerStats?: PlayerStats;
  onApplyCheat?: (cheat: 'god' | 'all_weapons' | 'noclip' | 'one_hit_kill' | 'speed' | 'all_keys' | 'full_heal' | 'nuke_monsters') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onResetDefaults,
  playerStats,
  onApplyCheat,
}) => {
  const [tab, setTab] = useState<'controls' | 'audio' | 'graphics' | 'cheats' | 'keybindings'>('controls');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none font-mono">
      <div className="bg-neutral-900 border-2 border-red-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="text-red-500" size={22} />
            <h2 className="text-base sm:text-lg font-black text-neutral-100 uppercase tracking-wider">
              SYSTEM CONFIGURATION & CHEATS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/80 px-3 pt-2 gap-1.5 overflow-x-auto">
          {[
            { id: 'controls', label: 'Controls', icon: <Gamepad2 size={15} /> },
            { id: 'cheats', label: '💀 Cheat Matrix', icon: <Skull size={15} className="text-yellow-400" /> },
            { id: 'audio', label: 'Audio', icon: <Volume2 size={15} /> },
            { id: 'graphics', label: 'Graphics', icon: <Eye size={15} /> },
            { id: 'keybindings', label: 'Keys', icon: <Sparkles size={15} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-3.5 py-2 text-xs font-bold uppercase rounded-t-lg flex items-center gap-1.5 transition shrink-0 ${
                tab === t.id
                  ? 'bg-neutral-800 text-red-400 border-t-2 border-red-500 shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm text-neutral-300">
          {/* CHEATS TAB */}
          {tab === 'cheats' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
                <span className="font-black text-yellow-400 uppercase">⚡ UAC DEMONIC OVERRIDE TERMINAL:</span> Toggle instant combat enhancements and god-tier cheats.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* IDDQD - God Mode */}
                <button
                  onClick={() => onApplyCheat && onApplyCheat('god')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition active:scale-95 ${
                    playerStats?.isGodMode
                      ? 'bg-yellow-900/60 border-yellow-500 text-yellow-200 ring-2 ring-yellow-500/40'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-yellow-400 flex items-center gap-1.5">
                      <Shield size={14} /> IDDQD - GOD MODE
                    </div>
                    <div className="text-[11px] text-neutral-400">Total invulnerability to all damage</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${playerStats?.isGodMode ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    {playerStats?.isGodMode ? 'ACTIVE' : 'ENABLE'}
                  </span>
                </button>

                {/* IDKFA - Full Arsenal */}
                <button
                  onClick={() => onApplyCheat && onApplyCheat('all_weapons')}
                  className="p-3 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 rounded-xl text-left flex items-center justify-between gap-2 transition active:scale-95"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-sky-400 flex items-center gap-1.5">
                      <Zap size={14} /> IDKFA - ALL WEAPONS & MAX AMMO
                    </div>
                    <div className="text-[11px] text-neutral-400">Unlock all 12+ guns & refill ammo</div>
                  </div>
                  <span className="px-2 py-1 bg-sky-900 text-sky-200 rounded text-[10px] font-black uppercase">
                    UNLOCK
                  </span>
                </button>

                {/* IDCLIP - Ghost / No Clip */}
                <button
                  onClick={() => onApplyCheat && onApplyCheat('noclip')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition active:scale-95 ${
                    playerStats?.isNoClip
                      ? 'bg-purple-900/60 border-purple-500 text-purple-200 ring-2 ring-purple-500/40'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-purple-400 flex items-center gap-1.5">
                      <Sparkles size={14} /> IDCLIP - GHOST / NO-CLIP
                    </div>
                    <div className="text-[11px] text-neutral-400">Phase & walk through solid walls</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${playerStats?.isNoClip ? 'bg-purple-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    {playerStats?.isNoClip ? 'ACTIVE' : 'ENABLE'}
                  </span>
                </button>

                {/* IDDQD2 - One Hit Kill */}
                <button
                  onClick={() => onApplyCheat && onApplyCheat('one_hit_kill')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition active:scale-95 ${
                    playerStats?.isOneHitKill
                      ? 'bg-red-900/60 border-red-500 text-red-200 ring-2 ring-red-500/40'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-red-400 flex items-center gap-1.5">
                      <Flame size={14} /> ONE-HIT KILL / QUAD DMG
                    </div>
                    <div className="text-[11px] text-neutral-400">15x multiplier on all weapon damages</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${playerStats?.isOneHitKill ? 'bg-red-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    {playerStats?.isOneHitKill ? 'ACTIVE' : 'ENABLE'}
                  </span>
                </button>

                {/* IDBEHOLD - Speed Demon */}
                <button
                  onClick={() => onApplyCheat && onApplyCheat('speed')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition active:scale-95 ${
                    playerStats?.isSpeedBoost
                      ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-emerald-400 flex items-center gap-1.5">
                      <Zap size={14} /> IDBEHOLD - SPEED DEMON
                    </div>
                    <div className="text-[11px] text-neutral-400">2x sprint velocity</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${playerStats?.isSpeedBoost ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                    {playerStats?.isSpeedBoost ? 'ACTIVE' : 'ENABLE'}
                  </span>
                </button>

                {/* IDKEYS - Master Key */}
                <button
                  onClick={() => onApplyCheat && onApplyCheat('all_keys')}
                  className="p-3 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 rounded-xl text-left flex items-center justify-between gap-2 transition active:scale-95"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-yellow-400 flex items-center gap-1.5">
                      <Key size={14} /> IDKEYS - ALL SECURITY KEYS
                    </div>
                    <div className="text-[11px] text-neutral-400">Grant Blue, Yellow & Red keycards</div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-900 text-yellow-200 rounded text-[10px] font-black uppercase">
                    GRANT
                  </span>
                </button>

                {/* IDCHOP - Full Super Heal */}
                <button
                  onClick={() => onApplyCheat && onApplyCheat('full_heal')}
                  className="p-3 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 rounded-xl text-left flex items-center justify-between gap-2 transition active:scale-95"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-green-400 flex items-center gap-1.5">
                      <Heart size={14} /> IDCHOP - 200% SUPER HEAL
                    </div>
                    <div className="text-[11px] text-neutral-400">Restore 200 HP + 200 Armor instantly</div>
                  </div>
                  <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-[10px] font-black uppercase">
                    HEAL
                  </span>
                </button>

                {/* IDNUKE - Purge Demons */}
                <button
                  onClick={() => onApplyCheat && onApplyCheat('nuke_monsters')}
                  className="p-3 bg-neutral-950 hover:bg-red-950/40 border border-red-900/60 rounded-xl text-left flex items-center justify-between gap-2 transition active:scale-95"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-red-500 flex items-center gap-1.5">
                      <Skull size={14} /> IDNUKE - PURGE ALL DEMONS
                    </div>
                    <div className="text-[11px] text-neutral-400">Instantly eliminate all active enemies</div>
                  </div>
                  <span className="px-2 py-1 bg-red-900 text-red-200 rounded text-[10px] font-black uppercase">
                    PURGE
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* CONTROLS TAB */}
          {tab === 'controls' && (
            <div className="space-y-4">
              {/* Mouse Sensitivity */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-bold text-neutral-200">Mouse Aim Sensitivity</label>
                  <span className="text-red-400 font-bold">{settings.mouseSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={e => onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Touch Sensitivity */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-bold text-neutral-200">Touch Look Sensitivity</label>
                  <span className="text-red-400 font-bold">{settings.touchSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={settings.touchSensitivity}
                  onChange={e => onUpdateSettings({ touchSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              {/* Invert Y-Axis */}
              <div className="flex items-center justify-between py-2 border-t border-neutral-800">
                <div>
                  <div className="font-bold text-neutral-200">Invert Y-Axis</div>
                  <div className="text-xs text-neutral-400">Reverse pitch up/down direction</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.invertY}
                  onChange={e => onUpdateSettings({ invertY: e.target.checked })}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              {/* Gyroscope Controls */}
              <div className="flex items-center justify-between py-2 border-t border-neutral-800">
                <div>
                  <div className="font-bold text-neutral-200">Gyroscope Aiming (Mobile)</div>
                  <div className="text-xs text-neutral-400">Aim by physically tilting mobile device</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.gyroEnabled}
                  onChange={e => onUpdateSettings({ gyroEnabled: e.target.checked })}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>

              {/* Mobile Layout Preset */}
              <div className="py-2 border-t border-neutral-800">
                <label className="font-bold text-neutral-200 block mb-2">Touch Control Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['default', 'lefthanded', 'compact'] as const).map(layout => (
                    <button
                      key={layout}
                      onClick={() => onUpdateSettings({ mobileLayout: layout })}
                      className={`p-2 rounded-lg border text-xs uppercase font-bold transition ${
                        settings.mobileLayout === layout
                          ? 'bg-red-900/60 border-red-500 text-white'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                      }`}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIO TAB */}
          {tab === 'audio' && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-bold text-neutral-200">Sound Effects (SFX)</label>
                  <span className="text-red-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={e => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-bold text-neutral-200">Heavy Metal Synth BGM</label>
                  <span className="text-red-400 font-bold">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={e => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* GRAPHICS TAB */}
          {tab === 'graphics' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-bold text-neutral-200">Brightness / Gamma</label>
                  <span className="text-red-400 font-bold">{Math.round(settings.brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.1"
                  value={settings.brightness}
                  onChange={e => onUpdateSettings({ brightness: parseFloat(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-bold text-neutral-200">Field of View (FOV)</label>
                  <span className="text-red-400 font-bold">{settings.fov}°</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="110"
                  step="5"
                  value={settings.fov}
                  onChange={e => onUpdateSettings({ fov: parseInt(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-neutral-800">
                <div>
                  <div className="font-bold text-neutral-200">CRT Retro Scanlines Filter</div>
                  <div className="text-xs text-neutral-400">Simulate authentic 90s CRT monitor</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.crtFilter}
                  onChange={e => onUpdateSettings({ crtFilter: e.target.checked })}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* KEYBINDINGS TAB */}
          {tab === 'keybindings' && (
            <div className="space-y-3 text-xs">
              <div className="text-neutral-400 mb-2">Default PC Keyboard & Mouse Controls:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Move Forward/Back</span>
                  <span className="text-yellow-400 font-bold">W / S</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Strafe Left/Right</span>
                  <span className="text-yellow-400 font-bold">A / D</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Aim / Look</span>
                  <span className="text-yellow-400 font-bold">Mouse Look</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Primary Fire</span>
                  <span className="text-yellow-400 font-bold">Left Click / Space</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Interact / Open Door</span>
                  <span className="text-yellow-400 font-bold">E / F</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Reload Weapon</span>
                  <span className="text-yellow-400 font-bold">R</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Jump</span>
                  <span className="text-yellow-400 font-bold">Spacebar</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Switch Weapons</span>
                  <span className="text-yellow-400 font-bold">1 - 9 / Scroll</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Automap</span>
                  <span className="text-yellow-400 font-bold">TAB / M</span>
                </div>
                <div className="flex justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-neutral-400">Pause Game</span>
                  <span className="text-yellow-400 font-bold">ESC / P</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-between items-center">
          <button
            onClick={onResetDefaults}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-mono text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw size={14} /> RESET DEFAULTS
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-mono text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-md"
          >
            APPLY & RESUME
          </button>
        </div>
      </div>
    </div>
  );
};
