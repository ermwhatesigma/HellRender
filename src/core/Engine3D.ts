import * as THREE from 'three';
import { GameSettings, LevelDefinition, PickupItem, PlayerStats, WeaponType } from '../types/game';
import { soundManager } from '../audio/SoundSystem';
import { textureManager } from '../textures/TextureGenerator';
import { CollisionSystem } from './CollisionSystem';
import { ParticleSystem } from './ParticleSystem';
import { ProjectileSystem } from './ProjectileSystem';
import { EnemyController, ActiveEnemy } from './EnemyController';
import { WEAPON_REGISTRY } from './WeaponSystem';

export class Engine3D {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private domElement: HTMLElement;

  // Subsystems
  public collision: CollisionSystem;
  public particles: ParticleSystem;
  public projectiles: ProjectileSystem;
  public enemies: EnemyController;

  // Level data & Meshes
  public currentLevel: LevelDefinition;
  private wallMeshes: THREE.Mesh[] = [];
  private doorMeshes: Map<string, THREE.Mesh> = new Map();
  private pickupMeshes: Map<string, THREE.Sprite> = new Map();
  private barrelMeshes: Map<string, THREE.Mesh> = new Map();
  private floorMesh: THREE.Mesh | null = null;
  private ceilingMesh: THREE.Mesh | null = null;
  private skyMesh: THREE.Mesh | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private dynamicLights: THREE.PointLight[] = [];

  // Player Physics & Transform
  public playerPos: THREE.Vector3 = new THREE.Vector3(2, 0.8, 2);
  public playerYaw: number = 0; // Rotation around Y
  public playerPitch: number = 0; // Pitch up/down
  public playerVelocity: THREE.Vector3 = new THREE.Vector3();
  public isGrounded: boolean = true;
  private playerHeight: number = 0.8;
  private playerRadius: number = 0.35;
  private bobbingTimer: number = 0;
  public bobbingOffset: THREE.Vector2 = new THREE.Vector2();

  // Screen shake & screen flash
  public screenShakeAmount: number = 0;
  public damageFlashAmount: number = 0;
  public pickupFlashAmount: number = 0;

  // Weapon firing & state
  public lastFireTime: number = 0;
  public isFiring: boolean = false;
  public isReloading: boolean = false;
  public reloadProgress: number = 0;
  public recoilOffset: THREE.Vector3 = new THREE.Vector3();
  public currentStats?: PlayerStats;
  public isNoClip: boolean = false;

  // Input states
  public keys: Record<string, boolean> = {};
  public joystickVector: THREE.Vector2 = new THREE.Vector2();
  public touchLookDelta: THREE.Vector2 = new THREE.Vector2();
  public gyroDelta: THREE.Vector2 = new THREE.Vector2();

  // Settings & Callbacks
  public settings: GameSettings;
  private onStatsUpdate?: (stats: (prev: PlayerStats) => PlayerStats) => void;
  private onNotification?: (text: string, icon?: string) => void;
  private onLevelComplete?: () => void;
  private onGameOver?: () => void;
  public onHitEnemyCallback?: () => void;

  private isDisposed: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = performance.now();

  constructor(
    domElement: HTMLElement,
    level: LevelDefinition,
    settings: GameSettings,
    callbacks: {
      onStatsUpdate: (stats: (prev: PlayerStats) => PlayerStats) => void;
      onNotification: (text: string, icon?: string) => void;
      onLevelComplete: () => void;
      onGameOver: () => void;
    }
  ) {
    this.domElement = domElement;
    this.currentLevel = level;
    this.settings = settings;
    this.onStatsUpdate = callbacks.onStatsUpdate;
    this.onNotification = callbacks.onNotification;
    this.onLevelComplete = callbacks.onLevelComplete;
    this.onGameOver = callbacks.onGameOver;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(
      level.theme === 'hell' ? 0x220505 : level.theme === 'toxic' ? 0x062010 : 0x090d16,
      0.035
    );

    this.camera = new THREE.PerspectiveCamera(
      settings.fov,
      domElement.clientWidth / domElement.clientHeight,
      0.1,
      100
    );

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(domElement.clientWidth, domElement.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.resolutionScale === 'low' ? 1 : 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = settings.brightness;
    domElement.appendChild(this.renderer.domElement);

    // 3. Subsystems
    this.collision = new CollisionSystem(level);
    this.particles = new ParticleSystem(this.scene);
    this.projectiles = new ProjectileSystem(this.scene, this.collision, this.particles);
    this.enemies = new EnemyController(this.scene, this.collision, this.projectiles, this.particles);

    this.enemies.setOnEnemyKilled((enemy: ActiveEnemy, drop) => {
      if (this.onStatsUpdate) {
        this.onStatsUpdate(prev => ({
          ...prev,
          kills: prev.kills + 1,
          score: prev.score + enemy.def.scoreValue,
        }));
      }

      if (drop) {
        this.spawnPickupItem(drop, enemy.x, enemy.z);
      }
    });

    // 4. Build Level World
    this.buildLevel(level);

    // 5. Start Game Loop
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public setLevel(level: LevelDefinition) {
    const freshLevel: LevelDefinition = JSON.parse(JSON.stringify(level));
    this.currentLevel = freshLevel;
    this.collision.setLevel(freshLevel);
    this.projectiles.setCollision(this.collision);
    this.enemies.setCollision(this.collision);
    this.damageFlashAmount = 0;
    this.pickupFlashAmount = 0;
    this.screenShakeAmount = 0;
    this.buildLevel(freshLevel);
  }

  public setSettings(settings: GameSettings) {
    this.settings = settings;
    this.camera.fov = settings.fov;
    this.camera.updateProjectionMatrix();
    
    // Dynamic Gamma & Fullbright lighting
    const gamma = Math.max(0.4, settings.brightness);
    this.renderer.toneMappingExposure = gamma;
    if (this.ambientLight) {
      this.ambientLight.intensity = 1.0 * gamma;
    }
    if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density = Math.max(0.005, 0.035 / gamma);
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.resolutionScale === 'low' ? 1 : 2));
  }

