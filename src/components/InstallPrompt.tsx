import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'wh40k-pwa-dismiss';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (dismissed || !deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 gd-panel border-[#c9a227] rounded-lg p-4 flex items-center justify-between gap-3 shadow-lg"
         style={{ paddingBottom: `max(1rem, env(safe-area-inset-bottom))` }}>
      <p className="text-sm gd-parchment">Add to Home Screen for the best experience</p>
      <div className="flex gap-2 shrink-0">
        <button onClick={handleInstall} className="gd-btn-gold py-2 px-4 rounded text-sm">
          Install
        </button>
        <button onClick={handleDismiss} className="gd-bone opacity-40 hover:opacity-70 py-2 px-2 text-sm">
          ✕
        </button>
      </div>
    </div>
  );
}
