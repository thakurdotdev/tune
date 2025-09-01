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
import Link from "next/link";
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
        className={`w-[5px] bg-primary rounded-full animate-pulse`}
        style={{
          animationDelay: `${i * 0.15}s`,
          height: `${15 + Math.sin(i) * 2}px`,
          animationDuration: "1.2s",
        }}
      />
    ))}
  </div>
));

export const SongCard = memo(({ song }: { song: Song }) => {
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
    setIsPlayerInit(true);
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
    <div
      className="group cursor-pointer w-full max-w-[160px] sm:w-40"
      key={song.id}
    >
      {/* Main Card */}
      <div
        className={cn(
          "relative rounded-xl overflow-hidden hover:bg-accent/50 p-3",
          isCurrentSong && "bg-accent border border-primary/20",
        )}
      >
        {/* Album Art Section */}
        <div className="relative mb-3">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <LazyImage
              src={getImageUrl(song)}
              alt={name}
              height={140}
              width={140}
              className="w-full h-full object-cover"
            />

            {/* Play Button - Always visible on mobile, hover on desktop */}
            <div
              className={cn(
                "absolute bottom-2 right-2",
                isCurrentSong && isPlaying
                  ? "" // Always visible when current song is playing
                  : "sm:transform sm:translate-x-8 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100",
              )}
            >
              <Button
                size="sm"
                onClick={handlePlayClick}
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-md bg-primary/10 backdrop-blur-sm",
                )}
              >
                {isCurrentSong && isPlaying ? (
                  <AudioWave />
                ) : (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Song Information */}
        <div className="space-y-1">
          <h3
            className={cn(
              "text-sm sm:text-base font-medium line-clamp-1 ",
              isCurrentSong
                ? "text-primary"
                : "text-foreground group-hover:text-primary",
            )}
          >
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {artistName}
          </p>
        </div>
      </div>
    </div>
  );
});

