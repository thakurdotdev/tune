"use client";

import { useEffect, useCallback } from "react";
import { Song } from "@/types/song";

interface MediaSessionHookProps {
  currentSong: Song | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
}

export function useEnhancedMediaSession({
  currentSong,
  isPlaying,
  duration,
  currentTime,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
}: MediaSessionHookProps) {
  const getArtworkUrl = (song: Song) => {
    if (song.artwork) return song.artwork;
    if (song.image && song.image.length > 0) {
      return song.image[song.image.length - 1]?.link || song.image[0]?.link;
    }
    return "/logo.png"; // Fallback to app logo
  };

  const updateMediaSession = useCallback(() => {
    if (!("mediaSession" in navigator) || !currentSong) return;

    // Set metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.name || currentSong.title || "Unknown Title",
      artist: currentSong.artist || currentSong.subtitle || "Unknown Artist",
      album: currentSong.album || "Unknown Album",
      artwork: [
        {
          src: getArtworkUrl(currentSong),
          sizes: "96x96",
          type: "image/jpeg",
        },
        {
          src: getArtworkUrl(currentSong),
          sizes: "128x128",
          type: "image/jpeg",
        },
        {
          src: getArtworkUrl(currentSong),
          sizes: "192x192",
          type: "image/jpeg",
        },
        {
          src: getArtworkUrl(currentSong),
          sizes: "256x256",
          type: "image/jpeg",
        },
        {
          src: getArtworkUrl(currentSong),
          sizes: "384x384",
          type: "image/jpeg",
        },
        {
          src: getArtworkUrl(currentSong),
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    });

    // Set playback state
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    // Update position state
    if (duration > 0) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1,
        position: currentTime,
      });
    }
  }, [currentSong, isPlaying, duration, currentTime]);

  const setupActionHandlers = useCallback(() => {
    if (!("mediaSession" in navigator)) return;

    // Basic playback controls
    navigator.mediaSession.setActionHandler("play", onPlay);
    navigator.mediaSession.setActionHandler("pause", onPause);
    navigator.mediaSession.setActionHandler("stop", onPause);

    // Track navigation
    navigator.mediaSession.setActionHandler("nexttrack", onNext);
    navigator.mediaSession.setActionHandler("previoustrack", onPrevious);

    // Seeking
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) {
        onSeek(details.seekTime);
      }
    });

    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const skipTime = details.seekOffset || 10;
      onSeek(Math.max(0, currentTime - skipTime));
    });

    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const skipTime = details.seekOffset || 10;
      onSeek(Math.min(duration, currentTime + skipTime));
    });

    // Additional controls (may not be supported on all platforms)
    try {
      navigator.mediaSession.setActionHandler("skipad", () => {
        // Skip advertisement if applicable
        onNext();
      });
    } catch (error) {
      console.log("Skipad action not supported");
    }
  }, [onPlay, onPause, onNext, onPrevious, onSeek, currentTime, duration]);

  // Setup media session when component mounts
  useEffect(() => {
    setupActionHandlers();
  }, [setupActionHandlers]);

  // Update media session when song or playback state changes
  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);

  // Listen for service worker messages for music control
  useEffect(() => {
    const handleSWMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action, data } = customEvent.detail;

      switch (action) {
        case "play":
          onPlay();
          break;
        case "pause":
          onPause();
          break;
        case "next":
          onNext();
          break;
        case "previous":
          onPrevious();
          break;
      }
    };

    window.addEventListener("sw-music-control", handleSWMessage);

    return () => {
      window.removeEventListener("sw-music-control", handleSWMessage);
    };
  }, [onPlay, onPause, onNext, onPrevious]);

  // Background audio focus handling
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleVisibilityChange = () => {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "VISIBILITY_CHANGE",
          data: {
            hidden: document.hidden,
            isPlaying: isPlaying,
            currentSong: currentSong,
          },
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying, currentSong]);

  return {
    updateMediaSession,
    setupActionHandlers,
  };
}

// Hook for background sync
export function useBackgroundSync() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          // Check if background sync is supported
          if ("sync" in registration) {
            // Register for background sync
            return (registration as any).sync.register("background-sync");
          }
        })
        .catch((error) => {
          console.log("Background sync registration failed:", error);
        });
    }
  }, []);
}

// Hook for wake lock (prevents screen from turning off during music playback)
export function useWakeLock(isPlaying: boolean) {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && isPlaying) {
          wakeLock = await navigator.wakeLock.request("screen");
          console.log("Wake lock acquired");
        }
      } catch (error) {
        console.error("Wake lock request failed:", error);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLock) {
        await wakeLock.release();
        wakeLock = null;
        console.log("Wake lock released");
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && wakeLock) {
        releaseWakeLock();
      } else if (!document.hidden && isPlaying) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);
}
