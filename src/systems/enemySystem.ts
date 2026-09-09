import {
  Enemy,
  EnemyType,
  Platform,
  HeroState,
  Projectile,
} from '../types';
import { GRAVITY, TERMINAL_VELOCITY, resolvePlatformCollision, hasLineOfSight } from '../engine/physics';
import { soundManager } from '../audio/soundManager';
import { adminConfig } from './adminConfig';

export class EnemySystem {
  public enemies: Enemy[] = [];
  public chapterId: number = 1;

  constructor(chapterId: number = 1) {
    this.chapterId = chapterId;
    this.spawnInitialEnemies();
  }

  public spawnInitialEnemies() {
    const ch = this.chapterId;
    const baseList: Enemy[] = [
      // Melee Rakshasas - securely positioned on ground/bridge
      this.createEnemy('small_demon', 'e1', 750, 672 - 48, 620, 950),
      this.createEnemy('small_demon', 'e2', 2550, 660 - 48, 2350, 2750),

      // Archer Rakshasa perched safely on stone platforms
      this.createEnemy('archer_demon', 'e3', 1120, 530 - 50, 1040, 1220),
      this.createEnemy('archer_demon', 'e4', 3220, 530 - 50, 3120, 3320),

      // Heavy Demon Warrior on main ground
      this.createEnemy('heavy_demon', 'e5', 1850, 672 - 68, 1700, 2050),

      // Tunnel ambush - lurking under the low rocky ceiling
      this.createEnemy('small_demon', 'e10', 3950, 672 - 48, 3760, 4350),

      // Far Outpost guards, before the boss arena
      this.createEnemy('archer_demon', 'e11', 4740, 470 - 50, 4700, 4860),
      this.createEnemy('heavy_demon', 'e12', 4550, 672 - 68, 4470, 4850),
    ];

    // Chapters 3+: add flying demons in reachable airspace
    if (ch >= 3) {
      baseList.push(
        this.createEnemy('flying_demon', 'e6', 1400, 320, 1250, 1600),
        this.createEnemy('flying_demon', 'e7', 2850, 340, 2700, 3050)
      );
    }

    // Chapters 5+: add elite demon commander
    if (ch >= 5) {
      baseList.push(
        this.createEnemy('elite_demon', 'e8', 2100, 672 - 64, 1950, 2200)
      );
    }

    // Chapters 8+: add another elite demon guard for Lanka / Yuddha
    if (ch >= 8) {
      baseList.push(
        this.createEnemy('elite_demon', 'e9', 2950, 672 - 64, 2820, 3100)
      );
    }

    this.enemies = baseList;
  }

