import { Skeleton } from "@/components/ui/skeleton";

export const DetailPageSkeleton = () => {
  return (
    <div className="flex flex-col gap-10 py-5">
      {/* Header Section Skeleton */}
      <div className="w-full h-[250px] sm:h-[300px] rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="rounded-2xl w-full h-full bg-black/60 backdrop-blur-sm flex flex-col transition-all">
          <div className="flex flex-col p-3">
            <div className="flex items-center p-3 gap-6">
              {/* Album/Artist/Playlist Image Skeleton */}
              <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[250px] rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full bg-white/20" />
              </div>

              {/* Content Information Skeleton */}
              <div className="h-[150px] sm:h-[200px] flex flex-col py-3 flex-1">
                {/* Title - Hidden on mobile */}
                <Skeleton className="h-8 sm:h-10 w-3/4 max-w-sm bg-white/20 mb-3 hidden sm:block" />

                {/* Description lines */}
                <Skeleton className="h-4 w-full max-w-md bg-white/15 mb-2" />
                <Skeleton className="h-4 w-2/3 max-w-xs bg-white/15 mb-2" />

                {/* Stats section */}
                <div className="mt-5 flex flex-col gap-2">
                  <Skeleton className="h-3 w-24 bg-white/15" />
                  <Skeleton className="h-3 w-32 bg-white/15" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile title */}
          <div className="ml-5 sm:hidden">
            <Skeleton className="h-5 w-48 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Songs Grid Skeleton */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] w-full mt-6 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SongCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const SongCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden hover:bg-accent/50 rounded-lg p-2">
      <div className="relative flex items-center gap-3">
        {/* Song Image Skeleton */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-md flex-shrink-0">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Song Information Skeleton */}
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default DetailPageSkeleton;
