import { SONG_URL } from "@/constants";
import api from "@/lib/api";
import {
  MusicHistoryResponse,
  HomePageResponse,
  RecentMusicResponse,
  MusicHistoryParams,
  PlaylistDetails,
  AlbumDetails,
} from "@/types/music";
import { Song } from "@/types/song";
import { ensureHttpsForSongUrls } from "@/utils/getHttpsUrls";
import axios from "axios";

export const getHomePageMusic = async (): Promise<HomePageResponse> => {
  const response = await axios.get(
    `${SONG_URL}/modules?lang=${"hindi, bhojpuri"}`,
    {
      headers: {
        "Cache-Control": "no-cache",
      },
    },
  );

  return response.data.data;
};

export const getRecentMusic = async (): Promise<RecentMusicResponse> => {
  const response = await api.get("/api/music/recommendations");
  return response.data.data;
};

export const getMusicHistory = async (
  params: MusicHistoryParams,
): Promise<MusicHistoryResponse> => {
  const response = await api.get("/api/music/latestHistory", {
    params,
  });
  return response.data.data;
};

export const addToHistory = async (songData: Song, playedTime?: number) => {
  const response = await api.post(`/api/history/add`, { songData, playedTime });
  return response.data;
};

export const getRelatedSongs = async (songId: string): Promise<Song[]> => {
  const response = await axios.get(`${SONG_URL}/song/recommend?id=${songId}`);
  if (response?.data?.data?.length) {
    const newRecommendations = response.data.data?.map(ensureHttpsForSongUrls);
    return newRecommendations;
  } else {
    return [];
  }
};

export const getPlaylistDetails = async (
  playlistId: string,
): Promise<PlaylistDetails> => {
  const response = await axios.get(`${SONG_URL}/playlist?id=${playlistId}`);
  return response.data.data ?? {};
};

export const getAlbumDetails = async (
  albumId: string,
): Promise<AlbumDetails> => {
  const response = await axios.get(`${SONG_URL}/album?id=${albumId}`);
  return response.data.data ?? {};
};
