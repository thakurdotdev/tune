"use client";

import React from "react";
import { Settings, Music, Volume2, Shuffle, Timer } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useConfigStore } from "@/stores/configStore";
import type { AudioQuality } from "@/types/music";

const audioQualityOptions: {
  value: AudioQuality;
  label: string;
  description: string;
  bitrate: string;
}[] = [
  {
    value: "low",
    label: "Low",
    description: "Good for saving data",
    bitrate: "96 kbps",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced quality",
    bitrate: "160 kbps",
  },
  {
    value: "high",
    label: "High",
    description: "High quality audio",
    bitrate: "320 kbps",
  },
  {
    value: "highest",
    label: "Highest",
    description: "Best available quality",
    bitrate: "Lossless",
  },
];

export default function SettingsPage() {
  // Use individual selectors to prevent unnecessary re-renders
  const audioQuality = useConfigStore((state) => state.audioQuality);
  const preloadNext = useConfigStore((state) => state.preloadNext);
  const gaplessPlayback = useConfigStore((state) => state.gaplessPlayback);
  const crossfade = useConfigStore((state) => state.crossfade);

  // Actions
  const setAudioQuality = useConfigStore((state) => state.setAudioQuality);
  const setPreloadNext = useConfigStore((state) => state.setPreloadNext);
  const setGaplessPlayback = useConfigStore(
    (state) => state.setGaplessPlayback,
  );
  const setCrossfade = useConfigStore((state) => state.setCrossfade);
  const resetToDefaults = useConfigStore((state) => state.resetToDefaults);

  const handleCrossfadeChange = (value: number[]) => {
    setCrossfade(value[0]);
  };

  const formatCrossfadeTime = (ms: number) => {
    if (ms === 0) return "Disabled";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full py-5">
        {/* Header Section */}
        <div className="w-full max-w-none mb-12">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                Settings
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Customize your music playback experience with advanced audio
                settings and playback features
              </p>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="w-full grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {/* Audio Quality Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4 mb-2">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Volume2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold">
                    Audio Quality
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Choose your preferred streaming quality
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="audio-quality" className="text-sm font-medium">
                  Quality Level
                </Label>
                <Select
                  value={audioQuality}
                  onValueChange={(value: AudioQuality) =>
                    setAudioQuality(value)
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audioQualityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex flex-col items-start flex-1 min-w-0">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-sm text-muted-foreground truncate">
                              {option.description}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="ml-3 flex-shrink-0"
                          >
                            {option.bitrate}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-muted/50">
                <p className="text-sm text-muted-foreground">
                  Higher quality settings require more bandwidth and storage
                  space
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Playback Features Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4 mb-2">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold">
                    Playback Features
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Advanced playback enhancements
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="preload-next" className="text-sm font-medium">
                    Preload Next Track
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Loads the next song in advance for seamless playback
                    transitions
                  </p>
                </div>
                <Switch
                  id="preload-next"
                  checked={preloadNext}
                  onCheckedChange={setPreloadNext}
                  className="flex-shrink-0"
                />
              </div>

              <Separator className="my-6" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="gapless-playback"
                    className="text-sm font-medium"
                  >
                    Gapless Playback
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Removes silence between tracks for continuous listening
                    experience
                  </p>
                </div>
                <Switch
                  id="gapless-playback"
                  checked={gaplessPlayback}
                  onCheckedChange={setGaplessPlayback}
                  className="flex-shrink-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Crossfade Settings Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm lg:col-span-2 xl:col-span-1">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-4 mb-2">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Shuffle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold">
                    Crossfade
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Smooth audio transitions between tracks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="crossfade" className="text-sm font-medium">
                    Crossfade Duration
                  </Label>
                  <Badge
                    variant={crossfade > 0 ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {formatCrossfadeTime(crossfade)}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <Slider
                    id="crossfade"
                    min={0}
                    max={10000}
                    step={100}
                    value={[crossfade]}
                    onValueChange={handleCrossfadeChange}
                    disabled={!gaplessPlayback}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0ms</span>
                    <span>5s</span>
                    <span>10s</span>
                  </div>
                </div>

                {!gaplessPlayback && (
                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-muted/50">
                    <Timer className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Enable gapless playback to use crossfade feature
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings Row */}
        <div className="w-full grid gap-8 lg:grid-cols-2 mt-8">
          {/* Reset Section */}
          <Card className="hover:shadow-lg transition-all duration-200 bg-card/30 backdrop-blur-sm border-dashed border-2 border-muted/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                Reset Settings
              </CardTitle>
              <CardDescription className="text-base">
                Restore all settings to their default values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="w-full sm:w-auto h-11 px-6"
              >
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>

          {/* Current Configuration Summary */}
          <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                Current Configuration
              </CardTitle>
              <CardDescription className="text-base">
                Overview of your active settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground uppercase tracking-wider text-xs">
                    Quality
                  </p>
                  <p className="text-lg font-semibold capitalize text-foreground">
                    {audioQuality}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground uppercase tracking-wider text-xs">
                    Preload
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {preloadNext ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground uppercase tracking-wider text-xs">
                    Gapless
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {gaplessPlayback ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-muted-foreground uppercase tracking-wider text-xs">
                    Crossfade
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCrossfadeTime(crossfade)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
