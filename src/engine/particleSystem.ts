import { CharacterFacing } from '../types';

export type ParticleShape =
  | 'circle'
  | 'spark'
  | 'shockwave'
  | 'debris'
  | 'smoke'
  | 'star'
  | 'flash'
  | 'ring';

export interface GameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  drag: number;
  size: number;
  startSize: number;
  endSize: number;
  color: string;
  endColor?: string;
  alpha: number;
  startAlpha: number;
  endAlpha: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  shape: ParticleShape;
  blendMode?: GlobalCompositeOperation;
  // Shockwave specific
  radiusX?: number;
  radiusY?: number;
  maxRadiusX?: number;
  maxRadiusY?: number;
  lineWidth?: number;
  bounce?: boolean;
  floorY?: number;
}

/**
 * High-performance, cinematic Particle System for the RAMAYAN game engine.
 * Handles rich visual impacts for:
 * - Bow firing (muzzle flashes, directional spark sprays, recoil smoke, sacred energy rings)
 * - Landing impacts (battered ground dust plumes, shockwave rings, bouncing debris pebbles)
 * - High-speed projectile trails, jump takeoffs, and divine aura bursts
 */
export class ParticleSystem {
  private particles: GameParticle[] = [];
  private readonly maxParticles: number = 800;

  constructor() {}

  /**
   * Spawns a raw particle into the system with clamping
   */
  public addParticle(p: GameParticle) {
    if (this.particles.length >= this.maxParticles) {
      // Remove oldest particle
      this.particles.shift();
    }
    this.particles.push(p);
  }

