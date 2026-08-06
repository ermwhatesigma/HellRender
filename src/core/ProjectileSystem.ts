import * as THREE from 'three';
import { CollisionSystem } from './CollisionSystem';
import { ParticleSystem } from './ParticleSystem';
import { soundManager } from '../audio/SoundSystem';
import { textureManager } from '../textures/TextureGenerator';

export interface ActiveProjectile {
  id: string;
  mesh: THREE.Sprite;
  light?: THREE.PointLight;
  type: 'bullet' | 'fireball' | 'rocket' | 'plasma' | 'bfg' | 'cacoball' | 'laser' | 'flame';
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  damage: number;
  splashRadius: number;
  isFromPlayer: boolean;
  life: number;
  maxLife: number;
}

export class ProjectileSystem {
  private projectiles: ActiveProjectile[] = [];
  private scene: THREE.Scene;
  private collision: CollisionSystem;
  private particles: ParticleSystem;

  constructor(scene: THREE.Scene, collision: CollisionSystem, particles: ParticleSystem) {
    this.scene = scene;
    this.collision = collision;
    this.particles = particles;
  }

  public setCollision(collision: CollisionSystem) {
    this.collision = collision;
  }

  public spawnProjectile(
    type: 'bullet' | 'fireball' | 'rocket' | 'plasma' | 'bfg' | 'cacoball' | 'laser' | 'flame',
    startPos: THREE.Vector3,
    direction: THREE.Vector3,
    damage: number,
    splashRadius: number = 0,
    speed: number = 20,
    isFromPlayer: boolean = true
  ) {
    const texType = type === 'cacoball' ? 'plasma' : type;
    const texture = textureManager.getProjectileTexture(texType);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(spriteMat);
    
    // Scale sprite based on type
    const scale = type === 'bfg' ? 1.4 : type === 'rocket' ? 0.7 : type === 'laser' ? 0.8 : type === 'flame' ? 0.9 : type === 'fireball' ? 0.6 : 0.45;
    sprite.scale.set(scale, scale, 1);
    sprite.position.copy(startPos);
    this.scene.add(sprite);

    // Dynamic light on projectile
    let light: THREE.PointLight | undefined;
    if (type === 'fireball' || type === 'rocket' || type === 'plasma' || type === 'bfg' || type === 'cacoball' || type === 'laser' || type === 'flame') {
      const color = type === 'bfg' ? 0x22c55e : (type === 'plasma' || type === 'cacoball') ? 0x38bdf8 : type === 'laser' ? 0xec4899 : 0xf97316;
      light = new THREE.PointLight(color, type === 'bfg' ? 2.5 : 1.2, type === 'bfg' ? 8 : 4);
      light.position.copy(startPos);
      this.scene.add(light);
    }

    const velocity = direction.clone().normalize().multiplyScalar(speed);

    this.projectiles.push({
      id: Math.random().toString(36).substring(2, 9),
      mesh: sprite,
      light,
      type,
      position: startPos.clone(),
      velocity,
      damage,
      splashRadius,
      isFromPlayer,
      life: 0,
      maxLife: 4.0,
    });
  }

  public update(
    dt: number,
    enemies: { id: string; x: number; z: number; hp: number; radius: number; height: number; onHit: (dmg: number, isCrit?: boolean) => void }[],
    barrels: { id: string; x: number; z: number; hp: number; exploded: boolean; onExplode: () => void }[],
    playerPos: { x: number; y: number; z: number; radius: number; onHit: (dmg: number) => void }
  ) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.life += dt;

      if (proj.life >= proj.maxLife) {
        this.destroyProjectile(i);
        continue;
      }

      // Move projectile
      const oldPos = proj.position.clone();
      proj.position.addScaledVector(proj.velocity, dt);
      proj.mesh.position.copy(proj.position);
      if (proj.light) {
        proj.light.position.copy(proj.position);
      }

      // Spawn smoke for rockets
      if (proj.type === 'rocket' && Math.random() > 0.4) {
        this.particles.spawnSmokePuff(proj.position.x, proj.position.y, proj.position.z);
      }

      // Check wall collision
      if (this.collision.isSolid(proj.position.x, proj.position.z)) {
        this.onImpact(proj, enemies, barrels, playerPos, oldPos);
        this.destroyProjectile(i);
        continue;
      }

