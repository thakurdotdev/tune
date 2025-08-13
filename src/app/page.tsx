"use client";

import BottomPlayer from "@/components/music/BottomPlayer";
import HomePage from "@/components/music/HomePage";
import { PlayerProvider } from "@/components/PlayerProvider";
import { useProfile } from "@/queries/useUser";
import { useUserStore } from "@/stores/userStore";

export default function Home() {
  const user = useUserStore((state) => state.user);
  const { isLoading } = useProfile();

  return (
    <PlayerProvider user={user} loading={isLoading}>
      <HomePage />
      <BottomPlayer />
    </PlayerProvider>
  );
}
