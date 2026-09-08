import { CharacterFacing, HeroState, Platform, Projectile } from '../types';
import { resolvePlatformCollision, GRAVITY, TERMINAL_VELOCITY } from '../engine/physics';
import { CHAPTER_THEMES, ChapterTheme } from '../data/chapterThemes';
import { adminConfig } from './adminConfig';
import { soundManager } from '../audio/soundManager';

export interface BossState {
  chapterId: number;
  name: string;
  hindiName: string;
  title: string;
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: CharacterFacing;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  isGrounded: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  attackTimer: number;
  specialTimer: number;
  isHurt: boolean;
  hurtTimer: number;
  isDead: boolean;
  deathTimer: number;
  isRaging: boolean;
  arenaStartX: number;
  arenaEndX: number;
  specialAttackName: string;
  phase: 1 | 2 | 3;
  shieldActive: boolean;
}

export class BossSystem {
  public boss: BossState;
  public theme: ChapterTheme;
  public isEngaged: boolean = false;

  constructor(chapterId: number = 1, arenaX: number = 5300, arenaY: number = 550) {
    this.theme = CHAPTER_THEMES[chapterId] || CHAPTER_THEMES[1];
    const b = this.theme.boss;
    const diff = adminConfig.get().difficulty;
    let hpMultiplier = 1.0;
    let dmgMultiplier = 1.0;

    if (diff === 'EASY') {
      hpMultiplier = 0.75;
      dmgMultiplier = 0.65;
    } else if (diff === 'HARD') {
      hpMultiplier = 1.35;
      dmgMultiplier = 1.35;
    } else if (diff === 'EPIC') {
      hpMultiplier = 1.8;
      dmgMultiplier = 1.7;
    }

    const maxHp = Math.round(b.maxHp * hpMultiplier);
    const damage = Math.round(b.damage * dmgMultiplier);

    // Dynamic width & height depending on boss archetype
    let width = 60;
    let height = 85;
    if (b.type === 'kumbhakarna') {
      width = 90;
      height = 120;
    } else if (b.type === 'raone') {
      width = 84;
      height = 110;
    } else if (b.type === 'viradha') {
      width = 75;
      height = 95;
    } else if (b.type === 'maricha') {
      width = 54;
      height = 76;
    }

    this.boss = {
      chapterId,
      name: b.name,
      hindiName: b.hindiName,
      title: b.title,
      type: b.type,
      x: arenaX,
      y: arenaY,
      vx: 0,
      vy: 0,
      width,
      height,
      facing: 'left',
      hp: maxHp,
      maxHp,
      damage,
      speed: b.speed,
      isGrounded: true,
      isAttacking: false,
      attackCooldown: b.attackCooldown,
      attackTimer: 0,
      specialTimer: 0,
      isHurt: false,
      hurtTimer: 0,
      isDead: false,
      deathTimer: 0,
      isRaging: false,
      arenaStartX: 4900,
      arenaEndX: 5850,
      specialAttackName: b.specialAttackName,
      phase: 1,
      shieldActive: false,
    };
  }

