import React, { useState, useEffect } from 'react';
import { Chapter, INITIAL_CHAPTERS } from '../data/gameData';
import { saveSystem } from '../data/saveSystem';
import { soundManager } from '../audio/soundManager';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Play,
  CheckCircle2,
  Sparkles,
  Sun,
  Shield,
  Compass,
  Swords,
  Crown,
  Trees,
  ShieldAlert,
  Flower2,
  Flame,
  Mountain,
  Waves,
  Castle,
  Key,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface ChapterSelectionProps {
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
  initialChapterId?: number;
}

// Map chapter icons to Lucide components
const CHAPTER_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Crown: Crown,
  Trees: Trees,
  ShieldAlert: ShieldAlert,
  Flower2: Flower2,
  Flame: Flame,
  Mountain: Mountain,
  Waves: Waves,
  Castle: Castle,
  Swords: Swords,
  Sparkles: Sparkles,
};

// Lore extensions for each chapter
interface ChapterExtendedLore {
  epicSanskrit: string;
  antagonist: string;
  sacredWeapon: string;
  dharmaLesson: string;
}

const CHAPTER_EXTENDED_LORE: Record<number, ChapterExtendedLore> = {
  1: {
    epicSanskrit: 'बालकाण्ड • अयोध्या वैभव',
    antagonist: 'Border Rakshasa Marauders',
    sacredWeapon: 'Kodanda Divine Bow',
    dharmaLesson: 'Mastery of mind, humility before sages, and righteousness in royalty.',
  },
  2: {
    epicSanskrit: 'अयोध्या काण्ड • त्याग व तप',
    antagonist: 'Primeval Wilderness Predators',
    sacredWeapon: 'Hermit Birch Staff & Arrows',
    dharmaLesson: 'Fulfilling filial duty without bitterness, embracing simplicity.',
  },
  3: {
    epicSanskrit: 'अरण्य काण्ड • असुर वध',
    antagonist: 'Khara, Dushana & Demon War-Bands',
    sacredWeapon: 'Agneyastra (Fire Arrow)',
    dharmaLesson: 'Protecting the vulnerable hermits and standing unwavering against cruelty.',
  },
  4: {
    epicSanskrit: 'पञ्चवटी • स्वर्णमृग माया',
    antagonist: 'Maricha the Illusionary Deer',
    sacredWeapon: 'Piercing Suryastra',
    dharmaLesson: 'Vigilance against alluring illusions that distract from truth.',
  },
  5: {
    epicSanskrit: 'सीता हरण • विरह व संकल्प',
    antagonist: 'Raone (Disguised Ascetic)',
    sacredWeapon: 'Divya Baan of Vengeance',
    dharmaLesson: 'Unshakable devotion and grief forged into unyielding resolve.',
  },
  6: {
    epicSanskrit: 'किष्किन्धा काण्ड • वानर मैत्री',
    antagonist: 'Unchecked Wrath of Vali',
    sacredWeapon: 'Seven Sal Trees Arrow',
    dharmaLesson: 'The power of sacred friendship, humility, and restoring justice.',
  },
  7: {
    epicSanskrit: 'सुन्दर काण्ड • सेतु बन्धन',
    antagonist: 'Varuna Sea Tempests & Sea Monsters',
    sacredWeapon: 'Consecrated Floating Shilas',
    dharmaLesson: 'Faith can make heavy stones float; unified purpose crosses any ocean.',
  },
  8: {
    epicSanskrit: 'युद्ध काण्ड • लंका प्रवेश',
    antagonist: 'Lanka Citadel Gatekeepers',
    sacredWeapon: 'Varunastra & Golden Spear',
    dharmaLesson: 'Penetrating the most fortified ego with purity of intention.',
  },
  9: {
    epicSanskrit: 'महासंग्राम • कुम्भकर्ण-इन्द्रजीत वध',
    antagonist: 'Kumbhakarna & Indrajit (Meghnada)',
    sacredWeapon: 'Aindra & Pashupatastra',
    dharmaLesson: 'Dark sorcery falls before unwavering cosmic truth.',
  },
  10: {
    epicSanskrit: 'अन्तिम युद्ध • रावण संहार',
    antagonist: 'Ten-Headed Demon King Raone (दशानन)',
    sacredWeapon: 'Brahmastra (Supreme Celestial Arrow)',
    dharmaLesson: 'The eternal triumph of Dharma: Truth alone triumphs, not falsehood.',
  },
};

