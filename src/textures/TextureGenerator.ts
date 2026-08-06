import * as THREE from 'three';

// Procedural Canvas Texture Generator for high-performance retro DOOM aesthetics
class TextureGenerator {
  private cache: Map<string, THREE.CanvasTexture> = new Map();

  // Helper to create canvas
  private createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false; // Keep crisp pixelated retro look
    return { canvas, ctx };
  }

  // --- WALL TEXTURES ---

  public getTechWallTexture(): THREE.CanvasTexture {
    if (this.cache.has('tech_wall')) return this.cache.get('tech_wall')!;

    const { canvas, ctx } = this.createCanvas(128, 128);
    // Base metal
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 0, 128, 128);

    // Metal plates grid
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 120, 120);
    ctx.strokeRect(16, 16, 96, 96);

    // Hazard stripes at bottom
    for (let i = 0; i < 128; i += 16) {
      ctx.fillStyle = (i / 16) % 2 === 0 ? '#ecc94b' : '#1a202c';
      ctx.beginPath();
      ctx.moveTo(i, 112);
      ctx.lineTo(i + 12, 112);
      ctx.lineTo(i - 4, 128);
      ctx.lineTo(i - 16, 128);
      ctx.fill();
    }

    // Rivets
    ctx.fillStyle = '#cbd5e0';
    const rivets = [
      [8, 8], [120, 8], [8, 120], [120, 120],
      [20, 20], [108, 20], [20, 108], [108, 108],
      [64, 8], [64, 120], [8, 64], [120, 64]
    ];
    rivets.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(x - 1, y - 1, 2, 2);
      ctx.fillStyle = '#cbd5e0';
    });

    // Computer screen / vents in center
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(32, 32, 64, 48);
    // Screen glowing lines
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(36, 40, 56, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(36, 50, 40, 4);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(36, 60, 48, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('UAC SEC-01', 38, 74);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.cache.set('tech_wall', texture);
    return texture;
  }

  public getToxicWallTexture(): THREE.CanvasTexture {
    if (this.cache.has('toxic_wall')) return this.cache.get('toxic_wall')!;

    const { canvas, ctx } = this.createCanvas(128, 128);
    // Rust-green corroded metal
    ctx.fillStyle = '#3f4e3c';
    ctx.fillRect(0, 0, 128, 128);

    // Rust patches
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(10, 10, 40, 50);
    ctx.fillRect(80, 60, 40, 60);

    // Slime drips
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(38, 70);
    ctx.arc(34, 70, 4, 0, Math.PI);
    ctx.lineTo(30, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(90, 0);
    ctx.lineTo(100, 95);
    ctx.arc(95, 95, 5, 0, Math.PI);
    ctx.lineTo(90, 0);
    ctx.fill();

    // Biohazard symbol
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 64, 18, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.cache.set('toxic_wall', texture);
    return texture;
  }

  public getHellWallTexture(): THREE.CanvasTexture {
    if (this.cache.has('hell_wall')) return this.cache.get('hell_wall')!;

    const { canvas, ctx } = this.createCanvas(128, 128);
    // Dark volcanic hell stone
    ctx.fillStyle = '#261214';
    ctx.fillRect(0, 0, 128, 128);

    // Stone brick patterns
    ctx.strokeStyle = '#4a151b';
    ctx.lineWidth = 3;
    for (let y = 0; y < 128; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
      const offset = (y / 32) % 2 === 0 ? 0 : 32;
      for (let x = offset; x < 128; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 32);
        ctx.stroke();
      }
    }

    // Fiery demonic veins
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 128);
    ctx.quadraticCurveTo(40, 80, 64, 64);
    ctx.quadraticCurveTo(90, 40, 118, 0);
    ctx.stroke();

    // Glowing skull / pentagram in center
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = 64 + Math.cos(angle) * 20;
      const y = 64 + Math.sin(angle) * 20;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.cache.set('hell_wall', texture);
    return texture;
  }

  public getCryoWallTexture(): THREE.CanvasTexture {
    if (this.cache.has('cryo_wall')) return this.cache.get('cryo_wall')!;

    const { canvas, ctx } = this.createCanvas(128, 128);
    // Frost white-blue subzero lab metal
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 128, 128);

    // Cyan glowing conduits
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 112, 112);

    ctx.fillStyle = '#0891b2';
    ctx.fillRect(20, 20, 88, 88);

    // Ice crystal patterns
    ctx.strokeStyle = '#a5f3fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64, 20); ctx.lineTo(64, 108);
    ctx.moveTo(20, 64); ctx.lineTo(108, 64);
    ctx.moveTo(32, 32); ctx.lineTo(96, 96);
    ctx.moveTo(32, 96); ctx.lineTo(96, 32);
    ctx.stroke();

    // Frost center core
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(64, 64, 14, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.cache.set('cryo_wall', texture);
    return texture;
  }

  public getDoorTexture(keyColor?: 'blue' | 'yellow' | 'red' | 'exit'): THREE.CanvasTexture {
    const key = `door_${keyColor || 'normal'}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(128, 128);
    // Heavy blast door
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 128, 128);

    // Frame
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 128, 8);
    ctx.fillRect(0, 120, 128, 8);
    ctx.fillRect(0, 0, 8, 128);
    ctx.fillRect(120, 0, 8, 128);

    // Center vertical split line
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(62, 0, 4, 128);

    // Door bevel panels
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, 42, 96);
    ctx.strokeRect(70, 16, 42, 96);

    // Keycard light bar / warning
    if (keyColor === 'blue') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(20, 54, 34, 20);
      ctx.fillRect(74, 54, 34, 20);
      ctx.fillStyle = '#e0f2fe';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('BLUE KEY', 38, 68);
    } else if (keyColor === 'yellow') {
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(20, 54, 34, 20);
      ctx.fillRect(74, 54, 34, 20);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('YELLOW', 42, 68);
    } else if (keyColor === 'red') {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(20, 54, 34, 20);
      ctx.fillRect(74, 54, 34, 20);
      ctx.fillStyle = '#fee2e2';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('RED KEY', 40, 68);
    } else if (keyColor === 'exit') {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(20, 54, 34, 20);
      ctx.fillRect(74, 54, 34, 20);
      ctx.fillStyle = '#bbf7d0';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('EXIT', 50, 68);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(48, 58, 32, 12);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(64, 64, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.cache.set(key, texture);
    return texture;
  }

  public getFloorTexture(type: 'tech' | 'toxic' | 'hell' | 'cryo'): THREE.CanvasTexture {
    const key = `floor_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(64, 64);
    if (type === 'tech') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 60, 60);
      // diamond tread grid
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let i = 0; i < 64; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 32, 64);
        ctx.stroke();
      }
    } else if (type === 'toxic') {
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, 0, 64, 64);
      // Bright bubbling slime
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(20, 20, 10, 0, Math.PI * 2);
      ctx.arc(48, 44, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(22, 18, 4, 0, Math.PI * 2);
      ctx.arc(50, 42, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'cryo') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, 56, 56);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(16, 16, 32, 32);
    } else {
      // Hell magma floor
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(30, 40);
      ctx.lineTo(64, 30);
      ctx.moveTo(20, 64);
      ctx.lineTo(30, 40);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(28, 38, 6, 6);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.cache.set(key, texture);
    return texture;
  }

  public getCeilingTexture(theme: 'tech' | 'toxic' | 'hell' | 'cryo'): THREE.CanvasTexture {
    const key = `ceiling_${theme}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(64, 64);
    ctx.fillStyle = theme === 'hell' ? '#1c1012' : theme === 'cryo' ? '#082f49' : '#0f172a';
    ctx.fillRect(0, 0, 64, 64);

    // Ceiling lights
    ctx.fillStyle = theme === 'hell' ? '#7f1d1d' : theme === 'cryo' ? '#0284c7' : '#334155';
    ctx.fillRect(8, 8, 48, 48);

    ctx.fillStyle = theme === 'hell' ? '#f87171' : theme === 'cryo' ? '#38bdf8' : '#e2e8f0';
    ctx.fillRect(24, 24, 16, 16);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    this.cache.set(key, texture);
    return texture;
  }

  public getSkyTexture(theme: 'tech' | 'toxic' | 'hell' | 'cryo'): THREE.CanvasTexture {
    const key = `sky_${theme}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(512, 256);
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    if (theme === 'hell') {
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.5, '#450a0a');
      grad.addColorStop(1, '#991b1b');
    } else if (theme === 'toxic') {
      grad.addColorStop(0, '#022c22');
      grad.addColorStop(0.6, '#064e3b');
      grad.addColorStop(1, '#047857');
    } else {
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.7, '#1e1b4b');
      grad.addColorStop(1, '#3b0764');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Distant mountain silhouette / jagged horizon
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, 256);
    for (let x = 0; x <= 512; x += 16) {
      const h = 180 + Math.sin(x * 0.05) * 30 + Math.cos(x * 0.02) * 20;
      ctx.lineTo(x, h);
    }
    ctx.lineTo(512, 256);
    ctx.closePath();
    ctx.fill();

    // Stars or hell sparks
    ctx.fillStyle = theme === 'hell' ? '#fca5a5' : '#ffffff';
    for (let i = 0; i < 80; i++) {
      const sx = Math.random() * 512;
      const sy = Math.random() * 160;
      ctx.fillRect(sx, sy, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    this.cache.set(key, texture);
    return texture;
  }

  // --- ENEMY SPRITE GENERATION ---

  public getEnemyTexture(type: string, frame: 'idle' | 'walk1' | 'walk2' | 'attack' | 'hurt' | 'die'): THREE.CanvasTexture {
    const key = `enemy_${type}_${frame}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(64, 64);
    ctx.clearRect(0, 0, 64, 64);

    const isDie = frame === 'die';
    const isHurt = frame === 'hurt';
    const isAttack = frame === 'attack';
    const legOffset = frame === 'walk1' ? -4 : frame === 'walk2' ? 4 : 0;

    if (type === 'zombie') {
      // Green armor military zombie
      ctx.fillStyle = isHurt ? '#ef4444' : '#15803d'; // armor
      if (!isDie) {
        // Legs
        ctx.fillStyle = '#374151';
        ctx.fillRect(22 + legOffset, 42, 8, 20);
        ctx.fillRect(34 - legOffset, 42, 8, 20);
        // Boots
        ctx.fillStyle = '#111827';
        ctx.fillRect(20 + legOffset, 58, 12, 6);
        ctx.fillRect(32 - legOffset, 58, 12, 6);

        // Body / Vest
        ctx.fillStyle = isHurt ? '#f87171' : '#166534';
        ctx.fillRect(20, 20, 24, 24);

        // Head (decayed skin)
        ctx.fillStyle = '#a3e635';
        ctx.fillRect(24, 6, 16, 14);
        // Eyes
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(26, 10, 4, 3);
        ctx.fillRect(34, 10, 4, 3);
        // Helmet
        ctx.fillStyle = '#14532d';
        ctx.fillRect(22, 4, 20, 6);

        // Rifle in hands
        ctx.fillStyle = '#1f2937';
        if (isAttack) {
          ctx.fillRect(28, 24, 28, 8);
          // Muzzle flash
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(58, 28, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(34, 24, 12, 18);
        }
      } else {
        // Dead corpse on ground
        ctx.fillStyle = '#991b1b'; // blood pool
        ctx.beginPath();
        ctx.arc(32, 54, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#166534';
        ctx.fillRect(16, 48, 32, 12);
      }
    } else if (type === 'imp') {
      // Spiky brown hell Imp
      ctx.fillStyle = isHurt ? '#ef4444' : '#78350f';
      if (!isDie) {
        // Legs
        ctx.fillRect(20 + legOffset, 40, 8, 22);
        ctx.fillRect(36 - legOffset, 40, 8, 22);
        // Claws
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(18 + legOffset, 58, 12, 6);
        ctx.fillRect(34 - legOffset, 58, 12, 6);

        // Torso with spikes
        ctx.fillStyle = isHurt ? '#f87171' : '#92400e';
        ctx.fillRect(18, 18, 28, 24);
        // Shoulder spikes
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(14, 20); ctx.lineTo(18, 16); ctx.lineTo(18, 24); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(50, 20); ctx.lineTo(46, 16); ctx.lineTo(46, 24); ctx.fill();

        // Head
        ctx.fillStyle = '#b45309';
        ctx.fillRect(22, 6, 20, 14);
        // Glowing red eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(26, 10, 4, 3);
        ctx.fillRect(34, 10, 4, 3);

        // Hands & Fireball
        if (isAttack) {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(32, 28, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(32, 28, 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(12, 22, 8, 16);
          ctx.fillRect(44, 22, 8, 16);
        }
      } else {
        // Imp dead gibs
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(32, 52, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(14, 46, 36, 14);
      }
    } else if (type === 'demon') {
      // Pinky Demon (Pink bull bipedal monster)
      ctx.fillStyle = isHurt ? '#ffffff' : '#f43f5e';
      if (!isDie) {
        // Massive muscular legs
        ctx.fillRect(16 + legOffset, 36, 14, 26);
        ctx.fillRect(34 - legOffset, 36, 14, 26);
        // Huge torso
        ctx.fillRect(12, 14, 40, 26);
        // Horns & Head
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(18, 4, 28, 20);
        // Sharp white teeth
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 18, 24, 6);
        // Black eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(24, 8, 4, 4);
        ctx.fillRect(36, 8, 4, 4);
      } else {
        ctx.fillStyle = '#881337';
        ctx.fillRect(10, 44, 44, 18);
      }
    } else if (type === 'lostsoul') {
      // Floating skull enveloped in fire
      if (!isDie) {
        // Fire aura
        const flameGrad = ctx.createRadialGradient(32, 32, 6, 32, 32, 26);
        flameGrad.addColorStop(0, '#fef08a');
        flameGrad.addColorStop(0.5, '#ea580c');
        flameGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fill();

        // White Skull
        ctx.fillStyle = isHurt ? '#ef4444' : '#f8fafc';
        ctx.beginPath();
        ctx.arc(32, 30, 16, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(20, 20); ctx.lineTo(12, 8); ctx.lineTo(24, 16); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(44, 20); ctx.lineTo(52, 8); ctx.lineTo(40, 16); ctx.fill();

        // Glowing red sockets
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(24, 26, 6, 6);
        ctx.fillRect(34, 26, 6, 6);
      } else {
        // Fire burst
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(32, 32, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'cacodemon') {
      // Giant red floating ball with one eye and horns
      if (!isDie) {
        ctx.fillStyle = isHurt ? '#ffffff' : '#dc2626';
        ctx.beginPath();
        ctx.arc(32, 32, 26, 0, Math.PI * 2);
        ctx.fill();

        // Horns on top
        ctx.fillStyle = '#78350f';
        ctx.fillRect(16, 4, 6, 8);
        ctx.fillRect(42, 4, 6, 8);

        // Big single green eye
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(32, 26, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(30, 24, 4, 4);

        // Mouth / teeth
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(18, 40, 28, 10);
        ctx.fillStyle = '#f8fafc';
        for (let i = 20; i < 44; i += 6) {
          ctx.fillRect(i, 40, 4, 4);
          ctx.fillRect(i, 46, 4, 4);
        }
      } else {
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(32, 44, 24, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Cyberdemon / Baron Boss
      ctx.fillStyle = isHurt ? '#ffffff' : '#991b1b';
      if (!isDie) {
        // Massive legs
        ctx.fillRect(14 + legOffset, 34, 16, 28);
        ctx.fillStyle = '#475569'; // Cybernetic metal leg
        ctx.fillRect(34 - legOffset, 34, 16, 28);

        // Massive Body
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(10, 12, 44, 26);

        // Huge Horns
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(16, 12); ctx.lineTo(6, -2); ctx.lineTo(24, 8); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(48, 12); ctx.lineTo(58, -2); ctx.lineTo(40, 8); ctx.fill();

        // Rocket arm launcher
        ctx.fillStyle = '#334155';
        ctx.fillRect(44, 20, 18, 14);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(58, 22, 6, 10);

        // Glowing red eyes
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(24, 8, 6, 4);
        ctx.fillRect(34, 8, 6, 4);
      } else {
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(8, 38, 48, 24);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.cache.set(key, texture);
    return texture;
  }

  // --- PICKUPS & PROPS TEXTURES ---

  public getPickupTexture(type: string): THREE.CanvasTexture {
    const key = `pickup_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(48, 48);
    ctx.clearRect(0, 0, 48, 48);

    if (type.includes('health')) {
      // Medkit / Stimpak
      const isMega = type === 'health_mega';
      ctx.fillStyle = isMega ? '#3b82f6' : '#f8fafc';
      ctx.fillRect(8, 10, 32, 28);
      // Red Cross
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(20, 16, 8, 16);
      ctx.fillRect(16, 20, 16, 8);
      // Metallic handle
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(18, 6, 12, 6);
    } else if (type.includes('armor')) {
      // Green / Blue Armor vest
      const isBlue = type.includes('blue');
      ctx.fillStyle = isBlue ? '#2563eb' : '#16a34a';
      ctx.beginPath();
      ctx.moveTo(12, 10);
      ctx.lineTo(36, 10);
      ctx.lineTo(42, 24);
      ctx.lineTo(24, 44);
      ctx.lineTo(6, 24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(20, 18, 8, 8);
    } else if (type.includes('ammo')) {
      // Ammo Box / Shells / Rockets / Cells
      if (type.includes('shells')) {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(10, 14, 28, 22);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(14, 18, 6, 14);
        ctx.fillRect(22, 18, 6, 14);
        ctx.fillRect(30, 18, 6, 14);
      } else if (type.includes('rockets')) {
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(8, 16, 32, 20);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(24, 8);
        ctx.lineTo(16, 22);
        ctx.lineTo(32, 22);
        ctx.fill();
      } else if (type.includes('cells')) {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(12, 12, 24, 26);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(18, 18, 12, 14);
      } else {
        // Standard bullets
        ctx.fillStyle = '#475569';
        ctx.fillRect(10, 14, 28, 22);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(16, 20, 16, 10);
      }
    } else if (type.includes('key')) {
      // Blue, Yellow, Red Keycard
      const color = type.includes('blue') ? '#0284c7' : type.includes('yellow') ? '#eab308' : '#ef4444';
      ctx.fillStyle = color;
      ctx.fillRect(12, 8, 24, 32);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 14, 16, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(16, 28, 16, 4);
    } else if (type.includes('barrel')) {
      // Explosive radioactive barrel
      ctx.fillStyle = '#166534';
      ctx.fillRect(8, 6, 32, 36);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(8, 16, 32, 8);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('RADIOACTIVE', 9, 22);
    } else {
      // Powerups (Berserk, Invulnerability sphere)
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(24, 24, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fdf2f8';
      ctx.beginPath();
      ctx.arc(20, 20, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.cache.set(key, texture);
    return texture;
  }

  // --- PROJECTILES & PARTICLES ---

  public getProjectileTexture(type: 'bullet' | 'fireball' | 'rocket' | 'plasma' | 'bfg' | 'laser' | 'flame'): THREE.CanvasTexture {
    const key = `proj_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const { canvas, ctx } = this.createCanvas(32, 32);
    ctx.clearRect(0, 0, 32, 32);

    if (type === 'fireball') {
      const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.4, '#f97316');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'rocket') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(10, 12, 12, 8);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(22, 12);
      ctx.lineTo(28, 16);
      ctx.lineTo(22, 20);
      ctx.fill();
    } else if (type === 'plasma') {
      const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(0.5, '#0284c7');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'laser') {
      const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
      grad.addColorStop(0, '#fdf2f8');
      grad.addColorStop(0.5, '#ec4899');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'flame') {
      const grad = ctx.createRadialGradient(16, 16, 3, 16, 16, 15);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.4, '#ea580c');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'bfg') {
      const grad = ctx.createRadialGradient(16, 16, 4, 16, 16, 15);
      grad.addColorStop(0, '#f0fdf4');
      grad.addColorStop(0.5, '#22c55e');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    this.cache.set(key, texture);
    return texture;
  }
}

export const textureManager = new TextureGenerator();
