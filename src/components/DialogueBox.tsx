import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { adminConfig } from '../systems/adminConfig';

interface DialogueBoxProps {
  dialogue: string | null;
  onClose: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  dialogue,
  onClose,
}) => {
  const companionName = adminConfig.get().companion.name || 'Purneema';
  const companionRole = adminConfig.get().companion.role || 'Sacred Ashram Supporting Heroine';

  return (
    <AnimatePresence>
      {dialogue && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="absolute bottom-16 sm:bottom-24 left-2 right-2 sm:left-4 sm:right-4 md:left-auto md:right-auto md:w-[540px] md:translate-x-[-50%] md:left-1/2 z-30 pointer-events-auto select-none max-w-[96vw] mx-auto"
        >
          <div className="bg-neutral-950/94 backdrop-blur-md border-2 border-rose-500/40 rounded-2xl p-3.5 sm:p-5 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-2 sm:pb-2.5 mb-2.5 sm:mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-900/60 border border-rose-400 flex items-center justify-center text-rose-300 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-rose-300 font-['Cinzel'] truncate">
                    {companionName}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-neutral-400 font-mono truncate">
                    {companionRole}
                  </p>
                </div>
              </div>

              <button
                id="close-dialogue-btn"
                onClick={onClose}
                className="p-1 sm:p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal mb-3 sm:mb-4">
              "{dialogue}"
            </p>

            <div className="flex items-center justify-between text-[11px] sm:text-xs gap-2">
              <span className="text-rose-400 font-medium flex items-center gap-1 text-[10px] sm:text-xs truncate">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>Lotus Blessing (+Divine Energy & HP)</span>
              </span>

              <button
                id="continue-dialogue-btn"
                onClick={onClose}
                className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors cursor-pointer shrink-0"
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