export const ChapterSelection: React.FC<ChapterSelectionProps> = ({
  onBack,
  onSelectChapter,
  initialChapterId = 1,
}) => {
  // Load chapters with strict sequential gating:
  // Chapter 1 is unlocked.
  // Chapter 2 only unlocks after Chapter 1 is beaten (saveSystem.isChapterUnlocked(2)).
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const rawChapters = JSON.parse(JSON.stringify(INITIAL_CHAPTERS)) as Chapter[];
    return rawChapters.map((c) => ({
      ...c,
      isUnlocked: saveSystem.isChapterUnlocked(c.id),
    }));
  });

  const [selectedId, setSelectedId] = useState<number>(initialChapterId);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [allUnlockedCheat, setAllUnlockedCheat] = useState<boolean>(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // Sync with saveSystem on mount
  useEffect(() => {
    const rawChapters = JSON.parse(JSON.stringify(INITIAL_CHAPTERS)) as Chapter[];
    setChapters(
      rawChapters.map((c) => ({
        ...c,
        isUnlocked: saveSystem.isChapterUnlocked(c.id),
      }))
    );
  }, []);

  const selectedChapter = chapters.find((c) => c.id === selectedId) || chapters[0];
  const lore = CHAPTER_EXTENDED_LORE[selectedChapter.id] || CHAPTER_EXTENDED_LORE[1];
  const isSelectedUnlocked = selectedChapter.isUnlocked || allUnlockedCheat;

  const unlockedCount = chapters.filter((c) => c.isUnlocked || allUnlockedCheat).length;

  const handleSelectCard = (ch: Chapter) => {
    const isUnlocked = ch.isUnlocked || allUnlockedCheat;
    setSelectedId(ch.id);

    if (!isUnlocked) {
      soundManager.play('uiClick');
      setLockedNotice(
        `अध्याय ${ch.id} बन्द छ! अनलक गर्न पहिले अध्याय ${ch.id - 1} पूरा गर्नुहोस्। (Chapter ${ch.id} is locked! Defeat Chapter ${ch.id - 1} first to unlock.)`
      );
      setTimeout(() => {
        setLockedNotice(null);
      }, 4000);
      return;
    }

    soundManager.play('menuHover');
    setLockedNotice(null);
  };

  const handle1ClickPlay = (ch: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    const isUnlocked = ch.isUnlocked || allUnlockedCheat;
    if (!isUnlocked) {
      soundManager.play('uiClick');
      setLockedNotice(
        `अध्याय ${ch.id} बन्द छ! पहिले अध्याय ${ch.id - 1} पूरा गर्नुहोस्।`
      );
      setTimeout(() => setLockedNotice(null), 3500);
      return;
    }

    soundManager.play('checkpoint');
    soundManager.play('templeBell');
    onSelectChapter(ch);
  };

  const handleToggleUnlockAll = () => {
    soundManager.play('uiClick');
    soundManager.play('checkpoint');
    setAllUnlockedCheat((prev) => !prev);
  };

  const handleToggleSingleUnlock = (e: React.MouseEvent, chId: number) => {
    e.stopPropagation();
    soundManager.play('uiClick');

    setChapters((prev) => {
      const next = prev.map((c) => (c.id === chId ? { ...c, isUnlocked: !c.isUnlocked } : c));
      return next;
    });
  };

  const handleEmbark = () => {
    if (!isSelectedUnlocked) {
      soundManager.play('uiClick');
      setLockedNotice(
        `अध्याय ${selectedChapter.id} बन्द छ! पहिले अध्याय ${selectedChapter.id - 1} जित्नुहोस्।`
      );
      setTimeout(() => setLockedNotice(null), 3500);
      return;
    }
    soundManager.play('checkpoint');
    soundManager.play('templeBell');
    onSelectChapter(selectedChapter);
  };

  const filteredChapters = chapters.filter((ch) => {
    const unlocked = ch.isUnlocked || allUnlockedCheat;
    if (filter === 'unlocked') return unlocked;
    if (filter === 'locked') return !unlocked;
    return true;
  });

  return (
    <div
      id="chapter-selection-screen"
      className="absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 md:p-7 bg-neutral-950/95 backdrop-blur-xl text-neutral-100 overflow-y-auto animate-fadeIn select-none"
    >
      {/* Background Mythological Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 -z-10">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-amber-600/30 blur-[120px]" />
        <div className="absolute top-1/2 -right-48 w-[600px] h-[600px] rounded-full bg-rose-600/25 blur-[140px]" />
        <div className="absolute -bottom-48 left-1/3 w-[500px] h-[500px] rounded-full bg-orange-600/20 blur-[130px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-amber-500/20 z-10">
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <button
            id="chapter-back-to-menu-btn"
            onClick={() => {
              soundManager.play('uiClick');
              onBack();
            }}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-700 hover:border-amber-500/40 transition-all cursor-pointer group text-xs sm:text-sm font-semibold active:scale-95 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Menu</span>
          </button>

          <div className="flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{unlockedCount}/10 Unlocked</span>
          </div>
        </div>

        {/* Center Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold tracking-widest uppercase">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>RAMAYANA CHRONICLES • अध्याय संग्रह</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-200 tracking-wider font-['Cinzel'] mt-0.5">
            CHOOSE YOUR CHAPTER
          </h1>
        </div>

        {/* Right Tools: Filter chips & Dev Unlock Cheat */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Quick Filter tabs */}
          <div className="flex items-center bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => {
                soundManager.play('uiClick');
                setFilter('all');
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                filter === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All (10)
            </button>
            <button
              onClick={() => {
                soundManager.play('uiClick');
                setFilter('unlocked');
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                filter === 'unlocked'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => {
                soundManager.play('uiClick');
                setFilter('locked');
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                filter === 'locked'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Locked ({10 - unlockedCount})
            </button>
          </div>

          {/* Unlock All Cheat Toggle */}
          <button
            id="toggle-all-chapters-cheat-btn"
            onClick={handleToggleUnlockAll}
            title="Toggle All Chapters Unlocked"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer active:scale-95 ${
              allUnlockedCheat
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-amber-300'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {allUnlockedCheat ? 'All Unlocked' : 'Unlock All'}
            </span>
          </button>
        </div>
      </header>

      {/* Locked Notice Alert Banner */}
      {lockedNotice && (
        <div className="relative w-full max-w-2xl mx-auto my-1.5 z-20 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs sm:text-sm font-semibold shadow-lg text-center">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
            <span>{lockedNotice}</span>
          </div>
        </div>
      )}

      {/* Main 10-Chapter Grid Section */}
      <main className="relative w-full max-w-7xl mx-auto my-auto py-3 sm:py-4 z-10 flex flex-col gap-4">
        {/* Responsive Grid of 10 Chapters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {filteredChapters.map((ch) => {
            const isSelected = selectedId === ch.id;
            const isUnlocked = ch.isUnlocked || allUnlockedCheat;
            const IconComponent = CHAPTER_ICON_MAP[ch.icon] || Sparkles;

            return (
              <div
                key={ch.id}
                id={`chapter-card-${ch.id}`}
                onClick={() => handleSelectCard(ch)}
                className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-250 cursor-pointer text-left group overflow-hidden ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-b from-amber-950/40 to-neutral-900/90 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/50 scale-[1.02]'
                    : isUnlocked
                    ? 'border-amber-500/30 bg-neutral-900/70 hover:border-amber-500/60 hover:bg-neutral-900/90'
                    : 'border-neutral-800/80 bg-neutral-950/80 opacity-60 hover:opacity-80 hover:border-neutral-700'
                }`}
              >
                {/* Top Chapter Tag & Lock Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isUnlocked ? ch.accentColor : '#525252' }}
                    />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-neutral-400">
                      CH. {ch.id < 10 ? `0${ch.id}` : ch.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Lock / Unlock status pill */}
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                        <Unlock className="w-2.5 h-2.5" />
                        <span>OPEN</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-red-950/50 border border-red-500/40 text-red-400">
                        <Lock className="w-2.5 h-2.5" />
                        <span>LOCKED</span>
                      </span>
                    )}

                    {/* Single chapter cheat toggle */}
                    <button
                      onClick={(e) => handleToggleSingleUnlock(e, ch.id)}
                      title={isUnlocked ? 'Lock chapter' : 'Unlock chapter'}
                      className="p-1 rounded text-neutral-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Chapter Title & Sanskrit Heading */}
                <div className="my-1">
                  <div className="text-[11px] font-semibold text-amber-400/90 font-mono tracking-wide">
                    {ch.hindiTitle}
                  </div>
                  <h3 className="text-base font-bold text-neutral-100 font-['Cinzel'] tracking-wide leading-snug group-hover:text-amber-200 transition-colors">
                    {ch.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">{ch.location}</p>
                </div>

                {/* Bottom Stats & 1-Click Play Action */}
                <div className="pt-2 mt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <IconComponent className="w-3.5 h-3.5 text-amber-400" />
                    <span>{ch.totalLevels} Stages</span>
                  </div>

                  {isUnlocked ? (
                    <button
                      id={`play-chapter-1click-${ch.id}`}
                      onClick={(e) => handle1ClickPlay(ch, e)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-[11px] shadow active:scale-95 transition-all cursor-pointer"
                      title={`Play Chapter ${ch.id} (१ क्लिकमा सुरु)`}
                    >
                      <Play className="w-3 h-3 fill-neutral-950 stroke-neutral-950" />
                      <span>PLAY</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-amber-500/70 font-sans">
                      <Lock className="w-3 h-3 text-red-400" />
                      <span>Beat Ch.{ch.id - 1}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Chapter Expanded Overview Banner */}
        <section
          id="selected-chapter-overview-panel"
          className="bg-neutral-900/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
        >
          {/* Left: Lore & Specifications */}
          <div className="flex items-start gap-4 max-w-3xl">
            <div
              className="p-3.5 rounded-2xl border shrink-0 flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${selectedChapter.accentColor}15`,
                borderColor: `${selectedChapter.accentColor}50`,
                color: selectedChapter.accentColor,
              }}
            >
              {(() => {
                const SelectedIcon = CHAPTER_ICON_MAP[selectedChapter.icon] || Crown;
                return <SelectedIcon className="w-8 h-8" />;
              })()}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Chapter {selectedChapter.id} of 10
                </span>
                <span className="text-sm font-semibold text-neutral-300 font-mono">
                  {lore.epicSanskrit}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  • {selectedChapter.location}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-amber-100 font-['Cinzel'] tracking-wide">
                {selectedChapter.title} ({selectedChapter.hindiTitle})
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed max-w-2xl mt-0.5">
                {selectedChapter.description}
              </p>

              {/* Extended Mythological Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-neutral-800 text-[11px] font-mono text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-neutral-400">Chief Nemesis:</span>
                  <span className="font-semibold text-neutral-200 truncate">{lore.antagonist}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-neutral-400">Sacred Astra:</span>
                  <span className="font-semibold text-amber-300 truncate">{lore.sacredWeapon}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-neutral-400">Dharma Creed:</span>
                  <span className="font-semibold text-neutral-200 truncate">{lore.dharmaLesson}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 w-full lg:w-auto shrink-0">
            {isSelectedUnlocked ? (
              <button
                id="embark-selected-chapter-btn"
                onClick={handleEmbark}
                className="w-full sm:w-auto lg:w-64 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-sm tracking-widest uppercase font-['Cinzel'] shadow-xl shadow-amber-600/30 hover:shadow-amber-500/50 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <Play className="w-4 h-4 fill-neutral-950 stroke-neutral-950" />
                <span>EMBARK ON CHAPTER {selectedChapter.id}</span>
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 w-full sm:w-auto lg:w-64">
                <button
                  id="locked-chapter-prompt-btn"
                  onClick={() => {
                    soundManager.play('uiClick');
                    setLockedNotice(
                      `अध्याय ${selectedChapter.id} बन्द छ! अनलक गर्न पहिले अध्याय ${selectedChapter.id - 1} पूरा गर्नुहोस्।`
                    );
                    setTimeout(() => setLockedNotice(null), 3500);
                  }}
                  className="w-full px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-amber-300 font-bold text-xs tracking-wider uppercase font-['Cinzel'] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>Sealed (लक गरिएको)</span>
                </button>
                <span className="text-[10px] text-center text-amber-400/90 font-mono">
                  Requires defeating Chapter {selectedChapter.id - 1} first
                </span>
              </div>
            )}

            <div className="text-[11px] font-mono text-neutral-400 text-center lg:text-right">
              <span>{selectedChapter.totalLevels} stages • Sequential Progression</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer info bar */}
      <footer className="relative w-full max-w-7xl mx-auto z-10 pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 font-mono gap-1.5">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Each chapter unlocks sequentially upon defeating the prior chapter's boss</span>
        </div>
        <div className="flex items-center gap-3 text-neutral-400">
          <span>Click any card to inspect lore</span>
          <span>•</span>
          <span className="text-amber-400">Esc to return</span>
        </div>
      </footer>
    </div>
  );
};
