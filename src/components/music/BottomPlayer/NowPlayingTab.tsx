import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SheetTitle } from "@/components/ui/sheet";
import { DEFAULT_IMAGE } from "@/constants";
import { useCurrentSong } from "@/stores/playbackStore";
import { Music } from "lucide-react";
import { memo, useMemo } from "react";
import { MusicControls, ProgressBarMusic } from "../common";

const NowPlayingTab = memo(() => {
  const currentSong = useCurrentSong();

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

  if (!currentSong) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No song is currently playing</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto gap-10 relative max-md:px-3">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      {/* Album Art */}
      <div className="flex justify-center md:mb-5 relative z-10">
        <div className="w-full h-96 relative group">
          <Avatar className="w-full h-full shadow-2xl relative z-10 ring-1 ring-white/10 rounded-none">
            <AvatarImage
              src={songImage}
              alt={currentSong.name}
              className="object-cover rounded-none"
            />
            <AvatarFallback className="text-4xl sm:text-6xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-none">
              <Music className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0 pr-4">
          <SheetTitle className="text-xl sm:text-2xl mb-1 line-clamp-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {currentSong.name}
          </SheetTitle>
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
            {artistName}
          </p>
        </div>
      </div>

      <div className="px-3">
        <ProgressBarMusic isTimeVisible={true} />
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex justify-center">
          <MusicControls size="large" />
        </div>
      </div>
    </div>
  );
});

NowPlayingTab.displayName = "NowPlayingTab";
export default NowPlayingTab;
