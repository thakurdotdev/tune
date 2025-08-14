import React, { useCallback, useEffect, useRef, useMemo } from "react";
import { useAudioStore } from "../stores/audioStore";
import {
  initializeMediaSession,
  updateMetadata,
  updatePlaybackState,
  updatePosition,
  cleanupMediaSession,
} from "../stores/mediaSessionStore";
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
  ({ children, config: userConfig }) => {
    const config = useMemo(
      () => ({ ...defaultConfig, ...userConfig }),
      [userConfig],
    );

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

    const shouldStopPlayback = useSleepTimerStore(
      (state) => state.shouldStopPlayback,
    );
    const updateSongs = useSleepTimerStore((state) => state.updateSongs);
    const clearSleepTimer = useSleepTimerStore(
      (state) => state.clearSleepTimer,
    );

    const lastSongIdRef = useRef<string | null>(null);
    const isInitializedRef = useRef(false);
    const timeUpdateThrottleRef = useRef<number>(0);
    const positionUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleTimeUpdate = useCallback(
      (time: number) => {
        const now = Date.now();
        // Update more frequently (every 250ms instead of 500ms) for smoother mobile notification progress
        if (now - timeUpdateThrottleRef.current > 250) {
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

      // Ensure position is updated when pausing for proper mobile notification display
      if (currentSong && audioManager) {
        const currentTime = audioManager.getCurrentTime();
        const duration = audioManager.getDuration();
        updatePosition(currentTime, duration);
      }
    }, [
      setPlaying,
      updatePlaybackState,
      currentSong,
      audioManager,
      updatePosition,
    ]);

    const handleEnd = useCallback(() => {
      updateSongs();

      if (shouldStopPlayback()) {
        setPlaying(false);
        updatePlaybackState("none");
        clearSleepTimer();
        return;
      }

      const nextSong = getNextSong();
      if (nextSong) {
        // Reset progress before switching to next song
        updateTime(0);
        setCurrentSong(nextSong);
      } else {
        setPlaying(false);
        updatePlaybackState("none");
        // Reset progress when playlist ends
        updateTime(0);
      }
    }, [
      updateSongs,
      shouldStopPlayback,
      setPlaying,
      updatePlaybackState,
      clearSleepTimer,
      getNextSong,
      setCurrentSong,
      updateTime,
    ]);

    const handleLoad = useCallback(() => {
      setLoading(false);
      setBuffering(false);

      // Ensure position state is initialized when song loads
      if (currentSong && audioManager) {
        const duration = audioManager.getDuration();
        const currentTime = audioManager.getCurrentTime();
        updatePosition(currentTime, duration);
      }
    }, [setLoading, setBuffering, currentSong, audioManager, updatePosition]);

    const handleLoadError = useCallback(
      (error: any) => {
        console.error("Audio load error:", error);
        setLoading(false);
        setBuffering(false);
      },
      [setLoading, setBuffering],
    );

    const handleBuffering = useCallback(
      (buffering: boolean) => {
        setBuffering(buffering);
      },
      [setBuffering],
    );

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

    useEffect(() => {
      if (isInitializedRef.current) return;

      console.log("Initializing AudioManager...");
      initializeAudioManager(audioCallbacks);
      isInitializedRef.current = true;
      console.log("AudioManager initialized");
    }, [initializeAudioManager, audioCallbacks]);

    const mediaSessionCallbacks = useMemo(
      () => ({
        onPlay: () => {
          if (audioManager && currentSong) {
            audioManager.play();
            setPlaying(true);
            updatePlaybackState("playing");
          }
        },
        onPause: () => {
          if (audioManager) {
            audioManager.pause();
            setPlaying(false);
            updatePlaybackState("paused");
          }
        },
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
      [
        audioManager,
        currentSong,
        setPlaying,
        updatePlaybackState,
        updatePosition,
        getPreviousSong,
        getNextSong,
        setCurrentSong,
      ],
    );

    useEffect(() => {
      if (!audioManager) {
        console.log("MediaSession: Waiting for audioManager...");
        return;
      }

      console.log("MediaSession: Initializing with audioManager available");
      initializeMediaSession(mediaSessionCallbacks);
    }, [initializeMediaSession, audioManager, mediaSessionCallbacks]);

    useEffect(() => {
      if (!audioManager || !currentSong) {
        if (!audioManager) {
          console.warn("AudioManager is not available - cannot play song");
        }
        return;
      }

      if (currentSong.id === lastSongIdRef.current) return;

      const loadAndPlaySong = async () => {
        try {
          setLoading(true);
          updateTime(0);

          await audioManager.loadSong(currentSong, config.audioQuality);

          updateMetadata(currentSong);

          updatePlaybackState("paused");

          if (config.preloadNext) {
            const nextSong = getNextSong();
            if (nextSong) {
              try {
                audioManager.preloadNext(nextSong, config.audioQuality);
              } catch (error) {
                console.warn("Failed to preload next song:", error);
              }
            }
          }

          audioManager.play();

          lastSongIdRef.current = currentSong.id;
        } catch (error) {
          console.error("Failed to load song:", error);
          setLoading(false);

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
      updateTime,
    ]);

    useEffect(() => {
      return () => {
        if (positionUpdateIntervalRef.current) {
          clearInterval(positionUpdateIntervalRef.current);
        }

        destroyAudioManager();
        cleanupMediaSession();
        isInitializedRef.current = false;
      };
    }, [destroyAudioManager, cleanupMediaSession]);

    return <>{children}</>;
  },
);

export default PlayerProvider;
