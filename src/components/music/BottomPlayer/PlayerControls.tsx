'use client';

import { useCurrentIndex, useIsPlaying, usePlaybackStore, useQueue } from '@/stores/playbackStore';
import { memo, useEffect } from 'react';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { MusicControls, VolumeControl } from '../common';

const PlayerControls = memo(() => {
  const { togglePlayPause } = useAudioPlayerContext();
  const queue = useQueue();
  const currentIndex = useCurrentIndex();
  const isPlaying = useIsPlaying();
  const setIsPlayerInit = usePlaybackStore((state) => state.setIsPlaying);
  const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
  const isShuffle = usePlaybackStore((state) => state.shuffle);
  const repeat = usePlaybackStore((state) => state.repeat);

  function skipToNext() {
    if (!isPlaying) setIsPlayerInit(true);

    let index = currentIndex;

    if (isShuffle) {
      index = Math.floor(Math.random() * queue.length);
    } else {
      if (currentIndex < queue.length - 1) {
        index = currentIndex + 1;
      } else {
        if (repeat === 'all') {
          index = 0;
        }
      }
    }
    setCurrentIndex(index);
  }

  function skipToPrev() {
    if (!isPlaying) setIsPlayerInit(true);

    let index;

    if (isShuffle) {
      index = Math.floor(Math.random() * queue.length);
    } else {
      if (currentIndex > 0) {
        index = currentIndex - 1;
      } else {
        if (repeat === 'all') {
          index = queue.length - 1;
        } else {
          index = currentIndex;
        }
      }
    }

    setCurrentIndex(index);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === ' ' &&
        document.activeElement &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.key === 'ArrowRight') skipToNext();
      if (e.key === 'ArrowLeft') skipToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, skipToNext, skipToPrev]);

  return (
    <div className="flex items-center gap-2">
      <VolumeControl />
      <MusicControls />
    </div>
  );
});

PlayerControls.displayName = 'PlayerControls';
export default PlayerControls;
