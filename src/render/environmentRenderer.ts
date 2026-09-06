import { Platform, Collectible } from '../types';
import { Camera2D } from '../engine/camera';
import { CHAPTER_THEMES, ChapterTheme } from '../data/chapterThemes';

/**
 * Ramayana Environment & Parallax Renderer
 * 5 Parallax Layers with Dynamic Chapter Themes:
 * Layer 1: Sky & Celestial Body (Sun, Moon, Lightning, Nebula)
 * Layer 2: Distant Mountains & Silhouette (Spires, Forest, Crags, Citadel)
 * Layer 3: Ancient Mid-ground Forest / Ruins Canopies
 * Layer 4: Architectural Landmarks (Palaces, Hermit huts, Banyans, Fortresses)
 * Layer 5: Gameplay Ground, River/Ocean, Themed Platforms, Bridges, Foliage
 */

export class EnvironmentRenderer {
  private time: number = 0;
  public theme: ChapterTheme = CHAPTER_THEMES[1];

  public setChapter(chapterId: number) {
    this.theme = CHAPTER_THEMES[chapterId] || CHAPTER_THEMES[1];
  }

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
    const t = this.theme;

    // ==========================================
    // LAYER 1: DYNAMIC SKY & CELESTIAL PHENOMENA (0.0x - 0.05x parallax)
    // ==========================================
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, t.skyColors[0]);
    skyGrad.addColorStop(0.35, t.skyColors[1]);
    skyGrad.addColorStop(0.7, t.skyColors[2]);
    skyGrad.addColorStop(1, t.skyColors[3]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Render Celestial Body based on chapter theme
    this.renderCelestialBody(ctx, camera, width, height);

    // Drifting Celestial Clouds
    ctx.fillStyle = t.cloudsColor;
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
    // LAYER 3: MID-GROUND CANOPIES & CLIFFS (0.35x parallax)
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

    // Render Cave or Citadel Entrance in background of world
    this.renderCaveEntrance(ctx, 3500, 500);

    // Render Ancient Mandir / Temple Structure
    this.renderTempleStructure(ctx, 1600, 320);

    // Render Sacred River or Southern Ocean
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

  private renderCelestialBody(
    ctx: CanvasRenderingContext2D,
    camera: Camera2D,
    width: number,
    height: number
  ) {
    const t = this.theme;
    const sunX = width * 0.72 - camera.x * 0.02;
    const sunY = height * 0.28 - camera.y * 0.02;

    switch (t.celestialType) {
      case 'blood_moon': {
        // Eerie glowing red moon
        const grad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 140);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
        grad.addColorStop(0.3, 'rgba(185, 28, 28, 0.6)');
        grad.addColorStop(0.7, 'rgba(127, 29, 29, 0.2)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'storm_lightning': {
        // Storm lightning flash
        const flash = Math.sin(this.time * 4) > 0.88;
        if (flash) {
          ctx.fillStyle = 'rgba(254, 215, 170, 0.35)';
          ctx.fillRect(0, 0, width, height);
          ctx.strokeStyle = '#fed7aa';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(sunX, 0);
          ctx.lineTo(sunX - 25, sunY * 0.5);
          ctx.lineTo(sunX + 15, sunY * 0.8);
          ctx.lineTo(sunX - 10, sunY * 1.3);
          ctx.stroke();
        }
        break;
      }
      case 'lanka_moon': {
        // Golden Full Moon over Lanka
        const grad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 150);
        grad.addColorStop(0, 'rgba(250, 204, 21, 0.95)');
        grad.addColorStop(0.3, 'rgba(234, 179, 8, 0.5)');
        grad.addColorStop(0.8, 'rgba(202, 138, 4, 0.15)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'celestial_aurora': {
        // Cosmic Aurora for Final Battle
        const auraPulse = Math.sin(this.time * 2) * 20;
        const grad = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 220 + auraPulse);
        grad.addColorStop(0, 'rgba(253, 224, 71, 0.95)');
        grad.addColorStop(0.25, 'rgba(244, 63, 94, 0.5)');
        grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.3)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 220 + auraPulse, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'golden_sun':
      case 'desert_sun':
      case 'ocean_haze':
      default: {
        // Radiant Surya
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 180);
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        sunGrad.addColorStop(0.2, 'rgba(251, 191, 36, 0.6)');
        sunGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.18)');
        sunGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.ellipse(x - w * 0.25, y + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.25, y + h * 0.1, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderMountains(ctx: CanvasRenderingContext2D, worldW: number, viewH: number) {
    const t = this.theme;
    ctx.fillStyle = t.mountainFarColor;
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

    // Near mountain layer
    ctx.fillStyle = t.mountainNearColor;
    ctx.beginPath();
    ctx.moveTo(-100, viewH);
    const step2 = 220;
    const baseH2 = viewH * 0.58;
    for (let x = -100; x <= worldW + 200; x += step2) {
      const peakH2 = baseH2 - ((x * 19) % 140) - 50;
      ctx.lineTo(x + step2 * 0.5, peakH2);
      ctx.lineTo(x + step2, baseH2);
    }
    ctx.lineTo(worldW + 200, viewH);
    ctx.closePath();
    ctx.fill();

    // Horizon accent line
    ctx.strokeStyle = t.structureAccentColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  private renderMidForest(ctx: CanvasRenderingContext2D, worldW: number, viewH: number) {
    const t = this.theme;
    ctx.fillStyle = t.canopyColors[0];
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
    const t = this.theme;
    ctx.fillStyle = t.canopyColors[1];
    for (let x = 300; x <= worldW; x += 650) {
      // Ancient stone pillar / tower silhouette
      ctx.fillRect(x, viewH * 0.62, 28, 180);
      ctx.fillRect(x - 6, viewH * 0.62 - 8, 40, 10);
      ctx.beginPath();
      ctx.arc(x + 14, viewH * 0.62 + 20, 16, Math.PI, 0);
      ctx.fill();
    }
  }

  private renderCaveEntrance(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const t = this.theme;
    ctx.fillStyle = t.groundColor;
    ctx.beginPath();
    ctx.ellipse(x, y + 80, 110, 140, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone rim around cave
    ctx.strokeStyle = t.platformEdgeColor;
    ctx.lineWidth = 10;
    ctx.stroke();

    // Dark interior
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.ellipse(x, y + 80, 85, 115, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderTempleStructure(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const t = this.theme;
    ctx.save();
    ctx.translate(x, y);

    // Temple Base plinth
    ctx.fillStyle = t.platformColor;
    ctx.fillRect(-90, 260, 180, 30);
    ctx.strokeStyle = t.structureAccentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(-90, 260, 180, 30);

    // Mandapa pillars
    ctx.fillStyle = t.groundColor;
    [-70, -30, 30, 70].forEach((px) => {
      ctx.fillRect(px - 6, 120, 12, 140);
      ctx.fillStyle = t.structureAccentColor;
      ctx.fillRect(px - 10, 110, 20, 10);
    });

    // Central Shikhara Tower
    ctx.fillStyle = t.platformColor;
    ctx.beginPath();
    ctx.moveTo(-60, 110);
    ctx.lineTo(60, 110);
    ctx.lineTo(35, 10);
    ctx.lineTo(0, -40); // Spire peak
    ctx.lineTo(-35, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = t.structureAccentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Golden Kalash pinnacle
    ctx.fillStyle = t.structureAccentColor;
    ctx.beginPath();
    ctx.arc(0, -48, 8, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Dhwaja flag
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
    const t = this.theme;
    const riverGrad = ctx.createLinearGradient(x, y, x, y + h);
    riverGrad.addColorStop(0, t.waterColor);
    riverGrad.addColorStop(0.7, '#075985');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(x, y, w, h);

    // Water ripple reflections
    ctx.strokeStyle = t.waterReflectColor;
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 6; i++) {
      const rwX = x + ((this.time * 40 + i * 110) % w);
      const rwY = y + 25 + i * 20;
      ctx.beginPath();
      ctx.moveTo(rwX, rwY);
      ctx.lineTo(rwX + 35, rwY);
      ctx.stroke();
    }

    // Sacred floating Lotus Flowers
    for (let l = 0; l < 4; l++) {
      const lotX = x + 80 + l * 150 + Math.sin(this.time + l) * 10;
      const lotY = y + 40 + (l % 2) * 35;
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(lotX, lotY, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(lotX, lotY - 4, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderPlatform(ctx: CanvasRenderingContext2D, plat: Platform) {
    const { x, y, width, height, type } = plat;
    const t = this.theme;

    if (type === 'wood_bridge') {
      // Wood bridge
      ctx.fillStyle = t.platformColor;
      const plankW = 16;
      const gap = 4;
      for (let px = x; px < x + width; px += plankW + gap) {
        ctx.fillRect(px, y, plankW, height);
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, y, plankW, height);
      }
      ctx.strokeStyle = t.structureAccentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.quadraticCurveTo(x + width * 0.5, y + 10, x + width, y + 2);
      ctx.stroke();
      return;
    }

    if (type === 'stone' || type === 'floating_ledge') {
      // Themed stone platform
      ctx.fillStyle = t.platformColor;
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = t.groundColor;
      ctx.fillRect(x, y, width, 6);
      ctx.strokeStyle = t.platformEdgeColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, width, height);
      return;
    }

    // Ground platform with themed grass/rock sublayer
    ctx.fillStyle = t.groundColor;
    ctx.fillRect(x, y, width, height);

    // Platform top grass / terrain rim
    ctx.fillStyle = t.groundGrassColor;
    ctx.fillRect(x, y, width, 14);

    // Accent line
    ctx.fillStyle = t.platformEdgeColor;
    ctx.fillRect(x, y + 12, width, 2);
  }

  private renderVegetationAndRocks(ctx: CanvasRenderingContext2D) {
    const t = this.theme;
    const treePositions = [200, 650, 1200, 2050, 3100];
    treePositions.forEach((tx) => {
      ctx.fillStyle = t.platformColor;
      ctx.fillRect(tx, 480, 36, 220);
      ctx.fillStyle = t.canopyColors[0];
      ctx.beginPath();
      ctx.arc(tx + 18, 460, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = t.canopyColors[1];
      ctx.beginPath();
      ctx.arc(tx - 15, 470, 48, 0, Math.PI * 2);
      ctx.arc(tx + 45, 470, 48, 0, Math.PI * 2);
      ctx.fill();
    });

    const bushPositions = [120, 420, 850, 1450, 1850, 2950, 3350];
    bushPositions.forEach((bx) => {
      ctx.fillStyle = t.groundGrassColor;
      ctx.beginPath();
      ctx.ellipse(bx, 690, 24, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private renderTorches(ctx: CanvasRenderingContext2D) {
    const torchPositions = [
      { x: 450, y: 640 },
      { x: 1050, y: 460 },
      { x: 1500, y: 510 },
      { x: 2200, y: 630 },
      { x: 3150, y: 500 },
      { x: 3750, y: 520 },
    ];

    torchPositions.forEach((t) => {
      ctx.fillStyle = '#44403c';
      ctx.fillRect(t.x - 4, t.y, 8, 32);
      ctx.fillStyle = '#292524';
      ctx.fillRect(t.x - 10, t.y - 6, 20, 8);

      const flicker = Math.sin(this.time * 12 + t.x) * 3;
      const fireGrad = ctx.createRadialGradient(t.x, t.y - 12, 2, t.x, t.y - 12, 16);
      fireGrad.addColorStop(0, '#fef08a');
      fireGrad.addColorStop(0.4, '#f59e0b');
      fireGrad.addColorStop(0.8, '#dc2626');
      fireGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(t.x, t.y - 12 + flicker, 16, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private renderCollectibles(ctx: CanvasRenderingContext2D, collectibles: Collectible[]) {
    for (const c of collectibles) {
      if (c.collected) continue;
      const bob = Math.sin(this.time * 4 + c.bobOffset) * 6;
      const cx = c.x;
      const cy = c.y + bob;

      // Glow aura
      const aura = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20);
      aura.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
      aura.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();

      // Golden orb
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}
