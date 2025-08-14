"use client";

import type { Song } from "@/types/song";

const isMediaSessionSupported = (): boolean => {
  return "mediaSession" in navigator && "MediaMetadata" in window;
};

export const initializeMediaSession = (handlers: {
  onPlay: () => void;
  onPause: () => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
  onSeekTo: (time: number) => void;
}) => {
  if (!isMediaSessionSupported()) {
    return;
  }

  try {
    // Set up action handlers
    navigator.mediaSession.setActionHandler("play", handlers.onPlay);
    navigator.mediaSession.setActionHandler("pause", handlers.onPause);
    navigator.mediaSession.setActionHandler(
      "previoustrack",
      handlers.onPreviousTrack,
    );
    navigator.mediaSession.setActionHandler("nexttrack", handlers.onNextTrack);

    // Seek handlers (if supported)
    try {
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeekTo(details.seekTime);
        }
      });
    } catch (error) {
      // Seek to action not supported
    }

    try {
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const seekOffset = details.seekOffset || 10;
        handlers.onSeekTo(seekOffset);
      });
    } catch (error) {
      // Seek forward action not supported
    }

    try {
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const seekOffset = details.seekOffset || 10;
        handlers.onSeekTo(-seekOffset);
      });
    } catch (error) {
      // Seek backward action not supported
    }

    try {
      navigator.mediaSession.setActionHandler("stop", handlers.onPause);
    } catch (error) {}

    navigator.mediaSession.playbackState = "none";
    if ("setPositionState" in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: 0,
        playbackRate: 1.0,
        position: 0,
      });
    }
  } catch (error) {
    console.error("Failed to initialize media session:", error);
  }
};

export const updateMetadata = (song: Song | null) => {
  if (!isMediaSessionSupported()) return;

  try {
    if (song) {
      const artists =
        song.artist_map?.artists
          ?.slice(0, 3)
          ?.map((artist) => artist.name)
          .join(", ") ||
        song.subtitle ||
        "Unknown Artist";

      const artwork =
        song.image
          ?.filter((img) => img.link)
          .map((img) => {
            const httpsUrl = img.link.startsWith("http://")
              ? img.link.replace("http://", "https://")
              : img.link;

            let sizes = "512x512";
            switch (img.quality) {
              case "50x50":
                sizes = "96x96";
                break;
              case "150x150":
                sizes = "192x192";
                break;
              case "500x500":
                sizes = "512x512";
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

      if (artwork.length === 0) {
        artwork.push({
          src: `${window.location.origin}/logo.png`,
          sizes: "512x512",
          type: "image/png",
        });
      }

      const metadata = {
        title: song.name || "Unknown Title",
        artist: artists,
        album: song.album || "Unknown Album",
        artwork: artwork,
      };

      navigator.mediaSession.metadata = new MediaMetadata(metadata);
      document.title = `${song.name} - ${artists} | Tune`;
    } else {
      navigator.mediaSession.metadata = null;
      document.title = "Tune - Music Player";
    }
  } catch (error) {
    if (song) {
      try {
        const fallbackMetadata = {
          title: song.name || "Unknown Title",
          artist: song.subtitle || "Unknown Artist",
          album: "Tune Music Player",
          artwork: [
            {
              src: `${window.location.origin}/logo.png`,
              sizes: "512x512",
              type: "image/png",
            },
          ],
        };

        navigator.mediaSession.metadata = new MediaMetadata(fallbackMetadata);
      } catch (fallbackError) {}
    }
  }
};

export const updatePlaybackState = (state: "playing" | "paused" | "none") => {
  if (!isMediaSessionSupported()) return;

  try {
    if (state !== "none" && !navigator.mediaSession.metadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Loading...",
        artist: "Tune",
        album: "Music Player",
        artwork: [
          {
            src: `${window.location.origin}/logo.png`,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    }

    navigator.mediaSession.playbackState = state;
  } catch (error) {
    console.error("Failed to update playback state:", error);
  }
};

export const updatePosition = (position: number, duration: number) => {
  if (!isMediaSessionSupported()) return;

  try {
    if ("setPositionState" in navigator.mediaSession) {
      const validDuration = Math.max(duration || 0, 0);
      const validPosition = Math.min(Math.max(position || 0, 0), validDuration);

      navigator.mediaSession.setPositionState({
        duration: validDuration,
        playbackRate: 1.0,
        position: validPosition,
      });
    }
  } catch (error) {
    // Silent failure for position updates
  }
};

export const cleanupMediaSession = () => {
  if (!isMediaSessionSupported()) return;

  try {
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
      navigator.mediaSession.setPositionState({
        duration: 0,
        playbackRate: 1.0,
        position: 0,
      });
    }

    // Reset document title
    document.title = "Tune - Music Player";
  } catch (error) {
    console.error("Failed to cleanup media session:", error);
  }
};
