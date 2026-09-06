export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'EPIC';

export interface DifficultyConfig {
  name: Difficulty;
  label: string;
  description: string;
  enemyHpMult: number;
  enemyDmgMult: number;
  enemySpeedMult: number;
  playerDmgMult: number;
  divineGainMult: number;
  tagColor: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    name: 'EASY',
    label: 'Easy (सरल / सुलभ)',
    description: 'Generous health, abundant divine power, and forgiving demon encounters. Ideal for experiencing the mythological story.',
    enemyHpMult: 0.7,
    enemyDmgMult: 0.6,
    enemySpeedMult: 0.85,
    playerDmgMult: 1.4,
    divineGainMult: 1.5,
    tagColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  },
  NORMAL: {
    name: 'NORMAL',
    label: 'Normal (सन्तुलित - Recommended)',
    description: 'The canonical journey of Dharma. Balanced challenge with rewarding bow combat and responsive enemy tactics.',
    enemyHpMult: 1.0,
    enemyDmgMult: 1.0,
    enemySpeedMult: 1.0,
    playerDmgMult: 1.0,
    divineGainMult: 1.0,
    tagColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  },
  HARD: {
    name: 'HARD',
    label: 'Hard (कठिन)',
    description: 'Aggressive demon forces, higher damage, and scarce healing. Requires master archery and precision dodging.',
    enemyHpMult: 1.4,
    enemyDmgMult: 1.4,
    enemySpeedMult: 1.15,
    playerDmgMult: 0.85,
    divineGainMult: 0.8,
    tagColor: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  },
  EPIC: {
    name: 'EPIC',
    label: 'Epic (महायज्ञ / अति-कठिन)',
    description: 'A legendary trial for the greatest warriors. Relentless demon hordes where every strike must be divine.',
    enemyHpMult: 2.0,
    enemyDmgMult: 1.8,
    enemySpeedMult: 1.25,
    playerDmgMult: 0.7,
    divineGainMult: 0.6,
    tagColor: 'text-red-400 border-red-500/40 bg-red-500/10',
  },
};

