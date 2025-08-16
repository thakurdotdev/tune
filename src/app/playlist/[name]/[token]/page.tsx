"use client";

import { SongCard } from "@/components/music/Cards";
import { usePlaylistDetails } from "@/queries/useMusic";
import { Loader2 } from "lucide-react";
import { use } from "react";

const Playlist = ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = use(params);

  const { data: playlistData, isPending } = usePlaylistDetails(token);

  if (isPending)
    return (
      <>
        <Loader2 className="animate-spin" />
      </>
    );

  const bgUrl = playlistData?.image;

  return (
    <div className="flex flex-col gap-10 py-5">
      {/** Playlist Info */}
      <div
        className="w-full h-[250px] sm:h-[300px] rounded-2xl"
        style={{
          backgroundImage: `url('${bgUrl}')`,
          backgroundSize: "cover",
        }}
      >
        <div className="rounded-2xl w-full h-full bg-black/60 backdrop-blur-sm flex flex-col transition-all">
          <div className="flex flex-col p-3">
            <div className="flex items-center p-3 gap-6">
              <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[250px] rounded-lg overflow-hidden">
                <img src={bgUrl} className="object-cover w-full h-full" />
              </div>
              <div className="h-[150px] sm:h-[200px] flex flex-col py-3">
                <h1 className="text-white text-3xl font-semibold hidden sm:block">
                  {playlistData?.name}
                </h1>
                <p className="text-base text-white/70 font-medium mt-1">
                  {playlistData?.header_desc}
                </p>
                <div className="mt-5 flex flex-col">
                  <p className="text-sm text-white/80">
                    {playlistData?.list_count} songs
                  </p>
                  <p className="text-sm text-white/80">
                    {formatCount(playlistData?.follower_count)} followers
                  </p>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-white text-xl font-semibold ml-5 sm:hidden line-clamp-1">
            {playlistData?.name}
          </h1>
        </div>
      </div>

      {/** Playlist Songs */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] w-full mt-6 gap-4">
        {(playlistData?.songs ?? []).map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

function formatCount(count?: number) {
  if (count === undefined || count === null) {
    return "N/A";
  }

  if (count >= 1000000000) {
    return (count / 1000000000).toFixed(1) + "B";
  } else if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  } else {
    return count.toString();
  }
}

export default Playlist;
