'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useHomePageMusic, useRecentMusic } from '@/queries/useMusic';
import { Clock, Disc3, Loader2, Music2, Star, TrendingUp, Users } from 'lucide-react';
import React from 'react';
import { AlbumCard, ArtistCard, FullSongCard, PlaylistCard, SongCard } from './Cards';
import './music.css';

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
      <div className={cn('flex items-start gap-3 mb-4', className)}>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground leading-tight">
            {title}
          </h2>
        </div>
      </div>
    );
  }
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
      <section className={cn('space-y-3 md:space-y-4', className)}>
        <SectionHeader title={title} subtitle={subtitle} icon={icon} />
        {children}
      </section>
    );
  }
);

const useWheelScroll = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);

  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const checkScrollable = () => {
      const viewport = scrollContainer.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLElement;
      if (viewport) {
        const canScroll = viewport.scrollWidth > viewport.clientWidth;
        setIsScrollable(canScroll);
        scrollContainer.setAttribute('data-scrollable', canScroll.toString());
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const viewport = scrollContainer.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLElement;
      if (!viewport) return;

      const canScrollHorizontally = viewport.scrollWidth > viewport.clientWidth;

      if (canScrollHorizontally) {
        e.preventDefault();
        e.stopPropagation();

        // Calculate scroll amount based on wheel delta with higher multiplier
        // Use deltaX if available (for horizontal scrolling), otherwise use deltaY
        let scrollAmount = 0;

        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          // Horizontal wheel/trackpad scroll
          scrollAmount = e.deltaX * 3; // Increased from 2 to 3
        } else {
          // Vertical wheel scroll - convert to horizontal with higher sensitivity
          scrollAmount = e.deltaY * 8; // Increased from 4 to 8 for much more responsiveness
        }

        // Add momentum for faster scrolling
        if (Math.abs(e.deltaY) > 50) {
          scrollAmount *= 3; // Increased from 2 to 3 for even faster wheel scrolls
        }

        // Add acceleration for very fast scrolling
        if (Math.abs(e.deltaY) > 100) {
          scrollAmount *= 2; // Additional multiplier for very fast scrolls
        }

        viewport.scrollLeft += scrollAmount;
      }
    };

    // Add keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      const viewport = scrollContainer.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLElement;
      if (!viewport) return;

      const canScrollHorizontally = viewport.scrollWidth > viewport.clientWidth;

      if (canScrollHorizontally && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const scrollAmount = e.key === 'ArrowLeft' ? -300 : 300; // Large scroll for keyboard
        viewport.scrollLeft += scrollAmount;
      }
    };

    // Initial check
    checkScrollable();

    // Event listeners
    window.addEventListener('resize', checkScrollable);
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('keydown', handleKeyDown);

    // Make container focusable for keyboard navigation
    scrollContainer.setAttribute('tabindex', '0');

    // Observer for content changes
    const observer = new MutationObserver(checkScrollable);
    observer.observe(scrollContainer, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', checkScrollable);
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, []);

  return { scrollRef, isScrollable };
};

const ScrollableSection = React.memo(({ children }: { children: React.ReactNode }) => {
  const { scrollRef, isScrollable } = useWheelScroll();

  return (
    <div
      className={cn(
        'scrollable-section',
        isScrollable && 'relative',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg'
      )}
      ref={scrollRef}
      role="region"
      aria-label="Scrollable content section"
    >
      <ScrollArea className="w-full whitespace-nowrap horizontal-scroll-container">
        <div className="flex space-x-3 py-2 px-0.5">{children}</div>
        <ScrollBar
          orientation="horizontal"
          className="h-2 mt-3 opacity-50 cursor-pointer hover:opacity-80 transition-opacity duration-200"
        />
      </ScrollArea>
    </div>
  );
});

