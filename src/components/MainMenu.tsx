import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../audio/soundManager';
import { adminConfig } from '../systems/adminConfig';
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
} from 'lucide-react';

interface MainMenuProps {
  onNewGame: () => void;
  onResumeGame?: () => void;
  onOpenSettings: () => void;
  isGameActive: boolean;
}

interface ChapterInfo {
  number: number;
  title: string;
  hindiTitle: string;
  desc: string;
  status: 'unlocked' | 'locked';
}

const RAMAYANA_CHAPTERS: ChapterInfo[] = [
  {
    number: 1,
    title: 'The Sacred Hermitage of Ayodhya',
    hindiTitle: 'अयोध्या काण्ड • सरयू तट',
    desc: 'The peaceful beginnings along the Sarayu river, bow training, and the blessings of the sages.',
    status: 'unlocked',
  },
  {
    number: 2,
    title: 'Dandakaranya Forest & The Dark Shadows',
    hindiTitle: 'दण्डकारण्य वन • असुर आक्रमण',
    desc: 'Venture deep into the mystical primeval forest where demon sentries prowl beneath giant trees.',
    status: 'unlocked',
  },
  {
    number: 3,
    title: 'Panchavati & The Golden Deer',
    hindiTitle: 'पञ्चवटी • स्वर्णमृग लीला',
    desc: 'The serene ashram at Panchavati where illusionary creatures test the warrior’s vigilance.',
    status: 'locked',
  },
  {
    number: 4,
    title: 'Kishkindha: Kingdom of the Vanaras',
    hindiTitle: 'किष्किन्धा काण्ड • वानर सख्य',
    desc: 'Unite with the noble Vanara warriors amidst rugged mountain caverns and waterfalls.',
    status: 'locked',
  },
  {
    number: 5,
    title: 'Ram Setu: The Floating Bridge',
    hindiTitle: 'सेतु निर्माण • समुद्र बन्धन',
    desc: 'Building the sacred causeway across the roaring ocean with consecrated stones.',
    status: 'locked',
  },
  {
    number: 6,
    title: 'The Battle for Lanka & Final Victory',
    hindiTitle: 'युद्ध काण्ड • रावण वध',
    desc: 'Infiltrate the golden citadels of Lanka to confront the demon king Raone with the Brahmastra.',
    status: 'locked',
  },
];

