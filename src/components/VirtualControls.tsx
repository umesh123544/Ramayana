import React, { useRef, useState, useEffect } from 'react';
import { PlayerInput } from '../systems/characterController';
import {
  Zap,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  MoveHorizontal,
  MessageCircle,
} from 'lucide-react';

interface VirtualControlsProps {
  onInputChange: (input: Partial<PlayerInput>) => void;
  canInteract: boolean;
  onInteract: () => void;
  divineReady: boolean;
  visible?: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onInputChange,
  canInteract,
  onInteract,
  divineReady,
  visible = true,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const attackBtnRef = useRef<HTMLButtonElement>(null);
  const [controlMode, setControlMode] = useState<'dpad' | 'joystick'>('dpad');
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isTouchingJoy, setIsTouchingJoy] = useState(false);
  const [isAttackHeld, setIsAttackHeld] = useState(false);
  const [attackAimAngle, setAttackAimAngle] = useState<number | null>(null);
  const [chargeProgress, setChargeProgress] = useState(0);

  // Attack charge timer animation
  useEffect(() => {
    let animId: number;
    let startTime: number;
    if (isAttackHeld) {
      startTime = Date.now();
      const tick = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(1, elapsed / 0.85);
        setChargeProgress(progress);
        if (progress < 1) {
          animId = requestAnimationFrame(tick);
        }
      };
      animId = requestAnimationFrame(tick);
    } else {
      setChargeProgress(0);
      setAttackAimAngle(null);
    }
    return () => cancelAnimationFrame(animId);
  }, [isAttackHeld]);

  if (!visible) return null;

  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 38;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });

    const threshold = 10;
    const runThreshold = 26;
    const isLeft = kx < -threshold;
    const isRight = kx > threshold;
    const isUp = ky < -threshold;
    const isDown = ky > threshold;
    const isRun = Math.abs(kx) > runThreshold;

    let aimDir = undefined;
    if (dist > 8) {
      aimDir = { x: Math.cos(angle), y: Math.sin(angle) };
    }

    onInputChange({
      left: isLeft,
      right: isRight,
      up: isUp,
      down: isDown,
      run: isRun,
      aimDir,
    });
  };

  const handleAttackTouchMove = (clientX: number, clientY: number) => {
    if (!attackBtnRef.current) return;
    const rect = attackBtnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist > 12) {
      const angle = Math.atan2(dy, dx);
      setAttackAimAngle(angle);
      onInputChange({
        aimDir: { x: Math.cos(angle), y: Math.sin(angle) },
      });
    }
  };

  return (
    <div
      id="virtual-controls-overlay"
      className="fixed inset-x-0 bottom-0 pointer-events-none z-30 select-none pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 sm:px-6 touch-none"
    >
      <div className="flex items-end justify-between w-full max-w-7xl mx-auto">
        {/* ================= BOTTOM LEFT: Movement & Aiming Controls ================= */}
        <div className="pointer-events-auto flex flex-col items-start gap-1.5">
          {/* Mode Switcher Pill */}
          <button
            id="toggle-control-mode-btn"
            onClick={() => setControlMode((prev) => (prev === 'dpad' ? 'joystick' : 'dpad'))}
            className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-neutral-900/95 border border-amber-500/40 text-amber-300 hover:bg-neutral-800 flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer touch-none"
            title="Switch between D-Pad buttons and 360° Joystick"
          >
            {controlMode === 'dpad' ? (
              <>
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                <span>4-WAY D-PAD (बटन)</span>
              </>
            ) : (
              <>
                <MoveHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>360° STICK (स्टिक)</span>
              </>
            )}
          </button>

          {controlMode === 'dpad' ? (
            /* Full 4-way Directional Pad (Left, Right, Up, Down for Aiming & Movement) */
            <div className="p-1 rounded-2xl bg-neutral-950/90 backdrop-blur-md border-2 border-amber-500/40 shadow-2xl flex flex-col items-center">
              {/* Up Button (Aim Up / Jump) */}
              <button
                id="btn-dpad-up"
                onTouchStart={(e) => {
                  e.preventDefault();
                  onInputChange({ up: true, jump: true, aimDir: { x: 0, y: -1 } });
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onInputChange({ up: false, jump: false });
                }}
                onMouseDown={() => onInputChange({ up: true, jump: true, aimDir: { x: 0, y: -1 } })}
                onMouseUp={() => onInputChange({ up: false, jump: false })}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-neutral-900 active:bg-amber-600 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center font-bold transition-transform active:scale-90 touch-none cursor-pointer"
                title="Aim Up / Jump (माथि)"
              >
                <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[7px] font-mono uppercase text-amber-200/80 -mt-1">माथि</span>
              </button>

              {/* Middle Row: Left & Right */}
              <div className="flex items-center gap-1 my-1">
                <button
                  id="btn-move-left"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onInputChange({ left: true, aimDir: { x: -1, y: 0 } });
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onInputChange({ left: false });
                  }}
                  onMouseDown={() => onInputChange({ left: true, aimDir: { x: -1, y: 0 } })}
                  onMouseUp={() => onInputChange({ left: false })}
                  className="w-12 h-11 sm:w-13 sm:h-12 rounded-lg bg-neutral-900 active:bg-amber-600 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center font-bold transition-transform active:scale-90 touch-none cursor-pointer"
                  title="Move Left (बायाँ)"
                >
                  <ChevronLeft className="w-6 h-6" />
                  <span className="text-[7px] font-mono uppercase text-amber-200/80 -mt-1">बायाँ</span>
                </button>

                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>

                <button
                  id="btn-move-right"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onInputChange({ right: true, aimDir: { x: 1, y: 0 } });
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onInputChange({ right: false });
                  }}
                  onMouseDown={() => onInputChange({ right: true, aimDir: { x: 1, y: 0 } })}
                  onMouseUp={() => onInputChange({ right: false })}
                  className="w-12 h-11 sm:w-13 sm:h-12 rounded-lg bg-neutral-900 active:bg-amber-600 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center font-bold transition-transform active:scale-90 touch-none cursor-pointer"
                  title="Move Right (दायाँ)"
                >
                  <ChevronRight className="w-6 h-6" />
                  <span className="text-[7px] font-mono uppercase text-amber-200/80 -mt-1">दायाँ</span>
                </button>
              </div>

              {/* Down Button (Aim Down) */}
              <button
                id="btn-dpad-down"
                onTouchStart={(e) => {
                  e.preventDefault();
                  onInputChange({ down: true, aimDir: { x: 0, y: 1 } });
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onInputChange({ down: false });
                }}
                onMouseDown={() => onInputChange({ down: true, aimDir: { x: 0, y: 1 } })}
                onMouseUp={() => onInputChange({ down: false })}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-neutral-900 active:bg-amber-600 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center font-bold transition-transform active:scale-90 touch-none cursor-pointer"
                title="Aim Down (तल)"
              >
                <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[7px] font-mono uppercase text-amber-200/80 -mt-1">तल</span>
              </button>
            </div>
          ) : (
            /* 360° Virtual Analog Joystick (Multi-Directional Movement & Aiming) */
            <div
              id="virtual-joystick-base"
              ref={joystickRef}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsTouchingJoy(true);
                handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                if (isTouchingJoy) handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                setIsTouchingJoy(false);
                setKnobPos({ x: 0, y: 0 });
                onInputChange({ left: false, right: false, up: false, down: false, run: false, aimDir: undefined });
              }}
              onMouseDown={() => setIsTouchingJoy(true)}
              onMouseMove={(e) => isTouchingJoy && handleJoystickMove(e.clientX, e.clientY)}
              onMouseUp={() => {
                setIsTouchingJoy(false);
                setKnobPos({ x: 0, y: 0 });
                onInputChange({ left: false, right: false, up: false, down: false, run: false, aimDir: undefined });
              }}
              className="w-26 h-26 sm:w-30 sm:h-30 rounded-full bg-neutral-950/90 backdrop-blur-md border-2 border-amber-500/50 relative flex items-center justify-center shadow-2xl active:border-amber-400 touch-none cursor-pointer"
            >
              {/* 4 Compass labels */}
              <div className="absolute top-1.5 text-[8px] font-mono font-bold text-amber-300/80 pointer-events-none">
                ▲ माथि (UP)
              </div>
              <div className="absolute bottom-1.5 text-[8px] font-mono font-bold text-amber-300/80 pointer-events-none">
                ▼ तल (DOWN)
              </div>
              <div className="absolute left-2 text-[8px] font-mono font-bold text-amber-300/80 pointer-events-none">
                ◀ बायाँ
              </div>
              <div className="absolute right-2 text-[8px] font-mono font-bold text-amber-300/80 pointer-events-none">
                दायाँ ▶
              </div>

              {/* Central Joystick Knob */}
              <div
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-amber-200 shadow-xl flex items-center justify-center pointer-events-none transition-transform duration-75"
                style={{
                  transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                }}
              >
                <Crosshair className="w-5 h-5 text-neutral-950 opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* ================= BOTTOM RIGHT: Action Buttons ================= */}
        <div className="pointer-events-auto flex flex-col items-end gap-2.5">
          {/* Interaction Button (when near Purneema) */}
          {canInteract && (
            <button
              id="interact-purneema-mobile-btn"
              onClick={onInteract}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl border-2 border-rose-300 animate-bounce transition-all cursor-pointer touch-none"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Talk to Purneema (कुरा गर्नुहोस्)</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 sm:gap-3 p-1.5 rounded-2xl bg-neutral-950/90 backdrop-blur-md border-2 border-amber-500/40 shadow-2xl">
            {/* Divine Power Button */}
            <button
              id="btn-divine-power"
              onTouchStart={(e) => {
                e.preventDefault();
                onInputChange({ divinePower: true });
              }}
              onClick={() => onInputChange({ divinePower: true })}
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 touch-none cursor-pointer ${
                divineReady
                  ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-amber-200 text-neutral-950 animate-pulse shadow-[0_0_16px_rgba(251,191,36,0.8)]'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
              title="Activate Divine Blessing (दिव्य शक्ति)"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase">शक्ति</span>
            </button>

            {/* Jump Button */}
            <button
              id="btn-jump"
              onTouchStart={(e) => {
                e.preventDefault();
                onInputChange({ jump: true });
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                onInputChange({ jump: false });
              }}
              onMouseDown={() => onInputChange({ jump: true })}
              onMouseUp={() => onInputChange({ jump: false })}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-900 active:bg-amber-600 active:scale-90 border-2 border-amber-500/50 text-amber-300 flex flex-col items-center justify-center shadow-xl transition-all touch-none cursor-pointer"
              title="Jump (उफ्रिनुहोस्)"
            >
              <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase -mt-0.5">Jump</span>
            </button>

            {/* Attack / Bow Button with 360° Drag Aiming */}
            <button
              id="btn-attack"
              ref={attackBtnRef}
              onTouchStart={(e) => {
                e.preventDefault();
                setIsAttackHeld(true);
                handleAttackTouchMove(e.touches[0].clientX, e.touches[0].clientY);
                onInputChange({ attackDown: true, attackRelease: false });
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                if (isAttackHeld) {
                  handleAttackTouchMove(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                setIsAttackHeld(false);
                onInputChange({ attackDown: false, attackRelease: true });
              }}
              onMouseDown={() => {
                setIsAttackHeld(true);
                onInputChange({ attackDown: true, attackRelease: false });
              }}
              onMouseUp={() => {
                setIsAttackHeld(false);
                onInputChange({ attackDown: false, attackRelease: true });
              }}
              className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl transition-all touch-none cursor-pointer overflow-hidden ${
                isAttackHeld
                  ? 'bg-amber-500 border-yellow-200 text-neutral-950 scale-95 shadow-[0_0_20px_rgba(251,191,36,0.9)]'
                  : 'bg-gradient-to-tr from-amber-700 to-amber-500 border-amber-300 text-white active:scale-95'
              }`}
              title="Bow Shot (Hold & Drag to Aim anywhere / वाण हान्नुहोस्)"
            >
              {/* Charge progress ring overlay */}
              {isAttackHeld && (
                <div
                  className="absolute inset-0 bg-yellow-300/35 transition-all pointer-events-none"
                  style={{
                    clipPath: `inset(${100 - chargeProgress * 100}% 0 0 0)`,
                  }}
                />
              )}

              {/* Aiming arrow reticle on button when dragged */}
              {attackAimAngle !== null && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `rotate(${attackAimAngle}rad)`,
                  }}
                >
                  <div className="w-1.5 h-6 bg-red-600 rounded-full shadow-lg translate-y-3" />
                </div>
              )}

              <Crosshair className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight relative z-10">
                {isAttackHeld ? (chargeProgress >= 1 ? 'CHARGED!' : 'AIMING...') : 'FIRE'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
