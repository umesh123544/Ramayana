import {
  Projectile,
  Particle,
  FloatingText,
  Collectible,
  Platform,
  HeroState,
  Enemy,
} from '../types';
import { BossState } from './bossSystem';
import { checkAABB, isPointInBox } from '../engine/physics';
import { soundManager } from '../audio/soundManager';
import { adminConfig } from './adminConfig';

export class CombatSystem {
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public collectibles: Collectible[] = [];

  constructor() {
    this.spawnInitialCollectibles();
  }

  public spawnInitialCollectibles() {
    this.collectibles = [
      // Sacred Kalash (Big divine blessing)
      { id: 'c1', x: 500, y: 580, type: 'sacred_kalash', value: 35, collected: false, bobOffset: 0 },
      { id: 'c2', x: 1720, y: 390, type: 'sacred_kalash', value: 35, collected: false, bobOffset: 1.5 },
      // Lotus Flowers
      { id: 'c3', x: 920, y: 520, type: 'lotus_flower', value: 25, collected: false, bobOffset: 0.8 },
      { id: 'c4', x: 2800, y: 440, type: 'lotus_flower', value: 25, collected: false, bobOffset: 2.1 },
      // Divine Energy Orbs
      { id: 'c5', x: 1300, y: 560, type: 'divine_orb', value: 15, collected: false, bobOffset: 0.4 },
      { id: 'c6', x: 2150, y: 580, type: 'divine_orb', value: 15, collected: false, bobOffset: 1.1 },
      { id: 'c7', x: 3450, y: 580, type: 'divine_orb', value: 20, collected: false, bobOffset: 2.7 },
    ];
  }