  public nukeAllEnemies() {
    soundManager.playExplosion();
    this.enemies.getEnemies().forEach(e => {
      if (e.hp > 0) {
        this.enemies.damageEnemy(e.id, 9999);
      }
    });
  }

  private buildLevel(level: LevelDefinition) {
    // Clear old geometry
    this.wallMeshes.forEach(m => {
      this.scene.remove(m);
      m.geometry.dispose();
    });
    this.wallMeshes = [];

    this.doorMeshes.forEach(m => {
      this.scene.remove(m);
      m.geometry.dispose();
    });
    this.doorMeshes.clear();

    this.pickupMeshes.forEach(m => {
      this.scene.remove(m);
      m.material.dispose();
    });
    this.pickupMeshes.clear();

    this.barrelMeshes.forEach(m => {
      this.scene.remove(m);
      m.geometry.dispose();
    });
    this.barrelMeshes.clear();

    if (this.floorMesh) {
      this.scene.remove(this.floorMesh);
      this.floorMesh.geometry.dispose();
    }
    if (this.ceilingMesh) {
      this.scene.remove(this.ceilingMesh);
      this.ceilingMesh.geometry.dispose();
    }
    if (this.skyMesh) {
      this.scene.remove(this.skyMesh);
      this.skyMesh.geometry.dispose();
    }

    this.dynamicLights.forEach(l => this.scene.remove(l));
    this.dynamicLights = [];

    this.enemies.clearAll();
    this.projectiles.clearAll();

    const cellSize = 2;
    const wallHeight = 2.4;
    const theme = level.theme === 'arena' ? 'hell' : level.theme;

    // 1. Textures & Materials
    const techTex = textureManager.getTechWallTexture();
    const toxicTex = textureManager.getToxicWallTexture();
    const hellTex = textureManager.getHellWallTexture();
    const cryoTex = textureManager.getCryoWallTexture();
    const wallTex = theme === 'hell' ? hellTex : theme === 'toxic' ? toxicTex : theme === 'cryo' ? cryoTex : techTex;

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.8,
      metalness: 0.2,
    });

    const floorTex = textureManager.getFloorTexture(theme);
    floorTex.repeat.set(level.width, level.height);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.8,
      metalness: 0.1,
    });

    const ceilingTex = textureManager.getCeilingTexture(theme);
    ceilingTex.repeat.set(level.width, level.height);
    const ceilingMat = new THREE.MeshStandardMaterial({
      map: ceilingTex,
      roughness: 0.9,
    });

    // 2. Floor and Ceiling
    const floorGeo = new THREE.PlaneGeometry(level.width * cellSize, level.height * cellSize);
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.position.set((level.width * cellSize) / 2, 0, (level.height * cellSize) / 2);
    this.scene.add(this.floorMesh);

    const ceilingGeo = new THREE.PlaneGeometry(level.width * cellSize, level.height * cellSize);
    this.ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    this.ceilingMesh.rotation.x = Math.PI / 2;
    this.ceilingMesh.position.set((level.width * cellSize) / 2, wallHeight, (level.height * cellSize) / 2);
    this.scene.add(this.ceilingMesh);

    // 3. Walls
    const wallGeo = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
    for (let gz = 0; gz < level.height; gz++) {
      for (let gx = 0; gx < level.width; gx++) {
        const cell = level.grid[gz][gx];
        if (cell === 1 || cell === 2 || cell === 3 || cell === 8) {
          const mesh = new THREE.Mesh(wallGeo, wallMat);
          mesh.position.set(gx * cellSize + cellSize / 2, wallHeight / 2, gz * cellSize + cellSize / 2);
          this.scene.add(mesh);
          this.wallMeshes.push(mesh);
        }
      }
    }

    // 4. Doors
    level.doors.forEach(door => {
      const doorTex = textureManager.getDoorTexture(door.isExitDoor ? 'exit' : door.requiredKey);
      const doorMat = new THREE.MeshStandardMaterial({ map: doorTex });
      const doorGeo = new THREE.BoxGeometry(
        door.orientation === 'horizontal' ? cellSize : 0.4,
        wallHeight,
        door.orientation === 'horizontal' ? 0.4 : cellSize
      );
      const mesh = new THREE.Mesh(doorGeo, doorMat);
      mesh.position.set(
        door.x * cellSize + cellSize / 2,
        wallHeight / 2,
        door.z * cellSize + cellSize / 2
      );
      this.scene.add(mesh);
      this.doorMeshes.set(door.id, mesh);
    });

    // 5. Explosive Barrels
    level.barrels.forEach(barrel => {
      const barrelTex = textureManager.getPickupTexture('barrel');
      const barrelMat = new THREE.MeshStandardMaterial({ map: barrelTex });
      const barrelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12);
      const mesh = new THREE.Mesh(barrelGeo, barrelMat);
      mesh.position.set(barrel.x * cellSize + cellSize / 2, 0.45, barrel.z * cellSize + cellSize / 2);
      this.scene.add(mesh);
      this.barrelMeshes.set(barrel.id, mesh);
    });

    // 6. Pickups
    level.pickups.forEach(p => {
      this.createPickupSprite(p);
    });

    // 7. Enemies
    level.enemies.forEach(e => {
      this.enemies.spawnEnemy(e.type, e.x * cellSize + cellSize / 2, e.z * cellSize + cellSize / 2, e.id);
    });

    // 8. Lights & Sky
    const gamma = Math.max(0.4, this.settings.brightness);
    if (this.ambientLight) {
      this.scene.remove(this.ambientLight);
    }
    this.ambientLight = new THREE.AmbientLight(
      theme === 'hell' ? 0x773333 : theme === 'toxic' ? 0x335533 : theme === 'cryo' ? 0x335577 : 0x445566,
      1.0 * gamma
    );
    this.scene.add(this.ambientLight);

    // Torch / tech point lights
    for (let i = 0; i < 4; i++) {
      const px = Math.random() * level.width * cellSize;
      const pz = Math.random() * level.height * cellSize;
      const light = new THREE.PointLight(theme === 'hell' ? 0xef4444 : 0x38bdf8, 1.2, 10);
      light.position.set(px, 1.8, pz);
      this.scene.add(light);
      this.dynamicLights.push(light);
    }

    // Set Player Spawn
    this.playerPos.set(
      level.playerStart.x * cellSize + cellSize / 2,
      this.playerHeight,
      level.playerStart.z * cellSize + cellSize / 2
    );
    this.playerYaw = level.playerStart.angle || 0;
    this.playerPitch = 0;
    this.camera.position.copy(this.playerPos);

    soundManager.startMusic(theme === 'tech' ? 'hangar' : (theme === 'toxic' ? 'toxic' : 'hell'));
  }

  private createPickupSprite(p: PickupItem) {
    const tex = textureManager.getPickupTexture(p.type);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.7, 0.7, 1);
    sprite.position.set(p.x * 2 + 1, 0.4, p.z * 2 + 1);
    this.scene.add(sprite);
    this.pickupMeshes.set(p.id, sprite);
  }

  public spawnPickupItem(type: PickupItem['type'], worldX: number, worldZ: number) {
    const id = Math.random().toString(36).substring(2, 9);
    const item: PickupItem = {
      id,
      type,
      x: (worldX - 1) / 2,
      z: (worldZ - 1) / 2,
      active: true,
    };
    this.currentLevel.pickups.push(item);
    this.createPickupSprite(item);
  }

  // --- PLAYER CONTROLS & PHYSICS ---

  public handleMouseMove(movementX: number, movementY: number) {
    const sens = this.settings.mouseSensitivity * 0.0022;
    this.playerYaw -= movementX * sens;
    const invert = this.settings.invertY ? -1 : 1;
    this.playerPitch -= movementY * sens * invert;
    this.playerPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.playerPitch));
  }

  public handleTouchLook(deltaX: number, deltaY: number) {
    const sens = this.settings.touchSensitivity * 0.0035;
    this.playerYaw -= deltaX * sens;
    const invert = this.settings.invertY ? -1 : 1;
    this.playerPitch -= deltaY * sens * invert;
    this.playerPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.playerPitch));
  }

  public handleGyro(_alpha: number, beta: number, gamma: number) {
    if (!this.settings.gyroEnabled) return;
    const sens = this.settings.gyroSensitivity * 0.01;
    this.playerYaw += gamma * sens * 0.1;
    this.playerPitch += beta * sens * 0.1;
    this.playerPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.playerPitch));
  }

  public jump() {
    if (this.isGrounded) {
      this.playerVelocity.y = 5.2;
      this.isGrounded = false;
    }
  }

  public interact(playerStats: PlayerStats) {
    // Check doors or switches near player
    const cellSize = 2;
    const reach = 2.4;

    for (const door of this.currentLevel.doors) {
      const doorWorldX = door.x * cellSize + cellSize / 2;
      const doorWorldZ = door.z * cellSize + cellSize / 2;
      const dist = Math.hypot(doorWorldX - this.playerPos.x, doorWorldZ - this.playerPos.z);

      if (dist < reach) {
        // Exit door check
        if (door.isExitDoor) {
          if (this.onLevelComplete) {
            soundManager.playSecretRevealed();
            this.onLevelComplete();
            return;
          }
        }

        // Keycard lock check
        if (door.requiredKey) {
          const hasKey = playerStats.keys[door.requiredKey];
          if (!hasKey) {
            soundManager.playDoorLocked();
            if (this.onNotification) {
              this.onNotification(`REQUIRES ${door.requiredKey.toUpperCase()} KEYCARD!`, '🔑');
            }
            return;
          }
        }

        // Toggle door
        if (door.state === 'closed' || door.state === 'closing') {
          door.state = 'opening';
          soundManager.playDoorOpen();
        }
      }
    }
  }

  // --- WEAPON SHOOTING LOGIC ---

  public shoot(playerStats: PlayerStats) {
    const weaponDef = WEAPON_REGISTRY[playerStats.currentWeapon];
    const now = performance.now();
    if (now - this.lastFireTime < weaponDef.fireRate) return;
    if (this.isReloading) return;

    // Check ammo (bypassed if infinite ammo cheat is active)
    if (weaponDef.ammoType !== 'none' && !playerStats.isInfiniteAmmo) {
      const aType = weaponDef.ammoType as keyof PlayerStats['ammo'];
      const currentAmmo = playerStats.ammo[aType];
      if (currentAmmo < weaponDef.ammoPerShot) {
        // Empty clip / click
        soundManager.playDoorLocked();
        if (this.settings.autoReload) {
          this.reload(playerStats);
        }
        return;
      }

      // Deduct ammo
      if (this.onStatsUpdate) {
        this.onStatsUpdate(prev => ({
          ...prev,
          ammo: {
            ...prev.ammo,
            [aType]: Math.max(0, prev.ammo[aType] - weaponDef.ammoPerShot),
          },
        }));
      }
    }

    this.lastFireTime = now;

    // Recoil and screen shake
    this.screenShakeAmount = Math.min(0.25, this.screenShakeAmount + weaponDef.recoilAmount * 0.8);
    this.recoilOffset.set(0, 0.04, 0.08);

    // Play weapon sound
    const soundType = weaponDef.soundType || weaponDef.id;
    if (soundType === 'fist') soundManager.playPunch();
    else if (soundType === 'pistol') soundManager.playPistol();
    else if (soundType === 'shotgun') soundManager.playShotgun();
    else if (soundType === 'supershotgun' || soundType === 'quadshotgun') soundManager.playSuperShotgun();
    else if (soundType === 'chaingun') soundManager.playChaingun();
    else if (soundType === 'rocket' || soundType === 'rocketlauncher') soundManager.playRocketLaunch();
    else if (soundType === 'plasma' || soundType === 'plasmarifle') soundManager.playPlasma();
    else if (soundType === 'laser' || soundType === 'unmaker' || soundType === 'railgun') soundManager.playLaser();
    else if (soundType === 'flame' || soundType === 'flamethrower') soundManager.playFlamethrower();
    else if (soundType === 'bfg9000' || soundType === 'bfg') soundManager.playBFGFire();
    else soundManager.playPistol();

    // Camera ray direction
    const forward = new THREE.Vector3(
      -Math.sin(this.playerYaw) * Math.cos(this.playerPitch),
      Math.sin(this.playerPitch),
      -Math.cos(this.playerYaw) * Math.cos(this.playerPitch)
    ).normalize();

    // Damage multiplier for cheats (Quad Damage / One Hit Kill)
    const dmgMultiplier = (playerStats.isOneHitKill ? 15 : playerStats.isQuadDamage ? 4 : 1);
    const effectiveDamage = weaponDef.damage * dmgMultiplier;

    // Projectile weapons
    if (weaponDef.projectileSpeed > 0) {
      const projType = (weaponDef.projectileType || (weaponDef.id === 'bfg9000' ? 'bfg' : weaponDef.id === 'plasmarifle' ? 'plasma' : weaponDef.id === 'unmaker' ? 'laser' : weaponDef.id === 'flamethrower' ? 'flame' : 'rocket')) as 'bullet' | 'fireball' | 'rocket' | 'plasma' | 'bfg' | 'laser' | 'flame';
      this.projectiles.spawnProjectile(
        projType,
        this.playerPos.clone().add(forward.clone().multiplyScalar(0.4)),
        forward,
        effectiveDamage,
        weaponDef.splashRadius,
        weaponDef.projectileSpeed,
        true
      );
      return;
    }

    // Hitscan pellets
    for (let p = 0; p < weaponDef.pellets; p++) {
      const spreadX = (Math.random() - 0.5) * weaponDef.spread;
      const spreadY = (Math.random() - 0.5) * weaponDef.spread;
      const pelletDir = forward.clone().add(new THREE.Vector3(spreadX, spreadY, spreadX)).normalize();

      this.fireHitscanPellet(pelletDir, effectiveDamage, weaponDef.range);
    }
  }

  private fireHitscanPellet(dir: THREE.Vector3, damage: number, maxRange: number) {
    // 1. Check enemies
    const activeEnemies = this.enemies.getEnemies().filter(e => e.hp > 0);
    let closestDist = maxRange;
    let hitEnemy: ActiveEnemy | null = null;

    for (const enemy of activeEnemies) {
      const enemyWorldPos = new THREE.Vector3(enemy.x, enemy.y, enemy.z);
      const enemyRadius = enemy.def.radius;

      // Point-to-ray distance
      const v = enemyWorldPos.clone().sub(this.playerPos);
      const proj = v.dot(dir);
      if (proj > 0 && proj < closestDist) {
        const perpDistSq = v.lengthSq() - proj * proj;
        if (perpDistSq < enemyRadius * enemyRadius) {
          // Check wall occlusion
          if (this.collision.hasLineOfSight(this.playerPos.x, this.playerPos.z, enemy.x, enemy.z)) {
            closestDist = proj;
            hitEnemy = enemy;
          }
        }
      }
    }

    // 2. Check explosive barrels
    for (const barrel of this.currentLevel.barrels) {
      if (barrel.exploded) continue;
      const barrelPos = new THREE.Vector3(barrel.x * 2 + 1, 0.45, barrel.z * 2 + 1);
      const v = barrelPos.clone().sub(this.playerPos);
      const proj = v.dot(dir);
      if (proj > 0 && proj < closestDist) {
        const perpDistSq = v.lengthSq() - proj * proj;
        if (perpDistSq < 0.35 * 0.35) {
          closestDist = proj;
          this.explodeBarrel(barrel);
          return;
        }
      }
    }

    if (hitEnemy) {
      const hitPos = this.playerPos.clone().add(dir.clone().multiplyScalar(closestDist));
      this.particles.spawnBlood(hitPos.x, hitPos.y, hitPos.z, 8);
      this.enemies.damageEnemy(hitEnemy.id, damage);
      soundManager.playHitmarker();
      if (this.onHitEnemyCallback) {
        this.onHitEnemyCallback();
      }
    } else {
      // Hit wall
      const hitPos = this.playerPos.clone().add(dir.clone().multiplyScalar(closestDist));
      this.particles.spawnSparks(hitPos.x, hitPos.y, hitPos.z, 5);
    }
  }

  public reload(playerStats: PlayerStats) {
    if (this.isReloading) return;
    const weapon = WEAPON_REGISTRY[playerStats.currentWeapon];
    if (weapon.ammoType === 'none' || weapon.clipSize === 0) return;

    this.isReloading = true;
    this.reloadProgress = 0;
    soundManager.playReload();

    setTimeout(() => {
      this.isReloading = false;
      this.reloadProgress = 1;
    }, weapon.reloadTime);
  }

  public explodeBarrel(barrel: { id: string; x: number; z: number; hp: number; exploded: boolean }) {
    if (barrel.exploded) return;
    barrel.exploded = true;
    const bx = barrel.x * 2 + 1;
    const bz = barrel.z * 2 + 1;

    soundManager.playExplosion();
    this.particles.spawnExplosion(bx, 0.6, bz, 50);

    const barrelMesh = this.barrelMeshes.get(barrel.id);
    if (barrelMesh) {
      this.scene.remove(barrelMesh);
      barrelMesh.geometry.dispose();
      this.barrelMeshes.delete(barrel.id);
    }

    // Damage surrounding entities
    const radius = 5.0;
    this.enemies.getEnemies().forEach(e => {
      if (e.hp <= 0) return;
      const d = Math.hypot(e.x - bx, e.z - bz);
      if (d < radius) {
        const falloff = 1 - d / radius;
        this.enemies.damageEnemy(e.id, Math.round(150 * falloff));
      }
    });

    const distToPlayer = Math.hypot(this.playerPos.x - bx, this.playerPos.z - bz);
    if (distToPlayer < radius) {
      const falloff = 1 - distToPlayer / radius;
      this.damagePlayer(Math.round(80 * falloff));
    }
  }

  public damagePlayer(dmg: number) {
    this.damageFlashAmount = 1.0;
    this.screenShakeAmount = Math.min(0.35, this.screenShakeAmount + 0.15);
    soundManager.playPlayerHurt();

    if (this.onStatsUpdate) {
      this.onStatsUpdate(prev => {
        if (prev.isGodMode) return prev;
        
        let newArmor = prev.armor;
        let newHp = prev.hp;

        if (newArmor > 0) {
          const absorbed = Math.min(newArmor, Math.round(dmg * 0.6));
          newArmor -= absorbed;
          newHp -= (dmg - absorbed);
        } else {
          newHp -= dmg;
        }

        if (newHp <= 0) {
          newHp = 0;
          if (this.onGameOver) this.onGameOver();
        }

        return {
          ...prev,
          hp: Math.max(0, newHp),
          armor: Math.max(0, newArmor),
        };
      });
    }
  }

  // --- GAME LOOP ---

  private loop(time: number) {
    if (this.isDisposed) return;
    const dt = Math.min(0.1, (time - this.lastTime) / 1000);
    this.lastTime = time;

    this.updatePlayer(dt);
    this.updateDoors(dt);
    this.updatePickups(dt);
    this.updateEnemies(dt);
    this.projectiles.update(
      dt,
      this.enemies.getEnemies().map(e => ({
        id: e.id,
        x: e.x,
        z: e.z,
        hp: e.hp,
        radius: e.def.radius,
        height: e.def.height,
        onHit: (d) => this.enemies.damageEnemy(e.id, d),
      })),
      this.currentLevel.barrels.map(b => ({
        id: b.id,
        x: b.x * 2 + 1,
        z: b.z * 2 + 1,
        hp: b.hp,
        exploded: b.exploded,
        onExplode: () => this.explodeBarrel(b),
      })),
      {
        x: this.playerPos.x,
        y: this.playerPos.y,
        z: this.playerPos.z,
        radius: this.playerRadius,
        onHit: (d) => this.damagePlayer(d),
      }
    );
    this.particles.update(dt);

    // Screen Shake & Recoil Recovery
    if (this.screenShakeAmount > 0) {
      this.screenShakeAmount = Math.max(0, this.screenShakeAmount - dt * 0.8);
    }
    if (this.damageFlashAmount > 0) {
      this.damageFlashAmount = Math.max(0, this.damageFlashAmount - dt * 2.5);
    }
    if (this.pickupFlashAmount > 0) {
      this.pickupFlashAmount = Math.max(0, this.pickupFlashAmount - dt * 2.0);
    }
    this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), dt * 10);

    // Camera transformation
    const shakeX = (Math.random() - 0.5) * this.screenShakeAmount * 0.3;
    const shakeY = (Math.random() - 0.5) * this.screenShakeAmount * 0.3;
    this.camera.position.set(
      this.playerPos.x + shakeX,
      this.playerPos.y + this.bobbingOffset.y + shakeY,
      this.playerPos.z
    );
    this.camera.rotation.set(this.playerPitch + shakeY * 0.5, this.playerYaw + shakeX * 0.5, 0, 'YXZ');

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private updatePlayer(dt: number) {
    // 1. Movement Inputs (WASD + Virtual Joystick)
    let moveForward = 0;
    let moveStrafe = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveForward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveForward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveStrafe -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveStrafe += 1;

    // Add Joystick input
    if (this.joystickVector.length() > 0.05) {
      moveForward += this.joystickVector.y;
      moveStrafe += this.joystickVector.x;
    }

    const moveLen = Math.hypot(moveForward, moveStrafe);
    const isSprint = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const speedMultiplier = this.currentStats?.isSpeedBoost ? 2.0 : 1.0;
    const speed = (isSprint ? 6.8 : 4.8) * speedMultiplier;

    if (moveLen > 0.05) {
      const normFwd = moveForward / moveLen;
      const normStr = moveStrafe / moveLen;

      const sinY = Math.sin(this.playerYaw);
      const cosY = Math.cos(this.playerYaw);

      // World movement delta
      const dx = (-sinY * normFwd + cosY * normStr) * speed * dt;
      const dz = (-cosY * normFwd - sinY * normStr) * speed * dt;

      const targetX = this.playerPos.x + dx;
      const targetZ = this.playerPos.z + dz;

      const isNoClipActive = this.isNoClip || !!this.currentStats?.isNoClip;

      if (isNoClipActive) {
        // Complete 3D pass-through without any collision or wall blocking
        this.playerPos.x = targetX;
        this.playerPos.z = targetZ;
        // Pitch-based vertical flying in NoClip mode
        if (Math.abs(this.playerPitch) > 0.1 && moveForward !== 0) {
          this.playerPos.y += Math.sin(this.playerPitch) * normFwd * speed * dt;
        }
      } else {
        const resolved = this.collision.resolveCircleCollision(
          this.playerPos.x,
          this.playerPos.z,
          targetX,
          targetZ,
          this.playerRadius,
          false
        );

        this.playerPos.x = resolved.x;
        this.playerPos.z = resolved.z;
      }

      // Bobbing
      this.bobbingTimer += dt * speed * 2.2;
      this.bobbingOffset.x = Math.sin(this.bobbingTimer) * 0.03;
      this.bobbingOffset.y = Math.abs(Math.sin(this.bobbingTimer)) * 0.05;
    } else {
      this.bobbingOffset.lerp(new THREE.Vector2(0, 0), dt * 6);
    }

    // 2. Gravity & Jump Physics (Disabled in NoClip flight)
    const isNoClipActive = this.isNoClip || !!this.currentStats?.isNoClip;
    if (!isNoClipActive) {
      if (!this.isGrounded) {
        this.playerVelocity.y -= 16.0 * dt;
        this.playerPos.y += this.playerVelocity.y * dt;
        if (this.playerPos.y <= this.playerHeight) {
          this.playerPos.y = this.playerHeight;
          this.playerVelocity.y = 0;
          this.isGrounded = true;
        }
      }

      // 3. Hazard Floor Damage (Acid / Lava)
      const hazardDmg = this.collision.getHazardDamage(this.playerPos.x, this.playerPos.z, false);
      if (hazardDmg > 0) {
        this.damagePlayer(Math.round(hazardDmg * dt));
      }
    } else {
      // In NoClip mode, jump/crouch controls vertical flight
      if (this.keys['Space']) {
        this.playerPos.y += 5.0 * dt;
      }
      if (this.keys['KeyC'] || this.keys['ControlLeft']) {
        this.playerPos.y -= 5.0 * dt;
      }
    }

    // 4. Check Secret Areas
    if (this.currentLevel.secrets) {
      const gx = Math.floor(this.playerPos.x / 2);
      const gz = Math.floor(this.playerPos.z / 2);
      for (const secret of this.currentLevel.secrets) {
        if (!secret.found && gx >= secret.x && gx < secret.x + secret.width && gz >= secret.z && gz < secret.z + secret.depth) {
          secret.found = true;
          soundManager.playSecretRevealed();
          if (this.onNotification) {
            this.onNotification(secret.message || 'SECRET AREA REVEALED!', '✨');
          }
          if (this.onStatsUpdate) {
            this.onStatsUpdate(prev => ({
              ...prev,
              secretsFound: prev.secretsFound + 1,
              score: prev.score + 500,
            }));
          }
        }
      }
    }
  }

  private updateDoors(dt: number) {
    const cellSize = 2;
    const wallHeight = 2.4;

    this.currentLevel.doors.forEach(door => {
      const mesh = this.doorMeshes.get(door.id);
      if (!mesh) return;

      if (door.state === 'opening') {
        door.progress = Math.min(1.0, door.progress + dt * 1.5);
        mesh.position.y = wallHeight / 2 + door.progress * wallHeight;
        if (door.progress >= 1.0) {
          door.state = 'open';
          // Auto close after 4 seconds if player not blocking
          setTimeout(() => {
            if (door.state === 'open') door.state = 'closing';
          }, 4000);
        }
      } else if (door.state === 'closing') {
        // Check if player or enemy is inside door
        const doorX = door.x * cellSize + cellSize / 2;
        const doorZ = door.z * cellSize + cellSize / 2;
        const dist = Math.hypot(doorX - this.playerPos.x, doorZ - this.playerPos.z);

        if (dist > 1.2) {
          door.progress = Math.max(0.0, door.progress - dt * 1.5);
          mesh.position.y = wallHeight / 2 + door.progress * wallHeight;
          if (door.progress <= 0.0) {
            door.state = 'closed';
          }
        }
      }
    });
  }

  private updatePickups(dt: number) {
    const cellSize = 2;
    const now = performance.now() * 0.003;

    for (let i = this.currentLevel.pickups.length - 1; i >= 0; i--) {
      const p = this.currentLevel.pickups[i];
      const mesh = this.pickupMeshes.get(p.id);
      if (!mesh) continue;

      if (!p.active) {
        if (p.respawnTime && p.respawnTime > 0) {
          p.respawnTime -= dt;
          if (p.respawnTime <= 0) {
            p.active = true;
            mesh.visible = true;
          }
        }
        continue;
      }

      // Bobbing floating animation
      mesh.position.y = 0.45 + Math.sin(now + i) * 0.08;

      // Check distance to player
      const px = p.x * cellSize + cellSize / 2;
      const pz = p.z * cellSize + cellSize / 2;
      const dist = Math.hypot(px - this.playerPos.x, pz - this.playerPos.z);

      if (dist < 1.1) {
        this.collectPickup(p);
      }
    }
  }

  private collectPickup(p: PickupItem) {
    let collected = false;

    if (this.onStatsUpdate) {
      this.onStatsUpdate(prev => {
        let text = '';
        let icon = '🎁';

        if (p.type === 'health_small') {
          if (prev.hp >= prev.maxHp) return prev;
          collected = true;
          text = '+10 HEALTH';
          icon = '❤️';
          soundManager.playItemPickup();
          return { ...prev, hp: Math.min(prev.maxHp, prev.hp + 10) };
        } else if (p.type === 'health_medium') {
          if (prev.hp >= prev.maxHp) return prev;
          collected = true;
          text = '+25 HEALTH';
          icon = '❤️';
          soundManager.playItemPickup();
          return { ...prev, hp: Math.min(prev.maxHp, prev.hp + 25) };
        } else if (p.type === 'health_mega') {
          collected = true;
          text = '+100 MEGA SOUL SPHERE!';
          icon = '💖';
          soundManager.playSecretRevealed();
          return { ...prev, hp: Math.min(200, prev.hp + 100) };
        } else if (p.type === 'armor_green') {
          collected = true;
          text = '+100 SECURITY ARMOR';
          icon = '🛡️';
          soundManager.playItemPickup();
          return { ...prev, armor: Math.max(prev.armor, 100) };
        } else if (p.type === 'armor_blue') {
          collected = true;
          text = '+200 COMBAT MEGA-ARMOR!';
          icon = '🛡️';
          soundManager.playSecretRevealed();
          return { ...prev, armor: 200 };
        } else if (p.type.includes('key')) {
          collected = true;
          const keyColor = p.type.replace('key_', '') as 'blue' | 'yellow' | 'red';
          text = `ACQUIRED ${keyColor.toUpperCase()} KEYCARD!`;
          icon = '🔑';
          soundManager.playKeycardPickup();
          return {
            ...prev,
            keys: { ...prev.keys, [keyColor]: true },
          };
        } else if (p.type.includes('ammo')) {
          const ammoType = p.type.replace('ammo_', '') as keyof PlayerStats['ammo'];
          const amount = ammoType === 'bullets' ? 20 : ammoType === 'shells' ? 12 : ammoType === 'rockets' ? 5 : 30;
          collected = true;
          text = `+${amount} ${ammoType.toUpperCase()}`;
          icon = '📦';
          soundManager.playItemPickup();
          return {
            ...prev,
            ammo: {
              ...prev.ammo,
              [ammoType]: Math.min(prev.maxAmmo[ammoType], prev.ammo[ammoType] + amount),
            },
          };
        } else if (p.type.includes('weapon')) {
          const weaponId = p.type.replace('weapon_', '') as WeaponType;
          collected = true;
          text = `ACQUIRED ${WEAPON_REGISTRY[weaponId].name.toUpperCase()}!`;
          icon = '🔫';
          soundManager.playWeaponPickup();
          const unlocked = prev.unlockedWeapons.includes(weaponId)
            ? prev.unlockedWeapons
            : [...prev.unlockedWeapons, weaponId];
          return {
            ...prev,
            unlockedWeapons: unlocked,
            currentWeapon: weaponId,
          };
        }

        if (text && this.onNotification) {
          this.onNotification(text, icon);
        }
        return prev;
      });
    }

    if (collected) {
      this.pickupFlashAmount = 0.8;
      this.particles.spawnPickupSparkles(p.x * 2 + 1, 0.5, p.z * 2 + 1);

      const mesh = this.pickupMeshes.get(p.id);
      if (mesh) {
        if (p.respawnTime) {
          p.active = false;
          mesh.visible = false;
        } else {
          this.scene.remove(mesh);
          mesh.material.dispose();
          this.pickupMeshes.delete(p.id);
        }
      }
    }
  }

  private hordeSpawnTimer: number = 0;

  private updateEnemies(dt: number) {
    this.enemies.update(dt, {
      x: this.playerPos.x,
      y: this.playerPos.y,
      z: this.playerPos.z,
      onHit: (dmg) => this.damagePlayer(dmg),
    });

    // In Survival Horde Arena: spawn waves of demons continuously
    if (this.currentLevel.theme === 'arena') {
      this.hordeSpawnTimer += dt;
      const aliveCount = this.enemies.getEnemies().filter(e => e.hp > 0).length;
      if (this.hordeSpawnTimer >= 14 || (aliveCount < 2 && this.hordeSpawnTimer >= 4)) {
        this.hordeSpawnTimer = 0;
        soundManager.playDemonGrowl();
        if (this.onNotification) {
          this.onNotification('WARNING: NEW DEMONIC WAVE INBOUND!', '💀');
        }

        const spawns = [
          { x: 3, z: 3, type: 'imp' as const },
          { x: 16, z: 3, type: 'zombie' as const },
          { x: 3, z: 16, type: 'demon' as const },
          { x: 16, z: 16, type: Math.random() > 0.5 ? ('cacodemon' as const) : ('baron' as const) },
        ];

        spawns.forEach(s => {
          this.enemies.spawnEnemy(s.type, s.x * 2 + 1, s.z * 2 + 1);
        });

        if (this.onStatsUpdate) {
          this.onStatsUpdate(prev => ({
            ...prev,
            totalEnemies: prev.totalEnemies + spawns.length,
          }));
        }
      }
    }
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    soundManager.stopMusic();
    this.particles.dispose();
    this.renderer.dispose();
    if (this.domElement.contains(this.renderer.domElement)) {
      this.domElement.removeChild(this.renderer.domElement);
    }
  }
}
