import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEFAULT_IMAGE } from "@/constants";
import { Song } from "@/types/song";
import { memo, useMemo } from "react";

const SongInfo = memo(
  ({
    currentSong,
    onOpenSheet,
  }: {
    currentSong: Song;
    onOpenSheet: () => void;
  }) => {
    const songImage = useMemo(
      () => currentSong?.image?.[2]?.link || DEFAULT_IMAGE,
      [currentSong],
    );

    const artistName = useMemo(
      () =>
        currentSong?.artist_map?.artists
          ?.slice(0, 3)
          ?.map((artist) => artist.name)
          .join(", ") || "",
      [currentSong],
    );

    return (
      <div
        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onOpenSheet();
        }}
      >
        <Avatar className="h-14 w-14 rounded-md">
          <AvatarImage src={songImage} alt={currentSong.name} />
          <AvatarFallback>MU</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{currentSong.name}</p>
          <p className="text-xs text-muted-foreground truncate">{artistName}</p>
        </div>
      </div>
    );
  },
);

SongInfo.displayName = "SongInfo";
export default SongInfo;