export interface Chapter {
  id: number;
  code: string;
  title: string;
  hindiTitle: string;
  location: string;
  description: string;
  isUnlocked: boolean;
  totalLevels: number;
  completedLevels: number;
  bannerImage: string;
  icon: string;
  accentColor: string;
}

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 1,
    code: 'AYODHYA',
    title: 'Ayodhya',
    hindiTitle: 'अयोध्या',
    location: 'The Sacred Kingdom of Kosala',
    description: 'The golden capital beside the holy Sarayu river. Umesh begins his divine path as a master archer and righteous warrior.',
    isUnlocked: true,
    totalLevels: 5,
    completedLevels: 0,
    bannerImage: 'ayodhya_sunrise',
    icon: 'Crown',
    accentColor: '#f59e0b',
  },
  {
    id: 2,
    code: 'VANVAS',
    title: 'Vanvas',
    hindiTitle: 'वनवास',
    location: 'The Hermit Path Beyond Kosala',
    description: 'Embarking on the humble hermitage journey into the deep wild forests, leaving royal luxury behind.',
    isUnlocked: false,
    totalLevels: 5,
    completedLevels: 0,
    bannerImage: 'vanvas_forest',
    icon: 'Trees',
    accentColor: '#10b981',
  },
  {
    id: 3,
    code: 'DANDAKARANYA',
    title: 'Dandakaranya',
    hindiTitle: 'दण्डकारण्य',
    location: 'The Haunted Wilderness',
    description: 'A perilous primeval jungle infested by terrifying Rakshasas who disrupt the sacred Vedic fire rituals.',
    isUnlocked: false,
    totalLevels: 6,
    completedLevels: 0,
    bannerImage: 'dandak_wilderness',
    icon: 'ShieldAlert',
    accentColor: '#ef4444',
  },
  {
    id: 4,
    code: 'PANCHAVATI',
    title: 'Panchavati',
    hindiTitle: 'पञ्चवटी',
    location: 'Banks of River Godavari',
    description: 'A serene sanctuary of five sacred banyan trees where trials of deceit and the golden deer unfold.',
    isUnlocked: false,
    totalLevels: 5,
    completedLevels: 0,
    bannerImage: 'panchavati_hermitage',
    icon: 'Flower2',
    accentColor: '#8b5cf6',
  },
  {
    id: 5,
    code: 'SITA_HARAN',
    title: 'Sita Haran',
    hindiTitle: 'सीता हरण',
    location: 'The Shadow of Abduction',
    description: 'The dark turn of fate where Raone arrives disguised as a hermit. Umesh must chase the dark omens across the mountains.',
    isUnlocked: false,
    totalLevels: 6,
    completedLevels: 0,
    bannerImage: 'abduction_cliff',
    icon: 'Flame',
    accentColor: '#f97316',
  },
  {
    id: 6,
    code: 'KISHKINDHA',
    title: 'Kishkindha',
    hindiTitle: 'किष्किन्धा',
    location: 'The Vanara Mountain Empire',
    description: 'The rocky kingdom of the brave Vanara warriors. Alliances of brotherhood forged beside the holy Pampa lake.',
    isUnlocked: false,
    totalLevels: 6,
    completedLevels: 0,
    bannerImage: 'kishkindha_cliffs',
    icon: 'Mountain',
    accentColor: '#06b6d4',
  },
  {
    id: 7,
    code: 'SETU_NIRMAN',
    title: 'Setu Nirman',
    hindiTitle: 'सेतु निर्माण',
    location: 'The Roaring Southern Ocean',
    description: 'Floating sacred rocks inscribed with the divine name to build the bridge connecting the mainland to Lanka.',
    isUnlocked: false,
    totalLevels: 5,
    completedLevels: 0,
    bannerImage: 'setu_ocean',
    icon: 'Waves',
    accentColor: '#3b82f6',
  },
  {
    id: 8,
    code: 'LANKA',
    title: 'Lanka',
    hindiTitle: 'स्वर्ण लंका',
    location: 'The Golden Island Fortress',
    description: 'Infiltrating the impregnable golden fortress of the ten-headed demon king high upon Mount Trikuta.',
    isUnlocked: false,
    totalLevels: 6,
    completedLevels: 0,
    bannerImage: 'golden_lanka',
    icon: 'Castle',
    accentColor: '#eab308',
  },
  {
    id: 9,
    code: 'YUDDHA',
    title: 'Yuddha',
    hindiTitle: 'महासंग्राम',
    location: 'The Great Battlefield',
    description: 'The thunderous clash of divine asthras against celestial demonic magic across storm-torn battle plains.',
    isUnlocked: false,
    totalLevels: 7,
    completedLevels: 0,
    bannerImage: 'battlefield_storm',
    icon: 'Swords',
    accentColor: '#dc2626',
  },
  {
    id: 10,
    code: 'FINAL_BATTLE',
    title: 'Final Battle',
    hindiTitle: 'अन्तिम युद्ध',
    location: 'Chariot of the Sun',
    description: 'The ultimate duel of righteousness against primal ego. Unleashing the Brahmastra to restore Dharma to the universe.',
    isUnlocked: false,
    totalLevels: 5,
    completedLevels: 0,
    bannerImage: 'final_duel',
    icon: 'Sparkles',
    accentColor: '#fbbf24',
  },
];

export interface Level {
  id: string;
  chapterId: number;
  levelNumber: number;
  name: string;
  hindiName: string;
  description: string;
  objective: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number; // 0 to 3
  bestScore: number;
  completionPercent: number;
  collectiblesFound: number;
  totalCollectibles: number;
  enemiesCount: number;
  bossName?: string;
  checkpointCount: number;
}

