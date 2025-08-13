"use client";

import LazyImage from "@/components/LazyImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAddToHistory } from "@/queries/useMusic";
import { useAudioManager, useIsPlaying } from "@/stores/audioStore";
import {
  useCurrentSong,
  usePlaybackStore,
  useQueue,
} from "@/stores/playbackStore";
import { Album, Artist, Playlist } from "@/types/music";
import { Song } from "@/types/song";
import {
  MoreVertical,
  Heart,
  ListMusic,
  Loader2,
  Disc3,
  Play,
  Pause,
  Plus,
  User,
  Music,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import "./music.css";

export const AudioWave = memo(() => (
  <div className="flex items-center gap-[2px]">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="w-[2px] bg-primary rounded-full animate-pulse"
        style={{
          animationDelay: `${i * 0.15}s`,
          height: `${8 + Math.sin(i) * 4}px`,
          animationDuration: "1.2s",
        }}
      />
    ))}
  </div>
));

export const ArtistCard = memo(({ artist }: { artist: Artist }) => {
  const router = useRouter();

  if (!artist?.name || !artist?.image) return null;

  const imageUrl = useMemo(
    () => (Array.isArray(artist.image) ? artist.image[2].link : artist.image),
    [artist.image],
  );

  const handleClick = useCallback(() => {
    router.push(`/music/artist/${artist.id}`);
  }, [artist.id, router]);

  return (
    <div
      className="group relative w-32 h-40 cursor-pointer"
      onClick={handleClick}
    >
      {/* Floating Card with Magnetic Effect */}
      <div className="relative h-full transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:-translate-y-2">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

        {/* Main Card */}
        <div className="relative h-full bg-gradient-to-br from-card via-card to-muted/30 rounded-3xl border border-border/30 overflow-hidden backdrop-blur-sm">
          {/* Floating Avatar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-14">
            <div className="relative w-full h-full">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-background shadow-lg">
                <LazyImage
                  src={imageUrl}
                  alt={artist.name}
                  height={56}
                  width={56}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              {/* Floating Dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-sm animate-pulse" />
            </div>
          </div>

          {/* Content Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-20">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 transition-colors duration-300 group-hover:text-primary">
                {artist.name}
              </h3>

              {/* Minimalist Badge */}
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full border border-border/30">
                <User className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  Artist
                </span>
              </div>
            </div>
          </div>

          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,_theme(colors.primary)_1px,_transparent_1px)] bg-[length:20px_20px]" />
        </div>
      </div>
    </div>
  );
});

