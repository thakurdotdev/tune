"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useHomePageMusic, useRecentMusic } from "@/queries/useMusic";
import {
  Clock,
  Disc3,
  Loader2,
  Music2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import React from "react";
import { AlbumCard, ArtistCard, PlaylistCard, SongCard } from "./Cards";

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
      <div className={cn("flex items-center gap-3 mb-3", className)}>
        {Icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-8 h-8" />
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
      <div className="flex space-x-4 py-4 px-1">{children}</div>
      <ScrollBar orientation="horizontal" className="h-2 mt-2" />
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

  if (isLoading || recentLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="px-4 md:px-6 pt-8 pb-24">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

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
    <div className="relative pt-6 pb-24">
      <div className="mb-12 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome back, Pankaj
            </span>
          </h1>
        </div>
      </div>

      <div className="space-y-16">
        {hasRecentlyPlayed && (
          <LazySection
            title="Recently Played"
            subtitle="Pick up where you left off"
            icon={Clock}
          >
            <ScrollableSection>
              {(recentData?.recentlyPlayed ?? []).map((song) => (
                <SongCard song={song} key={song.id} />
              ))}
            </ScrollableSection>
          </LazySection>
        )}

        {hasMostlyListened && (
          <LazySection
            title="Your Favorites"
            subtitle="Songs you play on repeat"
            icon={Star}
          >
            <ScrollableSection>
              {(recentData?.songs ?? []).map((song) => (
                <SongCard song={song} key={song.id} />
              ))}
            </ScrollableSection>
          </LazySection>
        )}

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
                  <SongCard song={song} key={song.id} />
                ))}
            </ScrollableSection>
          </LazySection>
        )}

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
  );
};

export default React.memo(HomePage);