export const INITIAL_LEVELS: Record<number, Level[]> = {
  1: [
    {
      id: 'c1-l1',
      chapterId: 1,
      levelNumber: 1,
      name: 'The Beginning',
      hindiName: 'आरम्भ',
      description: 'Master the sacred bow in the palace gardens and confront the vanguard demon scouts infiltrating the borders.',
      objective: 'Defeat demon scouts, activate the sacred shrine, and speak with Purneema.',
      isUnlocked: true,
      isCompleted: false,
      stars: 0,
      bestScore: 0,
      completionPercent: 0,
      collectiblesFound: 0,
      totalCollectibles: 15,
      enemiesCount: 8,
      checkpointCount: 2,
    },
    {
      id: 'c1-l2',
      chapterId: 1,
      levelNumber: 2,
      name: 'The Kingdom',
      hindiName: 'राजपथ',
      description: 'Patrol the outer ramparts of Ayodhya and dispel lurking nocturnal demon archers.',
      objective: 'Secure the western royal gate and collect ancient scrolls.',
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
      bestScore: 0,
      completionPercent: 0,
      collectiblesFound: 0,
      totalCollectibles: 18,
      enemiesCount: 12,
      checkpointCount: 3,
    },
    {
      id: 'c1-l3',
      chapterId: 1,
      levelNumber: 3,
      name: 'The Journey',
      hindiName: 'महाप्रयाण',
      description: 'Escort sacred sages along the peaceful Sarayu riverbanks while dark omens appear.',
      objective: 'Cleanse the riverbank shrines from demonic corruption.',
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
      bestScore: 0,
      completionPercent: 0,
      collectiblesFound: 0,
      totalCollectibles: 20,
      enemiesCount: 15,
      checkpointCount: 3,
    },
    {
      id: 'c1-l4',
      chapterId: 1,
      levelNumber: 4,
      name: 'The Forest Path',
      hindiName: 'वनमार्ग',
      description: 'Navigate ancient banyan roots and floating moss ledges as demon forces grow bolder.',
      objective: 'Track the demon scout commander deeper into the woods.',
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
      bestScore: 0,
      completionPercent: 0,
      collectiblesFound: 0,
      totalCollectibles: 20,
      enemiesCount: 16,
      checkpointCount: 3,
    },
    {
      id: 'c1-l5',
      chapterId: 1,
      levelNumber: 5,
      name: 'The Challenge',
      hindiName: 'परीक्षा',
      description: 'A fierce confrontation against the Rakshasa Lieutenant guarding the border outpost.',
      objective: 'Defeat the Rakshasa Lieutenant and recover the Sacred Sun Emblem.',
      isUnlocked: false,
      isCompleted: false,
      stars: 0,
      bestScore: 0,
      completionPercent: 0,
      collectiblesFound: 0,
      totalCollectibles: 25,
      enemiesCount: 20,
      bossName: 'Rakshasa Lieutenant Subahu',
      checkpointCount: 4,
    },
  ],
};

// Generate placeholders for chapters 2 through 10
for (let ch = 2; ch <= 10; ch++) {
  const chData = INITIAL_CHAPTERS.find((c) => c.id === ch);
  const titles = [
    ['The Awakening', 'जागरण'],
    ['Shadows in the Woods', 'वनछाया'],
    ['The Sacred Sanctuary', 'तीर्थस्थल'],
    ['Trial of Valor', 'शौर्य परीक्षा'],
    ['The Demon Vanguard', 'असुर व्यूह'],
    ['The Storming of Gates', 'द्वारभेदन'],
  ];
  INITIAL_LEVELS[ch] = Array.from({ length: chData?.totalLevels || 5 }).map((_, idx) => ({
    id: `c${ch}-l${idx + 1}`,
    chapterId: ch,
    levelNumber: idx + 1,
    name: titles[idx % titles.length][0],
    hindiName: titles[idx % titles.length][1],
    description: `Level ${idx + 1} of ${chData?.title || 'Chapter ' + ch}. Face mythical trials and unlock the deeper lore of the Ramayana.`,
    objective: `Complete trials and defeat the guardians of ${chData?.title || 'the realm'}.`,
    isUnlocked: false,
    isCompleted: false,
    stars: 0,
    bestScore: 0,
    completionPercent: 0,
    collectiblesFound: 0,
    totalCollectibles: 20,
    enemiesCount: 10 + idx * 3,
    checkpointCount: 3,
  }));
}

