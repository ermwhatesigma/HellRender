import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 600;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private pointsMesh: THREE.Points;
  private positions: Float32Array;
  private colors: Float32Array;

  constructor(scene: THREE.Scene) {
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Particle sprite circle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const particleTex = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      map: particleTex,
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.material);
    this.pointsMesh.frustumCulled = false;
    scene.add(this.pointsMesh);
  }

  public spawnBlood(x: number, y: number, z: number, count: number = 14, isGreen: boolean = false) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const col = isGreen 
        ? new THREE.Color(0.1 + Math.random() * 0.2, 0.8 + Math.random() * 0.2, 0.1)
        : new THREE.Color(0.7 + Math.random() * 0.3, 0.05, 0.05);

      this.particles.push({
        position: new THREE.Vector3(x + (Math.random() - 0.5) * 0.2, y + (Math.random() - 0.5) * 0.2, z + (Math.random() - 0.5) * 0.2),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3.5,
          Math.random() * 2.5 + 0.5,
          (Math.random() - 0.5) * 3.5
        ),
        color: col,
        size: 0.12,
        alpha: 1.0,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        gravity: 9.8,
      });
    }
  }

  public spawnSparks(x: number, y: number, z: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();

      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 3,
          (Math.random() - 0.5) * 4
        ),
        color: new THREE.Color(1.0, 0.8 + Math.random() * 0.2, 0.2),
        size: 0.08,
        alpha: 1.0,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.2,
        gravity: 5.0,
      });
    }
  }

  public spawnExplosion(x: number, y: number, z: number, count: number = 40) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();

      const speed = Math.random() * 6 + 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const isSmoke = Math.random() > 0.6;
      const col = isSmoke 
        ? new THREE.Color(0.2, 0.2, 0.2)
        : new THREE.Color(1.0, 0.3 + Math.random() * 0.5, 0.05);

      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.cos(phi) * speed + 1,
          Math.sin(phi) * Math.sin(theta) * speed
        ),
        color: col,
        size: isSmoke ? 0.25 : 0.18,
        alpha: 1.0,
        life: 0,
        maxLife: isSmoke ? 0.9 : 0.45,
        gravity: isSmoke ? -1.0 : 3.0,
      });
    }
  }

  public spawnPickupSparkles(x: number, y: number, z: number, colorHex: number = 0x38bdf8) {
    for (let i = 0; i < 12; i++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();

      this.particles.push({
        position: new THREE.Vector3(x + (Math.random() - 0.5) * 0.4, y + (Math.random() - 0.5) * 0.4, z + (Math.random() - 0.5) * 0.4),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.2,
          Math.random() * 2.0 + 0.5,
          (Math.random() - 0.5) * 1.2
        ),
        color: new THREE.Color(colorHex),
        size: 0.1,
        alpha: 1.0,
        life: 0,
        maxLife: 0.6,
        gravity: -0.5,
      });
    }
  }

  public spawnSmokePuff(x: number, y: number, z: number) {
    if (this.particles.length >= this.maxParticles) this.particles.shift();

    this.particles.push({
      position: new THREE.Vector3(x, y, z),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        Math.random() * 0.8 + 0.2,
        (Math.random() - 0.5) * 0.5
      ),
      color: new THREE.Color(0.6, 0.6, 0.6),
      size: 0.15,
      alpha: 0.8,
      life: 0,
      maxLife: 0.4,
      gravity: -1.0,
    });
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.position.z += p.velocity.z * dt;
      p.velocity.y -= p.gravity * dt;

      // Bounce/stop at floor
      if (p.position.y < 0.05) {
        p.position.y = 0.05;
        p.velocity.y = -p.velocity.y * 0.3;
        p.velocity.x *= 0.6;
        p.velocity.z *= 0.6;
      }
    }

    // Update buffer attributes
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = this.geometry.attributes.color as THREE.BufferAttribute;

    const count = this.particles.length;
    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      const i3 = i * 3;
      this.positions[i3] = p.position.x;
      this.positions[i3 + 1] = p.position.y;
      this.positions[i3 + 2] = p.position.z;

      const fade = 1 - p.life / p.maxLife;
      this.colors[i3] = p.color.r * fade;
      this.colors[i3 + 1] = p.color.g * fade;
      this.colors[i3 + 2] = p.color.b * fade;
    }

    // Zero out unused slots
    for (let i = count; i < this.maxParticles; i++) {
      const i3 = i * 3;
      this.positions[i3] = 0;
      this.positions[i3 + 1] = -9999;
      this.positions[i3 + 2] = 0;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
