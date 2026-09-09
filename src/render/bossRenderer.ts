import { BossState } from '../systems/bossSystem';
import { Camera2D } from '../engine/camera';
import { shadeColor } from './sprites';

export function renderBoss(
  ctx: CanvasRenderingContext2D,
  boss: BossState,
  camera: Camera2D,
  time: number
) {
  if (boss.isDead && boss.deathTimer > 3.0) return;

  const { x, y, width, height, facing, hp, maxHp, isHurt, isDead, deathTimer, isRaging, type } = boss;

  ctx.save();
  ctx.translate(x + width * 0.5 - camera.x, y + height - camera.y);

  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  // Defeat fade & collapse
  if (isDead) {
    const fade = Math.max(0, 1 - deathTimer / 2.5);
    ctx.globalAlpha = fade;
    ctx.rotate(Math.min(Math.PI * 0.5, deathTimer * 0.8));
  }

  // Hurt flash
  if (isHurt) {
    ctx.filter = 'brightness(2.2) saturate(1.8)';
  }

  // Aura for rage mode
  if (isRaging || isDead) {
    const pulse = Math.sin(time * 8) * 6;
    const auraRad = width * 0.75 + pulse;
    const grad = ctx.createRadialGradient(0, -height * 0.5, 10, 0, -height * 0.5, auraRad);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
    grad.addColorStop(0.7, 'rgba(185, 28, 28, 0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -height * 0.5, auraRad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shield Barrier for Raone
  if (boss.shieldActive && !isDead) {
    const shieldPulse = Math.sin(time * 6) * 4;
    const shieldRad = width * 0.85 + shieldPulse;
    ctx.save();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, -height * 0.5, shieldRad, 0, Math.PI * 2);
    ctx.stroke();

    // Hexagon energy runes
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + time * 0.5;
      const hx = Math.cos(a) * (shieldRad - 2);
      const hy = -height * 0.5 + Math.sin(a) * (shieldRad - 2);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================
  // RENDER BASED ON BOSS ARCHETYPE
  // ==========================================
  switch (type) {
    case 'subahu':
      renderSubahu(ctx, height, width, time);
      break;
    case 'viradha':
      renderViradha(ctx, height, width, time);
      break;
    case 'khara':
      renderKhara(ctx, height, width, time);
      break;
    case 'maricha':
      renderMaricha(ctx, height, width, time);
      break;
    case 'dushana':
      renderDushana(ctx, height, width, time);
      break;
    case 'vali':
      renderVali(ctx, height, width, time);
      break;
    case 'surasa':
      renderSurasa(ctx, height, width, time);
      break;
    case 'indrajit':
      renderIndrajit(ctx, height, width, time);
      break;
    case 'kumbhakarna':
      renderKumbhakarna(ctx, height, width, time);
      break;
    case 'raone':
    default:
      renderRaoneBoss(ctx, height, width, time);
      break;
  }

  ctx.restore();

  // ==========================================
  // BOSS HEALTH BAR - floats directly above the boss's head
  // ==========================================
  if (!isDead || deathTimer < 2.5) {
    renderBossHeadHealthBar(ctx, boss, camera, time);
  }
}

function renderBossHeadHealthBar(ctx: CanvasRenderingContext2D, boss: BossState, camera: Camera2D, time: number) {
  const { x, y, width, height } = boss;
  const pulse = 0.5 + Math.sin(time * 4) * 0.5;

  // Position the bar above the boss's head, clamped so it stays on screen
  // horizontally even when the boss is near the edge of the camera view.
  const barWidth = Math.min(220, camera.viewportWidth - 24);
  const idealCenterX = x + width * 0.5 - camera.x;
  const clampedCenterX = Math.max(barWidth * 0.5 + 8, Math.min(camera.viewportWidth - barWidth * 0.5 - 8, idealCenterX));
  const barHeight = 14;
  const barX = clampedCenterX - barWidth * 0.5;
  const barY = Math.max(8, y - camera.y - height - 46);

  ctx.save();

  // Outer glow so the bar reads clearly even in a busy fight
  ctx.shadowColor = boss.isRaging ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.75)';
  ctx.shadowBlur = 10 + pulse * 6;

  // Semi-transparent backdrop
  ctx.fillStyle = 'rgba(5, 5, 5, 0.9)';
  ctx.beginPath();
  ctx.roundRect(barX - 8, barY - 20, barWidth + 16, barHeight + 28, [8, 8, 8, 8]);
  ctx.fill();
  ctx.strokeStyle = boss.isRaging
    ? `rgba(248, 113, 113, ${0.6 + pulse * 0.4})`
    : `rgba(245, 158, 11, ${0.5 + pulse * 0.3})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Boss Name (compact, centered above the bar)
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 11px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText(boss.name, clampedCenterX, barY - 8);

  // Health bar background
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, [5, 5, 5, 5]);
  ctx.fill();

  // Health fill
  const hpRatio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
  const hpFillWidth = barWidth * hpRatio;
  if (hpFillWidth > 0) {
    const hpGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    if (boss.isRaging) {
      hpGrad.addColorStop(0, '#dc2626');
      hpGrad.addColorStop(1, '#ef4444');
    } else {
      hpGrad.addColorStop(0, '#b45309');
      hpGrad.addColorStop(0.5, '#f59e0b');
      hpGrad.addColorStop(1, '#ef4444');
    }
    ctx.fillStyle = hpGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, hpFillWidth, barHeight, [4, 4, 4, 4]);
    ctx.fill();
  }

  // HP number, centered on the bar itself
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${boss.hp} / ${boss.maxHp}`, clampedCenterX, barY + barHeight - 3);

  // Phase indicator for Raone, shown as a smaller line below the bar
  if (boss.type === 'raone') {
    const phaseLabel =
      boss.phase === 1
        ? 'Chandrahas Duel'
        : boss.phase === 2
        ? 'Shield Active - Use Charged Arrows!'
        : 'Cosmic Brahmastra Fury';
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'italic 9px sans-serif';
    ctx.fillText(phaseLabel, clampedCenterX, barY + barHeight + 12);
  }

  ctx.restore();
}

