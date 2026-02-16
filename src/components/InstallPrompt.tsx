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
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gray-900 border border-amber-600 rounded-lg p-4 flex items-center justify-between gap-3 shadow-lg"
         style={{ paddingBottom: `max(1rem, env(safe-area-inset-bottom))` }}>
      <p className="text-sm text-gray-200">Add to Home Screen for the best experience</p>
      <div className="flex gap-2 shrink-0">
        <button onClick={handleInstall} className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded text-sm">
          Install
        </button>
        <button onClick={handleDismiss} className="text-gray-500 hover:text-gray-300 py-2 px-2 text-sm">
          ✕
        </button>
      </div>
    </div>
  );
}
