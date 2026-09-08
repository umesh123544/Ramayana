import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface DivineBlessingBannerProps {
  show: boolean;
  message?: string;
}

export const DivineBlessingBanner: React.FC<DivineBlessingBannerProps> = ({
  show,
  message = 'DIVINE BLESSING',
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute top-16 sm:top-20 left-0 right-0 z-30 flex flex-col items-center justify-center pointer-events-none px-4"
        >
          <div className="relative flex flex-col items-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-neutral-950/90 border border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] backdrop-blur-md">
            {/* Sacred Announcement */}
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <h2 className="text-sm sm:text-base font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-['Cinzel']">
                {message}
              </h2>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
