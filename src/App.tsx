import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { LevelEditorModal } from './components/LevelEditorModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { WeaponCreatorModal } from './components/WeaponCreatorModal';
import { GameSettings, LevelDefinition, WeaponDef } from './types/game';
import { ALL_LEVELS } from './core/LevelData';
import { soundManager } from './audio/SoundSystem';

export function App() {
  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('e1m1');
  const [initialWeaponId, setInitialWeaponId] = useState<string>('pistol');
  const [isLevelEditorOpen, setIsLevelEditorOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isWeaponWorkshopOpen, setIsWeaponWorkshopOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings State with LocalStorage
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('doom_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return {
      brightness: 1.0,
      mouseSensitivity: 1.0,
      touchSensitivity: 1.2,
      gyroEnabled: false,
      gyroSensitivity: 1.0,
      invertY: false,
      soundVolume: 0.7,
      musicVolume: 0.5,
      fov: 75,
      resolutionScale: 'high',
      crtFilter: false,
      screenShake: true,
      bloodGore: 'high',
      showMinimap: false,
      showFps: false,
      autoReload: true,
      mobileLayout: 'default',
    };
  });

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('doom_settings', JSON.stringify(updated));
      soundManager.setVolumes(updated.soundVolume, updated.musicVolume);
      return updated;
    });
  };

  const handleResetDefaults = () => {
    const defaults: GameSettings = {
      brightness: 1.0,
      mouseSensitivity: 1.0,
      touchSensitivity: 1.2,
      gyroEnabled: false,
      gyroSensitivity: 1.0,
      invertY: false,
      soundVolume: 0.7,
      musicVolume: 0.5,
      fov: 75,
      resolutionScale: 'high',
      crtFilter: false,
      screenShake: true,
      bloodGore: 'high',
      showMinimap: false,
      showFps: false,
      autoReload: true,
      mobileLayout: 'default',
    };
    handleUpdateSettings(defaults);
  };

  const handleStartGame = (levelId: string = 'e1m1') => {
    setSelectedLevelId(levelId);
    setScreen('playing');
  };

  const handlePlayCustomLevel = (customLevel: LevelDefinition) => {
    ALL_LEVELS[customLevel.id] = customLevel;
    setSelectedLevelId(customLevel.id);
    setIsLevelEditorOpen(false);
    setScreen('playing');
  };

  const handleEquipCustomWeaponFromMenu = (weapon: WeaponDef) => {
    soundManager.playWeaponPickup();
    setInitialWeaponId(weapon.id);
    setSelectedLevelId('e1m1');
    setIsWeaponWorkshopOpen(false);
    setScreen('playing');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black font-sans select-none">
      {screen === 'menu' ? (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onOpenLevelEditor={() => setIsLevelEditorOpen(true)}
          onOpenWeaponWorkshop={() => setIsWeaponWorkshopOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <GameCanvas initialLevelId={selectedLevelId} initialWeaponId={initialWeaponId} />
      )}

      {/* Level Select Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        onClose={() => setIsLevelSelectOpen(false)}
        onSelectLevel={handleStartGame}
        onOpenLevelEditor={() => {
          setIsLevelSelectOpen(false);
          setIsLevelEditorOpen(true);
        }}
      />

      {/* Level Editor Modal */}
      <LevelEditorModal
        isOpen={isLevelEditorOpen}
        onClose={() => setIsLevelEditorOpen(false)}
        onPlayCustomLevel={handlePlayCustomLevel}
      />

      {/* Gun Creator Workshop Modal */}
      <WeaponCreatorModal
        isOpen={isWeaponWorkshopOpen}
        onClose={() => setIsWeaponWorkshopOpen(false)}
        onEquipCustomWeapon={handleEquipCustomWeaponFromMenu}
      />

      {/* Global Settings Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}

export default App;