// 1. Subahu (Ayodhya Boss)
function renderSubahu(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 3)) * 0.4;

  // Cape
  const capeGrad = ctx.createLinearGradient(-22, 0, 22, 0);
  capeGrad.addColorStop(0, shadeColor('#991b1b', -18));
  capeGrad.addColorStop(1, shadeColor('#991b1b', 10));
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(-16, -h * 0.7);
  ctx.lineTo(16, -h * 0.7);
  ctx.lineTo(22, 0);
  ctx.lineTo(-22, 0);
  ctx.closePath();
  ctx.fill();

  // Armor & Legs
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(-14, -h * 0.35, 10, h * 0.35);
  ctx.fillRect(4, -h * 0.35, 10, h * 0.35);

  // Chestplate
  const chestGrad = ctx.createLinearGradient(-16, 0, 16, 0);
  chestGrad.addColorStop(0, shadeColor('#7f1d1d', -12));
  chestGrad.addColorStop(1, shadeColor('#7f1d1d', 14));
  ctx.fillStyle = chestGrad;
  ctx.fillRect(-16, -h * 0.72, 32, 34);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, -h * 0.72, 32, 34);

  // Head & Horns
  const headGrad = ctx.createRadialGradient(-3, -h * 0.84, 2, 0, -h * 0.82, 11);
  headGrad.addColorStop(0, shadeColor('#991b1b', 18));
  headGrad.addColorStop(1, shadeColor('#991b1b', -15));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.82, 11, 0, Math.PI * 2);
  ctx.fill();

  // Glowing menacing eyes
  ctx.save();
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 6 * eyeGlow;
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-4, -h * 0.84, 3, 2.5);
  ctx.fillRect(2, -h * 0.84, 3, 2.5);
  ctx.restore();

  // Curved demon horns
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-7, -h * 0.86);
  ctx.quadraticCurveTo(-18, -h * 1.0, -12, -h * 1.05);
  ctx.moveTo(7, -h * 0.86);
  ctx.quadraticCurveTo(18, -h * 1.0, 12, -h * 1.05);
  ctx.stroke();

  // Spiked Spear
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(14, -h * 0.95);
  ctx.lineTo(14, 0);
  ctx.stroke();
  // Spear tip
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(14, -h * 1.05);
  ctx.lineTo(18, -h * 0.93);
  ctx.lineTo(10, -h * 0.93);
  ctx.closePath();
  ctx.fill();
}

