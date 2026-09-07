import { CheckpointType } from '../data/gameData';
import { HeroState } from '../types';
import { soundManager } from '../audio/soundManager';

export interface LevelCheckpoint {
  id: string;
  name: string;
  hindiName: string;
  x: number;
  y: number;
  type: CheckpointType;
  isActivated: boolean;
  activationGlow: number; // 0 to 1
}

export class CheckpointSystem {
  public checkpoints: LevelCheckpoint[] = [];

  constructor() {
    this.resetLevelCheckpoints();
  }

  public resetLevelCheckpoints() {
    this.checkpoints = [
      {
        id: 'cp_1',
        name: 'Sacred Sarayu Shrine',
        hindiName: 'Sarayu Sanctuary',
        x: 850,
        y: 630,
        type: 'divine_shrine',
        isActivated: false,
        activationGlow: 0,
      },
      {
        id: 'cp_2',
        name: 'Hermitage Campfire',
        hindiName: 'Hermitage Hearth',
        x: 1750,
        y: 630,
        type: 'campfire',
        isActivated: false,
        activationGlow: 0,
      },
      {
        id: 'cp_3',
        name: 'Ancient Rishi Statue',
        hindiName: 'Ancient Sage Relic',
        x: 2700,
        y: 630,
        type: 'ancient_statue',
        isActivated: false,
        activationGlow: 0,
      },
      {
        id: 'cp_4',
        name: 'Surya Sun Temple',
        hindiName: 'Solar Sanctum',
        x: 3650,
        y: 630,
        type: 'sacred_temple',
        isActivated: false,
        activationGlow: 0,
      },
    ];
  }

  public update(
    dt: number,
    hero: HeroState,
    onActivate: (cp: LevelCheckpoint) => void
  ) {
    for (const cp of this.checkpoints) {
      if (cp.isActivated && cp.activationGlow < 1) {
        cp.activationGlow = Math.min(1, cp.activationGlow + dt * 2);
      }

      // Proximity check: hero within 60px
      const dist = Math.hypot(hero.x + hero.width * 0.5 - cp.x, hero.y + hero.height * 0.5 - cp.y);
      if (dist < 65 && !cp.isActivated) {
        cp.isActivated = true;
        hero.respawnX = cp.x;
        hero.respawnY = cp.y - 10;
        hero.hp = Math.min(hero.maxHp, hero.hp + 30); // Sacred healing
        soundManager.play('checkpoint');
        onActivate(cp);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    for (const cp of this.checkpoints) {
      const px = cp.x;
      const py = cp.y;

      // Glow effect if activated
      if (cp.isActivated) {
        const rad = 45 + Math.sin(Date.now() * 0.005) * 6;
        const grad = ctx.createRadialGradient(px, py - 30, 5, px, py - 30, rad);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py - 30, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      switch (cp.type) {
        case 'sacred_temple': {
          // Temple Shikhara & Sanctum
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px - 28, py - 65, 56, 65);
          // Stone cornice steps
          ctx.fillStyle = '#92400e';
          ctx.fillRect(px - 32, py - 72, 64, 8);
          // Golden spire (Kalash)
          ctx.fillStyle = cp.isActivated ? '#f59e0b' : '#78716c';
          ctx.beginPath();
          ctx.moveTo(px, py - 105);
          ctx.lineTo(px + 20, py - 72);
          ctx.lineTo(px - 20, py - 72);
          ctx.closePath();
          ctx.fill();

          // Saffron Flag fluttering
          const flutter = Math.sin(Date.now() * 0.006) * 5;
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(px, py - 105);
          ctx.lineTo(px + 22 + flutter, py - 95);
          ctx.lineTo(px, py - 85);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'divine_shrine': {
          // Stone pediment
          ctx.fillStyle = '#57534e';
          ctx.fillRect(px - 20, py - 45, 40, 45);
          // Shiva Lingam / Surya Yantra symbol
          ctx.fillStyle = cp.isActivated ? '#f59e0b' : '#a8a29e';
          ctx.beginPath();
          ctx.ellipse(px, py - 52, 10, 14, 0, 0, Math.PI * 2);
          ctx.fill();

          // Diya Oil Lamp with flame
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.ellipse(px + 16, py - 42, 6, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Diya flame
          const flameH = 8 + Math.sin(Date.now() * 0.015) * 3;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(px + 16, py - 45 - flameH);
          ctx.quadraticCurveTo(px + 20, py - 43, px + 16, py - 41);
          ctx.quadraticCurveTo(px + 12, py - 43, px + 16, py - 45 - flameH);
          ctx.fill();
          break;
        }

        case 'ancient_statue': {
          // Stone plinth
          ctx.fillStyle = '#44403c';
          ctx.fillRect(px - 22, py - 30, 44, 30);
          // Meditating sage silhouette
          ctx.fillStyle = cp.isActivated ? '#ca8a04' : '#78716c';
          ctx.beginPath();
          ctx.arc(px, py - 48, 8, 0, Math.PI * 2); // Head
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(px, py - 40);
          ctx.lineTo(px + 16, py - 28);
          ctx.lineTo(px - 16, py - 28);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'campfire': {
          // Sacred Vedic Yajna Kund / Campfire
          ctx.fillStyle = '#7c2d12';
          ctx.fillRect(px - 22, py - 18, 44, 18);
          // Burning embers & wood
          ctx.fillStyle = '#451a03';
          ctx.fillRect(px - 16, py - 14, 32, 6);

          // Sacred Fire Flame
          const fH = 20 + Math.sin(Date.now() * 0.012) * 5;
          const grad = ctx.createLinearGradient(px, py - 18, px, py - 18 - fH);
          grad.addColorStop(0, '#f97316');
          grad.addColorStop(0.6, '#facc15');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(px, py - 18 - fH);
          ctx.quadraticCurveTo(px + 15, py - 22, px + 10, py - 16);
          ctx.quadraticCurveTo(px, py - 14, px - 10, py - 16);
          ctx.quadraticCurveTo(px - 15, py - 22, px, py - 18 - fH);
          ctx.fill();
          break;
        }
      }

      // Overhead name label
      ctx.fillStyle = cp.isActivated ? '#fef08a' : '#d6d3d1';
      ctx.font = 'bold 9px "Cinzel", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cp.name, px, py - 70);
      if (cp.isActivated) {
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('✓ CHECKPOINT ACTIVE', px, py - 82);
      }
    }

    ctx.restore();
  }
}
