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
      // Melee Rakshasas
      this.createEnemy('small_demon', 'e1', 750, 600, 650, 950),
      this.createEnemy('small_demon', 'e2', 2600, 600, 2500, 2800),

      // Archer Rakshasa
      this.createEnemy('archer_demon', 'e3', 1150, 480, 1050, 1250),
      this.createEnemy('archer_demon', 'e4', 3300, 600, 3150, 3450),

      // Heavy Demon Warrior
      this.createEnemy('heavy_demon', 'e5', 1850, 600, 1750, 2050),
    ];

    // Chapters 3+: add flying demons
    if (ch >= 3) {
      baseList.push(
        this.createEnemy('flying_demon', 'e6', 1400, 340, 1300, 1600),
        this.createEnemy('flying_demon', 'e7', 2900, 360, 2750, 3100)
      );
    }

    // Chapters 5+: add elite demon commander
    if (ch >= 5) {
      baseList.push(
        this.createEnemy('elite_demon', 'e8', 2150, 600, 2000, 2300)
      );
    }

    // Chapters 8+: add another elite demon guard for Lanka / Yuddha
    if (ch >= 8) {
      baseList.push(
        this.createEnemy('elite_demon', 'e9', 3050, 500, 2950, 3200)
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
        // Floating sinusoidal movement
        enemy.vy = Math.sin(Date.now() * 0.005 + enemy.x) * 40;
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;
      } else {
        // Apply Gravity
        const prevFootY = enemy.y - enemy.height;
        enemy.vy = Math.min(enemy.vy + GRAVITY * dt, TERMINAL_VELOCITY);
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;

        // Platform collision
        const colEntity = {
          x: enemy.x - enemy.width * 0.5,
          y: enemy.y - enemy.height,
          vx: enemy.vx,
          vy: enemy.vy,
          width: enemy.width,
          height: enemy.height,
          isGrounded: enemy.isGrounded,
        };

        resolvePlatformCollision(colEntity, prevFootY, platforms);
        enemy.y = colEntity.y + enemy.height;
        enemy.vy = colEntity.vy;
        enemy.isGrounded = colEntity.isGrounded;
      }

      // Strict Map Boundary Enforcement (prevent enemies from going outside the world)
      const MIN_MAP_X = 60;
      const MAX_MAP_X = 4120;
      const MAX_GROUND_Y = 672;

      if (enemy.x < MIN_MAP_X) {
        enemy.x = MIN_MAP_X;
        enemy.vx = Math.abs(enemy.vx);
        enemy.facing = 'right';
      } else if (enemy.x > MAX_MAP_X) {
        enemy.x = MAX_MAP_X;
        enemy.vx = -Math.abs(enemy.vx);
        enemy.facing = 'left';
      }

      if (enemy.type === 'flying_demon') {
        if (enemy.y < 160) {
          enemy.y = 160;
          enemy.vy = Math.abs(enemy.vy);
        } else if (enemy.y > 580) {
          enemy.y = 580;
          enemy.vy = -Math.abs(enemy.vy);
        }
      } else {
        if (enemy.y > MAX_GROUND_Y) {
          enemy.y = MAX_GROUND_Y;
          enemy.vy = 0;
          enemy.isGrounded = true;
        }
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