  public update(
    dt: number,
    hero: HeroState,
    platforms: Platform[],
    onSpawnProjectile: (proj: Projectile) => void,
    onMeleeHero: (dmg: number, knockbackDir: number) => void,
    onBossDefeated: (chapterId: number) => void
  ) {
    const b = this.boss;

    if (b.isDead) {
      b.deathTimer += dt;
      return;
    }

    // Recover hurt
    if (b.isHurt) {
      b.hurtTimer -= dt;
      if (b.hurtTimer <= 0) {
        b.isHurt = false;
      }
    }

    // Check proximity to hero (boss engages when hero approaches arena)
    const distToHero = Math.hypot(hero.x - b.x, hero.y - b.y);
    const heroInArena = hero.x >= b.arenaStartX - 200;

    if (!this.isEngaged && (heroInArena || distToHero < 550)) {
      this.isEngaged = true;
    }

    if (!this.isEngaged) {
      // Idle patrol in arena until hero approaches
      return;
    }

    // Dynamic Phase & Rage Mechanics
    const hpRatio = b.hp / b.maxHp;
    if (b.type === 'raone') {
      if (hpRatio > 0.68) {
        b.phase = 1;
        b.shieldActive = false;
        b.isRaging = false;
      } else if (hpRatio > 0.32) {
        b.phase = 2;
        b.shieldActive = true;
        b.isRaging = true;
      } else {
        b.phase = 3;
        b.shieldActive = true;
        b.isRaging = true;
        b.speed = 190;
      }
    } else {
      if (hpRatio < 0.45 && !b.isRaging) {
        b.isRaging = true;
        b.speed = Math.round(b.speed * 1.3);
      }
    }

    // Face towards hero
    b.facing = hero.x < b.x ? 'left' : 'right';

    // Apply gravity
    const prevY = b.y;
    b.vy = Math.min(b.vy + GRAVITY * dt, TERMINAL_VELOCITY);
    b.y += b.vy * dt;

    // Platform collision
    const colEntity = {
      x: b.x,
      y: b.y,
      vx: b.vx,
      vy: b.vy,
      width: b.width,
      height: b.height,
      isGrounded: b.isGrounded,
    };
    resolvePlatformCollision(colEntity, prevY, platforms);
    b.y = colEntity.y;
    b.vy = colEntity.vy;
    b.isGrounded = colEntity.isGrounded;

    // Strict boundary enforcement (prevent boss falling out of map)
    const maxBossY = 672 - b.height;
    if (b.y > maxBossY) {
      b.y = maxBossY;
      b.vy = 0;
      b.isGrounded = true;
    }

    // Movement AI
    const idealDist = b.type === 'maricha' || b.type === 'indrajit' ? 240 : (b.type === 'raone' ? 140 : 80);
    const moveSpeed = b.isRaging ? b.speed * 1.35 : b.speed;

    if (distToHero > idealDist + 20) {
      // Approach hero
      b.vx = (b.facing === 'left' ? -1 : 1) * moveSpeed;
    } else if (distToHero < idealDist - 30) {
      // Back away slightly to prepare attack
      b.vx = (b.facing === 'left' ? 1 : -1) * (moveSpeed * 0.7);
    } else {
      b.vx = 0;
    }

    b.x += b.vx * dt;

    // Keep within arena bounds
    if (b.x < b.arenaStartX) b.x = b.arenaStartX;
    if (b.x > b.arenaEndX - b.width) b.x = b.arenaEndX - b.width;

    // Attack cooldown timers
    b.attackTimer -= dt;
    b.specialTimer -= dt;

    // Melee attack check
    if (distToHero < b.width + 30 && b.attackTimer <= 0) {
      b.attackTimer = b.attackCooldown;
      b.isAttacking = true;
      setTimeout(() => {
        b.isAttacking = false;
      }, 400);

      const kDir = b.facing === 'left' ? -1 : 1;
      onMeleeHero(b.damage, kDir);
      soundManager.play('enemyAttack');
    }

    // Ranged / Special attack check
    if (b.specialTimer <= 0 && distToHero > 80 && distToHero < 900) {
      b.specialTimer = b.isRaging ? 2.2 : 3.6;
      this.performSpecialAttack(hero, onSpawnProjectile);
    }
  }

