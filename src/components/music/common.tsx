import { cn } from "@/lib/utils";
import {
  useCurrentIndex,
  useIsPlaying,
  usePlaybackStore,
  useQueue,
} from "@/stores/playbackStore";
import { formatDuration } from "@/utils/formatDuration";
import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useAudioPlayerContext } from "react-use-audio-player";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

export const MusicControls = memo(
  ({ size = "default" }: { size?: "default" | "large" }) => {
    const isPlayerInit = useIsPlaying();
    const { togglePlayPause, isPlaying } = useAudioPlayerContext();
    const queue = useQueue();
    const currentIndex = useCurrentIndex();
    const setIsPlayerInit = usePlaybackStore((state) => state.setIsPlaying);
    const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
    const isShuffle = usePlaybackStore((state) => state.shuffle);
    const repeat = usePlaybackStore((state) => state.repeat);

    function skipToNext() {
      if (!isPlayerInit) setIsPlayerInit(true);

      let index = currentIndex;

      if (isShuffle) {
        index = Math.floor(Math.random() * queue.length);
      } else {
        if (currentIndex < queue.length - 1) {
          index = currentIndex + 1;
        } else {
          if (repeat === "all") {
            index = 0;
          }
        }
      }
      setCurrentIndex(index);
    }

    function skipToPrev() {
      if (!isPlayerInit) setIsPlayerInit(true);

      let index;

      if (isShuffle) {
        index = Math.floor(Math.random() * queue.length);
      } else {
        if (currentIndex > 0) {
          index = currentIndex - 1;
        } else {
          if (repeat === "all") {
            index = queue.length - 1;
          } else {
            index = currentIndex;
          }
        }
      }

      setCurrentIndex(index);
    }

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={skipToPrev}
          className={cn(
            "transition-all hover:scale-105",
            size === "large" ? "h-12 w-12" : "h-9 w-9",
          )}
        >
          <SkipBackIcon className={size === "large" ? "h-6 w-6" : "h-4 w-4"} />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={togglePlayPause}
          className={cn(
            "transition-all hover:scale-105",
            size === "large" ? "h-14 w-14" : "h-10 w-10",
          )}
        >
          {isPlaying ? (
            <PauseIcon className={size === "large" ? "h-6 w-6" : "h-4 w-4"} />
          ) : (
            <PlayIcon className={size === "large" ? "h-6 w-6" : "h-4 w-4"} />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={skipToNext}
          className={cn(
            "transition-all hover:scale-105",
            size === "large" ? "h-12 w-12" : "h-9 w-9",
          )}
        >
          <SkipForwardIcon
            className={size === "large" ? "h-6 w-6" : "h-4 w-4"}
          />
        </Button>
      </div>
    );
  },
);

export const VolumeControl = memo(
  ({ showVolume = false }: { showVolume?: boolean }) => {
    const { volume, setVolume } = useAudioPlayerContext();

    const [isMuted, setIsMuted] = useState(false);
    const toggleMute = useCallback(() => {
      setIsMuted((prev) => {
        const newMuted = !prev;
        setVolume(newMuted ? 0 : 1);
        return newMuted;
      });
    }, [setVolume]);
    if (!showVolume) return null;
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:scale-105"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeXIcon size={16} /> : <Volume2Icon size={16} />}
        </Button>
        <Slider
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          className="w-16"
          onValueChange={([value]) => setVolume(value)}
        />
      </div>
    );
  },
);

export const ProgressBarMusic = memo(
  ({ isTimeVisible = false }: { isTimeVisible?: boolean }) => {
    const frameRef = useRef<number>(0);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const { duration, getPosition, seek } = useAudioPlayerContext();
    const [pos, setPos] = useState(0);

    useEffect(() => {
      if (isDragging) {
        return;
      }

      const animate = () => {
        setPos(getPosition());
        frameRef.current = requestAnimationFrame(animate);
      };

      frameRef.current = window.requestAnimationFrame(animate);

      return () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }, [getPosition, isDragging]);

    return (
      <div className="space-y-2">
        <Slider
          onPointerDown={() => {
            setIsDragging(true);
          }}
          onValueCommit={() => {
            seek(pos);
            setPos(getPosition());
            setIsDragging(false);
          }}
          value={[pos]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={([value]) => setPos(value)}
          className="h-1 cursor-pointer rounded-l-none"
        />
        {isTimeVisible && (
          <div className="flex justify-between">
            <p className="text-muted-foreground text-sm">
              {formatDuration(pos)}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatDuration(duration)}
            </p>
          </div>
        )}
      </div>
    );
  },
);
