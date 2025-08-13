import { useCallback } from "react";
import { toast } from "sonner";
import { Song } from "@/types/song";
import {
  useCurrentSong,
  useQueue,
  usePlaybackStore,
} from "@/stores/playbackStore";
import { useAudioManager, useIsPlaying } from "@/stores/audioStore";
import { useAddToHistory } from "@/queries/useMusic";

export const useSongCardActions = (song: Song) => {
  const currentSong = useCurrentSong();
  const queue = useQueue();
  const isPlaying = useIsPlaying();
  const audioManager = useAudioManager();
  const setCurrentSong = usePlaybackStore((state) => state.setCurrentSong);
  const addToQueueAction = usePlaybackStore((state) => state.addToQueue);
  const setQueue = usePlaybackStore((state) => state.setQueue);
  const addToHistory = useAddToHistory();

  const isCurrentSong = currentSong?.id === song.id;
  const isInQueue = queue.some((item: Song) => item.id === song.id);
  const name = song.name || song.title || "";

  const handlePlayClick = useCallback(async () => {
    try {
      if (isCurrentSong) {
        // Toggle play/pause for current song
        if (isPlaying) {
          audioManager?.pause();
        } else {
          audioManager?.play();
        }
        return;
      }

      if (song?.download_url) {
        // Set current song and add to queue if not already there
        setCurrentSong(song);
        if (!isInQueue) {
          addToQueueAction(song);
        }

        addToHistory.mutate({
          songData: song,
          playedTime: 10,
        });
      }
    } catch (error) {
      console.error("Error playing song:", error);
      toast.error("Failed to play song");
    }
  }, [
    isCurrentSong,
    isPlaying,
    audioManager,
    song,
    setCurrentSong,
    isInQueue,
    addToQueueAction,
    addToHistory,
  ]);

  const handleAddToQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isCurrentSong && !isInQueue) {
        addToQueueAction(song);
        toast.success(`Added ${name} to queue`);
      }
    },
    [song, name, isCurrentSong, isInQueue, addToQueueAction],
  );

  const handleRemoveFromQueue = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const updatedQueue = queue.filter((item: Song) => item.id !== song.id);
      setQueue(updatedQueue);
      toast.success(`Removed ${name} from queue`);
    },
    [song, name, queue, setQueue],
  );

  return {
    isCurrentSong,
    isInQueue,
    handlePlayClick,
    handleAddToQueue,
    handleRemoveFromQueue,
  };
};
