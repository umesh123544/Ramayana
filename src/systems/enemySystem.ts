import {
  Enemy,
  EnemyType,
  EnemyAIState,
  EnemyAnimationState,
  Platform,
  HeroState,
  Projectile,
} from '../types';
import { GRAVITY, TERMINAL_VELOCITY, resolvePlatformCollision, hasLineOfSight } from '../engine/physics';
import { soundManager } from '../audio/soundManager';
import { adminConfig } from './adminConfig';

export class EnemySystem {
  public enemies: Enemy[] = [];

  constructor() {
    this.spawnInitialEnemies();
  }

  public spawnInitialEnemies() {
    this.enemies = [
      // Type 1: Small demon warrior (Melee Rakshasa)
      this.createEnemy('small_demon', 'e1', 750, 600, 650, 950),
      this.createEnemy('small_demon', 'e2', 2600, 600, 2500, 2800),

      // Type 2: Archer demon (Ranged Rakshasa)
      this.createEnemy('archer_demon', 'e3', 1150, 480, 1050, 1250),
      this.createEnemy('archer_demon', 'e4', 3300, 600, 3150, 3450),

      // Type 3: Heavy demon warrior (Kumbha Brute)
      this.createEnemy('heavy_demon', 'e5', 1850, 600, 1750, 2050),

      // Type 4: Flying demon (Aerial Winged Rakshasa)
      this.createEnemy('flying_demon', 'e6', 1400, 340, 1300, 1600),
      this.createEnemy('flying_demon', 'e7', 2900, 360, 2750, 3100),

      // Type 5: Elite demon warrior (Golden Commander Rakshasa)
      this.createEnemy('elite_demon', 'e8', 2150, 600, 2000, 2300),
    ];
  }

  private createEnemy(
    type: EnemyType,
    id: string,
    x: number,
    y: number,
    patrolStart: number,
    patrolEnd: number
  ): Enemy {
    const config = this.getEnemyConfig(type);
    const enemiesCfg = adminConfig.get().enemies;
    const hpMult = enemiesCfg.hpMultiplier || 1.0;
    const dmgMult = enemiesCfg.damageMultiplier || 1.0;
    const finalHp = Math.round(config.maxHp * hpMult);
    const finalDmg = Math.round(config.damage * dmgMult);
    return {
      id,
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      width: config.width,
      height: config.height,
      facing: 'left',
      hp: finalHp,
      maxHp: finalHp,
      damage: finalDmg,
      attackRange: config.attackRange,
      detectionRange: config.detectionRange,
      aiState: 'PATROL',
      animState: 'Enemy_Walk',
      animTimer: 0,
      currentFrame: 0,
      attackCooldown: config.cooldown,
      attackTimer: 0,
      isAttacking: false,
      isGrounded: false,
      patrolStartX: patrolStart,
      patrolEndX: patrolEnd,
      patrolDir: 1,
      hurtTimer: 0,
      deathTimer: 0,
      isDead: false,
    };
  }

  private getEnemyConfig(type: EnemyType) {
    switch (type) {
      case 'small_demon':
        return {
          width: 44,
          height: 60,
          maxHp: 50,
          damage: 15,
          attackRange: 55,
          detectionRange: 320,
          speed: 130,
          cooldown: 1.2,
        };
      case 'archer_demon':
        return {
          width: 42,
          height: 64,
          maxHp: 45,
          damage: 18,
          attackRange: 340,
          detectionRange: 420,
          speed: 100,
          cooldown: 2.0,
        };
      case 'heavy_demon':
        return {
          width: 64,
          height: 84,
          maxHp: 120,
          damage: 32,
          attackRange: 70,
          detectionRange: 280,
          speed: 75,
          cooldown: 1.8,
        };
      case 'flying_demon':
        return {
          width: 48,
          height: 52,
          maxHp: 40,
          damage: 14,
          attackRange: 180,
          detectionRange: 360,
          speed: 140,
          cooldown: 1.5,
        };
      case 'elite_demon':
        return {
          width: 50,
          height: 72,
          maxHp: 90,
          damage: 25,
          attackRange: 65,
          detectionRange: 360,
          speed: 180,
          cooldown: 1.1,
        };
    }
  }

