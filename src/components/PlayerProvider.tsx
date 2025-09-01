import { useAddToHistory } from "@/queries/useMusic";
import {
  useCurrentIndex,
  useIsPlaying,
  usePlaybackStore,
  useQueue,
} from "@/stores/playbackStore";
import { Song } from "@/types/song";
import React, { useCallback, useEffect, useRef } from "react";
import { useAudioPlayerContext } from "react-use-audio-player";

interface PlayerProviderProps {
  children: React.ReactNode;
}

const getPlaybackUrl = (song: Song) => {
  return (
    song.download_url[4].link ??
    song.download_url[3].link ??
    song.download_url[2].link ??
    song.download_url[1].link ??
    song.download_url[0].link
  );
};

const getArtworkUrl = (song: Song) => {
  // Get the highest quality artwork available
  if (song.artwork) return song.artwork;
  if (song.image && song.image.length > 0) {
    // Assuming image array is sorted by quality, get the highest quality
    return song.image[song.image.length - 1]?.link || song.image[0]?.link;
  }
  return "";
};

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const { load, pause, play, isPlaying, seek } = useAudioPlayerContext();
  const queue = useQueue();
  const currentIndex = useCurrentIndex();
  const isPlayerInit = useIsPlaying();
  const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
  const setIsPlaying = usePlaybackStore((state) => state.setIsPlaying);
  const getNextSong = usePlaybackStore((state) => state.getNextSong);
  const getPreviousSong = usePlaybackStore((state) => state.getPreviousSong);
  const isShuffle = usePlaybackStore((state) => state.shuffle);
  const repeat = usePlaybackStore((state) => state.repeat);
  const addToHistory = useAddToHistory();

  // Keep track of the currently loaded song to prevent unnecessary reloads
  const currentlyLoadedSongRef = useRef<Song | null>(null);
  const isInitializedRef = useRef(false);

  // MediaSession setup and handlers
  const setupMediaSession = useCallback(
    (song: Song) => {
      if ("mediaSession" in navigator) {
        // Set metadata
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.name || song.title || "Unknown Title",
          artist: song.artist || song.subtitle || "Unknown Artist",
          album: song.album || "Unknown Album",
          artwork: [
            {
              src: getArtworkUrl(song),
              sizes: "512x512",
              type: "image/jpeg",
            },
          ],
        });

        // Set playback state
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

        // Set action handlers
        navigator.mediaSession.setActionHandler("play", () => {
          setIsPlaying(true);
          play();
        });

        navigator.mediaSession.setActionHandler("pause", () => {
          setIsPlaying(false);
          pause();
        });

        navigator.mediaSession.setActionHandler("nexttrack", () => {
          const nextSong = getNextSong();
          if (nextSong) {
            // getNextSong already updates the currentIndex
            // No need to manually set it here
          }
        });

        navigator.mediaSession.setActionHandler("previoustrack", () => {
          const prevSong = getPreviousSong();
          if (prevSong) {
            // getPreviousSong already updates the currentIndex
            // No need to manually set it here
          }
        });

        navigator.mediaSession.setActionHandler("stop", () => {
          setIsPlaying(false);
          pause();
        });

        navigator.mediaSession.setActionHandler("seekto", (details) => {
          seek(details.seekTime!);
        });
      }
    },
    [isPlaying, setIsPlaying, play, pause, getNextSong, getPreviousSong],
  );

  // Update MediaSession playback state when playing state changes
  useEffect(() => {
    if ("mediaSession" in navigator && currentlyLoadedSongRef.current) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);
  const onEndHandler = useCallback(() => {
    let index = currentIndex;

    if (isShuffle) {
      index = Math.floor(Math.random() * queue.length);
    } else {
      if (currentIndex < queue.length - 1) {
        if (repeat === "none") {
          index = currentIndex + 1;

          if (index !== -1) {
            addToHistory.mutate({
              songData: queue[index],
              playedTime: 10,
            });
          }
        }
      } else {
        if (repeat === "all") {
          index = 0;
        }
      }
    }
    setCurrentIndex(index);
  }, [
    currentIndex,
    queue.length,
    isShuffle,
    repeat,
    setCurrentIndex,
    addToHistory,
    queue,
  ]);

  useEffect(() => {
    // Don't do anything if we don't have a queue or current song
    if (!queue.length || currentIndex === -1 || !queue[currentIndex]) {
      return;
    }

    const currentSong = queue[currentIndex];

    // Only reload if:
    // 1. We're playing AND the song has actually changed
    // 2. OR this is the first initialization
    const shouldLoad =
      isPlayerInit &&
      (!isInitializedRef.current ||
        !currentlyLoadedSongRef.current ||
        currentlyLoadedSongRef.current.id !== currentSong.id);

    if (shouldLoad) {
      const playbackUrl = getPlaybackUrl(currentSong);

      load(playbackUrl, {
        html5: true,
        initialVolume: 1,
        autoplay: true,
        onend: onEndHandler,
      });

      // Update our tracking references
      currentlyLoadedSongRef.current = currentSong;
      isInitializedRef.current = true;

      // Setup MediaSession for the new song
      setupMediaSession(currentSong);
    } else if (currentlyLoadedSongRef.current?.id === currentSong.id) {
      // If it's the same song but MediaSession might need updating
      setupMediaSession(currentSong);
    }
  }, [
    currentIndex,
    queue,
    load,
    isPlayerInit,
    onEndHandler,
    setupMediaSession,
  ]);

  return <>{children}</>;
};

export default PlayerProvider;
