"use client";

import { FullSongCard } from "@/components/music/Cards";
import DetailPageSkeleton from "@/components/DetailPageSkeleton";
import { useArtistDetails } from "@/queries/useMusic";
import { use } from "react";

const Artist = ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = use(params);

  const { data: artistData, isPending } = useArtistDetails(token);

  if (isPending) {
    return <DetailPageSkeleton />;
  }

  const bgUrl =
    artistData?.image?.[2]?.link ||
    artistData?.image?.[1]?.link ||
    artistData?.image?.[0]?.link;

  return (
    <div className="flex flex-col gap-10 py-5">
      {/** Album Info */}
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
                  {artistData?.name}
                </h1>
                <p className="text-base text-white/70 font-medium mt-1">
                  {artistData?.header_desc}
                </p>
                <p className="text-base text-white/70 font-medium mt-1">
                  {artistData?.follower_count} followers
                </p>
                <div className="mt-5 flex flex-col">
                  <p className="text-sm text-white/80">
                    {artistData?.list_count} songs
                  </p>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-white text-xl font-semibold ml-5 sm:hidden line-clamp-1">
            {artistData?.name}
          </h1>
        </div>
      </div>

      {/** Artist Songs */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] w-full mt-6 gap-4">
        {(artistData?.top_songs ?? []).map((song) => (
          <FullSongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default Artist;
