/**
 * TranceVoice — Narration engine with ElevenLabs MP3 playback and
 * Web Speech API fallback.
 *
 * New API: callers pass an MP3 file path directly. If the file plays,
 * great. If it fails (404, network error, etc.), falls back to Web
 * Speech synthesis with the provided text.
 */

interface VoiceTuning {
  rate: number;
  pitch: number;
  volume: number;
}

const VOICE_PRIORITY: [string, Partial<VoiceTuning>][] = [
  ["Samantha (Enhanced)", { rate: 0.74, pitch: 0.9, volume: 0.75 }],
  ["Samantha (Premium)", { rate: 0.74, pitch: 0.9, volume: 0.75 }],
  ["Karen (Enhanced)", { rate: 0.72, pitch: 0.88, volume: 0.75 }],
  ["Karen (Premium)", { rate: 0.72, pitch: 0.88, volume: 0.75 }],
  ["Moira (Enhanced)", { rate: 0.70, pitch: 0.85, volume: 0.75 }],
  ["Moira (Premium)", { rate: 0.70, pitch: 0.85, volume: 0.75 }],
  ["Tessa (Enhanced)", { rate: 0.72, pitch: 0.88, volume: 0.75 }],
  ["Tessa (Premium)", { rate: 0.72, pitch: 0.88, volume: 0.75 }],
  ["Daniel (Enhanced)", { rate: 0.68, pitch: 0.8, volume: 0.7 }],
  ["Daniel (Premium)", { rate: 0.68, pitch: 0.8, volume: 0.7 }],
  ["Samantha", { rate: 0.74, pitch: 0.9, volume: 0.75 }],
  ["Karen", { rate: 0.72, pitch: 0.88, volume: 0.75 }],
  ["Moira", { rate: 0.70, pitch: 0.85, volume: 0.75 }],
  ["Microsoft Jenny Online", { rate: 0.76, pitch: 0.95, volume: 0.75 }],
  ["Microsoft Aria Online", { rate: 0.74, pitch: 0.92, volume: 0.75 }],
  ["Microsoft Sonia Online", { rate: 0.72, pitch: 0.9, volume: 0.75 }],
  ["Microsoft Libby Online", { rate: 0.72, pitch: 0.9, volume: 0.75 }],
  ["Microsoft Guy Online", { rate: 0.70, pitch: 0.82, volume: 0.7 }],
  ["Microsoft Jenny", { rate: 0.76, pitch: 0.95, volume: 0.75 }],
  ["Microsoft Zira", { rate: 0.72, pitch: 0.88, volume: 0.7 }],
  ["Microsoft David", { rate: 0.70, pitch: 0.82, volume: 0.7 }],
  ["Google UK English Female", { rate: 0.72, pitch: 0.88, volume: 0.7 }],
  ["Google US English", { rate: 0.74, pitch: 0.9, volume: 0.7 }],
  ["Google UK English Male", { rate: 0.68, pitch: 0.82, volume: 0.7 }],
  ["English+Annie", { rate: 0.74, pitch: 0.9, volume: 0.7 }],
];

const DEFAULT_TUNING: VoiceTuning = { rate: 0.72, pitch: 0.85, volume: 0.7 };

export interface SpeakOptions {
  file?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class TranceVoice {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private tuning: VoiceTuning = { ...DEFAULT_TUNING };
  private ready = false;
  private enabled = true;
  private supported = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private pendingResolve: (() => void) | null = null;
  private pendingDone: (() => void) | null = null;

  init(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    this.supported = true;
    this.synth = window.speechSynthesis;

    const pickVoice = () => {
      const voices = this.synth!.getVoices();
      if (voices.length === 0) return;

      for (const [nameFragment, tuningOverride] of VOICE_PRIORITY) {
        const found = voices.find(
          (v) => v.name.includes(nameFragment) && v.lang.startsWith("en")
        );
        if (found) {
          this.voice = found;
          this.tuning = { ...DEFAULT_TUNING, ...tuningOverride };
          this.ready = true;
          return;
        }
      }

      const neural = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          /enhanced|premium|neural|online/i.test(v.name)
      );
      if (neural) {
        this.voice = neural;
        this.tuning = { ...DEFAULT_TUNING };
        this.ready = true;
        return;
      }

      const enVoice = voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) {
        this.voice = enVoice;
        this.tuning = { ...DEFAULT_TUNING };
        this.ready = true;
      }
    };

