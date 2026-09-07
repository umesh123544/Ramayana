import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed or running standalone, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Android / Chrome / Edge flow with beforeinstallprompt
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-950 font-bold text-xs shadow-lg border border-amber-300 active:scale-95 transition-all cursor-pointer animate-pulse"
        title="Install RAMAYAN App to your home screen"
      >
        <Download className="w-4 h-4 text-neutral-950" />
        <span className="font-mono tracking-tight">INSTALL APP</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold text-xs shadow-md border border-amber-500/40 active:scale-95 transition-all cursor-pointer"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span className="font-mono tracking-tight">INSTALL (iOS)</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border-2 border-amber-500/50 p-6 shadow-2xl text-neutral-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-amber-200">Install on iPhone / iPad</h3>
                  <p className="text-xs text-neutral-400">RAMAYAN Mobile Web App</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-300 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <p>
                  1. Tap the <strong className="text-amber-300">Share</strong> icon in the Safari toolbar.
                </p>
                <p>
                  2. Scroll down and select <strong className="text-amber-300">'Add to Home Screen'</strong>.
                </p>
                <p>
                  3. Tap <strong className="text-amber-300">'Add'</strong> at the top right to install!
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider transition-colors cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback visible install button so users on all devices can click anytime
  return (
    <button
      id="pwa-general-install-btn"
      onClick={() => {
        alert('To install RAMAYAN App on your device, open your browser menu (⋮ or Share) and tap "Install App" or "Add to Home Screen".');
      }}
      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 text-[11px] font-mono border border-amber-500/30 active:scale-95 transition-all cursor-pointer"
      title="Install App"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span>Install App</span>
    </button>
  );
};
