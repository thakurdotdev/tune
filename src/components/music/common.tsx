import usePlayerControls from "@/hooks/usePlayerControls";
import {
  useAudioManager,
  useAudioStore,
  useCurrentTime,
  useDuration,
  useIsPlaying,
  useSetVolume,
  useVolume,
} from "@/stores/audioStore";
import { memo, useCallback, useState } from "react";
import { Slider } from "../ui/slider";
import { formatDuration } from "@/utils/formatDuration";
import { Button } from "../ui/button";
import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const MusicControls = memo(
  ({ size = "default" }: { size?: "default" | "large" }) => {
    const isPlaying = useIsPlaying();

    const audioManager = useAudioManager();
    const { playNext, playPrevious } = usePlayerControls();

    const handlePlayPause = () => {
      if (isPlaying) {
        audioManager?.pause();
      } else {
        audioManager?.play();
      }
    };
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={playPrevious}
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
          onClick={handlePlayPause}
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
          onClick={playNext}
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
    const setVolume = useSetVolume();
    const volume = useVolume();
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
    const currentTime = useCurrentTime();
    const duration = useDuration();
    const { seek } = usePlayerControls() || {};

    return (
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={([value]) => seek(value)}
          className="h-1 cursor-pointer rounded-l-none"
        />
        {isTimeVisible && (
          <div className="flex justify-between">
            <p className="text-muted-foreground text-sm">
              {formatDuration(currentTime)}
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
