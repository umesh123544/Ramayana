import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  User,
  Sparkles,
  Sliders,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
  Skull,
  Plus,
  Trash2,
  Palette,
  Eye,
  Gamepad2,
  MoveHorizontal,
  ArrowUp,
  Crosshair,
  Zap,
} from 'lucide-react';
import {
  adminConfig,
  AdminGameConfig,
} from '../systems/adminConfig';
import { renderUmesh } from '../render/sprites';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (newConfig: AdminGameConfig) => void;
}

type TabType = 'hero' | 'controls' | 'companion' | 'villain' | 'game';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  const [config, setConfig] = useState<AdminGameConfig>(() =>
    JSON.parse(JSON.stringify(adminConfig.get()))
  );
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [newDialogueInput, setNewDialogueInput] = useState('');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setConfig(JSON.parse(JSON.stringify(adminConfig.get())));
    }
  }, [isOpen]);

  // Live preview animation loop inside admin panel
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    let frame = 0;

    const loop = () => {
      frame += 0.15;
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Platform ground
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(0, canvas.height - 24, canvas.width, 2);

          // Render hero with active admin preview colors
          renderUmesh(
            ctx,
            canvas.width * 0.5 - 24,
            canvas.height - 24 - 72,
            48,
            72,
            'right',
            'Umesh_Idle',
            frame,
            false,
            false,
            0
          );
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, config.hero.skinTone, config.hero.dhotiColor, config.hero.armorColor]);

  if (!isOpen) return null;

  const handleSave = () => {
    adminConfig.save(config);
    onConfigSaved(config);
    setSaveToast('Settings successfully saved & applied to the game!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all configurations to factory defaults?')) {
      const def = adminConfig.resetToDefaults();
      setConfig(JSON.parse(JSON.stringify(def)));
      onConfigSaved(def);
      setSaveToast('Default settings restored!');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const applyPreset = (presetName: string) => {
    if (presetName === 'classic') {
      setConfig((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          name: 'Umesh',
          title: 'Ramayana Hero • Bow Warrior',
          skinTone: '#38bdf8',
          dhotiColor: '#ea580c',
          armorColor: '#f59e0b',
          maxHp: 100,
          lives: 3,
          walkSpeed: 220,
          runSpeed: 380,
          jumpForce: 640,
          arrowDamage: 25,
          chargedArrowDamage: 50,
        },
      }));
    } else if (presetName === 'godmode') {
      setConfig((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          name: 'Shri Umesh Avatar',
          title: 'Divine Sun Incarnation • Invincible Archer',
          skinTone: '#fde047',
          dhotiColor: '#ea580c',
          armorColor: '#f59e0b',
          maxHp: 300,
          lives: 7,
          walkSpeed: 300,
          runSpeed: 520,
          jumpForce: 780,
          arrowDamage: 80,
          chargedArrowDamage: 180,
        },
      }));
    } else if (presetName === 'archer') {
      setConfig((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          name: 'Umesh Dhanurdhar',
          title: 'Master Divine Archer',
          skinTone: '#38bdf8',
          dhotiColor: '#059669',
          armorColor: '#e2e8f0',
          maxHp: 120,
          lives: 4,
          walkSpeed: 260,
          runSpeed: 440,
          jumpForce: 700,
          arrowDamage: 45,
          chargedArrowDamage: 100,
        },
      }));
    }
    setSaveToast(`'${presetName}' preset applied! Click 'Save & Apply Changes' below.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const addDialogue = () => {
    if (!newDialogueInput.trim()) return;
    setConfig((prev) => ({
      ...prev,
      companion: {
        ...prev.companion,
        dialogues: [...prev.companion.dialogues, newDialogueInput.trim()],
      },
    }));
    setNewDialogueInput('');
  };

  const removeDialogue = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      companion: {
        ...prev.companion,
        dialogues: prev.companion.dialogues.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="bg-neutral-900 border border-amber-500/40 w-full max-w-4xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100 my-auto"
        >
          {/* ================= HEADER ================= */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-amber-300 font-['Cinzel'] flex items-center gap-2">
                  <span>Admin & Game Studio</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Admin
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
                  Customize hero stats, on-screen controls, companion dialogues, and difficulty
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="admin-reset-btn"
                onClick={handleReset}
                title="Reset to factory defaults"
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>

              <button
                id="admin-close-modal-btn"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ================= PRESET QUICK SELECTOR ================= */}
          <div className="bg-neutral-950/50 px-4 sm:px-6 py-2 border-b border-neutral-800 flex items-center justify-between gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-neutral-400 font-mono text-[11px] whitespace-nowrap shrink-0">
              ⚡ Quick Hero Presets:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => applyPreset('classic')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30 whitespace-nowrap text-[11px] cursor-pointer"
              >
                🌟 Classic Umesh
              </button>
              <button
                onClick={() => applyPreset('godmode')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-yellow-600/30 text-yellow-300 border border-yellow-500/30 whitespace-nowrap text-[11px] cursor-pointer"
              >
                ⚡ God Mode (High HP)
              </button>
              <button
                onClick={() => applyPreset('archer')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 whitespace-nowrap text-[11px] cursor-pointer"
              >
                🏹 Master Archer
              </button>
            </div>
          </div>

          {/* ================= NAVIGATION TABS ================= */}
          <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-4 sm:px-6 gap-1 sm:gap-2 pt-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('hero')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x whitespace-nowrap ${
                activeTab === 'hero'
                  ? 'bg-neutral-900 text-amber-300 border-amber-500/40 border-b-neutral-900'
                  : 'text-neutral-400 border-transparent hover:text-neutral-200'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Hero (Umesh)</span>
            </button>

            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x whitespace-nowrap ${
                activeTab === 'controls'
                  ? 'bg-neutral-900 text-cyan-300 border-cyan-500/40 border-b-neutral-900'
                  : 'text-neutral-400 border-transparent hover:text-neutral-200'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>Controls (Buttons & Stick)</span>
            </button>

            <button
              onClick={() => setActiveTab('companion')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x whitespace-nowrap ${
                activeTab === 'companion'
                  ? 'bg-neutral-900 text-rose-300 border-rose-500/40 border-b-neutral-900'
                  : 'text-neutral-400 border-transparent hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Companion (Purneema)</span>
            </button>

            <button
              onClick={() => setActiveTab('villain')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x whitespace-nowrap ${
                activeTab === 'villain'
                  ? 'bg-neutral-900 text-red-400 border-red-500/40 border-b-neutral-900'
                  : 'text-neutral-400 border-transparent hover:text-neutral-200'
              }`}
            >
              <Skull className="w-4 h-4 text-red-500" />
              <span>Villains & Demons</span>
            </button>

            <button
              onClick={() => setActiveTab('game')}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-t border-x whitespace-nowrap ${
                activeTab === 'game'
                  ? 'bg-neutral-900 text-emerald-300 border-emerald-500/40 border-b-neutral-900'
                  : 'text-neutral-400 border-transparent hover:text-neutral-200'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Game Settings</span>
            </button>
          </div>

          {/* ================= TAB BODY ================= */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[60vh]">
            {/* ---------------- TAB 1: HERO CHARACTER ---------------- */}
            {activeTab === 'hero' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left side: Inputs */}
                <div className="md:col-span-8 space-y-4">
                  {/* Name & Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Hero Character Name
                      </label>
                      <input
                        type="text"
                        value={config.hero.name}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, name: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-sm focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. Umesh, Ram, Arjun..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Hero Title / Subtitle
                      </label>
                      <input
                        type="text"
                        value={config.hero.title}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, title: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-sm focus:border-amber-500 focus:outline-none"
                        placeholder="e.g. Bow Warrior, Dhanurdhar..."
                      />
                    </div>
                  </div>

                  {/* Character Colors Customizer */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Character Appearance & Attire</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Skin tone */}
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Skin Complexion
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.hero.skinTone}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, skinTone: e.target.value },
                              }))
                            }
                            className="w-8 h-8 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-xs text-neutral-300">
                            {config.hero.skinTone}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          {['#38bdf8', '#fde047', '#d97706', '#6366f1'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() =>
                                setConfig((prev) => ({
                                  ...prev,
                                  hero: { ...prev.hero, skinTone: c },
                                }))
                              }
                              className="w-4 h-4 rounded-full border border-neutral-600"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Dhoti / Robe color */}
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Dhoti Robe Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.hero.dhotiColor}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, dhotiColor: e.target.value },
                              }))
                            }
                            className="w-8 h-8 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-xs text-neutral-300">
                            {config.hero.dhotiColor}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          {['#ea580c', '#dc2626', '#eab308', '#059669', '#7c3aed'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() =>
                                setConfig((prev) => ({
                                  ...prev,
                                  hero: { ...prev.hero, dhotiColor: c },
                                }))
                              }
                              className="w-4 h-4 rounded-full border border-neutral-600"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Armor / Kavach */}
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Armor Kavach
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.hero.armorColor}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, armorColor: e.target.value },
                              }))
                            }
                            className="w-8 h-8 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                          />
                          <span className="font-mono text-xs text-neutral-300">
                            {config.hero.armorColor}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          {['#f59e0b', '#e2e8f0', '#b45309', '#f43f5e'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() =>
                                setConfig((prev) => ({
                                  ...prev,
                                  hero: { ...prev.hero, armorColor: c },
                                }))
                              }
                              className="w-4 h-4 rounded-full border border-neutral-600"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attributes: HP, Lives, Damage */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800">
                      <label className="block text-[11px] text-neutral-400 mb-1 font-mono">
                        Max HP
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={500}
                        step={10}
                        value={config.hero.maxHp}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, maxHp: Number(e.target.value) },
                          }))
                        }
                        className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-emerald-400 font-bold font-mono focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800">
                      <label className="block text-[11px] text-neutral-400 mb-1 font-mono">
                        Sacred Lives
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={9}
                        value={config.hero.lives}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, lives: Number(e.target.value) },
                          }))
                        }
                        className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-red-400 font-bold font-mono focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800">
                      <label className="block text-[11px] text-neutral-400 mb-1 font-mono">
                        Arrow Damage
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={config.hero.arrowDamage}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, arrowDamage: Number(e.target.value) },
                          }))
                        }
                        className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-bold font-mono focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800">
                      <label className="block text-[11px] text-neutral-400 mb-1 font-mono">
                        Charged Arrow Dmg
                      </label>
                      <input
                        type="number"
                        min={20}
                        max={250}
                        value={config.hero.chargedArrowDamage}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, chargedArrowDamage: Number(e.target.value) },
                          }))
                        }
                        className="w-full px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-yellow-300 font-bold font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Movement Sliders */}
                  <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-mono">Walk Speed: {config.hero.walkSpeed}</span>
                        <span className="text-neutral-400 font-mono">Run Speed: {config.hero.runSpeed}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="range"
                          min={150}
                          max={350}
                          value={config.hero.walkSpeed}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, walkSpeed: Number(e.target.value) },
                            }))
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <input
                          type="range"
                          min={280}
                          max={550}
                          value={config.hero.runSpeed}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, runSpeed: Number(e.target.value) },
                            }))
                          }
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-neutral-300 font-mono">Jump Force: {config.hero.jumpForce}</span>
                        <span className="text-neutral-500 font-mono">(Higher = Jumps higher)</span>
                      </div>
                      <input
                        type="range"
                        min={450}
                        max={850}
                        value={config.hero.jumpForce}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, jumpForce: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Right side: Live Character Preview Box */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-950/80 border border-amber-500/30">
                  <span className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5 font-['Cinzel']">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Hero Preview</span>
                  </span>
                  <div className="w-32 h-36 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center overflow-hidden my-2 shadow-inner">
                    <canvas
                      ref={previewCanvasRef}
                      width={128}
                      height={144}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center mt-1">
                    <div className="text-sm font-black text-amber-300 font-['Cinzel']">
                      {config.hero.name || 'Hero'}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {config.hero.title}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 2: CONTROLS CUSTOMIZER ---------------- */}
            {activeTab === 'controls' && (
              <div className="space-y-5">
                {/* Header note */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Gamepad2 className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-bold">Virtual On-Screen Controls Adjuster</div>
                      <div className="text-[11px] text-cyan-200/70">
                        Adjust button size, opacity, positions, and controller mode for phone & tablet screens.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          controls: {
                            scale: 1.0,
                            opacity: 0.9,
                            dpadType: 'dpad',
                            bottomOffset: 12,
                            sideOffset: 14,
                            swapSides: false,
                            showControls: true,
                          },
                        }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Controls</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Sliders */}
                  <div className="space-y-4">
                    {/* Scale Slider */}
                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-200">Control Size / Scale</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {Math.round((config.controls?.scale || 1.0) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.75}
                        max={1.4}
                        step={0.05}
                        value={config.controls?.scale || 1.0}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            controls: {
                              ...prev.controls,
                              scale: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Compact (75%)</span>
                        <span>Standard (100%)</span>
                        <span>Large (140%)</span>
                      </div>
                      {/* Scale Presets */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {[
                          { label: 'Compact (85%)', val: 0.85 },
                          { label: 'Standard (100%)', val: 1.0 },
                          { label: 'Large (120%)', val: 1.2 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                controls: { ...prev.controls, scale: preset.val },
                              }))
                            }
                            className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-all ${
                              Math.abs((config.controls?.scale || 1.0) - preset.val) < 0.01
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-neutral-900 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-200">Opacity / Transparency</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {Math.round((config.controls?.opacity !== undefined ? config.controls.opacity : 0.9) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={1.0}
                        step={0.05}
                        value={config.controls?.opacity !== undefined ? config.controls.opacity : 0.9}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            controls: {
                              ...prev.controls,
                              opacity: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Subtle Ghost (30%)</span>
                        <span>Semi (65%)</span>
                        <span>Solid (100%)</span>
                      </div>
                    </div>

                    {/* Edge Margin Offsets */}
                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                      <div className="text-xs font-semibold text-neutral-200">Edge Margins & Spacing</div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                            <span>Bottom:</span>
                            <span className="font-mono text-cyan-300">{config.controls?.bottomOffset ?? 12}px</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={50}
                            step={2}
                            value={config.controls?.bottomOffset ?? 12}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                controls: {
                                  ...prev.controls,
                                  bottomOffset: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full accent-cyan-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                            <span>Sides:</span>
                            <span className="font-mono text-cyan-300">{config.controls?.sideOffset ?? 14}px</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={50}
                            step={2}
                            value={config.controls?.sideOffset ?? 14}
                            onChange={(e) =>
                              setConfig((prev) => ({
                                ...prev,
                                controls: {
                                  ...prev.controls,
                                  sideOffset: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full accent-cyan-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Modes & Layout Toggles + Preview */}
                  <div className="space-y-4">
                    {/* Control Style Mode: D-Pad vs Joystick */}
                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                      <label className="block text-xs font-semibold text-neutral-200 mb-1">
                        Preferred Movement Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              controls: { ...prev.controls, dpadType: 'dpad' },
                            }))
                          }
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            (config.controls?.dpadType || 'dpad') === 'dpad'
                              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <Gamepad2 className="w-4 h-4" />
                          <span>4-Way D-Pad</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              controls: { ...prev.controls, dpadType: 'joystick' },
                            }))
                          }
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            config.controls?.dpadType === 'joystick'
                              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <MoveHorizontal className="w-4 h-4" />
                          <span>360° Joystick</span>
                        </button>
                      </div>
                    </div>

                    {/* Swap Sides (Left-Handed / Right-Handed) */}
                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                      <label className="block text-xs font-semibold text-neutral-200 mb-1">
                        Handedness / Button Placement
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              controls: { ...prev.controls, swapSides: false },
                            }))
                          }
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center cursor-pointer transition-all ${
                            !config.controls?.swapSides
                              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div>Default</div>
                          <div className="text-[10px] opacity-75 font-mono">Move: Left • Fire: Right</div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              controls: { ...prev.controls, swapSides: true },
                            }))
                          }
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center cursor-pointer transition-all ${
                            config.controls?.swapSides
                              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-md'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <div>Swapped</div>
                          <div className="text-[10px] opacity-75 font-mono">Fire: Left • Move: Right</div>
                        </button>
                      </div>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-neutral-200">Show On-Screen Controls</div>
                        <div className="text-[11px] text-neutral-400">
                          Keep visible for touch devices or hide if playing exclusively on keyboard
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            controls: {
                              ...prev.controls,
                              showControls: prev.controls?.showControls === false ? true : false,
                            },
                          }))
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          config.controls?.showControls !== false ? 'bg-cyan-600' : 'bg-neutral-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                            config.controls?.showControls !== false ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Visual Layout Mockup */}
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center">
                      <div className="text-[11px] text-neutral-400 font-mono mb-2">
                        Real-Time Layout Preview ({Math.round((config.controls?.scale || 1.0) * 100)}% size, {Math.round((config.controls?.opacity ?? 0.9) * 100)}% opacity)
                      </div>
                      <div
                        className="w-full h-24 rounded-lg bg-neutral-900/90 border border-dashed border-neutral-700 p-2 flex items-end justify-between transition-opacity"
                        style={{ opacity: config.controls?.opacity ?? 0.9 }}
                      >
                        {/* Box 1 (Left) */}
                        <div
                          className="flex items-center gap-1 transition-transform"
                          style={{
                            transform: `scale(${Math.min(1.15, config.controls?.scale || 1.0)})`,
                            transformOrigin: 'bottom left',
                          }}
                        >
                          {config.controls?.swapSides ? (
                            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold">
                              <Zap className="w-3 h-3 text-amber-400" />
                              <Crosshair className="w-4 h-4 text-amber-300" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[9px] font-bold">
                              <ArrowUp className="w-3 h-3" />
                              <span>DPAD</span>
                            </div>
                          )}
                        </div>

                        {/* Box 2 (Right) */}
                        <div
                          className="flex items-center gap-1 transition-transform"
                          style={{
                            transform: `scale(${Math.min(1.15, config.controls?.scale || 1.0)})`,
                            transformOrigin: 'bottom right',
                          }}
                        >
                          {config.controls?.swapSides ? (
                            <div className="flex flex-col items-center p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[9px] font-bold">
                              <ArrowUp className="w-3 h-3" />
                              <span>DPAD</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold">
                              <Zap className="w-3 h-3 text-amber-400" />
                              <Crosshair className="w-4 h-4 text-amber-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 3: COMPANION (PURNEEMA) ---------------- */}
            {activeTab === 'companion' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Companion Name
                    </label>
                    <input
                      type="text"
                      value={config.companion.name}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          companion: { ...prev.companion, name: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-rose-300 text-sm focus:border-rose-500 focus:outline-none"
                      placeholder="e.g. Purneema, Sita..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Role / Subtitle
                    </label>
                    <input
                      type="text"
                      value={config.companion.role}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          companion: { ...prev.companion, role: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-sm focus:border-rose-500 focus:outline-none"
                      placeholder="e.g. Sacred Ashram Supporting Heroine..."
                    />
                  </div>
                </div>

                {/* Blessing Energy & Sari Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <label className="block text-neutral-400 mb-1 font-mono">
                      Lotus Blessing Energy (+Divine Power)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={config.companion.blessingEnergy}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          companion: { ...prev.companion, blessingEnergy: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-bold font-mono focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <label className="block text-neutral-400 mb-1 font-mono">
                      Sari / Attire Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.companion.sariColor}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            companion: { ...prev.companion, sariColor: e.target.value },
                          }))
                        }
                        className="w-8 h-8 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-neutral-300">
                        {config.companion.sariColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customizable Dialogues */}
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Companion Dialogues</span>
                  </h4>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {config.companion.dialogues.map((dlg, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs"
                      >
                        <span className="text-rose-400 font-mono font-bold text-[10px]">#{idx + 1}</span>
                        <input
                          type="text"
                          value={dlg}
                          onChange={(e) => {
                            const newDialogues = [...config.companion.dialogues];
                            newDialogues[idx] = e.target.value;
                            setConfig((prev) => ({
                              ...prev,
                              companion: { ...prev.companion, dialogues: newDialogues },
                            }));
                          }}
                          className="flex-1 bg-transparent border-none text-neutral-200 text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => removeDialogue(idx)}
                          className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add new dialogue */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Type a new dialogue line..."
                      value={newDialogueInput}
                      onChange={(e) => setNewDialogueInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addDialogue()}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-100 focus:border-rose-500 focus:outline-none"
                    />
                    <button
                      onClick={addDialogue}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 4: VILLAIN & DEMON ARMY ---------------- */}
            {activeTab === 'villain' && (
              <div className="space-y-4">
                {/* Main Villain */}
                <div className="p-4 rounded-xl bg-neutral-950/70 border border-red-900/40 space-y-3">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-red-500" />
                    <span>Main Boss Villain</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Boss Name
                      </label>
                      <input
                        type="text"
                        value={config.villain.name}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            villain: { ...prev.villain, name: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-red-300 text-sm focus:border-red-500 focus:outline-none"
                        placeholder="e.g. Raone, Ravana..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Title / Role
                      </label>
                      <input
                        type="text"
                        value={config.villain.title}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            villain: { ...prev.villain, title: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-100 text-sm focus:border-red-500 focus:outline-none"
                        placeholder="e.g. Demon King of Lanka..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Boss Max HP
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={3000}
                        step={50}
                        value={config.villain.maxHp}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            villain: { ...prev.villain, maxHp: Number(e.target.value) },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-red-400 font-bold font-mono text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Demon Army Names */}
                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3 text-xs">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
                    Demon Army Archetypes
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1 font-mono">
                        Small Demon (Light Rakshasa)
                      </label>
                      <input
                        type="text"
                        value={config.enemies.smallDemonName}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            enemies: { ...prev.enemies, smallDemonName: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1 font-mono">
                        Archer Demon (Bow Warrior Asura)
                      </label>
                      <input
                        type="text"
                        value={config.enemies.archerDemonName}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            enemies: { ...prev.enemies, archerDemonName: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1 font-mono">
                        Heavy Demon (Kumbhakarna Brute)
                      </label>
                      <input
                        type="text"
                        value={config.enemies.heavyDemonName}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            enemies: { ...prev.enemies, heavyDemonName: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1 font-mono">
                        Flying Demon (Winged Asura)
                      </label>
                      <input
                        type="text"
                        value={config.enemies.flyingDemonName}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            enemies: { ...prev.enemies, flyingDemonName: e.target.value },
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Enemy Difficulty Multipliers */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[11px] text-neutral-400 font-mono block mb-1">
                        Enemy Damage Multiplier: {config.enemies.damageMultiplier}x
                      </span>
                      <input
                        type="range"
                        min={0.5}
                        max={2.5}
                        step={0.1}
                        value={config.enemies.damageMultiplier}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            enemies: { ...prev.enemies, damageMultiplier: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-neutral-400 font-mono block mb-1">
                        Enemy HP Multiplier: {config.enemies.hpMultiplier}x
                      </span>
                      <input
                        type="range"
                        min={0.5}
                        max={2.5}
                        step={0.1}
                        value={config.enemies.hpMultiplier}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            enemies: { ...prev.enemies, hpMultiplier: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 5: GAME & STORYLINE SETTINGS ---------------- */}
            {activeTab === 'game' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Game Name / Title
                  </label>
                  <input
                    type="text"
                    value={config.gameTitle}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        gameTitle: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-amber-300 font-bold text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. Ramayana 2D Action Adventure"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Game Subtitle / Story Header
                  </label>
                  <input
                    type="text"
                    value={config.gameSubtitle}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        gameSubtitle: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. A Mythological Epic Platformer • The Saga of Archer Umesh"
                  />
                </div>

                <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-xs text-neutral-400 leading-relaxed">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase">
                    Admin Storage & Real-Time Sync Information
                  </h4>
                  <p>
                    All customizations (names, colors, damage numbers, HP values, control scale and opacity, dialogues) are instantly persisted in browser local storage and applied into the 2D canvas, HUD, dialogue system, and virtual controls without requiring page reload.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ================= SAVE SUCCESS TOAST ================= */}
          {saveToast && (
            <div className="mx-6 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveToast}</span>
            </div>
          )}

          {/* ================= FOOTER ACTIONS ================= */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              id="admin-save-btn"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-950 text-xs font-bold tracking-wide shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Apply Changes</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