export type CheckpointType = 'sacred_temple' | 'divine_shrine' | 'ancient_statue' | 'campfire';

export interface Checkpoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type: CheckpointType;
  isActivated: boolean;
}

export type CollectibleType =
  | 'divine_coins'
  | 'sacred_orbs'
  | 'ancient_scrolls'
  | 'ramayan_relics'
  | 'power_shards';

export interface CollectibleItem {
  id: string;
  type: CollectibleType;
  name: string;
  hindiName: string;
  value: number; // Divine power or score points
  x: number;
  y: number;
  collected: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  icon: string;
  category: 'story' | 'combat' | 'collection' | 'mastery';
  isUnlocked: boolean;
  unlockedAt?: string;
  rewardText: string;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    hindiTitle: 'प्रथम पग',
    description: 'Complete your first level in the sacred journey.',
    icon: 'Footprints',
    category: 'story',
    isUnlocked: false,
    rewardText: '+100 Score & Bronze Bow Sigil',
  },
  {
    id: 'warrior',
    title: 'Warrior of Dharma',
    hindiTitle: 'धर्मयोद्धा',
    description: 'Defeat 50 demonic enemies in combat.',
    icon: 'Swords',
    category: 'combat',
    isUnlocked: false,
    rewardText: '+10% Bow Arrow Damage',
  },
  {
    id: 'divine_blessing',
    title: 'Divine Awakening',
    hindiTitle: 'दिव्य साक्षात्कार',
    description: 'Channel Divine Power for the first time in battle.',
    icon: 'Sparkles',
    category: 'mastery',
    isUnlocked: false,
    rewardText: 'Divine Duration +2 Seconds',
  },
  {
    id: 'survivor',
    title: 'Immortal Resolve',
    hindiTitle: 'अमर संकल्प',
    description: 'Complete a level without losing a single life.',
    icon: 'Shield',
    category: 'mastery',
    isUnlocked: false,
    rewardText: '+1 Max Life Bonus',
  },
  {
    id: 'master_archer',
    title: 'Master Archer',
    hindiTitle: 'धनुर्धर शिरोमणि',
    description: 'Defeat 100 demonic foes with precision arrow shots.',
    icon: 'Crosshair',
    category: 'combat',
    isUnlocked: false,
    rewardText: 'Faster Bow Charge Speed',
  },
  {
    id: 'epic_journey',
    title: 'Epic Journey',
    hindiTitle: 'महागाथा',
    description: 'Conquer all chapters and restore cosmic order.',
    icon: 'Trophy',
    category: 'story',
    isUnlocked: false,
    rewardText: 'Golden Surya Armor Skin',
  },
  {
    id: 'sacred_seeker',
    title: 'Sacred Seeker',
    hindiTitle: 'पवित्र साधक',
    description: 'Gather 30 Ramayana relics and ancient scrolls.',
    icon: 'Scroll',
    category: 'collection',
    isUnlocked: false,
    rewardText: '+20% Divine Energy from Orbs',
  },
  {
    id: 'dodge_master',
    title: 'Wind Stepper',
    hindiTitle: 'पवनवेग',
    description: 'Execute 15 evasive tactical dodges past enemy attacks.',
    icon: 'Wind',
    category: 'mastery',
    isUnlocked: false,
    rewardText: 'Reduced Dodge Cooldown',
  },
];

export interface CharacterLore {
  id: string;
  name: string;
  hindiName: string;
  title: string;
  role: 'Hero (Playable)' | 'Companion (Supporting)' | 'Main Villain' | 'Enemy Horde';
  isPlayable: boolean;
  status: 'Active' | 'Available' | 'Locked' | 'Enemy';
  description: string;
  mythologicalBackground: string;
  abilities: { name: string; desc: string }[];
  portraitColor: string;
  accentColor: string;
}