const RecentlyPlayedSection = React.memo(({ recentData }: { recentData: any }) => {
  const { scrollRef, isScrollable } = useWheelScroll();

  return (
    <LazySection title="Recently Played" subtitle="Pick up where you left off" icon={Clock}>
      {/* Scrollable layout for recently played - 4 items on mobile, 8 items (4x2) on desktop per page */}
      <div
        className={cn(
          'scrollable-section',
          isScrollable && 'relative',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg'
        )}
        ref={scrollRef}
        role="region"
        aria-label="Recently played music section"
      >
        <ScrollArea className="w-full horizontal-scroll-container">
          <div className="flex space-x-6 md:space-x-8 pb-4">
            {/* Create pages of items - Mobile: 4 items per page, Desktop: 8 items per page */}
            {Array.from({
              length: Math.ceil((recentData?.recentlyPlayed?.length ?? 0) / 4),
            }).map((_, pageIndex) => {
              const mobileStartIndex = pageIndex * 4;
              const mobileEndIndex = mobileStartIndex + 4;
              const mobilePageItems = (recentData?.recentlyPlayed ?? []).slice(
                mobileStartIndex,
                mobileEndIndex
              );

              return (
                <div
                  key={`mobile-${pageIndex}`}
                  className="md:hidden flex-shrink-0 w-full grid grid-cols-1 gap-3"
                >
                  {mobilePageItems.map((song: any) => (
                    <FullSongCard song={song} key={song.id} />
                  ))}
                </div>
              );
            })}

            {/* Desktop pages - 8 items (4x2) per page */}
            {Array.from({
              length: Math.ceil((recentData?.recentlyPlayed?.length ?? 0) / 8),
            }).map((_, pageIndex) => {
              const desktopStartIndex = pageIndex * 8;
              const desktopEndIndex = desktopStartIndex + 8;
              const desktopPageItems = (recentData?.recentlyPlayed ?? []).slice(
                desktopStartIndex,
                desktopEndIndex
              );

              return (
                <div key={`desktop-${pageIndex}`} className="hidden md:block flex-shrink-0 w-full">
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                    {desktopPageItems.map((song: any) => (
                      <FullSongCard song={song} key={song.id} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollBar
            orientation="horizontal"
            className="h-2 mt-3 opacity-50 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          />
        </ScrollArea>
      </div>
    </LazySection>
  );
});

const LoadingSkeleton = React.memo(() => (
  <div className="space-y-8 md:space-y-12">
    {Array.from({ length: 3 }).map((_, sectionIndex) => (
      <div key={sectionIndex} className="space-y-3 md:space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
            <Skeleton className="h-3 md:h-4 w-32 md:w-48" />
          </div>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-3 md:space-x-4 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="min-w-[140px] md:min-w-[180px] h-[180px] md:h-[240px] rounded-xl flex-shrink-0"
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    ))}
  </div>
));

const ErrorState = React.memo(
  ({ error, onRetry }: { error: string | null; onRetry: () => void }) => (
    <Card className="flex flex-col items-center justify-center min-h-[50vh] p-6 md:p-12 mx-4 md:mx-6 bg-card/50 backdrop-blur-sm border-border/20">
      <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-destructive/10 mb-4 md:mb-6">
        <Music2 className="w-8 h-8 md:w-10 md:h-10 text-destructive" />
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-destructive text-center font-medium mb-2">{error}</p>
      <p className="text-xs md:text-sm text-muted-foreground text-center mb-6 md:mb-8 max-w-md">
        We're having trouble loading your music. Please check your connection and try again.
      </p>
      <Button
        onClick={onRetry}
        variant="default"
        size="sm"
        className="gap-2 min-w-[120px] md:min-w-[140px]"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Try Again
      </Button>
    </Card>
  )
);

const WelcomeHeader = React.memo(() => (
  <div className="mb-8 md:mb-12">
    <div className="space-y-1">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
        Welcome back, Pankaj
      </h1>
      <p className="text-sm md:text-base text-muted-foreground">Discover your music</p>
    </div>
  </div>
));

const HomePage = () => {
  const { data: homePageData, isLoading, error, refetch } = useHomePageMusic();
  const { data: recentData, isLoading: recentLoading, error: recentError } = useRecentMusic();

  if (isLoading || recentLoading) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="px-4 md:px-6 pt-4 md:pt-8 pb-20 md:pb-24">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="pt-4 md:pt-8 pb-20 md:pb-24">
          <ErrorState error={error.message} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!homePageData) return null;

  const hasRecentlyPlayed = (recentData?.recentlyPlayed?.length ?? 0) > 0;
  const hasMostlyListened = (recentData?.songs?.length ?? 0) > 0;

  return (
    <div className="relative pt-4 md:pt-6 pb-20 md:pb-24">
      {/* <WelcomeHeader /> */}

      <div className="space-y-8 md:space-y-12">
        {hasRecentlyPlayed && <RecentlyPlayedSection recentData={recentData} />}

        {hasMostlyListened && (
          <LazySection title="Your Favorites" subtitle="Songs you play on repeat" icon={Star}>
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
                .filter((song) => song.type === 'song')
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
          <LazySection title="Top Charts" subtitle="The hottest tracks right now" icon={TrendingUp}>
            <ScrollableSection>
              {homePageData.charts.data.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </ScrollableSection>
          </LazySection>
        )}

        {homePageData.artist_recos?.data?.length > 0 && (
          <LazySection title="Popular Artists" subtitle="Artists you might like" icon={Users}>
            <ScrollableSection>
              {homePageData.artist_recos.data.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </ScrollableSection>
          </LazySection>
        )}

        {homePageData.albums?.data?.length > 0 && (
          <LazySection title="New Releases" subtitle="Fresh albums to explore" icon={Disc3}>
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

export default HomePage;
