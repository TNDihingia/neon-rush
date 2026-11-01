// Web Audio API Synthesizer for Neon Rush
// 100% royalty-free, zero-latency, no external audio files required

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private sfxMuted: boolean = false;
  private musicMuted: boolean = false;

  // Background Music state
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private currentStep: number = 0;
  private musicGainNode: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSettings(settings: {
    sfxVolume: number;
    musicVolume: number;
    sfxMuted: boolean;
    musicMuted: boolean;
  }) {
    this.sfxVolume = settings.sfxVolume;
    this.musicVolume = settings.musicVolume;
    this.sfxMuted = settings.sfxMuted;
    this.musicMuted = settings.musicMuted;

    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(
        this.musicMuted ? 0 : this.musicVolume * 0.35,
        this.ctx.currentTime
      );
    }
  }

  // JUMP SOUND: Punchy upward pitch sweep
  public playJump() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);

      gain.gain.setValueAtTime(this.sfxVolume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio playback fallback
    }
  }

  // DOUBLE JUMP SOUND: Higher pitch harmonic sweep
  public playDoubleJump() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.14);

      gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch {
      // Fallback
    }
  }

  // COIN PICKUP SOUND: Sparkling high-tech crystal chime
  public playCoin() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.04;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch {
      // Fallback
    }
  }

  // NEAR-MISS SOUND: Fast energetic cyber whoosh
  public playNearMiss() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.value = 4.0;

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Fallback
    }
  }

  // COLLISION SOUND: Impact sub-bass thump + noise burst
  public playCollision() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Sub-bass drop
      const osc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      bassGain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);

      // 2. White noise explosion burst
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.26);
    } catch {
      // Fallback
    }
  }

  // MILESTONE / SPEED UP SOUND: Synth fanfare chord
  public playMilestone() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const chord = [293.66, 369.99, 440.0, 587.33]; // D maj chord
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch {
      // Fallback
    }
  }

  // BUTTON CLICK: Subtle futuristic blip
  public playClick() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Fallback
    }
  }

  // BACKGROUND SYNTHWAVE MUSIC ENGINE
  // Procedural driving synth bassline + arpeggiator in D-Minor
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.currentStep = 0;

    // Master music gain node
    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(
      this.musicMuted ? 0 : this.musicVolume * 0.35,
      this.ctx.currentTime
    );
    this.musicGainNode.connect(this.ctx.destination);

    // 126 BPM -> 16th note ~ 119ms
    const stepDuration = 0.12;

    // Chord root notes: D2, F2, C2, G2
    const roots = [73.42, 87.31, 65.41, 98.00];
    // Arpeggio scales: D Dorian (D4, F4, G4, A4, C5, D5)
    const arpNotes = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33];

    const playStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;

      const now = this.ctx.currentTime;
      const bar = Math.floor(this.currentStep / 16) % roots.length;
      const stepInBar = this.currentStep % 16;
      const rootFreq = roots[bar];

      // 1. Kick on beats 0, 4, 8, 12
      if (stepInBar % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.08);

        kickGain.gain.setValueAtTime(0.5, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGainNode);
        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
      }

      // 2. Snare / Clack on beats 4 and 12
      if (stepInBar === 4 || stepInBar === 12) {
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(260, now);
        snareOsc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

        snareGain.gain.setValueAtTime(0.35, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        snareOsc.connect(snareGain);
        snareGain.connect(this.musicGainNode);
        snareOsc.start(now);
        snareOsc.stop(now + 0.08);
      }

      // 3. Driving Synth Bass (16th notes with syncopation)
      if (stepInBar % 2 === 0 || stepInBar === 3 || stepInBar === 7 || stepInBar === 11 || stepInBar === 15) {
        const bassOsc = this.ctx.createOscillator();
        const bassFilter = this.ctx.createBiquadFilter();
        const bassGain = this.ctx.createGain();

        const octave = (stepInBar === 3 || stepInBar === 11) ? 2 : 1;
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(rootFreq * octave, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(420, now);
        bassFilter.frequency.exponentialRampToValueAtTime(120, now + 0.1);

        bassGain.gain.setValueAtTime(0.3, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicGainNode);

        bassOsc.start(now);
        bassOsc.stop(now + 0.12);
      }

      // 4. Arpeggiator Lead melody
      if (stepInBar % 2 === 1) {
        const arpIndex = (stepInBar * 3 + bar * 2) % arpNotes.length;
        const arpFreq = arpNotes[arpIndex];

        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();
        arpOsc.type = 'sine';
        arpOsc.frequency.setValueAtTime(arpFreq, now);

        arpGain.gain.setValueAtTime(0.18, now);
        arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        arpOsc.connect(arpGain);
        arpGain.connect(this.musicGainNode);

        arpOsc.start(now);
        arpOsc.stop(now + 0.15);
      }

      this.currentStep = (this.currentStep + 1) % 64;
    };

    this.musicInterval = setInterval(playStep, stepDuration * 1000);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicGainNode && this.ctx) {
      try {
        this.musicGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {
        // Safe ignore
      }
    }
  }
}

export const audio = new SoundEngine();
