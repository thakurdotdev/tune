"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Smartphone, Wifi, WifiOff } from "lucide-react";
import { usePWA } from "./PWAProvider";

export function PWAInstallButton() {
  const { installApp, isInstalled } = usePWA();
  const [showDialog, setShowDialog] = useState(false);

  if (isInstalled) {
    return null; // Don't show install button if already installed
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Install App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Install Tune App
          </DialogTitle>
          <DialogDescription>
            Install Tune as a Progressive Web App for the best experience:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full" />
              Works offline with cached music
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full" />
              Background music playback
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full" />
              Media controls in notification panel
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full" />
              App shortcuts and better performance
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full" />
              Native app-like experience
            </li>
          </ul>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                installApp();
                setShowDialog(false);
              }}
              className="flex-1"
            >
              Install Now
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PWAStatus() {
  const { isOnline, isInstalled } = usePWA();

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isInstalled && (
        <div className="flex items-center gap-1">
          <Smartphone className="h-4 w-4 text-green-600" />
          <span>PWA</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-600" />
            <span className="text-orange-600">Offline</span>
          </>
        )}
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="bg-orange-100 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 mb-4 rounded">
      <div className="flex items-center gap-2">
        <WifiOff className="h-5 w-5 text-orange-600" />
        <div>
          <p className="font-medium text-orange-800 dark:text-orange-200">
            You're offline
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            You can still play cached music and browse downloaded content.
          </p>
        </div>
      </div>
    </div>
  );
}
