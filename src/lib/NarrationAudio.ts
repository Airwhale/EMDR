/**
 * NarrationAudio — Plays pre-generated MP3 narration files.
 * Falls back to Web Speech API if audio files are not available.
 */

import { TranceVoice } from "./TranceVoice";

export class NarrationAudio {
  private cache = new Map<string, HTMLAudioElement>();
  private currentAudio: HTMLAudioElement | null = null;
  private fallbackVoice: TranceVoice;
  private enabled = true;
  private volume = 0.85;
  private useFiles = true;

  constructor() {
    this.fallbackVoice = new TranceVoice();
  }

  init(): void {
    this.fallbackVoice.init();
    // Test if audio files exist by trying to load one
    this.probeForFiles();
  }

  private async probeForFiles(): Promise<void> {
    try {
      const resp = await fetch("/audio/breath/breath-in.mp3", { method: "HEAD" });
      this.useFiles = resp.ok;
    } catch {
      this.useFiles = false;
    }
  }

  /** Play a named audio file (e.g., "trance/trance-fixation-01").
   *  If the file doesn't exist, falls back to speaking the text. */
  play(filePath: string, fallbackText?: string): void {
    if (!this.enabled) return;

    // Stop any currently playing narration
    this.stop();

    if (this.useFiles) {
      const url = `/audio/${filePath}.mp3`;

      let audio = this.cache.get(url);
      if (!audio) {
        audio = new Audio(url);
        this.cache.set(url, audio);
      }

      audio.volume = this.volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // File not found — fall back to TTS
        if (fallbackText) {
          this.fallbackVoice.speak(fallbackText);
        }
      });
      this.currentAudio = audio;
    } else if (fallbackText) {
      this.fallbackVoice.speak(fallbackText);
    }
  }

  /** Play a breath cue audio file */
  playBreathCue(phase: "inhale" | "hold" | "exhale"): void {
    if (!this.enabled) return;
    const file = phase === "inhale" ? "breath-in" : phase === "exhale" ? "breath-out" : "breath-hold";
    const url = `/audio/breath/${file}.mp3`;

    if (this.useFiles) {
      let audio = this.cache.get(url);
      if (!audio) {
        audio = new Audio(url);
        this.cache.set(url, audio);
      }
      audio.volume = 0.3; // Breath cues at 30% volume
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore — breath cues are optional
      });
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.fallbackVoice.cancel();
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    this.fallbackVoice.setEnabled(on);
    if (!on) this.stop();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /** Preload a set of audio files for a mode */
  preload(filePaths: string[]): void {
    if (!this.useFiles) return;
    for (const path of filePaths) {
      const url = `/audio/${path}.mp3`;
      if (!this.cache.has(url)) {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        this.cache.set(url, audio);
      }
    }
  }

  cleanup(): void {
    this.stop();
    this.cache.clear();
    this.fallbackVoice.stop();
  }

  /** Check if pre-generated audio files are being used */
  isUsingFiles(): boolean {
    return this.useFiles;
  }
}

// Preload manifests per mode
export const TRANCE_AUDIO_FILES = [
  "trance/trance-entry-01",
  ...Array.from({ length: 11 }, (_, i) => `trance/trance-fixation-${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 12 }, (_, i) => `trance/trance-deepening-${String(i + 1).padStart(2, "0")}`),
  "trance/trance-staircase-01", "trance/trance-staircase-02",
  "trance/trance-staircase-03", "trance/trance-staircase-04",
  ...["10", "09", "08", "07", "06", "05"].map(n => `trance/trance-staircase-${n}`),
  ...["04", "03", "02", "01"].map(n => `trance/trance-staircase-count-${n}`),
  "trance/trance-experiments-intro",
  "trance/trance-emergence-intro",
  ...Array.from({ length: 5 }, (_, i) => `trance/trance-emergence-${String(i + 1).padStart(2, "0")}`),
];

export const EMDR_AUDIO_FILES = [
  "emdr/emdr-centering-01", "emdr/emdr-centering-02",
  "emdr/emdr-safeplace-01", "emdr/emdr-safeplace-02",
  "emdr/emdr-safeplace-03", "emdr/emdr-safeplace-04", "emdr/emdr-safeplace-bls",
  ...Array.from({ length: 6 }, (_, i) => `emdr/emdr-butterfly-${String(i + 1).padStart(2, "0")}`),
  "emdr/emdr-container-01", "emdr/emdr-container-02",
  "emdr/emdr-container-03", "emdr/emdr-container-bls",
  "emdr/emdr-resource-01", "emdr/emdr-resource-02",
  "emdr/emdr-resource-03", "emdr/emdr-resource-bls",
  "emdr/emdr-bodyscan-01", "emdr/emdr-bodyscan-02",
  "emdr/emdr-closing-01",
];

export const ART_AUDIO_FILES = [
  "art/art-centering-01", "art/art-centering-02",
  "art/art-scene-01", "art/art-scene-02",
  "art/art-processing-01", "art/art-processing-02",
  "art/art-processing-return-01", "art/art-processing-return-02",
  "art/art-sensation-01", "art/art-sensation-bls",
  "art/art-vir-01", "art/art-vir-02", "art/art-vir-bls",
  "art/art-bodyscan-01", "art/art-bodyscan-02",
  "art/art-closing-01",
];

export const MEDITATION_AUDIO_FILES = [
  ...TRANCE_AUDIO_FILES.filter(f => f.startsWith("trance/trance-fixation") ||
    f.startsWith("trance/trance-deepening") || f.startsWith("trance/trance-staircase")),
  ...Array.from({ length: 10 }, (_, i) => `meditation/meditation-sustain-${String(i + 1).padStart(2, "0")}`),
  "meditation/meditation-emergence-intro",
  ...Array.from({ length: 5 }, (_, i) => `meditation/meditation-emergence-${String(i + 1).padStart(2, "0")}`),
];

export const BREATH_AUDIO_FILES = [
  "breath/breath-in", "breath/breath-hold", "breath/breath-out",
];

export const GROUNDING_AUDIO_FILES = [
  "grounding/grounding-intro",
  "grounding/grounding-01-see", "grounding/grounding-02-touch",
  "grounding/grounding-03-hear", "grounding/grounding-04-smell",
  "grounding/grounding-05-taste", "grounding/grounding-closing",
];

export const EXPERIMENT_AUDIO_FILES = [
  ...Array.from({ length: 4 }, (_, i) => `experiments/experiment-arm-${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 4 }, (_, i) => `experiments/experiment-sensory-${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 3 }, (_, i) => `experiments/experiment-pendulum-${String(i + 1).padStart(2, "0")}`),
  "experiments/experiment-time-intro", "experiments/experiment-time-result",
];
