import React, { useState } from 'react';
import { adminConfig, DifficultyLevel } from '../systems/adminConfig';
import { soundManager } from '../audio/soundManager';
import { Chapter } from '../data/gameData';
import {
  Shield,
  Zap,
  Heart,
  ArrowLeft,
  Sparkles,
  Flame,
  Check,
  Crosshair,
  Award,
  Sun,
  Crown,
  BookOpen,
} from 'lucide-react';

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
  const currentConfig = adminConfig.get();
  const [selected, setSelected] = useState<DifficultyLevel>(
    currentConfig.difficulty || 'NORMAL'
  );

  const selectedOpt =
    DIFFICULTY_OPTIONS.find((opt) => opt.level === selected) || DIFFICULTY_OPTIONS[1];

  const handleSelectDifficulty = (level: DifficultyLevel) => {
    setSelected(level);
    soundManager.play('menuHover');
    // Pre-sync adminConfig so preview or live changes update
    adminConfig.setDifficulty(level);
  };

  const handleStartGame = () => {
    soundManager.play('checkpoint');
    soundManager.play('templeBell');
    adminConfig.setDifficulty(selected);
    onConfirmStart(selected);
  };

  return (
    <div
      id="difficulty-selector-screen"
      className="absolute inset-0 z-40 flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 bg-neutral-950/92 backdrop-blur-xl text-neutral-100 overflow-y-auto animate-fadeIn select-none"
    >
      {/* Background Mythological Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Bar / Header */}
      <header className="relative w-full max-w-5xl flex items-center justify-between z-10 pt-2 pb-4 border-b border-amber-500/20">
        <button
          id="difficulty-back-btn"
          onClick={() => {
            soundManager.play('uiClick');
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-700 hover:border-amber-500/40 transition-all cursor-pointer group text-xs sm:text-sm font-semibold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Menu</span>
        </button>

        <div className="flex flex-col items-center text-center">
          {selectedChapter ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono mb-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Chapter {selectedChapter.id}: {selectedChapter.title}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-bold tracking-widest uppercase">
              <Sun className="w-4 h-4 animate-spin-slow text-amber-400" />
              <span>Trial of Dharma</span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-200 tracking-wider font-['Cinzel'] mt-0.5">
            CHOOSE YOUR DIFFICULTY
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-neutral-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Dynamic Scaling Active</span>
        </div>
      </header>

      {/* Main 4-Card Grid */}
      <main className="relative w-full max-w-5xl my-auto py-4 sm:py-6 z-10 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const isCurrent = selected === opt.level;
            const cs = opt.colorScheme;

            return (
              <div
                key={opt.level}
                id={`difficulty-card-${opt.level.toLowerCase()}`}
                onClick={() => handleSelectDifficulty(opt.level)}
                className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-left ${
                  isCurrent
                    ? `${cs.activeBorder} ${cs.activeBg} shadow-xl ${cs.glow} scale-[1.02] ring-2 ring-amber-400/40`
                    : `${cs.border} ${cs.bg} hover:border-neutral-500 hover:bg-neutral-900/60`
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs font-mono tracking-wider font-semibold text-neutral-400 uppercase">
                    {opt.modeTag}
                  </span>
                  {opt.badge && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/40 ${cs.badgeBg} ${cs.badgeText}`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-xl sm:text-2xl font-bold font-['Cinzel'] tracking-wide ${cs.accent}`}>
                      {opt.title}
                    </h2>
                    {isCurrent && (
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-300 font-medium mt-0.5">
                    {opt.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-300/90 leading-relaxed my-3 line-clamp-3">
                  {opt.description}
                </p>

                {/* Quick Stat Highlights */}
                <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Flame className="w-3 h-3 text-red-400" />
                      <span>Enemy HP:</span>
                    </span>
                    <span className="font-semibold">{opt.stats.enemyHp}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Crosshair className="w-3 h-3 text-amber-400" />
                      <span>Enemy Dmg:</span>
                    </span>
                    <span className="font-semibold">{opt.stats.enemyDmg}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>Divine Favor:</span>
                    </span>
                    <span className={`font-semibold ${cs.accent}`}>{opt.stats.divineScaling}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Heart className="w-3 h-3 text-rose-400" />
                      <span>Starting Lives:</span>
                    </span>
                    <span className="font-semibold text-neutral-100">{opt.stats.lives} Lives</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Stat Comparison & Detailed Breakdown Banner */}
        <section className="bg-neutral-900/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-100">Selected Trial:</span>
                <span className={`text-base font-extrabold uppercase font-['Cinzel'] ${selectedOpt.colorScheme.accent}`}>
                  {selectedOpt.title} • {selectedOpt.subtitle}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 max-w-xl">
                {selectedOpt.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="hidden lg:flex flex-col text-right text-xs font-mono text-neutral-400 pr-3 border-r border-neutral-700">
              <span>Arrow Base DMG: <b className="text-amber-300">{selectedOpt.stats.arrowDmg}</b></span>
              <span>Divine Lotus Power: <b className="text-amber-300">{selectedOpt.stats.divineScaling}</b></span>
            </div>

            <button
              id="confirm-start-game-btn"
              onClick={handleStartGame}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-extrabold tracking-wider uppercase text-sm font-['Cinzel'] shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{selectedChapter ? `BEGIN CHAPTER ${selectedChapter.id}` : 'BEGIN YOUR JOURNEY'}</span>
              <Sparkles className="w-4 h-4 text-neutral-950 fill-neutral-950" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer hint */}
      <footer className="relative w-full max-w-5xl z-10 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Difficulty dynamically updates adminConfig enemy stats & divine power multipliers</span>
        </span>
        <span className="hidden sm:inline text-neutral-500">
          Settings persist across respawns & checkpoints
        </span>
      </footer>
    </div>
  );
};