  // =========================================================================
  // 1. BOW FIRING IMPACT EFFECT
  // =========================================================================
  /**
   * Spawns cinematic visual impacts when Umesh releases an arrow from his bow.
   * Features:
   * - Luminous muzzle flash starburst at the bow grip
   * - High-velocity spark cone in the firing direction
   * - Kinetic expanding shockwave ring
   * - Recoil smoke wisps drifting backward
   * - Golden sacred embers for charged shots
   */
  public createBowFireImpact(
    x: number,
    y: number,
    facing: CharacterFacing,
    isCharged: boolean,
    aimDir?: { x: number; y: number }
  ) {
    // Determine firing direction vector
    let dirX = facing === 'right' ? 1 : -1;
    let dirY = 0;

    if (aimDir) {
      const len = Math.hypot(aimDir.x, aimDir.y);
      if (len > 0.05) {
        dirX = aimDir.x / len;
        dirY = aimDir.y / len;
      }
    }

    const baseAngle = Math.atan2(dirY, dirX);

    // 1. Flash at the bowstring release point
    this.addParticle({
      x,
      y,
      vx: dirX * 30,
      vy: dirY * 30,
      ax: 0,
      ay: 0,
      drag: 0.9,
      size: isCharged ? 32 : 18,
      startSize: isCharged ? 32 : 18,
      endSize: isCharged ? 4 : 2,
      color: isCharged ? '#fef08a' : '#ffffff',
      alpha: 1,
      startAlpha: 1,
      endAlpha: 0,
      rotation: baseAngle,
      vRot: 0,
      life: 0.12,
      maxLife: 0.12,
      shape: 'flash',
      blendMode: 'lighter',
    });

    // 2. Expanding directional shockwave ring
    this.addParticle({
      x: x + dirX * 8,
      y: y + dirY * 8,
      vx: dirX * 120,
      vy: dirY * 120,
      ax: 0,
      ay: 0,
      drag: 0.92,
      size: 1,
      startSize: 1,
      endSize: 1,
      color: isCharged ? '#fbbf24' : '#67e8f9',
      alpha: 0.9,
      startAlpha: 0.9,
      endAlpha: 0,
      rotation: baseAngle,
      vRot: 0,
      life: 0.22,
      maxLife: 0.22,
      shape: 'shockwave',
      radiusX: 6,
      radiusY: 6,
      maxRadiusX: isCharged ? 48 : 28,
      maxRadiusY: isCharged ? 32 : 18,
      lineWidth: isCharged ? 3.5 : 2,
      blendMode: 'lighter',
    });

    if (isCharged) {
      // Second outer celestial golden ring for charged shot
      this.addParticle({
        x: x + dirX * 12,
        y: y + dirY * 12,
        vx: dirX * 80,
        vy: dirY * 80,
        ax: 0,
        ay: 0,
        drag: 0.9,
        size: 1,
        startSize: 1,
        endSize: 1,
        color: '#f59e0b',
        alpha: 0.8,
        startAlpha: 0.8,
        endAlpha: 0,
        rotation: baseAngle,
        vRot: 0.05,
        life: 0.3,
        maxLife: 0.3,
        shape: 'shockwave',
        radiusX: 10,
        radiusY: 10,
        maxRadiusX: 65,
        maxRadiusY: 45,
        lineWidth: 2,
        blendMode: 'lighter',
      });
    }

    // 3. Fast velocity spark burst spraying forward in a cone
    const sparkCount = isCharged ? 22 : 12;
    for (let i = 0; i < sparkCount; i++) {
      const spread = (Math.random() - 0.5) * (isCharged ? 0.65 : 0.45);
      const angle = baseAngle + spread;
      const speed = isCharged ? 340 + Math.random() * 320 : 220 + Math.random() * 200;

      const colors = isCharged
        ? ['#ffffff', '#fef08a', '#f59e0b', '#fbbf24', '#f97316']
        : ['#ffffff', '#e0f2fe', '#38bdf8', '#fbbf24'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.addParticle({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ax: 0,
        ay: 60, // slight gravity drop
        drag: 0.94,
        size: isCharged ? 3 + Math.random() * 3.5 : 2 + Math.random() * 2,
        startSize: isCharged ? 4 : 2.5,
        endSize: 0.5,
        color,
        alpha: 1,
        startAlpha: 1,
        endAlpha: 0,
        rotation: angle,
        vRot: (Math.random() - 0.5) * 4,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.25 + Math.random() * 0.2,
        shape: 'spark',
        blendMode: 'lighter',
      });
    }

    // 4. Recoil smoke wisps pushed backward from the string release
    const smokeCount = isCharged ? 8 : 4;
    for (let i = 0; i < smokeCount; i++) {
      const backAngle = baseAngle + Math.PI + (Math.random() - 0.5) * 0.8;
      const speed = 40 + Math.random() * 60;
      this.addParticle({
        x: x - dirX * 6,
        y: y - dirY * 6,
        vx: Math.cos(backAngle) * speed,
        vy: Math.sin(backAngle) * speed - 15,
        ax: 0,
        ay: -25, // smoke floats up
        drag: 0.91,
        size: 5 + Math.random() * 4,
        startSize: 4,
        endSize: isCharged ? 18 : 12,
        color: isCharged ? 'rgba(253, 230, 138, 0.45)' : 'rgba(226, 232, 240, 0.35)',
        alpha: 0.65,
        startAlpha: 0.65,
        endAlpha: 0,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 2,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.35 + Math.random() * 0.2,
        shape: 'smoke',
      });
    }

    // 5. Sacred golden sparkles if charged
    if (isCharged) {
      for (let i = 0; i < 8; i++) {
        this.addParticle({
          x: x + (Math.random() - 0.5) * 16,
          y: y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 90,
          vy: -40 - Math.random() * 80,
          ax: 0,
          ay: -10,
          drag: 0.93,
          size: 4 + Math.random() * 3,
          startSize: 4,
          endSize: 1,
          color: '#fbbf24',
          alpha: 1,
          startAlpha: 1,
          endAlpha: 0,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 5,
          life: 0.45,
          maxLife: 0.45,
          shape: 'star',
          blendMode: 'lighter',
        });
      }
    }
  }

  // =========================================================================
  // 2. LANDING AFTER JUMP IMPACT EFFECT
  // =========================================================================
  /**
   * Spawns ground visual impacts when Umesh lands on a platform or the ground.
   * Features:
   * - Dual-direction expanding ground dust plumes (left & right)
   * - Flat elliptical ground shockwave ring for high drops
   * - Bouncing ground pebble debris
   * - Golden sacred sparks if divine power is active
   */
  public createLandingImpact(
    x: number,
    y: number,
    fallSpeed: number,
    isDivineActive: boolean = false
  ) {
    const isHighJump = fallSpeed > 450;
    const intensity = Math.min(1.8, Math.max(0.6, fallSpeed / 400));

    // 1. Dual directional dust plumes expanding outwards to left & right
    const dustCountPerSide = isHighJump ? 9 : 5;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < dustCountPerSide; i++) {
        const spreadSpeed = (80 + Math.random() * 140) * intensity * side;
        const liftSpeed = -(25 + Math.random() * 55) * intensity;

        const dustColors = [
          'rgba(214, 180, 140, 0.65)', // warm sand/stone dust
          'rgba(180, 150, 115, 0.6)',
          'rgba(240, 225, 200, 0.5)',
          'rgba(140, 115, 90, 0.4)',
        ];
        const dustColor = dustColors[Math.floor(Math.random() * dustColors.length)];

        this.addParticle({
          x: x + side * (4 + Math.random() * 8),
          y: y - 2,
          vx: spreadSpeed,
          vy: liftSpeed,
          ax: -side * 40, // decelerate outward
          ay: -15, // float gently
          drag: 0.88,
          size: 6 * intensity,
          startSize: 5 * intensity,
          endSize: (16 + Math.random() * 12) * intensity,
          color: dustColor,
          alpha: 0.7,
          startAlpha: 0.7,
          endAlpha: 0,
          rotation: Math.random() * Math.PI * 2,
          vRot: side * (0.8 + Math.random() * 1.5),
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.35 + Math.random() * 0.25,
          shape: 'smoke',
        });
      }
    }

