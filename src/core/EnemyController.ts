import * as THREE from 'three';
import { EnemyDef, EnemyType, PickupType } from '../types/game';
import { CollisionSystem } from './CollisionSystem';
import { ProjectileSystem } from './ProjectileSystem';
import { ParticleSystem } from './ParticleSystem';
import { soundManager } from '../audio/SoundSystem';
import { textureManager } from '../textures/TextureGenerator';

export const ENEMY_DEFINITIONS: Record<EnemyType, EnemyDef> = {
  zombie: {
    type: 'zombie',
    name: 'Former Human Trooper',
    maxHp: 30,
    speed: 2.2,
    attackDamage: 12,
    attackRange: 16,
    attackCooldown: 1400,
    isRanged: true,
    projectileType: 'bullet',
    scoreValue: 100,
    radius: 0.35,
    height: 1.4,
    color: '#166534',
  },
  imp: {
    type: 'imp',
    name: 'Imp',
    maxHp: 60,
    speed: 2.5,
    attackDamage: 20,
    attackRange: 18,
    attackCooldown: 1700,
    isRanged: true,
    projectileType: 'fireball',
    scoreValue: 200,
    radius: 0.4,
    height: 1.5,
    color: '#92400e',
  },
  demon: {
    type: 'demon',
    name: 'Pinky Demon',
    maxHp: 150,
    speed: 4.2,
    attackDamage: 25,
    attackRange: 1.6,
    attackCooldown: 800,
    isRanged: false,
    scoreValue: 300,
    radius: 0.5,
    height: 1.5,
    color: '#f43f5e',
  },
  lostsoul: {
    type: 'lostsoul',
    name: 'Lost Soul',
    maxHp: 45,
    speed: 5.5,
    attackDamage: 22,
    attackRange: 1.8,
    attackCooldown: 1200,
    isRanged: false,
    flying: true,
    scoreValue: 250,
    radius: 0.35,
    height: 1.2,
    color: '#f97316',
  },
  cacodemon: {
    type: 'cacodemon',
    name: 'Cacodemon',
    maxHp: 280,
    speed: 2.8,
    attackDamage: 32,
    attackRange: 20,
    attackCooldown: 1900,
    isRanged: true,
    flying: true,
    projectileType: 'cacoball',
    scoreValue: 500,
    radius: 0.6,
    height: 1.8,
    color: '#dc2626',
  },
  baron: {
    type: 'baron',
    name: 'Baron of Hell',
    maxHp: 500,
    speed: 2.6,
    attackDamage: 45,
    attackRange: 20,
    attackCooldown: 1500,
    isRanged: true,
    projectileType: 'fireball',
    scoreValue: 1000,
    radius: 0.7,
    height: 2.2,
    color: '#991b1b',
  },
  cyberdemon: {
    type: 'cyberdemon',
    name: 'Cyberdemon Lord',
    maxHp: 1800,
    speed: 3.2,
    attackDamage: 75,
    attackRange: 30,
    attackCooldown: 1200,
    isRanged: true,
    projectileType: 'rocket',
    scoreValue: 5000,
    radius: 0.9,
    height: 2.6,
    color: '#7f1d1d',
  },
};

export interface ActiveEnemy {
  id: string;
  type: EnemyType;
  def: EnemyDef;
  x: number;
  y: number;
  z: number;
  hp: number;
  state: 'idle' | 'chase' | 'attack' | 'hurt' | 'dead';
  stateTimer: number;
  attackCooldownTimer: number;
  animTimer: number;
  animFrame: 'idle' | 'walk1' | 'walk2' | 'attack' | 'hurt' | 'die';
  mesh: THREE.Sprite;
  targetPos: { x: number; z: number };
  hasSeenPlayer: boolean;
}

export class EnemyController {
  private enemies: ActiveEnemy[] = [];
  private scene: THREE.Scene;
  private collision: CollisionSystem;
  private projectiles: ProjectileSystem;
  private particles: ParticleSystem;
  private onEnemyKilledCallback?: (enemy: ActiveEnemy, drop?: PickupType) => void;

  constructor(
    scene: THREE.Scene,
    collision: CollisionSystem,
    projectiles: ProjectileSystem,
    particles: ParticleSystem
  ) {
    this.scene = scene;
    this.collision = collision;
    this.projectiles = projectiles;
    this.particles = particles;
  }

  public setCollision(collision: CollisionSystem) {
    this.collision = collision;
  }

