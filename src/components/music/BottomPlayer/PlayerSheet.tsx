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

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCurrentIndex, useQueue } from "@/stores/playbackStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import NowPlayingTab from "./NowPlayingTab";
import QueueTab from "./QueueTab";

const PlayerSheet = memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState("current");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentIndex = useCurrentIndex();
    const queue = useQueue();
    const isMobile = useIsMobile();

    const currentSong = useMemo(() => {
      return queue[currentIndex] || null;
    }, [queue, currentIndex]);

    useEffect(() => {
      if (isOpen) {
        setActiveTab("current");
      }
    }, [isOpen]);

    const queueLength = useMemo(() => queue?.length || 0, [queue?.length]);
    const downloadUrl = useMemo(
      () => currentSong?.download_url?.[4]?.link,
      [currentSong?.download_url],
    );

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
          className={`h-full w-full max-md:px-3 md:p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-t border-white/10 ${
            !isMobile ? "max-w-none" : ""
          }`}
          forceMount
        >
          <div
            className={`h-full flex flex-col w-full ${
              !isMobile ? "max-w-5xl" : "max-w-[500px]"
            } mx-auto`}
          >
            {isMobile ? (
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="h-full flex flex-col w-full"
              >
                {/* Header */}
                <SheetHeader className="p-0">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="h-8 w-8 shrink-0 "
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
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="current">
                        <Music className="w-4 h-4" />
                        <span className="hidden sm:inline">Now Playing</span>
                        <span className="sm:hidden">Current</span>
                      </TabsTrigger>
                      <TabsTrigger value="queue">
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
                  <ScrollArea className="h-full w-full">
                    <TabsContent value="current" className="mt-0 h-full">
                      <NowPlayingTab />
                    </TabsContent>
                    <TabsContent value="queue" className="mt-0 h-full">
                      <QueueTab />
                    </TabsContent>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </div>
              </Tabs>
            ) : (
              <>
                {/* Desktop Header */}
                <SheetHeader className="p-0">
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="h-8 w-8 shrink-0"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">Now Playing</h2>
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
                </SheetHeader>

                {/* Desktop Side-by-Side Layout */}
                <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
                  {/* Now Playing Section */}
                  <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <Music className="w-5 h-5" />
                      <h3 className="text-base font-medium">Now Playing</h3>
                    </div>
                    <ScrollArea className="flex-1">
                      <NowPlayingTab />
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </div>

                  {/* Queue Section */}
                  <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2 mb-4 shrink-0">
                      <ListMusic className="w-5 h-5" />
                      <h3 className="text-base font-medium">Queue</h3>
                      <Badge
                        variant="secondary"
                        className="h-5 text-xs bg-primary/15 text-primary border border-primary/20"
                      >
                        {queueLength}
                      </Badge>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full w-full">
                        <QueueTab />
                        <ScrollBar orientation="vertical" />
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

PlayerSheet.displayName = "PlayerSheet";
export default PlayerSheet;
