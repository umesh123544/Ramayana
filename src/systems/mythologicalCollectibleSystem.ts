import { CollectibleType } from '../data/gameData';
import { HeroState } from '../types';

export interface LevelCollectible {
  id: string;
  type: CollectibleType;
  name: string;
  x: number;
  y: number;
  value: number;
  isCollected: boolean;
  bobOffset: number;
}

export class MythologicalCollectibleSystem {
  public items: LevelCollectible[] = [];
  public collectedCount: number = 0;
  public totalCount: number = 0;

  constructor() {
    this.resetLevelItems();
  }

  public resetLevelItems() {
    this.items = [
      { id: 'col_1', type: 'divine_coins', name: 'Surya Gold Coin', x: 450, y: 580, value: 25, isCollected: false, bobOffset: 0 },
      { id: 'col_2', type: 'sacred_orbs', name: 'Amrita Orb', x: 620, y: 440, value: 50, isCollected: false, bobOffset: 1 },
      { id: 'col_3', type: 'ancient_scrolls', name: 'Dhanurveda Palm Leaf', x: 1050, y: 560, value: 75, isCollected: false, bobOffset: 2 },
      { id: 'col_4', type: 'power_shards', name: 'Agni Power Shard', x: 1350, y: 420, value: 35, isCollected: false, bobOffset: 3 },
      { id: 'col_5', type: 'divine_coins', name: 'Surya Gold Coin', x: 1550, y: 580, value: 25, isCollected: false, bobOffset: 4 },
      { id: 'col_6', type: 'ramayan_relics', name: 'Sacred Shankha Conch', x: 2050, y: 460, value: 100, isCollected: false, bobOffset: 5 },
      { id: 'col_7', type: 'divine_coins', name: 'Surya Gold Coin', x: 2300, y: 580, value: 25, isCollected: false, bobOffset: 0.5 },
      { id: 'col_8', type: 'sacred_orbs', name: 'Amrita Orb', x: 2550, y: 420, value: 50, isCollected: false, bobOffset: 1.5 },
      { id: 'col_9', type: 'ancient_scrolls', name: 'Ramayana Sage Mantras', x: 3000, y: 540, value: 75, isCollected: false, bobOffset: 2.5 },
      { id: 'col_10', type: 'power_shards', name: 'Surya Sun Shard', x: 3450, y: 460, value: 35, isCollected: false, bobOffset: 3.5 },
    ];
    this.totalCount = this.items.length;
    this.collectedCount = 0;
  }

  public update(
    dt: number,
    hero: HeroState,
    onCollect: (item: LevelCollectible) => void
  ) {
    for (const item of this.items) {
      if (item.isCollected) continue;

      item.bobOffset += dt * 3;
      const curY = item.y + Math.sin(item.bobOffset) * 6;

      const dist = Math.hypot(
        hero.x + hero.width * 0.5 - item.x,
        hero.y + hero.height * 0.5 - curY
      );

      if (dist < 36) {
        item.isCollected = true;
        this.collectedCount++;
        onCollect(item);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    for (const item of this.items) {
      if (item.isCollected) continue;

      const px = item.x;
      const py = item.y + Math.sin(item.bobOffset) * 6;

      // Glow halo
      const grad = ctx.createRadialGradient(px, py, 2, px, py, 18);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
      grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.fill();

      switch (item.type) {
        case 'divine_coins': {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Inner Om symbol
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('ॐ', px, py);
          break;
        }

        case 'sacred_orbs': {
          // Luminous Amrita Orb
          const orbGrad = ctx.createRadialGradient(px - 3, py - 3, 2, px, py, 13);
          orbGrad.addColorStop(0, '#ffffff');
          orbGrad.addColorStop(0.4, '#38bdf8');
          orbGrad.addColorStop(1, '#0369a1');
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'ancient_scrolls': {
          // Vedic palm-leaf manuscript
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(px - 12, py - 6, 24, 12);
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1;
          ctx.strokeRect(px - 12, py - 6, 24, 12);
          // Red ribbon
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(px - 2, py - 7, 4, 14);
          break;
        }

        case 'ramayan_relics': {
          // Sacred Golden Shankha (Conch)
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.ellipse(px, py, 10, 14, 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          break;
        }

        case 'power_shards': {
          // Radiant Surya Diamond Shard
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(px, py - 13);
          ctx.lineTo(px + 9, py);
          ctx.lineTo(px, py + 13);
          ctx.lineTo(px - 9, py);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
        }
      }
    }

    ctx.restore();
  }
}
