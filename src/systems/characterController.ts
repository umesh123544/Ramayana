import { HeroState, UmeshAnimationState, CharacterFacing, Platform } from '../types';
import { GRAVITY, TERMINAL_VELOCITY, resolvePlatformCollision } from '../engine/physics';
import { soundManager } from '../audio/soundManager';
import { adminConfig } from './adminConfig';

export interface PlayerInput {
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean;
  attackDown: boolean;
  attackRelease: boolean;
  divinePower: boolean;
  interact: boolean;
  dodge?: boolean;
  block?: boolean;
}

export class CharacterController {
  public hero: HeroState;
  private readonly accel = 1800;
  private readonly friction = 2200;

  private get walkSpeed(): number {
    return adminConfig.get().hero.walkSpeed || 220;
  }

  private get runSpeed(): number {
    return adminConfig.get().hero.runSpeed || 380;
  }

  private get jumpForce(): number {
    return -Math.abs(adminConfig.get().hero.jumpForce || 640);
  }

  constructor(startX: number = 250, startY: number = 600) {
    const heroCfg = adminConfig.get().hero;
    this.hero = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      width: 48,
      height: 72,
      facing: 'right',
      isGrounded: false,
      isJumping: false,
      isFalling: false,
      animState: 'Umesh_Idle',
      animTimer: 0,
      currentFrame: 0,

      hp: heroCfg.maxHp || 100,
      maxHp: heroCfg.maxHp || 100,
      lives: heroCfg.lives || 3,
      maxLives: heroCfg.lives || 3,
      isHurt: false,
      hurtTimer: 0,
      isInvulnerable: false,
      invulnerableTimer: 0,
      isDead: false,
      deathTimer: 0,
      respawnX: startX,
      respawnY: startY,

      isAttacking: false,
      attackType: 'normal',
      attackTimer: 0,
      attackCooldown: 0,
      chargeTime: 0,
      isCharging: false,

      divinePower: 30, // Start with some divine energy to test/enjoy!
      isDivineActive: false,
      divineTimer: 0,
      divineCooldown: 0,

      isDodging: false,
      dodgeTimer: 0,
      dodgeCooldown: 0,
      isBlocking: false,
    };
  }

  public setCheckpoint(x: number, y: number) {
    this.hero.respawnX = x;
    this.hero.respawnY = y;
  }

  public syncWithConfig() {
    const heroCfg = adminConfig.get().hero;
    this.hero.maxHp = heroCfg.maxHp;
    this.hero.hp = Math.min(this.hero.hp, heroCfg.maxHp);
    this.hero.maxLives = heroCfg.lives;
    this.hero.lives = Math.min(this.hero.lives, heroCfg.lives);
  }

  public update(
    dt: number,
    input: PlayerInput,
    platforms: Platform[],
    onShootArrow: (isCharged: boolean) => void,
    onDivineBlessing: () => void,
    onGameOver: () => void
  ) {
    const h = this.hero;

    // Handle Death & Respawn
    if (h.isDead) {
      h.deathTimer += dt;
      h.animState = 'Umesh_Death';
      h.currentFrame = Math.min(10, h.deathTimer * 8);

      if (h.deathTimer >= 1.6) {
        if (h.lives > 0) {
          // Respawn at latest safe position
          h.isDead = false;
          h.deathTimer = 0;
          h.hp = h.maxHp;
          h.x = h.respawnX;
          h.y = h.respawnY;
          h.vx = 0;
          h.vy = 0;
          h.isInvulnerable = true;
          h.invulnerableTimer = 2.0; // 2s grace period
          h.animState = 'Umesh_Idle';
        } else {
          onGameOver();
        }
      }
      return;
    }

    // Update timers
    if (h.invulnerableTimer > 0) {
      h.invulnerableTimer -= dt;
      if (h.invulnerableTimer <= 0) {
        h.isInvulnerable = false;
      }
    }

    if (h.hurtTimer > 0) {
      h.hurtTimer -= dt;
      if (h.hurtTimer <= 0) {
        h.isHurt = false;
      }
    }

    if (h.attackCooldown > 0) {
      h.attackCooldown -= dt;
    }

    if (h.divineCooldown > 0) {
      h.divineCooldown -= dt;
    }

    if (h.isDivineActive) {
      h.divineTimer -= dt;
      if (h.divineTimer <= 0) {
        h.isDivineActive = false;
      }
    }

    // Dodge timers & execution
    if ((h.dodgeCooldown || 0) > 0) {
      h.dodgeCooldown = (h.dodgeCooldown || 0) - dt;
    }

    if (h.isDodging) {
      h.dodgeTimer = (h.dodgeTimer || 0) - dt;
      if (h.dodgeTimer <= 0) {
        h.isDodging = false;
      }
    }

    // Initiate Dodge
    if (input.dodge && !h.isDodging && (h.dodgeCooldown || 0) <= 0 && !h.isHurt && !h.isDead) {
      h.isDodging = true;
      h.dodgeTimer = 0.32;
      h.dodgeCooldown = 0.85;
      h.isInvulnerable = true;
      h.invulnerableTimer = 0.35;
      h.vx = (h.facing === 'right' ? 1 : -1) * 520;
      soundManager.play('dodge');
    }

    // Block state
    h.isBlocking = !!input.block && !h.isDodging && !h.isAttacking && !h.isHurt;

    // 1. Horizontal Movement & Acceleration
    let targetSpeed = 0;
    if (h.isDodging) {
      targetSpeed = (h.facing === 'right' ? 1 : -1) * 480;
    } else if (h.isBlocking) {
      targetSpeed = 0; // Stationary while guarding
    } else if (input.left && !input.right) {
      h.facing = 'left';
      targetSpeed = input.run ? -this.runSpeed : -this.walkSpeed;
    } else if (input.right && !input.left) {
      h.facing = 'right';
      targetSpeed = input.run ? this.runSpeed : this.walkSpeed;
    }

    // Can't move horizontally while in heavy hurt recoil
    if (h.isHurt) {
      targetSpeed = 0;
    }

    if (targetSpeed !== 0) {
      // Accelerate towards targetSpeed
      if (Math.sign(targetSpeed) === Math.sign(h.vx) || h.vx === 0) {
        h.vx = moveTowards(h.vx, targetSpeed, this.accel * dt);
      } else {
        // Quick turn friction
        h.vx = moveTowards(h.vx, targetSpeed, this.friction * 1.5 * dt);
      }

      // Footsteps sound
      if (h.isGrounded) {
        soundManager.play('heroFootsteps');
      }
    } else {
      // Decelerate / Friction
      h.vx = moveTowards(h.vx, 0, this.friction * dt);
    }

    // 2. Vertical Jump & Gravity
    const wasGrounded = h.isGrounded;
    if (input.jump && h.isGrounded && !h.isHurt) {
      h.vy = this.jumpForce;
      h.isGrounded = false;
      h.isJumping = true;
      soundManager.play('jump');
    }

    // Apply gravity
    h.vy = Math.min(h.vy + GRAVITY * dt, TERMINAL_VELOCITY);

    // Save previous Y for collision check
    const prevY = h.y;
    h.x += h.vx * dt;
    h.y += h.vy * dt;

    // Platform & Ground Collision
    const { landed } = resolvePlatformCollision(h, prevY, platforms);
    if (landed && !wasGrounded) {
      soundManager.play('landing');
      h.isJumping = false;
      // Record safe respawn point on ground
      if (h.y >= 500) {
        h.respawnX = h.x;
        h.respawnY = h.y - 10;
      }
    }

    // 3. Fall into chasm check
    if (h.y > 900) {
      this.takeDamage(100, 0); // Fatal fall
    }

    // 4. Combat / Bow Attack Charging
    if (input.attackDown && h.attackCooldown <= 0 && !h.isHurt) {
      h.isCharging = true;
      h.chargeTime = Math.min(1.2, h.chargeTime + dt);
      h.isAttacking = true;
      h.attackType = h.chargeTime >= 0.8 ? 'charged' : 'normal';
    } else if (input.attackRelease && h.isCharging) {
      const isCharged = h.chargeTime >= 0.8;
      h.isCharging = false;
      h.chargeTime = 0;
      h.attackTimer = 0.25;
      h.attackCooldown = isCharged ? 0.45 : 0.22;
      soundManager.play('bowAttack');
      onShootArrow(isCharged);
    }

    if (h.attackTimer > 0) {
      h.attackTimer -= dt;
      if (h.attackTimer <= 0) {
        h.isAttacking = false;
      }
    }

    // 5. Divine Power Activation
    if (input.divinePower && h.divinePower >= 40 && h.divineCooldown <= 0 && !h.isDivineActive) {
      h.divinePower = Math.max(0, h.divinePower - 50);
      h.isDivineActive = true;
      h.divineTimer = 6.0; // 6 seconds duration
      h.divineCooldown = 8.0;

      // Divine Blessing: restore 1 lost life OR heal 50 HP
      if (h.lives < h.maxLives) {
        h.lives += 1;
        h.hp = Math.min(h.maxHp, h.hp + 40);
      } else {
        h.hp = Math.min(h.maxHp, h.hp + 60);
      }

      soundManager.play('divinePower');
      onDivineBlessing();
    }

    // 6. Determine Animation State
    h.animTimer += dt;
    h.currentFrame = Math.floor(h.animTimer * 10);

    if (h.isHurt) {
      h.animState = 'Umesh_Hurt';
    } else if (h.isDivineActive && h.divineTimer > 5.2) {
      h.animState = 'Umesh_DivinePower';
    } else if (h.isAttacking || h.isCharging) {
      h.animState = h.chargeTime >= 0.8 ? 'Umesh_PowerAttack' : 'Umesh_Attack';
    } else if (!h.isGrounded) {
      h.animState = h.vy < 0 ? 'Umesh_Jump' : 'Umesh_Fall';
    } else if (Math.abs(h.vx) > 230) {
      h.animState = 'Umesh_Run';
    } else if (Math.abs(h.vx) > 10) {
      h.animState = 'Umesh_Walk';
    } else {
      h.animState = 'Umesh_Idle';
    }
  }

  public takeDamage(amount: number, knockbackDir: number = 0): boolean {
    const h = this.hero;
    if (h.isInvulnerable || h.isDead) return false;

    // Dodge completely avoids damage
    if (h.isDodging) {
      return false;
    }

    // Blocking reduces damage by 80% and negates knockback
    if (h.isBlocking) {
      const blockedDmg = Math.max(1, Math.round(amount * 0.2));
      h.hp = Math.max(0, h.hp - blockedDmg);
      soundManager.play('block');
      h.invulnerableTimer = 0.4;
      if (h.hp <= 0) {
        h.lives = Math.max(0, h.lives - 1);
        h.isDead = true;
        h.deathTimer = 0;
        soundManager.play('heroHurt');
      }
      return true;
    }

    // Divine aura damage resistance
    const actualDamage = h.isDivineActive ? Math.round(amount * 0.5) : amount;
    h.hp = Math.max(0, h.hp - actualDamage);
    h.isHurt = true;
    h.hurtTimer = 0.3;
    h.invulnerableTimer = 0.8;

    // Apply knockback
    h.vx = knockbackDir * 240;
    h.vy = -200;

    soundManager.play('heroHurt');

    if (h.hp <= 0) {
      h.lives = Math.max(0, h.lives - 1);
      h.isDead = true;
      h.deathTimer = 0;
      h.vx = 0;
      h.vy = 0;
      soundManager.play('heroHurt');
    }

    return true;
  }

  public collectDivineEnergy(amount: number) {
    const scaling = adminConfig.get().divinePowerScaling ?? 1.0;
    const finalAmount = Math.max(1, Math.round(amount * scaling));
    this.hero.divinePower = Math.min(100, this.hero.divinePower + finalAmount);
  }

  public resetHero() {
    const heroCfg = adminConfig.get().hero;
    this.hero.maxLives = heroCfg.lives;
    this.hero.lives = heroCfg.lives;
    this.hero.maxHp = heroCfg.maxHp;
    this.hero.hp = heroCfg.maxHp;
    this.hero.divinePower = 40;
    this.hero.isDead = false;
    this.hero.deathTimer = 0;
    this.hero.isHurt = false;
    this.hero.isInvulnerable = false;
    this.hero.x = 250;
    this.hero.y = 600;
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.animState = 'Umesh_Idle';
  }
}

function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }
  return current + Math.sign(target - current) * maxDelta;
}
