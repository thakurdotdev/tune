"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content available, prompt user to refresh
                  if (confirm("New version available! Refresh to update?")) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        const { type, action, data } = event.data;

        if (type === "MUSIC_CONTROL") {
          // Handle music control messages from service worker
          const musicEvent = new CustomEvent("sw-music-control", {
            detail: { action, data },
          });
          window.dispatchEvent(musicEvent);
        }
      });
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log("PWA was installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Function to trigger PWA installation
  const installPWA = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Make install function available globally
  useEffect(() => {
    (window as any).installTuneApp = installPWA;
  }, [deferredPrompt]);

  return (
    <>
      {children}
      {isInstallable && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg max-w-sm">
            <p className="text-sm mb-2">
              Install Tune for a better experience!
            </p>
            <div className="flex gap-2">
              <button
                onClick={installPWA}
                className="bg-background text-foreground px-3 py-1 rounded text-sm hover:bg-muted transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setIsInstallable(false)}
                className="bg-transparent border border-primary-foreground text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary-foreground hover:text-primary transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for PWA utilities
export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);
    };

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    checkInstalled();
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", checkInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window
        .matchMedia("(display-mode: standalone)")
        .removeEventListener("change", checkInstalled);
    };
  }, []);

  const sendMessageToSW = (message: any) => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  };

  return {
    isOnline,
    isInstalled,
    sendMessageToSW,
    installApp: () => (window as any).installTuneApp?.(),
  };
}
