import type { Song } from "@/types/song";
import { useCallback } from "react";
import { useAudioStore } from "../stores/audioStore";
import { useMediaSessionStore } from "../stores/mediaSessionStore";
import { usePlaybackStore } from "../stores/playbackStore";

export const usePlayerControls = () => {
  const audioManager = useAudioStore((state) => state.audioManager);
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const volume = useAudioStore((state) => state.volume);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const setCurrentSong = usePlaybackStore((state) => state.setCurrentSong);
  const getNextSong = usePlaybackStore((state) => state.getNextSong);
  const getPreviousSong = usePlaybackStore((state) => state.getPreviousSong);

  const { updatePlaybackState } = useMediaSessionStore();

  // Basic playback controls
  const play = useCallback(async () => {
    if (!audioManager || !currentSong) return;

    try {
      audioManager.play();
    } catch (error) {
      console.error("Failed to play:", error);
    }
  }, [audioManager, currentSong]);

  const pause = useCallback(() => {
    if (!audioManager) return;
    audioManager.pause();
  }, [audioManager]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const stop = useCallback(() => {
    if (!audioManager) return;
    audioManager.stop();
    setCurrentSong(null);
    updatePlaybackState("none");
  }, [audioManager, setCurrentSong, updatePlaybackState]);

  // Navigation controls
  const playNext = useCallback(() => {
    const nextSong = getNextSong();
    if (nextSong) {
      setCurrentSong(nextSong);
    }
  }, [getNextSong, setCurrentSong]);

  const playPrevious = useCallback(() => {
    const prevSong = getPreviousSong();
    if (prevSong) {
      setCurrentSong(prevSong);
    }
  }, [getPreviousSong, setCurrentSong]);

  // Seek controls
  const seek = useCallback(
    (position: number) => {
      if (!audioManager) return;
      audioManager.seek(position);
    },
    [audioManager],
  );

  // Volume controls
  const setVolumeLevel = useCallback(
    (newVolume: number) => {
      if (!audioManager) return;
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      audioManager.setVolume(clampedVolume);
    },
    [audioManager],
  );

  const mute = useCallback(() => {
    setVolumeLevel(0);
  }, [setVolumeLevel]);

  const unmute = useCallback(() => {
    setVolumeLevel(volume > 0 ? volume : 0.5);
  }, [setVolumeLevel, volume]);

  return {
    play,
    pause,
    togglePlayPause,
    stop,

    playNext,
    playPrevious,

    seek,

    // Volume controls
    setVolume: setVolumeLevel,
    mute,
    unmute,
  };
};

export default usePlayerControls;
