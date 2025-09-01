import type { PlaybackState } from "@/types/music";
import type { Song } from "@/types/song";
import { getRelatedSongs } from "@/api/music";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist } from "zustand/middleware";

interface PlaybackStore extends PlaybackState {
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentIndex: (index: number) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (songs: Song | Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: "none" | "one" | "all") => void;

  getNextSong: () => Song | null;
  getPreviousSong: () => Song | null;

  // Queue management
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  shuffleQueue: () => void;
  getShuffledQueue: () => Song[];

  // Related songs management
  loadRelatedSongsIfNeeded: () => Promise<void>;
  _lastRelatedSongId: string | null;

  // Hydration helpers
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
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
  persist(
    subscribeWithSelector((set, get) => ({
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      shuffle: false,
      repeat: "none",
      _hasHydrated: false,
      _lastRelatedSongId: null,

      // Actions
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      setQueue: (songs) => {
        set({ queue: songs, currentIndex: songs.length > 0 ? 0 : -1 });
        get().loadRelatedSongsIfNeeded();
      },

      addToQueue: (songs) => {
        const songsArray = Array.isArray(songs) ? songs : [songs];
        const currentQueue = get().queue;
        const currentIndex = get().currentIndex;

        // Filter out duplicates
        const existingIds = new Set(currentQueue.map((s) => s.id));
        const newSongs = songsArray.filter((s) => !existingIds.has(s.id));

        if (newSongs.length > 0) {
          const updatedQueue = [...currentQueue, ...newSongs];
          // Only update currentIndex if the queue was empty before
          const newIndex = currentQueue.length === 0 ? 0 : currentIndex;

          set({
            queue: updatedQueue,
            currentIndex: newIndex,
          });
          console.log("New songs added to queue:", newSongs);

          // Check if we need to load related songs after adding to the queue
          get().loadRelatedSongsIfNeeded();
        }
      },

      removeFromQueue: (index) => {
        const queue = get().queue;
        const currentIndex = get().currentIndex;

        if (index < 0 || index >= queue.length) return;

        const newQueue = queue.filter((_, i) => i !== index);
        let newIndex = currentIndex;

        if (index < currentIndex) {
          // Song removed before current song, shift index down
          newIndex = currentIndex - 1;
        } else if (index === currentIndex) {
          // Removing current song - this will require a reload
          if (newQueue.length === 0) {
            newIndex = -1;
          } else {
            // Try to keep the same index, or go to the last song if we're at the end
            newIndex = Math.min(currentIndex, newQueue.length - 1);
          }
        }
        // If index > currentIndex, no change needed to currentIndex

        set({
          queue: newQueue,
          currentIndex: newIndex,
        });
      },

      clearQueue: () => {
        set({ queue: [], currentIndex: -1 });
      },

      setCurrentIndex: (index) => {
        const queue = get().queue;
        if (index >= 0 && index < queue.length) {
          set({ currentIndex: index });
          // Check if we need to load related songs after setting the index
          get().loadRelatedSongsIfNeeded();
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
        // Check if we need to load related songs after setting the index
        get().loadRelatedSongsIfNeeded();
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
        const { queue, currentIndex } = get();
        if (queue.length <= 1) return;

        // Keep current song at the beginning if it exists
        let songsToShuffle = [...queue];
        let currentSongIndex = -1;

        if (currentIndex !== -1) {
          currentSongIndex = currentIndex;
          songsToShuffle = queue.filter((_, i) => i !== currentSongIndex);
        }

        const shuffled = shuffleArray(songsToShuffle);

        const newQueue =
          currentIndex !== -1 ? [queue[currentIndex], ...shuffled] : shuffled;

        set({
          queue: newQueue,
          currentIndex: currentIndex !== -1 ? 0 : -1,
        });
      },

      getShuffledQueue: () => {
        const { queue } = get();
        return shuffleArray(queue);
      },

      loadRelatedSongsIfNeeded: async () => {
        const { queue, currentIndex, _lastRelatedSongId } = get();
        const currentSong = queue[currentIndex];

        const shouldLoadRelated = currentIndex === queue.length - 1;

        if (
          shouldLoadRelated &&
          currentSong?.id &&
          currentSong.id !== _lastRelatedSongId
        ) {
          try {
            set({ _lastRelatedSongId: currentSong.id });
            const relatedSongs = await getRelatedSongs(currentSong.id);
            if (relatedSongs?.length) {
              get().addToQueue(relatedSongs);
            }
          } catch (error) {
            console.error("Failed to load related songs:", error);
          }
        }
      },
    })),
    {
      name: "playback-store",
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const useQueue = () => usePlaybackStore((state) => state.queue);
export const useCurrentIndex = () =>
  usePlaybackStore((state) => state.currentIndex);
export const useIsPlaying = () => usePlaybackStore((state) => state.isPlaying);
