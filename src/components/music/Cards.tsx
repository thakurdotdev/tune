"use client";

import LazyImage from "@/components/LazyImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getHref } from "@/lib/utils";
import { useAddToHistory } from "@/queries/useMusic";
import {
  useCurrentIndex,
  useIsPlaying,
  usePlaybackStore,
  useQueue,
} from "@/stores/playbackStore";
import { Album, Artist, Playlist } from "@/types/music";
import { Song } from "@/types/song";
import { Heart, MoreVertical, Play, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo } from "react";
import { useAudioPlayerContext } from "react-use-audio-player";
import { toast } from "sonner";
import "./music.css";

const getImageUrl = (song: Song) => {
  return Array.isArray(song.image)
    ? song.image?.[2].link || song.image?.[1].link || song.image?.[0].link
    : song.image;
};

export const AudioWave = memo(() => (
  <div className="flex items-center gap-[2px]">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className={`w-[2px] bg-background rounded-full animate-pulse`}
        style={{
          animationDelay: `${i * 0.15}s`,
          height: `${8 + Math.sin(i) * 4}px`,
          animationDuration: "1.2s",
        }}
      />
    ))}
  </div>
));

export const SongCard = memo(({ song }: { song: Song }) => {
  const isPlayerInit = useIsPlaying();
  const setIsPlayerInit = usePlaybackStore((state) => state.setIsPlaying);
  const { togglePlayPause, isPlaying } = useAudioPlayerContext();
  const queue = useQueue();
  const currentIndex = useCurrentIndex();
  const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
  const setQueue = usePlaybackStore((state) => state.setQueue);
  const addToHistory = useAddToHistory();

  const currentSong = queue[currentIndex] || null;

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
    if (isCurrentSong) {
      togglePlayPause();
    } else if (!isInQueue) {
      setQueue([song]);
      setIsPlayerInit(true);
      addToHistory.mutate({
        songData: song,
        playedTime: 10,
      });
    } else {
      setCurrentIndex(queue.findIndex((item) => item.id === song.id));
      setIsPlayerInit(true);
    }
  };

  return (
    <div className="group cursor-pointer w-44" key={song.id}>
      {/* Main Card */}
      <div
        className={cn(
          "relative rounded-lg overflow-hidden hover:bg-primary/5",
          isCurrentSong && "bg-primary/5 border-primary/30",
        )}
      >
        {/* Compact Album Art Section */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden">
            <LazyImage
              src={getImageUrl(song)}
              alt={name}
              height={170}
              width={176}
              className="w-full h-full object-cover rounded-lg"
            />

            {/* Bottom-right Play Button Overlay */}
            <div className="absolute bottom-2 right-2 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
              <Button
                size="sm"
                onClick={handlePlayClick}
                className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary hover:scale-110 transition-all duration-200 shadow-lg"
              >
                {isCurrentSong && isPlaying ? (
                  <AudioWave />
                ) : (
                  <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Song Information */}
        <div className="py-4 px-2">
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
        </div>
      </div>
    </div>
  );
});

export const FullSongCard = memo(({ song }: { song: Song }) => {
  const router = useRouter();
  const isPlayerInit = useIsPlaying();
  const setIsPlayerInit = usePlaybackStore((state) => state.setIsPlaying);
  const { togglePlayPause } = useAudioPlayerContext();
  const queue = useQueue();
  const currentIndex = useCurrentIndex();
  const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
  const setQueue = usePlaybackStore((state) => state.setQueue);
  const addToQueue = usePlaybackStore((state) => state.addToQueue);
  const removeFromQueue = usePlaybackStore((state) => state.removeFromQueue);
  const addToHistory = useAddToHistory();

  const currentSong = queue[currentIndex] || null;

  if (!song?.id || !song?.image?.[2]) return null;

  const isCurrentSong = currentSong?.id === song.id;
  const name = song.name || song.title || "";
  const artistName =
    song?.artist_map?.artists
      ?.slice(0, 3)
      ?.map((artist) => artist.name)
      .join(", ") || song?.name;

  const handlePlayClick = async () => {
    if (isPlayerInit && isCurrentSong) {
      togglePlayPause();
    } else if (!isInQueue) {
      setQueue([song]);
      setIsPlayerInit(true);
      addToHistory.mutate({
        songData: song,
        playedTime: 10,
      });
    } else {
      setCurrentIndex(queue.findIndex((item) => item.id === song.id));
      setIsPlayerInit(true);
      addToHistory.mutate({
        songData: song,
        playedTime: 10,
      });
    }
  };

  if (!song?.id || !song?.image?.[2]) return null;

  const isInQueue = queue.some((item: Song) => item.id === song.id);

  const handleAddToQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addToQueue(song);
      toast.success(`Added ${name} to queue`);
    },
    [song, name, isCurrentSong],
  );

  const handleRemoveFromQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentIndex = queue.findIndex((item) => item.id === song.id);
      if (currentIndex !== -1) {
        removeFromQueue(currentIndex);
      }
      toast.success(`Removed ${name} from queue`);
    },
    [queue, song.id, name],
  );

  return (
    <div
      key={song.id}
      className={cn(
        "group relative overflow-hidden hover:bg-primary/5",
        isCurrentSong && "bg-primary/5",
      )}
    >
      <div className="relative flex items-center gap-3">
        <div
          className="relative w-14 h-14 overflow-hidden"
          onClick={handlePlayClick}
        >
          <LazyImage
            src={getImageUrl(song)}
            alt={name}
            height={56}
            width={56}
            className="w-full h-full object-cover"
          />
          {isCurrentSong && isPlayerInit && (
            <div className="absolute left-0 top-0 w-14 h-14 bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <AudioWave />
            </div>
          )}
        </div>

        {/* Song Information */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handlePlayClick}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-medium line-clamp-1">{name}</h4>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {artistName}
          </p>
        </div>

        {/* Minimal Actions */}
        {song.type === "song" && (
          <div className="flex items-center transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 w-7 p-0 rounded-full transition-all duration-150",
                isInQueue
                  ? "text-red-500 hover:bg-red-100 dark:hover:bg-red-950"
                  : "hover:bg-muted",
              )}
              onClick={isInQueue ? handleRemoveFromQueue : handleAddToQueue}
            >
              <Heart className={cn("h-3 w-3", isInQueue && "fill-current")} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full hover:bg-muted transition-all duration-150"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {song?.album_id && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/music/album/${song.album_id}`)}
                    className="cursor-pointer text-sm"
                  >
                    Go to album
                  </DropdownMenuItem>
                )}
                {song?.artist_map?.primary_artists?.[0] && (
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/music/artist/${song.artist_map.primary_artists[0].id}`,
                      )
                    }
                    className="cursor-pointer text-sm"
                  >
                    Go to artist
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={isInQueue ? handleRemoveFromQueue : handleAddToQueue}
                  className="cursor-pointer text-sm"
                >
                  {isInQueue ? "Remove from queue" : "Add to queue"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
});

export const ArtistCard = memo(({ artist }: { artist: Artist }) => {
  const router = useRouter();

  if (!artist?.name || !artist?.image) return null;

  const imageUrl = useMemo(
    () => (Array.isArray(artist.image) ? artist.image[2].link : artist.image),
    [artist.image],
  );

  const handleClick = useCallback(() => {
    router.push(getHref(artist.url, "artist"));
  }, [artist.url, router]);

  return (
    <div
      key={artist.id}
      className="group cursor-pointer w-44"
      onClick={handleClick}
    >
      {/* Main Card */}
      <div className="relative rounded-lg overflow-hidden hover:bg-primary/5 transition-colors duration-300">
        {/* Circular Artist Image Section */}
        <div className="relative p-4">
          <div className="relative w-full aspect-square overflow-hidden rounded-full ring-4 ring-background shadow-lg">
            <LazyImage
              src={imageUrl}
              alt={artist.name}
              height={170}
              width={176}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Online Status Indicator */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg animate-pulse" />
          </div>

          {/* Artist Badge */}
          <div className="absolute top-6 left-6 transform -translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <div className="flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-full border border-border/30 shadow-lg">
              <User className="w-3 h-3 text-primary" />
              <span className="text-xs text-foreground font-medium">
                Artist
              </span>
            </div>
          </div>
        </div>

        {/* Artist Information */}
        <div className="px-4 pb-4">
          <div className="text-center space-y-1">
            <h3 className="text-base font-semibold line-clamp-1 transition-colors duration-300 text-foreground group-hover:text-primary">
              {artist.name}
            </h3>
            <p className="text-sm text-muted-foreground">Artist</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export const AlbumCard = memo(({ album }: { album: Album }) => {
  const router = useRouter();
  const name = useMemo(() => album.name, [album]);

  const handleClick = useCallback(
    () => router.push(getHref(album.url, "album")),
    [album.url, router],
  );

  return (
    <div
      key={album.id}
      className="group cursor-pointer w-44"
      onClick={handleClick}
    >
      <div className="relative rounded-lg overflow-hidden hover:bg-primary/5 transition-colors duration-300">
        <div className="relative p-3">
          <div className="absolute inset-3 bg-gray-800/20 rounded-full blur-sm transform rotate-2 scale-95" />

          <div className="relative aspect-square overflow-hidden rounded-full border-4 border-gray-800 shadow-2xl bg-gray-900">
            <LazyImage
              src={album.image?.[2]?.link}
              alt={name}
              height={170}
              width={176}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:rotate-12 group-hover:scale-105"
            />

            {/* Center Hole */}
            <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-background rounded-full border-4 border-gray-600 transform -translate-x-1/2 -translate-y-1/2 shadow-inner z-10">
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Play Button */}
            <div className="absolute bottom-2 right-2 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
              <Button
                size="sm"
                className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Album Information */}
        <div className="p-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold line-clamp-1 transition-colors duration-300 text-foreground group-hover:text-primary">
              {name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Album</p>
              {album.language && (
                <Badge
                  variant="secondary"
                  className="text-xs h-5 px-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                >
                  {album.language}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const PlaylistCard = memo(({ playlist }: { playlist: Playlist }) => {
  const router = useRouter();

  if (!playlist?.name || !playlist?.image) return null;

  const subtitle = useMemo(() => playlist.subtitle || "Playlist", [playlist]);
  const imageUrl = useMemo(
    () =>
      Array.isArray(playlist.image) ? playlist.image[2].link : playlist.image,
    [playlist.image],
  );

  const handleClick = useCallback(
    () => router.push(getHref(playlist.url, playlist.type)),
    [playlist.url, playlist.type, router],
  );

  return (
    <div
      key={playlist.id}
      className="group cursor-pointer w-44"
      onClick={handleClick}
    >
      {/* Main Card with Stacked Effect */}
      <div className="relative rounded-lg overflow-hidden hover:bg-primary/5">
        {/* Stacked Cards Section */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border/30 shadow-lg">
            <LazyImage
              src={imageUrl}
              alt={playlist.name}
              height={170}
              width={176}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Stack indicator */}
            <div className="absolute top-2 left-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
              <div className="flex flex-col gap-0.5">
                <div className="w-6 h-1 bg-primary rounded-full" />
                <div className="w-5 h-1 bg-primary/60 rounded-full" />
                <div className="w-4 h-1 bg-primary/40 rounded-full" />
              </div>
            </div>

            {/* Play Button */}
            <div className="absolute bottom-2 right-2 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
              <Button
                size="sm"
                className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary hover:scale-110 transition-all duration-200 shadow-lg"
              >
                <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Playlist Information */}
        <div className="py-4 px-2">
          <div className="space-y-1">
            <h3 className="text-base font-semibold line-clamp-1 transition-colors duration-300 text-foreground group-hover:text-primary">
              {playlist.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
