import { Platform, Collectible } from '../types';
import { Camera2D } from '../engine/camera';

/**
 * Ramayana Environment & Parallax Renderer
 * 5 Parallax Layers:
 * Layer 1: Sky & Celestial Sun
 * Layer 2: Distant Himalayan / Dandakaranya Mountains
 * Layer 3: Ancient Forest Canopies
 * Layer 4: Foreground Ancient Indian Architecture & Torches & Cave
 * Layer 5: Gameplay Ground, River, Stone Platforms, Bridges, Flowers, and Sacred Orbs
 */

export class EnvironmentRenderer {
  private time: number = 0;

  public update(dt: number) {
    this.time += dt;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    camera: Camera2D,
    platforms: Platform[],
    collectibles: Collectible[]
  ) {
    const width = camera.viewportWidth;
    const height = camera.viewportHeight;

    // ==========================================
    // LAYER 1: SKY & CELESTIAL SUN (0.0x - 0.05x parallax)
    // ==========================================
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    // Warm mythological dusk/dawn celestial atmosphere
    skyGrad.addColorStop(0, '#1e1b4b'); // Deep twilight indigo
    skyGrad.addColorStop(0.35, '#431407'); // Mythological bronze
    skyGrad.addColorStop(0.7, '#7c2d12'); // Warm amber terracotta
    skyGrad.addColorStop(1, '#ca8a04'); // Golden dawn horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Radiant Surya / Sacred Sun
    const sunX = width * 0.72 - camera.x * 0.02;
    const sunY = height * 0.28 - camera.y * 0.02;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
    sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    sunGrad.addColorStop(0.2, 'rgba(251, 191, 36, 0.6)');
    sunGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.18)');
    sunGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
    ctx.fill();

    // Drifting Celestial Clouds
    ctx.fillStyle = 'rgba(254, 215, 170, 0.18)';
    const cloudOffset = (this.time * 12) % (width + 600);
    this.drawCloud(ctx, (width * 0.2 + cloudOffset) % (width + 400) - 200, height * 0.18, 140, 45);
    this.drawCloud(ctx, (width * 0.65 + cloudOffset * 0.7) % (width + 400) - 200, height * 0.26, 180, 55);

    // ==========================================
    // LAYER 2: DISTANT SACRED MOUNTAINS (0.15x parallax)
    // ==========================================
    ctx.save();
    ctx.translate(-camera.x * 0.15, -camera.y * 0.08);
    this.renderMountains(ctx, camera.worldWidth, height);
    ctx.restore();

    // ==========================================
    // LAYER 3: ANCIENT DENSE FOREST CANOPIES (0.35x parallax)
    // ==========================================
    ctx.save();
    ctx.translate(-camera.x * 0.35, -camera.y * 0.18);
    this.renderMidForest(ctx, camera.worldWidth, height);
    ctx.restore();

    // ==========================================
    // LAYER 4: ARCHITECTURE & FOREGROUND STRUCTURES (0.65x parallax)
    // ==========================================
    ctx.save();
    ctx.translate(-camera.x * 0.65, -camera.y * 0.35);
    this.renderMidStructures(ctx, camera.worldWidth, height);
    ctx.restore();

    // ==========================================
    // LAYER 5: GAMEPLAY GROUND & PLATFORMS (1.0x parallax)
    // ==========================================
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Render Cave Entrance in background of world
    this.renderCaveEntrance(ctx, 3500, 500);

    // Render Ancient Mandir / Temple Structure
    this.renderTempleStructure(ctx, 1600, 320);

    // Render Sacred River with water reflections
    this.renderRiver(ctx, 2250, 780, 700, 160);

    // Render Platforms
    for (const plat of platforms) {
      this.renderPlatform(ctx, plat);
    }

    // Render Nature Details: Rocks, Trees, Bushes, Flowers
    this.renderVegetationAndRocks(ctx);

    // Render Animated Torches with Fire
    this.renderTorches(ctx);

