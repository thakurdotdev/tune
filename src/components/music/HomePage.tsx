import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useHomePageMusic, useRecentMusic } from "@/queries/useMusic";
import {
  Loader2,
  Music2,
  TrendingUp,
  Clock,
  Star,
  Users,
  Disc3,
  Play,
  Pause,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import React, { memo, useState, useCallback } from "react";
import { AlbumCard, ArtistCard, PlaylistCard, AudioWave } from "./Cards";
import { SongCard } from "./SongCard";
import LazyImage from "@/components/LazyImage";
import { useAudioManager, useIsPlaying } from "@/stores/audioStore";
import {
  useCurrentSong,
  usePlaybackStore,
  useQueue,
} from "@/stores/playbackStore";
import { useAddToHistory } from "@/queries/useMusic";
import { Song } from "@/types/song";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Recent Music Card Component - Modern Design following existing patterns
const RecentMusicCard = memo(({ song }: { song: Song }) => {
  const currentSong = useCurrentSong();
  const queue = useQueue();
  const isPlaying = useIsPlaying();
  const audioManager = useAudioManager();
  const setCurrentSong = usePlaybackStore((state) => state.setCurrentSong);
  const addToQueueAction = usePlaybackStore((state) => state.addToQueue);
  const addToHistory = useAddToHistory();
  const [loading, setLoading] = useState(false);

  if (!song?.id || !song?.image?.[2]) return null;

  const isCurrentSong = currentSong?.id === song.id;
  const isInQueue = queue.some((item: Song) => item.id === song.id);
  const name = song.name || song.title || "";
  const artistName =
    song?.artist_map?.artists
      ?.slice(0, 3)
      ?.map((artist) => artist.name)
      .join(", ") || song?.name;

  const handlePlayClick = async () => {
    try {
      setLoading(true);
      if (isCurrentSong) {
        if (isPlaying) {
          audioManager?.pause();
        } else {
          audioManager?.play();
        }
        return;
      }

      if (song?.download_url) {
        setCurrentSong(song);
        if (!isInQueue) {
          addToQueueAction(song);
        }
        addToHistory.mutate({
          songData: song,
          playedTime: 10,
        });
      }
    } catch (err: any) {
      console.error("Error fetching song:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isCurrentSong) {
        addToQueueAction(song);
        toast.success(`Added ${name} to queue`);
      }
    },
    [song, name, isCurrentSong, addToQueueAction],
  );

  const handleRemoveFromQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const updatedQueue = queue.filter((item: Song) => item.id !== song.id);
      addToQueueAction(updatedQueue);
      toast.success(`Removed ${name} from queue`);
    },
    [queue, song.id, name, addToQueueAction],
  );

  return (
    <div className="group cursor-pointer w-48">
      {/* Compact Glass Card with Hover Effects */}
      <div className="relative transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:-translate-y-1">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Main Card */}
        <div
          className={cn(
            "relative bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl rounded-2xl border border-border/30 overflow-hidden shadow-md transition-all duration-300",
            isCurrentSong && "bg-primary/5 border-primary/30",
          )}
        >
          {/* Compact Album Art Section */}
          <div className="relative p-3 pb-0">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <LazyImage
                src={
                  Array.isArray(song.image)
                    ? song.image?.[1].link || song.image?.[2].link
                    : song.image
                }
                alt={name}
                height={156}
                width={156}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Compact Play Button Overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : isCurrentSong && isPlaying ? (
                  <div className="w-10 h-10 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <AudioWave />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handlePlayClick}
                    className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
                  </Button>
                )}
              </div>

              {/* Compact Recently Played Badge */}
              <div className="absolute top-2 left-2">
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-background/90 backdrop-blur-sm rounded-full border border-border/30">
                  <Clock className="w-2.5 h-2.5 text-primary" />
                  <span className="text-[10px] text-foreground font-medium">
                    Recent
                  </span>
                </div>
              </div>

              {/* Current Playing Indicator */}
              {isCurrentSong && (
                <div className="absolute top-2 right-2">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Song Information */}
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <h3
                className={cn(
                  "text-base font-semibold line-clamp-1 transition-colors duration-300",
                  isCurrentSong
                    ? "text-primary"
                    : "text-foreground group-hover:text-primary",
                )}
              >
                {name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {artistName}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-all duration-200"
                  onClick={isInQueue ? handleRemoveFromQueue : handleAddToQueue}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isInQueue && "fill-current text-red-500",
                    )}
                  />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-all duration-200"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={
                        isInQueue ? handleRemoveFromQueue : handleAddToQueue
                      }
                      className="cursor-pointer text-sm"
                    >
                      {isInQueue ? "Remove from queue" : "Add to queue"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-sm">
                      Add to playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-sm">
                      Go to artist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Duration or Status */}
              <div className="text-xs text-muted-foreground">
                {isCurrentSong && isPlaying ? "Playing" : "3:45"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const SectionHeader = React.memo(
  ({
    title,
    subtitle,
    icon: Icon,
    className,
  }: {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    className?: string;
  }) => {
    return (
      <div className={cn("flex items-center gap-3 mb-6", className)}>
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    );
  },
);

const LazySection = React.memo(
  ({
    title,
    subtitle,
    icon,
    children,
    className,
  }: {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <section className={cn("space-y-6", className)}>
        <SectionHeader title={title} subtitle={subtitle} icon={icon} />
        {children}
      </section>
    );
  },
);

const ScrollableSection = React.memo(
  ({ children }: { children: React.ReactNode }) => (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 pb-4 px-1">{children}</div>
      <ScrollBar orientation="horizontal" className="h-2" />
    </ScrollArea>
  ),
);

const LoadingSkeleton = React.memo(() => (
  <div className="space-y-8">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[180px] h-[240px] rounded-xl" />
          ))}
        </div>
      </ScrollArea>
    </div>
  </div>
));

