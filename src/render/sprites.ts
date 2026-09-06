import {
  CharacterFacing,
  UmeshAnimationState,
  PurneemaAnimationState,
  RaoneAnimationState,
  EnemyAnimationState,
  EnemyType,
} from '../types';
import { spritePipeline } from '../systems/spritePipeline';
import { adminConfig } from '../systems/adminConfig';

/**
 * 2D Mythological Sprite Renderer
 * Checks if custom Pixler.dev sprite sheet is registered;
 * otherwise renders rich procedural 2D mythological character graphics.
 */

export function renderUmesh(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  facing: CharacterFacing,
  state: UmeshAnimationState,
  frame: number,
  isHurt: boolean,
  isDivine: boolean,
  chargeRatio: number = 0
) {
  ctx.save();
  ctx.translate(x + width * 0.5, y + height);

  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  // Check if custom sprite sheet from Pixler.dev is active
  const sheet = spritePipeline.getConfig(state);
  if (sheet && sheet.imageElement) {
    const img = sheet.imageElement;
    const fw = sheet.frameWidth;
    const fh = sheet.frameHeight;
    const currentFrameIndex = Math.floor(frame) % sheet.frameCount;
    const sx = currentFrameIndex * fw;

    ctx.drawImage(
      img,
      sx,
      0,
      fw,
      fh,
      -width * 0.5,
      -height,
      width,
      height
    );
    ctx.restore();
    return;
  }

  const heroCfg = adminConfig.get().hero;
  const skinTone = heroCfg.skinTone || '#38bdf8';
  const dhotiColor = heroCfg.dhotiColor || '#ea580c';
  const armorColor = heroCfg.armorColor || '#f59e0b';

  // Procedural 2D Mythological Hero Rendering
  const animTime = frame * 0.2;
  const isWalking = state === 'Umesh_Walk';
  const isRunning = state === 'Umesh_Run';
  const isJumping = state === 'Umesh_Jump';
  const isFalling = state === 'Umesh_Fall';
  const isAttacking = state === 'Umesh_Attack' || state === 'Umesh_PowerAttack';
  const isDeath = state === 'Umesh_Death';

  // Divine Aura Glow if active
  if (isDivine || state === 'Umesh_DivinePower') {
    const glowRadius = 45 + Math.sin(frame * 0.5) * 8;
    const grad = ctx.createRadialGradient(0, -height * 0.55, 10, 0, -height * 0.55, glowRadius);
    grad.addColorStop(0, 'rgba(255, 230, 120, 0.65)');
    grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.3)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -height * 0.55, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Sacred rays
    ctx.strokeStyle = 'rgba(255, 245, 180, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + frame * 0.05;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 20, -height * 0.55 + Math.sin(angle) * 20);
      ctx.lineTo(Math.cos(angle) * (glowRadius - 2), -height * 0.55 + Math.sin(angle) * (glowRadius - 2));
      ctx.stroke();
    }
  }

  // Charged Bow Attack Glow
  if (chargeRatio > 0.1) {
    const cRadius = 15 + chargeRatio * 20;
    const cGrad = ctx.createRadialGradient(28, -height * 0.55, 2, 28, -height * 0.55, cRadius);
    cGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    cGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.7)');
    cGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(28, -height * 0.55, cRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Death rotation
  if (isDeath) {
    ctx.rotate(Math.min(Math.PI * 0.45, frame * 0.25));
    ctx.translate(0, 10);
  }

  // Hurt flash
  if (isHurt) {
    ctx.filter = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.9)) saturate(1.8)';
  }

  // 1. Quiver on the back
  ctx.save();
  ctx.translate(-12, -height * 0.65);
  ctx.rotate(-0.35);
  // Quiver body
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-5, 0, 10, 36);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-5, 0, 10, 36);
  // Arrow feathers protruding
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  for (let i = -3; i <= 3; i += 3) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - 2, -12);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(i - 2, -12, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Legs kinematics
  const walkCycle = isRunning ? Math.sin(animTime * 2.2) : isWalking ? Math.sin(animTime * 1.4) : 0;
  const legAngle1 = isJumping ? -0.4 : isFalling ? 0.3 : walkCycle * 0.55;
  const legAngle2 = isJumping ? 0.2 : isFalling ? -0.2 : -walkCycle * 0.55;

  // Back leg
  renderHeroLeg(ctx, -6, -26, legAngle2, false, skinTone, armorColor);
  // Front leg
  renderHeroLeg(ctx, 6, -26, legAngle1, true, skinTone, armorColor);

  // 3. Dhoti lower garment
  ctx.fillStyle = dhotiColor;
  ctx.beginPath();
  ctx.moveTo(-14, -height * 0.42);
  ctx.lineTo(14, -height * 0.42);
  ctx.lineTo(16 + walkCycle * 3, -height * 0.24);
  ctx.lineTo(-16 - walkCycle * 3, -height * 0.24);
  ctx.closePath();
  ctx.fill();

  // Gold border of dhoti
  ctx.strokeStyle = armorColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Flowing angavastram sash
  const sashWave = Math.sin(animTime * 1.5) * 6;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, -height * 0.45);
  ctx.quadraticCurveTo(-18 + sashWave, -height * 0.3, -22 + sashWave * 1.4, -height * 0.15);
  ctx.stroke();

  // 4. Hero Torso
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.roundRect(-12, -height * 0.72, 24, 28, [4, 4, 2, 2]);
  ctx.fill();

  // Chest Armor (Kavach)
  ctx.fillStyle = armorColor;
  ctx.beginPath();
  ctx.moveTo(-10, -height * 0.7);
  ctx.lineTo(10, -height * 0.7);
  ctx.lineTo(8, -height * 0.52);
  ctx.lineTo(-8, -height * 0.52);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Golden medallion in center of armor
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, -height * 0.61, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Sacred Thread (Yajnopavita)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, -height * 0.72);
  ctx.lineTo(9, -height * 0.46);
  ctx.stroke();

  // 5. Hero Head & Face
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, -height * 0.82, 11, 0, Math.PI * 2);
  ctx.fill();

  // Golden warrior Mukut (Crown / Headband)
  ctx.fillStyle = armorColor;
  ctx.beginPath();
  ctx.moveTo(-11, -height * 0.86);
  ctx.lineTo(11, -height * 0.86);
  ctx.lineTo(0, -height * 0.98); // Crown peak
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Topknot hair / Sikha
  ctx.fillStyle = '#172554'; // Deep midnight hair
  ctx.beginPath();
  ctx.arc(-2, -height * 0.94, 7, 0, Math.PI * 2);
  ctx.fill();

  // Red forehead Tilak
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(4, -height * 0.86, 2.5, 5);

  // Heroic eye
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(5, -height * 0.82, 4, 3);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(7, -height * 0.82, 2, 3);

  // 6. Arms and Bow
  if (isAttacking) {
    // Drawing Bow Animation State
    const drawBack = Math.min(18, (frame % 6) * 3 + chargeRatio * 8);

    // Left arm holding bow outward
    ctx.strokeStyle = skinTone;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(4, -height * 0.68);
    ctx.lineTo(26, -height * 0.62);
    ctx.stroke();

    // Right arm pulling bowstring back
    ctx.beginPath();
    ctx.moveTo(-4, -height * 0.68);
    ctx.lineTo(8 - drawBack, -height * 0.62);
    ctx.stroke();

    // Bow
    ctx.save();
    ctx.translate(26, -height * 0.62);
    ctx.strokeStyle = '#d97706'; // Golden wood recurve bow
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 24, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Bowstring
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(-Math.PI * 0.4) * 24, Math.sin(-Math.PI * 0.4) * 24);
    ctx.lineTo(-drawBack, 0); // Drawn point
    ctx.lineTo(Math.cos(Math.PI * 0.4) * 24, Math.sin(Math.PI * 0.4) * 24);
    ctx.stroke();

    // Arrow on bow
    ctx.strokeStyle = chargeRatio > 0.4 ? '#f59e0b' : '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-drawBack + 4, 0);
    ctx.lineTo(26, 0);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = chargeRatio > 0.4 ? '#fbbf24' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(26, -3);
    ctx.lineTo(32, 0);
    ctx.lineTo(26, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    // Resting or walking with Bow
    const armSwing = isRunning ? Math.sin(animTime * 2.2) * 0.6 : isWalking ? Math.sin(animTime * 1.4) * 0.35 : 0;

    // Right arm
    ctx.strokeStyle = skinTone;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-4, -height * 0.68);
    ctx.lineTo(-8 - armSwing * 12, -height * 0.45);
    ctx.stroke();

    // Left arm holding bow at side
    ctx.beginPath();
    ctx.moveTo(4, -height * 0.68);
    ctx.lineTo(12 + armSwing * 10, -height * 0.48);
    ctx.stroke();

    // Bow resting in left hand
    ctx.save();
    ctx.translate(12 + armSwing * 10, -height * 0.48);
    ctx.rotate(0.25);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 22, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(-Math.PI * 0.4) * 22, Math.sin(-Math.PI * 0.4) * 22);
    ctx.lineTo(Math.cos(Math.PI * 0.4) * 22, Math.sin(Math.PI * 0.4) * 22);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function renderHeroLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  angle: number,
  isFront: boolean,
  skinColor: string = '#38bdf8',
  ankletColor: string = '#f59e0b'
) {
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(angle);

  // Thigh
  ctx.strokeStyle = skinColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 14);
  ctx.stroke();

  // Calf
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(isFront ? 2 : -2, 26);
  ctx.stroke();

  // Golden warrior anklet
  ctx.fillStyle = ankletColor;
  ctx.fillRect(-3, 22, 6, 3);

  // Foot
  ctx.fillStyle = skinColor;
  ctx.fillRect(isFront ? 0 : -3, 25, 7, 3);

  ctx.restore();
}