  private createEnemy(
    type: EnemyType,
    id: string,
    x: number,
    y: number,
    patrolStartX: number,
    patrolEndX: number
  ): Enemy {
    const config = this.getEnemyConfig(type);
    const enemiesCfg = adminConfig.get().enemies;
    const chMultiplier = 1 + (this.chapterId - 1) * 0.08; // Chapter scaling
    const hpMult = (enemiesCfg.hpMultiplier || 1.0) * chMultiplier;
    const dmgMult = (enemiesCfg.damageMultiplier || 1.0) * chMultiplier;
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
      detectionRange: type === 'archer_demon' ? 450 : 320,
      attackCooldown: config.attackCooldown,
      attackTimer: Math.random() * config.attackCooldown,
      aiState: 'PATROL',
      animState: 'Enemy_Walk',
      animTimer: 0,
      currentFrame: 0,
      patrolStartX,
      patrolEndX,
      patrolDir: -1,
      isAttacking: false,
      isGrounded: true,
      hurtTimer: 0,
      deathTimer: 0,
      isDead: false,
    };
  }

  private getEnemyConfig(type: EnemyType) {
    switch (type) {
      case 'small_demon':
        return { width: 38, height: 48, maxHp: 65, damage: 12, speed: 90, attackRange: 50, attackCooldown: 1.6 };
      case 'archer_demon':
        return { width: 36, height: 50, maxHp: 55, damage: 14, speed: 70, attackRange: 380, attackCooldown: 2.2 };
      case 'heavy_demon':
        return { width: 56, height: 68, maxHp: 160, damage: 25, speed: 50, attackRange: 65, attackCooldown: 2.4 };
      case 'flying_demon':
        return { width: 44, height: 40, maxHp: 50, damage: 15, speed: 110, attackRange: 220, attackCooldown: 1.8 };
      case 'elite_demon':
        return { width: 48, height: 64, maxHp: 190, damage: 28, speed: 80, attackRange: 70, attackCooldown: 1.5 };
      default:
        return { width: 40, height: 50, maxHp: 80, damage: 15, speed: 80, attackRange: 60, attackCooldown: 1.8 };
    }
  }

  public update(
    dt: number,
    hero: HeroState,
    platforms: Platform[],
    onSpawnProjectile: (proj: Projectile) => void,
    onMeleeHero: (damage: number, knockbackDir: number) => void
  ) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const cfg = this.getEnemyConfig(enemy.type);

      // Handle hurt recovery timer
      if (enemy.hurtTimer > 0) {
        enemy.hurtTimer -= dt;
      }

      // Decrement attack cooldown
      if (enemy.attackTimer > 0) {
        enemy.attackTimer -= dt;
      }

      // Distance to Hero
      const distToHero = Math.hypot(hero.x - enemy.x, hero.y - enemy.y);
      const detectionRadius = enemy.detectionRange;
      const canSeeHero = distToHero < detectionRadius && hasLineOfSight(enemy.x, enemy.y - 20, hero.x, hero.y - 20, platforms);

      // AI State Machine
      if (enemy.aiState === 'PATROL') {
        if (canSeeHero) {
          enemy.aiState = 'CHASE';
          enemy.animState = 'Enemy_Walk';
        } else {
          // Patrol back and forth
          if (enemy.facing === 'left') {
            enemy.vx = -cfg.speed * 0.6;
            if (enemy.x <= enemy.patrolStartX) {
              enemy.facing = 'right';
            }
          } else {
            enemy.vx = cfg.speed * 0.6;
            if (enemy.x >= enemy.patrolEndX) {
              enemy.facing = 'left';
            }
          }
          enemy.animState = 'Enemy_Walk';
        }
      } else if (enemy.aiState === 'CHASE') {
        if (!canSeeHero && distToHero > detectionRadius * 1.5) {
          enemy.aiState = 'PATROL';
        } else {
          // Face toward hero
          enemy.facing = hero.x < enemy.x ? 'left' : 'right';

          if (distToHero <= enemy.attackRange) {
            // Within attack range -> Switch to attack
            enemy.aiState = 'ATTACK';
            enemy.vx = 0;
          } else {
            // Move toward hero
            const dir = enemy.facing === 'left' ? -1 : 1;
            enemy.vx = dir * cfg.speed;
            enemy.animState = 'Enemy_Walk';
          }
        }
      } else if (enemy.aiState === 'ATTACK') {
        enemy.vx = 0;
        enemy.facing = hero.x < enemy.x ? 'left' : 'right';

        if (distToHero > enemy.attackRange * 1.2) {
          enemy.aiState = 'CHASE';
        } else if (enemy.attackTimer <= 0) {
          // Execute Attack
          enemy.attackTimer = enemy.attackCooldown;
          enemy.animState = 'Enemy_Attack';

          if (enemy.type === 'archer_demon') {
            // Ranged Shot
            const shootDir = enemy.facing === 'left' ? -1 : 1;
            onSpawnProjectile({
              id: `enemy_arrow_${Date.now()}_${Math.random()}`,
              owner: 'enemy',
              x: enemy.x + (shootDir === 1 ? enemy.width + 4 : -4),
              y: enemy.y - 25,
              vx: shootDir * 420,
              vy: 0,
              damage: enemy.damage,
              isCharged: false,
              type: 'dark_arrow',
              radius: 6,
              life: 2.2,
              facing: enemy.facing,
            });
            soundManager.play('enemyAttack');
          } else if (enemy.type === 'flying_demon') {
            // Dive bomb melee
            const dir = enemy.facing === 'left' ? -1 : 1;
            onMeleeHero(enemy.damage, dir);
            soundManager.play('enemyAttack');
          } else {
            // Ground Melee Strike
            const dir = enemy.facing === 'left' ? -1 : 1;
            onMeleeHero(enemy.damage, dir);
            soundManager.play('enemyAttack');
          }
        } else {
          // Resting between attacks
          enemy.animState = 'Enemy_Idle';
        }
      }

      // Physics & Movement
      if (enemy.type === 'flying_demon') {
        // Floating sinusoidal movement in comfortable reachable airspace
        enemy.vy = Math.sin(Date.now() * 0.005 + enemy.x) * 35;
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;

        // Strict vertical bounds for flying demons (always visible and hittable)
        if (enemy.y < 180) {
          enemy.y = 180;
          enemy.vy = Math.abs(enemy.vy);
        } else if (enemy.y > 480) {
          enemy.y = 480;
          enemy.vy = -Math.abs(enemy.vy);
        }
      } else {
        // Apply Gravity
        const prevY = enemy.y;
        enemy.vy = Math.min(enemy.vy + GRAVITY * dt, TERMINAL_VELOCITY);
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;

        // Platform collision: pass standard bounding box
        const colEntity = {
          x: enemy.x,
          y: enemy.y,
          vx: enemy.vx,
          vy: enemy.vy,
          width: enemy.width,
          height: enemy.height,
          isGrounded: enemy.isGrounded,
        };

        resolvePlatformCollision(colEntity, prevY, platforms);
        enemy.y = colEntity.y;
        enemy.vy = colEntity.vy;
        enemy.isGrounded = colEntity.isGrounded;

        // Strict Ground Floor limit: keep firmly on top of ground
        const maxGroundY = 672 - enemy.height;
        if (enemy.y > maxGroundY) {
          enemy.y = maxGroundY;
          enemy.vy = 0;
          enemy.isGrounded = true;
        }

        // Archer demons on elevated platforms: constrain patrol so they never fall off
        if (enemy.type === 'archer_demon') {
          if (enemy.x <= enemy.patrolStartX) {
            enemy.x = enemy.patrolStartX;
            enemy.facing = 'right';
            if (enemy.vx < 0) enemy.vx = Math.abs(enemy.vx);
          } else if (enemy.x >= enemy.patrolEndX) {
            enemy.x = enemy.patrolEndX;
            enemy.facing = 'left';
            if (enemy.vx > 0) enemy.vx = -Math.abs(enemy.vx);
          }
        }
      }

      // Strict Map Boundary Enforcement (prevent enemies from leaving the map world)
      const MIN_MAP_X = 80;
      const MAX_MAP_X = 5870 - enemy.width;

      if (enemy.x < MIN_MAP_X) {
        enemy.x = MIN_MAP_X;
        enemy.vx = Math.abs(enemy.vx);
        enemy.facing = 'right';
      } else if (enemy.x > MAX_MAP_X) {
        enemy.x = MAX_MAP_X;
        enemy.vx = -Math.abs(enemy.vx);
        enemy.facing = 'left';
      }

      // Animation Frame Cycling
      enemy.currentFrame += dt * 8;
    }
  }

  public applyDamage(
    enemyId: string,
    damage: number,
    knockbackDir: number
  ): { died: boolean; enemy?: Enemy } {
    const enemy = this.enemies.find((e) => e.id === enemyId);
    if (!enemy) return { died: false };

    enemy.hp -= damage;
    enemy.hurtTimer = 0.25;
    enemy.animState = 'Enemy_Hurt';
    enemy.vx = knockbackDir * 150; // Apply knockback
    enemy.aiState = 'CHASE'; // Aggro onto attacker

    soundManager.play('heroHurt');

    if (enemy.hp <= 0) {
      // Enemy Defeated
      this.enemies = this.enemies.filter((e) => e.id !== enemyId);
      soundManager.play('enemyDeath');
      return { died: true, enemy };
    }

    return { died: false, enemy };
  }
}