export const FullSongCard = memo(({ song }: { song: Song }) => {
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
    setIsPlayerInit(true);
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
      addToHistory.mutate({
        songData: song,
        playedTime: 10,
      });
    }
  };

  const isInQueue = queue.some((item: Song) => item.id === song.id);

  const handleAddToQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addToQueue(song);
      toast.success(`Added ${name} to queue`);
    },
    [song, name, addToQueue],
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
    [queue, song.id, name, removeFromQueue],
  );

  return (
    <div
      key={song.id}
      className={cn(
        "group relative overflow-hidden hover:bg-accent/50  rounded-lg p-2",
        isCurrentSong && "bg-accent",
      )}
    >
      <div className="relative flex items-center gap-3">
        <div
          className="relative w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-md flex-shrink-0"
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
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center">
              <AudioWave />
            </div>
          )}
        </div>

        {/* Song Information */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handlePlayClick}
        >
          <h4 className="text-sm font-medium line-clamp-1 mb-1">{name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {artistName}
          </p>
        </div>

        {/* Actions - Always visible on mobile */}
        {song.type === "song" && (
          <div
            className={cn(
              "flex items-center gap-1 transition-all duration-300 ease-out",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full transition-all duration-150",
                isInQueue
                  ? "text-destructive hover:bg-destructive/10"
                  : "hover:bg-accent",
              )}
              onClick={isInQueue ? handleRemoveFromQueue : handleAddToQueue}
            >
              <Heart
                className={cn("h-3.5 w-3.5", isInQueue && "fill-current")}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-accent transition-all duration-150"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {song?.album_id && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/music/album/${song.album_id}`}
                      className="cursor-pointer"
                    >
                      Go to album
                    </Link>
                  </DropdownMenuItem>
                )}
                {song?.artist_map?.primary_artists?.[0] && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/music/artist/${song.artist_map.primary_artists[0].id}`}
                      className="cursor-pointer"
                    >
                      Go to artist
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={isInQueue ? handleRemoveFromQueue : handleAddToQueue}
                  className="cursor-pointer"
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
  if (!artist?.name || !artist?.image) return null;

  const imageUrl = useMemo(
    () => (Array.isArray(artist.image) ? artist.image[2].link : artist.image),
    [artist.image],
  );

  return (
    <Link
      key={artist.id}
      href={getHref(artist.url || "", "artist")}
      className="group cursor-pointer w-full max-w-[160px] sm:w-40"
    >
      {/* Main Card */}
      <div className="relative rounded-xl overflow-hidden hover:bg-accent/50  p-3 text-center">
        {/* Artist Image */}
        <div className="relative mb-3 mx-auto">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-full mx-auto shadow-lg border-2 border-border/20">
            <LazyImage
              src={imageUrl}
              alt={artist.name}
              height={112}
              width={112}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Artist Badge */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
              <User className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-medium">Artist</span>
            </div>
          </div>
        </div>

        {/* Artist Information */}
        <div className="pt-2">
          <h3 className="text-sm sm:text-base font-medium line-clamp-1  text-foreground group-hover:text-primary mb-1">
            {artist.name}
          </h3>
        </div>
      </div>
    </Link>
  );
});

export const AlbumCard = memo(({ album }: { album: Album }) => {
  const name = useMemo(() => album.name, [album]);

  return (
    <Link
      key={album.id}
      href={getHref(album.url || "", "album")}
      className="group cursor-pointer w-full max-w-[160px] sm:w-40"
    >
      <div className="relative rounded-xl overflow-hidden hover:bg-accent/50  p-3">
        {/* Album Art with Vinyl Effect */}
        <div className="relative mb-3">
          <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg bg-accent/20">
            <LazyImage
              src={album.image?.[2]?.link}
              alt={name}
              height={140}
              width={140}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />

            {/* Play Button */}
            <div
              className={cn(
                "absolute bottom-2 right-2 transition-all duration-300 ease-out",
                "sm:transform sm:translate-x-8 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100",
              )}
            >
              <Button
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-md"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Album Information */}
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-medium line-clamp-1  text-foreground group-hover:text-primary">
            {name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground">Album</p>
            {album.language && (
              <Badge
                variant="secondary"
                className="text-xs h-5 px-2 rounded-full bg-accent/50 text-muted-foreground"
              >
                {album.language}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

export const PlaylistCard = memo(({ playlist }: { playlist: Playlist }) => {
  if (!playlist?.name || !playlist?.image) return null;

  const subtitle = useMemo(() => playlist.subtitle || "Playlist", [playlist]);
  const imageUrl = useMemo(
    () =>
      Array.isArray(playlist.image) ? playlist.image[2].link : playlist.image,
    [playlist.image],
  );

  return (
    <Link
      key={playlist.id}
      href={getHref(playlist.url || "", playlist.type)}
      className="group cursor-pointer w-full max-w-[160px] sm:w-40"
    >
      {/* Main Card */}
      <div className="relative rounded-xl overflow-hidden hover:bg-accent/50  p-3">
        {/* Playlist Image */}
        <div className="relative mb-3">
          <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg border border-border/20">
            <LazyImage
              src={imageUrl}
              alt={playlist.name}
              height={140}
              width={140}
              className="w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />

            {/* Playlist indicator */}
            <div className="absolute top-2 left-2 opacity-70">
              <div className="flex flex-col gap-0.5">
                <div className="w-4 h-0.5 bg-primary rounded-full" />
                <div className="w-3 h-0.5 bg-primary/70 rounded-full" />
                <div className="w-3.5 h-0.5 bg-primary/50 rounded-full" />
              </div>
            </div>

            {/* Play Button */}
            <div
              className={cn(
                "absolute bottom-2 right-2 transition-all duration-300 ease-out",
                "sm:transform sm:translate-x-8 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100",
              )}
            >
              <Button
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-md"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Playlist Information */}
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-medium line-clamp-1  text-foreground group-hover:text-primary">
            {playlist.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
});
