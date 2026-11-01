import { Player, Obstacle, Collectible, Particle, FloatingText, PlayerSkin, GameSettings } from './types';
import { collision } from './collision';
import { audio } from './audio';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, combo: number) => void;
  onCoinsUpdate: (coins: number) => void;
  onNearMiss: (combo: number) => void;
  onSpeedIncrease: (speedLevel: number) => void;
  onGameOver: (finalScore: number, finalCoins: number, maxCombo: number) => void;
  onAchievementProgress?: (event: string, value: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Game Loop
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Settings & Skin
  private settings: GameSettings;
  private currentSkin: PlayerSkin;

  // Logical dimensions (aspect ratio ~16:9 or auto-scaling)
  public width: number = 960;
  public height: number = 540;
  public groundY: number = 440;

  // Player physics
  private player: Player = {
    x: 120,
    y: 396,
    width: 38,
    height: 38,
    vy: 0,
    rotation: 0,
    isGrounded: true,
    canDoubleJump: true,
    jumpCount: 0,
    trail: [],
    trailTimer: 0,
  };

  private gravity: number = 1850;
  private jumpForce: number = -620;
  private doubleJumpForce: number = -560;

  // Input buffering & Coyote time
  private jumpBufferTime: number = 0; // In seconds
  private coyoteTime: number = 0;     // In seconds

  // Game Progression
  public score: number = 0;
  public coins: number = 0;
  public combo: number = 1;
  public maxComboThisRun: number = 1;
  public comboTimer: number = 0;
  private readonly COMBO_TIMEOUT: number = 3.8;

  // Speed scaling
  public baseSpeed: number = 380;
  public currentSpeed: number = 380;
  public speedLevel: number = 1;
  public survivalTime: number = 0;
  private speedTimer: number = 0;
  private readonly SPEED_INTERVAL: number = 15; // Speed increase every 15s

  // Spawning
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  private nextObstacleDistance: number = 400;
  private obstacleIdCounter: number = 0;
  private collectibleIdCounter: number = 0;
  private floatingTextCounter: number = 0;

  // Screen shake
  private screenTrauma: number = 0;

  // Background visual offsets
  private gridOffset: number = 0;
  private stars: { x: number; y: number; size: number; speed: number; alpha: number }[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    skin: PlayerSkin,
    settings: GameSettings,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2D context from canvas');
    this.ctx = ctx;
    this.currentSkin = skin;
    this.settings = settings;
    this.callbacks = callbacks;

    this.initStars();
    this.resizeCanvas();
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.groundY - 60),
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.4 + 0.1,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
  }

  public resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    
    // Maintain internal 960x540 aspect ratio
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.resetTransform?.();
    this.ctx.scale(this.canvas.width / this.width, this.canvas.height / this.height);
  }

  public setSkin(skin: PlayerSkin) {
    this.currentSkin = skin;
  }

  public setSettings(settings: GameSettings) {
    this.settings = settings;
  }

  public start() {
    this.reset();
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public revive() {
    // Clear obstacles in player vicinity for safe continuation
    this.obstacles = this.obstacles.filter(obs => obs.x > this.player.x + 240 || obs.x + obs.width < this.player.x - 40);
    this.player.y = this.groundY - this.player.height;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.canDoubleJump = true;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.createDoubleJumpRing(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
    this.addFloatingText('REVIVED! +OVERDRIVE', this.width / 2, 160, '#39ff14', 1.4);
    this.loop(this.lastTime);
  }

  public reset() {
    this.score = 0;
    this.coins = 0;
    this.combo = 1;
    this.maxComboThisRun = 1;
    this.comboTimer = 0;
    this.speedLevel = 1;
    this.currentSpeed = this.baseSpeed;
    this.survivalTime = 0;
    this.speedTimer = 0;
    this.screenTrauma = 0;

    this.player.y = this.groundY - this.player.height;
    this.player.vy = 0;
    this.player.rotation = 0;
    this.player.isGrounded = true;
    this.player.canDoubleJump = true;
    this.player.jumpCount = 0;
    this.player.trail = [];
    this.jumpBufferTime = 0;
    this.coyoteTime = 0;

    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.nextObstacleDistance = 380;
  }

  // JUMP INPUT HANDLING
  public handleJumpInput() {
    if (!this.isRunning || this.isPaused) return;

    // Buffer the jump input for 130ms
    this.jumpBufferTime = 0.13;

    // Can jump if grounded or within coyote time window
    if (this.player.isGrounded || this.coyoteTime > 0) {
      this.executeJump(false);
    } else if (this.player.canDoubleJump) {
      // Air double-jump
      this.executeJump(true);
    }
  }

  private executeJump(isDouble: boolean) {
    this.jumpBufferTime = 0;
    this.coyoteTime = 0;
    this.player.isGrounded = false;

    if (!isDouble) {
      this.player.vy = this.jumpForce;
      this.player.canDoubleJump = true;
      this.player.jumpCount++;
      audio.playJump();
      this.createJumpParticles(this.player.x + this.player.width / 2, this.groundY);
    } else {
      this.player.vy = this.doubleJumpForce;
      this.player.canDoubleJump = false;
      this.player.jumpCount++;
      audio.playDoubleJump();
      this.createDoubleJumpRing(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
    }

    this.callbacks.onAchievementProgress?.('JUMP', 1);
  }

  // GAME LOOP
  private loop = (currentTime: number) => {
    if (!this.isRunning || this.isPaused) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.08); // Cap dt to avoid large delta jumps
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  // UPDATE STATE
  private update(dt: number) {
    this.survivalTime += dt;
    this.speedTimer += dt;

    // Speed progression every 15s
    if (this.speedTimer >= this.SPEED_INTERVAL) {
      this.speedTimer = 0;
      this.speedLevel++;
      this.currentSpeed = Math.min(840, this.baseSpeed + (this.speedLevel - 1) * 38);
      audio.playMilestone();
      this.callbacks.onSpeedIncrease(this.speedLevel);
      this.addFloatingText(`WARP LEVEL ${this.speedLevel}!`, this.width / 2, 140, '#00f0ff', 1.4);
    }

    // Combo Timer Decay
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.callbacks.onScoreUpdate(this.score, this.combo);
      }
    }

    // Update Player Physics
    this.updatePlayer(dt);

    // Update Obstacles & Spawning
    this.updateObstacles(dt);

    // Update Collectibles
    this.updateCollectibles(dt);

    // Update Particles
    this.updateParticles(dt);

    // Update Floating Texts
    this.updateFloatingTexts(dt);

    // Update Background Starfield & Grid
    this.gridOffset = (this.gridOffset + this.currentSpeed * dt) % 40;
    this.stars.forEach((s) => {
      s.x -= this.currentSpeed * s.speed * dt;
      if (s.x < 0) s.x = this.width + Math.random() * 20;
    });

    // Screen Trauma decay
    if (this.screenTrauma > 0) {
      this.screenTrauma = Math.max(0, this.screenTrauma - dt * 2.2);
    }
  }

  private updatePlayer(dt: number) {
    // Coyote time decrement
    if (!this.player.isGrounded && this.coyoteTime > 0) {
      this.coyoteTime -= dt;
    }

    // Jump buffer check
    if (this.jumpBufferTime > 0) {
      this.jumpBufferTime -= dt;
      if (this.player.isGrounded) {
        this.executeJump(false);
      }
    }

    // Apply gravity
    this.player.vy += this.gravity * dt;
    this.player.y += this.player.vy * dt;

    // Ground check
    const maxY = this.groundY - this.player.height;
    if (this.player.y >= maxY) {
      this.player.y = maxY;
      this.player.vy = 0;
      if (!this.player.isGrounded) {
        this.player.isGrounded = true;
        this.player.canDoubleJump = true;
      }
    } else {
      if (this.player.isGrounded) {
        // Just left ground: initiate coyote window
        this.player.isGrounded = false;
        this.coyoteTime = 0.08;
      }
    }

    // Rotation & lean based on vertical speed
    const targetRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 6, this.player.vy * 0.0012));
    this.player.rotation += (targetRotation - this.player.rotation) * 12 * dt;

    // Motion Trail
    this.player.trailTimer += dt;
    if (this.player.trailTimer > 0.02) {
      this.player.trailTimer = 0;
      this.player.trail.unshift({
        x: this.player.x,
        y: this.player.y,
        alpha: 0.6,
        rotation: this.player.rotation,
      });
      if (this.player.trail.length > 8) {
        this.player.trail.pop();
      }
    }

    // Fade trail
    this.player.trail.forEach((t) => {
      t.alpha -= dt * 3.5;
    });
    this.player.trail = this.player.trail.filter((t) => t.alpha > 0.05);

    // Floor running sparks
    if (this.player.isGrounded && Math.random() < 0.35) {
      this.particles.push({
        x: this.player.x + 4,
        y: this.groundY - 2,
        vx: -this.currentSpeed * 0.4 - Math.random() * 120,
        vy: -Math.random() * 80 - 20,
        size: Math.random() * 2.5 + 1,
        color: this.currentSkin.glowColor,
        alpha: 0.9,
        life: 0,
        maxLife: 0.25,
      });
    }
  }

  // OBSTACLES & SPAWN LOGIC
  private updateObstacles(dt: number) {
    const moveDist = this.currentSpeed * dt;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= moveDist;

      // Vertical oscillation for floating obstacles
      if (obs.type === 'FLOATING_PULSE' && obs.oscillationOffset !== undefined) {
        obs.oscillationOffset += dt * (obs.oscillationSpeed ?? 3);
        const range = obs.oscillationRange ?? 45;
        obs.y = (this.groundY - 140) + Math.sin(obs.oscillationOffset) * range;
      }

      // Check Collision with player
      const { hit, nearMiss } = collision.checkObstacle(this.player, obs);

      if (hit) {
        this.triggerDeath();
        return;
      }

      // Near miss reward
      if (nearMiss && !obs.nearMissAwarded) {
        obs.nearMissAwarded = true;
        this.triggerNearMiss();
      }

      // Passed obstacle scoring
      if (!obs.passed && obs.x + obs.width < this.player.x) {
        obs.passed = true;
        this.awardScore(1);
      }

      // Remove off-screen obstacles
      if (obs.x + obs.width < -60) {
        this.obstacles.splice(i, 1);
      }
    }

    // Spawn new obstacles
    this.nextObstacleDistance -= moveDist;
    if (this.nextObstacleDistance <= 0) {
      this.spawnObstaclePattern();
      // Distance between obstacles scales with speed to stay fair & thrilling
      const minDistance = Math.max(260, 480 - this.speedLevel * 16);
      const randomExtra = Math.random() * 220;
      this.nextObstacleDistance = minDistance + randomExtra;
    }
  }

  private spawnObstaclePattern() {
    const rand = Math.random();
    const spawnX = this.width + 60;

    if (rand < 0.40) {
      // Single Ground Spike
      this.obstacles.push({
        id: ++this.obstacleIdCounter,
        type: 'GROUND_SPIKE',
        x: spawnX,
        y: this.groundY - 44,
        width: 38,
        height: 44,
        color: '#ff0055',
        glowColor: '#ff0055',
        passed: false,
        nearMissAwarded: false,
      });

      // Chance to spawn coin above spike
      if (Math.random() < 0.6) {
        this.spawnCoinArc(spawnX, this.groundY - 95, 1);
      }
    } else if (rand < 0.65) {
      // Double Spike (requires a confident jump)
      this.obstacles.push({
        id: ++this.obstacleIdCounter,
        type: 'DOUBLE_SPIKE',
        x: spawnX,
        y: this.groundY - 44,
        width: 72,
        height: 44,
        color: '#ff007f',
        glowColor: '#ff007f',
        passed: false,
        nearMissAwarded: false,
      });

      if (Math.random() < 0.7) {
        this.spawnCoinArc(spawnX + 36, this.groundY - 110, 2);
      }
    } else if (rand < 0.82) {
      // Floating Pulse Hazard
      const initialY = this.groundY - 130;
      this.obstacles.push({
        id: ++this.obstacleIdCounter,
        type: 'FLOATING_PULSE',
        x: spawnX,
        y: initialY,
        width: 42,
        height: 42,
        color: '#bd00ff',
        glowColor: '#bd00ff',
        oscillationOffset: Math.random() * Math.PI * 2,
        oscillationSpeed: 3.5,
        oscillationRange: 40,
        passed: false,
        nearMissAwarded: false,
      });

      this.spawnCoinArc(spawnX - 40, this.groundY - 35, 2);
    } else {
      // Gate Portal: Low and High barrier leaving a safe passage
      const gapY = this.groundY - 180 + (Math.random() * 40 - 20);
      const gapHeight = 125;

      this.obstacles.push({
        id: ++this.obstacleIdCounter,
        type: 'GATE_PORTAL',
        x: spawnX,
        y: 0,
        width: 48,
        height: this.height,
        gapY: gapY,
        gapHeight: gapHeight,
        color: '#00f0ff',
        glowColor: '#00f0ff',
        passed: false,
        nearMissAwarded: false,
      });

      // Coin placed right through the center of the gate
      this.collectibles.push({
        id: ++this.collectibleIdCounter,
        type: 'COIN',
        x: spawnX + 24,
        y: gapY + gapHeight / 2,
        radius: 13,
        color: '#ffb703',
        glowColor: '#ffb703',
        collected: false,
        value: 1,
        oscillationOffset: 0,
        spin: 0,
      });
    }
  }

  private spawnCoinArc(startX: number, startY: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.collectibles.push({
        id: ++this.collectibleIdCounter,
        type: 'COIN',
        x: startX + i * 36,
        y: startY,
        radius: 11,
        color: '#ffb703',
        glowColor: '#ffb703',
        collected: false,
        value: 1,
        oscillationOffset: i * 0.4,
        spin: 0,
      });
    }
  }

  // COLLECTIBLES UPDATE
  private updateCollectibles(dt: number) {
    const moveDist = this.currentSpeed * dt;

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      c.x -= moveDist;
      c.spin += dt * 4;

      // Hover bobbing
      c.oscillationOffset += dt * 4;
      const bobbing = Math.sin(c.oscillationOffset) * 0.8;
      c.y += bobbing;

      // Magnetism & Collection
      const { collected, attract, angle } = collision.checkCollectible(this.player, c);

      if (attract && !c.collected) {
        c.x += Math.cos(angle) * 420 * dt;
        c.y += Math.sin(angle) * 420 * dt;
      }

      if (collected && !c.collected) {
        c.collected = true;
        this.collectCoin(c);
        this.collectibles.splice(i, 1);
        continue;
      }

      if (c.x < -40) {
        this.collectibles.splice(i, 1);
      }
    }
  }

  private collectCoin(c: Collectible) {
    this.coins += c.value;
    audio.playCoin();
    this.createCoinBurst(c.x, c.y);

    // Bonus points scaled by combo
    const bonus = 10 * this.combo;
    this.score += bonus;

    // Boost combo
    this.incrementCombo();

    this.callbacks.onCoinsUpdate(this.coins);
    this.callbacks.onScoreUpdate(this.score, this.combo);
    this.callbacks.onAchievementProgress?.('COIN', 1);

    this.addFloatingText(`+${bonus}`, c.x, c.y - 10, '#ffb703', 1.1);
  }

  // SCORING & COMBOS
  private awardScore(basePoints: number) {
    const added = basePoints * this.combo;
    this.score += added;
    this.callbacks.onScoreUpdate(this.score, this.combo);
  }

  private incrementCombo() {
    this.combo = Math.min(5, this.combo + 1);
    this.maxComboThisRun = Math.max(this.maxComboThisRun, this.combo);
    this.comboTimer = this.COMBO_TIMEOUT;

    if (this.combo === 5) {
      this.screenTrauma = Math.max(this.screenTrauma, 0.25);
      this.addFloatingText('MAX OVERDRIVE x5!', this.width / 2, 180, '#ff007f', 1.5);
    }
  }

  private triggerNearMiss() {
    audio.playNearMiss();
    this.screenTrauma = Math.max(this.screenTrauma, 0.3);

    const bonus = 50 * this.combo;
    this.score += bonus;
    this.incrementCombo();

    this.callbacks.onNearMiss(this.combo);
    this.callbacks.onScoreUpdate(this.score, this.combo);
    this.callbacks.onAchievementProgress?.('NEAR_MISS', 1);

    this.addFloatingText(
      `NEAR MISS! +${bonus}`,
      this.player.x + this.player.width + 10,
      this.player.y - 20,
      '#00f0ff',
      1.3
    );

    this.createNearMissSparks(this.player.x + this.player.width, this.player.y + this.player.height / 2);
  }

  // DEATH & GAME OVER
  private triggerDeath() {
    this.isRunning = false;
    audio.playCollision();

    if (!this.settings.reducedMotion) {
      this.screenTrauma = 1.0;
    }

    this.createShatterParticles(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );

    // Allow shatter particles to render before halting
    let frames = 0;
    const endAnimation = () => {
      if (frames++ < 40) {
        this.updateParticles(0.016);
        this.render();
        requestAnimationFrame(endAnimation);
      } else {
        this.callbacks.onGameOver(this.score, this.coins, this.maxComboThisRun);
      }
    };
    endAnimation();
  }

  // PARTICLE SYSTEMS
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 650 * dt; // gravity on particles
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot * dt;
      }
    }
  }

  private createJumpParticles(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 1.2;
      const speed = Math.random() * 160 + 50;
      this.particles.push({
        x,
        y: y - 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: this.currentSkin.primaryColor,
        alpha: 1,
        life: 0,
        maxLife: 0.35,
      });
    }
  }

  private createDoubleJumpRing(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = Math.random() * 120 + 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: '#00f0ff',
        alpha: 1,
        life: 0,
        maxLife: 0.4,
      });
    }
  }

  private createCoinBurst(x: number, y: number) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 60;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: Math.random() * 3 + 2,
        color: '#ffb703',
        alpha: 1,
        life: 0,
        maxLife: 0.45,
      });
    }
  }

  private createNearMissSparks(x: number, y: number) {
    for (let i = 0; i < 18; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const speed = Math.random() * 260 + 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: '#00f0ff',
        alpha: 1,
        life: 0,
        maxLife: 0.35,
      });
    }
  }

  private createShatterParticles(x: number, y: number) {
    for (let i = 0; i < 32; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 380 + 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: Math.random() < 0.5 ? this.currentSkin.primaryColor : '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 0.75,
        shape: 'square',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 16,
      });
    }
  }

  // FLOATING TEXTS
  private addFloatingText(text: string, x: number, y: number, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: ++this.floatingTextCounter,
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale,
      vy: -75,
      life: 0,
    });
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += dt;
      ft.y += ft.vy * dt;
      ft.alpha = Math.max(0, 1 - ft.life / 0.85);

      if (ft.life >= 0.85) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // RENDERING ENGINE
  private render() {
    const ctx = this.ctx;

    // Apply Screen Shake Trauma
    ctx.save();
    if (this.screenTrauma > 0 && !this.settings.reducedMotion) {
      const shakeMag = this.screenTrauma * this.screenTrauma * 16;
      const shakeX = (Math.random() * 2 - 1) * shakeMag;
      const shakeY = (Math.random() * 2 - 1) * shakeMag;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Deep Space Cyber Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#04030a');
    bgGrad.addColorStop(0.55, '#09081a');
    bgGrad.addColorStop(0.82, '#140c2e');
    bgGrad.addColorStop(1, '#05030e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Stars
    ctx.save();
    this.stars.forEach((s) => {
      ctx.fillStyle = `rgba(200, 230, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3. Synthwave Sun / Distant Horizon Glow
    const sunGrad = ctx.createRadialGradient(
      this.width / 2, this.groundY - 10, 10,
      this.width / 2, this.groundY - 10, 280
    );
    sunGrad.addColorStop(0, 'rgba(255, 0, 127, 0.22)');
    sunGrad.addColorStop(0.5, 'rgba(189, 0, 255, 0.08)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, this.width, this.groundY);

    // 4. Perspective 3D Moving Floor Grid
    this.renderFloorGrid(ctx);

    // 5. Render Obstacles
    this.renderObstacles(ctx);

    // 6. Render Collectibles
    this.renderCollectibles(ctx);

    // 7. Render Player & Trail
    this.renderPlayer(ctx);

    // 8. Render Particles
    this.renderParticles(ctx);

    // 9. Render Floating Texts
    this.renderFloatingTexts(ctx);

    // 10. Scanlines effect (optional)
    if (this.settings.scanlines) {
      this.renderScanlines(ctx);
    }

    ctx.restore();
  }

  // 3D PERSPECTIVE FLOOR GRID
  private renderFloorGrid(ctx: CanvasRenderingContext2D) {
    const horizonY = this.groundY;
    const floorHeight = this.height - horizonY;

    // Horizon line glowing separator
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00f0ff';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(this.width, horizonY);
    ctx.stroke();
    ctx.restore();

    // Floor fill
    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, this.height);
    floorGrad.addColorStop(0, 'rgba(10, 5, 24, 0.95)');
    floorGrad.addColorStop(1, 'rgba(3, 1, 8, 0.98)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, this.width, floorHeight);

    // Horizontal perspective grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1.2;

    const numHorizLines = 9;
    for (let i = 1; i <= numHorizLines; i++) {
      const p = Math.pow(i / numHorizLines, 2.2);
      const lineY = horizonY + p * floorHeight;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(this.width, lineY);
      ctx.stroke();
    }

    // Vertical perspective lines converging to vanishing point
    const vanishX = this.width / 2;
    const vanishY = horizonY - 140;

    const baseSpacing = 42;
    const totalLines = Math.ceil(this.width / baseSpacing) + 2;

    for (let i = -totalLines / 2; i <= totalLines / 2; i++) {
      const bottomX = vanishX + i * baseSpacing * 2.8 - this.gridOffset * 2.2;
      ctx.beginPath();
      ctx.moveTo(vanishX, vanishY);
      ctx.lineTo(bottomX, this.height);
      ctx.stroke();
    }
    ctx.restore();
  }

  // RENDER PLAYER
  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;

    // 1. Ghost Trail
    p.trail.forEach((t) => {
      ctx.save();
      ctx.translate(t.x + p.width / 2, t.y + p.height / 2);
      ctx.rotate(t.rotation);
      ctx.fillStyle = this.currentSkin.trailColor.replace(/[\d.]+\)$/, `${t.alpha * 0.4})`);
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.currentSkin.glowColor;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    });

    // 2. Active Player Geometric Core
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.rotate(p.rotation);

    // Outer Neon Glow
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.currentSkin.glowColor;

    // Main diamond / futuristic cyber-cube
    ctx.strokeStyle = this.currentSkin.primaryColor;
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(10, 10, 28, 0.85)';

    // Rounded rectangle shape
    const r = 6;
    const w = p.width;
    const h = p.height;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, r);
    ctx.fill();
    ctx.stroke();

    // Inner Pulsing Core (Energy Diamond)
    const coreSize = w * 0.42;
    ctx.save();
    ctx.rotate(performance.now() * 0.003); // slowly rotating inner crystal
    ctx.fillStyle = this.currentSkin.secondaryColor;
    ctx.shadowBlur = 14;
    ctx.shadowColor = this.currentSkin.primaryColor;
    ctx.beginPath();
    ctx.moveTo(0, -coreSize);
    ctx.lineTo(coreSize, 0);
    ctx.lineTo(0, coreSize);
    ctx.lineTo(-coreSize, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Forward cyber visor / eye line
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.fillRect(w * 0.15, -3, w * 0.28, 6);

    ctx.restore();
  }

  // RENDER OBSTACLES
  private renderObstacles(ctx: CanvasRenderingContext2D) {
    this.obstacles.forEach((obs) => {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = obs.glowColor;
      ctx.strokeStyle = obs.color;
      ctx.fillStyle = 'rgba(25, 0, 40, 0.88)';
      ctx.lineWidth = 3;

      if (obs.type === 'GROUND_SPIKE') {
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner glowing laser line
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y + 8);
        ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (obs.type === 'DOUBLE_SPIKE') {
        const halfW = obs.width / 2;
        // First spike
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + halfW / 2, obs.y);
        ctx.lineTo(obs.x + halfW, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Second spike
        ctx.beginPath();
        ctx.moveTo(obs.x + halfW, obs.y + obs.height);
        ctx.lineTo(obs.x + halfW + halfW / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (obs.type === 'FLOATING_PULSE') {
        // Floating cyber diamond
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        const r = obs.width / 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner pulsing orb
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'GATE_PORTAL') {
        const gapY = obs.gapY ?? 260;
        const gapHeight = obs.gapHeight ?? 130;

        // Top beam
        ctx.fillRect(obs.x, 0, obs.width, gapY);
        ctx.strokeRect(obs.x, 0, obs.width, gapY);

        // Bottom beam
        const bottomY = gapY + gapHeight;
        ctx.fillRect(obs.x, bottomY, obs.width, this.groundY - bottomY);
        ctx.strokeRect(obs.x, bottomY, obs.width, this.groundY - bottomY);

        // Laser edge warnings
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obs.x, gapY);
        ctx.lineTo(obs.x + obs.width, gapY);
        ctx.moveTo(obs.x, bottomY);
        ctx.lineTo(obs.x + obs.width, bottomY);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // RENDER COLLECTIBLES
  private renderCollectibles(ctx: CanvasRenderingContext2D) {
    this.collectibles.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);

      // Rotating diamond coin
      ctx.rotate(c.spin);
      ctx.shadowBlur = 14;
      ctx.shadowColor = c.glowColor;
      ctx.strokeStyle = c.color;
      ctx.fillStyle = 'rgba(255, 240, 150, 0.95)';
      ctx.lineWidth = 2.5;

      const r = c.radius;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.8, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // RENDER PARTICLES
  private renderParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;

      if (p.shape === 'square') {
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // RENDER FLOATING TEXTS
  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${Math.round(20 * ft.scale)}px "Inter", "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 12;
      ctx.shadowColor = ft.color;
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);

      // White core text for crispness
      ctx.fillStyle = '#ffffff';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  // SCANLINES OVERLAY
  private renderScanlines(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < this.height; y += 4) {
      ctx.fillRect(0, y, this.width, 1.5);
    }
    ctx.restore();
  }

  // CLEANUP
  public destroy() {
    this.stop();
  }
}
