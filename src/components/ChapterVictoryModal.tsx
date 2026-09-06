import React from 'react';
import { Trophy, ChevronRight, ListOrdered, Home, Sparkles, ShieldCheck } from 'lucide-react';
import { CHAPTER_THEMES } from '../data/chapterThemes';

interface ChapterVictoryModalProps {
  completedChapterId: number;
  nextChapterId: number | null;
  onProceedNextChapter: (nextId: number) => void;
  onOpenChapterSelect: () => void;
  onReturnToMainMenu: () => void;
}

export const ChapterVictoryModal: React.FC<ChapterVictoryModalProps> = ({
  completedChapterId,
  nextChapterId,
  onProceedNextChapter,
  onOpenChapterSelect,
  onReturnToMainMenu,
}) => {
  const currentTheme = CHAPTER_THEMES[completedChapterId] || CHAPTER_THEMES[1];
  const nextTheme = nextChapterId ? CHAPTER_THEMES[nextChapterId] : null;

  return (
    <div
      id="chapter-victory-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-amber-500/70 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-600/20 text-center flex flex-col items-center">
        {/* Glow Halo */}
        <div className="absolute -top-12 w-24 h-24 rounded-full bg-amber-500/30 blur-2xl pointer-events-none" />

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black mb-4 shadow-lg shadow-amber-500/40">
          <Trophy className="w-9 h-9" />
        </div>

        {/* Sanskrit & English Title */}
        <div className="text-amber-400 font-serif text-sm tracking-widest uppercase mb-1">
          अध्याय विजय • Chapter Conquered
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
          {currentTheme.name} ({currentTheme.hindiName})
        </h2>
        <p className="text-neutral-400 text-xs sm:text-sm mb-6 max-w-sm">
          {currentTheme.boss.name} has been vanquished. Dharma shines bright once more upon this sacred realm!
        </p>

        {/* Defeated Boss Card */}
        <div className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 mb-5 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Defeated Boss</div>
              <div className="text-sm font-semibold text-white">
                {currentTheme.boss.name} ({currentTheme.boss.hindiName})
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-md">
            VICTORIOUS
          </span>
        </div>

        {/* Next Chapter Unlocked Banner */}
        {nextTheme ? (
          <div className="w-full bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border border-amber-500/50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Next Chapter Unlocked (अर्को अध्याय खुल्यो)</span>
            </div>
            <div className="text-base font-bold text-white">
              Chapter {nextTheme.id}: {nextTheme.name} ({nextTheme.hindiName})
            </div>
            <div className="text-xs text-amber-200/80 mt-0.5">
              Next Boss: {nextTheme.boss.name} — {nextTheme.boss.title}
            </div>
          </div>
        ) : (
          <div className="w-full bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 mb-6">
            <div className="text-emerald-400 font-bold text-base">
              🎉 सम्पुर्ण रामायण यात्रा सम्पन्न! All Chapters Conquered!
            </div>
            <div className="text-xs text-neutral-300 mt-1">
              You have defeated the Ten-Headed Emperor Raone and restored cosmic balance to the universe!
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {nextTheme && (
            <button
              id="proceed-next-chapter-btn"
              onClick={() => onProceedNextChapter(nextTheme.id)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all text-sm sm:text-base cursor-pointer"
            >
              <span>PROCEED TO CHAPTER {nextTheme.id} (अर्को अध्याय सुरु)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div className="flex gap-2 w-full">
            <button
              id="chapter-select-from-victory-btn"
              onClick={onOpenChapterSelect}
              className="flex-1 py-3 px-3 bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-white font-medium rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all text-xs sm:text-sm cursor-pointer"
            >
              <ListOrdered className="w-4 h-4 text-amber-400" />
              <span>CHAPTERS (अध्याय सूची)</span>
            </button>

            <button
              id="main-menu-from-victory-btn"
              onClick={onReturnToMainMenu}
              className="flex-1 py-3 px-3 bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-white font-medium rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-all text-xs sm:text-sm cursor-pointer"
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