/**
 * Renders Purneema (Heroine, supporting character)
 */
export function renderPurneema(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  facing: CharacterFacing,
  state: PurneemaAnimationState,
  frame: number
) {
  ctx.save();
  ctx.translate(x + width * 0.5, y + height);

  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  const sheet = spritePipeline.getConfig(state);
  if (sheet && sheet.imageElement) {
    const img = sheet.imageElement;
    const fw = sheet.frameWidth;
    const fh = sheet.frameHeight;
    const currentFrameIndex = Math.floor(frame) % sheet.frameCount;
    ctx.drawImage(img, currentFrameIndex * fw, 0, fw, fh, -width * 0.5, -height, width, height);
    ctx.restore();
    return;
  }

  const isDivine = state === 'Purneema_Divine';
  const isTalk = state === 'Purneema_Talk';
  const sway = Math.sin(frame * 0.15) * 3;
  const companionSari = adminConfig.get().companion.sariColor || '#be123c';

  // Gentle divine aura
  if (isDivine) {
    const rad = 45 + Math.sin(frame * 0.3) * 6;
    const grad = ctx.createRadialGradient(0, -height * 0.5, 5, 0, -height * 0.5, rad);
    grad.addColorStop(0, 'rgba(251, 113, 133, 0.6)');
    grad.addColorStop(0.5, 'rgba(253, 224, 71, 0.3)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -height * 0.5, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Silk Saree skirt
  ctx.fillStyle = companionSari;
  ctx.beginPath();
  ctx.moveTo(-12, -height * 0.5);
  ctx.lineTo(12, -height * 0.5);
  ctx.lineTo(16 + sway * 0.5, 0);
  ctx.lineTo(-16 + sway * 0.5, 0);
  ctx.closePath();
  ctx.fill();

  // Gold Zari border
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Torso / Blouse
  ctx.fillStyle = '#047857'; // Emerald green choli
  ctx.beginPath();
  ctx.roundRect(-10, -height * 0.72, 20, 22, [4, 4, 0, 0]);
  ctx.fill();

  // Flowing Saree Pallu across shoulder
  ctx.fillStyle = companionSari;
  ctx.beginPath();
  ctx.moveTo(6, -height * 0.5);
  ctx.quadraticCurveTo(-12 + sway, -height * 0.65, -16 + sway * 1.2, -height * 0.35);
  ctx.lineTo(-10 + sway * 1.2, -height * 0.35);
  ctx.closePath();
  ctx.fill();

  // Golden necklace
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -height * 0.71, 6, 0, Math.PI);
  ctx.stroke();

  // Head & Hair
  ctx.fillStyle = '#fed7aa'; // Fair warm skin tone
  ctx.beginPath();
  ctx.arc(0, -height * 0.82, 10, 0, Math.PI * 2);
  ctx.fill();

  // Traditional Hair braid & Jasmine garland (Gajra)
  ctx.fillStyle = '#1e1b4b'; // Black hair
  ctx.beginPath();
  ctx.arc(0, -height * 0.85, 11, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-12, -height * 0.85, 5, 20); // Long hair braid

  // White jasmine flowers
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-10, -height * 0.84 + i * 5, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Red Bindi
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(4, -height * 0.84, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Hands (Namaste / Blessing / Lotus gesture)
  ctx.fillStyle = '#fed7aa';
  if (isDivine || isTalk) {
    // Blessing or Namaste mudra
    ctx.beginPath();
    ctx.arc(8, -height * 0.62, 4, 0, Math.PI * 2);
    ctx.fill();
    // Glowing lotus flower in hand
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(9, -height * 0.66, 4, 6, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Gentle resting arms
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(6, -height * 0.7);
    ctx.lineTo(8, -height * 0.52);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Renders Raone (Main Villain, Ravana archetype)
 */
export function renderRaone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  facing: CharacterFacing,
  state: RaoneAnimationState,
  frame: number
) {
  ctx.save();
  ctx.translate(x + width * 0.5, y + height);

  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  const sheet = spritePipeline.getConfig(state);
  if (sheet && sheet.imageElement) {
    const img = sheet.imageElement;
    const fw = sheet.frameWidth;
    const fh = sheet.frameHeight;
    const currentFrameIndex = Math.floor(frame) % sheet.frameCount;
    ctx.drawImage(img, currentFrameIndex * fw, 0, fw, fh, -width * 0.5, -height, width, height);
    ctx.restore();
    return;
  }

  const isRage = state === 'Raone_Rage';
  const isAttack = state === 'Raone_Attack' || state === 'Raone_SpecialAttack';
  const isDeath = state === 'Raone_Death';

  if (isDeath) {
    ctx.rotate(Math.min(Math.PI * 0.5, frame * 0.2));
  }

  // Intimidating Demon King Dark Flame Aura
  if (isRage || isAttack) {
    const auraRadius = 55 + Math.sin(frame * 0.4) * 8;
    const darkGrad = ctx.createRadialGradient(0, -height * 0.55, 15, 0, -height * 0.55, auraRadius);
    darkGrad.addColorStop(0, 'rgba(153, 27, 27, 0.7)');
    darkGrad.addColorStop(0.6, 'rgba(69, 10, 10, 0.4)');
    darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = darkGrad;
    ctx.beginPath();
    ctx.arc(0, -height * 0.55, auraRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1. Heavy Royal Demon Cape
  const villainColor = adminConfig.get().villain.armorColor || '#450a0a';
  ctx.fillStyle = villainColor;
  ctx.beginPath();
  ctx.moveTo(-18, -height * 0.75);
  ctx.lineTo(18, -height * 0.75);
  ctx.lineTo(24, 0);
  ctx.lineTo(-24, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 2. Heavy Demon Armor & Legs
  ctx.fillStyle = '#1c1917'; // Obsidian armor
  ctx.fillRect(-16, -height * 0.35, 12, height * 0.35);
  ctx.fillRect(4, -height * 0.35, 12, height * 0.35);

  // Golden leg guards
  ctx.fillStyle = '#d97706';
  ctx.fillRect(-16, -height * 0.2, 12, 6);
  ctx.fillRect(4, -height * 0.2, 12, 6);

  // 3. Massive Torso & Golden Demon Chestplate
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.roundRect(-20, -height * 0.75, 40, 42, [6, 6, 2, 2]);
  ctx.fill();

  // Fanged Golden Demon Kavach
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(-18, -height * 0.73);
  ctx.lineTo(18, -height * 0.73);
  ctx.lineTo(12, -height * 0.45);
  ctx.lineTo(0, -height * 0.38);
  ctx.lineTo(-12, -height * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Multiple Arms Silhouette (Mythological Ravana inspired)
  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 5;
  // Extra left arms
  ctx.beginPath();
  ctx.moveTo(-18, -height * 0.68);
  ctx.lineTo(-34, -height * 0.82);
  ctx.moveTo(-18, -height * 0.58);
  ctx.lineTo(-32, -height * 0.48);
  ctx.stroke();
  // Extra right arms
  ctx.beginPath();
  ctx.moveTo(18, -height * 0.68);
  ctx.lineTo(34, -height * 0.82);
  ctx.moveTo(18, -height * 0.58);
  ctx.lineTo(32, -height * 0.48);
  ctx.stroke();

  // Primary arm with Demon Mace or Sword
  if (isAttack) {
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(16, -height * 0.68);
    ctx.lineTo(36, -height * 0.65);
    ctx.stroke();

    // Spiked Gada (Mace)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(34, -height * 0.78, 5, 24);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(36, -height * 0.8, 12, 0, Math.PI * 2);
    ctx.fill();
    // Spikes
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 6; i++) {
      const spA = (i * Math.PI) / 3;
      ctx.fillRect(36 + Math.cos(spA) * 12, -height * 0.8 + Math.sin(spA) * 12, 3, 3);
    }
  }

  // 4. Ten-Headed Crown Silhouette (Central Grand Mukut + flanking heads)
  // Side heads silhouette
  ctx.fillStyle = '#292524';
  [-24, -14, 14, 24].forEach((hX) => {
    ctx.beginPath();
    ctx.arc(hX, -height * 0.82, 6, 0, Math.PI * 2);
    ctx.fill();
    // Glowing red eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(hX + 1, -height * 0.83, 2, 2);
    ctx.fillStyle = '#292524';
  });

  // Central Majestic Head
  ctx.fillStyle = '#44403c'; // Dark warrior complexion
  ctx.beginPath();
  ctx.arc(0, -height * 0.84, 13, 0, Math.PI * 2);
  ctx.fill();

  // Golden Grand Mukut (Demon King Crown)
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(-16, -height * 0.88);
  ctx.lineTo(16, -height * 0.88);
  ctx.lineTo(10, -height * 1.02);
  ctx.lineTo(0, -height * 1.08); // Tall central spire
  ctx.lineTo(-10, -height * 1.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ruby Gem on Crown
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(0, -height * 0.96, 4, 0, Math.PI * 2);
  ctx.fill();

  // Glowing red eyes
  ctx.fillStyle = isRage ? '#ff0000' : '#ef4444';
  ctx.fillRect(3, -height * 0.85, 4, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(5, -height * 0.85, 1.5, 2);

  // Fanged grimace / mustache
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(1, -height * 0.79);
  ctx.lineTo(9, -height * 0.81);
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders the 5 Side-Villain / Enemy Archetypes
 */
export function renderEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  facing: CharacterFacing,
  type: EnemyType,
  state: EnemyAnimationState,
  frame: number,
  hpRatio: number,
  isHurt: boolean
) {
  ctx.save();
  ctx.translate(x + width * 0.5, y + height);

  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  // Custom sprite sheet if registered
  const sheet = spritePipeline.getConfig(state);
  if (sheet && sheet.imageElement) {
    const img = sheet.imageElement;
    const fw = sheet.frameWidth;
    const fh = sheet.frameHeight;
    const currentFrameIndex = Math.floor(frame) % sheet.frameCount;
    ctx.drawImage(img, currentFrameIndex * fw, 0, fw, fh, -width * 0.5, -height, width, height);
    ctx.restore();
    return;
  }

  if (isHurt) {
    ctx.filter = 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.9)) saturate(1.8)';
  }

  if (state === 'Enemy_Death') {
    ctx.rotate(Math.min(Math.PI * 0.45, frame * 0.25));
    ctx.globalAlpha = Math.max(0, 1 - frame * 0.15);
  }

  const animCycle = Math.sin(frame * 0.25);

  switch (type) {
    case 'small_demon': {
      // Type 1: Small demon warrior (horned melee Rakshasa)
      ctx.fillStyle = '#7f1d1d'; // Crimson dark skin
      ctx.beginPath();
      ctx.arc(0, -height * 0.75, 10, 0, Math.PI * 2);
      ctx.fill();

      // Horns
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6, -height * 0.82);
      ctx.lineTo(-12, -height * 0.94);
      ctx.moveTo(6, -height * 0.82);
      ctx.lineTo(12, -height * 0.94);
      ctx.stroke();

      // Glowing yellow eye
      ctx.fillStyle = '#facc15';
      ctx.fillRect(4, -height * 0.76, 3, 2.5);

      // Torso & red loincloth
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(-10, -height * 0.6, 20, 22);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-11, -height * 0.32, 22, 10);

      // Legs
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-8, -height * 0.2, 6, height * 0.2);
      ctx.fillRect(2, -height * 0.2, 6, height * 0.2);

      // Bone Club Weapon
      ctx.save();
      ctx.translate(10, -height * 0.45);
      if (state === 'Enemy_Attack') {
        ctx.rotate(Math.sin(frame * 0.8) * 0.8);
      }
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(14, -18);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'archer_demon': {
      // Type 2: Archer demon (ranged Rakshasa)
      ctx.fillStyle = '#312e81'; // Midnight indigo skin
      ctx.beginPath();
      ctx.arc(0, -height * 0.75, 10, 0, Math.PI * 2);
      ctx.fill();

      // Quiver on back
      ctx.fillStyle = '#431407';
      ctx.fillRect(-12, -height * 0.65, 6, 20);

      // Horned crest
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -height * 0.84);
      ctx.lineTo(4, -height * 0.96);
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, -height * 0.76, 3, 2.5);

      // Tunic
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-9, -height * 0.6, 18, 24);

      // Dark Bow
      ctx.save();
      ctx.translate(12, -height * 0.48);
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 18, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(-Math.PI * 0.4) * 18, Math.sin(-Math.PI * 0.4) * 18);
      ctx.lineTo(Math.cos(Math.PI * 0.4) * 18, Math.sin(Math.PI * 0.4) * 18);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'heavy_demon': {
      // Type 3: Heavy demon warrior (Kumbha Brute)
      ctx.fillStyle = '#1f2937'; // Ash-stone demon hide
      ctx.beginPath();
      ctx.arc(0, -height * 0.8, 14, 0, Math.PI * 2);
      ctx.fill();

      // Massive Heavy Horns
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, -height * 0.88);
      ctx.lineTo(-22, -height * 1.02);
      ctx.moveTo(10, -height * 0.88);
      ctx.lineTo(22, -height * 1.02);
      ctx.stroke();

      // Burning orange eye
      ctx.fillStyle = '#f97316';
      ctx.fillRect(4, -height * 0.82, 4, 3);

      // Heavy Body & Spiked Shoulder Armor
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(-22, -height * 0.68, 44, 44, [8, 8, 4, 4]);
      ctx.fill();

      // Iron spiked mace
      ctx.save();
      ctx.translate(22, -height * 0.4);
      if (state === 'Enemy_Attack') {
        ctx.rotate(Math.sin(frame * 0.6) * 1.2);
      }
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, -32, 6, 36);
      ctx.beginPath();
      ctx.arc(3, -34, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'flying_demon': {
      // Type 4: Flying demon (winged aerial Rakshasa)
      const wingFlap = Math.sin(frame * 0.6) * 14;

      // Bat-like wings
      ctx.fillStyle = '#4c0519';
      // Left wing
      ctx.beginPath();
      ctx.moveTo(-8, -height * 0.6);
      ctx.lineTo(-36, -height * 0.75 + wingFlap);
      ctx.lineTo(-24, -height * 0.35 + wingFlap * 0.5);
      ctx.closePath();
      ctx.fill();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(8, -height * 0.6);
      ctx.lineTo(36, -height * 0.75 - wingFlap);
      ctx.lineTo(24, -height * 0.35 - wingFlap * 0.5);
      ctx.closePath();
      ctx.fill();

      // Body
      ctx.fillStyle = '#831843';
      ctx.beginPath();
      ctx.ellipse(0, -height * 0.5, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fanged head
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.arc(0, -height * 0.8, 9, 0, Math.PI * 2);
      ctx.fill();

      // Sharp talons
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, -height * 0.25);
      ctx.lineTo(-8, -height * 0.1);
      ctx.moveTo(5, -height * 0.25);
      ctx.lineTo(8, -height * 0.1);
      ctx.stroke();
      break;
    }

    case 'elite_demon': {
      // Type 5: Elite demon warrior (Golden Armor Rakshasa Commander)
      // Golden Crown / Helm
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(-12, -height * 0.88);
      ctx.lineTo(12, -height * 0.88);
      ctx.lineTo(0, -height * 1.05);
      ctx.closePath();
      ctx.fill();

      // Dark face
      ctx.fillStyle = '#3b0764'; // Imperial demon purple
      ctx.beginPath();
      ctx.arc(0, -height * 0.82, 11, 0, Math.PI * 2);
      ctx.fill();

      // Fierce golden eyes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(4, -height * 0.83, 4, 3);

      // Golden Carved Armor
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(-15, -height * 0.7, 30, 32, [4, 4, 2, 2]);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dual Katar Blades
      ctx.save();
      ctx.translate(14, -height * 0.48);
      if (state === 'Enemy_Attack') {
        ctx.rotate(Math.sin(frame * 0.8) * 0.9);
      }
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(24, 0);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
  }

  // Overhead Enemy HP Bar
  if (state !== 'Enemy_Death') {
    const barW = 36;
    const barH = 5;
    const barX = -barW * 0.5;
    const barY = -height - 12;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(barX, barY, barW * Math.max(0, hpRatio), barH);
  }

  ctx.restore();
}
