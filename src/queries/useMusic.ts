"use client";

import {
  addToHistory,
  getAlbumDetails,
  getHomePageMusic,
  getMusicHistory,
  getPlaylistDetails,
  getRecentMusic,
  getRelatedSongs,
} from "@/api/music";
import { useUserStore } from "@/stores/userStore";
import { MusicHistoryParams } from "@/types/music";
import { Song } from "@/types/song";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useHomePageMusic = () => {
  return useQuery({
    queryKey: ["homePageMusic"],
    queryFn: () => getHomePageMusic(),
  });
};

export const useRecentMusic = () => {
  const user = useUserStore((state) => state.user);

  return useQuery({
    queryKey: ["recentMusic"],
    queryFn: () => getRecentMusic(),
    enabled: !!user, // Only fetch if user is logged ins
  });
};

export const useMusicHistory = (params: MusicHistoryParams) => {
  return useQuery({
    queryKey: ["musicHistory", params],
    queryFn: () => getMusicHistory(params),
  });
};

export const useAddToHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      songData,
      playedTime,
    }: {
      songData: Song;
      playedTime?: number;
    }) => addToHistory(songData, playedTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentMusic"] });
    },
  });
};

export const useRelatedSongs = (songId: string | undefined) => {
  return useQuery({
    queryKey: ["relatedSongs", songId],
    queryFn: () => getRelatedSongs(songId!),
    enabled: !!songId, // Only fetch if songId is provided
  });
};

export const usePlaylistDetails = (playlistId: string | undefined) => {
  return useQuery({
    queryKey: ["playlistDetails", playlistId],
    queryFn: () => getPlaylistDetails(playlistId!),
    enabled: !!playlistId,
  });
};

export const useAlbumDetails = (albumId: string | undefined) => {
  return useQuery({
    queryKey: ["albumDetails", albumId],
    queryFn: () => getAlbumDetails(albumId!),
    enabled: !!albumId,
  });
};