export const FullSongCard = memo(({ song }: { song: Song }) => {
  const router = useRouter();
  const currentSong = useCurrentSong();
  const queue = useQueue();
  const isPlaying = useIsPlaying();

  const audioManager = useAudioManager();
  const setCurrentSong = usePlaybackStore((state) => state.setCurrentSong);
  const addToQueueAction = usePlaybackStore((state) => state.addToQueue);
  const addToHistory = useAddToHistory();

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div
      className={cn(
        "group relative overflow-hidden transition-all duration-200 ease-out hover:scale-[1.005]",
        isCurrentSong && "scale-[1.005]",
      )}
    >
      {/* Subtle Accent Line */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-300",
          isCurrentSong
            ? "bg-primary"
            : "bg-transparent group-hover:bg-muted-foreground/20",
        )}
      />

      {/* Compact Card Container */}
      <div
        className={cn(
          "relative flex items-center gap-3 p-2.5 pl-4 bg-card/50 hover:bg-card/80 transition-all duration-200",
          isCurrentSong && "bg-primary/5",
        )}
      >
        {/* Compact Album Art */}
        <div
          className="relative cursor-pointer group/art flex-shrink-0"
          onClick={
            song.type === "song"
              ? handlePlayClick
              : () => router.push(`/music/${song.type}/${song.id}`)
          }
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-muted transition-all duration-200 group-hover/art:scale-105">
            <LazyImage
              src={
                Array.isArray(song.image) ? song.image?.[1].link : song.image
              }
              alt={name}
              height={44}
              width={44}
              className="w-full h-full object-cover"
            />

            {/* Play Overlay */}
            {song.type === "song" && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/art:opacity-100 transition-all duration-150 rounded-lg">
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : isCurrentSong && isPlaying ? (
                  <AudioWave />
                ) : (
                  <Play className="w-3.5 h-3.5 text-primary fill-primary" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Song Information */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={
            song.type === "song"
              ? handlePlayClick
              : () => router.push(`/music/${song.type}/${song.id}`)
          }
        >
          <div className="flex items-center gap-2 mb-0.5">
            <h4
              className={cn(
                "text-sm font-medium line-clamp-1 transition-colors duration-200",
                isCurrentSong
                  ? "text-primary"
                  : "text-foreground group-hover:text-primary",
              )}
            >
              {name}
            </h4>
            {isCurrentSong && (
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {artistName}
          </p>
        </div>

        {/* Minimal Actions */}
        {song.type === "song" && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer text-sm"
                >
                  Add to playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
});

export const AlbumCard = memo(({ album }: { album: Album }) => {
  const router = useRouter();
  const name = useMemo(() => album.name, [album]);

  const handleClick = useCallback(
    () => router.push(`/music/album/${album.album_id || album?.id}`),
    [album, router],
  );

  return (
    <div className="group cursor-pointer w-36 h-48" onClick={handleClick}>
      {/* Tilt Container */}
      <div className="relative h-full transition-all duration-500 ease-out group-hover:scale-105 group-hover:-rotate-1">
        {/* Vinyl Record Stack Effect */}
        <div className="relative h-36 mb-3">
          {/* Shadow Records */}
          <div className="absolute inset-0 bg-muted/40 rounded-full rotate-2 scale-95 blur-sm" />
          <div className="absolute inset-1 bg-muted/60 rounded-full -rotate-1 scale-98 blur-[1px]" />

          {/* Main Record */}
          <div className="relative w-full h-full bg-gradient-to-br from-card to-muted rounded-full border border-border/30 overflow-hidden shadow-lg">
            <LazyImage
              src={album.image?.[2]?.link}
              alt={name}
              height={144}
              width={144}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"
            />

            {/* Center Hole */}
            <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-background rounded-full border-4 border-muted transform -translate-x-1/2 -translate-y-1/2 shadow-inner">
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-muted rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Spinning Indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-6 h-6 bg-background/90 backdrop-blur-sm rounded-full border border-border/30 flex items-center justify-center">
                <Disc3 className="w-3 h-3 text-muted-foreground animate-spin" />
              </div>
            </div>

            {/* Floating Play Button */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
              <div className="w-12 h-12 bg-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-200 border-4 border-background">
                <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Album Information */}
        <div className="space-y-2 px-1">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
            {name}
          </h3>
          {album.language && (
            <div className="inline-flex">
              <Badge
                variant="secondary"
                className="text-xs h-5 px-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                {album.language}
              </Badge>
            </div>
          )}
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
    () => router.push(`/music/playlist/${playlist.id}`),
    [playlist.id, router],
  );

  return (
    <div className="group cursor-pointer w-36 h-44" onClick={handleClick}>
      {/* Clean Card Design */}
      <div className="relative h-32 mb-3 transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:-translate-y-1">
        {/* Subtle Background Cards */}
        <div className="absolute inset-0 bg-muted/20 rounded-xl transform rotate-1 scale-98" />
        <div className="absolute inset-0 bg-muted/40 rounded-xl transform -rotate-0.5 scale-99" />

        {/* Main Card */}
        <div className="relative w-full h-full bg-card rounded-xl border border-border/30 overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/20">
          <LazyImage
            src={imageUrl}
            alt={playlist.name}
            height={128}
            width={144}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Simple Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/20" />

          {/* Clean Icon Badge */}
          <div className="absolute top-3 right-3">
            <div className="w-7 h-7 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-border/20">
              <ListMusic className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Simple Bottom Label */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-xs text-muted-foreground font-medium">
                Playlist
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Information */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {playlist.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
      </div>
    </div>
  );
});
