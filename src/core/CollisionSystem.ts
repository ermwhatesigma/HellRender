import { LevelDefinition } from '../types/game';

export class CollisionSystem {
  private level: LevelDefinition;
  private cellSize: number = 2; // World size per grid cell

  constructor(level: LevelDefinition) {
    this.level = level;
  }

  public setLevel(level: LevelDefinition) {
    this.level = level;
  }

  // Check if a point (world coords) is inside a solid tile
  public isSolid(worldX: number, worldZ: number, isNoClip: boolean = false): boolean {
    if (isNoClip) return false;

    const gx = Math.floor(worldX / this.cellSize);
    const gz = Math.floor(worldZ / this.cellSize);

    if (gx < 0 || gx >= this.level.width || gz < 0 || gz >= this.level.height) {
      return true; // Out of bounds is solid
    }

    const cell = this.level.grid[gz]?.[gx];
    // Solid tiles: 1, 2, 3, 8 (secret push wall before opening)
    if (cell === 1 || cell === 2 || cell === 3 || cell === 8) {
      return true;
    }

    // Check doors
    for (const door of this.level.doors) {
      if (door.x === gx && door.z === gz) {
        // If door is closed or partially closed
        if (door.progress < 0.65) {
          const doorCenterX = door.x * this.cellSize + this.cellSize / 2;
          const doorCenterZ = door.z * this.cellSize + this.cellSize / 2;
          const halfThick = 0.35;
          const halfLen = this.cellSize / 2;

          if (door.orientation === 'horizontal') {
            if (
              Math.abs(worldX - doorCenterX) <= halfLen &&
              Math.abs(worldZ - doorCenterZ) <= halfThick
            ) {
              return true;
            }
          } else {
            if (
              Math.abs(worldX - doorCenterX) <= halfThick &&
              Math.abs(worldZ - doorCenterZ) <= halfLen
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  // Check hazard tiles (Acid = 5, Lava = 6)
  public getHazardDamage(worldX: number, worldZ: number, isNoClip: boolean = false): number {
    if (isNoClip) return 0;
    const gx = Math.floor(worldX / this.cellSize);
    const gz = Math.floor(worldZ / this.cellSize);

    if (gx < 0 || gx >= this.level.width || gz < 0 || gz >= this.level.height) return 0;
    const cell = this.level.grid[gz]?.[gx];
    if (cell === 5) return 15; // Acid 15 dmg/sec
    if (cell === 6) return 30; // Lava 30 dmg/sec
    return 0;
  }

  // Unstuck resolution: If player is stuck inside a wall or closed door, push them out to nearest safe spot
  public unstuckPosition(x: number, z: number, radius: number = 0.28, isNoClip: boolean = false): { x: number; z: number } {
    if (isNoClip || !this.checkCircleSolid(x, z, radius, isNoClip)) {
      return { x, z };
    }

    // Search outward in concentric rings
    const angles = 16;
    const distances = [0.08, 0.16, 0.3, 0.5, 0.8, 1.2];

    for (const dist of distances) {
      for (let i = 0; i < angles; i++) {
        const theta = (i * Math.PI * 2) / angles;
        const testX = x + Math.cos(theta) * dist;
        const testZ = z + Math.sin(theta) * dist;
        if (!this.checkCircleSolid(testX, testZ, radius, isNoClip)) {
          return { x: testX, z: testZ };
        }
      }
    }

    return { x, z };
  }

  // Circle collision test against walls with sliding and corner smoothing
  public resolveCircleCollision(
    currentX: number,
    currentZ: number,
    targetX: number,
    targetZ: number,
    radius: number = 0.28,
    isNoClip: boolean = false
  ): { x: number; z: number; collided: boolean } {
    // Immediate full pass-through if NoClip is active
    if (isNoClip) {
      return { x: targetX, z: targetZ, collided: false };
    }

    // First ensure current position isn't stuck inside geometry
    const unStuck = this.unstuckPosition(currentX, currentZ, radius, isNoClip);
    let startX = unStuck.x;
    let startZ = unStuck.z;

    // 1. Direct diagonal check
    if (!this.checkCircleSolid(targetX, targetZ, radius, isNoClip)) {
      return { x: targetX, z: targetZ, collided: false };
    }

    let finalX = startX;
    let finalZ = startZ;
    let collided = false;

    // 2. Test X-axis movement
    if (!this.checkCircleSolid(targetX, startZ, radius, isNoClip)) {
      finalX = targetX;
    } else {
      collided = true;
    }

    // 3. Test Z-axis movement
    if (!this.checkCircleSolid(finalX, targetZ, radius, isNoClip)) {
      finalZ = targetZ;
    } else if (!this.checkCircleSolid(startX, targetZ, radius, isNoClip)) {
      finalZ = targetZ;
    } else {
      collided = true;
    }

    // 4. Corner deflector: if movement was completely blocked but player is moving diagonally, test 45-degree slide
    if (finalX === startX && finalZ === startZ && (targetX !== startX || targetZ !== startZ)) {
      const dx = targetX - startX;
      const dz = targetZ - startZ;
      const len = Math.hypot(dx, dz);
      if (len > 0.001) {
        const step = len * 0.5;
        // Try perp vectors
        const perp1X = startX - (dz / len) * step;
        const perp1Z = startZ + (dx / len) * step;
        const perp2X = startX + (dz / len) * step;
        const perp2Z = startZ - (dx / len) * step;

        if (!this.checkCircleSolid(perp1X, perp1Z, radius, isNoClip)) {
          finalX = perp1X;
          finalZ = perp1Z;
        } else if (!this.checkCircleSolid(perp2X, perp2Z, radius, isNoClip)) {
          finalX = perp2X;
          finalZ = perp2Z;
        }
      }
    }

    return { x: finalX, z: finalZ, collided };
  }

  private checkCircleSolid(x: number, z: number, radius: number, isNoClip: boolean = false): boolean {
    if (isNoClip) return false;
    // Check center
    if (this.isSolid(x, z, isNoClip)) return true;

    // Check 8 points around circle perimeter
    const samples = 8;
    for (let i = 0; i < samples; i++) {
      const angle = (i * Math.PI * 2) / samples;
      const px = x + Math.cos(angle) * radius;
      const pz = z + Math.sin(angle) * radius;
      if (this.isSolid(px, pz, isNoClip)) {
        return true;
      }
    }
    return false;
  }

  // Raycast line of sight between two world points
  public hasLineOfSight(x1: number, z1: number, x2: number, z2: number): boolean {
    const dist = Math.hypot(x2 - x1, z2 - z1);
    if (dist < 0.1) return true;

    const steps = Math.ceil(dist / 0.35);
    const dx = (x2 - x1) / steps;
    const dz = (z2 - z1) / steps;

    for (let i = 1; i < steps; i++) {
      const checkX = x1 + dx * i;
      const checkZ = z1 + dz * i;
      if (this.isSolid(checkX, checkZ)) {
        return false;
      }
    }
    return true;
  }
}
