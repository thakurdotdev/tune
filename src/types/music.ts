import { Song } from "./song";

export interface Album {
  album_id?: string;
  id: string;
  name: string;
  subtitle?: string;
  type: Type;
  url: string;
  image: Array<{ quality: string; link: string }>;
  language: string;
  year: number;
  header_desc: string;
  play_count: number;
  explicit: boolean;
  list_count: number;
  artist_map: {
    artists: Array<{
      id: string;
      name: string;
      url: string;
      role: string;
      type: string;
      image: Array<{ quality: string; link: string }>;
    }>;
    featured_artists: Array<{
      id: string;
      name: string;
      url: string;
      role: string;
      type: string;
      image: Array<{ quality: string; link: string }>;
    }>;
    primary_artists: Array<{
      id: string;
      name: string;
      url: string;
      role: string;
      type: string;
      image: Array<{ quality: string; link: string }>;
    }>;
  };
}

export interface Playlist {
  id: string;
  name: string;
  subtitle?: string;
  type: Type;
  url: string;
  image: Array<{ quality: string; link: string }>;
  language: string;
  year: number;
  header_desc: string;
  play_count: number;
  explicit: boolean;
  list_count: number;
}

export interface Chart {
  id: string;
  name: string;
  subtitle?: string;
  type: Type;
  url: string;
  image: Array<{ quality: string; link: string }>;
  language: string;
  year: number;
  header_desc: string;
  play_count: number;
  explicit: boolean;
  list_count: number;
}

export interface Artist {
  id: string;
  name: string;
  url: string;
  role: string;
  type: string;
  image: Array<{ quality: string; link: string }>;
}

export interface HomePageResponse {
  trending: {
    data: Song[];
  };
  playlists: {
    data: Playlist[];
  };
  albums: {
    data: Album[];
  };
  charts: {
    data: Chart[];
  };
  artist_recos: {
    data: Artist[];
  };
}

export interface RecentMusicResponse {
  songs: Song[];
  recentlyPlayed: Song[];
}

export interface PlaylistDetails {
  id: string;
  name: string;
  header_desc: string;
  list_count: number;
  follower_count: number;
  image: string;
  songs: Song[];
}

export interface AlbumDetails {
  id: string;
  name: string;
  header_desc: string;
  subtitle: string;
  year: number;
  duration: number;
  image: Array<{ quality: string; link: string }>;
  artistmap: Array<{
    id: string;
    name: string;
    url: string;
    role: string;
    type: string;
    image: Array<{ quality: string; link: string }>;
  }>;
  songs: Song[];
}

export interface ArtistDetails {
  id: string;
  name: string;
  header_desc: string;
  list_count: number;
  follower_count: number;
  image: Array<{ quality: string; link: string }>;
  top_songs: Array<Song>;
  top_albums: Array<Album>;
  dedicated_artist_playlist: Array<Playlist>;
  similar_artists: Array<Artist>;
}

export interface MusicHistoryParams {
  page: number;
  limit: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface MusicHistoryResponse {
  songs: Song[];
  count: number;
}

export interface AudioState {
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeat: "none" | "one" | "all";
}

export interface SleepTimer {
  timeRemaining: number;
  songsRemaining: number;
  isActive: boolean;
}

export interface MediaSessionState {
  isSupported: boolean;
  isActive: boolean;
}

export type AudioQuality = "low" | "medium" | "high" | "highest";

export interface PlayerConfig {
  audioQuality: AudioQuality;
  preloadNext: boolean;
  gaplessPlayback: boolean;
  crossfade: number; // in milliseconds
}

export type Type =
  | "artist"
  | "album"
  | "playlist"
  | "radio"
  | "radio_station"
  | "song"
  | "channel"
  | "mix"
  | "show"
  | "episode"
  | "season"
  | "label";

export type MegaMenu = {
  top_artists: MegaMenuItem[];
  top_playlists: MegaMenuItem[];
  new_releases: MegaMenuItem[];
};

type MegaMenuItem = {
  name: string;
  url: string;
};
