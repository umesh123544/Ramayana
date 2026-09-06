import React, { useRef, useState } from 'react';
import { PlayerInput } from '../systems/characterController';
import { Zap, Crosshair, ArrowUp, MessageCircle, ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';

interface VirtualControlsProps {
  onInputChange: (input: Partial<PlayerInput>) => void;
  canInteract: boolean;
  onInteract: () => void;
  divineReady: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onInputChange,
  canInteract,
  onInteract,
  divineReady,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [controlMode, setControlMode] = useState<'joystick' | 'dpad'>('joystick');
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);
  const [isAttackHeld, setIsAttackHeld] = useState(false);

  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * 0.5;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 32;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });

    // Determine left / right / run
    const threshold = 10;
    const runThreshold = 24;
    const isLeft = kx < -threshold;
    const isRight = kx > threshold;
    const isRun = Math.abs(kx) > runThreshold;

    onInputChange({
      left: isLeft,
      right: isRight,
      run: isRun,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsTouching(true);
    const touch = e.touches[0];
    handleJoystickMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isTouching) return;
    const touch = e.touches[0];
    handleJoystickMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsTouching(false);
    setKnobPos({ x: 0, y: 0 });
    onInputChange({ left: false, right: false, run: false });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none flex flex-col justify-end p-2 sm:p-4 md:p-6 touch-none">
      <div className="flex items-end justify-between w-full max-w-7xl mx-auto">
        {/* ================= BOTTOM LEFT: Movement Controls (Joystick or D-Pad) ================= */}
        <div className="pointer-events-auto flex flex-col items-start gap-1">
          {/* Mode Switcher Pill */}
          <button
            onClick={() => setControlMode(controlMode === 'joystick' ? 'dpad' : 'joystick')}
            className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-neutral-900/80 border border-neutral-700 text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Toggle between Analog Stick and Direction Buttons"
          >
            <Gamepad2 className="w-3 h-3" />
            <span>{controlMode === 'joystick' ? 'Stick' : 'D-Pad'}</span>
          </button>

          {controlMode === 'joystick' ? (
            /* Virtual Joystick */
            <div
              id="virtual-joystick-base"
              ref={joystickRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => setIsTouching(true)}
              onMouseMove={(e) => isTouching && handleJoystickMove(e.clientX, e.clientY)}
              onMouseUp={() => {
                setIsTouching(false);
                setKnobPos({ x: 0, y: 0 });
                onInputChange({ left: false, right: false, run: false });
              }}
              onMouseLeave={() => {
                if (isTouching) {
                  setIsTouching(false);
                  setKnobPos({ x: 0, y: 0 });
                  onInputChange({ left: false, right: false, run: false });
                }
              }}
              className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-neutral-900/75 backdrop-blur-md border-2 border-amber-500/40 relative flex items-center justify-center shadow-xl active:border-amber-400 touch-none"
            >
              {/* Left / Right Indicators */}
              <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none opacity-40 text-[9px] font-mono text-amber-300">
                <span>◀ A</span>
                <span>D ▶</span>
              </div>

              {/* Draggable Knob */}
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border border-amber-200 shadow-md transition-transform duration-75 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                }}
              >
                <div className="w-3 h-3 rounded-full bg-amber-900/50" />
              </div>
            </div>
          ) : (
            /* D-Pad Buttons */
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900/75 backdrop-blur-md border border-neutral-700 shadow-xl">
              <button
                id="dpad-left-btn"
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
                className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 text-amber-300 flex items-center justify-center shadow font-bold text-sm touch-none cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                id="dpad-right-btn"
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
                className="w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 text-amber-300 flex items-center justify-center shadow font-bold text-sm touch-none cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* ================= BOTTOM RIGHT: Action Buttons ================= */}
        <div className="pointer-events-auto flex flex-col items-end gap-2 sm:gap-2.5">
          {/* Interaction Button (when near Purneema) */}
          {canInteract && (
            <button
              id="interact-purneema-btn"
              onClick={onInteract}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-lg border border-rose-300/60 animate-bounce transition-all cursor-pointer touch-none"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Talk to Purneema</span>
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Divine Power Button */}
            <button
              id="divine-power-btn"
              onTouchStart={(e) => {
                e.preventDefault();
                onInputChange({ divinePower: true });
              }}
              onClick={() => onInputChange({ divinePower: true })}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 touch-none cursor-pointer ${
                divineReady
                  ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-amber-200 text-neutral-950 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.7)]'
                  : 'bg-neutral-900/80 border-neutral-700 text-neutral-400'
              }`}
              title="Activate Divine Blessing"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight">Divine</span>
            </button>

            {/* Jump Button */}
            <button
              id="jump-btn"
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
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-900/85 hover:bg-neutral-800 active:bg-amber-600 active:scale-90 border-2 border-amber-500/40 text-amber-300 flex flex-col items-center justify-center shadow-lg transition-all touch-none cursor-pointer"
              title="Jump"
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase">Jump</span>
            </button>

            {/* Attack / Bow Button */}
            <button
              id="attack-btn"
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
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex flex-col items-center justify-center shadow-xl transition-all touch-none cursor-pointer ${
                isAttackHeld
                  ? 'bg-amber-500 border-yellow-200 text-neutral-950 scale-95 shadow-[0_0_16px_rgba(251,191,36,0.8)]'
                  : 'bg-gradient-to-tr from-amber-700 to-amber-500 border-amber-300 text-white hover:from-amber-600 hover:to-amber-400'
              }`}
              title="Bow Shot (Hold for Charged Shot)"
            >
              <Crosshair className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-tight">
                {isAttackHeld ? 'Release' : 'Attack'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
