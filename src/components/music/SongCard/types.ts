import { Song } from "@/types/song";

export interface SongCardProps {
  song: Song;
  variant?: "compact" | "full";
  showQueue?: boolean;
}

export interface SongCardImageProps {
  song: Song;
  isCurrentSong: boolean;
  isPlaying: boolean;
  loading: boolean;
  onPlayClick: () => void;
}

export interface SongCardInfoProps {
  song: Song;
  isCurrentSong: boolean;
  isInQueue: boolean;
  onAddToQueue: (e: React.MouseEvent) => void;
  onRemoveFromQueue: (e: React.MouseEvent) => void;
}
