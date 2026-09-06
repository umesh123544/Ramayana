import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, HeartCrack } from 'lucide-react';
import { adminConfig } from '../systems/adminConfig';

interface GameOverModalProps {
  isOpen: boolean;
  onRestart: () => void;
  onMainMenu?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onRestart,
  onMainMenu,
}) => {
  const heroName = adminConfig.get().hero.name || 'Umesh';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 bg-neutral-950/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-4 select-none"
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            className="w-full max-w-sm sm:max-w-md bg-neutral-900 border-2 border-red-900/60 rounded-2xl p-5 sm:p-7 flex flex-col items-center text-center shadow-[0_0_50px_rgba(153,27,27,0.4)]"
          >
            {/* Demon/broken heart icon */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-500 mb-3 sm:mb-4 shadow-inner">
              <HeartCrack className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>

            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-widest text-red-400 mb-1">
              Sacred Lives Fallen
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-red-500 tracking-wider font-['Cinzel'] mb-2 sm:mb-3">
              GAME OVER
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-5 sm:mb-6 max-w-xs">
              {heroName} has fallen before the demon forces. Reignite the inner divine fire and try again.
            </p>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                id="restart-game-btn"
                onClick={onRestart}
                className="flex items-center justify-center gap-2 w-full py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART ADVENTURE</span>
              </button>

              {onMainMenu && (
                <button
                  id="game-over-main-menu-btn"
                  onClick={onMainMenu}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-300 border border-neutral-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>Main Menu / Change Difficulty</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
