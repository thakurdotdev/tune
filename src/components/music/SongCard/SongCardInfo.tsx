import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SongCardInfoProps } from "./types";

export const SongCardInfo = memo(
  ({
    song,
    isCurrentSong,
    isInQueue,
    onAddToQueue,
    onRemoveFromQueue,
  }: SongCardInfoProps) => {
    const name = song.name || song.title || "";
    const artistName =
      song?.artist_map?.artists
        ?.slice(0, 2)
        ?.map((artist) => artist.name)
        .join(", ") || "Unknown Artist";

    return (
      <div className="p-3 space-y-2">
        {/* Song title */}
        <h3
          className={cn(
            "font-medium text-sm leading-tight line-clamp-2",
            isCurrentSong ? "text-primary" : "text-foreground",
          )}
          title={name}
        >
          {name}
        </h3>

        {/* Artist name */}
        <p
          className="text-xs text-muted-foreground line-clamp-1"
          title={artistName}
        >
          {artistName}
        </p>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {isCurrentSong && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                Playing
              </Badge>
            )}
            {isInQueue && !isCurrentSong && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                In Queue
              </Badge>
            )}
          </div>

          {/* More options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVerticalIcon className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isCurrentSong && (
                <>
                  {isInQueue ? (
                    <DropdownMenuItem onClick={onRemoveFromQueue}>
                      <Minus className="mr-2 h-3 w-3" />
                      Remove from Queue
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={onAddToQueue}>
                      <Plus className="mr-2 h-3 w-3" />
                      Add to Queue
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Plus className="mr-2 h-3 w-3" />
                Add to Playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  },
);

SongCardInfo.displayName = "SongCardInfo";
