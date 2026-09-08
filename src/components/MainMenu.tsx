import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../audio/soundManager';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Play,
  RotateCcw,
  BookOpen,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Shield,
  ChevronRight,
  X,
  Swords,
  Heart,
  Zap,
  Sliders,
} from 'lucide-react';

interface MainMenuProps {
  onNewGame: () => void;
  onResumeGame?: () => void;
  onOpenSettings: () => void;
  onOpenChapters?: () => void;
  onOpenDifficulty?: () => void;
  isGameActive: boolean;
}

interface ChapterInfo {
  number: number;
  title: string;
  desc: string;
  status: 'unlocked' | 'locked';
}

const RAMAYANA_CHAPTERS: ChapterInfo[] = [
  {
    number: 1,
    title: 'The Sacred Hermitage of Ayodhya',
    desc: 'The peaceful beginnings along the Sarayu river, bow training, and the blessings of the sages.',
    status: 'unlocked',
  },
  {
    number: 2,
    title: 'Dandakaranya Forest & The Dark Shadows',
    desc: 'Venture deep into the mystical primeval forest where demon sentries prowl beneath giant trees.',
    status: 'unlocked',
  },
  {
    number: 3,
    title: 'Panchavati & The Golden Deer',
    desc: 'The serene ashram at Panchavati where illusionary creatures test the warrior’s vigilance.',
    status: 'locked',
  },
  {
    number: 4,
    title: 'Kishkindha: Kingdom of the Vanaras',
    desc: 'Unite with the noble Vanara warriors amidst rugged mountain caverns and waterfalls.',
    status: 'locked',
  },
  {
    number: 5,
    title: 'Ram Setu: The Floating Bridge',
    desc: 'Building the sacred causeway across the roaring ocean with consecrated stones.',
    status: 'locked',
  },
  {
    number: 6,
    title: 'The Battle for Lanka & Final Victory',
    desc: 'Infiltrate the golden citadels of Lanka to confront the demon king Raone with the Brahmastra.',
    status: 'locked',
  },
];

