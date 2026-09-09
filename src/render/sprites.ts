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

/**
 * Lightens (positive percent) or darkens (negative percent) a hex color.
 * Used throughout the sprite renderer to add gradient shading/depth to
 * flat-filled shapes without needing actual sprite art.
 */
export function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  let r = (num >> 16) + Math.round((percent / 100) * 255);
  let g = ((num >> 8) & 0x00ff) + Math.round((percent / 100) * 255);
  let b = (num & 0x0000ff) + Math.round((percent / 100) * 255);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * Draws a thin bright rim-light arc along one edge of a circular shape,
 * simulating a backlight/edge highlight for a more premium, 3D look.
 */
export function drawRimLight(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string = 'rgba(255,255,255,0.55)',
  startAngle: number = -Math.PI * 0.75,
  endAngle: number = -Math.PI * 0.15
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 0.5, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();
}

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
    const glowRadius = 58 + Math.sin(frame * 0.5) * 10;
    const grad = ctx.createRadialGradient(0, -height * 0.55, 10, 0, -height * 0.55, glowRadius);
    grad.addColorStop(0, 'rgba(255, 235, 150, 0.75)');
    grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.35)');
    grad.addColorStop(0.85, 'rgba(244, 63, 94, 0.15)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -height * 0.55, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Sacred rays
    ctx.strokeStyle = 'rgba(255, 245, 180, 0.45)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 + frame * 0.05;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 20, -height * 0.55 + Math.sin(angle) * 20);
      ctx.lineTo(Math.cos(angle) * (glowRadius - 2), -height * 0.55 + Math.sin(angle) * (glowRadius - 2));
      ctx.stroke();
    }

    // Rotating outer ring - gives the aura a more dynamic, premium feel
    ctx.save();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 10]);
    ctx.lineDashOffset = -frame * 1.5;
    ctx.beginPath();
    ctx.arc(0, -height * 0.55, glowRadius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
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

  // Ground contact shadow for depth
  if (!isJumping && !isFalling && !isDeath) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 2, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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
  const dhotiGrad = ctx.createLinearGradient(-16, 0, 16, 0);
  dhotiGrad.addColorStop(0, shadeColor(dhotiColor, -15));
  dhotiGrad.addColorStop(0.5, dhotiColor);
  dhotiGrad.addColorStop(1, shadeColor(dhotiColor, 10));
  ctx.fillStyle = dhotiGrad;
  ctx.beginPath();
  ctx.moveTo(-14, -height * 0.42);
  ctx.lineTo(14, -height * 0.42);
  ctx.lineTo(16 + walkCycle * 3, -height * 0.24);
  ctx.lineTo(-16 - walkCycle * 3, -height * 0.24);
  ctx.closePath();
  ctx.fill();

  // Fabric fold lines for texture
  ctx.strokeStyle = shadeColor(dhotiColor, -25);
  ctx.lineWidth = 0.75;
  for (const fx of [-7, 0, 7]) {
    ctx.beginPath();
    ctx.moveTo(fx * 0.85, -height * 0.41);
    ctx.lineTo(fx + walkCycle * 1.5, -height * 0.26);
    ctx.stroke();
  }

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
  const torsoGrad = ctx.createLinearGradient(-12, 0, 12, 0);
  torsoGrad.addColorStop(0, shadeColor(skinTone, -18));
  torsoGrad.addColorStop(0.5, skinTone);
  torsoGrad.addColorStop(1, shadeColor(skinTone, 14));
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.roundRect(-12, -height * 0.72, 24, 28, [4, 4, 2, 2]);
  ctx.fill();

  // Subtle ab/muscle definition line
  ctx.strokeStyle = shadeColor(skinTone, -22);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.68);
  ctx.lineTo(0, -height * 0.55);
  ctx.stroke();

  // Shoulder Pauldrons
  ctx.fillStyle = shadeColor(armorColor, 10);
  ctx.beginPath();
  ctx.arc(-11, -height * 0.71, 5, 0, Math.PI * 2);
  ctx.arc(11, -height * 0.71, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Chest Armor (Kavach)
  const armorGrad = ctx.createLinearGradient(-10, 0, 10, 0);
  armorGrad.addColorStop(0, shadeColor(armorColor, -12));
  armorGrad.addColorStop(0.5, armorColor);
  armorGrad.addColorStop(1, shadeColor(armorColor, 12));
  ctx.fillStyle = armorGrad;
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

  // Armor rivets for extra detail
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(-6, -height * 0.65, 1, 0, Math.PI * 2);
  ctx.arc(6, -height * 0.65, 1, 0, Math.PI * 2);
  ctx.fill();

  // Polished-metal specular highlight streak
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-6, -height * 0.685);
  ctx.lineTo(-3, -height * 0.545);
  ctx.stroke();
  ctx.restore();

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
  const faceGrad = ctx.createRadialGradient(-3, -height * 0.84, 2, 0, -height * 0.82, 12);
  faceGrad.addColorStop(0, shadeColor(skinTone, 16));
  faceGrad.addColorStop(1, shadeColor(skinTone, -8));
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(0, -height * 0.82, 11, 0, Math.PI * 2);
  ctx.fill();

  // Ear
  ctx.fillStyle = shadeColor(skinTone, -6);
  ctx.beginPath();
  ctx.ellipse(-9, -height * 0.81, 2, 3, 0, 0, Math.PI * 2);
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

  // Small gem at crown peak
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(0, -height * 0.96, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Topknot hair / Sikha
  ctx.fillStyle = '#172554'; // Deep midnight hair
  ctx.beginPath();
  ctx.arc(-2, -height * 0.94, 7, 0, Math.PI * 2);
  ctx.fill();

  // Red forehead Tilak
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(4, -height * 0.86, 2.5, 5);

  // Eyebrow - gives the face expression/focus
  ctx.strokeStyle = shadeColor(skinTone, -45);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4.5, -height * 0.845);
  ctx.lineTo(8.5, -height * 0.84);
  ctx.stroke();

  // Heroic eye
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(5, -height * 0.82, 4, 3);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(7, -height * 0.82, 2, 3);

  // Determined mouth line
  ctx.strokeStyle = shadeColor(skinTone, -40);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4, -height * 0.775);
  ctx.lineTo(8, -height * 0.775);
  ctx.stroke();

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
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 14);
  ctx.stroke();

  // Knee joint highlight
  ctx.fillStyle = shadeColor(skinColor, -10);
  ctx.beginPath();
  ctx.arc(0, 14, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Calf
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.lineTo(isFront ? 2 : -2, 26);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // Sandal / foot
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(isFront ? 3 : -1, 27, 5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

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
  const sariGrad = ctx.createLinearGradient(-16, 0, 16, 0);
  sariGrad.addColorStop(0, shadeColor(companionSari, -18));
  sariGrad.addColorStop(0.5, companionSari);
  sariGrad.addColorStop(1, shadeColor(companionSari, 12));
  ctx.fillStyle = sariGrad;
  ctx.beginPath();
  ctx.moveTo(-12, -height * 0.5);
  ctx.lineTo(12, -height * 0.5);
  ctx.lineTo(16 + sway * 0.5, 0);
  ctx.lineTo(-16 + sway * 0.5, 0);
  ctx.closePath();
  ctx.fill();

  // Fabric fold lines
  ctx.strokeStyle = shadeColor(companionSari, -28);
  ctx.lineWidth = 0.75;
  for (const fx of [-6, 0, 6]) {
    ctx.beginPath();
    ctx.moveTo(fx * 0.8, -height * 0.49);
    ctx.lineTo(fx + sway * 0.3, -height * 0.02);
    ctx.stroke();
  }

  // Gold Zari border
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Torso / Blouse
  const choliGrad = ctx.createLinearGradient(-10, 0, 10, 0);
  choliGrad.addColorStop(0, shadeColor('#047857', -15));
  choliGrad.addColorStop(1, shadeColor('#047857', 10));
  ctx.fillStyle = choliGrad;
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
  const puFaceGrad = ctx.createRadialGradient(-2, -height * 0.84, 2, 0, -height * 0.82, 11);
  puFaceGrad.addColorStop(0, shadeColor('#fed7aa', 10));
  puFaceGrad.addColorStop(1, shadeColor('#fed7aa', -8));
  ctx.fillStyle = puFaceGrad;
  ctx.beginPath();
  ctx.arc(0, -height * 0.82, 10, 0, Math.PI * 2);
  ctx.fill();

  // Gentle smile
  ctx.strokeStyle = shadeColor('#fed7aa', -45);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(3, -height * 0.795, 2, 0.15 * Math.PI, 0.75 * Math.PI);
  ctx.stroke();

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
  const eyeGlow = 0.6 + Math.abs(Math.sin(frame * 0.15)) * 0.4;

  // Ground contact shadow shared by all enemy types
  if (state !== 'Enemy_Death') {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 2, width * 0.32, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  switch (type) {
    case 'small_demon': {
      // Type 1: Small demon warrior (horned melee Rakshasa)
      const sdGrad = ctx.createRadialGradient(-3, -height * 0.78, 2, 0, -height * 0.75, 11);
      sdGrad.addColorStop(0, shadeColor('#7f1d1d', 20));
      sdGrad.addColorStop(1, shadeColor('#7f1d1d', -15));
      ctx.fillStyle = sdGrad;
      ctx.beginPath();
      ctx.arc(0, -height * 0.75, 10, 0, Math.PI * 2);
      ctx.fill();
      drawRimLight(ctx, 0, -height * 0.75, 10, 'rgba(248,113,113,0.6)');

      // Horns
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-6, -height * 0.82);
      ctx.lineTo(-12, -height * 0.94);
      ctx.moveTo(6, -height * 0.82);
      ctx.lineTo(12, -height * 0.94);
      ctx.stroke();

      // Glowing yellow eye with halo
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 5 * eyeGlow;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(4, -height * 0.76, 3, 2.5);
      ctx.restore();

      // Fangs
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(2, -height * 0.7);
      ctx.lineTo(3, -height * 0.67);
      ctx.lineTo(4, -height * 0.7);
      ctx.fill();

      // Torso & red loincloth
      const sdTorsoGrad = ctx.createLinearGradient(-10, 0, 10, 0);
      sdTorsoGrad.addColorStop(0, shadeColor('#450a0a', -10));
      sdTorsoGrad.addColorStop(1, shadeColor('#450a0a', 15));
      ctx.fillStyle = sdTorsoGrad;
      ctx.fillRect(-10, -height * 0.6, 20, 22);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-11, -height * 0.32, 22, 10);

      // Legs
      ctx.fillStyle = shadeColor('#7f1d1d', -8);
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
      const adGrad = ctx.createRadialGradient(-3, -height * 0.78, 2, 0, -height * 0.75, 10);
      adGrad.addColorStop(0, shadeColor('#312e81', 18));
      adGrad.addColorStop(1, shadeColor('#312e81', -15));
      ctx.fillStyle = adGrad; // Midnight indigo skin
      ctx.beginPath();
      ctx.arc(0, -height * 0.75, 10, 0, Math.PI * 2);
      ctx.fill();
      drawRimLight(ctx, 0, -height * 0.75, 10, 'rgba(129,140,248,0.6)');

      // Quiver on back
      ctx.fillStyle = '#431407';
      ctx.fillRect(-12, -height * 0.65, 6, 20);
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1;
      ctx.strokeRect(-12, -height * 0.65, 6, 20);

      // Horned crest
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -height * 0.84);
      ctx.lineTo(4, -height * 0.96);
      ctx.stroke();

      // Glowing eye with halo
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 5 * eyeGlow;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, -height * 0.76, 3, 2.5);
      ctx.restore();

      // Tunic with gradient
      const adTunicGrad = ctx.createLinearGradient(-9, 0, 9, 0);
      adTunicGrad.addColorStop(0, shadeColor('#1e1b4b', -10));
      adTunicGrad.addColorStop(1, shadeColor('#1e1b4b', 14));
      ctx.fillStyle = adTunicGrad;
      ctx.fillRect(-9, -height * 0.6, 18, 24);
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 1;
      ctx.strokeRect(-9, -height * 0.6, 18, 24);

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
      const hdGrad = ctx.createRadialGradient(-4, -height * 0.83, 3, 0, -height * 0.8, 14);
      hdGrad.addColorStop(0, shadeColor('#1f2937', 18));
      hdGrad.addColorStop(1, shadeColor('#1f2937', -18));
      ctx.fillStyle = hdGrad; // Ash-stone demon hide
      ctx.beginPath();
      ctx.arc(0, -height * 0.8, 14, 0, Math.PI * 2);
      ctx.fill();
      drawRimLight(ctx, 0, -height * 0.8, 14, 'rgba(148,163,184,0.55)');

      // Massive Heavy Horns
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, -height * 0.88);
      ctx.lineTo(-22, -height * 1.02);
      ctx.moveTo(10, -height * 0.88);
      ctx.lineTo(22, -height * 1.02);
      ctx.stroke();

      // Burning orange eye with glow
      ctx.save();
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 6 * eyeGlow;
      ctx.fillStyle = '#f97316';
      ctx.fillRect(4, -height * 0.82, 4, 3);
      ctx.restore();

      // Heavy Body with gradient & Spiked Shoulder Armor
      const hdBodyGrad = ctx.createLinearGradient(-22, 0, 22, 0);
      hdBodyGrad.addColorStop(0, shadeColor('#111827', -8));
      hdBodyGrad.addColorStop(0.5, '#111827');
      hdBodyGrad.addColorStop(1, shadeColor('#111827', 18));
      ctx.fillStyle = hdBodyGrad;
      ctx.beginPath();
      ctx.roundRect(-22, -height * 0.68, 44, 44, [8, 8, 4, 4]);
      ctx.fill();

      // Armor plate rivets
      ctx.fillStyle = '#6b7280';
      for (const rx of [-14, 0, 14]) {
        ctx.beginPath();
        ctx.arc(rx, -height * 0.5, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

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

      // Bat-like wings with membrane gradient
      const wingGradL = ctx.createLinearGradient(-8, 0, -36, 0);
      wingGradL.addColorStop(0, '#4c0519');
      wingGradL.addColorStop(1, shadeColor('#4c0519', -20));
      ctx.fillStyle = wingGradL;
      ctx.beginPath();
      ctx.moveTo(-8, -height * 0.6);
      ctx.lineTo(-36, -height * 0.75 + wingFlap);
      ctx.lineTo(-24, -height * 0.35 + wingFlap * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = shadeColor('#4c0519', -35);
      ctx.lineWidth = 0.75;
      ctx.stroke();

      const wingGradR = ctx.createLinearGradient(8, 0, 36, 0);
      wingGradR.addColorStop(0, '#4c0519');
      wingGradR.addColorStop(1, shadeColor('#4c0519', -20));
      ctx.fillStyle = wingGradR;
      ctx.beginPath();
      ctx.moveTo(8, -height * 0.6);
      ctx.lineTo(36, -height * 0.75 - wingFlap);
      ctx.lineTo(24, -height * 0.35 - wingFlap * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Body with shading
      const fdBodyGrad = ctx.createRadialGradient(-2, -height * 0.53, 2, 0, -height * 0.5, 16);
      fdBodyGrad.addColorStop(0, shadeColor('#831843', 12));
      fdBodyGrad.addColorStop(1, shadeColor('#831843', -15));
      ctx.fillStyle = fdBodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, -height * 0.5, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fanged head
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.arc(0, -height * 0.8, 9, 0, Math.PI * 2);
      ctx.fill();
      drawRimLight(ctx, 0, -height * 0.8, 9, 'rgba(244,63,94,0.6)');

      // Glowing predator eyes
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 5 * eyeGlow;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-4, -height * 0.81, 2.5, 2);
      ctx.fillRect(2, -height * 0.81, 2.5, 2);
      ctx.restore();

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
      // Flowing commander's cape with cloth-like wave motion
      const capeSway1 = Math.sin(frame * 0.18) * 5;
      const capeSway2 = Math.sin(frame * 0.18 + 1.1) * 7;
      ctx.fillStyle = shadeColor('#3b0764', -10);
      ctx.beginPath();
      ctx.moveTo(-13, -height * 0.72);
      ctx.lineTo(13, -height * 0.72);
      ctx.quadraticCurveTo(18 + capeSway2, -height * 0.45, 16 + animCycle * 4 + capeSway2, -height * 0.15);
      ctx.lineTo(-16 + animCycle * 4 + capeSway1, -height * 0.15);
      ctx.quadraticCurveTo(-18 + capeSway1, -height * 0.45, -13, -height * 0.72);
      ctx.closePath();
      ctx.fill();

      // Golden Crown / Helm
      const crownGrad = ctx.createLinearGradient(-12, 0, 12, 0);
      crownGrad.addColorStop(0, shadeColor('#d97706', -14));
      crownGrad.addColorStop(1, shadeColor('#d97706', 16));
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(-12, -height * 0.88);
      ctx.lineTo(12, -height * 0.88);
      ctx.lineTo(0, -height * 1.05);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dark face with shading
      const edFaceGrad = ctx.createRadialGradient(-3, -height * 0.84, 2, 0, -height * 0.82, 11);
      edFaceGrad.addColorStop(0, shadeColor('#3b0764', 15));
      edFaceGrad.addColorStop(1, shadeColor('#3b0764', -15));
      ctx.fillStyle = edFaceGrad; // Imperial demon purple
      ctx.beginPath();
      ctx.arc(0, -height * 0.82, 11, 0, Math.PI * 2);
      ctx.fill();
      drawRimLight(ctx, 0, -height * 0.82, 11, 'rgba(250,204,21,0.5)');

      // Fierce golden eyes with glow
      ctx.save();
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 6 * eyeGlow;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(4, -height * 0.83, 4, 3);
      ctx.restore();

      // Golden Carved Armor with gradient
      const edArmorGrad = ctx.createLinearGradient(-15, 0, 15, 0);
      edArmorGrad.addColorStop(0, shadeColor('#b45309', -12));
      edArmorGrad.addColorStop(0.5, '#b45309');
      edArmorGrad.addColorStop(1, shadeColor('#b45309', 16));
      ctx.fillStyle = edArmorGrad;
      ctx.beginPath();
      ctx.roundRect(-15, -height * 0.7, 30, 32, [4, 4, 2, 2]);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Carved armor emblem
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -height * 0.66);
      ctx.lineTo(0, -height * 0.44);
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
