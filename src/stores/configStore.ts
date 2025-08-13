import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerConfig, AudioQuality } from "../types/music";

interface ConfigStore extends PlayerConfig {
  // Actions
  setAudioQuality: (quality: AudioQuality) => void;
  setPreloadNext: (preload: boolean) => void;
  setGaplessPlayback: (gapless: boolean) => void;
  setCrossfade: (crossfade: number) => void;
  resetToDefaults: () => void;

  // Derived getters
  getQualityOrder: () => number[];
  getCrossfadeEnabled: () => boolean;
}

const defaultConfig: PlayerConfig = {
  audioQuality: "highest",
  preloadNext: true,
  gaplessPlayback: true,
  crossfade: 1000,
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      // Initial state from defaults
      ...defaultConfig,

      // Actions
      setAudioQuality: (quality) => set({ audioQuality: quality }),
      setPreloadNext: (preload) => set({ preloadNext: preload }),
      setGaplessPlayback: (gapless) => set({ gaplessPlayback: gapless }),
      setCrossfade: (crossfade) => {
        const clampedCrossfade = Math.max(0, Math.min(10000, crossfade));
        set({ crossfade: clampedCrossfade });
      },

      resetToDefaults: () => set(defaultConfig),

      // Derived getters
      getQualityOrder: () => {
        const quality = get().audioQuality;
        const qualityMap: Record<AudioQuality, number[]> = {
          highest: [4, 3, 2, 1, 0],
          high: [3, 4, 2, 1, 0],
          medium: [2, 3, 1, 4, 0],
          low: [1, 0, 2, 3, 4],
        };
        return qualityMap[quality];
      },

      getCrossfadeEnabled: () => {
        return get().gaplessPlayback && get().crossfade > 0;
      },
    }),
    {
      name: "syncvibe-player-config",
      // Only persist certain fields
      partialize: (state) => ({
        audioQuality: state.audioQuality,
        preloadNext: state.preloadNext,
        gaplessPlayback: state.gaplessPlayback,
        crossfade: state.crossfade,
      }),
    },
  ),
);

// Derived selectors
export const usePlayerConfig = () =>
  useConfigStore((state) => ({
    audioQuality: state.audioQuality,
    preloadNext: state.preloadNext,
    gaplessPlayback: state.gaplessPlayback,
    crossfade: state.crossfade,
  }));

export const useConfigActions = () =>
  useConfigStore((state) => ({
    setAudioQuality: state.setAudioQuality,
    setPreloadNext: state.setPreloadNext,
    setGaplessPlayback: state.setGaplessPlayback,
    setCrossfade: state.setCrossfade,
    resetToDefaults: state.resetToDefaults,
  }));
