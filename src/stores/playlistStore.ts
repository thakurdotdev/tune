import api from "@/lib/api";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Playlist, Song } from "../types/music";

interface PlaylistStore {
  // State
  userPlaylists: Playlist[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setUserPlaylists: (playlists: Playlist[]) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API actions
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string, songs?: Song[]) => Promise<Playlist | null>;
  updatePlaylistAPI: (id: string, updates: Partial<Playlist>) => Promise<void>;
  deletePlaylistAPI: (id: string) => Promise<void>;
  addSongToPlaylistAPI: (playlistId: string, song: Song) => Promise<void>;
  removeSongFromPlaylistAPI: (
    playlistId: string,
    songId: string,
  ) => Promise<void>;

  // Computed properties
  getPlaylistById: (id: string) => Playlist | undefined;
  getPlaylistsByName: (name: string) => Playlist[];
  getTotalSongsCount: () => number;
}

export const usePlaylistStore = create<PlaylistStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    userPlaylists: [],
    isLoading: false,
    error: null,

    // Basic actions
    setUserPlaylists: (playlists) => set({ userPlaylists: playlists }),

    addPlaylist: (playlist) => {
      const currentPlaylists = get().userPlaylists;
      set({ userPlaylists: [...currentPlaylists, playlist] });
    },

    updatePlaylist: (id, updates) => {
      const currentPlaylists = get().userPlaylists;
      const updatedPlaylists = currentPlaylists.map((playlist) =>
        playlist.id === id ? { ...playlist, ...updates } : playlist,
      );
      set({ userPlaylists: updatedPlaylists });
    },

    deletePlaylist: (id) => {
      const currentPlaylists = get().userPlaylists;
      const filteredPlaylists = currentPlaylists.filter(
        (playlist) => playlist.id !== id,
      );
      set({ userPlaylists: filteredPlaylists });
    },

    addSongToPlaylist: (playlistId, song) => {
      const currentPlaylists = get().userPlaylists;
      const updatedPlaylists = currentPlaylists.map((playlist) => {
        if (playlist.id === playlistId) {
          // Check if song already exists
          const songExists = playlist.songs.some(
            (existingSong) => existingSong.id === song.id,
          );
          if (!songExists) {
            return {
              ...playlist,
              songs: [...playlist.songs, song],
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return playlist;
      });
      set({ userPlaylists: updatedPlaylists });
    },

    removeSongFromPlaylist: (playlistId, songId) => {
      const currentPlaylists = get().userPlaylists;
      const updatedPlaylists = currentPlaylists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            songs: playlist.songs.filter((song) => song.id !== songId),
            updatedAt: new Date().toISOString(),
          };
        }
        return playlist;
      });
      set({ userPlaylists: updatedPlaylists });
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // API actions
    fetchPlaylists: async () => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await api.get(`/api/playlist/get`, {
          withCredentials: true,
        });

        if (data?.data) {
          set({ userPlaylists: data.data });
        }
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
        set({ error: "Failed to fetch playlists" });
      } finally {
        set({ isLoading: false });
      }
    },

    createPlaylist: async (name, songs = []) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await api.post(
          `/api/playlist/create`,
          { name, songs },
          { withCredentials: true },
        );

        if (data?.data) {
          get().addPlaylist(data.data);
          return data.data;
        }
        return null;
      } catch (error) {
        console.error("Failed to create playlist:", error);
        set({ error: "Failed to create playlist" });
        return null;
      } finally {
        set({ isLoading: false });
      }
    },

    updatePlaylistAPI: async (id, updates) => {
      set({ isLoading: true, error: null });
      try {
        await api.put(`/api/playlist/update/${id}`, updates, {
          withCredentials: true,
        });

        get().updatePlaylist(id, updates);
      } catch (error) {
        console.error("Failed to update playlist:", error);
        set({ error: "Failed to update playlist" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deletePlaylistAPI: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await api.delete(`/api/playlist/delete/${id}`, {
          withCredentials: true,
        });

        get().deletePlaylist(id);
      } catch (error) {
        console.error("Failed to delete playlist:", error);
        set({ error: "Failed to delete playlist" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    addSongToPlaylistAPI: async (playlistId, song) => {
      try {
        await api.post(
          `/api/playlist/${playlistId}/songs`,
          { song },
          { withCredentials: true },
        );

        get().addSongToPlaylist(playlistId, song);
      } catch (error) {
        console.error("Failed to add song to playlist:", error);
        set({ error: "Failed to add song to playlist" });
        throw error;
      }
    },

    removeSongFromPlaylistAPI: async (playlistId, songId) => {
      try {
        await api.delete(`/api/playlist/${playlistId}/songs/${songId}`, {
          withCredentials: true,
        });

        get().removeSongFromPlaylist(playlistId, songId);
      } catch (error) {
        console.error("Failed to remove song from playlist:", error);
        set({ error: "Failed to remove song from playlist" });
        throw error;
      }
    },

    // Computed properties
    getPlaylistById: (id) => {
      return get().userPlaylists.find((playlist) => playlist.id === id);
    },

    getPlaylistsByName: (name) => {
      const searchTerm = name.toLowerCase();
      return get().userPlaylists.filter((playlist) =>
        playlist.name.toLowerCase().includes(searchTerm),
      );
    },

    getTotalSongsCount: () => {
      return get().userPlaylists.reduce(
        (total, playlist) => total + playlist.songs.length,
        0,
      );
    },
  })),
);

// Derived selectors for better performance
export const useUserPlaylists = () =>
  usePlaylistStore((state) => state.userPlaylists);

export const usePlaylistActions = () =>
  usePlaylistStore((state) => ({
    fetchPlaylists: state.fetchPlaylists,
    createPlaylist: state.createPlaylist,
    updatePlaylistAPI: state.updatePlaylistAPI,
    deletePlaylistAPI: state.deletePlaylistAPI,
    addSongToPlaylistAPI: state.addSongToPlaylistAPI,
    removeSongFromPlaylistAPI: state.removeSongFromPlaylistAPI,
  }));

export const usePlaylistLoading = () =>
  usePlaylistStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
  }));