  public setOnEnemyKilled(cb: (enemy: ActiveEnemy, drop?: PickupType) => void) {
    this.onEnemyKilledCallback = cb;
  }

  public spawnEnemy(type: EnemyType, x: number, z: number, id?: string): ActiveEnemy {
    const def = ENEMY_DEFINITIONS[type];
    const initialTexture = textureManager.getEnemyTexture(type, 'idle');
    const spriteMat = new THREE.SpriteMaterial({
      map: initialTexture,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMat);
    const spriteHeight = def.height;
    const spriteWidth = def.height * 0.9;
    sprite.scale.set(spriteWidth, spriteHeight, 1);
    
    const yPos = def.flying ? 1.4 : spriteHeight / 2;
    sprite.position.set(x, yPos, z);
    this.scene.add(sprite);

    const enemy: ActiveEnemy = {
      id: id || Math.random().toString(36).substring(2, 9),
      type,
      def,
      x,
      y: yPos,
      z,
      hp: def.maxHp,
      state: 'idle',
      stateTimer: 0,
      attackCooldownTimer: Math.random() * 800,
      animTimer: 0,
      animFrame: 'idle',
      mesh: sprite,
      targetPos: { x, z },
      hasSeenPlayer: false,
    };

    this.enemies.push(enemy);
    return enemy;
  }

  public damageEnemy(enemyId: string, damage: number, onDeath?: () => void) {
    const enemy = this.enemies.find(e => e.id === enemyId);
    if (!enemy || enemy.hp <= 0) return;

    enemy.hp -= damage;
    enemy.hasSeenPlayer = true; // Alert enemy immediately

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
      if (onDeath) onDeath();
    } else {
      enemy.state = 'hurt';
      enemy.stateTimer = 0.22;
      this.setEnemyTexture(enemy, 'hurt');
      soundManager.playDemonHurt();
    }
  }

  private killEnemy(enemy: ActiveEnemy) {
    enemy.hp = 0;
    enemy.state = 'dead';
    enemy.stateTimer = 3.0; // Keep corpse for a bit
    this.setEnemyTexture(enemy, 'die');
    soundManager.playDemonDie();

    this.particles.spawnBlood(enemy.x, enemy.y, enemy.z, 28);

    // Random drop
    let drop: PickupType | undefined;
    const rnd = Math.random();
    if (enemy.type === 'zombie') {
      if (rnd < 0.6) drop = 'ammo_bullets';
      else if (rnd < 0.8) drop = 'health_small';
    } else if (enemy.type === 'imp') {
      if (rnd < 0.4) drop = 'ammo_shells';
      else if (rnd < 0.65) drop = 'health_small';
    } else if (enemy.type === 'demon') {
      if (rnd < 0.5) drop = 'health_medium';
      else if (rnd < 0.8) drop = 'ammo_shells';
    } else if (enemy.type === 'cacodemon' || enemy.type === 'baron') {
      if (rnd < 0.5) drop = 'health_mega';
      else if (rnd < 0.8) drop = 'ammo_cells';
    } else if (enemy.type === 'cyberdemon') {
      drop = 'health_mega';
    }

    if (this.onEnemyKilledCallback) {
      this.onEnemyKilledCallback(enemy, drop);
    }
  }

  public update(
    dt: number,
    playerPos: { x: number; y: number; z: number; onHit: (dmg: number) => void }
  ) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Dead enemies handling
      if (enemy.state === 'dead') {
        enemy.stateTimer -= dt;
        if (enemy.stateTimer <= 0) {
          this.scene.remove(enemy.mesh);
          enemy.mesh.material.dispose();
          this.enemies.splice(i, 1);
        }
        continue;
      }

      // Distance and direction to player
      const dx = playerPos.x - enemy.x;
      const dz = playerPos.z - enemy.z;
      const distToPlayer = Math.hypot(dx, dz);

      // Decrement timers
      enemy.attackCooldownTimer -= dt * 1000;
      enemy.animTimer += dt;

      // Hurt state timer
      if (enemy.state === 'hurt') {
        enemy.stateTimer -= dt;
        if (enemy.stateTimer <= 0) {
          enemy.state = 'chase';
        }
      }

      // Sight check: if player is close or in direct line of sight
      if (!enemy.hasSeenPlayer) {
        if (distToPlayer < 12 && this.collision.hasLineOfSight(enemy.x, enemy.z, playerPos.x, playerPos.z)) {
          enemy.hasSeenPlayer = true;
          soundManager.playDemonGrowl();
        }
      }