      // Check enemy collisions (if projectile from player)
      let hitEntity = false;
      if (proj.isFromPlayer) {
        for (const enemy of enemies) {
          if (enemy.hp <= 0) continue;
          const dist = Math.hypot(proj.position.x - enemy.x, proj.position.z - enemy.z);
          if (dist < enemy.radius + 0.3 && proj.position.y >= 0 && proj.position.y <= enemy.height) {
            enemy.onHit(proj.damage);
            this.particles.spawnBlood(proj.position.x, proj.position.y, proj.position.z, 12);
            this.onImpact(proj, enemies, barrels, playerPos, proj.position);
            this.destroyProjectile(i);
            hitEntity = true;
            break;
          }
        }
      }

      if (hitEntity) continue;

      // Check player collision (if projectile from enemy)
      if (!proj.isFromPlayer) {
        const distToPlayer = Math.hypot(proj.position.x - playerPos.x, proj.position.z - playerPos.z);
        if (distToPlayer < playerPos.radius + 0.35 && Math.abs(proj.position.y - playerPos.y) < 1.2) {
          playerPos.onHit(proj.damage);
          this.onImpact(proj, enemies, barrels, playerPos, proj.position);
          this.destroyProjectile(i);
          continue;
        }
      }

      // Check explosive barrels
      for (const barrel of barrels) {
        if (barrel.exploded) continue;
        const dist = Math.hypot(proj.position.x - barrel.x, proj.position.z - barrel.z);
        if (dist < 0.6) {
          barrel.onExplode();
          this.onImpact(proj, enemies, barrels, playerPos, proj.position);
          this.destroyProjectile(i);
          hitEntity = true;
          break;
        }
      }
    }
  }

  private onImpact(
    proj: ActiveProjectile,
    enemies: { id: string; x: number; z: number; hp: number; radius: number; onHit: (dmg: number) => void }[],
    barrels: { id: string; x: number; z: number; hp: number; exploded: boolean; onExplode: () => void }[],
    playerPos: { x: number; y: number; z: number; radius: number; onHit: (dmg: number) => void },
    pos: THREE.Vector3
  ) {
    if (proj.type === 'rocket' || proj.type === 'bfg') {
      soundManager.playExplosion();
      this.particles.spawnExplosion(pos.x, Math.max(0.2, pos.y), pos.z, proj.type === 'bfg' ? 70 : 45);

      // Splash damage
      const radius = proj.splashRadius;
      if (radius > 0) {
        // Damage enemies
        for (const enemy of enemies) {
          if (enemy.hp <= 0) continue;
          const d = Math.hypot(enemy.x - pos.x, enemy.z - pos.z);
          if (d < radius) {
            const falloff = 1 - d / radius;
            const splashDmg = Math.round(proj.damage * falloff);
            enemy.onHit(splashDmg);
          }
        }

        // Damage barrels
        for (const barrel of barrels) {
          if (barrel.exploded) continue;
          const d = Math.hypot(barrel.x - pos.x, barrel.z - pos.z);
          if (d < radius) {
            barrel.onExplode();
          }
        }

        // Splash player
        const distToPlayer = Math.hypot(playerPos.x - pos.x, playerPos.z - pos.z);
        if (distToPlayer < radius) {
          const falloff = 1 - distToPlayer / radius;
          playerPos.onHit(Math.round(proj.damage * 0.6 * falloff));
        }
      }
    } else if (proj.type === 'fireball' || proj.type === 'cacoball' || proj.type === 'plasma') {
      this.particles.spawnSparks(pos.x, pos.y, pos.z, 10);
    } else {
      this.particles.spawnSparks(pos.x, pos.y, pos.z, 6);
    }
  }

  private destroyProjectile(index: number) {
    const p = this.projectiles[index];
    this.scene.remove(p.mesh);
    p.mesh.material.dispose();
    if (p.light) {
      this.scene.remove(p.light);
      p.light.dispose();
    }
    this.projectiles.splice(index, 1);
  }

  public clearAll() {
    for (const p of this.projectiles) {
      this.scene.remove(p.mesh);
      p.mesh.material.dispose();
      if (p.light) {
        this.scene.remove(p.light);
        p.light.dispose();
      }
    }
    this.projectiles = [];
  }
}
