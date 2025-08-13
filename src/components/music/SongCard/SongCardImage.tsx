import LazyImage from "@/components/LazyImage";
import { cn } from "@/lib/utils";
import { Loader2, Play } from "lucide-react";
import { memo } from "react";
import { AudioWave } from "../Cards";
import { SongCardImageProps } from "./types";

const HOVER_TRANSITION = "transition-all duration-300 ease-out";

export const SongCardImage = memo(
  ({
    song,
    isCurrentSong,
    isPlaying,
    loading,
    onPlayClick,
  }: SongCardImageProps) => {
    const imageUrl = Array.isArray(song.image)
      ? song.image?.[2]?.link
      : song.image;

    const name = song.name || song.title || "";

    return (
      <div className="relative aspect-square">
        <LazyImage
          src={imageUrl}
          alt={name}
          className={cn("rounded-lg w-full h-full object-cover")}
        />

        {/* Overlay with play button */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
            "rounded-lg flex items-center justify-center",
            "cursor-pointer",
            // Show overlay when current song is playing OR on hover
            isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            HOVER_TRANSITION,
          )}
          onClick={(e) => {
            e.stopPropagation();
            onPlayClick();
          }}
        >
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-white drop-shadow-lg" />
          ) : isCurrentSong && isPlaying ? (
            <div className="transform scale-125">
              <AudioWave />
            </div>
          ) : isCurrentSong && !isPlaying ? (
            <Play className="w-8 h-8 text-white drop-shadow-lg fill-white" />
          ) : (
            <Play className="w-8 h-8 text-white drop-shadow-lg fill-white" />
          )}
        </div>

        {/* Current song indicator */}
        {isCurrentSong && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        )}
      </div>
    );
  },
);

SongCardImage.displayName = "SongCardImage";