  public update(
    dt: number,
    hero: HeroState,
    platforms: Platform[],
    onSpawnEnemyProjectile: (proj: Projectile) => void,
    onEnemyMeleeHit: (damage: number, knockbackDir: number) => void
  ) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Handle Death
      if (e.isDead) {
        e.deathTimer += dt;
        e.animState = 'Enemy_Death';
        e.currentFrame = Math.min(8, e.deathTimer * 8);
        if (e.deathTimer >= 1.2) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      // Handle Hurt State
      if (e.hurtTimer > 0) {
        e.hurtTimer -= dt;
        e.animState = 'Enemy_Hurt';
        if (e.hurtTimer <= 0 && e.aiState === 'HURT') {
          e.aiState = 'CHASE';
        }
        continue;
      }

      // Cooldown timer
      if (e.attackTimer > 0) {
        e.attackTimer -= dt;
      }

      const config = this.getEnemyConfig(e.type);
      const distToHero = Math.hypot(hero.x - e.x, hero.y - e.y);
      const xDiff = hero.x - e.x;
      const yDiff = hero.y - e.y;

      // Line of sight check: Enemies do NOT attack or chase through solid platforms/walls
      const hasLOS = hasLineOfSight(
        e.x + e.width * 0.5,
        e.y + e.height * 0.5,
        hero.x + hero.width * 0.5,
        hero.y + hero.height * 0.5,
        platforms
      );

      // AI State Machine
      if (distToHero <= e.detectionRange && hasLOS && !hero.isDead) {
        e.facing = xDiff > 0 ? 'right' : 'left';

        if (e.type === 'archer_demon') {
          // Ranged Archer Demon AI:
          // Keep distance, aim, shoot projectiles, retreat if hero gets too close
          if (distToHero < 140) {
            // Reposition backwards away from hero
            e.aiState = 'CHASE';
            e.vx = xDiff > 0 ? -config.speed : config.speed;
            e.animState = 'Enemy_Run';
          } else if (distToHero <= e.attackRange) {
            // Stop and Attack
            e.aiState = 'ATTACK';
            e.vx = 0;
            e.animState = 'Enemy_Attack';

            if (e.attackTimer <= 0) {
              e.attackTimer = config.cooldown;
              soundManager.play('enemyAttack');
              // Shoot dark arrow projectile
              const dir = e.facing === 'right' ? 1 : -1;
              onSpawnEnemyProjectile({
                id: `e-arrow-${Date.now()}-${Math.random()}`,
                owner: 'enemy',
                x: e.x + (dir === 1 ? e.width + 5 : -15),
                y: e.y + e.height * 0.4,
                vx: dir * 420,
                vy: (hero.y - e.y) * 0.8,
                damage: e.damage,
                isCharged: false,
                type: 'dark_arrow',
                radius: 6,
                life: 3.5,
                facing: e.facing,
              });
            }
          } else {
            // Move closer to get in attack range
            e.aiState = 'CHASE';
            e.vx = xDiff > 0 ? config.speed : -config.speed;
            e.animState = 'Enemy_Walk';
          }
        } else if (e.type === 'flying_demon') {
          // Flying Demon AI (navigates in 2D air space)
          if (distToHero <= e.attackRange) {
            e.aiState = 'ATTACK';
            e.animState = 'Enemy_Attack';
            // Swoop attack
            e.vx = (xDiff / distToHero) * (config.speed * 1.5);
            e.vy = (yDiff / distToHero) * (config.speed * 1.5);

            if (distToHero < 50 && e.attackTimer <= 0) {
              e.attackTimer = config.cooldown;
              soundManager.play('enemyAttack');
              onEnemyMeleeHit(e.damage, e.facing === 'right' ? 1 : -1);
            }
          } else {
            e.aiState = 'CHASE';
            e.animState = 'Enemy_Run';
            e.vx = (xDiff / distToHero) * config.speed;
            e.vy = ((hero.y - 120 - e.y) / distToHero) * config.speed; // Hover above
          }
        } else {
          // Melee Demon Warriors (Small, Heavy, Elite)
          if (distToHero <= e.attackRange) {
            // In attack range
            e.aiState = 'ATTACK';
            e.vx = 0;
            e.animState = 'Enemy_Attack';

            if (e.attackTimer <= 0) {
              e.attackTimer = config.cooldown;
              soundManager.play('enemyAttack');
              onEnemyMeleeHit(e.damage, e.facing === 'right' ? 1 : -1);
            }
          } else {
            // Chase hero
            e.aiState = 'CHASE';
            e.vx = xDiff > 0 ? config.speed : -config.speed;
            e.animState = 'Enemy_Run';
          }
        }
      } else {
        // Hero not detected or obstructed -> Patrol along boundary
        e.aiState = 'PATROL';
        e.animState = 'Enemy_Walk';

        if (e.type !== 'flying_demon') {
          if (e.x >= e.patrolEndX) {
            e.patrolDir = -1;
            e.facing = 'left';
          } else if (e.x <= e.patrolStartX) {
            e.patrolDir = 1;
            e.facing = 'right';
          }
          e.vx = e.patrolDir * (config.speed * 0.65);
        } else {
          // Flying patrol bobbing
          e.vx = Math.sin(e.animTimer * 1.5) * 60;
          e.vy = Math.cos(e.animTimer * 2) * 40;
        }
      }

      // Physics & Platform Resolution for grounded demons
      if (e.type !== 'flying_demon') {
        e.vy = Math.min(e.vy + GRAVITY * dt, TERMINAL_VELOCITY);
        const prevY = e.y;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        resolvePlatformCollision(e, prevY, platforms);
      } else {
        // Free air movement
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }

      // Animation tick
      e.animTimer += dt;
      e.currentFrame = Math.floor(e.animTimer * 8);
    }
  }

  public applyDamage(
    enemyId: string,
    amount: number,
    knockbackDir: number
  ): { died: boolean; enemy?: Enemy } {
    const e = this.enemies.find((item) => item.id === enemyId);
    if (!e || e.isDead) return { died: false };

    e.hp = Math.max(0, e.hp - amount);
    e.hurtTimer = 0.25;
    e.aiState = 'HURT';
    e.vx = knockbackDir * 180;
    e.vy = -120;

    if (e.hp <= 0) {
      e.isDead = true;
      e.deathTimer = 0;
      soundManager.play('enemyDeath');
      return { died: true, enemy: e };
    }

    return { died: false, enemy: e };
  }

  public respawnAll() {
    this.spawnInitialEnemies();
  }
}