    // 2. Expanding flat elliptical ground shockwave for high jumps
    if (isHighJump) {
      this.addParticle({
        x,
        y: y - 1,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        drag: 1,
        size: 1,
        startSize: 1,
        endSize: 1,
        color: isDivineActive ? '#fbbf24' : 'rgba(245, 208, 155, 0.85)',
        alpha: 0.85,
        startAlpha: 0.85,
        endAlpha: 0,
        rotation: 0,
        vRot: 0,
        life: 0.28,
        maxLife: 0.28,
        shape: 'shockwave',
        radiusX: 12,
        radiusY: 4,
        maxRadiusX: 68 * intensity,
        maxRadiusY: 16 * intensity,
        lineWidth: 3,
      });

      // Second smaller intense inner ring
      this.addParticle({
        x,
        y: y - 1,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        drag: 1,
        size: 1,
        startSize: 1,
        endSize: 1,
        color: '#ffffff',
        alpha: 0.9,
        startAlpha: 0.9,
        endAlpha: 0,
        rotation: 0,
        vRot: 0,
        life: 0.18,
        maxLife: 0.18,
        shape: 'shockwave',
        radiusX: 6,
        radiusY: 2,
        maxRadiusX: 38 * intensity,
        maxRadiusY: 9 * intensity,
        lineWidth: 2,
        blendMode: 'lighter',
      });
    }

    // 3. Small bouncing earth/pebble debris fragments
    const debrisCount = isHighJump ? 10 : 5;
    for (let i = 0; i < debrisCount; i++) {
      const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.6;
      const speed = (100 + Math.random() * 180) * intensity;
      const debrisColors = ['#785d43', '#9c7a59', '#57422f', '#a89f91'];

      this.addParticle({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ax: 0,
        ay: 980, // gravity
        drag: 0.96,
        size: 2 + Math.random() * 2.5,
        startSize: 3,
        endSize: 1.5,
        color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
        alpha: 1,
        startAlpha: 1,
        endAlpha: 0,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        life: 0.4 + Math.random() * 0.25,
        maxLife: 0.4 + Math.random() * 0.25,
        shape: 'debris',
        bounce: true,
        floorY: y,
      });
    }

