import React, { useCallback, useEffect, useRef } from "react";
import { useAudioStore } from "../stores/audioStore";
import { useMediaSessionStore } from "../stores/mediaSessionStore";
import { usePlaybackStore } from "../stores/playbackStore";
import { usePlaylistStore } from "../stores/playlistStore";
import { useSleepTimerStore } from "../stores/sleepTimerStore";
import type { PlayerConfig } from "../types/music";

interface PlayerProviderProps {
  children: React.ReactNode;
  config?: Partial<PlayerConfig>;
  user?: any;
  loading?: boolean;
}

const defaultConfig: PlayerConfig = {
  audioQuality: "highest",
  preloadNext: true,
  gaplessPlayback: true,
  crossfade: 1000,
};

export const PlayerProvider: React.FC<PlayerProviderProps> = ({
  children,
  config: userConfig,
  user,
  loading = false,
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const initializeAudioManager = useAudioStore(
    (state) => state.initializeAudioManager,
  );
  const destroyAudioManager = useAudioStore(
    (state) => state.destroyAudioManager,
  );
  const audioManager = useAudioStore((state) => state.audioManager);

  const { updateTime, setDuration, setPlaying, setLoading, setBuffering } =
    useAudioStore();

  const {
    currentSong,
    getNextSong,
    getPreviousSong,
    setCurrentSong,
    addToHistory,
  } = usePlaybackStore();

  const { shouldStopPlayback, updateSongs, clearSleepTimer } =
    useSleepTimerStore();

  const {
    initializeMediaSession,
    updateMetadata,
    updatePlaybackState,
    updatePosition,
    cleanup: cleanupMediaSession,
  } = useMediaSessionStore();

  const { fetchPlaylists } = usePlaylistStore();

  // Refs for preventing infinite loops
  const lastSongIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  // Audio manager callbacks
  const handleTimeUpdate = useCallback(
    (time: number) => {
      updateTime(time);
      if (currentSong) {
        updatePosition(time, audioManager?.getDuration() || 0);
      }
    },
    [updateTime, updatePosition, currentSong, audioManager],
  );

  const handleDurationChange = useCallback(
    (duration: number) => {
      setDuration(duration);
    },
    [setDuration],
  );

  const handlePlay = useCallback(() => {
    setPlaying(true);
    updatePlaybackState("playing");
  }, [setPlaying, updatePlaybackState]);

  const handlePause = useCallback(() => {
    setPlaying(false);
    updatePlaybackState("paused");
  }, [setPlaying, updatePlaybackState]);

  const handleEnd = useCallback(() => {
    // Update songs remaining for sleep timer
    updateSongs();

    // Check if we should stop due to sleep timer
    if (shouldStopPlayback()) {
      setPlaying(false);
      updatePlaybackState("none");
      clearSleepTimer();
      return;
    }

    // Play next song
    const nextSong = getNextSong();
    if (nextSong) {
      setCurrentSong(nextSong);
    } else {
      setPlaying(false);
      updatePlaybackState("none");
    }
  }, [
    updateSongs,
    shouldStopPlayback,
    setPlaying,
    updatePlaybackState,
    clearSleepTimer,
    getNextSong,
    setCurrentSong,
  ]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setBuffering(false);
  }, [setLoading, setBuffering]);

  const handleLoadError = useCallback(
    (error: any) => {
      console.error("Audio load error:", error);
      setLoading(false);
      setBuffering(false);
      // Optionally show error to user or try next song
    },
    [setLoading, setBuffering],
  );

  const handleBuffering = useCallback(
    (buffering: boolean) => {
      setBuffering(buffering);
    },
    [setBuffering],
  );

  // Initialize audio manager
  useEffect(() => {
    if (!isInitializedRef.current) {
      initializeAudioManager({
        onTimeUpdate: handleTimeUpdate,
        onDurationChange: handleDurationChange,
        onPlay: handlePlay,
        onPause: handlePause,
        onEnd: handleEnd,
        onLoad: handleLoad,
        onLoadError: handleLoadError,
        onBuffering: handleBuffering,
      });
      isInitializedRef.current = true;
    }

    return () => {
      destroyAudioManager();
      cleanupMediaSession();
    };
  }, [
    initializeAudioManager,
    destroyAudioManager,
    cleanupMediaSession,
    handleTimeUpdate,
    handleDurationChange,
    handlePlay,
    handlePause,
    handleEnd,
    handleLoad,
    handleLoadError,
    handleBuffering,
  ]);

  // Initialize media session
  useEffect(() => {
    initializeMediaSession({
      onPlay: () => audioManager?.play(),
      onPause: () => audioManager?.pause(),
      onPreviousTrack: () => {
        const prevSong = getPreviousSong();
        if (prevSong) {
          setCurrentSong(prevSong);
        }
      },
      onNextTrack: () => {
        const nextSong = getNextSong();
        if (nextSong) {
          setCurrentSong(nextSong);
        }
      },
      onSeekTo: (time: number) => {
        if (time > 0) {
          // Absolute seek
          audioManager?.seek(time);
        } else {
          // Relative seek
          const currentTime = audioManager?.getCurrentTime() || 0;
          const newTime = Math.max(0, currentTime + time);
          audioManager?.seek(newTime);
        }
      },
    });
  }, [
    initializeMediaSession,
    audioManager,
    getPreviousSong,
    getNextSong,
    setCurrentSong,
  ]);

  // Handle song changes
  useEffect(() => {
    if (!audioManager || !currentSong) return;
    if (currentSong.id === lastSongIdRef.current) return;

    const loadAndPlaySong = async () => {
      try {
        setLoading(true);

        await audioManager.loadSong(currentSong, config.audioQuality);
        updateMetadata(currentSong);

        // Preload next song if enabled
        if (config.preloadNext) {
          const nextSong = getNextSong();
          if (nextSong) {
            audioManager.preloadNext(nextSong, config.audioQuality);
          }
        }

        // Auto-play the loaded song
        audioManager.play();

        lastSongIdRef.current = currentSong.id;
      } catch (error) {
        console.error("Failed to load song:", error);
        setLoading(false);
        // Optionally try next song
        const nextSong = getNextSong();
        if (nextSong) {
          setCurrentSong(nextSong);
        }
      }
    };

    loadAndPlaySong();
  }, [
    audioManager,
    currentSong,
    config.audioQuality,
    config.preloadNext,
    setLoading,
    updateMetadata,
    getNextSong,
    setCurrentSong,
  ]);

  // Fetch user playlists when user is available
  useEffect(() => {
    if (user && !loading) {
      fetchPlaylists();
    }
  }, [user, loading, fetchPlaylists]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyAudioManager();
      cleanupMediaSession();
    };
  }, [destroyAudioManager, cleanupMediaSession]);

  return <>{children}</>;
};

export default PlayerProvider;
