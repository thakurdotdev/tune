"use client";

import type { MediaSessionState } from "@/types/music";
import type { Song } from "@/types/song";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface MediaSessionStore extends MediaSessionState {
  // Actions
  initializeMediaSession: (handlers: {
    onPlay: () => void;
    onPause: () => void;
    onPreviousTrack: () => void;
    onNextTrack: () => void;
    onSeekTo: (time: number) => void;
  }) => void;
  updateMetadata: (song: Song | null) => void;
  updatePlaybackState: (state: "playing" | "paused" | "none") => void;
  updatePosition: (position: number, duration: number) => void;
  setActive: (active: boolean) => void;
  cleanup: () => void;
}

// Check if Media Session API is supported
const isMediaSessionSupported = (): boolean => {
  return "mediaSession" in navigator && "MediaMetadata" in window;
};

export const useMediaSessionStore = create<MediaSessionStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isSupported: isMediaSessionSupported(),
    isActive: false,

    // Actions
    initializeMediaSession: (handlers) => {
      const { isSupported } = get();
      if (!isSupported) {
        console.warn("MediaSession API not supported");
        return;
      }

      try {
        console.log("Initializing MediaSession with handlers...");

        // Set up action handlers with error handling
        try {
          navigator.mediaSession.setActionHandler("play", () => {
            console.log("MediaSession: Play action triggered");
            handlers.onPlay();
          });
          console.log("MediaSession: Play handler registered");
        } catch (e) {
          console.warn("Failed to register play handler:", e);
        }

        try {
          navigator.mediaSession.setActionHandler("pause", () => {
            console.log("MediaSession: Pause action triggered");
            handlers.onPause();
          });
          console.log("MediaSession: Pause handler registered");
        } catch (e) {
          console.warn("Failed to register pause handler:", e);
        }

        try {
          navigator.mediaSession.setActionHandler("previoustrack", () => {
            console.log("MediaSession: Previous track action triggered");
            handlers.onPreviousTrack();
          });
          console.log("MediaSession: Previous track handler registered");
        } catch (e) {
          console.warn("Failed to register previoustrack handler:", e);
        }

        try {
          navigator.mediaSession.setActionHandler("nexttrack", () => {
            console.log("MediaSession: Next track action triggered");
            handlers.onNextTrack();
          });
          console.log("MediaSession: Next track handler registered");
        } catch (e) {
          console.warn("Failed to register nexttrack handler:", e);
        }

        // Seek handlers (if supported)
        try {
          navigator.mediaSession.setActionHandler("seekto", (details) => {
            console.log("MediaSession: Seek to action triggered", details);
            if (details.seekTime !== undefined) {
              handlers.onSeekTo(details.seekTime);
            }
          });
          console.log("MediaSession: Seek to handler registered");
        } catch (error) {
          console.warn("Seek to action not supported:", error);
        }

        try {
          // Skip forward/backward (10 seconds)
          navigator.mediaSession.setActionHandler("seekforward", (details) => {
            console.log("MediaSession: Seek forward action triggered", details);
            const seekOffset = details.seekOffset || 10;
            handlers.onSeekTo(seekOffset); // Relative seek
          });
          console.log("MediaSession: Seek forward handler registered");
        } catch (error) {
          console.warn("Seek forward action not supported:", error);
        }

        try {
          navigator.mediaSession.setActionHandler("seekbackward", (details) => {
            console.log(
              "MediaSession: Seek backward action triggered",
              details,
            );
            const seekOffset = details.seekOffset || 10;
            handlers.onSeekTo(-seekOffset); // Relative seek
          });
          console.log("MediaSession: Seek backward handler registered");
        } catch (error) {
          console.warn("Seek backward action not supported:", error);
        }

        // Try to register stop handler if available
        try {
          navigator.mediaSession.setActionHandler("stop", () => {
            console.log("MediaSession: Stop action triggered");
            handlers.onPause(); // Use pause for stop
          });
          console.log("MediaSession: Stop handler registered");
        } catch (error) {
          console.warn("Stop action not supported:", error);
        }

        set({ isActive: true });
        console.log("MediaSession initialized successfully");
      } catch (error) {
        console.error("Failed to initialize media session:", error);
      }
    },

    updateMetadata: (song) => {
      const { isSupported, isActive } = get();
      if (!isSupported || !isActive) {
        console.warn("MediaSession not supported or not active");
        return;
      }

      try {
        if (song) {
          console.log("Updating MediaSession metadata for song:", song.name);

          // Get artist names
          const artists =
            song.artist_map?.artists
              ?.slice(0, 3)
              ?.map((artist) => artist.name)
              .join(", ") ||
            song.subtitle ||
            "Unknown Artist";

          // Get artwork with HTTPS URLs and proper sizing
          const artwork =
            song.image
              ?.filter((img) => img.link) // Filter out empty links
              .map((img) => {
                // Ensure HTTPS URL
                const httpsUrl = img.link.startsWith("http://")
                  ? img.link.replace("http://", "https://")
                  : img.link;

                // Determine size based on quality
                let sizes = "512x512";
                switch (img.quality) {
                  case "50x50":
                    sizes = "50x50";
                    break;
                  case "150x150":
                    sizes = "150x150";
                    break;
                  case "500x500":
                    sizes = "500x500";
                    break;
                  default:
                    sizes = "512x512";
                }

                return {
                  src: httpsUrl,
                  sizes: sizes,
                  type: "image/jpeg",
                };
              }) || [];

          // Add fallback artwork if none available
          if (artwork.length === 0) {
            artwork.push({
              src: "/logo.png", // Fallback to app logo
              sizes: "512x512",
              type: "image/png",
            });
          }

          console.log("Setting MediaSession metadata:", {
            title: song.name || "Unknown Title",
            artist: artists,
            album: song.album || "Unknown Album",
            artwork: artwork,
          });

          navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name || "Unknown Title",
            artist: artists,
            album: song.album || "Unknown Album",
            artwork: artwork,
          });

          // Update document title
          document.title = `${song.name} - ${artists} | Tune`;
          console.log("MediaSession metadata updated successfully");
        } else {
          console.log("Clearing MediaSession metadata");
          navigator.mediaSession.metadata = null;
          document.title = "Tune - Music Player";
        }
      } catch (error) {
        console.error("Failed to update media metadata:", error);
        // Try with minimal metadata as fallback
        if (song) {
          try {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: song.name || "Unknown Title",
              artist: "Unknown Artist",
              album: "Unknown Album",
            });
            console.log("Set minimal MediaSession metadata as fallback");
          } catch (fallbackError) {
            console.error("Failed to set fallback metadata:", fallbackError);
          }
        }
      }
    },

    updatePlaybackState: (state) => {
      const { isSupported, isActive } = get();
      if (!isSupported || !isActive) {
        console.warn(
          "MediaSession not supported or not active, cannot update playback state",
        );
        return;
      }

      try {
        console.log("Updating MediaSession playback state to:", state);
        navigator.mediaSession.playbackState = state;
        console.log("MediaSession playback state updated successfully");
      } catch (error) {
        console.error("Failed to update playback state:", error);
      }
    },

    updatePosition: (position, duration) => {
      const { isSupported, isActive } = get();
      if (!isSupported || !isActive) return;

      try {
        // Update position state (if supported)
        if ("setPositionState" in navigator.mediaSession) {
          const positionState = {
            duration: Math.max(duration || 0, 0),
            playbackRate: 1.0,
            position: Math.min(Math.max(position || 0, 0), duration || 0),
          };

          // Only log position updates occasionally to avoid spam
          if (Math.floor(position) % 10 === 0) {
            console.log("Updating MediaSession position state:", positionState);
          }

          navigator.mediaSession.setPositionState(positionState);
        } else {
          console.warn("setPositionState not supported");
        }
      } catch (error) {
        // Don't log position errors frequently as they're common
        if (Math.floor(position) % 30 === 0) {
          console.warn("Position state update failed:", error);
        }
      }
    },

    setActive: (active) => set({ isActive: active }),

    cleanup: () => {
      const { isSupported } = get();
      if (!isSupported) return;

      try {
        console.log("Cleaning up MediaSession...");

        // Clear metadata
        navigator.mediaSession.metadata = null;

        // Clear action handlers
        const actionHandlers = [
          "play",
          "pause",
          "previoustrack",
          "nexttrack",
          "seekto",
          "seekforward",
          "seekbackward",
          "stop",
        ];

        actionHandlers.forEach((action) => {
          try {
            navigator.mediaSession.setActionHandler(action as any, null);
          } catch (e) {
            // Ignore errors for unsupported actions
          }
        });

        // Reset playback state
        navigator.mediaSession.playbackState = "none";

        // Reset position state if supported
        if ("setPositionState" in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: 0,
              playbackRate: 1.0,
              position: 0,
            });
          } catch (e) {
            // Ignore position state errors
          }
        }

        // Reset document title
        document.title = "Tune - Music Player";

        set({ isActive: false });
        console.log("MediaSession cleanup completed");
      } catch (error) {
        console.error("Failed to cleanup media session:", error);
      }
    },
  })),
);

// Derived selectors
export const useMediaSessionState = () =>
  useMediaSessionStore((state) => ({
    isSupported: state.isSupported,
    isActive: state.isActive,
  }));

export const useMediaSessionActions = () =>
  useMediaSessionStore((state) => ({
    initializeMediaSession: state.initializeMediaSession,
    updateMetadata: state.updateMetadata,
    updatePlaybackState: state.updatePlaybackState,
    updatePosition: state.updatePosition,
    cleanup: state.cleanup,
  }));