// 2. Viradha (Vanvas Boss)
function renderViradha(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 3)) * 0.4;

  // Massive wild beast frame
  const bodyGrad = ctx.createLinearGradient(-22, 0, 22, 0);
  bodyGrad.addColorStop(0, shadeColor('#14532d', -14));
  bodyGrad.addColorStop(1, shadeColor('#14532d', 14));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-22, -h * 0.8, 44, h * 0.5, [10, 10, 4, 4]);
  ctx.fill();

  // Heavy legs
  ctx.fillStyle = '#0f3a1f';
  ctx.fillRect(-20, -h * 0.35, 16, h * 0.35);
  ctx.fillRect(4, -h * 0.35, 16, h * 0.35);

  // Head & Tusks
  const headGrad = ctx.createRadialGradient(-4, -h * 0.87, 3, 0, -h * 0.85, 14);
  headGrad.addColorStop(0, shadeColor('#166534', 16));
  headGrad.addColorStop(1, shadeColor('#166534', -16));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.85, 14, 0, Math.PI * 2);
  ctx.fill();

  // Glowing feral eyes
  ctx.save();
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = 6 * eyeGlow;
  ctx.fillStyle = '#f97316';
  ctx.fillRect(-5, -h * 0.87, 3.5, 3);
  ctx.fillRect(2, -h * 0.87, 3.5, 3);
  ctx.restore();

  // Curved Tusks
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, -h * 0.82);
  ctx.quadraticCurveTo(-16, -h * 0.75, -12, -h * 0.92);
  ctx.moveTo(8, -h * 0.82);
  ctx.quadraticCurveTo(16, -h * 0.75, 12, -h * 0.92);
  ctx.stroke();

  // Massive Spiked Club
  const clubGrad = ctx.createLinearGradient(16, 0, 28, 0);
  clubGrad.addColorStop(0, shadeColor('#78350f', -15));
  clubGrad.addColorStop(1, shadeColor('#78350f', 10));
  ctx.fillStyle = clubGrad;
  ctx.beginPath();
  ctx.roundRect(16, -h * 0.88, 12, h * 0.7, [5, 5, 2, 2]);
  ctx.fill();
}

// 3. Khara (Dandakaranya Boss)
function renderKhara(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 3)) * 0.4;

  // Dark purple warlord
  const bodyGrad = ctx.createLinearGradient(-16, 0, 16, 0);
  bodyGrad.addColorStop(0, shadeColor('#3b0764', -14));
  bodyGrad.addColorStop(1, shadeColor('#3b0764', 14));
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(-16, -h * 0.75, 32, h * 0.45);

  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(-14, -h * 0.35, 11, h * 0.35);
  ctx.fillRect(3, -h * 0.35, 11, h * 0.35);

  // Crimson armor plates
  const plateGrad = ctx.createLinearGradient(-14, 0, 14, 0);
  plateGrad.addColorStop(0, shadeColor('#dc2626', -12));
  plateGrad.addColorStop(1, shadeColor('#dc2626', 14));
  ctx.fillStyle = plateGrad;
  ctx.fillRect(-14, -h * 0.7, 28, 18);

  // Helmet with twin blades
  const headGrad = ctx.createRadialGradient(-3, -h * 0.86, 2, 0, -h * 0.84, 12);
  headGrad.addColorStop(0, shadeColor('#581c87', 16));
  headGrad.addColorStop(1, shadeColor('#581c87', -14));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 12, 0, Math.PI * 2);
  ctx.fill();

  // Glowing crimson eyes
  ctx.save();
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 6 * eyeGlow;
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(-4, -h * 0.86, 3, 2.5);
  ctx.fillRect(2, -h * 0.86, 3, 2.5);
  ctx.restore();

  // Twin Dark Swords
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, -h * 0.8);
  ctx.lineTo(-26, -h * 0.2);
  ctx.moveTo(18, -h * 0.8);
  ctx.lineTo(26, -h * 0.2);
  ctx.stroke();
}

