export interface HeroConfig {
  name: string;
  title: string;
  skinTone: string;
  dhotiColor: string;
  armorColor: string;
  maxHp: number;
  lives: number;
  walkSpeed: number;
  runSpeed: number;
  jumpForce: number;
  arrowDamage: number;
  chargedArrowDamage: number;
}

export interface CompanionConfig {
  name: string;
  role: string;
  sariColor: string;
  blessingEnergy: number;
  dialogues: string[];
}

export interface VillainConfig {
  name: string;
  title: string;
  maxHp: number;
  armorColor: string;
}

export type DifficultyLevel = 'EASY' | 'NORMAL' | 'HARD' | 'EPIC';

export interface EnemiesConfig {
  smallDemonName: string;
  archerDemonName: string;
  heavyDemonName: string;
  flyingDemonName: string;
  eliteDemonName: string;
  damageMultiplier: number;
  hpMultiplier: number;
}

export interface AdminGameConfig {
  gameTitle: string;
  gameSubtitle: string;
  difficulty: DifficultyLevel;
  divinePowerScaling: number;
  hero: HeroConfig;
  companion: CompanionConfig;
  villain: VillainConfig;
  enemies: EnemiesConfig;
}

export const DEFAULT_ADMIN_CONFIG: AdminGameConfig = {
  gameTitle: 'Ramayana 2D Action Adventure',
  gameSubtitle: 'A Mythological Epic Platformer • धनुर्धर उमेशको गाथा',
  difficulty: 'NORMAL',
  divinePowerScaling: 1.0,
  hero: {
    name: 'Umesh',
    title: 'Ramayana Hero • Bow Warrior',
    skinTone: '#38bdf8', // Divine Sky Blue (Shri Rama warrior hue)
    dhotiColor: '#ea580c', // Sacred Saffron
    armorColor: '#f59e0b', // Golden Kavach
    maxHp: 100,
    lives: 3,
    walkSpeed: 220,
    runSpeed: 380,
    jumpForce: 640,
    arrowDamage: 25,
    chargedArrowDamage: 50,
  },
  companion: {
    name: 'Purneema',
    role: 'Sacred Ashram Supporting Heroine',
    sariColor: '#e11d48', // Sacred Lotus Crimson / Rose
    blessingEnergy: 35,
    dialogues: [
      "Umesh! The sacred forest whispers of your valor. Hold the divine bow steady, and let righteousness guide your aim.",
      "May the blessings of the Sun God protect you against the demon army. Receive this sacred lotus energy!",
      "Remember, true strength lies not just in force, but in patience and Dharma. The demons cannot pierce a pure heart.",
      "Take courage, Umesh. When darkness descends, the light of divine truth will always prevail.",
    ],
  },
  villain: {
    name: 'Raone',
    title: 'Demon King of Lanka (दशानन)',
    maxHp: 500,
    armorColor: '#7f1d1d', // Dark Demon Crimson / Obsidian
  },
  enemies: {
    smallDemonName: 'Small Rakshasa',
    archerDemonName: 'Demon Archer',
    heavyDemonName: 'Kumbha Brute',
    flyingDemonName: 'Winged Asura',
    eliteDemonName: 'Elite Demon Commander',
    damageMultiplier: 1.0,
    hpMultiplier: 1.0,
  },
};

const STORAGE_KEY = 'ramayana_game_admin_config_v1';

class AdminConfigManager {
  private config: AdminGameConfig;
  private listeners: Array<(cfg: AdminGameConfig) => void> = [];

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AdminGameConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Deep merge with defaults to guard against missing fields
        return {
          ...DEFAULT_ADMIN_CONFIG,
          ...parsed,
          hero: { ...DEFAULT_ADMIN_CONFIG.hero, ...(parsed.hero || {}) },
          companion: { ...DEFAULT_ADMIN_CONFIG.companion, ...(parsed.companion || {}) },
          villain: { ...DEFAULT_ADMIN_CONFIG.villain, ...(parsed.villain || {}) },
          enemies: { ...DEFAULT_ADMIN_CONFIG.enemies, ...(parsed.enemies || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to load admin config from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_ADMIN_CONFIG));
  }

  public get(): AdminGameConfig {
    return this.config;
  }

  public save(newConfig: AdminGameConfig) {
    this.config = JSON.parse(JSON.stringify(newConfig));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to persist admin config to localStorage:', e);
    }
    this.notify();
  }

  public setDifficulty(diff: DifficultyLevel): AdminGameConfig {
    const next = JSON.parse(JSON.stringify(this.config)) as AdminGameConfig;
    next.difficulty = diff;

    switch (diff) {
      case 'EASY':
        next.enemies.hpMultiplier = 0.7;
        next.enemies.damageMultiplier = 0.65;
        next.divinePowerScaling = 1.5;
        next.companion.blessingEnergy = 50;
        next.hero.lives = 4;
        next.hero.arrowDamage = 32;
        next.hero.chargedArrowDamage = 65;
        break;
      case 'NORMAL':
        next.enemies.hpMultiplier = 1.0;
        next.enemies.damageMultiplier = 1.0;
        next.divinePowerScaling = 1.0;
        next.companion.blessingEnergy = 35;
        next.hero.lives = 3;
        next.hero.arrowDamage = 25;
        next.hero.chargedArrowDamage = 50;
        break;
      case 'HARD':
        next.enemies.hpMultiplier = 1.45;
        next.enemies.damageMultiplier = 1.4;
        next.divinePowerScaling = 0.8;
        next.companion.blessingEnergy = 25;
        next.hero.lives = 3;
        next.hero.arrowDamage = 22;
        next.hero.chargedArrowDamage = 45;
        break;
      case 'EPIC':
        next.enemies.hpMultiplier = 2.0;
        next.enemies.damageMultiplier = 1.85;
        next.divinePowerScaling = 0.6;
        next.companion.blessingEnergy = 20;
        next.hero.lives = 2;
        next.hero.arrowDamage = 20;
        next.hero.chargedArrowDamage = 40;
        break;
    }

    this.save(next);
    return this.config;
  }

  public resetToDefaults(): AdminGameConfig {
    this.config = JSON.parse(JSON.stringify(DEFAULT_ADMIN_CONFIG));
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove admin config from localStorage:', e);
    }
    this.notify();
    return this.config;
  }

  public subscribe(listener: (cfg: AdminGameConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.config);
    }
  }
}

export const adminConfig = new AdminConfigManager();
