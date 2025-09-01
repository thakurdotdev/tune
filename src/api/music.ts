import { SONG_URL } from "@/constants";
import api from "@/lib/api";
import type {
  MusicHistoryResponse,
  HomePageResponse,
  RecentMusicResponse,
  MusicHistoryParams,
  PlaylistDetails,
  AlbumDetails,
  ArtistDetails,
  MegaMenu,
} from "@/types/music";
import { Song } from "@/types/song";
import { ensureHttpsForSongUrls } from "@/utils/getHttpsUrls";
import axios from "axios";

export const getHomePageMusic = async (): Promise<HomePageResponse> => {
  const response = await axios.get(`${SONG_URL}/modules?lang=${"hindi"}`, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

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
    console.log("Related songs found:", response.data.data);

    const newRecommendations = response.data.data;
    return newRecommendations;
  } else {
    return [];
  }
};

export const getPlaylistDetails = async (
  playlistId: string,
): Promise<PlaylistDetails> => {
  const response = await axios.get(`${SONG_URL}/playlist?token=${playlistId}`);
  return response.data.data ?? {};
};

export const getAlbumDetails = async (
  albumId: string,
): Promise<AlbumDetails> => {
  const response = await axios.get(`${SONG_URL}/album?token=${albumId}`);
  return response.data.data ?? {};
};

export const getArtistDetails = async (
  artistId: string,
): Promise<ArtistDetails> => {
  const response = await axios.get(`${SONG_URL}/artist?token=${artistId}`);
  return response.data.data ?? {};
};

export const getMegaMenu = async (lang: string): Promise<MegaMenu> => {
  const response = await axios.get(`${SONG_URL}/get/mega-menu?lang=${lang}`);
  return response.data.data;
};

export const searchMusic = async (query: string): Promise<Song[]> => {
  const { data } = await axios.get(`${SONG_URL}/search/songs`, {
    params: { q: query },
  });

  return (data?.data?.results || []).map(ensureHttpsForSongUrls);
};
