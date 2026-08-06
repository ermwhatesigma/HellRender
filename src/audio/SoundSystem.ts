// Web Audio API procedural sound generator and heavy metal synthesizer

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private soundVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private heartbeatInterval: number | null = null;

  constructor() {
    // Lazy init audio context on first user interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.soundVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number) {
    this.soundVolume = Math.max(0, Math.min(1, sfx));
    this.musicVolume = Math.max(0, Math.min(1, music));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.soundVolume, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolumes(this.soundVolume, this.musicVolume);
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  public playPistol() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noise = this.createNoiseBuffer(0.08);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    osc.connect(gain);
    noiseNode.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 0.12);
    noiseNode.stop(t + 0.12);
  }

  public playShotgun() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.35);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.35);

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    noiseNode.connect(filter);
    filter.connect(gain);
    osc.connect(gain);
    gain.connect(this.sfxGain);

    noiseNode.start(t);
    osc.start(t);
    noiseNode.stop(t + 0.36);
    osc.stop(t + 0.36);

    // Pump action sound after 0.45s
    setTimeout(() => {
      this.playShotgunPump();
    }, 380);
  }

  public playShotgunPump() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    
    // Click-clack metallic sound
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);

    // Second click
    setTimeout(() => {
      if (!this.ctx || !this.sfxGain) return;
      const t2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1100, t2);
      osc2.frequency.exponentialRampToValueAtTime(300, t2 + 0.06);
      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.35, t2);
      gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.06);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(t2);
      osc2.stop(t2 + 0.07);
    }, 120);
  }

  public playSuperShotgun() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.5);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.5);

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.exponentialRampToValueAtTime(20, t + 0.45);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    noiseNode.connect(filter);
    filter.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.sfxGain);

    noiseNode.start(t);
    subOsc.start(t);
    noiseNode.stop(t + 0.52);
    subOsc.stop(t + 0.52);

    setTimeout(() => {
      this.playShotgunPump();
    }, 600);
  }

  public playChaingun() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.07);

    const noise = this.createNoiseBuffer(0.06);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    noiseNode.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 0.08);
    noiseNode.stop(t + 0.08);
  }

  public playRocketLaunch() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(450, t + 0.25);

    const noise = this.createNoiseBuffer(0.3);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noiseNode.connect(filter);
    filter.connect(gain);
    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 0.3);
    noiseNode.stop(t + 0.3);
  }

  public playExplosion() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.8);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.frequency.exponentialRampToValueAtTime(40, t + 0.8);

    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(20, t + 0.7);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

    noiseNode.connect(filter);
    filter.connect(gain);
    sub.connect(gain);
    gain.connect(this.sfxGain);

    noiseNode.start(t);
    sub.start(t);
    noiseNode.stop(t + 0.82);
    sub.stop(t + 0.82);
  }

  public playPlasma() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, t);
    osc2.frequency.exponentialRampToValueAtTime(200, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.16);
    osc2.stop(t + 0.16);
  }

  public playLaser() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playRailgun() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.4);

    const noise = this.createNoiseBuffer(0.4);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.value = 8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 0.46);
    noiseNode.stop(t + 0.46);
  }

  public playFlamethrower() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.15);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450 + Math.random() * 200, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noiseNode.start(t);
    noiseNode.stop(t + 0.15);
  }

  public playBFGCharge() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.7);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(1.0, t + 0.65);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.72);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.72);
  }

  public playBFGFire() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.2);

    const noise = this.createNoiseBuffer(1.2);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.Q.value = 4.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

    osc.connect(gain);
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 1.25);
    noiseNode.stop(t + 1.25);
  }

  public playHitmarker() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playPunch() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    const noise = this.createNoiseBuffer(0.08);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    noiseNode.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 0.1);
    noiseNode.stop(t + 0.1);
  }

  public playDemonGrowl() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(65, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.46);
  }

  public playDemonHurt() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playDemonDie() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.6);

    const noise = this.createNoiseBuffer(0.4);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

    osc.connect(gain);
    noiseNode.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 0.66);
    noiseNode.stop(t + 0.66);
  }

  public playImpFireball() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(120, t + 0.25);

    const noise = this.createNoiseBuffer(0.25);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    noiseNode.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 0.26);
    noiseNode.stop(t + 0.26);
  }

  public playPlayerHurt() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playItemPickup() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(660, t + 0.06);
    osc.frequency.setValueAtTime(880, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playWeaponPickup() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [330, 440, 550, 660, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.05 + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.11);
    });
  }

  public playKeycardPickup() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.setValueAtTime(880, t + 0.08); // A5
    osc.frequency.setValueAtTime(1174.66, t + 0.16); // D6

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playDoorOpen() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(130, t + 0.4);

    const noise = this.createNoiseBuffer(0.4);
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    noiseNode.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noiseNode.start(t);
    osc.stop(t + 0.46);
    noiseNode.stop(t + 0.46);
  }

  public playDoorLocked() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.setValueAtTime(130, t + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playSecretRevealed() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [440, 554, 659, 880, 1108];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.32);
    });
  }

  public playTeleport() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playReload() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.setValueAtTime(900, t + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // --- PROCEDURAL HEAVY METAL SYNTH BGM ---

  public startMusic(track: 'hangar' | 'toxic' | 'hell' | 'arena' = 'hangar') {
    this.init();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Metal chord progressions / riffs for each track
    // E1M1-inspired heavy E-minor / riff
    const eMinorRiff = [
      41.2, 41.2, 82.4, 41.2, 41.2, 73.4, 41.2, 41.2,
      65.4, 41.2, 41.2, 61.7, 65.4, 73.4, 41.2, 41.2,
    ];

    const toxicRiff = [
      36.7, 36.7, 73.4, 36.7, 77.8, 36.7, 82.4, 36.7,
      73.4, 36.7, 36.7, 65.4, 69.3, 73.4, 36.7, 36.7,
    ];

    const hellRiff = [
      32.7, 32.7, 65.4, 32.7, 69.3, 32.7, 73.4, 32.7,
      65.4, 32.7, 32.7, 58.3, 61.7, 65.4, 32.7, 32.7,
    ];

    const currentRiff = track === 'toxic' ? toxicRiff : track === 'hell' ? hellRiff : eMinorRiff;
    const tempoMs = 135; // ~110 BPM 16th notes

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted || !this.isMusicPlaying) return;
      const t = this.ctx.currentTime;
      const step = this.musicStep % 16;
      const bar = Math.floor(this.musicStep / 16) % 4;

      // 1. Bass / Guitar Distorted Sawtooth note
      const baseFreq = currentRiff[step] * (bar === 2 ? 1.122 : bar === 3 ? 1.26 : 1);
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, t);

      // Distortion filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(step % 4 === 0 ? 2200 : 900, t);
      filter.Q.value = 4;

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.22, t);
      noteGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.13);

      // 2. Synthesized Metal Drum Beat
      // Kick on 0, 4, 8, 12, and syncopated 10
      if (step === 0 || step === 4 || step === 8 || step === 12 || step === 10) {
        const kickOsc = this.ctx.createOscillator();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, t);
        kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.1);

        const kickGain = this.ctx.createGain();
        kickGain.gain.setValueAtTime(0.4, t);
        kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.11);
      }

      // Snare on 4, 12
      if (step === 4 || step === 12) {
        const snareNoise = this.createNoiseBuffer(0.12);
        const snareNode = this.ctx.createBufferSource();
        snareNode.buffer = snareNoise;

        const snareFilter = this.ctx.createBiquadFilter();
        snareFilter.type = 'highpass';
        snareFilter.frequency.setValueAtTime(800, t);

        const snareGain = this.ctx.createGain();
        snareGain.gain.setValueAtTime(0.3, t);
        snareGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        snareNode.connect(snareFilter);
        snareFilter.connect(snareGain);
        snareGain.connect(this.musicGain);
        snareNode.start(t);
        snareNode.stop(t + 0.13);
      }

      // Hi-hat on every odd step
      if (step % 2 === 1) {
        const hhNoise = this.createNoiseBuffer(0.04);
        const hhNode = this.ctx.createBufferSource();
        hhNode.buffer = hhNoise;

        const hhFilter = this.ctx.createBiquadFilter();
        hhFilter.type = 'highpass';
        hhFilter.frequency.setValueAtTime(6000, t);

        const hhGain = this.ctx.createGain();
        hhGain.gain.setValueAtTime(0.1, t);
        hhGain.gain.exponentialRampToValueAtTime(0.005, t + 0.04);

        hhNode.connect(hhFilter);
        hhFilter.connect(hhGain);
        hhGain.connect(this.musicGain);
        hhNode.start(t);
        hhNode.stop(t + 0.05);
      }

      this.musicStep++;
    }, tempoMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public setLowHpHeartbeat(active: boolean) {
    if (active && !this.heartbeatInterval) {
      this.heartbeatInterval = window.setInterval(() => {
        if (!this.ctx || !this.sfxGain || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(70, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.16);

        // Double bump
        setTimeout(() => {
          if (!this.ctx || !this.sfxGain) return;
          const t2 = this.ctx.currentTime;
          const osc2 = this.ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(80, t2);
          osc2.frequency.exponentialRampToValueAtTime(40, t2 + 0.12);
          const gain2 = this.ctx.createGain();
          gain2.gain.setValueAtTime(0.5, t2);
          gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.12);
          osc2.connect(gain2);
          gain2.connect(this.sfxGain);
          osc2.start(t2);
          osc2.stop(t2 + 0.13);
        }, 180);
      }, 900);
    } else if (!active && this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    const sampleRate = this.ctx.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

export const soundManager = new SoundSystem();
