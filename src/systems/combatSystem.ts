import {
  Projectile,
  Particle,
  FloatingText,
  Collectible,
  Platform,
  HeroState,
  Enemy,
} from '../types';
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

  public shootHeroArrow(hero: HeroState, isCharged: boolean) {
    const dir = hero.facing === 'right' ? 1 : -1;
    const speed = isCharged ? 750 : 550;
    const heroCfg = adminConfig.get().hero;
    const dmg = isCharged ? (heroCfg.chargedArrowDamage || 50) : (heroCfg.arrowDamage || 25);

    this.projectiles.push({
      id: `h-arrow-${Date.now()}-${Math.random()}`,
      owner: 'hero',
      x: hero.x + (dir === 1 ? hero.width + 5 : -15),
      y: hero.y + hero.height * 0.42,
      vx: dir * speed,
      vy: 0,
      damage: dmg,
      isCharged,
      type: 'arrow',
      radius: isCharged ? 9 : 6,
      life: 2.8,
      facing: hero.facing,
    });

    // Arrow launch particles
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: hero.x + (dir === 1 ? hero.width : 0),
        y: hero.y + hero.height * 0.42,
        vx: -dir * Math.random() * 80,
        vy: (Math.random() - 0.5) * 60,
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
    onHeroCollectEnergy: (value: number) => void
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

      // Hero Arrow hitting Enemy
      if (p.owner === 'hero') {
        let hitEnemy = false;
        for (const e of enemies) {
          if (e.isDead) continue;
          if (
            checkAABB(
              { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 },
              { x: e.x, y: e.y, width: e.width, height: e.height }
            )
          ) {
            hitEnemy = true;
            soundManager.play('arrowHit');
            const kDir = p.vx > 0 ? 1 : -1;
            onEnemyDamaged(e.id, p.damage, kDir);

            // Spawn damage number
            this.addFloatingText(`-${p.damage}`, e.x + e.width * 0.5, e.y - 10, p.isCharged ? '#fbbf24' : '#ffffff');
            this.spawnImpactSparks(p.x, p.y, p.isCharged ? '#f59e0b' : '#dc2626', 10);
            break;
          }
        }
        if (hitEnemy) {
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
    // Golden rays and sacred flower burst
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const spd = 120 + Math.random() * 100;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 40,
        color: i % 2 === 0 ? '#fbbf24' : '#f43f5e',
        size: 4 + Math.random() * 3,
        alpha: 1,
        life: 1.0,
        maxLife: 1.0,
        type: 'divine_ray',
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
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
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
