import type { PlaybackState } from "@/types/music";
import type { Song } from "@/types/song";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface PlaybackStore extends PlaybackState {
  setCurrentSong: (song: Song | null) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (songs: Song | Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: "none" | "one" | "all") => void;

  getNextSong: () => Song | null;
  getPreviousSong: () => Song | null;

  // Queue management
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  shuffleQueue: () => void;
  getShuffledQueue: () => Song[];
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const usePlaybackStore = create<PlaybackStore>()(
  subscribeWithSelector((set, get) => ({
    currentSong: null,
    queue: [],
    currentIndex: -1,
    shuffle: false,
    repeat: "none",

    // Actions
    setCurrentSong: (song) => {
      set({ currentSong: song });

      if (song) {
        const queue = get().queue;
        const index = queue.findIndex((s) => s.id === song.id);
        if (index !== -1) {
          set({ currentIndex: index });
        }
      } else {
        // Reset index when no song is playing
        set({ currentIndex: -1 });
      }
    },

    setQueue: (songs) => {
      set({ queue: songs, currentIndex: songs.length > 0 ? 0 : -1 });
    },

    addToQueue: (songs) => {
      const songsArray = Array.isArray(songs) ? songs : [songs];
      const currentQueue = get().queue;

      // Filter out duplicates
      const existingIds = new Set(currentQueue.map((s) => s.id));
      const newSongs = songsArray.filter((s) => !existingIds.has(s.id));

      if (newSongs.length > 0) {
        const updatedQueue = [...currentQueue, ...newSongs];
        set({
          queue: updatedQueue,
          currentIndex: currentQueue.length === 0 ? 0 : get().currentIndex,
        });
      }
    },

    removeFromQueue: (index) => {
      const queue = get().queue;
      const currentIndex = get().currentIndex;

      if (index < 0 || index >= queue.length) return;

      const newQueue = queue.filter((_, i) => i !== index);
      let newIndex = currentIndex;

      if (index < currentIndex) {
        newIndex = currentIndex - 1;
      } else if (index === currentIndex) {
        // If removing current song, stay at same index or go to previous
        newIndex = Math.min(currentIndex, newQueue.length - 1);
      }

      set({
        queue: newQueue,
        currentIndex: newQueue.length === 0 ? -1 : newIndex,
      });
    },

    clearQueue: () => set({ queue: [], currentIndex: -1 }),

    setCurrentIndex: (index) => {
      const queue = get().queue;
      if (index >= 0 && index < queue.length) {
        set({ currentIndex: index });
      }
    },

    setShuffle: (shuffle) => set({ shuffle }),

    setRepeat: (repeat) => set({ repeat }),

    getNextSong: () => {
      const { queue, currentIndex, repeat, shuffle } = get();

      if (queue.length === 0) return null;

      if (repeat === "one") {
        return queue[currentIndex] || null;
      }

      let nextIndex = currentIndex + 1;

      if (nextIndex >= queue.length) {
        if (repeat === "all") {
          nextIndex = 0;
        } else {
          return null;
        }
      }

      // Update the current index to the next song for proper state tracking
      set({ currentIndex: nextIndex });
      return queue[nextIndex] || null;
    },

    getPreviousSong: () => {
      const { queue, currentIndex, repeat } = get();

      if (queue.length === 0) return null;

      if (repeat === "one") {
        return queue[currentIndex] || null;
      }

      let prevIndex = currentIndex - 1;

      if (prevIndex < 0) {
        if (repeat === "all") {
          prevIndex = queue.length - 1;
        } else {
          return null;
        }
      }

      // Update the current index to the previous song for proper state tracking
      set({ currentIndex: prevIndex });
      return queue[prevIndex] || null;
    },

    // Queue management
    moveQueueItem: (fromIndex, toIndex) => {
      const queue = get().queue;
      if (
        fromIndex < 0 ||
        fromIndex >= queue.length ||
        toIndex < 0 ||
        toIndex >= queue.length
      ) {
        return;
      }

      const newQueue = [...queue];
      const [movedItem] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedItem);

      // Adjust current index if necessary
      let newCurrentIndex = get().currentIndex;
      if (fromIndex === newCurrentIndex) {
        newCurrentIndex = toIndex;
      } else if (fromIndex < newCurrentIndex && toIndex >= newCurrentIndex) {
        newCurrentIndex -= 1;
      } else if (fromIndex > newCurrentIndex && toIndex <= newCurrentIndex) {
        newCurrentIndex += 1;
      }

      set({ queue: newQueue, currentIndex: newCurrentIndex });
    },

    shuffleQueue: () => {
      const { queue, currentSong } = get();
      if (queue.length <= 1) return;

      // Keep current song at the beginning if it exists
      let songsToShuffle = [...queue];
      let currentSongIndex = -1;

      if (currentSong) {
        currentSongIndex = queue.findIndex((s) => s.id === currentSong.id);
        if (currentSongIndex !== -1) {
          songsToShuffle = queue.filter((_, i) => i !== currentSongIndex);
        }
      }

      const shuffled = shuffleArray(songsToShuffle);

      const newQueue =
        currentSong && currentSongIndex !== -1
          ? [currentSong, ...shuffled]
          : shuffled;

      set({
        queue: newQueue,
        currentIndex: currentSong ? 0 : -1,
      });
    },

    getShuffledQueue: () => {
      const { queue } = get();
      return shuffleArray(queue);
    },
  })),
);

export const useCurrentSong = () =>
  usePlaybackStore((state) => state.currentSong);
export const useQueue = () => usePlaybackStore((state) => state.queue);