export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onResumeGame,
  onOpenSettings,
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

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating divine dust / prana particles
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.6,
      size: 1.5 + Math.random() * 3,
      alpha: 0.2 + Math.random() * 0.6,
      pulse: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Sky Gradient - Rich mythological dawn / twilight
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0c0a09'); // Deep night-void
      skyGrad.addColorStop(0.35, '#291108'); // Dark ember
      skyGrad.addColorStop(0.65, '#5b1f0d'); // Saffron twilight
      skyGrad.addColorStop(0.85, '#9a3412'); // Rich sunrise orange
      skyGrad.addColorStop(1, '#b45309'); // Golden dawn horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Divine Rising Sun / Surya Aura
      const sunX = width * 0.5;
      const sunY = height * 0.52;
      const sunRad = Math.min(width, height) * 0.45;

      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRad);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
      sunGrad.addColorStop(0.2, 'rgba(245, 158, 11, 0.25)');
      sunGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.12)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRad, 0, Math.PI * 2);
      ctx.fill();

      // Sun disc
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Divine rays rotating gently
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(time * 0.05);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.06)';
      ctx.lineWidth = 2;
      for (let r = 0; r < 16; r++) {
        ctx.rotate((Math.PI * 2) / 16);
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(sunRad * 0.9, 0);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Distant Mountains (Himalayas)
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.65);
      const segs = 18;
      const step = width / segs;
      for (let i = 0; i <= segs; i++) {
        const mx = i * step;
        const my =
          height * 0.58 +
          Math.sin(i * 1.3) * 60 +
          Math.cos(i * 0.7) * 40 -
          (i % 3 === 0 ? 30 : 0);
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Snow peaks on distant mountains
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Midground Mountain Ridge & Forest mist
      ctx.fillStyle = '#141210';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.76);
      for (let i = 0; i <= segs; i++) {
        const mx = i * step;
        const my = height * 0.7 + Math.sin(i * 1.9 + 2) * 45;
        ctx.lineTo(mx, my);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // 5. Sacred Temple Silhouettes in the Mountain mist
      // Main Center Temple
      const tX = width * 0.5;
      const tY = height * 0.82;

      // Temple base & plinth
      ctx.fillStyle = '#0a0908';
      ctx.fillRect(tX - 110, tY - 60, 220, 120);

      // Multi-tier Shikhara (Sanctum Spire)
      ctx.beginPath();
      ctx.moveTo(tX, tY - 210);
      ctx.lineTo(tX + 45, tY - 60);
      ctx.lineTo(tX - 45, tY - 60);
      ctx.closePath();
      ctx.fill();

      // Left smaller Shikhara
      ctx.beginPath();
      ctx.moveTo(tX - 70, tY - 140);
      ctx.lineTo(tX - 40, tY - 60);
      ctx.lineTo(tX - 100, tY - 60);
      ctx.closePath();
      ctx.fill();

      // Right smaller Shikhara
      ctx.beginPath();
      ctx.moveTo(tX + 70, tY - 140);
      ctx.lineTo(tX + 100, tY - 60);
      ctx.lineTo(tX + 40, tY - 60);
      ctx.closePath();
      ctx.fill();

      // Temple Spire Kalash (Golden Finial) with glow
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(tX, tY - 212, 6, 0, Math.PI * 2);
      ctx.fill();

      // Saffron Temple Dhwaja (Fluttering Flag)
      const flagFlutter = Math.sin(time * 3) * 8;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(tX, tY - 216);
      ctx.lineTo(tX + 28 + flagFlutter, tY - 204);
      ctx.lineTo(tX, tY - 192);
      ctx.closePath();
      ctx.fill();

      // Temple Pillar Columns & Sanctum Arches
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.lineWidth = 1.5;
      for (let p = -80; p <= 80; p += 32) {
        ctx.strokeRect(tX + p, tY - 50, 12, 50);
      }

      // Temple Sanctum Diya Light Glow
      const diyaGlow = ctx.createRadialGradient(tX, tY - 25, 2, tX, tY - 25, 45);
      diyaGlow.addColorStop(0, 'rgba(249, 115, 22, 0.8)');
      diyaGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
      diyaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = diyaGlow;
      ctx.beginPath();
      ctx.arc(tX, tY - 25, 45, 0, Math.PI * 2);
      ctx.fill();

      // 6. Floating Divine Particles (Prana / Holy Embers)
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

      // 7. Atmospheric ground mist
      const mistGrad = ctx.createLinearGradient(0, height * 0.78, 0, height);
      mistGrad.addColorStop(0, 'rgba(10, 9, 8, 0)');
      mistGrad.addColorStop(1, 'rgba(10, 9, 8, 0.85)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, height * 0.78, width, height * 0.22);

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
      className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 md:p-12 text-neutral-100 select-none overflow-hidden"
    >
      {/* Animated Mythological Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none -z-10"
      />

      {/* Subtle vignette border overlay */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-amber-950/20 shadow-2xl" />

      {/* Top Header / Branding */}
      <header className="relative w-full max-w-6xl mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>धनुर्धर उमेशको गाथा • Mythological Epic</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="main-menu-sound-toggle"
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-neutral-900/70 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 backdrop-blur-md transition-all cursor-pointer active:scale-95"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Center Title & Main Action Buttons */}
      <div className="relative w-full max-w-xl mx-auto my-auto z-10 flex flex-col items-center text-center">
        {/* Sanskrit Inscription */}
        <div className="text-xs sm:text-sm font-semibold tracking-widest text-amber-400/90 font-['Cinzel'] mb-1">
          ॥ रामो विग्रहवान् धर्मः ॥
        </div>

        {/* Epic Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-['Cinzel'] tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
          RAMAYANA
        </h1>
        <p className="text-sm sm:text-base md:text-lg font-medium tracking-widest text-amber-200/90 uppercase font-['Cinzel'] mt-1 mb-8">
          The Epic Journey of Dharma
        </p>

        {/* Primary Menu Options */}
        <div className="flex flex-col gap-3 w-full max-w-xs sm:max-w-sm">
          {/* Resume Game (if in progress) */}
          {isGameActive && onResumeGame && (
            <button
              id="menu-resume-game-btn"
              onClick={() => handleMenuClick(onResumeGame)}
              onMouseEnter={handleMenuHover}
              className="group relative flex items-center justify-between px-6 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
                <span>Resume Game</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* New Game -> opens DifficultySelector */}
          <button
            id="menu-new-game-btn"
            onClick={() => handleMenuClick(onNewGame)}
            onMouseEnter={handleMenuHover}
            className="group relative flex items-center justify-between px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black text-sm tracking-widest uppercase font-['Cinzel'] shadow-xl shadow-amber-600/30 hover:shadow-amber-500/50 transition-all active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Play className="w-4 h-4 fill-neutral-950 stroke-neutral-950" />
              <span>New Game</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-950/20 text-neutral-950 uppercase">
              Begin
            </span>
          </button>

          {/* Chapters */}
          <button
            id="menu-chapters-btn"
            onClick={() => handleMenuClick(() => setActiveSubModal('chapters'))}
            onMouseEnter={handleMenuHover}
            className="group relative flex items-center justify-between px-6 py-3.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-neutral-200 hover:text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Chapters</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* How to Play / Controls */}
          <button
            id="menu-how-to-play-btn"
            onClick={() => handleMenuClick(() => setActiveSubModal('howToPlay'))}
            onMouseEnter={handleMenuHover}
            className="group relative flex items-center justify-between px-6 py-3.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-neutral-200 hover:text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
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
            className="group relative flex items-center justify-between px-6 py-3.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-neutral-200 hover:text-amber-200 font-bold text-sm tracking-wider uppercase font-['Cinzel'] backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <footer className="relative w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between z-10 text-[11px] text-neutral-400 font-mono gap-2">
        <span>© 2026 Ramayana 2D Action Platformer • Made with Deep Vedic Craft</span>
        <div className="flex items-center gap-4 text-amber-400/80">
          <span>A / D: Move</span>
          <span>Space: Jump</span>
          <span>Click: Archery</span>
          <span>K: Divine Blessing</span>
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
                  RAMAYANA CHRONICLES • अध्याय
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
                      CHAPTER {ch.number} • {ch.hindiTitle}
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
                  HOW TO PLAY • धनुर्विद्या निर्देश
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