// 4. Maricha (Panchavati Boss - Golden Deer Demon)
function renderMaricha(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 3)) * 0.4;

  // Golden horned illusionist
  const bodyGrad = ctx.createLinearGradient(-14, 0, 14, 0);
  bodyGrad.addColorStop(0, shadeColor('#854d0e', -12));
  bodyGrad.addColorStop(1, shadeColor('#854d0e', 14));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-14, -h * 0.72, 28, h * 0.42, [6, 6, 4, 4]);
  ctx.fill();

  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(-12, -h * 0.35, 9, h * 0.35);
  ctx.fillRect(3, -h * 0.35, 9, h * 0.35);

  // Golden head
  const headGrad = ctx.createRadialGradient(-3, -h * 0.84, 2, 0, -h * 0.82, 11);
  headGrad.addColorStop(0, shadeColor('#eab308', 20));
  headGrad.addColorStop(1, shadeColor('#eab308', -14));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.82, 11, 0, Math.PI * 2);
  ctx.fill();

  // Glowing illusion eyes
  ctx.save();
  ctx.shadowColor = '#f8fafc';
  ctx.shadowBlur = 6 * eyeGlow;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-4, -h * 0.84, 3, 2.5);
  ctx.fillRect(2, -h * 0.84, 3, 2.5);
  ctx.restore();

  // Golden Antlers
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-6, -h * 0.88);
  ctx.lineTo(-14, -h * 1.05);
  ctx.lineTo(-18, -h * 1.0);
  ctx.moveTo(6, -h * 0.88);
  ctx.lineTo(14, -h * 1.05);
  ctx.lineTo(18, -h * 1.0);
  ctx.stroke();
}

// 5. Dushana (Sita Haran Boss)
function renderDushana(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 3)) * 0.4;

  // Dark shadow commander
  const bodyGrad = ctx.createLinearGradient(-17, 0, 17, 0);
  bodyGrad.addColorStop(0, shadeColor('#0f172a', -10));
  bodyGrad.addColorStop(1, shadeColor('#0f172a', 16));
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(-17, -h * 0.75, 34, h * 0.44);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-15, -h * 0.35, 12, h * 0.35);
  ctx.fillRect(3, -h * 0.35, 12, h * 0.35);

  // Orange flame crest
  const crestGrad = ctx.createLinearGradient(-15, 0, 15, 0);
  crestGrad.addColorStop(0, shadeColor('#ea580c', -12));
  crestGrad.addColorStop(1, shadeColor('#ea580c', 14));
  ctx.fillStyle = crestGrad;
  ctx.fillRect(-15, -h * 0.68, 30, 16);

  const headGrad = ctx.createRadialGradient(-3, -h * 0.86, 2, 0, -h * 0.84, 12);
  headGrad.addColorStop(0, shadeColor('#1e293b', 22));
  headGrad.addColorStop(1, shadeColor('#1e293b', -12));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 12, 0, Math.PI * 2);
  ctx.fill();

  // Glowing shadow eyes
  ctx.save();
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = 6 * eyeGlow;
  ctx.fillStyle = '#f97316';
  ctx.fillRect(-4, -h * 0.86, 3, 2.5);
  ctx.fillRect(2, -h * 0.86, 3, 2.5);
  ctx.restore();

  // Dark scythe / astra
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(14, -h * 0.9);
  ctx.lineTo(14, 0);
  ctx.stroke();
}

