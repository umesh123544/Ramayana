import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sun } from 'lucide-react';

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
          className="absolute top-24 left-0 right-0 z-30 flex flex-col items-center justify-center pointer-events-none px-4"
        >
          <div className="relative flex flex-col items-center px-8 py-4 rounded-2xl bg-neutral-950/90 border-2 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.7)] backdrop-blur-md">
            {/* Radiant decorative rays */}
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
              <span className="text-xs uppercase tracking-widest text-amber-300/80 font-mono">
                Om Suryaya Namaha • Sacred Grace
              </span>
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            </div>

            {/* Sacred Announcement */}
            <h2 className="text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-['Cinzel'] drop-shadow-md">
              {message}
            </h2>

            <p className="text-xs text-amber-100/90 mt-1 font-medium text-center max-w-sm">
              Sacred light restores your vitality and grants divine protection.
            </p>

            {/* Golden bottom accent */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-2" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
