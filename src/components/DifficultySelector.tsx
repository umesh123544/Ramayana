import React from 'react';
import { adminConfig, DifficultyLevel } from '../systems/adminConfig';
import { soundManager } from '../audio/soundManager';
import { Chapter } from '../data/gameData';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface DifficultyOption {
  level: DifficultyLevel;
  title: string;
  modeTag: string;
  subtitle: string;
  description: string;
  badge?: string;
  colorScheme: {
    border: string;
    activeBorder: string;
    bg: string;
    activeBg: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
  };
  stats: {
    enemyHp: string;
    enemyDmg: string;
    divineScaling: string;
    lives: number;
    arrowDmg: string;
  };
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    level: 'EASY',
    title: 'Easy',
    modeTag: 'Gentle • Story',
    subtitle: 'Novice of the Divine Bow',
    description:
      'Forgiving combat with weakened demons and abundant divine lotus grace. Recommended for players focusing on story and relaxed exploration.',
    colorScheme: {
      border: 'border-emerald-500/30',
      activeBorder: 'border-emerald-400',
      bg: 'bg-emerald-950/25',
      activeBg: 'bg-emerald-900/40',
      accent: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-300',
      glow: 'shadow-emerald-500/20',
    },
    stats: {
      enemyHp: '70% (-30%)',
      enemyDmg: '65% (-35%)',
      divineScaling: '+50% Gain',
      lives: 4,
      arrowDmg: '32 / 65',
    },
  },
  {
    level: 'NORMAL',
    title: 'Normal',
    modeTag: 'Standard • Dharma',
    subtitle: 'Canonical Journey of Dharma',
    description:
      'The balanced, canonical trial of Shri Rama’s epic. Fair enemy aggression, standard bow velocity, and authentic mythological challenge.',
    badge: 'RECOMMENDED',
    colorScheme: {
      border: 'border-amber-500/40',
      activeBorder: 'border-amber-400',
      bg: 'bg-amber-950/25',
      activeBg: 'bg-amber-900/40',
      accent: 'text-amber-400',
      badgeBg: 'bg-amber-500/20',
      badgeText: 'text-amber-300',
      glow: 'shadow-amber-500/30',
    },
    stats: {
      enemyHp: '100% (Normal)',
      enemyDmg: '100% (Standard)',
      divineScaling: '100% Normal',
      lives: 3,
      arrowDmg: '25 / 50',
    },
  },
  {
    level: 'HARD',
    title: 'Hard',
    modeTag: 'Challenging • Valor',
    subtitle: 'Trial of the Seasoned Warrior',
    description:
      'Aggressive demon commanders with punishing strikes and scarce divine aid. Requires deliberate dodging, blocking, and charged archery.',
    badge: 'VETERAN',
    colorScheme: {
      border: 'border-orange-500/35',
      activeBorder: 'border-orange-400',
      bg: 'bg-orange-950/25',
      activeBg: 'bg-orange-900/40',
      accent: 'text-orange-400',
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-300',
      glow: 'shadow-orange-500/25',
    },
    stats: {
      enemyHp: '145% (+45%)',
      enemyDmg: '140% (+40%)',
      divineScaling: '-20% Gain',
      lives: 3,
      arrowDmg: '22 / 45',
    },
  },
  {
    level: 'EPIC',
    title: 'Epic',
    modeTag: 'Master • Ordeal',
    subtitle: 'Supreme Mythological Ordeal',
    description:
      'Brutal demon hordes with immense resilience and deadly strikes. Divine grace is elusive. Only an unyielding master of Dharma can prevail.',
    badge: 'LEGENDARY',
    colorScheme: {
      border: 'border-rose-500/40',
      activeBorder: 'border-rose-400',
      bg: 'bg-rose-950/30',
      activeBg: 'bg-rose-900/45',
      accent: 'text-rose-400',
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-300',
      glow: 'shadow-rose-500/30',
    },
    stats: {
      enemyHp: '200% (2x HP)',
      enemyDmg: '185% (Near Fatal)',
      divineScaling: '-40% Gain',
      lives: 2,
      arrowDmg: '20 / 40',
    },
  },
];

interface DifficultySelectorProps {
  onBack: () => void;
  onConfirmStart: (selectedDiff: DifficultyLevel) => void;
  selectedChapter?: Chapter;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  onBack,
  onConfirmStart,
  selectedChapter,
}) => {
  const visibleOptions = DIFFICULTY_OPTIONS.filter(
    (opt) => opt.level === 'EASY' || opt.level === 'NORMAL'
  );

  const handlePick = (level: DifficultyLevel) => {
    soundManager.play('checkpoint');
    soundManager.play('templeBell');
    adminConfig.setDifficulty(level);
    onConfirmStart(level);
  };

  return (
    <div
      id="difficulty-selector-screen"
      className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-neutral-950/92 backdrop-blur-xl text-neutral-100 overflow-y-auto animate-fadeIn select-none"
    >
      {/* Background Mythological Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Bar / Header */}
      <header className="relative w-full max-w-2xl flex items-center justify-between z-10 pb-3 tall:pb-4">
        <button
          id="difficulty-back-btn"
          onClick={() => {
            soundManager.play('uiClick');
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-700 hover:border-amber-500/40 transition-all cursor-pointer group text-xs sm:text-sm font-semibold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {selectedChapter && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Chapter {selectedChapter.id}: {selectedChapter.title}</span>
          </div>
        )}
      </header>

      <h1 className="relative z-10 text-lg tall:text-2xl font-extrabold text-amber-200 tracking-wider font-['Cinzel'] mb-3 tall:mb-6 text-center">
        CHOOSE YOUR DIFFICULTY
      </h1>

      {/* Two-card grid - tap a card to jump straight into the game */}
      <main className="relative w-full max-w-2xl z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 tall:gap-4">
        {visibleOptions.map((opt) => {
          const cs = opt.colorScheme;
          return (
            <button
              key={opt.level}
              id={`difficulty-card-${opt.level.toLowerCase()}`}
              onClick={() => handlePick(opt.level)}
              className={`relative flex flex-col items-center justify-center gap-1.5 p-5 tall:p-8 rounded-2xl border transition-all duration-200 cursor-pointer text-center ${cs.border} ${cs.bg} hover:brightness-110 hover:scale-[1.02] shadow-lg hover:shadow-xl ${cs.glow} active:scale-[0.98]`}
            >
              {opt.badge && (
                <span
                  className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/40 ${cs.badgeBg} ${cs.badgeText}`}
                >
                  {opt.badge}
                </span>
              )}
              <h2 className={`text-2xl tall:text-3xl font-bold font-['Cinzel'] tracking-wide ${cs.accent}`}>
                {opt.title}
              </h2>
              <span className="text-[10px] tall:text-xs font-mono tracking-wider font-semibold text-neutral-400 uppercase">
                {opt.modeTag}
              </span>
            </button>
          );
        })}
      </main>
    </div>
  );
};