// 6. Vali (Kishkindha Boss)
function renderVali(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  // Powerful golden-furred ape sovereign
  const bodyGrad = ctx.createLinearGradient(-19, 0, 19, 0);
  bodyGrad.addColorStop(0, shadeColor('#78350f', -14));
  bodyGrad.addColorStop(1, shadeColor('#78350f', 14));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-19, -h * 0.78, 38, h * 0.48, [8, 8, 4, 4]);
  ctx.fill();

  ctx.fillStyle = '#92400e';
  ctx.fillRect(-17, -h * 0.35, 13, h * 0.35);
  ctx.fillRect(4, -h * 0.35, 13, h * 0.35);

  // Royal Golden Mukut (Crown) & Head
  const headGrad = ctx.createRadialGradient(-4, -h * 0.86, 3, 0, -h * 0.84, 13);
  headGrad.addColorStop(0, shadeColor('#b45309', 18));
  headGrad.addColorStop(1, shadeColor('#b45309', -14));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 13, 0, Math.PI * 2);
  ctx.fill();

  // Gold Crown
  const crownGrad = ctx.createLinearGradient(-10, 0, 10, 0);
  crownGrad.addColorStop(0, shadeColor('#f59e0b', -10));
  crownGrad.addColorStop(1, shadeColor('#f59e0b', 16));
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(-10, -h * 0.9);
  ctx.lineTo(0, -h * 1.05);
  ctx.lineTo(10, -h * 0.9);
  ctx.closePath();
  ctx.fill();

  // Golden Mace (Gada)
  const maceGrad = ctx.createRadialGradient(16, -h * 0.63, 2, 20, -h * 0.6, 12);
  maceGrad.addColorStop(0, shadeColor('#eab308', 20));
  maceGrad.addColorStop(1, shadeColor('#eab308', -10));
  ctx.fillStyle = maceGrad;
  ctx.beginPath();
  ctx.arc(20, -h * 0.6, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// 7. Surasa (Setu Nirman Boss)
function renderSurasa(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 3)) * 0.4;

  // Oceanic leviathan asura
  const bodyGrad = ctx.createLinearGradient(-20, 0, 20, 0);
  bodyGrad.addColorStop(0, shadeColor('#0f172a', -10));
  bodyGrad.addColorStop(1, shadeColor('#0f172a', 16));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-20, -h * 0.76, 40, h * 0.46, [8, 8, 4, 4]);
  ctx.fill();

  ctx.fillStyle = '#0369a1';
  ctx.fillRect(-17, -h * 0.35, 13, h * 0.35);
  ctx.fillRect(4, -h * 0.35, 13, h * 0.35);

  // Glowing aquatic eyes
  ctx.save();
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 6 * eyeGlow;
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-8, -h * 0.66, 3, 2.5);
  ctx.fillRect(2, -h * 0.66, 3, 2.5);
  ctx.restore();

  // Aquatic fin spines
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, -h * 0.7);
  ctx.lineTo(-30, -h * 0.55);
  ctx.moveTo(-20, -h * 0.5);
  ctx.lineTo(-28, -h * 0.4);
  ctx.stroke();

  // Water Trident
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(16, -h * 0.95);
  ctx.lineTo(16, 0);
  ctx.stroke();
}

// 8. Indrajit (Lanka Boss)
function renderIndrajit(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 3)) * 0.4;

  // Master of celestial lightning
  const bodyGrad = ctx.createLinearGradient(-17, 0, 17, 0);
  bodyGrad.addColorStop(0, shadeColor('#1c1917', -8));
  bodyGrad.addColorStop(1, shadeColor('#1c1917', 18));
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(-17, -h * 0.76, 34, h * 0.46);

  ctx.fillStyle = '#292524';
  ctx.fillRect(-15, -h * 0.35, 12, h * 0.35);
  ctx.fillRect(3, -h * 0.35, 12, h * 0.35);

  // Golden lightning armor lines
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-15, -h * 0.72, 30, 24);

  const headGrad = ctx.createRadialGradient(-3, -h * 0.86, 2, 0, -h * 0.84, 12);
  headGrad.addColorStop(0, shadeColor('#44403c', 22));
  headGrad.addColorStop(1, shadeColor('#44403c', -14));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 12, 0, Math.PI * 2);
  ctx.fill();

  // Glowing electric eyes
  ctx.save();
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 6 * eyeGlow;
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-4, -h * 0.86, 3, 2.5);
  ctx.fillRect(2, -h * 0.86, 3, 2.5);
  ctx.restore();

  // Lightning Staff
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(16, -h * 1.02);
  ctx.lineTo(16, 0);
  ctx.stroke();
  // Lightning sparks
  ctx.save();
  ctx.shadowColor = '#fef08a';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(16, -h * 1.04, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 9. Kumbhakarna (Yuddha Boss)
function renderKumbhakarna(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 3)) * 0.4;

  // Titan colossus
  const bodyGrad = ctx.createLinearGradient(-28, 0, 28, 0);
  bodyGrad.addColorStop(0, shadeColor('#450a0a', -12));
  bodyGrad.addColorStop(0.5, '#450a0a');
  bodyGrad.addColorStop(1, shadeColor('#450a0a', 16));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-28, -h * 0.82, 56, h * 0.52, [12, 12, 6, 6]);
  ctx.fill();

  ctx.fillStyle = '#262626';
  ctx.fillRect(-24, -h * 0.35, 18, h * 0.35);
  ctx.fillRect(6, -h * 0.35, 18, h * 0.35);

  // Giant head
  const headGrad = ctx.createRadialGradient(-5, -h * 0.91, 4, 0, -h * 0.88, 17);
  headGrad.addColorStop(0, shadeColor('#7f1d1d', 18));
  headGrad.addColorStop(1, shadeColor('#7f1d1d', -16));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.88, 17, 0, Math.PI * 2);
  ctx.fill();

  // Glowing sleepy-rage eyes
  ctx.save();
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 7 * eyeGlow;
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-6, -h * 0.9, 4, 3);
  ctx.fillRect(3, -h * 0.9, 4, 3);
  ctx.restore();

  // Colossal iron mace
  const maceGrad = ctx.createLinearGradient(22, 0, 40, 0);
  maceGrad.addColorStop(0, shadeColor('#171717', -6));
  maceGrad.addColorStop(1, shadeColor('#171717', 20));
  ctx.fillStyle = maceGrad;
  ctx.beginPath();
  ctx.roundRect(22, -h * 0.95, 18, h * 0.75, [6, 6, 3, 3]);
  ctx.fill();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 10. Mahabali Raone (Final Battle Boss)
