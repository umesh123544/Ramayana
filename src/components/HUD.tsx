import React from 'react';
import { HeroState } from '../types';
import {
  Heart,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Settings,
  Menu,
  BookOpen,
  Gamepad2,
  MapPin,
  Layers,
} from 'lucide-react';
import { adminConfig } from '../systems/adminConfig';
import { CHAPTER_THEMES } from '../data/chapterThemes';
import { PWAInstallButton } from './PWAInstallButton';

interface HUDProps {
  hero: HeroState;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPipelineModal: () => void;
  onOpenAdminModal: () => void;
  onOpenMainMenu?: () => void;
  onOpenChapters?: () => void;
  onOpenDifficulty?: () => void;
  currentChapterId?: number;
  showControls?: boolean;
  onToggleControls?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  hero,
  isMuted,
  onToggleMute,
  onOpenPipelineModal,
  onOpenAdminModal,
  onOpenMainMenu,
  onOpenChapters,
  onOpenDifficulty,
  currentChapterId = 1,
  showControls = true,
  onToggleControls,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
  const divinePercent = Math.max(0, Math.min(100, hero.divinePower));
  const canActivateDivine = hero.divinePower >= 40 && hero.divineCooldown <= 0;
  const heroName = adminConfig.get().hero.name || 'Umesh';
  const currentChapter = CHAPTER_THEMES[currentChapterId] || CHAPTER_THEMES[1];
  const currentDifficulty = adminConfig.getDifficulty();

  return (
    <header className="absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-4 pointer-events-none z-20 select-none">
      <div className="flex flex-col gap-1.5 max-w-7xl mx-auto">
        {/* Main Top Navigation Row */}
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          {/* ================= TOP LEFT: Lives & HP Bar ================= */}
          <div className="flex flex-col gap-1 sm:gap-1.5 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-xl border border-amber-500/30 shadow-lg pointer-events-auto min-w-[130px] sm:min-w-[190px] md:min-w-[220px] shrink-0">
            {/* Lives Counter */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm font-semibold text-neutral-200">
              <span className="flex items-center gap-1 text-red-400">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-red-500 text-red-500 animate-pulse" />
                <span className="hidden sm:inline">Lives:</span>
              </span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {Array.from({ length: hero.maxLives }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${
                      i < hero.lives
                        ? 'fill-red-500 text-red-500 scale-105'
                        : 'fill-neutral-700 text-neutral-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Health Bar */}
            <div className="w-full">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-neutral-300 mb-0.5 sm:mb-1">
                <span className="text-emerald-400 font-semibold">HP</span>
                <span className="font-bold text-neutral-100">
                  {Math.round(hero.hp)} / {hero.maxHp}
                </span>
              </div>
              <div className="w-full h-2 sm:h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-700/60 p-0.5 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    hpPercent > 50
                      ? 'bg-gradient-to-r from-emerald-600 to-green-400'
                      : hpPercent > 25
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-400'
                      : 'bg-gradient-to-r from-red-700 to-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* ================= TOP CENTER: Chapter Badge & 1-Click Access ================= */}
          <div className="flex flex-col items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-amber-500/40 shadow-lg pointer-events-auto shrink min-w-0">
            {/* Chapter Location & Name */}
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs sm:text-sm tracking-wide">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">
                Ch {currentChapter.id}: {currentChapter.name} ({currentChapter.hindiName})
              </span>
            </div>

            {/* 1-Click Quick Selectors: CHAPTERS & LEVEL MODE & INSTALL */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
              {/* 1-Click Chapter Selection */}
              {onOpenChapters && (
                <button
                  id="hud-one-click-chapters-btn"
                  onClick={onOpenChapters}
                  className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-[10px] sm:text-xs font-bold font-mono tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm"
                  title="Open Chapter Selection in 1-Click (अध्याय छनोट)"
                >
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>CHAPTERS</span>
                </button>
              )}

              {/* 1-Click Level Mode (Difficulty) */}
              {onOpenDifficulty && (
                <button
                  id="hud-one-click-level-mode-btn"
                  onClick={onOpenDifficulty}
                  className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-[10px] sm:text-xs font-bold font-mono tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm"
                  title="Open Level Mode / Difficulty in 1-Click (तह / कठिनाई छनोट)"
                >
                  <Sliders className="w-3 h-3 text-amber-400" />
                  <span>LEVEL: {currentDifficulty}</span>
                </button>
              )}

              {/* PWA Install Button */}
              <PWAInstallButton />
            </div>
          </div>

          {/* ================= TOP RIGHT: Divine Meter & Menu Controls ================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
            {/* Divine Power Meter */}
            <div className="flex flex-col gap-0.5 sm:gap-1 bg-neutral-900/90 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-amber-500/30 shadow-lg min-w-[85px] sm:min-w-[125px] md:min-w-[150px]">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold">
                <span className="flex items-center gap-0.5 sm:gap-1 text-amber-400">
                  <Zap
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                      canActivateDivine
                        ? 'text-amber-300 fill-amber-300 animate-bounce'
                        : 'text-amber-500'
                    }`}
                  />
                  <span className="hidden sm:inline">Divine</span>
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-200">
                  {Math.round(divinePercent)}%
                </span>
              </div>

              <div className="w-full h-2 sm:h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-700/60 p-0.5 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    canActivateDivine
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                      : 'bg-gradient-to-r from-amber-700 to-yellow-600'
                  }`}
                  style={{ width: `${divinePercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons: Menu, Mobile Controls, Settings, Sound */}
            <div className="flex sm:flex-col gap-1 sm:gap-1.5">
              {/* Main Menu Button */}
              {onOpenMainMenu && (
                <button
                  id="main-menu-toggle-btn"
                  onClick={onOpenMainMenu}
                  title="Main Menu (मेन्यू)"
                  className="p-1.5 sm:p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow transition-all cursor-pointer flex items-center justify-center active:scale-95"
                >
                  <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                </button>
              )}

              {/* Mobile Controls Toggle Button */}
              {onToggleControls && (
                <button
                  id="hud-toggle-controls-btn"
                  onClick={onToggleControls}
                  title={showControls ? 'Hide Touch Controls' : 'Show Touch Controls (मोबाइल कन्ट्रोल)'}
                  className={`p-1.5 sm:p-2 rounded-xl border shadow transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                    showControls
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Admin Panel Button */}
              <button
                id="admin-panel-toggle-btn"
                onClick={onOpenAdminModal}
                title="Admin Panel & Customizer (एडमिन प्यानल)"
                className="p-1.5 sm:p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 shadow transition-all cursor-pointer flex items-center justify-center active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              </button>

              {/* Sound Toggle */}
              <button
                id="sound-toggle-btn"
                onClick={onToggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                className="p-1.5 sm:p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 shadow transition-colors cursor-pointer active:scale-95"
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
