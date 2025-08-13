import { cn } from "@/lib/utils";
import { useIsPlaying } from "@/stores/audioStore";
import { useRouter } from "next/navigation";
import { memo, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Loader2,
  Music,
  Plus,
  Minus,
} from "lucide-react";
import LazyImage from "@/components/LazyImage";
import { AudioWave } from "../Cards";
import { SongCardProps } from "./types";
import { useSongCardActions } from "./useSongCardActions";
import { toast } from "sonner";

export const OptimizedSongCard = memo(
  ({ song, variant = "compact", showQueue = true }: SongCardProps) => {
    const router = useRouter();
    const isPlaying = useIsPlaying();
    const [loading, setLoading] = useState(false);

    const {
      isCurrentSong,
      isInQueue,
      handlePlayClick,
      handleAddToQueue,
      handleRemoveFromQueue,
    } = useSongCardActions(song);

    // Early return for invalid songs
    if (!song?.id || !song?.image?.[2]) return null;

    const songName = useMemo(() => song.name || song.title || "", [song]);
    const artistName = useMemo(
      () =>
        song?.artist_map?.artists
          ?.slice(0, 2)
          ?.map((artist) => artist.name)
          .join(", ") || "Unknown Artist",
      [song],
    );
    const imageUrl = useMemo(
      () => (Array.isArray(song.image) ? song.image?.[2]?.link : song.image),
      [song.image],
    );

    const handleCardClick = () => {
      if (song.type === "song") {
        wrappedHandlePlayClick();
      } else {
        router.push(`/music/${song.type}/${song.id}`);
      }
    };

    const wrappedHandlePlayClick = async () => {
      setLoading(true);
      try {
        await handlePlayClick();
      } finally {
        setLoading(false);
      }
    };

    const handleQueueAction = (
      e: React.MouseEvent,
      action: "add" | "remove",
    ) => {
      e.stopPropagation();
      if (action === "add") {
        handleAddToQueue(e);
        toast.success(`Added ${songName} to queue`);
      } else {
        handleRemoveFromQueue(e);
        toast.success(`Removed ${songName} from queue`);
      }
    };

    return (
      <div className="group cursor-pointer w-80">
        {/* Elegant Apple Music Style Card */}
        <div className="relative transition-all duration-300 ease-out group-hover:scale-[1.02]">
          {/* Clean Card Container */}
          <div
            className={cn(
              "relative bg-card rounded-2xl transition-all duration-300 p-4",
              "border border-border/60 hover:border-border shadow-sm hover:shadow-lg",
              "hover:bg-muted/30",
              isCurrentSong &&
                "border-primary/30 bg-primary/5 shadow-primary/10",
            )}
            onClick={handleCardClick}
          >
            {/* Horizontal Layout */}
            <div className="flex items-center gap-4 relative">
              {/* Album Art with Play Overlay */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <LazyImage
                    src={imageUrl}
                    alt={songName}
                    height={48}
                    width={48}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Play Button Overlay */}
                <div
                  className={cn(
                    "absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center transition-opacity duration-200",
                    isCurrentSong
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100",
                  )}
                >
                  <Button
                    size="sm"
                    className="w-8 h-8 p-0 rounded-full bg-white hover:bg-white/90 text-black shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      wrappedHandlePlayClick();
                    }}
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isCurrentSong && isPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </Button>
                </div>

                {/* Now Playing Indicator */}
                {isCurrentSong && isPlaying && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-card flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                )}

                {/* Queue Indicator Badge */}
                {isInQueue && !isCurrentSong && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-card flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>

              {/* Song Information - Full Width */}
              <div className="flex-1 min-w-0 pr-2">
                <h3
                  className={cn(
                    "font-semibold text-base line-clamp-1 mb-1 transition-colors duration-200",
                    isCurrentSong ? "text-primary" : "text-foreground",
                  )}
                  title={songName}
                >
                  {songName}
                </h3>

                <p
                  className="text-sm text-muted-foreground line-clamp-1"
                  title={artistName}
                >
                  {artistName}
                </p>
              </div>

              {/* Action Buttons - Positioned Absolutely on Hover */}
              {showQueue && song.type === "song" && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-card/80 backdrop-blur-sm rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-9 h-9 p-0 rounded-full",
                      isInQueue
                        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        : "hover:bg-muted",
                    )}
                    onClick={(e) =>
                      handleQueueAction(e, isInQueue ? "remove" : "add")
                    }
                  >
                    <Heart
                      className={cn("h-4 w-4", isInQueue && "fill-current")}
                    />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

OptimizedSongCard.displayName = "OptimizedSongCard";
