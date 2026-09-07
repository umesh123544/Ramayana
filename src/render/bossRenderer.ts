import { BossState } from '../systems/bossSystem';
import { Camera2D } from '../engine/camera';

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
  // TOP SCREEN EPIC BOSS HEALTH BAR
  // ==========================================
  if (!isDead || deathTimer < 2.5) {
    renderBossTopHealthBar(ctx, boss, camera);
  }
}

function renderBossTopHealthBar(ctx: CanvasRenderingContext2D, boss: BossState, camera: Camera2D) {
  const barWidth = Math.min(camera.viewportWidth - 40, 480);
  const barHeight = 16;
  const barX = (camera.viewportWidth - barWidth) * 0.5;
  const barY = 62;

  ctx.save();
  // Semi-transparent backdrop
  ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
  ctx.beginPath();
  ctx.roundRect(barX - 12, barY - 26, barWidth + 24, barHeight + 42, [8, 8, 8, 8]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Boss Name & Sanskrit Title
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 12px "Cinzel", serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${boss.name} (${boss.hindiName})`, barX, barY - 8);

  ctx.fillStyle = '#f87171';
  ctx.font = 'italic 10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(boss.title, barX + barWidth, barY - 8);

  // Health bar background
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, [4, 4, 4, 4]);
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

  // HP text & Phase indicator
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';

  if (boss.type === 'raone') {
    const phaseLabel =
      boss.phase === 1
        ? 'PHASE 1 • Chandrahas Duel'
        : boss.phase === 2
        ? 'PHASE 2 • Ten-Headed Shield Active [Use Charged Arrows!]'
        : 'PHASE 3 • Cosmic Brahmastra Fury';
    ctx.fillText(`${boss.hp} / ${boss.maxHp}  |  ${phaseLabel}`, barX + barWidth * 0.5, barY + 12);
  } else {
    ctx.fillText(`${boss.hp} / ${boss.maxHp}`, barX + barWidth * 0.5, barY + 12);
  }

  ctx.restore();
}

// 1. Subahu (Ayodhya Boss)
function renderSubahu(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  // Cape
  ctx.fillStyle = '#991b1b';
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
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(-16, -h * 0.72, 32, 34);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(-16, -h * 0.72, 32, 34);

  // Head & Horns
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(0, -h * 0.82, 11, 0, Math.PI * 2);
  ctx.fill();

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
  // Massive wild beast frame
  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.roundRect(-22, -h * 0.8, 44, h * 0.5, [10, 10, 4, 4]);
  ctx.fill();

  // Heavy legs
  ctx.fillStyle = '#0f3a1f';
  ctx.fillRect(-20, -h * 0.35, 16, h * 0.35);
  ctx.fillRect(4, -h * 0.35, 16, h * 0.35);

  // Head & Tusks
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(0, -h * 0.85, 14, 0, Math.PI * 2);
  ctx.fill();

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
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.roundRect(16, -h * 0.88, 12, h * 0.7, [5, 5, 2, 2]);
  ctx.fill();
}

// 3. Khara (Dandakaranya Boss)
function renderKhara(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  // Dark purple warlord
  ctx.fillStyle = '#3b0764';
  ctx.fillRect(-16, -h * 0.75, 32, h * 0.45);

  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(-14, -h * 0.35, 11, h * 0.35);
  ctx.fillRect(3, -h * 0.35, 11, h * 0.35);

  // Crimson armor plates
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-14, -h * 0.7, 28, 18);

  // Helmet with twin blades
  ctx.fillStyle = '#581c87';
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 12, 0, Math.PI * 2);
  ctx.fill();

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
  // Golden horned illusionist
  ctx.fillStyle = '#854d0e';
  ctx.beginPath();
  ctx.roundRect(-14, -h * 0.72, 28, h * 0.42, [6, 6, 4, 4]);
  ctx.fill();

  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(-12, -h * 0.35, 9, h * 0.35);
  ctx.fillRect(3, -h * 0.35, 9, h * 0.35);

  // Golden head
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(0, -h * 0.82, 11, 0, Math.PI * 2);
  ctx.fill();

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
  // Dark shadow commander
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-17, -h * 0.75, 34, h * 0.44);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-15, -h * 0.35, 12, h * 0.35);
  ctx.fillRect(3, -h * 0.35, 12, h * 0.35);

  // Orange flame crest
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(-15, -h * 0.68, 30, 16);

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 12, 0, Math.PI * 2);
  ctx.fill();

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
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.roundRect(-19, -h * 0.78, 38, h * 0.48, [8, 8, 4, 4]);
  ctx.fill();

  ctx.fillStyle = '#92400e';
  ctx.fillRect(-17, -h * 0.35, 13, h * 0.35);
  ctx.fillRect(4, -h * 0.35, 13, h * 0.35);

  // Royal Golden Mukut (Crown) & Head
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 13, 0, Math.PI * 2);
  ctx.fill();

  // Gold Crown
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(-10, -h * 0.9);
  ctx.lineTo(0, -h * 1.05);
  ctx.lineTo(10, -h * 0.9);
  ctx.closePath();
  ctx.fill();

  // Golden Mace (Gada)
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(20, -h * 0.6, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// 7. Surasa (Setu Nirman Boss)
function renderSurasa(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  // Oceanic leviathan asura
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-20, -h * 0.76, 40, h * 0.46, [8, 8, 4, 4]);
  ctx.fill();

  ctx.fillStyle = '#0369a1';
  ctx.fillRect(-17, -h * 0.35, 13, h * 0.35);
  ctx.fillRect(4, -h * 0.35, 13, h * 0.35);

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
  // Master of celestial lightning
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-17, -h * 0.76, 34, h * 0.46);

  ctx.fillStyle = '#292524';
  ctx.fillRect(-15, -h * 0.35, 12, h * 0.35);
  ctx.fillRect(3, -h * 0.35, 12, h * 0.35);

  // Golden lightning armor lines
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-15, -h * 0.72, 30, 24);

  ctx.fillStyle = '#44403c';
  ctx.beginPath();
  ctx.arc(0, -h * 0.84, 12, 0, Math.PI * 2);
  ctx.fill();

  // Lightning Staff
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(16, -h * 1.02);
  ctx.lineTo(16, 0);
  ctx.stroke();
  // Lightning sparks
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(16, -h * 1.04, 6, 0, Math.PI * 2);
  ctx.fill();
}

// 9. Kumbhakarna (Yuddha Boss)
function renderKumbhakarna(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  // Titan colossus
  ctx.fillStyle = '#450a0a';
  ctx.beginPath();
  ctx.roundRect(-28, -h * 0.82, 56, h * 0.52, [12, 12, 6, 6]);
  ctx.fill();

  ctx.fillStyle = '#262626';
  ctx.fillRect(-24, -h * 0.35, 18, h * 0.35);
  ctx.fillRect(6, -h * 0.35, 18, h * 0.35);

  // Giant head
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.arc(0, -h * 0.88, 17, 0, Math.PI * 2);
  ctx.fill();

  // Colossal iron mace
  ctx.fillStyle = '#171717';
  ctx.beginPath();
  ctx.roundRect(22, -h * 0.95, 18, h * 0.75, [6, 6, 3, 3]);
  ctx.fill();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 10. Mahabali Raone (Final Battle Boss)
function renderRaoneBoss(ctx: CanvasRenderingContext2D, h: number, w: number, time: number) {
  // Supreme Ten-Headed Emperor
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(-24, -h * 0.8);
  ctx.lineTo(24, -h * 0.8);
  ctx.lineTo(30, 0);
  ctx.lineTo(-30, 0);
  ctx.closePath();
  ctx.fill();

  // Golden Demon Chestplate
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.roundRect(-22, -h * 0.76, 44, h * 0.44, [8, 8, 4, 4]);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Center Head
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(0, -h * 0.85, 14, 0, Math.PI * 2);
  ctx.fill();

  // Multiple surrounding heads (Ten-Headed Ravana silhouette)
  const headOffsets = [-24, -16, -8, 8, 16, 24];
  ctx.fillStyle = '#92400e';
  headOffsets.forEach((offset, idx) => {
    ctx.beginPath();
    ctx.arc(offset, -h * 0.83 - (idx % 2) * 3, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Center Golden Fanged Crown (Mukut)
  ctx.fillStyle = '#f59e0b';
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
}