      // If active and chasing
      if (enemy.hasSeenPlayer && enemy.state !== 'hurt') {
        const canSee = this.collision.hasLineOfSight(enemy.x, enemy.z, playerPos.x, playerPos.z);

        // Check if within attack range and ready to attack
        if (canSee && distToPlayer <= enemy.def.attackRange && enemy.attackCooldownTimer <= 0) {
          this.performAttack(enemy, playerPos, dx, dz, distToPlayer);
        } else if (enemy.state !== 'attack' || enemy.stateTimer <= 0) {
          // Move towards player
          enemy.state = 'chase';
          const moveDist = enemy.def.speed * dt;
          const targetX = enemy.x + (dx / distToPlayer) * moveDist;
          const targetZ = enemy.z + (dz / distToPlayer) * moveDist;

          // Wall collision resolution
          const resolved = this.collision.resolveCircleCollision(
            enemy.x,
            enemy.z,
            targetX,
            targetZ,
            enemy.def.radius
          );

          enemy.x = resolved.x;
          enemy.z = resolved.z;
          enemy.mesh.position.set(enemy.x, enemy.y, enemy.z);

          // Walk animation frames
          const walkFrame = Math.sin(enemy.animTimer * 8) > 0 ? 'walk1' : 'walk2';
          this.setEnemyTexture(enemy, walkFrame);
        }
      }

      // Attack state timeout
      if (enemy.state === 'attack') {
        enemy.stateTimer -= dt;
        if (enemy.stateTimer <= 0) {
          enemy.state = 'chase';
        }
      }
    }
  }

  private performAttack(
    enemy: ActiveEnemy,
    playerPos: { x: number; y: number; z: number; onHit: (dmg: number) => void },
    dx: number,
    dz: number,
    distToPlayer: number
  ) {
    enemy.state = 'attack';
    enemy.stateTimer = 0.45;
    enemy.attackCooldownTimer = enemy.def.attackCooldown;
    this.setEnemyTexture(enemy, 'attack');

    if (enemy.def.isRanged && enemy.def.projectileType) {
      // Spawn projectile towards player
      const startPos = new THREE.Vector3(enemy.x, enemy.y + 0.1, enemy.z);
      const dir = new THREE.Vector3(
        dx / distToPlayer + (Math.random() - 0.5) * 0.08,
        (playerPos.y - enemy.y) / distToPlayer,
        dz / distToPlayer + (Math.random() - 0.5) * 0.08
      ).normalize();

      if (enemy.def.projectileType === 'bullet') {
        soundManager.playPistol();
        // Hitscan burst
        if (Math.random() < 0.65) {
          playerPos.onHit(enemy.def.attackDamage);
        }
      } else if (enemy.def.projectileType === 'fireball') {
        soundManager.playImpFireball();
        this.projectiles.spawnProjectile('fireball', startPos, dir, enemy.def.attackDamage, 0, 16, false);
      } else if (enemy.def.projectileType === 'cacoball') {
        soundManager.playPlasma();
        this.projectiles.spawnProjectile('cacoball', startPos, dir, enemy.def.attackDamage, 0, 18, false);
      } else if (enemy.def.projectileType === 'rocket') {
        soundManager.playRocketLaunch();
        this.projectiles.spawnProjectile('rocket', startPos, dir, enemy.def.attackDamage, 4.0, 20, false);
      }
    } else {
      // Melee attack
      if (distToPlayer <= enemy.def.attackRange + 0.5) {
        soundManager.playPunch();
        playerPos.onHit(enemy.def.attackDamage);
      }
    }
  }

  private setEnemyTexture(enemy: ActiveEnemy, frame: 'idle' | 'walk1' | 'walk2' | 'attack' | 'hurt' | 'die') {
    if (enemy.animFrame === frame) return;
    enemy.animFrame = frame;
    const tex = textureManager.getEnemyTexture(enemy.type, frame);
    enemy.mesh.material.map = tex;
    enemy.mesh.material.needsUpdate = true;
  }

  public getEnemies(): ActiveEnemy[] {
    return this.enemies;
  }

  public clearAll() {
    for (const e of this.enemies) {
      this.scene.remove(e.mesh);
      e.mesh.material.dispose();
    }
    this.enemies = [];
  }
}
