import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { VirtualControls } from './components/VirtualControls';
import { DivineBlessingBanner } from './components/DivineBlessingBanner';
import { GameOverModal } from './components/GameOverModal';
import { ChapterVictoryModal } from './components/ChapterVictoryModal';
import { DialogueBox } from './components/DialogueBox';
import { AnimationPipelineModal } from './components/AnimationPipelineModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { MainMenu } from './components/MainMenu';
import { DifficultySelector } from './components/DifficultySelector';
import { ChapterSelection } from './components/ChapterSelection';
import { OrientationGuard } from './components/OrientationGuard';
import { Chapter } from './data/gameData';
import { HeroState } from './types';
import { PlayerInput } from './systems/characterController';
import { soundManager } from './audio/soundManager';
import { adminConfig, DifficultyLevel } from './systems/adminConfig';
import { saveSystem } from './data/saveSystem';
import { Info } from 'lucide-react';

export default function App() {
  const [heroState, setHeroState] = useState<HeroState>({
    x: 250,
    y: 600,
    vx: 0,
    vy: 0,
    width: 48,
    height: 72,
    facing: 'right',
    isGrounded: true,
    isJumping: false,
    isFalling: false,
    animState: 'Umesh_Idle',
    animTimer: 0,
    currentFrame: 0,
    hp: 100,
    maxHp: 100,
    lives: 3,
    maxLives: 3,
    isHurt: false,
    hurtTimer: 0,
    isInvulnerable: false,
    invulnerableTimer: 0,
    isDead: false,
    deathTimer: 0,
    respawnX: 250,
    respawnY: 600,
    isAttacking: false,
    attackType: 'normal',
    attackTimer: 0,
    attackCooldown: 0,
    chargeTime: 0,
    isCharging: false,
    divinePower: 30,
    isDivineActive: false,
    divineTimer: 0,
    divineCooldown: 0,
  });

  const [gameKey, setGameKey] = useState<number>(0);
  const [currentChapterId, setCurrentChapterId] = useState<number>(1);
  const [completedChapterId, setCompletedChapterId] = useState<number | null>(null);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState<boolean>(true);
  const [isDifficultySelectorOpen, setIsDifficultySelectorOpen] = useState<boolean>(false);
  const [isChapterSelectOpen, setIsChapterSelectOpen] = useState<boolean>(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [divineBannerMsg, setDivineBannerMsg] = useState<string | null>(null);
  const [isNearPurneema, setIsNearPurneema] = useState<boolean>(false);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVirtualControls, setShowVirtualControls] = useState<boolean>(true);

  // Reference for passing virtual touch input without re-renders
  const externalInputRef = useRef<Partial<PlayerInput>>({});

  // Escape key toggle for Main Menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isVictoryModalOpen) {
          setIsVictoryModalOpen(false);
          setIsMainMenuOpen(true);
        } else if (isChapterSelectOpen) {
          setIsChapterSelectOpen(false);
          setIsMainMenuOpen(true);
        } else if (isDifficultySelectorOpen) {
          setIsDifficultySelectorOpen(false);
          if (selectedChapter) {
            setIsChapterSelectOpen(true);
          } else {
            setIsMainMenuOpen(true);
          }
        } else if (!isAdminModalOpen && !isPipelineModalOpen && !activeDialogue) {
          setIsMainMenuOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVictoryModalOpen, isChapterSelectOpen, isDifficultySelectorOpen, selectedChapter, isAdminModalOpen, isPipelineModalOpen, activeDialogue]);

  const handleHeroStateChange = useCallback((newHero: HeroState) => {
    setHeroState(newHero);
  }, []);

  const handleShowDivineBlessing = useCallback((message: string = 'DIVINE BLESSING') => {
    setDivineBannerMsg(message);
    setTimeout(() => {
      setDivineBannerMsg(null);
    }, 3200);
  }, []);

  const handleGameOver = useCallback(() => {
    setIsGameOver(true);
    soundManager.play('gameOver');
  }, []);

  const handleChapterVictory = useCallback((defeatedChapterId: number) => {
    soundManager.play('levelComplete');
    saveSystem.unlockNextChapter(defeatedChapterId);
    setCompletedChapterId(defeatedChapterId);
    setIsVictoryModalOpen(true);
  }, []);

  const handleRestart = () => {
    setIsGameOver(false);
    setGameKey((k) => k + 1);
    soundManager.play('uiClick');
  };

  const handleStartNewGame = (diff: DifficultyLevel) => {
    adminConfig.setDifficulty(diff);
    if (selectedChapter) {
      setCurrentChapterId(selectedChapter.id);
    } else {
      setCurrentChapterId(1);
    }
    setIsDifficultySelectorOpen(false);
    setIsMainMenuOpen(false);
    setHasGameStarted(true);
    setGameKey((k) => k + 1);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleVirtualInputChange = (input: Partial<PlayerInput>) => {
    externalInputRef.current = {
      ...externalInputRef.current,
      ...input,
    };
  };

  const handleInteractPurneema = () => {
    externalInputRef.current.interact = true;
    soundManager.play('uiClick');
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-neutral-950 font-sans text-neutral-100 flex flex-col select-none">
      <OrientationGuard />
      {/* HUD System */}
      <HUD
        hero={heroState}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenPipelineModal={() => {
          soundManager.play('uiClick');
          setIsPipelineModalOpen(true);
        }}
        onOpenAdminModal={() => {
          soundManager.play('uiClick');
          setIsAdminModalOpen(true);
        }}
        onOpenMainMenu={() => {
          soundManager.play('uiClick');
          setIsMainMenuOpen(true);
        }}
        onOpenChapters={() => {
          soundManager.play('uiClick');
          setIsMainMenuOpen(false);
          setIsDifficultySelectorOpen(false);
          setIsChapterSelectOpen(true);
        }}
        currentChapterId={currentChapterId}
        showControls={showVirtualControls}
        onToggleControls={() => setShowVirtualControls((prev) => !prev)}
      />

      {/* Main 2D Game Canvas */}
      <main className="flex-1 w-full h-full relative">
        <GameCanvas
          key={`${gameKey}-ch${currentChapterId}`}
          gameKey={gameKey}
          chapterId={currentChapterId}
          onHeroStateChange={handleHeroStateChange}
          onShowDivineBlessing={handleShowDivineBlessing}
          onGameOver={handleGameOver}
          onChapterVictory={handleChapterVictory}
          canInteractPurneema={setIsNearPurneema}
          onOpenDialogue={setActiveDialogue}
          externalInputRef={externalInputRef}
        />
      </main>

      {/* Touch / Mobile Virtual Controls */}
      <VirtualControls
        onInputChange={handleVirtualInputChange}
        canInteract={isNearPurneema}
        onInteract={handleInteractPurneema}
        divineReady={heroState.divinePower >= 40 && heroState.divineCooldown <= 0}
        visible={showVirtualControls && !isMainMenuOpen && !isDifficultySelectorOpen && !isChapterSelectOpen && !isVictoryModalOpen && !isGameOver}
      />

      {/* Divine Blessing Announcement Banner */}
      <DivineBlessingBanner
        show={!!divineBannerMsg}
        message={divineBannerMsg || 'DIVINE BLESSING'}
      />

      {/* Purneema Dialogue Modal */}
      <DialogueBox
        dialogue={activeDialogue}
        onClose={() => {
          soundManager.play('uiClick');
          setActiveDialogue(null);
        }}
      />

      {/* Game Over Screen */}
      <GameOverModal
        isOpen={isGameOver}
        onRestart={handleRestart}
        onMainMenu={() => {
          setIsGameOver(false);
          setIsMainMenuOpen(true);
        }}
      />

      {/* Chapter Victory & Next Chapter Unlock Modal */}
      {isVictoryModalOpen && (
        <ChapterVictoryModal
          completedChapterId={completedChapterId || currentChapterId}
          nextChapterId={(completedChapterId || currentChapterId) < 10 ? (completedChapterId || currentChapterId) + 1 : null}
          onProceedNextChapter={(nextId) => {
            setIsVictoryModalOpen(false);
            setCurrentChapterId(nextId);
            setGameKey((k) => k + 1);
          }}
          onOpenChapterSelect={() => {
            setIsVictoryModalOpen(false);
            setIsChapterSelectOpen(true);
          }}
          onReturnToMainMenu={() => {
            setIsVictoryModalOpen(false);
            setIsMainMenuOpen(true);
          }}
        />
      )}

      {/* Main Menu Overlay with Animated Mythological Background */}
      {isMainMenuOpen && !isDifficultySelectorOpen && !isChapterSelectOpen && !isVictoryModalOpen && (
        <MainMenu
          onNewGame={() => {
            setSelectedChapter(null);
            setIsMainMenuOpen(false);
            setIsDifficultySelectorOpen(true);
          }}
          onResumeGame={() => {
            setIsMainMenuOpen(false);
          }}
          onOpenChapters={() => {
            setIsMainMenuOpen(false);
            setIsChapterSelectOpen(true);
          }}
          onOpenSettings={() => {
            setIsAdminModalOpen(true);
          }}
          isGameActive={hasGameStarted}
        />
      )}

      {/* Chapter Selection Screen */}
      {isChapterSelectOpen && (
        <ChapterSelection
          onBack={() => {
            setIsChapterSelectOpen(false);
            setIsMainMenuOpen(true);
          }}
          onSelectChapter={(chapter) => {
            setSelectedChapter(chapter);
            setCurrentChapterId(chapter.id);
            setIsChapterSelectOpen(false);
            setIsDifficultySelectorOpen(true);
          }}
          initialChapterId={currentChapterId}
        />
      )}

      {/* Difficulty Selector Screen */}
      {isDifficultySelectorOpen && (
        <DifficultySelector
          onBack={() => {
            setIsDifficultySelectorOpen(false);
            if (selectedChapter) {
              setIsChapterSelectOpen(true);
            } else {
              setIsMainMenuOpen(true);
            }
          }}
          selectedChapter={selectedChapter || undefined}
          onConfirmStart={(selectedDiff) => {
            handleStartNewGame(selectedDiff);
          }}
        />
      )}

      {/* Pixler.dev Animation Pipeline Modal */}
      <AnimationPipelineModal
        isOpen={isPipelineModalOpen}
        onClose={() => {
          soundManager.play('uiClick');
          setIsPipelineModalOpen(false);
        }}
      />

      {/* Admin Panel & Character Studio Modal */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          soundManager.play('uiClick');
          setIsAdminModalOpen(false);
        }}
        onConfigSaved={() => {
          // Re-key canvas to re-initialize character controller with new base attributes
          setGameKey((k) => k + 1);
        }}
      />

      {/* Bottom Floating Hint & Quick Info - desktop mouse/keyboard only, never on touch devices */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-auto hidden [@media(pointer:fine)]:flex items-center gap-3 px-4 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 text-[11px] font-mono text-neutral-300 shadow-md">
        <span className="flex items-center gap-1.5 text-amber-300">
          <Info className="w-3.5 h-3.5" />
          <span>A / D: Move</span>
        </span>
        <span className="text-neutral-600">•</span>
        <span>Space: Jump</span>
        <span className="text-neutral-600">•</span>
        <span>Click / J: Bow Attack (Hold to Charge)</span>
        <span className="text-neutral-600">•</span>
        <span className="text-amber-400">Right Click / K: Divine Blessing</span>
        <span className="text-neutral-600">•</span>
        <span className="text-rose-400">E: Talk to Purneema</span>
      </div>
    </div>
  );
}
