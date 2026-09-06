import {
  UmeshAnimationState,
  PurneemaAnimationState,
  RaoneAnimationState,
  EnemyAnimationState,
} from '../types';

export interface SpriteSheetConfig {
  stateName: string;
  character: 'Umesh' | 'Purneema' | 'Raone' | 'Enemy';
  imageUrl?: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  imageElement?: HTMLImageElement;
}

class SpritePipelineManager {
  private sheets: Map<string, SpriteSheetConfig> = new Map();
  private listeners: (() => void)[] = [];

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // Umesh required animation states
    const umeshStates: UmeshAnimationState[] = [
      'Umesh_Idle',
      'Umesh_Walk',
      'Umesh_Run',
      'Umesh_Jump',
      'Umesh_Fall',
      'Umesh_Attack',
      'Umesh_PowerAttack',
      'Umesh_Hurt',
      'Umesh_Death',
      'Umesh_DivinePower',
    ];
    umeshStates.forEach((state) => {
      this.sheets.set(state, {
        stateName: state,
        character: 'Umesh',
        frameWidth: 96,
        frameHeight: 112,
        frameCount: state.includes('Attack') ? 6 : state.includes('Walk') || state.includes('Run') ? 8 : 4,
        fps: state.includes('Run') ? 12 : 8,
      });
    });

    // Purneema required animation states
    const purneemaStates: PurneemaAnimationState[] = [
      'Purneema_Idle',
      'Purneema_Walk',
      'Purneema_Run',
      'Purneema_Jump',
      'Purneema_Hurt',
      'Purneema_Talk',
      'Purneema_Divine',
    ];
    purneemaStates.forEach((state) => {
      this.sheets.set(state, {
        stateName: state,
        character: 'Purneema',
        frameWidth: 80,
        frameHeight: 104,
        frameCount: 6,
        fps: 8,
      });
    });

    // Raone required animation states
    const raoneStates: RaoneAnimationState[] = [
      'Raone_Idle',
      'Raone_Walk',
      'Raone_Run',
      'Raone_Attack',
      'Raone_SpecialAttack',
      'Raone_Hurt',
      'Raone_Rage',
      'Raone_Death',
    ];
    raoneStates.forEach((state) => {
      this.sheets.set(state, {
        stateName: state,
        character: 'Raone',
        frameWidth: 120,
        frameHeight: 140,
        frameCount: state.includes('Attack') || state.includes('Rage') ? 8 : 6,
        fps: 9,
      });
    });

    // Enemy required animation states
    const enemyStates: EnemyAnimationState[] = [
      'Enemy_Idle',
      'Enemy_Walk',
      'Enemy_Run',
      'Enemy_Attack',
      'Enemy_Hurt',
      'Enemy_Death',
    ];
    enemyStates.forEach((state) => {
      this.sheets.set(state, {
        stateName: state,
        character: 'Enemy',
        frameWidth: 88,
        frameHeight: 96,
        frameCount: 6,
        fps: 8,
      });
    });
  }

  public getConfig(stateName: string): SpriteSheetConfig | undefined {
    return this.sheets.get(stateName);
  }

  public getAllConfigs(): SpriteSheetConfig[] {
    return Array.from(this.sheets.values());
  }

  public registerCustomSpriteSheet(
    stateName: string,
    fileOrUrl: string | File,
    config: { frameWidth: number; frameHeight: number; frameCount: number; fps: number }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = this.sheets.get(stateName);
      if (!existing) {
        reject(new Error(`Unknown animation state: ${stateName}`));
        return;
      }

      const img = new Image();
      let srcUrl = '';

      if (typeof fileOrUrl === 'string') {
        srcUrl = fileOrUrl;
      } else {
        srcUrl = URL.createObjectURL(fileOrUrl);
      }

      img.onload = () => {
        this.sheets.set(stateName, {
          ...existing,
          imageUrl: srcUrl,
          imageElement: img,
          frameWidth: config.frameWidth || img.width / config.frameCount,
          frameHeight: config.frameHeight || img.height,
          frameCount: config.frameCount,
          fps: config.fps,
        });
        this.notifyListeners();
        resolve();
      };

      img.onerror = () => {
        reject(new Error('Failed to load sprite sheet image'));
      };

      img.src = srcUrl;
    });
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }
}

export const spritePipeline = new SpritePipelineManager();
