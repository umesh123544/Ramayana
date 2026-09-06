import React, { useState, useRef, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { VirtualControls } from './components/VirtualControls';
import { DivineBlessingBanner } from './components/DivineBlessingBanner';
import { GameOverModal } from './components/GameOverModal';
import { DialogueBox } from './components/DialogueBox';
import { AnimationPipelineModal } from './components/AnimationPipelineModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { HeroState } from './types';
import { PlayerInput } from './systems/characterController';
import { soundManager } from './audio/soundManager';
import { adminConfig, AdminGameConfig } from './systems/adminConfig';
import { Info, Sparkles, Sliders } from 'lucide-react';

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
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [divineBannerMsg, setDivineBannerMsg] = useState<string | null>(null);
  const [isNearPurneema, setIsNearPurneema] = useState<boolean>(false);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showControlsHint, setShowControlsHint] = useState<boolean>(false);

  // Reference for passing virtual touch input without re-renders
  const externalInputRef = useRef<Partial<PlayerInput>>({});

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

  const handleRestart = () => {
    setIsGameOver(false);
    setGameKey((k) => k + 1);
    soundManager.play('uiClick');
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
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100 flex flex-col select-none">
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
      />

      {/* Main 2D Game Canvas */}
      <main className="flex-1 w-full h-full relative">
        <GameCanvas
          key={gameKey}
          gameKey={gameKey}
          onHeroStateChange={handleHeroStateChange}
          onShowDivineBlessing={handleShowDivineBlessing}
          onGameOver={handleGameOver}
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
      />

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
        onConfigSaved={(newConfig) => {
          // Re-key canvas to re-initialize character controller with new base attributes
          setGameKey((k) => k + 1);
        }}
      />

      {/* Bottom Floating Hint & Quick Info */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-auto hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-amber-500/30 text-[11px] font-mono text-neutral-300 shadow-md">
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
