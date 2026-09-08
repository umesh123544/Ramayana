import React, { useRef, useState, useEffect } from 'react';
import { PlayerInput } from '../systems/characterController';
import { adminConfig, ControlsConfig } from '../systems/adminConfig';
import {
  Zap,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  MoveHorizontal,
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

  const [controlsCfg, setControlsCfg] = useState<ControlsConfig>(
    () => adminConfig.get().controls || {
      scale: 1.0,
      opacity: 0.9,
      dpadType: 'dpad',
      bottomOffset: 12,
      sideOffset: 14,
      swapSides: false,
      showControls: true,
    }
  );

  const [controlMode, setControlMode] = useState<'dpad' | 'joystick'>(() => controlsCfg.dpadType || 'dpad');
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isTouchingJoy, setIsTouchingJoy] = useState(false);
  const [isAttackHeld, setIsAttackHeld] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);

  // Subscribe to live admin configuration changes
  useEffect(() => {
    const unsub = adminConfig.subscribe((cfg) => {
      if (cfg.controls) {
        setControlsCfg(cfg.controls);
        setControlMode(cfg.controls.dpadType);
      }
    });
    return () => unsub();
  }, []);

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
    }
    return () => cancelAnimationFrame(animId);
  }, [isAttackHeld]);

  if (!visible || !controlsCfg.showControls) return null;

  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 38 * (controlsCfg.scale || 1.0);

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

    onInputChange({
      left: isLeft,
      right: isRight,
      up: isUp,
      down: isDown,
      run: isRun,
    });
  };

  const scale = controlsCfg.scale || 1.0;
  const opacity = controlsCfg.opacity !== undefined ? controlsCfg.opacity : 0.9;
  const bottomOffset = controlsCfg.bottomOffset !== undefined ? controlsCfg.bottomOffset : 12;
  const sideOffset = controlsCfg.sideOffset !== undefined ? controlsCfg.sideOffset : 14;
  const swapSides = !!controlsCfg.swapSides;

  // D-Pad or Joystick component
  const movementCluster = (
    <div
      className="pointer-events-auto flex flex-col items-start gap-1.5 origin-bottom-left transition-transform"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: swapSides ? 'bottom right' : 'bottom left',
      }}
    >
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
            <span>4-WAY D-PAD</span>
          </>
        ) : (
          <>
            <MoveHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>360° JOYSTICK</span>
          </>
        )}
      </button>

      {controlMode === 'dpad' ? (
        /* Full 4-way Directional Pad */
        <div className="p-1 rounded-2xl bg-neutral-950/90 backdrop-blur-md border-2 border-amber-500/40 shadow-2xl flex flex-col items-center">
          {/* Up Button (Jump) */}
          <button
            id="btn-dpad-up"
            onTouchStart={(e) => {
              e.preventDefault();
              onInputChange({ up: true, jump: true });
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onInputChange({ up: false, jump: false });
            }}
            onMouseDown={() => onInputChange({ up: true, jump: true })}
            onMouseUp={() => onInputChange({ up: false, jump: false })}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-neutral-900 active:bg-amber-600 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center font-bold transition-transform active:scale-90 touch-none cursor-pointer"
            title="Jump / Up"
          >
            <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[7px] font-mono uppercase text-amber-200/80 -mt-1">UP</span>
          </button>

          {/* Middle Row: Left & Right */}
          <div className="flex items-center gap-1 my-1">
            <button
              id="btn-move-left"
              onTouchStart={(e) => {
                e.preventDefault();
                onInputChange({ left: true });
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                onInputChange({ left: false });
              }}
              onMouseDown={() => onInputChange({ left: true })}
              onMouseUp={() => onInputChange({ left: false })}
              className="w-12 h-11 sm:w-13 sm:h-12 rounded-lg bg-neutral-900 active:bg-amber-600 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center font-bold transition-transform active:scale-90 touch-none cursor-pointer"
              title="Move Left"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-[7px] font-mono uppercase text-amber-200/80 -mt-1">LEFT</span>
            </button>

            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
            </div>

            <button
              id="btn-move-right"
              onTouchStart={(e) => {
                e.preventDefault();
                onInputChange({ right: true });
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                onInputChange({ right: false });
              }}
              onMouseDown={() => onInputChange({ right: true })}
              onMouseUp={() => onInputChange({ right: false })}
              className="w-12 h-11 sm:w-13 sm:h-12 rounded-lg bg-neutral-900 active:bg-amber-600 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center font-bold transition-transform active:scale-90 touch-none cursor-pointer"
              title="Move Right"
            >
              <ChevronRight className="w-6 h-6" />
              <span className="text-[7px] font-mono uppercase text-amber-200/80 -mt-1">RIGHT</span>
            </button>
          </div>

          {/* Down Button (Duck / Drop) */}
          <button
            id="btn-dpad-down"
            onTouchStart={(e) => {
              e.preventDefault();
              onInputChange({ down: true });
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onInputChange({ down: false });
            }}
            onMouseDown={() => onInputChange({ down: true })}
            onMouseUp={() => onInputChange({ down: false })}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-neutral-900 active:bg-amber-600 text-amber-300 border border-amber-500/30 flex flex-col items-center justify-center font-bold transition-transform active:scale-90 touch-none cursor-pointer"
            title="Duck / Down"
          >
            <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[7px] font-mono uppercase text-amber-200/80 -mt-1">DOWN</span>
          </button>
        </div>
      ) : (
        /* 360° Virtual Analog Joystick */
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
            onInputChange({ left: false, right: false, up: false, down: false, run: false });
          }}
          onMouseDown={() => setIsTouchingJoy(true)}
          onMouseMove={(e) => isTouchingJoy && handleJoystickMove(e.clientX, e.clientY)}
          onMouseUp={() => {
            setIsTouchingJoy(false);
            setKnobPos({ x: 0, y: 0 });
            onInputChange({ left: false, right: false, up: false, down: false, run: false });
          }}
          className="w-26 h-26 sm:w-30 sm:h-30 rounded-full bg-neutral-950/90 backdrop-blur-md border-2 border-amber-500/50 relative flex items-center justify-center shadow-2xl active:border-amber-400 touch-none cursor-pointer"
        >
          <div className="absolute top-1.5 text-[8px] font-mono font-bold text-amber-300/80 pointer-events-none">
            ▲ UP
          </div>
          <div className="absolute bottom-1.5 text-[8px] font-mono font-bold text-amber-300/80 pointer-events-none">
            ▼ DOWN
          </div>
          <div className="absolute left-2 text-[8px] font-mono font-bold text-amber-300/80 pointer-events-none">
            ◀ LEFT
          </div>
          <div className="absolute right-2 text-[8px] font-mono font-bold text-amber-300/80 pointer-events-none">
            RIGHT ▶
          </div>

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
  );

  // Action Buttons Cluster
  const actionCluster = (
    <div
      className="pointer-events-auto flex flex-col items-end gap-2.5 origin-bottom-right transition-transform"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: swapSides ? 'bottom left' : 'bottom right',
      }}
    >

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
          title="Divine Power"
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          <span className="text-[8px] sm:text-[9px] font-extrabold uppercase">DIVINE</span>
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
          title="Jump"
        >
          <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase -mt-0.5">Jump</span>
        </button>

        {/* Attack / Bow Button */}
        <button
          id="btn-attack"
          ref={attackBtnRef}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsAttackHeld(true);
            onInputChange({ attackDown: true, attackRelease: false });
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
          title="Fire Bow (Tap to shoot, hold to charge)"
        >
          {isAttackHeld && (
            <div
              className="absolute inset-0 bg-yellow-300/35 transition-all pointer-events-none"
              style={{
                clipPath: `inset(${100 - chargeProgress * 100}% 0 0 0)`,
              }}
            />
          )}

          <Crosshair className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight relative z-10">
            {isAttackHeld ? (chargeProgress >= 1 ? 'CHARGED!' : 'CHARGING...') : 'FIRE'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      id="virtual-controls-overlay"
      className="fixed inset-x-0 bottom-0 pointer-events-none z-30 select-none touch-none transition-opacity duration-200"
      style={{
        opacity,
        paddingBottom: `max(${bottomOffset}px, env(safe-area-inset-bottom))`,
        paddingLeft: `${sideOffset}px`,
        paddingRight: `${sideOffset}px`,
      }}
    >
      <div className="flex items-end justify-between w-full max-w-7xl mx-auto">
        {swapSides ? actionCluster : movementCluster}
        {swapSides ? movementCluster : actionCluster}
      </div>
    </div>
  );
};
