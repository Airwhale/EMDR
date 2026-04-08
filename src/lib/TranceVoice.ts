/**
 * TranceVoice — Narration engine with ElevenLabs MP3 playback and
 * Web Speech API fallback.
 *
 * Callers pass an MP3 file path directly. If the file plays, great.
 * If it fails (404, network error, etc.), falls back to Web Speech
 * synthesis with the provided text.
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

const DEBUG = false;
const log = (...args: unknown[]) => { if (DEBUG) console.log("[TranceVoice]", ...args); };
const warn = (...args: unknown[]) => { if (DEBUG) console.warn("[TranceVoice]", ...args); };

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
  private speakId = 0; // monotonic counter for debugging

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
   * Fire-and-forget playback.
   */
  speak(text: string, options?: SpeakOptions): void {
    if (!this.enabled) return;
    this.stopCurrent();

    if (options?.file) {
      const audio = new Audio(options.file);
      audio.volume = options?.volume ?? this.tuning.volume;
      audio.play().catch(() => { this.speakWithSynth(text, options); });
      this.currentAudio = audio;
      return;
    }

    this.speakWithSynth(text, options);
  }

  /**
   * Returns a Promise that resolves when the audio finishes.
   * Uses preload="auto" to fully buffer the file before playing.
   * If cancel() is called, the promise resolves early.
   */
  speakAsync(text: string, options?: SpeakOptions): Promise<void> {
    const id = ++this.speakId;

    return new Promise<void>((resolve) => {
      if (!this.enabled) {
        log(`#${id} SKIP (disabled)`);
        resolve();
        return;
      }

      log(`#${id} speakAsync "${text.substring(0, 50)}..." file=${options?.file ?? "none"}`);

      this._resolvePending();
      this.stopCurrent();
      this.pendingResolve = resolve;

      const done = (reason: string) => {
        log(`#${id} done (${reason})`);
        if (this.pendingResolve === resolve) this.pendingResolve = null;
        if (this.pendingDone === wrappedDone) this.pendingDone = null;
        resolve();
      };
      const wrappedDone = () => done("ended/error");
      this.pendingDone = wrappedDone;

      if (options?.file) {
        const audio = new Audio();
        audio.preload = "auto";
        audio.volume = options?.volume ?? this.tuning.volume;

        audio.addEventListener("ended", () => {
          log(`#${id} ENDED at ${audio.currentTime.toFixed(1)}/${audio.duration.toFixed(1)}s`);
          done("ended");
        }, { once: true });

        audio.addEventListener("error", () => {
          const code = audio.error?.code;
          const msg = audio.error?.message;
          warn(`#${id} ERROR code=${code} msg=${msg}`);
          done("error");
        }, { once: true });

        // Wait for enough data to play through, then start
        audio.addEventListener("canplaythrough", () => {
          // Check if cancelled while loading
          if (this.pendingResolve !== resolve) {
            warn(`#${id} CANCELLED during load`);
            return;
          }
          log(`#${id} canplaythrough, duration=${audio.duration.toFixed(1)}s, playing...`);
          audio.play().then(() => {
            log(`#${id} play() OK`);
          }).catch((err) => {
            warn(`#${id} play() FAILED:`, err);
            this.speakWithSynthAsync(text, options, () => done("synth-fallback"));
          });
        }, { once: true });

        audio.src = options.file;
        this.currentAudio = audio;
        return;
      }

      this.speakWithSynthAsync(text, options, () => done("synth"));
    });
  }

  private _resolvePending(): void {
    if (this.pendingResolve) {
      log("_resolvePending: resolving previous promise");
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

    log(`synth fallback: "${text.substring(0, 40)}..."`);
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
      log("stopCurrent: pausing audio at", this.currentAudio.currentTime?.toFixed(1) + "s");
      this.currentAudio.pause();
      if (this.pendingDone) {
        this.currentAudio.removeEventListener("ended", this.pendingDone);
        this.currentAudio.removeEventListener("error", this.pendingDone);
        this.pendingDone = null;
      }
      this.currentAudio.src = "";
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
    log("cancel() called");
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
    log("stop() called");
    this._resolvePending();
    this.cancel();
    this.synth = null;
    this.ready = false;
  }
}
