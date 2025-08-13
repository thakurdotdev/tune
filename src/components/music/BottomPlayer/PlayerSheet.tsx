import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  Download,
  ListMusic,
  MoreHorizontal,
  Music,
  Share2,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { useCurrentSong, usePlaybackStore } from "@/stores/playbackStore";
import { toast } from "sonner";
import NowPlayingTab from "./NowPlayingTab";
import QueueTab from "./QueueTab";

const PlayerSheet = memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState("current");
    const playlist = usePlaybackStore((state) => state.queue);
    const currentSong = useCurrentSong();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reset to current tab when opening to avoid tab switch animations
    useEffect(() => {
      if (isOpen) {
        setActiveTab("current");
      }
    }, [isOpen]);

    // Memoize computed values
    const queueLength = useMemo(
      () => playlist?.length || 0,
      [playlist?.length],
    );
    const downloadUrl = useMemo(
      () => currentSong?.download_url?.[4]?.link,
      [currentSong?.download_url],
    );

    // Memoize handlers to prevent recreations
    const handleShare = useCallback(() => {
      if (!currentSong) return;

      if (navigator.share) {
        navigator.share({
          title: currentSong.name,
          text: `Listen to ${currentSong.name}`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    }, [currentSong]);

    const handleDownload = useCallback(async () => {
      if (!downloadUrl || !currentSong) {
        toast.error("Download link not available");
        return;
      }

      try {
        toast.loading("Preparing download...");

        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentSong.name}.mp3`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success("Download completed");
      } catch (error) {
        console.error("Download failed:", error);
        toast.dismiss();
        toast.error("Direct download failed. Opening in new tab...");
        window.open(downloadUrl, "_blank");
      }
    }, [downloadUrl, currentSong]);

    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const handleTabChange = useCallback((value: string) => {
      setActiveTab(value);
    }, []);

    const handleModalOpen = useCallback(() => {
      setIsModalOpen(true);
    }, []);

    if (!currentSong) {
      return null;
    }

    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent
          side="bottom"
          className="h-full w-full p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-t border-white/10"
          forceMount
        >
          {/* Simplified background - remove complex gradients for better performance */}
          <div className="h-full flex flex-col w-full max-w-[500px] mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="h-full flex flex-col w-full"
            >
              {/* Header */}
              <SheetHeader className="p-4 pb-0 border-b border-white/10 bg-background/50">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8 shrink-0 hover:bg-white/10 transition-colors duration-150"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 hover:bg-white/10 transition-colors duration-150"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-background/95 backdrop-blur-xl border-white/10"
                    >
                      <DropdownMenuItem
                        onClick={handleModalOpen}
                        className="cursor-pointer"
                      >
                        <ListMusic className="mr-2 h-4 w-4" />
                        Add to Playlist
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleShare}
                        className="cursor-pointer"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Song
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDownload}
                        className="cursor-pointer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-center pb-4">
                  <TabsList className="grid grid-cols-2 w-full bg-white/[0.08] backdrop-blur-sm border border-white/10">
                    <TabsTrigger
                      value="current"
                      className="flex items-center justify-center space-x-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground transition-all duration-150"
                    >
                      <Music className="w-4 h-4" />
                      <span className="hidden sm:inline">Now Playing</span>
                      <span className="sm:hidden">Current</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="queue"
                      className="flex items-center justify-center space-x-2 data-[state=active]:bg-primary/20 data-[state=active]:text-foreground transition-all duration-150"
                    >
                      <ListMusic className="w-4 h-4" />
                      <span>Queue</span>
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 text-xs bg-primary/15 text-primary border border-primary/20"
                      >
                        {queueLength}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </SheetHeader>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <TabsContent
                  value="current"
                  className="mt-0 h-full overflow-y-auto p-0"
                >
                  <NowPlayingTab />
                </TabsContent>

                <TabsContent
                  value="queue"
                  className="mt-0 h-full overflow-y-auto p-0"
                >
                  <QueueTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

PlayerSheet.displayName = "PlayerSheet";
export default PlayerSheet;
