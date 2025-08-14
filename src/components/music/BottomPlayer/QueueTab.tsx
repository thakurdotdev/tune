import { useQueue } from "@/stores/playbackStore";
import { memo } from "react";
import { FullSongCard } from "../Cards";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const QueueTab = memo(() => {
  const queue = useQueue();

  if (!queue?.length) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-lg text-gray-500">No songs in queue</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-3xl mx-auto space-y-1 max-md:px-2 md:pr-3">
        {queue.map((song, index) => (
          <FullSongCard key={song.id || index} song={song} />
        ))}
      </div>
    </div>
  );
});

QueueTab.displayName = "QueueTab";
export default QueueTab;