export const CHARACTERS_LORE: CharacterLore[] = [
  {
    id: 'umesh',
    name: 'Umesh',
    hindiName: 'उमेश',
    title: 'The Divine Archer of Kosala',
    role: 'Hero (Playable)',
    isPlayable: true,
    status: 'Active',
    description: 'The embodiment of righteousness, valor, and patience. Armed with the divine Kodanda bow, he protects hermits, restores Dharma, and defies the demonic empire.',
    mythologicalBackground: 'Trained in celestial warfare by the venerated Sage Vishwamitra, Umesh channels the supreme light of Lord Surya and cosmic truth.',
    abilities: [
      { name: 'Kodanda Arrow', desc: 'Fires high-velocity sanctified arrows with precise trajectory.' },
      { name: 'Surya Charged Arrow', desc: 'Charges up to release a piercing divine projectile causing explosive impact.' },
      { name: 'Divine Aura (दिव्य शक्ति)', desc: 'Activates invulnerability, HP regeneration, and radiant speed bursts.' },
      { name: 'Wind Dash / Dodge', desc: 'Swift evasive roll or leap with invulnerability frames.' },
      { name: 'Warrior Block', desc: 'Blocks incoming melee slashes and deflects arrows.' },
    ],
    portraitColor: 'from-sky-700 via-blue-900 to-indigo-950',
    accentColor: '#38bdf8',
  },
  {
    id: 'purneema',
    name: 'Purneema',
    hindiName: 'पूर्णिमा',
    title: 'The Sacred Ashram Maiden',
    role: 'Companion (Supporting)',
    isPlayable: false,
    status: 'Available',
    description: 'Devoted spiritual maiden of the forest hermitage. Her sacred prayers, herbal potions, and lotus blessings restore Umesh’s vitality and inner resolve.',
    mythologicalBackground: 'Guardian of the sacred Vedic hearth and ancient medicinal knowledge. Her presence creates divine safe zones free of demonic miasma.',
    abilities: [
      { name: 'Sacred Lotus Blessing', desc: 'Instantly replenishes 35+ Divine Energy and cleanses hero wounds.' },
      { name: 'Spiritual Sanctuary', desc: 'Protects safe sanctuaries where enemies cannot enter.' },
      { name: 'Lore of the Sages', desc: 'Provides guidance on demon vulnerabilities and ancient secrets.' },
    ],
    portraitColor: 'from-rose-700 via-red-900 to-pink-950',
    accentColor: '#fb7185',
  },
  {
    id: 'raone',
    name: 'Raone',
    hindiName: 'रावण',
    title: 'The Ten-Headed Sovereign of Lanka',
    role: 'Main Villain',
    isPlayable: false,
    status: 'Enemy',
    description: 'The supreme conqueror of the three worlds. Master of the Vedas, unrivaled scholar of celestial arts, yet consumed by unbridled ego and lust for dominion.',
    mythologicalBackground: 'Booned by Lord Brahma with near-invulnerability against gods and celestial beings. His presence shakes the very foundations of the earth.',
    abilities: [
      { name: 'Chandrahas Sword Blade', desc: 'Devastating broad sweeps of dark crescent celestial energy.' },
      { name: 'Tenfold Cosmic Gaze', desc: 'Unleashes dark cosmic thunder and ground shockwaves.' },
      { name: 'Demon King Rage', desc: 'Enters an enraged state with flaming aura and rapid teleports.' },
    ],
    portraitColor: 'from-red-950 via-neutral-900 to-amber-950',
    accentColor: '#ef4444',
  },
  {
    id: 'melee_demon',
    name: 'Rakshasa Scout (Melee)',
    hindiName: 'असुर पदिक',
    title: 'Frontline Demonic Infantry',
    role: 'Enemy Horde',
    isPlayable: false,
    status: 'Enemy',
    description: 'Fast, vicious demons armed with jagged curved blades. They roam borders seeking lone wanderers and sages.',
    mythologicalBackground: 'Born of darkness, they thrive under twilight and leap toward opponents with ferocious bloodlust.',
    abilities: [
      { name: 'Curved Blade Slash', desc: 'Fast melee attack dealing 15 damage.' },
      { name: 'Pack Sprint', desc: 'Chases the hero rapidly upon detection.' },
    ],
    portraitColor: 'from-red-900 to-neutral-900',
    accentColor: '#f87171',
  },
  {
    id: 'archer_demon',
    name: 'Rakshasa Archer',
    hindiName: 'असुर धन्वी',
    title: 'Nocturnal Snipers',
    role: 'Enemy Horde',
    isPlayable: false,
    status: 'Enemy',
    description: 'Perched upon elevated platforms and ancient stone ruins, firing poisonous dark shadow arrows from afar.',
    mythologicalBackground: 'Infused with dark shadow venom, their arrows corrupt the mind and dim righteous light.',
    abilities: [
      { name: 'Dark Shadow Arrow', desc: 'Ranged projectile with poisonous lingering trajectory.' },
      { name: 'Tactical Retreat', desc: 'Backpedals when the hero gets too close.' },
    ],
    portraitColor: 'from-purple-900 to-neutral-900',
    accentColor: '#c084fc',
  },
  {
    id: 'heavy_demon',
    name: 'Gada Rakshasa (Heavy)',
    hindiName: 'गदाधर असुर',
    title: 'Armored Demonic Juggernaut',
    role: 'Enemy Horde',
    isPlayable: false,
    status: 'Enemy',
    description: 'Massive towering brutes wielding heavy spiked clubs (Gada) and iron armor. Slow moving but colossal damage.',
    mythologicalBackground: 'Constructed from ironwood and dark enchantments, resistant to light arrows.',
    abilities: [
      { name: 'Ground Quake Smash', desc: 'Heavy overhead club slam with a wide shockwave radius.' },
      { name: 'Iron Kavach', desc: 'High physical defense; takes charged arrows to stagger.' },
    ],
    portraitColor: 'from-amber-950 to-stone-900',
    accentColor: '#fbbf24',
  },
  {
    id: 'flying_demon',
    name: 'Pakshi Rakshasa (Flying)',
    hindiName: 'गरुडद्रोही असुर',
    title: 'Winged Predator',
    role: 'Enemy Horde',
    isPlayable: false,
    status: 'Enemy',
    description: 'Bat-winged horrors swooping from the sky, spitting fire orbs and diving down upon unsuspecting warriors.',
    mythologicalBackground: 'Corrupted celestial avians who sold their devotion to the dark court of Lanka.',
    abilities: [
      { name: 'Aerial Fire Orb', desc: 'Spits molten demonic flame balls downwards.' },
      { name: 'Swoop Talon Strike', desc: 'Dives swiftly from clouds before ascending back.' },
    ],
    portraitColor: 'from-orange-950 to-neutral-900',
    accentColor: '#fb923c',
  },
  {
    id: 'elite_demon',
    name: 'Kavach Rakshasa (Elite)',
    hindiName: 'महारथी असुर',
    title: 'Golden-Armored Commander',
    role: 'Enemy Horde',
    isPlayable: false,
    status: 'Enemy',
    description: 'Trained in royal Lankan martial academies. Wields flaming dual daggers and can deflect ordinary arrows.',
    mythologicalBackground: 'Veterans of wars against celestial Gandharvas; ruthlessly disciplined and cunning.',
    abilities: [
      { name: 'Dual Flaming Slash', desc: 'Rapid two-hit combo causing heavy bleed.' },
      { name: 'Arrow Deflection', desc: 'Parries uncharged arrows with their enchanted shields.' },
    ],
    portraitColor: 'from-rose-950 to-zinc-900',
    accentColor: '#f43f5e',
  },
  {
    id: 'magical_demon',
    name: 'Mayavi Rakshasa (Magical)',
    hindiName: 'मायावी असुर',
    title: 'Illusionist Sorcerer',
    role: 'Enemy Horde',
    isPlayable: false,
    status: 'Enemy',
    description: 'Deceptive shapeshifter and sorcerer who summons dark orbs, creates illusions, and teleports when cornered.',
    mythologicalBackground: 'Masters of Asuric Maya (illusions) capable of clouding sight and striking from mist.',
    abilities: [
      { name: 'Dark Void Orb', desc: 'Homing dark energy orb that seeks the hero.' },
      { name: 'Shadow Mist Teleport', desc: 'Vanishes into dark purple smoke when struck.' },
    ],
    portraitColor: 'from-violet-950 to-black',
    accentColor: '#a855f7',
  },
];

