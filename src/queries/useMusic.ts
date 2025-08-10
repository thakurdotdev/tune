import {
  addToHistory,
  getHomePageMusic,
  getMusicHistory,
  getRecentMusic,
  getRelatedSongs,
} from "@/api/music";
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
  return useQuery({
    queryKey: ["recentMusic"],
    queryFn: () => getRecentMusic(),
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

export const useRelatedSongs = (songId: string) => {
  return useQuery({
    queryKey: ["relatedSongs", songId],
    queryFn: () => getRelatedSongs(songId),
    enabled: !!songId, // Only fetch if songId is provided
  });
};
