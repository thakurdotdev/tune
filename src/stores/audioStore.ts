import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { AudioManager } from "../utils/audioManager";
import type { AudioState, AudioQuality } from "../types/music";

interface AudioStore extends AudioState {
  // Actions
  updateTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setVolume: (volume: number) => void;
  setPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setBuffering: (buffering: boolean) => void;

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
      // Throttle time updates to prevent excessive re-renders
      const currentTime = get().currentTime;
      if (Math.abs(time - currentTime) > 0.1) {
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

// Derived selectors for better performance
export const useAudioTime = () =>
  useAudioStore((state) => ({
    currentTime: state.currentTime,
    duration: state.duration,
    buffered: state.buffered,
  }));

export const useAudioControls = () =>
  useAudioStore((state) => ({
    volume: state.volume,
    isPlaying: state.isPlaying,
    setVolume: state.setVolume,
    audioManager: state.audioManager,
  }));

export const useAudioLoadingState = () =>
  useAudioStore((state) => ({
    isLoading: state.isLoading,
    isBuffering: state.isBuffering,
  }));
