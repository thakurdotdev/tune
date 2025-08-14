// utils/audioManager.ts
import { Howl, Howler } from "howler";
import type { AudioQuality } from "../types/music";
import type { Song } from "../types/song";

export class AudioManager {
  private currentHowl: Howl | null = null;
  private nextHowl: Howl | null = null;
  private fadeTimeout: NodeJS.Timeout | null = null;

  constructor(
    private onTimeUpdate: (time: number) => void,
    private onDurationChange: (duration: number) => void,
    private onPlay: () => void,
    private onPause: () => void,
    private onEnd: () => void,
    private onLoad: () => void,
    private onLoadError: (error: any) => void,
    private onBuffering: (buffering: boolean) => void,
  ) {
    // Set global volume curve for better quality
    Howler.volume(1.0);

    // Use Web Audio API when available for better performance
    Howler.usingWebAudio = true;

    // Set up global error handling
    Howler.autoUnlock = true;
  }

  private getAudioUrl(song: Song, quality: AudioQuality = "highest"): string {
    if (!song.download_url || song.download_url.length === 0) {
      throw new Error("No audio URL available");
    }

    // Map quality preferences to download_url array indices
    const qualityMap: Record<AudioQuality, number[]> = {
      highest: [4, 3, 2, 1, 0],
      high: [3, 4, 2, 1, 0],
      medium: [2, 3, 1, 4, 0],
      low: [1, 0, 2, 3, 4],
    };

    const indices = qualityMap[quality];

    for (const index of indices) {
      if (song.download_url[index]?.link) {
        return this.ensureHttps(song.download_url[index].link);
      }
    }

    // Fallback to first available URL
    return this.ensureHttps(song.download_url[0].link);
  }

  private ensureHttps(url: string): string {
    return url.replace(/^http:/, "https:");
  }

  private createHowl(song: Song, quality: AudioQuality): Howl {
    const url = this.getAudioUrl(song, quality);

    return new Howl({
      src: [url],
      html5: false, // Use Web Audio API for better performance
      preload: true,
      volume: Howler.volume(),
      format: ["mp3", "mp4", "aac", "m4a"], // Support multiple formats
      onplay: () => {
        this.startTimeUpdates();
        this.onPlay();
      },
      onpause: () => {
        this.stopTimeUpdates();
        this.onPause();
      },
      onend: () => {
        this.stopTimeUpdates();
        this.onEnd();
      },
      onload: () => {
        if (this.currentHowl) {
          this.onDurationChange(this.currentHowl.duration());
        }
        this.onLoad();
        this.onBuffering(false);
      },
      onloaderror: (id, error) => {
        console.error("Audio load error:", error);
        this.onLoadError(error);
        this.onBuffering(false);
      },
      onplayerror: (id, error) => {
        console.error("Audio play error:", error);
        this.onLoadError(error);
      },
    });
  }

  private timeUpdateInterval: NodeJS.Timeout | null = null;

  private startTimeUpdates() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }

    this.timeUpdateInterval = setInterval(() => {
      if (this.currentHowl && this.currentHowl.playing()) {
        this.onTimeUpdate(this.currentHowl.seek() as number);
      }
    }, 250); // More frequent updates (every 250ms) for smoother UI
  }

  private stopTimeUpdates() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  async loadSong(song: Song, quality: AudioQuality = "highest"): Promise<void> {
    this.onBuffering(true);

    // Stop current song and reset time
    this.stop();
    // Ensure time is reset to 0 when loading new song
    this.onTimeUpdate(0);

    try {
      this.currentHowl = this.createHowl(song, quality);

      // Wait for the song to load
      return new Promise((resolve, reject) => {
        if (!this.currentHowl) {
          reject(new Error("Failed to create Howl instance"));
          return;
        }

        const onLoad = () => {
          this.currentHowl?.off("load", onLoad);
          this.currentHowl?.off("loaderror", onError);
          resolve();
        };

        const onError = (error: any) => {
          this.currentHowl?.off("load", onLoad);
          this.currentHowl?.off("loaderror", onError);
          reject(error);
        };

        this.currentHowl.on("load", onLoad);
        this.currentHowl.on("loaderror", onError);
      });
    } catch (error) {
      this.onBuffering(false);
      throw error;
    }
  }

  preloadNext(song: Song, quality: AudioQuality = "highest"): void {
    try {
      // Clean up previous preloaded song
      if (this.nextHowl) {
        this.nextHowl.unload();
      }

      this.nextHowl = this.createHowl(song, quality);
    } catch (error) {
      console.warn("Failed to preload next song:", error);
    }
  }

  play(): void {
    if (!this.currentHowl) {
      throw new Error("No song loaded");
    }

    this.currentHowl.play();
    // Ensure position is updated when starting playback
    this.onTimeUpdate(this.currentHowl.seek() as number);
  }

  pause(): void {
    if (this.currentHowl) {
      this.currentHowl.pause();
      // Ensure current position is reported when pausing for proper mobile notification display
      this.onTimeUpdate(this.currentHowl.seek() as number);
    }
  }

  stop(): void {
    this.stopTimeUpdates();

    if (this.currentHowl) {
      this.currentHowl.stop();
      this.currentHowl.unload();
      this.currentHowl = null;
    }

    // Reset time to 0 when stopped
    this.onTimeUpdate(0);
  }

  seek(position: number): void {
    if (this.currentHowl) {
      this.currentHowl.seek(position);
      // Immediately update time to ensure responsive UI
      this.onTimeUpdate(position);
    }
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(clampedVolume);

    if (this.currentHowl) {
      this.currentHowl.volume(clampedVolume);
    }
  }

  getVolume(): number {
    return Howler.volume();
  }

  getCurrentTime(): number {
    return this.currentHowl ? (this.currentHowl.seek() as number) : 0;
  }

  getDuration(): number {
    return this.currentHowl ? this.currentHowl.duration() : 0;
  }

  isPlaying(): boolean {
    return this.currentHowl ? this.currentHowl.playing() : false;
  }

  // Force position state update for mobile notifications
  updatePositionState(): void {
    if (this.currentHowl) {
      this.onTimeUpdate(this.currentHowl.seek() as number);
    }
  }

  // Crossfade between current and next song
  crossfadeToNext(duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.nextHowl || !this.currentHowl) {
        resolve();
        return;
      }

      const currentVolume = this.currentHowl.volume() as number;
      const fadeSteps = 20;
      const fadeInterval = duration / fadeSteps;
      let currentStep = 0;

      // Start playing the next song at 0 volume
      this.nextHowl.volume(0);
      this.nextHowl.play();

      const fadeInterval_id = setInterval(() => {
        currentStep++;
        const progress = currentStep / fadeSteps;

        if (this.currentHowl) {
          this.currentHowl.volume(currentVolume * (1 - progress));
        }

        if (this.nextHowl) {
          this.nextHowl.volume(currentVolume * progress);
        }

        if (currentStep >= fadeSteps) {
          clearInterval(fadeInterval_id);

          // Stop the old song and swap references
          if (this.currentHowl) {
            this.currentHowl.stop();
            this.currentHowl.unload();
          }

          this.currentHowl = this.nextHowl;
          this.nextHowl = null;

          resolve();
        }
      }, fadeInterval);
    });
  }

  destroy(): void {
    this.stop();

    if (this.nextHowl) {
      this.nextHowl.unload();
      this.nextHowl = null;
    }

    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
  }
}
