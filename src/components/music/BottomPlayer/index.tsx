import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { memo, useState } from 'react';
import { useCurrentIndex, useQueue } from '@/stores/playbackStore';
import { ProgressBarMusic } from '../common';
import PlayerControls from './PlayerControls';
import PlayerSheet from './PlayerSheet';
import SongInfo from './SongInfo';

const BottomPlayer = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const currentIndex = useCurrentIndex();
  const queue = useQueue();

  const currentSong = queue[currentIndex] || null;

  if (!currentSong) return null;

  return (
    <>
      <Card
        className={cn(
          'fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-md border-t z-50 transition-all duration-500 translate-y-0 opacity-100 p-0'
        )}
      >
        <CardContent className="p-3">
          {/* Progress Bar */}
          <div className="absolute -top-1 left-0 w-full">
            <ProgressBarMusic />
          </div>

          <div className="flex items-center justify-between">
            <SongInfo currentSong={currentSong} onOpenSheet={() => setIsSheetOpen(true)} />

            <PlayerControls />
          </div>
        </CardContent>
      </Card>

      <PlayerSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </>
  );
};

export default memo(BottomPlayer);
