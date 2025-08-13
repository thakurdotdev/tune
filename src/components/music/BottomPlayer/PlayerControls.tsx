"use client";

import usePlayerControls from "@/hooks/usePlayerControls";
import { memo, useEffect } from "react";
import { MusicControls, VolumeControl } from "../common";

const PlayerControls = memo(() => {
  const { playNext, playPrevious, togglePlayPause } = usePlayerControls();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === " " &&
        document.activeElement &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.key === "ArrowRight") playNext();
      if (e.key === "ArrowLeft") playPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, playNext, playPrevious]);

  return (
    <div className="flex items-center gap-2">
      <VolumeControl />
      <MusicControls />
    </div>
  );
});

PlayerControls.displayName = "PlayerControls";
export default PlayerControls;
