import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { useAudioStore } from "../stores/audioStore";
import { useMediaSessionStore } from "../stores/mediaSessionStore";
import { usePlaybackStore } from "../stores/playbackStore";
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

export const PlayerProvider: React.FC<PlayerProviderProps> = React.memo(
  ({ children, config: userConfig, user, loading = false }) => {
    // Memoize config to prevent unnecessary re-renders
    const config = useMemo(
      () => ({ ...defaultConfig, ...userConfig }),
      [userConfig],
    );

    // Use individual selectors for better performance
    const initializeAudioManager = useAudioStore(
      (state) => state.initializeAudioManager,
    );
    const destroyAudioManager = useAudioStore(
      (state) => state.destroyAudioManager,
    );
    const audioManager = useAudioStore((state) => state.audioManager);
    const updateTime = useAudioStore((state) => state.updateTime);
    const setDuration = useAudioStore((state) => state.setDuration);
    const setPlaying = useAudioStore((state) => state.setPlaying);
    const setLoading = useAudioStore((state) => state.setLoading);
    const setBuffering = useAudioStore((state) => state.setBuffering);

    const currentSong = usePlaybackStore((state) => state.currentSong);
    const getNextSong = usePlaybackStore((state) => state.getNextSong);
    const getPreviousSong = usePlaybackStore((state) => state.getPreviousSong);
    const setCurrentSong = usePlaybackStore((state) => state.setCurrentSong);
    const addToHistory = usePlaybackStore((state) => state.addToHistory);

    const shouldStopPlayback = useSleepTimerStore(
      (state) => state.shouldStopPlayback,
    );
    const updateSongs = useSleepTimerStore((state) => state.updateSongs);
    const clearSleepTimer = useSleepTimerStore(
      (state) => state.clearSleepTimer,
    );

    const {
      initializeMediaSession,
      updateMetadata,
      updatePlaybackState,
      updatePosition,
      cleanup: cleanupMediaSession,
    } = useMediaSessionStore();

    // Refs for preventing infinite loops and maintaining stable references
    const lastSongIdRef = useRef<string | null>(null);
    const isInitializedRef = useRef(false);
    const timeUpdateThrottleRef = useRef<number>(0);

    // Optimized audio manager callbacks with better throttling and memoization
    const handleTimeUpdate = useCallback(
      (time: number) => {
        // Throttle time updates to every 500ms for smoother performance
        const now = Date.now();
        if (now - timeUpdateThrottleRef.current > 500) {
          updateTime(time);
          if (currentSong) {
            updatePosition(time, audioManager?.getDuration() || 0);
          }
          timeUpdateThrottleRef.current = now;
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

    // Memoize callbacks for audio manager to prevent re-initialization
    const audioCallbacks = useMemo(
      () => ({
        onTimeUpdate: handleTimeUpdate,
        onDurationChange: handleDurationChange,
        onPlay: handlePlay,
        onPause: handlePause,
        onEnd: handleEnd,
        onLoad: handleLoad,
        onLoadError: handleLoadError,
        onBuffering: handleBuffering,
      }),
      [
        handleTimeUpdate,
        handleDurationChange,
        handlePlay,
        handlePause,
        handleEnd,
        handleLoad,
        handleLoadError,
        handleBuffering,
      ],
    );

    // Initialize audio manager - only once
    useEffect(() => {
      if (isInitializedRef.current) return;

      console.log("Initializing AudioManager...");
      initializeAudioManager(audioCallbacks);
      isInitializedRef.current = true;
      console.log("AudioManager initialized");
    }, [initializeAudioManager, audioCallbacks]);

    // Memoize media session callbacks
    const mediaSessionCallbacks = useMemo(
      () => ({
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
      }),
      [audioManager, getPreviousSong, getNextSong, setCurrentSong],
    );

    // Initialize media session - only when audioManager is available
    useEffect(() => {
      if (!audioManager) {
        console.log("MediaSession: Waiting for audioManager...");
        return;
      }

      console.log("MediaSession: Initializing with audioManager available");
      initializeMediaSession(mediaSessionCallbacks);
    }, [initializeMediaSession, audioManager, mediaSessionCallbacks]);

    // Handle song changes with optimized loading
    useEffect(() => {
      if (!audioManager || !currentSong) {
        if (!audioManager) {
          console.warn("AudioManager is not available - cannot play song");
        }
        return;
      }

      // Prevent unnecessary reloads of the same song
      if (currentSong.id === lastSongIdRef.current) return;

      const loadAndPlaySong = async () => {
        try {
          setLoading(true);

          // Load song with configured quality
          await audioManager.loadSong(currentSong, config.audioQuality);

          // Update metadata for media session
          updateMetadata(currentSong);

          // Preload next song if enabled (non-blocking)
          if (config.preloadNext) {
            const nextSong = getNextSong();
            if (nextSong) {
              // Don't await this to avoid blocking playback
              try {
                audioManager.preloadNext(nextSong, config.audioQuality);
              } catch (error) {
                console.warn("Failed to preload next song:", error);
              }
            }
          }

          // Start playback
          audioManager.play();

          // Update refs and history
          lastSongIdRef.current = currentSong.id;
          addToHistory(currentSong);
        } catch (error) {
          console.error("Failed to load song:", error);
          setLoading(false);

          // Auto-skip to next song on error
          const nextSong = getNextSong();
          if (nextSong && nextSong.id !== currentSong.id) {
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
      addToHistory,
    ]);

    // Consolidated cleanup on unmount
    useEffect(() => {
      return () => {
        console.log("Cleaning up PlayerProvider...");
        destroyAudioManager();
        cleanupMediaSession();
        isInitializedRef.current = false;
      };
    }, [destroyAudioManager, cleanupMediaSession]);

    return <>{children}</>;
  },
);

export default PlayerProvider;