export interface SettingsData {
  gameplay: {
    difficulty: Difficulty;
    screenShake: boolean;
    damageEffects: boolean;
    autoSave: boolean;
  };
  audio: {
    masterVolume: number; // 0 - 100
    musicVolume: number; // 0 - 100
    sfxVolume: number; // 0 - 100
    voiceVolume: number; // 0 - 100
    isMuted: boolean;
  };
  graphics: {
    quality: 'low' | 'medium' | 'high';
    particles: boolean;
    backgroundEffects: boolean;
    lighting: boolean;
  };
  controls: {
    controlType: 'keyboard' | 'mobile_touch' | 'auto';
    buttonSize: 'compact' | 'normal' | 'large';
    buttonPosition: 'standard' | 'ergonomic';
  };
  language: 'en' | 'ne' | 'hi';
  accessibility: {
    textSize: 'normal' | 'large';
    subtitles: boolean;
    highContrast: boolean;
  };
}

export const DEFAULT_SETTINGS: SettingsData = {
  gameplay: {
    difficulty: 'NORMAL',
    screenShake: true,
    damageEffects: true,
    autoSave: true,
  },
  audio: {
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 85,
    voiceVolume: 75,
    isMuted: false,
  },
  graphics: {
    quality: 'high',
    particles: true,
    backgroundEffects: true,
    lighting: true,
  },
  controls: {
    controlType: 'auto',
    buttonSize: 'normal',
    buttonPosition: 'standard',
  },
  language: 'en',
  accessibility: {
    textSize: 'normal',
    subtitles: true,
    highContrast: false,
  },
};

