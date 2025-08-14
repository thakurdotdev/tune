import type { AudioState } from "@/types/music";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { AudioManager } from "../utils/audioManager";

interface AudioStore extends AudioState {
  // Actions
  updateTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setVolume: (volume: number) => void;
  setPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setBuffering: (buffering: boolean) => void;
  resetAudioState: () => void;

  // Audio manager instance
  audioManager: AudioManager | null;
  initializeAudioManager: (callbacks: {
    onTimeUpdate: (time: number) => void;
    onDurationChange: (duration: number) => void;
    onPlay: () => void;
    onPause: () => void;
    onEnd: () => void;
    onLoad: () => void;
    onLoadError: (error: any) => void;
    onBuffering: (buffering: boolean) => void;
  }) => void;
  destroyAudioManager: () => void;
}

export const useAudioStore = create<AudioStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    isPlaying: false,
    isLoading: false,
    isBuffering: false,
    audioManager: null,

    // Actions
    updateTime: (time: number) => {
      // Update more frequently for smoother UI - update if difference is >= 0.5 seconds
      const currentTime = get().currentTime;
      if (Math.abs(time - currentTime) >= 0.5) {
        set({ currentTime: time });
      }
    },

    setDuration: (duration: number) => set({ duration }),
    setBuffered: (buffered: number) => set({ buffered }),
    setVolume: (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      set({ volume: clampedVolume });
      get().audioManager?.setVolume(clampedVolume);
    },
    setPlaying: (playing: boolean) => set({ isPlaying: playing }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setBuffering: (buffering: boolean) => set({ isBuffering: buffering }),

    // Reset audio state when changing songs
    resetAudioState: () =>
      set({
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        isLoading: false,
        isBuffering: false,
      }),

    initializeAudioManager: (callbacks) => {
      // Destroy existing manager if any
      get().audioManager?.destroy();

      const audioManager = new AudioManager(
        callbacks.onTimeUpdate,
        callbacks.onDurationChange,
        callbacks.onPlay,
        callbacks.onPause,
        callbacks.onEnd,
        callbacks.onLoad,
        callbacks.onLoadError,
        callbacks.onBuffering,
      );

      set({ audioManager });
    },

    destroyAudioManager: () => {
      get().audioManager?.destroy();
      set({ audioManager: null });
    },
  })),
);

export const useCurrentTime = () => useAudioStore((state) => state.currentTime);
export const useDuration = () => useAudioStore((state) => state.duration);
export const useBuffered = () => useAudioStore((state) => state.buffered);
export const useVolume = () => useAudioStore((state) => state.volume);
export const useIsPlaying = () => useAudioStore((state) => state.isPlaying);
export const useIsLoading = () => useAudioStore((state) => state.isLoading);
export const useIsBuffering = () => useAudioStore((state) => state.isBuffering);
export const useAudioManager = () =>
  useAudioStore((state) => state.audioManager);
export const useSetVolume = () => useAudioStore((state) => state.setVolume);
