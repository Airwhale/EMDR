/**
 * TranceVoice — Web Speech API wrapper for hypnotic narration.
 * Aggressively selects the most natural-sounding voice available on the
 * user's OS/browser, with per-voice rate/pitch tuning.
 */

interface VoiceTuning {
  rate: number;
  pitch: number;
  volume: number;
}

/**
 * Voice priority list. Order matters — first match wins.
 * Each entry: [name substring to match, tuning overrides].
 *
 * Strategy:
 *  1. Premium neural/enhanced OS voices (macOS, iOS, Edge Online)
 *  2. Good-quality standard OS voices
 *  3. Google voices (Chrome)
 *  4. Any English voice as fallback
 */
const VOICE_PRIORITY: [string, Partial<VoiceTuning>][] = [
  // ---- macOS / iOS neural voices (best quality on Apple devices) ----
  // "Enhanced" or "Premium" suffix = downloaded neural voice
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
  // Standard macOS voices (still decent)
  ["Samantha", { rate: 0.74, pitch: 0.9, volume: 0.75 }],
  ["Karen", { rate: 0.72, pitch: 0.88, volume: 0.75 }],
  ["Moira", { rate: 0.70, pitch: 0.85, volume: 0.75 }],

  // ---- Microsoft Edge Online neural voices (Azure quality, free) ----
  ["Microsoft Jenny Online", { rate: 0.76, pitch: 0.95, volume: 0.75 }],
  ["Microsoft Aria Online", { rate: 0.74, pitch: 0.92, volume: 0.75 }],
  ["Microsoft Sonia Online", { rate: 0.72, pitch: 0.9, volume: 0.75 }],
  ["Microsoft Libby Online", { rate: 0.72, pitch: 0.9, volume: 0.75 }],
  ["Microsoft Guy Online", { rate: 0.70, pitch: 0.82, volume: 0.7 }],
  // Edge desktop voices (still good)
  ["Microsoft Jenny", { rate: 0.76, pitch: 0.95, volume: 0.75 }],
  ["Microsoft Zira", { rate: 0.72, pitch: 0.88, volume: 0.7 }],
  ["Microsoft David", { rate: 0.70, pitch: 0.82, volume: 0.7 }],

  // ---- Google voices (Chrome on all platforms) ----
  ["Google UK English Female", { rate: 0.72, pitch: 0.88, volume: 0.7 }],
  ["Google US English", { rate: 0.74, pitch: 0.9, volume: 0.7 }],
  ["Google UK English Male", { rate: 0.68, pitch: 0.82, volume: 0.7 }],

  // ---- Linux common voices ----
  ["English+Annie", { rate: 0.74, pitch: 0.9, volume: 0.7 }],
];

const DEFAULT_TUNING: VoiceTuning = { rate: 0.72, pitch: 0.85, volume: 0.7 };

export class TranceVoice {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private tuning: VoiceTuning = { ...DEFAULT_TUNING };
  private ready = false;
  private enabled = true;
  private supported = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  init(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    this.supported = true;
    this.synth = window.speechSynthesis;

    const pickVoice = () => {
      const voices = this.synth!.getVoices();
      if (voices.length === 0) return;

      // Try priority list
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

      // Broad search: prefer any voice with "Enhanced", "Premium", or "Neural"
      const neural = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (/enhanced|premium|neural|online/i.test(v.name))
      );
      if (neural) {
        this.voice = neural;
        this.tuning = { ...DEFAULT_TUNING };
        this.ready = true;
        return;
      }

      // Final fallback: any English voice
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

  speak(text: string, options?: { rate?: number; pitch?: number }): void {
    if (!this.synth || !this.ready || !this.enabled) return;

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = options?.rate ?? this.tuning.rate;
    utterance.pitch = options?.pitch ?? this.tuning.pitch;
    utterance.volume = this.tuning.volume;
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  speakAlert(text: string, step: number): void {
    this.speak(text, {
      rate: this.tuning.rate + step * 0.06,
      pitch: this.tuning.pitch + step * 0.04,
    });
  }

  cancel(): void {
    this.synth?.cancel();
    this.currentUtterance = null;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.cancel();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isReady(): boolean {
    return this.ready;
  }

  isSupported(): boolean {
    return this.supported;
  }

  getVoiceName(): string {
    return this.voice?.name ?? "none";
  }

  stop(): void {
    this.cancel();
    this.synth = null;
    this.ready = false;
  }
}
