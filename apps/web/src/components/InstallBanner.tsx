'use client';

import { useEffect, useState } from 'react';

export function InstallBanner() {
  const [prompt, setPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('pwa-dismissed')) { setDismissed(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt || dismissed) return null;

  const install = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted' || outcome === 'dismissed') {
      localStorage.setItem('pwa-dismissed', '1');
      setDismissed(true);
    }
  };

  const dismiss = () => {
    localStorage.setItem('pwa-dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-amber-900 text-amber-50 rounded-2xl shadow-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
        <span className="text-amber-900 font-bold text-sm">☕</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Install COFFEZ</p>
        <p className="text-xs text-amber-300">Add to home screen for the best experience</p>
      </div>
      <button onClick={install} className="shrink-0 bg-amber-50 text-amber-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
        Install
      </button>
      <button onClick={dismiss} className="shrink-0 text-amber-400 hover:text-amber-200 p-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