export interface PlayerProgression {
  level: number;
  exp: number;
  maxExp: number;
  healthUpgrades: number; // +15 max HP each
  attackUpgrades: number; // +5 arrow dmg each
  defenseUpgrades: number; // +4% damage mitigation
  speedUpgrades: number; // +5% movement speed
  divinePowerUpgrades: number; // +10 max divine or faster gain
  bowPowerUpgrades: number; // faster charge, higher velocity
  divineCoins: number;
  sacredOrbs: number;
  ancientScrolls: number;
  ramayanRelics: number;
  powerShards: number;
}

export const DEFAULT_PROGRESSION: PlayerProgression = {
  level: 1,
  exp: 0,
  maxExp: 200,
  healthUpgrades: 0,
  attackUpgrades: 0,
  defenseUpgrades: 0,
  speedUpgrades: 0,
  divinePowerUpgrades: 0,
  bowPowerUpgrades: 0,
  divineCoins: 0,
  sacredOrbs: 0,
  ancientScrolls: 0,
  ramayanRelics: 0,
  powerShards: 0,
};

export interface GameSaveData {
  version: string;
  slotId: string;
  savedAt: string;
  currentChapterId: number;
  currentLevelId: string;
  difficulty: Difficulty;
  progression: PlayerProgression;
  lives: number;
  heroHp: number;
  chapters: Chapter[];
  levels: Record<number, Level[]>;
  achievements: Achievement[];
  settings: SettingsData;
}