function renderRaoneBoss(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  const eyeGlow = 0.6 + Math.abs(Math.sin(time * 4)) * 0.4;

  // Supreme Ten-Headed Emperor
  const capeGrad = ctx.createLinearGradient(-30, 0, 30, 0);
  capeGrad.addColorStop(0, shadeColor('#991b1b', -18));
  capeGrad.addColorStop(0.5, '#991b1b');
  capeGrad.addColorStop(1, shadeColor('#991b1b', 14));
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(-24, -h * 0.8);
  ctx.lineTo(24, -h * 0.8);
  ctx.lineTo(30, 0);
  ctx.lineTo(-30, 0);
  ctx.closePath();
  ctx.fill();

  // Golden Demon Chestplate
  const chestGrad = ctx.createLinearGradient(-22, 0, 22, 0);
  chestGrad.addColorStop(0, shadeColor('#1c1917', -6));
  chestGrad.addColorStop(1, shadeColor('#1c1917', 20));
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.roundRect(-22, -h * 0.76, 44, h * 0.44, [8, 8, 4, 4]);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Center Head
  const centerHeadGrad = ctx.createRadialGradient(-4, -h * 0.87, 3, 0, -h * 0.85, 14);
  centerHeadGrad.addColorStop(0, shadeColor('#78350f', 18));
  centerHeadGrad.addColorStop(1, shadeColor('#78350f', -16));
  ctx.fillStyle = centerHeadGrad;
  ctx.beginPath();
  ctx.arc(0, -h * 0.85, 14, 0, Math.PI * 2);
  ctx.fill();

  // Glowing center eyes
  ctx.save();
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 8 * eyeGlow;
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-6, -h * 0.87, 4, 3.5);
  ctx.fillRect(3, -h * 0.87, 4, 3.5);
  ctx.restore();

  // Multiple surrounding heads (Ten-Headed Ravana silhouette) with glowing eyes
  const headOffsets = [-24, -16, -8, 8, 16, 24];
  headOffsets.forEach((offset, idx) => {
    const hy = -h * 0.83 - (idx % 2) * 3;
    const hGrad = ctx.createRadialGradient(offset - 2, hy - 2, 1, offset, hy, 6);
    hGrad.addColorStop(0, shadeColor('#92400e', 16));
    hGrad.addColorStop(1, shadeColor('#92400e', -14));
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.arc(offset, hy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 4 * eyeGlow;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(offset - 1.5, hy - 1, 2.5, 2);
    ctx.restore();
  });

  // Center Golden Fanged Crown (Mukut)
  const crownGrad = ctx.createLinearGradient(-10, 0, 10, 0);
  crownGrad.addColorStop(0, shadeColor('#f59e0b', -12));
  crownGrad.addColorStop(1, shadeColor('#f59e0b', 20));
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(-10, -h * 0.95);
  ctx.lineTo(0, -h * 1.12);
  ctx.lineTo(10, -h * 0.95);
  ctx.closePath();
  ctx.fill();

  // Flaming Trident (Trishula)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(22, -h * 1.05);
  ctx.lineTo(22, 0);
  ctx.stroke();

  // Trident Prongs
  ctx.save();
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(14, -h * 1.0);
  ctx.lineTo(14, -h * 1.12);
  ctx.lineTo(22, -h * 1.2);
  ctx.lineTo(30, -h * 1.12);
  ctx.lineTo(30, -h * 1.0);
  ctx.lineTo(26, -h * 1.0);
  ctx.lineTo(26, -h * 1.08);
  ctx.lineTo(22, -h * 1.12);
  ctx.lineTo(18, -h * 1.08);
  ctx.lineTo(18, -h * 1.0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
