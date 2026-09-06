import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  Upload,
  Layers,
  Sparkles,
  ChevronRight,
  Shield,
  User,
  Skull,
  CheckCircle2,
} from 'lucide-react';
import { spritePipeline, SpriteSheetConfig } from '../systems/spritePipeline';
import {
  renderUmesh,
  renderPurneema,
  renderRaone,
  renderEnemy,
} from '../render/sprites';
import {
  UmeshAnimationState,
  PurneemaAnimationState,
  RaoneAnimationState,
  EnemyAnimationState,
} from '../types';

interface AnimationPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CharacterTab = 'Umesh' | 'Purneema' | 'Raone' | 'Enemy';

export const AnimationPipelineModal: React.FC<AnimationPipelineModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterTab>('Umesh');
  const [selectedState, setSelectedState] = useState<string>('Umesh_Idle');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [facing, setFacing] = useState<'right' | 'left'>('right');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Custom Sprite config inputs
  const [frameCountInput, setFrameCountInput] = useState<number>(6);
  const [fpsInput, setFpsInput] = useState<number>(8);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterStates: Record<CharacterTab, string[]> = {
    Umesh: [
      'Umesh_Idle',
      'Umesh_Walk',
      'Umesh_Run',
      'Umesh_Jump',
      'Umesh_Fall',
      'Umesh_Attack',
      'Umesh_PowerAttack',
      'Umesh_Hurt',
      'Umesh_Death',
      'Umesh_DivinePower',
    ],
    Purneema: [
      'Purneema_Idle',
      'Purneema_Walk',
      'Purneema_Run',
      'Purneema_Jump',
      'Purneema_Hurt',
      'Purneema_Talk',
      'Purneema_Divine',
    ],
    Raone: [
      'Raone_Idle',
      'Raone_Walk',
      'Raone_Run',
      'Raone_Attack',
      'Raone_SpecialAttack',
      'Raone_Hurt',
      'Raone_Rage',
      'Raone_Death',
    ],
    Enemy: [
      'Enemy_Idle',
      'Enemy_Walk',
      'Enemy_Run',
      'Enemy_Attack',
      'Enemy_Hurt',
      'Enemy_Death',
    ],
  };

  useEffect(() => {
    // When switching character tab, select first state
    const states = characterStates[selectedCharacter];
    if (!states.includes(selectedState)) {
      setSelectedState(states[0]);
    }
  }, [selectedCharacter]);

  // Animation Loop for live preview
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setCurrentFrame((prev) => prev + dt * fpsInput);
      }

      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Dark temple floor platform preview
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(0, canvas.height - 35, canvas.width, 2);

          const centerX = canvas.width * 0.5;
          const baseY = canvas.height - 35;

          if (selectedCharacter === 'Umesh') {
            const isHurt = selectedState === 'Umesh_Hurt';
            const isDivine = selectedState === 'Umesh_DivinePower';
            const charge = selectedState === 'Umesh_PowerAttack' ? 0.9 : 0;
            renderUmesh(
              ctx,
              centerX - 24,
              baseY - 72,
              48,
              72,
              facing,
              selectedState as UmeshAnimationState,
              currentFrame,
              isHurt,
              isDivine,
              charge
            );
          } else if (selectedCharacter === 'Purneema') {
            renderPurneema(
              ctx,
              centerX - 22,
              baseY - 68,
              44,
              68,
              facing,
              selectedState as PurneemaAnimationState,
              currentFrame
            );
          } else if (selectedCharacter === 'Raone') {
            renderRaone(
              ctx,
              centerX - 35,
              baseY - 95,
              70,
              95,
              facing,
              selectedState as RaoneAnimationState,
              currentFrame
            );
          } else if (selectedCharacter === 'Enemy') {
            renderEnemy(
              ctx,
              centerX - 25,
              baseY - 65,
              50,
              65,
              facing,
              'small_demon',
              selectedState as EnemyAnimationState,
              currentFrame,
              1.0,
              selectedState === 'Enemy_Hurt'
            );
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, selectedCharacter, selectedState, facing, fpsInput, currentFrame]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    spritePipeline
      .registerCustomSpriteSheet(selectedState, file, {
        frameWidth: 0, // Auto derived from frameCount
        frameHeight: 0,
        frameCount: frameCountInput,
        fps: fpsInput,
      })
      .then(() => {
        setUploadSuccess(`Successfully bound Pixler.dev sprite sheet to ${selectedState}!`);
        setTimeout(() => setUploadSuccess(null), 4000);
      })
      .catch((err) => {
        alert(err.message || 'Error loading sprite sheet');
      });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-neutral-900 border border-amber-500/30 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg text-amber-300 font-['Cinzel']">
                  Character & Sprite Animation Studio
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Pixler.dev Game-Ready Asset Pipeline & State Inspector
                </p>
              </div>
            </div>

            <button
              id="close-pipeline-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Character Tabs */}
          <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 gap-2 pt-2">
            {(['Umesh', 'Purneema', 'Raone', 'Enemy'] as CharacterTab[]).map((char) => (
              <button
                key={char}
                onClick={() => setSelectedCharacter(char)}
                className={`px-4 py-2.5 font-medium text-xs md:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
                  selectedCharacter === char
                    ? 'bg-neutral-900 text-amber-300 border-amber-500/40 border-b-neutral-900'
                    : 'text-neutral-400 border-transparent hover:text-neutral-200'
                }`}
              >
                {char === 'Umesh' && <Shield className="w-4 h-4 text-amber-400" />}
                {char === 'Purneema' && <Sparkles className="w-4 h-4 text-rose-400" />}
                {char === 'Raone' && <Skull className="w-4 h-4 text-red-500" />}
                {char === 'Enemy' && <User className="w-4 h-4 text-orange-400" />}
                <span>{char}</span>
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Column: Animation State List */}
            <div className="md:col-span-4 border-r border-neutral-800 p-4 overflow-y-auto max-h-[60vh]">
              <span className="text-[11px] uppercase font-mono tracking-wider text-neutral-400 mb-2 block font-semibold">
                Required Animation States ({characterStates[selectedCharacter].length})
              </span>

              <div className="flex flex-col gap-1.5">
                {characterStates[selectedCharacter].map((stateName) => {
                  const isSelected = selectedState === stateName;
                  const customCfg = spritePipeline.getConfig(stateName);
                  const hasCustomImage = !!customCfg?.imageElement;

                  return (
                    <button
                      key={stateName}
                      onClick={() => setSelectedState(stateName)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                          : 'bg-neutral-950/40 text-neutral-300 hover:bg-neutral-800 border border-transparent'
                      }`}
                    >
                      <span className="truncate">{stateName}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasCustomImage && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            Custom
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Interactive Canvas Preview & Pixler.dev Sprite Importer */}
            <div className="md:col-span-8 p-5 flex flex-col justify-between overflow-y-auto max-h-[60vh]">
              {/* Canvas Preview Area */}
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-['Cinzel'] text-amber-200">
                      Preview: {selectedState}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      (Frame: {Math.floor(currentFrame)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFacing((f) => (f === 'right' ? 'left' : 'right'))}
                      className="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 cursor-pointer"
                    >
                      Facing: {facing.toUpperCase()}
                    </button>

                    <button
                      onClick={() => setIsPlaying((p) => !p)}
                      className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Canvas */}
                <div className="w-full h-48 md:h-56 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center overflow-hidden shadow-inner relative">
                  <canvas
                    ref={previewCanvasRef}
                    width={400}
                    height={220}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Upload Success Alert */}
              {uploadSuccess && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Pixler.dev Custom Sprite Sheet Importer */}
              <div className="mt-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wide">
                      Pixler.dev / Custom Sprite Sheet Importer
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Import a 2D horizontal sprite sheet for <strong className="text-amber-300">{selectedState}</strong>
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs shadow cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PNG</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-1 font-mono">
                      Frame Count (Columns)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={frameCountInput}
                      onChange={(e) => setFrameCountInput(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 font-mono text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-1 font-mono">
                      Animation FPS
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={fpsInput}
                      onChange={(e) => setFpsInput(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 font-mono text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono text-[11px]">
              Built-in high-fidelity procedural mythological sprites active by default. Custom PNGs override per state.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
            >
              Back to Game
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