    pickVoice();
    if (!this.ready) {
      this.synth.addEventListener("voiceschanged", pickVoice, { once: true });
    }
  }

  /**
   * Load an MP3 file fully into memory, then create an Audio element from
   * the blob. This prevents mid-playback cutoffs from streaming/buffering.
   */
  private async loadAudio(file: string): Promise<HTMLAudioElement | null> {
    try {
      const resp = await fetch(file);
      if (!resp.ok) return null;
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      // Clean up blob URL when the element is done (played or errored)
      const revoke = () => URL.revokeObjectURL(url);
      audio.addEventListener("ended", revoke, { once: true });
      audio.addEventListener("error", revoke, { once: true });
      return audio;
    } catch {
      return null;
    }
  }

  /**
   * Fire-and-forget playback. If options.file is provided, tries that MP3
   * first; on failure falls back to Web Speech with the text.
   */
  speak(text: string, options?: SpeakOptions): void {
    if (!this.enabled) return;
    this.stopCurrent();

    if (options?.file) {
      this.loadAudio(options.file).then((audio) => {
        if (!audio) { this.speakWithSynth(text, options); return; }
        audio.volume = options?.volume ?? this.tuning.volume;
        audio.play().catch(() => { this.speakWithSynth(text, options); });
        this.currentAudio = audio;
      });
      return;
    }

    this.speakWithSynth(text, options);
  }

  /**
   * Returns a Promise that resolves when the audio finishes.
   * If options.file is provided, downloads the full MP3 first, then plays.
   * If cancel() is called, the promise resolves early.
   */
  speakAsync(text: string, options?: SpeakOptions): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.enabled) { resolve(); return; }

      this._resolvePending();
      this.stopCurrent();
      this.pendingResolve = resolve;

      const done = () => {
        if (this.pendingResolve === resolve) this.pendingResolve = null;
        if (this.pendingDone === done) this.pendingDone = null;
        resolve();
      };
      this.pendingDone = done;

      if (options?.file) {
        this.loadAudio(options.file).then((audio) => {
          // If cancelled while loading, don't start playback
          if (this.pendingResolve !== resolve) return;
          if (!audio) {
            this.speakWithSynthAsync(text, options, done);
            return;
          }
          audio.volume = options?.volume ?? this.tuning.volume;
          audio.addEventListener("ended", done, { once: true });
          audio.addEventListener("error", done, { once: true });
          audio.play().catch(() => {
            audio.removeEventListener("ended", done);
            audio.removeEventListener("error", done);
            this.speakWithSynthAsync(text, options, done);
          });
          this.currentAudio = audio;
        });
        return;
      }

      this.speakWithSynthAsync(text, options, done);
    });
  }

  private _resolvePending(): void {
    if (this.pendingResolve) {
      const r = this.pendingResolve;
      this.pendingResolve = null;
      r();
    }
  }

  private speakWithSynth(text: string, options?: SpeakOptions): void {
    if (!this.synth || !this.ready) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = options?.rate ?? this.tuning.rate;
    utterance.pitch = options?.pitch ?? this.tuning.pitch;
    utterance.volume = options?.volume ?? this.tuning.volume;
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  private speakWithSynthAsync(
    text: string,
    options: SpeakOptions | undefined,
    onDone: () => void
  ): void {
    if (!this.synth || !this.ready) { onDone(); return; }
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = options?.rate ?? this.tuning.rate;
    utterance.pitch = options?.pitch ?? this.tuning.pitch;
    utterance.volume = options?.volume ?? this.tuning.volume;
    utterance.onend = onDone;
    utterance.onerror = onDone;
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  private stopCurrent(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      // Remove listeners so this discarded element can't call done()
      if (this.pendingDone) {
        this.currentAudio.removeEventListener("ended", this.pendingDone);
        this.currentAudio.removeEventListener("error", this.pendingDone);
        this.pendingDone = null;
      }
      this.currentAudio.src = "";  // release network resources
      this.currentAudio = null;
    }
    this.synth?.cancel();
    this.currentUtterance = null;
  }

  speakAlert(text: string, step: number, file?: string): void {
    this.speak(text, {
      file,
      rate: this.tuning.rate + step * 0.06,
      pitch: this.tuning.pitch + step * 0.04,
    });
  }

  cancel(): void {
    this._resolvePending();
    this.stopCurrent();
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.cancel();
  }

  isEnabled(): boolean { return this.enabled; }
  isReady(): boolean { return this.ready; }
  isSupported(): boolean { return this.supported; }
  getVoiceName(): string { return this.voice?.name ?? "none"; }

  stop(): void {
    this._resolvePending();
    this.cancel();
    this.synth = null;
    this.ready = false;
  }
}
