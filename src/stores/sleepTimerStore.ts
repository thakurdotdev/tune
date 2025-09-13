import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { SleepTimer } from '../types/music';

interface SleepTimerStore extends SleepTimer {
  // Private timer reference
  timerInterval: NodeJS.Timeout | null;

  // Actions
  setSleepTimer: (minutes?: number, songs?: number) => void;
  clearSleepTimer: () => void;
  updateTime: () => void;
  updateSongs: () => void;

  // Computed properties
  getFormattedTime: () => string;
  shouldStopPlayback: () => boolean;
}

export const useSleepTimerStore = create<SleepTimerStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    timeRemaining: 0,
    songsRemaining: 0,
    isActive: false,
    timerInterval: null,

    // Actions
    setSleepTimer: (minutes = 0, songs = 0) => {
      // Clear existing timer
      const currentInterval = get().timerInterval;
      if (currentInterval) {
        clearInterval(currentInterval);
      }

      if (minutes > 0) {
        // Time-based timer
        const interval = setInterval(() => {
          get().updateTime();
        }, 1000);

        set({
          timeRemaining: minutes * 60,
          songsRemaining: 0,
          isActive: true,
          timerInterval: interval,
        });
      } else if (songs > 0) {
        // Song-based timer
        set({
          timeRemaining: 0,
          songsRemaining: songs,
          isActive: true,
          timerInterval: null, // No interval needed for song-based timer
        });
      } else {
        // Clear timer
        set({
          timeRemaining: 0,
          songsRemaining: 0,
          isActive: false,
          timerInterval: null,
        });
      }
    },

    clearSleepTimer: () => {
      const currentInterval = get().timerInterval;
      if (currentInterval) {
        clearInterval(currentInterval);
      }

      set({
        timeRemaining: 0,
        songsRemaining: 0,
        isActive: false,
        timerInterval: null,
      });
    },

    updateTime: () => {
      const { timeRemaining } = get();
      const newTime = Math.max(0, timeRemaining - 1);

      set({ timeRemaining: newTime });

      // Auto-clear when time reaches 0
      if (newTime === 0) {
        get().clearSleepTimer();
      }
    },

    updateSongs: () => {
      const { songsRemaining } = get();
      const newCount = Math.max(0, songsRemaining - 1);

      set({ songsRemaining: newCount });

      // Auto-clear when count reaches 0
      if (newCount === 0 && get().isActive) {
        get().clearSleepTimer();
      }
    },

    // Computed properties
    getFormattedTime: () => {
      const { timeRemaining } = get();
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    shouldStopPlayback: () => {
      const { isActive, timeRemaining, songsRemaining } = get();
      return isActive && timeRemaining === 0 && songsRemaining === 0;
    },
  }))
);

// Cleanup function to call on app unmount
export const cleanupSleepTimer = () => {
  const { timerInterval, clearSleepTimer } = useSleepTimerStore.getState();
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  clearSleepTimer();
};

// Derived selectors
export const useSleepTimerDisplay = () =>
  useSleepTimerStore((state) => ({
    isActive: state.isActive,
    formattedTime: state.getFormattedTime(),
    songsRemaining: state.songsRemaining,
  }));

export const useSleepTimerControls = () =>
  useSleepTimerStore((state) => ({
    setSleepTimer: state.setSleepTimer,
    clearSleepTimer: state.clearSleepTimer,
    isActive: state.isActive,
  }));
