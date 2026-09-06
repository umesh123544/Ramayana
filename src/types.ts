export type CharacterFacing = 'left' | 'right';

// Umesh Animation States (as required in spec)
export type UmeshAnimationState =
  | 'Umesh_Idle'
  | 'Umesh_Walk'
  | 'Umesh_Run'
  | 'Umesh_Jump'
  | 'Umesh_Fall'
  | 'Umesh_Attack'
  | 'Umesh_PowerAttack'
  | 'Umesh_Hurt'
  | 'Umesh_Death'
  | 'Umesh_DivinePower';

// Purneema Animation States
export type PurneemaAnimationState =
  | 'Purneema_Idle'
  | 'Purneema_Walk'
  | 'Purneema_Run'
  | 'Purneema_Jump'
  | 'Purneema_Hurt'
  | 'Purneema_Talk'
  | 'Purneema_Divine';

// Raone Animation States
export type RaoneAnimationState =
  | 'Raone_Idle'
  | 'Raone_Walk'
  | 'Raone_Run'
  | 'Raone_Attack'
  | 'Raone_SpecialAttack'
  | 'Raone_Hurt'
  | 'Raone_Rage'
  | 'Raone_Death';

// Enemy Animation States
export type EnemyAnimationState =
  | 'Enemy_Idle'
  | 'Enemy_Walk'
  | 'Enemy_Run'
  | 'Enemy_Attack'
  | 'Enemy_Hurt'
  | 'Enemy_Death';

// Enemy Archetypes
export type EnemyType =
  | 'small_demon' // Type 1: Small demon warrior (melee)
  | 'archer_demon' // Type 2: Archer demon (ranged)
  | 'heavy_demon' // Type 3: Heavy demon warrior (high HP, slow, high dmg)
  | 'flying_demon' // Type 4: Flying demon (wings, dive/ranged)
  | 'elite_demon'; // Type 5: Elite demon warrior (fast, special attack)

// Enemy AI States
export type EnemyAIState =
  | 'IDLE'
  | 'PATROL'
  | 'DETECT_HERO'
  | 'CHASE'
  | 'ATTACK'
  | 'HURT'
  | 'DEATH';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'stone' | 'wood_bridge' | 'floating_ledge';
  isOneWay?: boolean;
}

export interface Projectile {
  id: string;
  owner: 'hero' | 'enemy';
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isCharged: boolean;
  type: 'arrow' | 'dark_arrow' | 'fire_orb';
  radius: number;
  life: number; // in seconds
  facing: CharacterFacing;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'spark' | 'divine_ray' | 'blood' | 'dust' | 'flower';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  vy: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'divine_orb' | 'sacred_kalash' | 'lotus_flower';
  value: number; // Divine power points
  collected: boolean;
  bobOffset: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
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
  attackRange: number;
  detectionRange: number;
  aiState: EnemyAIState;
  animState: EnemyAnimationState;
  animTimer: number;
  currentFrame: number;
  attackCooldown: number;
  attackTimer: number;
  isAttacking: boolean;
  isGrounded: boolean;
  patrolStartX: number;
  patrolEndX: number;
  patrolDir: 1 | -1;
  hurtTimer: number;
  deathTimer: number;
  isDead: boolean;
}

export interface HeroState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: CharacterFacing;
  isGrounded: boolean;
  isJumping: boolean;
  isFalling: boolean;
  animState: UmeshAnimationState;
  animTimer: number;
  currentFrame: number;
  
  // Health & Lives
  hp: number;
  maxHp: number;
  lives: number;
  maxLives: number;
  isHurt: boolean;
  hurtTimer: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  isDead: boolean;
  deathTimer: number;
  respawnX: number;
  respawnY: number;

  // Combat
  isAttacking: boolean;
  attackType: 'normal' | 'fast' | 'charged';
  attackTimer: number;
  attackCooldown: number;
  chargeTime: number; // For charged attack
  isCharging: boolean;

  // Divine Power
  divinePower: number; // 0 to 100
  isDivineActive: boolean;
  divineTimer: number;
  divineCooldown: number;
}

export interface PurneemaState {
  x: number;
  y: number;
  facing: CharacterFacing;
  animState: PurneemaAnimationState;
  animTimer: number;
  currentFrame: number;
  isInteracting: boolean;
  hasGivenBlessing: boolean;
  dialogueIndex: number;
}

export interface RaoneState {
  x: number;
  y: number;
  facing: CharacterFacing;
  animState: RaoneAnimationState;
  animTimer: number;
  currentFrame: number;
  hp: number;
  maxHp: number;
  isRaging: boolean;
  actionTimer: number;
}

export interface CustomSpriteSheetConfig {
  id: string;
  name: string;
  imageUrl: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
}
