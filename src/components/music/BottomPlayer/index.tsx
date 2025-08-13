import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { memo, useEffect, useMemo, useState } from "react";

import {
  useCurrentSong,
  usePlaybackStore,
  useQueue,
} from "@/stores/playbackStore";
import { ProgressBarMusic } from "../common";
import PlayerControls from "./PlayerControls";
import PlayerSheet from "./PlayerSheet";
import SongInfo from "./SongInfo";
import { useRelatedSongs } from "@/queries/useMusic";

const BottomPlayer = () => {
  const currentSong = useCurrentSong();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const addToQueueAction = usePlaybackStore((state) => state.addToQueue);
  const queue = useQueue();

  const currentIndex = useMemo(
    () =>
      currentSong?.id
        ? queue.findIndex((song) => song.id === currentSong.id)
        : -1,
    [currentSong?.id, queue],
  );

  const shouldFetchRelated =
    queue.length < 2 || currentIndex >= queue.length - 1;
  const { data: relatedSongs } = useRelatedSongs(
    shouldFetchRelated ? currentSong?.id : undefined,
  );

  useEffect(() => {
    if (shouldFetchRelated && relatedSongs && relatedSongs.length > 0) {
      addToQueueAction(relatedSongs);
    }
  }, [shouldFetchRelated, relatedSongs, addToQueueAction]);

  if (!currentSong) return null;

  return (
    <>
      <Card
        className={cn(
          "fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-md border-t z-50 transition-all duration-500 translate-y-0 opacity-100 p-0",
        )}
      >
        <CardContent className="p-3">
          {/* Progress Bar */}
          <div className="absolute -top-1 left-0 w-full">
            <ProgressBarMusic />
          </div>

          <div className="flex items-center justify-between">
            <SongInfo
              currentSong={currentSong}
              onOpenSheet={() => setIsSheetOpen(true)}
            />

            <PlayerControls />
          </div>
        </CardContent>
      </Card>

      <PlayerSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </>
  );
};

export default memo(BottomPlayer);
