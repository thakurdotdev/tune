// stores/mediaSessionStore.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Song, MediaSessionState } from "../types/music";

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
      if (!isSupported) return;

      try {
        // Set up action handlers
        navigator.mediaSession.setActionHandler("play", handlers.onPlay);
        navigator.mediaSession.setActionHandler("pause", handlers.onPause);
        navigator.mediaSession.setActionHandler(
          "previoustrack",
          handlers.onPreviousTrack,
        );
        navigator.mediaSession.setActionHandler(
          "nexttrack",
          handlers.onNextTrack,
        );

        // Seek handlers (if supported)
        try {
          navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (details.seekTime) {
              handlers.onSeekTo(details.seekTime);
            }
          });

          // Skip forward/backward (10 seconds)
          navigator.mediaSession.setActionHandler("seekforward", () => {
            handlers.onSeekTo(10); // Relative seek
          });

          navigator.mediaSession.setActionHandler("seekbackward", () => {
            handlers.onSeekTo(-10); // Relative seek
          });
        } catch (error) {
          // Seek actions might not be supported on all browsers
          console.warn("Seek actions not supported:", error);
        }

        set({ isActive: true });
      } catch (error) {
        console.error("Failed to initialize media session:", error);
      }
    },

    updateMetadata: (song) => {
      const { isSupported, isActive } = get();
      if (!isSupported || !isActive) return;

      try {
        if (song) {
          // Get artist names
          const artists =
            song.artist_map?.artists
              ?.slice(0, 3)
              ?.map((artist) => artist.name)
              .join(", ") || "Unknown Artist";

          // Get artwork
          const artwork =
            song.image?.map((img) => ({
              src: img.link,
              sizes: "500x500", // Assume 500x500 for now
              type: "image/jpeg",
            })) || [];

          navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name || "Unknown Title",
            artist: artists,
            album: song.album || "Unknown Album",
            artwork: artwork,
          });

          // Update document title
          document.title = `${song.name} - SyncVibe`;
        } else {
          navigator.mediaSession.metadata = null;
          document.title = "SyncVibe";
        }
      } catch (error) {
        console.error("Failed to update media metadata:", error);
      }
    },

    updatePlaybackState: (state) => {
      const { isSupported, isActive } = get();
      if (!isSupported || !isActive) return;

      try {
        navigator.mediaSession.playbackState = state;
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
          navigator.mediaSession.setPositionState({
            duration: Math.max(duration, 0),
            playbackRate: 1.0,
            position: Math.min(Math.max(position, 0), duration),
          });
        }
      } catch (error) {
        console.warn(
          "Position state not supported or failed to update:",
          error,
        );
      }
    },

    setActive: (active) => set({ isActive: active }),

    cleanup: () => {
      const { isSupported } = get();
      if (!isSupported) return;

      try {
        // Clear metadata
        navigator.mediaSession.metadata = null;

        // Clear action handlers
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
        navigator.mediaSession.setActionHandler("seekforward", null);
        navigator.mediaSession.setActionHandler("seekbackward", null);

        // Reset playback state
        navigator.mediaSession.playbackState = "none";

        // Reset document title
        document.title = "SyncVibe";

        set({ isActive: false });
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