    // 4. Sacred divine blessing motes if divine power is active
    if (isDivineActive) {
      for (let i = 0; i < 14; i++) {
        const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 2.2;
        const spd = 80 + Math.random() * 120;
        this.addParticle({
          x: x + (Math.random() - 0.5) * 24,
          y: y - 6,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          ax: 0,
          ay: -40,
          drag: 0.92,
          size: 3 + Math.random() * 2.5,
          startSize: 3.5,
          endSize: 1,
          color: i % 2 === 0 ? '#fbbf24' : '#ffffff',
          alpha: 1,
          startAlpha: 1,
          endAlpha: 0,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 4,
          life: 0.5 + Math.random() * 0.3,
          maxLife: 0.5 + Math.random() * 0.3,
          shape: 'star',
          blendMode: 'lighter',
        });
      }
    }
  }

  // =========================================================================
  // 3. JUMP TAKEOFF PUFF
  // =========================================================================
  public createJumpTakeoff(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.random() - 0.5) * 1.8;
      const speed = 40 + Math.random() * 60;
      this.addParticle({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 2,
        vx: Math.sin(angle) * speed,
        vy: 20 + Math.random() * 30, // downward puff
        ax: 0,
        ay: 40,
        drag: 0.9,
        size: 5,
        startSize: 4,
        endSize: 12,
        color: 'rgba(214, 180, 140, 0.45)',
        alpha: 0.6,
        startAlpha: 0.6,
        endAlpha: 0,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 2,
        life: 0.25,
        maxLife: 0.25,
        shape: 'smoke',
      });
    }
  }

  // =========================================================================
  // 4. COMBAT HIT IMPACT & SPARKS
  // =========================================================================
  public createHitImpact(
    x: number,
    y: number,
    isCharged: boolean,
    color: string = '#f59e0b'
  ) {
    // Central impact flash
    this.addParticle({
      x,
      y,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      drag: 1,
      size: isCharged ? 28 : 16,
      startSize: isCharged ? 28 : 16,
      endSize: 2,
      color: '#ffffff',
      alpha: 1,
      startAlpha: 1,
      endAlpha: 0,
      rotation: 0,
      vRot: 0,
      life: 0.1,
      maxLife: 0.1,
      shape: 'flash',
      blendMode: 'lighter',
    });

    // Radial sparks
    const count = isCharged ? 18 : 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const spd = (120 + Math.random() * 180) * (isCharged ? 1.4 : 1.0);
      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        ax: 0,
        ay: 120,
        drag: 0.93,
        size: isCharged ? 3.5 : 2.5,
        startSize: isCharged ? 3.5 : 2.5,
        endSize: 0.5,
        color: i % 2 === 0 ? color : '#ffffff',
        alpha: 1,
        startAlpha: 1,
        endAlpha: 0,
        rotation: angle,
        vRot: 0,
        life: 0.3 + Math.random() * 0.15,
        maxLife: 0.3 + Math.random() * 0.15,
        shape: 'spark',
        blendMode: 'lighter',
      });
    }
  }

  // =========================================================================
  // 5. BOSS IMPACT
  // =========================================================================
  public createBossImpact(x: number, y: number, intensity: number = 1.0) {
    // Giant shockwave ring
    this.addParticle({
      x,
      y,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      drag: 1,
      size: 1,
      startSize: 1,
      endSize: 1,
      color: '#fbbf24',
      alpha: 0.9,
      startAlpha: 0.9,
      endAlpha: 0,
      rotation: 0,
      vRot: 0,
      life: 0.35,
      maxLife: 0.35,
      shape: 'shockwave',
      radiusX: 10,
      radiusY: 10,
      maxRadiusX: 75 * intensity,
      maxRadiusY: 75 * intensity,
      lineWidth: 4,
      blendMode: 'lighter',
    });

    this.createHitImpact(x, y, true, '#ef4444');
  }

  // =========================================================================
  // 6. UPDATE SIMULATION (Delta time)
  // =========================================================================
  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const progress = 1 - p.life / p.maxLife; // 0 to 1

      // Size interpolation
      p.size = p.startSize + (p.endSize - p.startSize) * progress;

      // Alpha interpolation
      p.alpha = Math.max(0, p.startAlpha + (p.endAlpha - p.startAlpha) * progress);

      // Physics integration
      p.vx += p.ax * dt;
      p.vy += p.ay * dt;
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Ground bounce for debris
      if (p.bounce && p.floorY !== undefined && p.y >= p.floorY) {
        p.y = p.floorY;
        p.vy = -p.vy * 0.45;
        p.vx *= 0.65;
      }

      // Rotation
      p.rotation += p.vRot * dt;

      // Shockwave radius growth
      if (p.shape === 'shockwave' && p.radiusX !== undefined && p.maxRadiusX !== undefined) {
        const easeOut = 1 - Math.pow(1 - progress, 3);
        p.radiusX = 6 + (p.maxRadiusX - 6) * easeOut;
        if (p.radiusY !== undefined && p.maxRadiusY !== undefined) {
          p.radiusY = 2 + (p.maxRadiusY - 2) * easeOut;
        }
      }
    }
  }

  // =========================================================================
  // 7. CINEMATIC RENDERING
  // =========================================================================
  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (this.particles.length === 0) return;

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    for (const p of this.particles) {
      if (p.alpha <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, p.alpha));
      if (p.blendMode) {
        ctx.globalCompositeOperation = p.blendMode;
      }

      switch (p.shape) {
        case 'circle': {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'spark': {
          // Stretched velocity spark line
          const speed = Math.hypot(p.vx, p.vy);
          const stretch = Math.min(22, Math.max(4, speed * 0.04));
          const angle = Math.atan2(p.vy, p.vx);

          ctx.translate(p.x, p.y);
          ctx.rotate(angle);

          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, p.size);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-stretch, 0);
          ctx.lineTo(stretch, 0);
          ctx.stroke();

          // Bright center dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.6, p.size * 0.5), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'shockwave': {
          const rx = p.radiusX || 10;
          const ry = p.radiusY || rx;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.lineWidth || 2;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, Math.max(1, rx), Math.max(1, ry), p.rotation, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'smoke': {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          // Draw soft irregular cloud lobe
          const r = Math.max(1, p.size);
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.arc(r * 0.35, -r * 0.25, r * 0.7, 0, Math.PI * 2);
          ctx.arc(-r * 0.35, -r * 0.2, r * 0.65, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'debris': {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          const s = Math.max(1, p.size);
          ctx.fillRect(-s * 0.5, -s * 0.5, s, s * 0.8);
          break;
        }

        case 'star': {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          const s = Math.max(1, p.size);
          // 4-pointed radiant star
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.8);
          ctx.lineTo(s * 0.4, -s * 0.4);
          ctx.lineTo(s * 1.8, 0);
          ctx.lineTo(s * 0.4, s * 0.4);
          ctx.lineTo(0, s * 1.8);
          ctx.lineTo(-s * 0.4, s * 0.4);
          ctx.lineTo(-s * 1.8, 0);
          ctx.lineTo(-s * 0.4, -s * 0.4);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'flash': {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          // Central glowing disc
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.fill();

          // Horizontal & vertical light flare cross
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1.5, p.size * 0.25);
          ctx.beginPath();
          ctx.moveTo(-p.size * 2.2, 0);
          ctx.lineTo(p.size * 2.2, 0);
          ctx.moveTo(0, -p.size * 2.2);
          ctx.lineTo(0, p.size * 2.2);
          ctx.stroke();
          break;
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Resets all particles (e.g. on chapter switch or restart)
   */
  public clear() {
    this.particles = [];
  }
}