  public shootHeroArrow(
    hero: HeroState,
    isCharged: boolean,
    enemies?: Enemy[],
    boss?: BossState
  ) {
    let dirX = hero.facing === 'right' ? 1 : -1;
    let dirY = 0;

    const spawnX = hero.x + hero.width * 0.5 + dirX * 24;
    const spawnY = hero.y + hero.height * 0.42;

    // Smart Auto-Target Assist: lock onto nearest active enemy or boss in facing direction
    let bestTarget: { x: number; y: number } | null = null;
    let minDistance = 750;
    const facingDir = hero.facing === 'right' ? 1 : -1;

    if (enemies && enemies.length > 0) {
      for (const e of enemies) {
        if (e.isDead || e.hp <= 0) continue;
        const targetCenterX = e.x + e.width * 0.5;
        const targetCenterY = e.y + e.height * 0.45;
        const dx = targetCenterX - spawnX;
        const dy = targetCenterY - spawnY;

        // Must be in front of hero
        if (dx * facingDir > 0) {
          const dist = Math.hypot(dx, dy);
          // Within forward targeting arc
          if (dist < minDistance && Math.abs(dy) < dist * 0.7) {
            minDistance = dist;
            bestTarget = { x: targetCenterX, y: targetCenterY };
          }
        }
      }
    }

    if (boss && !boss.isDead && boss.hp > 0) {
      const bossCenterX = boss.x + boss.width * 0.5;
      const bossCenterY = boss.y + boss.height * 0.45;
      const dx = bossCenterX - spawnX;
      const dy = bossCenterY - spawnY;

      if (dx * facingDir > 0) {
        const dist = Math.hypot(dx, dy);
        if (dist < minDistance && Math.abs(dy) < dist * 0.7) {
          minDistance = dist;
          bestTarget = { x: bossCenterX, y: bossCenterY };
        }
      }
    }

    if (bestTarget) {
      const tdx = bestTarget.x - spawnX;
      const tdy = bestTarget.y - spawnY;
      const tlen = Math.hypot(tdx, tdy);
      if (tlen > 0.01) {
        dirX = tdx / tlen;
        dirY = tdy / tlen;
      }
    }

    const speed = isCharged ? 860 : 680;
    const heroCfg = adminConfig.get().hero;
    const dmg = isCharged ? (heroCfg.chargedArrowDamage || 50) : (heroCfg.arrowDamage || 25);

    this.projectiles.push({
      id: `h-arrow-${Date.now()}-${Math.random()}`,
      owner: 'hero',
      x: spawnX,
      y: spawnY,
      vx: dirX * speed,
      vy: dirY * speed,
      damage: dmg,
      isCharged,
      type: 'arrow',
      radius: isCharged ? 10 : 7,
      life: 2.8,
      facing: dirX >= 0 ? 'right' : 'left',
    });

    // Arrow launch particles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: spawnX,
        y: spawnY,
        vx: -dirX * Math.random() * 60 + (Math.random() - 0.5) * 30,
        vy: -dirY * Math.random() * 60 + (Math.random() - 0.5) * 30,
        color: isCharged ? '#fbbf24' : '#f8fafc',
        size: isCharged ? 4 : 2.5,
        alpha: 0.9,
        life: 0.25,
        maxLife: 0.25,
        type: 'spark',
      });
    }
  }

  public addEnemyProjectile(proj: Projectile) {
    this.projectiles.push(proj);
  }

  public update(
    dt: number,
    hero: HeroState,
    enemies: Enemy[],
    platforms: Platform[],
    onHeroDamaged: (dmg: number, knockbackDir: number) => void,
    onEnemyDamaged: (enemyId: string, dmg: number, knockbackDir: number) => void,
    onHeroCollectEnergy: (value: number) => void,
    boss?: BossState,
    onBossDamaged?: (dmg: number, knockbackDir: number, isCharged?: boolean) => void
  ) {
    // 1. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Trail particles
      if (Math.random() > 0.4) {
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: -p.vx * 0.05,
          vy: (Math.random() - 0.5) * 20,
          color: p.owner === 'hero' ? (p.isCharged ? '#f59e0b' : '#38bdf8') : '#ef4444',
          size: p.isCharged ? 3.5 : 2,
          alpha: 0.8,
          life: 0.2,
          maxLife: 0.2,
          type: 'spark',
        });
      }

      // Check solid platform collision
      let hitObstacle = false;
      for (const plat of platforms) {
        if (!plat.isOneWay && isPointInBox(p.x, p.y, plat)) {
          hitObstacle = true;
          break;
        }
      }

      if (hitObstacle || p.life <= 0) {
        this.spawnImpactSparks(p.x, p.y, p.isCharged ? '#fbbf24' : '#94a3b8');
        this.projectiles.splice(i, 1);
        continue;
      }

      // Hero Arrow hitting Enemy or Boss
      if (p.owner === 'hero') {
        let hitTarget = false;

        // Check Boss Collision
        if (boss && !boss.isDead) {
          if (
            checkAABB(
              { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 },
              { x: boss.x - 10, y: boss.y - 10, width: boss.width + 20, height: boss.height + 20 }
            )
          ) {
            hitTarget = true;
            soundManager.play('arrowHit');
            const kDir = p.vx > 0 ? 1 : -1;
            if (onBossDamaged) onBossDamaged(p.damage, kDir, p.isCharged);
            this.addFloatingText(`-${p.damage}`, boss.x + boss.width * 0.5, boss.y - 10, p.isCharged ? '#fbbf24' : '#ffffff');
            this.spawnImpactSparks(p.x, p.y, p.isCharged ? '#f59e0b' : '#dc2626', 12);
          }
        }

        if (!hitTarget) {
          for (const e of enemies) {
            if (e.isDead) continue;
            if (
              checkAABB(
                { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 },
                { x: e.x - 10, y: e.y - 10, width: e.width + 20, height: e.height + 20 }
              )
            ) {
              hitTarget = true;
              soundManager.play('arrowHit');
              const kDir = p.vx > 0 ? 1 : -1;
              onEnemyDamaged(e.id, p.damage, kDir);

              // Spawn damage number
              this.addFloatingText(`-${p.damage}`, e.x + e.width * 0.5, e.y - 10, p.isCharged ? '#fbbf24' : '#ffffff');
              this.spawnImpactSparks(p.x, p.y, p.isCharged ? '#f59e0b' : '#dc2626', 10);
              break;
            }
          }
        }

        if (hitTarget) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Enemy Projectile hitting Hero
      if (p.owner === 'enemy') {
        if (
          !hero.isDead &&
          !hero.isInvulnerable &&
          checkAABB(
            { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 },
            { x: hero.x, y: hero.y, width: hero.width, height: hero.height }
          )
        ) {
          soundManager.play('arrowHit');
          const kDir = p.vx > 0 ? 1 : -1;
          onHeroDamaged(p.damage, kDir);
          this.addFloatingText(`-${p.damage}`, hero.x + hero.width * 0.5, hero.y - 10, '#ef4444');
          this.spawnImpactSparks(p.x, p.y, '#ef4444', 8);
          this.projectiles.splice(i, 1);
          continue;
        }
      }
    }

    // 2. Check Hero Collecting Sacred Orbs / Kalash
    for (const item of this.collectibles) {
      if (item.collected) continue;
      const dist = Math.hypot(hero.x + hero.width * 0.5 - item.x, hero.y + hero.height * 0.5 - item.y);
      if (dist < 45) {
        item.collected = true;
        onHeroCollectEnergy(item.value);
        soundManager.play('divinePower');
        this.addFloatingText(`+${item.value} DIVINE`, item.x, item.y - 15, '#fbbf24');
        this.spawnImpactSparks(item.x, item.y, '#f59e0b', 14);
      }
    }

    // 2b. Divine Power Aura - scorches nearby enemies while active
    if (hero.isDivineActive) {
      const auraRadius = 130;
      const auraDamage = 12;
      const heroCx = hero.x + hero.width * 0.5;
      const heroCy = hero.y + hero.height * 0.5;

      for (const e of enemies) {
        if (e.isDead) continue;
        const eDist = Math.hypot(heroCx - (e.x + e.width * 0.5), heroCy - (e.y + e.height * 0.5));
        if (eDist < auraRadius && e.hurtTimer <= 0) {
          const kDir = e.x >= hero.x ? 1 : -1;
          onEnemyDamaged(e.id, auraDamage, kDir);
          this.addFloatingText(`-${auraDamage}`, e.x + e.width * 0.5, e.y - 10, '#fbbf24');
          this.spawnImpactSparks(e.x + e.width * 0.5, e.y + e.height * 0.5, '#fbbf24', 8);
        }
      }
    }

    // 3. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.alpha = pt.life / pt.maxLife;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 4. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      ft.alpha = ft.life / 0.8;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public spawnImpactSparks(x: number, y: number, color: string, count: number = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 3 + Math.random() * 2,
        alpha: 1,
        life: 0.35,
        maxLife: 0.35,
        type: 'spark',
      });
    }
  }

  public spawnDivineBlessingBurst(x: number, y: number) {
    // Expanding shockwave ring for impact
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#fde68a',
      size: 18,
      alpha: 0.9,
      life: 0.6,
      maxLife: 0.6,
      type: 'shockwave_ring',
    });
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#f43f5e',
      size: 10,
      alpha: 0.7,
      life: 0.5,
      maxLife: 0.5,
      type: 'shockwave_ring',
    });

    // Golden rays and sacred flower burst
    const palette = ['#fbbf24', '#f43f5e', '#fde68a', '#fb923c'];
    for (let i = 0; i < 42; i++) {
      const angle = (i / 42) * Math.PI * 2 + Math.random() * 0.15;
      const spd = 130 + Math.random() * 130;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 40,
        color: palette[i % palette.length],
        size: 3 + Math.random() * 3.5,
        alpha: 1,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.0,
        type: 'divine_ray',
      });
    }

    // Rising sparkle motes for a lingering sacred feel
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 20,
        vy: -40 - Math.random() * 60,
        color: '#fef3c7',
        size: 2 + Math.random() * 1.5,
        alpha: 1,
        life: 1.1 + Math.random() * 0.6,
        maxLife: 1.4,
        type: 'spark',
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 0.85,
      vy: -55,
    });
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Render Projectiles
    for (const p of this.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      const angle = Math.atan2(p.vy, p.vx);
      ctx.rotate(angle);

      if (p.owner === 'hero') {
        // Sacred Bow Arrow
        const len = p.isCharged ? 36 : 26;
        // Shaft
        ctx.strokeStyle = p.isCharged ? '#fbbf24' : '#e2e8f0';
        ctx.lineWidth = p.isCharged ? 3.5 : 2;
        ctx.beginPath();
        ctx.moveTo(-len * 0.5, 0);
        ctx.lineTo(len * 0.5, 0);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = p.isCharged ? '#f59e0b' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(len * 0.5 + 6, 0);
        ctx.lineTo(len * 0.5, -4);
        ctx.lineTo(len * 0.5, 4);
        ctx.closePath();
        ctx.fill();

        // Fletching / feathers
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-len * 0.5 - 2, -3, 4, 6);
      } else {
        // Dark Rakshasa Arrow
        const len = 24;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-len * 0.5, 0);
        ctx.lineTo(len * 0.5, 0);
        ctx.stroke();

        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.moveTo(len * 0.5 + 5, 0);
        ctx.lineTo(len * 0.5, -3);
        ctx.lineTo(len * 0.5, 3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Render Particles
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;

      if (pt.type === 'divine_ray') {
        // Glowing golden ray with motion streak instead of a flat dot
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 12;
        const angle = Math.atan2(pt.vy, pt.vx);
        ctx.translate(pt.x, pt.y);
        ctx.rotate(angle);
        const streakLen = pt.size * 3;
        const grad = ctx.createLinearGradient(-streakLen, 0, streakLen * 0.4, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, pt.color);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, streakLen, pt.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (pt.type === 'shockwave_ring') {
        // Expanding ring - size grows via vx storing target radius progression
        const progress = 1 - pt.life / pt.maxLife;
        const radius = pt.size * (1 + progress * 4);
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = Math.max(1, 5 * (1 - progress));
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Standard glowing spark
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Render Floating Damage / Heal Numbers
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = 'bold 16px "Cinzel", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x - 15, ft.y);
      ctx.fillText(ft.text, ft.x - 15, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}