export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onResumeGame,
  onOpenSettings,
  onOpenChapters,
  onOpenDifficulty,
  isGameActive,
}) => {
  const [activeSubModal, setActiveSubModal] = useState<'chapters' | 'howToPlay' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Background temple & mountain canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = Math.max(320, window.innerWidth || 360));
    let height = (canvas.height = Math.max(240, window.innerHeight || 640));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = Math.max(320, window.innerWidth || 360);
      height = canvas.height = Math.max(240, window.innerHeight || 640);
    };
    window.addEventListener('resize', handleResize);

    // Floating divine dust / prana particles
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.25 - Math.random() * 0.5,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      try {
        time += 0.015;
        ctx.clearRect(0, 0, width, height);

        // Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, Math.max(1, height));
        skyGrad.addColorStop(0, '#0c0a09');
        skyGrad.addColorStop(0.35, '#291108');
        skyGrad.addColorStop(0.65, '#5b1f0d');
        skyGrad.addColorStop(0.85, '#9a3412');
        skyGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Distant mountains
        ctx.fillStyle = '#1c0f0a';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        for (let x = 0; x <= width; x += 100) {
          ctx.lineTo(x, height * 0.65 + Math.sin(x * 0.005 + 1) * 40);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Floating particles
        for (const p of particles) {
          p.y += p.vy;
          p.x += p.vx + Math.sin(time + p.pulse) * 0.3;
          p.pulse += 0.02;

          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          const currentAlpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
          ctx.fillStyle = `rgba(251, 191, 36, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Subtle atmospheric ground mist
        const mistGrad = ctx.createLinearGradient(0, height * 0.75, 0, Math.max(1, height));
        mistGrad.addColorStop(0, 'rgba(10, 9, 8, 0)');
        mistGrad.addColorStop(1, 'rgba(10, 9, 8, 0.85)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, height * 0.75, width, height * 0.25);
      } catch (err) {
        console.warn('MainMenu animation frame error:', err);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handleMenuClick = (action: () => void) => {
    soundManager.play('uiClick');
    action();
  };

  const handleMenuHover = () => {
    soundManager.play('menuHover');
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      id="main-menu-overlay"
      className="absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-8 md:p-12 text-neutral-100 select-none overflow-y-auto"
    >
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none -z-10"
      />

      {/* Clean Top Header Bar */}
      <header className="relative w-full max-w-5xl mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/75 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-semibold font-mono tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The Epic Archer Saga</span>
        </div>

        <div className="flex items-center gap-2.5">
          <PWAInstallButton />
          <button
            id="main-menu-sound-toggle"
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-neutral-900/75 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 backdrop-blur-md transition-all cursor-pointer active:scale-95"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Clean Centered Hero & Navigation Menu */}
      <div className="relative w-full max-w-md mx-auto my-auto z-10 flex flex-col items-center text-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-['Cinzel'] tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_14px_rgba(245,158,11,0.35)]">
          RAMAYANA
        </h1>
        <p className="text-xs sm:text-sm md:text-base font-medium tracking-widest text-amber-200/80 uppercase font-['Cinzel'] mt-1 mb-4 sm:mb-8">
          The Epic Journey of Dharma
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:gap-2.5 w-full max-w-xs sm:max-w-sm">
          {/* Resume Game (if active) */}
          {isGameActive && onResumeGame && (
            <button
              id="menu-resume-game-btn"
              onClick={() => handleMenuClick(onResumeGame)}
              onMouseEnter={handleMenuHover}
              className="group relative flex items-center justify-between px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
                <span>Resume Game</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* New Game */}
          <button
            id="menu-new-game-btn"
            onClick={() => handleMenuClick(onNewGame)}
            onMouseEnter={handleMenuHover}
            className="group relative flex items-center justify-between px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-sm tracking-widest uppercase font-['Cinzel'] shadow-xl shadow-amber-600/30 hover:shadow-amber-500/50 transition-all active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Play className="w-4 h-4 fill-neutral-950 stroke-neutral-950" />
              <span>{isGameActive ? 'New Game' : 'Play Game'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-950/20 text-neutral-950 uppercase">
              Start
            </span>
          </button>

          {/* Chapters */}
          <button
            id="menu-chapters-btn"
            onClick={() =>
              handleMenuClick(() => {
                if (onOpenChapters) {
                  onOpenChapters();
                } else {
                  setActiveSubModal('chapters');
                }
              })
            }
            onMouseEnter={handleMenuHover}
            className="group relative flex items-center justify-between px-5 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-neutral-200 hover:text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Chapters</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Difficulty Selector */}
          {onOpenDifficulty && (
            <button
              id="menu-level-mode-btn"
              onClick={() => handleMenuClick(onOpenDifficulty)}
              onMouseEnter={handleMenuHover}
              className="group relative flex items-center justify-between px-5 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-neutral-200 hover:text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Difficulty</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* How to Play */}
          <button
            id="menu-how-to-play-btn"
            onClick={() => handleMenuClick(() => setActiveSubModal('howToPlay'))}
            onMouseEnter={handleMenuHover}
            className="group relative flex items-center justify-between px-5 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-neutral-200 hover:text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>How To Play</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Settings & Admin Panel */}
          <button
            id="menu-settings-btn"
            onClick={() => handleMenuClick(onOpenSettings)}
            onMouseEnter={handleMenuHover}
            className="group relative flex items-center justify-between px-5 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-neutral-200 hover:text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Settings & Controls</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Clean Minimalist Footer */}
      <footer className="relative w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between z-10 text-[11px] text-neutral-400 font-mono gap-2 pt-2">
        <span>© Ramayana 2D Action Platformer</span>
        <div className="hidden sm:flex items-center gap-4 text-amber-400/80">
          <span>A / D: Move</span>
          <span>Space: Jump</span>
          <span>Click: Shoot Bow</span>
          <span>K: Divine Power</span>
        </div>
      </footer>

      {/* ================= CHAPTERS MODAL ================= */}
      {activeSubModal === 'chapters' && (
        <div
          id="chapters-modal-overlay"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-xl font-bold font-['Cinzel'] tracking-wide">
                  RAMAYANA CHRONICLES
                </h2>
              </div>
              <button
                id="close-chapters-modal-btn"
                onClick={() => {
                  soundManager.play('uiClick');
                  setActiveSubModal(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto my-4 space-y-3 pr-1">
              {RAMAYANA_CHAPTERS.map((ch) => (
                <div
                  key={ch.number}
                  className={`p-4 rounded-xl border transition-all ${
                    ch.status === 'unlocked'
                      ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-900/30'
                      : 'bg-neutral-900/50 border-neutral-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      CHAPTER {ch.number}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ch.status === 'unlocked'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {ch.status === 'unlocked' ? 'Available' : 'Locked'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-100 font-['Cinzel']">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{ch.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => {
                  soundManager.play('uiClick');
                  setActiveSubModal(null);
                  onNewGame();
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase font-['Cinzel'] tracking-wider shadow-md transition-all cursor-pointer"
              >
                Play Current Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HOW TO PLAY MODAL ================= */}
      {activeSubModal === 'howToPlay' && (
        <div
          id="how-to-play-modal-overlay"
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400">
                <HelpCircle className="w-5 h-5" />
                <h2 className="text-xl font-bold font-['Cinzel'] tracking-wide">
                  HOW TO PLAY & CONTROLS
                </h2>
              </div>
              <button
                id="close-how-to-play-modal-btn"
                onClick={() => {
                  soundManager.play('uiClick');
                  setActiveSubModal(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto my-4 space-y-4 pr-1 text-sm text-neutral-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                    <Swords className="w-4 h-4" />
                    <span>Archery & Charged Attack</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Press <b>Click</b> or <b>J</b> to loose a quick arrow. Hold the button to draw the bowstring and charge a powerful double-damage piercing arrow!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-yellow-300 font-bold mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Divine Power Aura</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Press <b>Right Click</b> or <b>K</b> when divine energy reaches 40. Restores 1 lost life (or 60 HP) and activates a 6-second glowing shield reducing damage by 50%!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-blue-300 font-bold mb-1">
                    <Shield className="w-4 h-4" />
                    <span>Dodge Roll & Guard</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Press <b>L</b> or <b>Shift</b> to roll past enemy strikes with temporary invulnerability. Hold <b>B</b> to block and absorb 80% incoming damage.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2 text-rose-300 font-bold mb-1">
                    <Heart className="w-4 h-4" />
                    <span>Purneema & Checkpoints</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Approach companion <b>Purneema</b> and press <b>E</b> to receive sacred lotus blessings. Pass ancient shrines to record checkpoints and heal wounds.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => {
                  soundManager.play('uiClick');
                  setActiveSubModal(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase font-['Cinzel'] tracking-wider shadow-md transition-all cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