    // Render Collectibles (Divine Orbs, Kalash, Lotus)
    this.renderCollectibles(ctx, collectibles);

    ctx.restore();
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.ellipse(x - w * 0.25, y + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.25, y + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderMountains(ctx: CanvasRenderingContext2D, worldW: number, viewH: number) {
    ctx.fillStyle = '#2e1065'; // Majestic twilight purple mountain ridges
    ctx.beginPath();
    ctx.moveTo(-100, viewH);

    const step = 280;
    const baseH = viewH * 0.52;
    for (let x = -100; x <= worldW + 200; x += step) {
      const peakH = baseH - ((x * 13) % 180) - 80;
      ctx.lineTo(x + step * 0.5, peakH);
      ctx.lineTo(x + step, baseH);
    }
    ctx.lineTo(worldW + 200, viewH);
    ctx.closePath();
    ctx.fill();

    // Snow caps & mist glow
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  private renderMidForest(ctx: CanvasRenderingContext2D, worldW: number, viewH: number) {
    ctx.fillStyle = '#14532d'; // Ancient Sal forest greens
    ctx.beginPath();
    ctx.moveTo(-100, viewH);

    const step = 140;
    const baseH = viewH * 0.65;
    for (let x = -100; x <= worldW + 200; x += step) {
      const treeTop = baseH - 90 - ((x * 17) % 80);
      ctx.lineTo(x + step * 0.3, treeTop + 30);
      ctx.lineTo(x + step * 0.5, treeTop);
      ctx.lineTo(x + step * 0.7, treeTop + 25);
      ctx.lineTo(x + step, baseH);
    }
    ctx.lineTo(worldW + 200, viewH);
    ctx.closePath();
    ctx.fill();
  }

  private renderMidStructures(ctx: CanvasRenderingContext2D, worldW: number, viewH: number) {
    // Distant carved stone pillars & ruin silhouettes
    ctx.fillStyle = '#1e293b';
    for (let x = 300; x <= worldW; x += 650) {
      // Ancient stone pillar
      ctx.fillRect(x, viewH * 0.62, 28, 180);
      // Pillar capital
      ctx.fillRect(x - 6, viewH * 0.62 - 8, 40, 10);
      // Archway
      ctx.beginPath();
      ctx.arc(x + 14, viewH * 0.62 + 20, 16, Math.PI, 0);
      ctx.fill();
    }
  }

  private renderCaveEntrance(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Ancient mythological mountain cave (Sugriva / Kishkindha cave aesthetic)
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(x, y + 80, 110, 140, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone rim around cave
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Dark mysterious interior
    ctx.fillStyle = '#0c0a09';
    ctx.beginPath();
    ctx.ellipse(x, y + 80, 85, 115, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderTempleStructure(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Ancient Indian Nagara/Dravida Temple Shikhara
    ctx.save();
    ctx.translate(x, y);

    // Temple Base plinth
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-90, 260, 180, 30);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(-90, 260, 180, 30);

    // Mandapa pillars
    ctx.fillStyle = '#92400e';
    [-70, -30, 30, 70].forEach((px) => {
      ctx.fillRect(px - 6, 120, 12, 140);
      // Carved capital
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px - 10, 110, 20, 10);
    });

    // Central Shikhara Tower
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(-60, 110);
    ctx.lineTo(60, 110);
    ctx.lineTo(35, 10);
    ctx.lineTo(0, -40); // Spire peak
    ctx.lineTo(-35, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Golden Kalash pinnacle on temple spire
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -48, 8, 0, Math.PI * 2);
    ctx.fill();
    // Sacred Trident/Dhwaja flag
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -56);
    ctx.lineTo(0, -78);
    ctx.stroke();
    // Triangular saffron flag
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(0, -78);
    ctx.lineTo(22 + Math.sin(this.time * 3) * 4, -72);
    ctx.lineTo(0, -64);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderRiver(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Sacred Godavari / Sarayu River
    const riverGrad = ctx.createLinearGradient(x, y, x, y + h);
    riverGrad.addColorStop(0, '#0284c7');
    riverGrad.addColorStop(0.5, '#0369a1');
    riverGrad.addColorStop(1, '#075985');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(x, y, w, h);

    // Water ripple reflections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 6; i++) {
      const rwX = x + ((this.time * 40 + i * 110) % w);
      const rwY = y + 25 + i * 20;
      ctx.beginPath();
      ctx.moveTo(rwX, rwY);
      ctx.lineTo(rwX + 35, rwY);
      ctx.stroke();
    }

    // Sacred floating Lotus Flowers in the river
    for (let l = 0; l < 4; l++) {
      const lotX = x + 80 + l * 150 + Math.sin(this.time + l) * 10;
      const lotY = y + 40 + (l % 2) * 35;
      // Lotus pad
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(lotX, lotY, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lotus petals
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(lotX, lotY - 4, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(lotX, lotY - 4, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderPlatform(ctx: CanvasRenderingContext2D, plat: Platform) {
    const { x, y, width, height, type } = plat;

    if (type === 'wood_bridge') {
      // Ancient wooden rope bridge across river/chasm
      ctx.fillStyle = '#78350f';
      const plankW = 16;
      const gap = 4;
      for (let px = x; px < x + width; px += plankW + gap) {
        ctx.fillRect(px, y, plankW, height);
        // Wood grain line
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, y, plankW, height);
      }
      // Rope bindings
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.quadraticCurveTo(x + width * 0.5, y + 10, x + width, y + 2);
      ctx.stroke();
      return;
    }

    if (type === 'stone' || type === 'floating_ledge') {
      // Ancient carved stone platform
      ctx.fillStyle = '#334155'; // Slate stone
      ctx.fillRect(x, y, width, height);

      // Ornate stone rim
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, width, 6);

      // Stone brick seams
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      const brickW = 40;
      for (let bx = x; bx < x + width; bx += brickW) {
        ctx.beginPath();
        ctx.moveTo(bx, y);
        ctx.lineTo(bx, y + height);
        ctx.stroke();
      }

      // Golden Sanskrit-inspired decorative border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      return;
    }

    // Default: Ground tiles (Grass top + Dirt/stone sublayer)
    // 1. Dirt sublayer
    ctx.fillStyle = '#451a03'; // Rich soil
    ctx.fillRect(x, y, width, height);

    // 2. Stone pebbles embedded in dirt
    ctx.fillStyle = '#78350f';
    for (let px = x + 15; px < x + width - 15; px += 45) {
      ctx.beginPath();
      ctx.ellipse(px, y + 22, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Lush grass rim on top
    ctx.fillStyle = '#15803d'; // Forest grass
    ctx.fillRect(x, y, width, 14);

    // 4. Grass blades
    ctx.fillStyle = '#22c55e';
    for (let gx = x; gx < x + width; gx += 10) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + 3, y - 6);
      ctx.lineTo(gx + 6, y);
      ctx.fill();
    }
  }

  private renderVegetationAndRocks(ctx: CanvasRenderingContext2D) {
    // Ancient Banyan & Flowering Ashoka Trees
    const treePositions = [200, 650, 1200, 2050, 3100];
    treePositions.forEach((tx) => {
      // Tree Trunk
      ctx.fillStyle = '#713f12';
      ctx.fillRect(tx, 480, 36, 220);
      // Bark texture
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx + 12, 500);
      ctx.lineTo(tx + 16, 680);
      ctx.stroke();

      // Lush Canopy
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(tx + 18, 460, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(tx - 15, 470, 48, 0, Math.PI * 2);
      ctx.arc(tx + 45, 470, 48, 0, Math.PI * 2);
      ctx.fill();

      // Red Ashoka blossoms
      ctx.fillStyle = '#f43f5e';
      for (let b = 0; b < 6; b++) {
        const bx = tx - 30 + (b * 18);
        const by = 430 + ((b * 13) % 45);
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Forest Bushes & Wild Flowers
    const bushPositions = [120, 420, 850, 1450, 1850, 2950, 3350];
    bushPositions.forEach((bx) => {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(bx, 690, 24, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tiny yellow & white blossoms
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx - 6, 684, 2.5, 0, Math.PI * 2);
      ctx.arc(bx + 8, 686, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Mythological Forest Rocks
    const rockPositions = [320, 950, 1750, 2750];
    rockPositions.forEach((rx) => {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(rx, 694, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  private renderTorches(ctx: CanvasRenderingContext2D) {
    // Ancient stone brazier torches with animated fire
    const torchPositions = [
      { x: 450, y: 640 },
      { x: 1050, y: 460 },
      { x: 1520, y: 440 },
      { x: 1780, y: 440 },
      { x: 2850, y: 480 },
      { x: 3420, y: 640 },
    ];

    torchPositions.forEach((t) => {
      // Stone post
      ctx.fillStyle = '#334155';
      ctx.fillRect(t.x - 4, t.y, 8, 55);
      // Brazier cup
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(t.x - 12, t.y);
      ctx.lineTo(t.x + 12, t.y);
      ctx.lineTo(t.x + 6, t.y + 12);
      ctx.lineTo(t.x - 6, t.y + 12);
      ctx.closePath();
      ctx.fill();

      // Animated Sacred Flame (Yajna / Deepa fire)
      const flicker = Math.sin(this.time * 12 + t.x) * 3;
      const flameH = 22 + Math.cos(this.time * 15 + t.y) * 4;

      // Outer golden glow
      const fGrad = ctx.createRadialGradient(t.x, t.y - 6, 2, t.x, t.y - 6, 28);
      fGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      fGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.7)');
      fGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.35)');
      fGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.arc(t.x, t.y - 6, 28, 0, Math.PI * 2);
      ctx.fill();

      // Flame core
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(t.x - 6, t.y);
      ctx.quadraticCurveTo(t.x + flicker, t.y - flameH, t.x, t.y - flameH);
      ctx.quadraticCurveTo(t.x + flicker + 3, t.y - flameH * 0.5, t.x + 6, t.y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(t.x - 3, t.y);
      ctx.lineTo(t.x, t.y - flameH * 0.65);
      ctx.lineTo(t.x + 3, t.y);
      ctx.closePath();
      ctx.fill();
    });
  }

  private renderCollectibles(ctx: CanvasRenderingContext2D, collectibles: Collectible[]) {
    for (const item of collectibles) {
      if (item.collected) continue;

      const bobY = item.y + Math.sin(this.time * 3 + item.bobOffset) * 6;

      ctx.save();
      ctx.translate(item.x, bobY);

      if (item.type === 'sacred_kalash') {
        // Golden Sacred Kalash (Vessel with sacred water & coconut)
        // Radiant Glow
        const kGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
        kGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        kGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
        kGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = kGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // Pot
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 4, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-6, -6, 12, 6);
        // Coconut & Mango leaves
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(-7, -5);
        ctx.lineTo(-12, -12);
        ctx.lineTo(0, -6);
        ctx.lineTo(12, -12);
        ctx.lineTo(7, -5);
        ctx.fill();
      } else if (item.type === 'lotus_flower') {
        // Divine Sacred Lotus
        const lGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
        lGrad.addColorStop(0, 'rgba(251, 113, 133, 0.9)');
        lGrad.addColorStop(0.6, 'rgba(244, 63, 94, 0.3)');
        lGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f43f5e';
        for (let p = 0; p < 6; p++) {
          const pAngle = (p * Math.PI) / 3;
          ctx.beginPath();
          ctx.ellipse(Math.cos(pAngle) * 5, Math.sin(pAngle) * 5, 4, 7, pAngle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Divine Energy Orb
        const oGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
        oGrad.addColorStop(0, '#ffffff');
        oGrad.addColorStop(0.3, '#fde047');
        oGrad.addColorStop(0.7, '#f59e0b');
        oGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = oGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
