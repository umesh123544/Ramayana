import React, { useEffect, useState } from 'react';
import { RotateCw, Swords } from 'lucide-react';

/**
 * Full-screen overlay shown on mobile/touch devices when held in portrait mode.
 * The game is designed for landscape play, so we block interaction and ask
 * the player to rotate their device instead of letting the layout break.
 */
export const OrientationGuard: React.FC = () => {
  const [shouldPrompt, setShouldPrompt] = useState(false);

  useEffect(() => {
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Best-effort auto-rotate: works for installed/standalone PWAs on Android
    // Chrome without needing a fullscreen gesture first. Browsers that block
    // this (regular mobile tabs, iOS Safari) just reject the promise, and the
    // rotate-prompt overlay below covers that case instead.
    const tryLockLandscape = () => {
      const orientation = (screen as any).orientation;
      if (orientation && typeof orientation.lock === 'function') {
        orientation.lock('landscape').catch(() => {
          /* not allowed in this context - the manual rotate prompt handles it */
        });
      }
    };

    if (isTouchDevice) {
      tryLockLandscape();
    }

    const check = () => {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches && window.innerWidth < 900;
      setShouldPrompt(isTouchDevice && isPortrait);
    };

    check();

    const mq = window.matchMedia('(orientation: portrait)');
    const onChange = () => {
      check();
      if (isTouchDevice) tryLockLandscape();
    };

    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    window.addEventListener('resize', onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  if (!shouldPrompt) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 bg-neutral-950 text-neutral-100 p-6 text-center select-none">
      <div className="relative">
        <Swords className="w-10 h-10 text-amber-500/40 absolute -left-8 top-1" />
        <RotateCw className="w-16 h-16 text-amber-400 animate-[spin_2.2s_linear_infinite]" />
      </div>
      <h2 className="text-lg font-black tracking-wide font-['Cinzel'] text-amber-300">
        Rotate Your Device
      </h2>
      <p className="text-sm text-neutral-400 max-w-xs">
        RAMAYAN is best played in landscape mode. Please turn your phone sideways to continue your journey.
      </p>
    </div>
  );
};