const ErrorState = React.memo(
  ({ error, onRetry }: { error: string | null; onRetry: () => void }) => (
    <Card className="flex flex-col items-center justify-center min-h-[60vh] p-12 mx-4 md:mx-6 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
        <Music2 className="w-10 h-10 text-destructive" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-destructive text-center font-medium mb-2">{error}</p>
      <p className="text-sm text-muted-foreground text-center mb-8 max-w-md">
        We're having trouble loading your music. Please check your connection
        and try again.
      </p>
      <Button
        onClick={onRetry}
        variant="default"
        size="lg"
        className="gap-2 min-w-[140px]"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Try Again
      </Button>
    </Card>
  ),
);

const HomePage = () => {
  const { data: homePageData, isLoading, error, refetch } = useHomePageMusic();
  const {
    data: recentData,
    isLoading: recentLoading,
    error: recentError,
  } = useRecentMusic();

  // Show loading state
  if (isLoading || recentLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="px-4 md:px-6 pt-8 pb-24">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="pt-8 pb-24">
          <ErrorState error={error.message} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!homePageData) return null;

  const hasRecentlyPlayed = (recentData?.recentlyPlayed?.length ?? 0) > 0;
  const hasMostlyListened = (recentData?.songs?.length ?? 0) > 0;

  return (
    <div className="relative min-h-screen">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_50%_50%,_theme(colors.primary)_1px,_transparent_1px)] bg-[length:50px_50px]" />

      <div className="relative px-4 md:px-6 pt-6 pb-24">
        {/* Modern Welcome Section */}
        <div className="mb-12 space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back
              </span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl">
              Discover your next favorite song and explore endless musical
              possibilities
            </p>
          </div>
        </div>

        {/* Content Sections with Better Spacing */}
        <div className="space-y-16">
          {/* Recently Played Section - Custom Design */}
          {hasRecentlyPlayed && (
            <LazySection
              title="Recently Played"
              subtitle="Pick up where you left off"
              icon={Clock}
            >
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 pb-4 px-1">
                  {(recentData?.recentlyPlayed ?? []).map((song) => (
                    <RecentMusicCard key={song.id} song={song} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-2" />
              </ScrollArea>
            </LazySection>
          )}

          {/* Your Favorites Section */}
          {hasMostlyListened && (
            <LazySection
              title="Your Favorites"
              subtitle="Songs you play on repeat"
              icon={Star}
            >
              <ScrollableSection>
                {(recentData?.songs ?? []).map((song) => (
                  <SongCard key={song.id} song={song} variant="compact" />
                ))}
              </ScrollableSection>
            </LazySection>
          )}

          {/* Trending Section */}
          {homePageData?.trending?.data?.length > 0 && (
            <LazySection
              title="Trending Now"
              subtitle="What everyone's listening to"
              icon={TrendingUp}
            >
              <ScrollableSection>
                {homePageData.trending.data
                  .filter((song) => song.type === "song")
                  .map((song) => (
                    <SongCard key={song.id} song={song} variant="compact" />
                  ))}
              </ScrollableSection>
            </LazySection>
          )}

          {/* Featured Playlists Section */}
          {homePageData?.playlists?.data?.length > 0 && (
            <LazySection
              title="Featured Playlists"
              subtitle="Curated collections just for you"
              icon={Music2}
            >
              <ScrollableSection>
                {homePageData.playlists.data.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </ScrollableSection>
            </LazySection>
          )}

          {/* Top Charts Section */}
          {homePageData?.charts?.data?.length > 0 && (
            <LazySection
              title="Top Charts"
              subtitle="The hottest tracks right now"
              icon={TrendingUp}
            >
              <ScrollableSection>
                {homePageData.charts.data.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </ScrollableSection>
            </LazySection>
          )}

          {/* Popular Artists Section */}
          {homePageData.artist_recos?.data?.length > 0 && (
            <LazySection
              title="Popular Artists"
              subtitle="Artists you might like"
              icon={Users}
            >
              <ScrollableSection>
                {homePageData.artist_recos.data.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </ScrollableSection>
            </LazySection>
          )}

          {/* New Releases Section */}
          {homePageData.albums?.data?.length > 0 && (
            <LazySection
              title="New Releases"
              subtitle="Fresh albums to explore"
              icon={Disc3}
            >
              <ScrollableSection>
                {homePageData.albums.data.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </ScrollableSection>
            </LazySection>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