  private performSpecialAttack(hero: HeroState, onSpawnProjectile: (proj: Projectile) => void) {
    const b = this.boss;
    const cfg = this.theme.boss;
    const dir = b.facing === 'left' ? -1 : 1;
    const spawnX = b.x + (dir === 1 ? b.width + 10 : -20);
    const spawnY = b.y + b.height * 0.45;

    soundManager.play('enemyAttack');

    if (b.type === 'raone') {
      // Raone multi-phase special attacks
      if (b.phase === 1) {
        // Phase 1: 3-way spread Chandrahas Dark Orbs
        const angles = [-0.18, 0, 0.18];
        angles.forEach((angle, idx) => {
          const speed = 480;
          const vx = Math.cos(angle) * dir * speed;
          const vy = Math.sin(angle) * speed;
          onSpawnProjectile({
            id: `raone-p1-${Date.now()}-${idx}`,
            owner: 'enemy',
            x: spawnX,
            y: spawnY,
            vx,
            vy,
            damage: Math.round(b.damage * 0.9),
            isCharged: true,
            type: 'fire_orb',
            radius: 11,
            life: 3.2,
            facing: b.facing,
          });
        });
      } else if (b.phase === 2) {
        // Phase 2: 5-way spread + Falling Meteors
        const angles = [-0.3, -0.15, 0, 0.15, 0.3];
        angles.forEach((angle, idx) => {
          const speed = 520;
          const vx = Math.cos(angle) * dir * speed;
          const vy = Math.sin(angle) * speed;
          onSpawnProjectile({
            id: `raone-p2-${Date.now()}-${idx}`,
            owner: 'enemy',
            x: spawnX,
            y: spawnY,
            vx,
            vy,
            damage: b.damage,
            isCharged: true,
            type: 'fire_orb',
            radius: 12,
            life: 3.4,
            facing: b.facing,
          });
        });

        // Falling Sky Meteors near hero
        for (let i = 0; i < 2; i++) {
          const dropX = hero.x + (i === 0 ? -90 : 90);
          onSpawnProjectile({
            id: `raone-meteor-${Date.now()}-${i}`,
            owner: 'enemy',
            x: dropX,
            y: 120,
            vx: (Math.random() - 0.5) * 40,
            vy: 360,
            damage: Math.round(b.damage * 1.1),
            isCharged: true,
            type: 'fire_orb',
            radius: 14,
            life: 2.2,
            facing: 'left',
          });
        }
      } else {
        // Phase 3: Cosmic Brahmastra Cataclysm (7-way spread + Ground Shockwave)
        const angles = [-0.4, -0.25, -0.12, 0, 0.12, 0.25, 0.4];
        angles.forEach((angle, idx) => {
          const speed = 560;
          const vx = Math.cos(angle) * dir * speed;
          const vy = Math.sin(angle) * speed;
          onSpawnProjectile({
            id: `raone-p3-${Date.now()}-${idx}`,
            owner: 'enemy',
            x: spawnX,
            y: spawnY,
            vx,
            vy,
            damage: Math.round(b.damage * 1.15),
            isCharged: true,
            type: 'fire_orb',
            radius: 13,
            life: 3.5,
            facing: b.facing,
          });
        });

        // Fast Ground Shockwave that must be jumped over
        onSpawnProjectile({
          id: `raone-shockwave-${Date.now()}`,
          owner: 'enemy',
          x: spawnX,
          y: b.y + b.height - 15,
          vx: dir * 420,
          vy: 0,
          damage: Math.round(b.damage * 1.2),
          isCharged: true,
          type: 'dark_arrow',
          radius: 16,
          life: 2.5,
          facing: b.facing,
        });
      }
    } else if (b.type === 'indrajit') {
      // 3-way spread attack for Indrajit
      const angles = [-0.15, 0, 0.15];
      angles.forEach((angle, idx) => {
        const speed = 490;
        const vx = Math.cos(angle) * dir * speed;
        const vy = Math.sin(angle) * speed;
        onSpawnProjectile({
          id: `indrajit-proj-${Date.now()}-${idx}`,
          owner: 'enemy',
          x: spawnX,
          y: spawnY,
          vx,
          vy,
          damage: Math.round(b.damage * 0.9),
          isCharged: true,
          type: cfg.projectileType,
          radius: 10,
          life: 3.2,
          facing: b.facing,
        });
      });
    } else {
      // Fast focused projectile
      onSpawnProjectile({
        id: `boss-proj-${Date.now()}`,
        owner: 'enemy',
        x: spawnX,
        y: spawnY,
        vx: dir * 520,
        vy: 0,
        damage: b.damage,
        isCharged: b.isRaging,
        type: cfg.projectileType,
        radius: 10,
        life: 3.0,
        facing: b.facing,
      });
    }
  }

  public applyDamage(
    dmg: number,
    knockbackDir: number,
    onBossDefeated: (chapterId: number) => void,
    isCharged: boolean = false,
    isDivineActive: boolean = false
  ): { died: boolean; remainingHp: number; absorbed: boolean } {
    const b = this.boss;
    if (b.isDead) return { died: false, remainingHp: 0, absorbed: false };

    let effectiveDmg = dmg;
    let absorbed = false;

    // Raone's Ten-Headed Armor Shield reduces regular uncharged arrow damage
    if (b.type === 'raone' && b.shieldActive && !isCharged && !isDivineActive) {
      effectiveDmg = Math.round(dmg * 0.45);
      absorbed = true;
    }

    b.hp = Math.max(0, b.hp - effectiveDmg);
    b.isHurt = true;
    b.hurtTimer = 0.25;
    b.x += knockbackDir * 6; // Slight knockback

    if (b.hp <= 0) {
      b.isDead = true;
      b.deathTimer = 0;
      soundManager.play('levelComplete');
      onBossDefeated(b.chapterId);
      return { died: true, remainingHp: 0, absorbed };
    }

    return { died: false, remainingHp: b.hp, absorbed };
  }
}
