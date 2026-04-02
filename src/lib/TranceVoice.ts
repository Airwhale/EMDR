/**
 * TranceVoice — Web Speech API wrapper for hypnotic narration.
 * Speaks with a slow, calm, low-pitched voice. Falls back silently if unsupported.
 */

export class TranceVoice {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private ready = false;
  private enabled = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  init(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    this.synth = window.speechSynthesis;

    const pickVoice = () => {
      const voices = this.synth!.getVoices();
      if (voices.length === 0) return;

      // Prefer: English, low-pitched, female/neutral voices good for calm narration
      // Priority: Google UK English Female > Microsoft Zira > any en voice
      const preferred = [
        "Google UK English Female",
        "Google US English",
        "Microsoft Zira",
        "Samantha",
        "Karen",
        "Daniel",
        "Moira",
        "Tessa",
      ];

      for (const name of preferred) {
        const found = voices.find((v) => v.name.includes(name));
        if (found) {
          this.voice = found;
          this.ready = true;
          return;
        }
      }

      // Fallback: any English voice
      const enVoice = voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) {
        this.voice = enVoice;
        this.ready = true;
      }
    };

    pickVoice();
    // Voices load async in Chrome
    if (!this.ready) {
      this.synth.addEventListener("voiceschanged", pickVoice, { once: true });
    }
  }

  speak(text: string, options?: { rate?: number; pitch?: number }): void {
    if (!this.synth || !this.ready || !this.enabled) return;

    // Cancel any in-progress speech before starting new
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = options?.rate ?? 0.72; // Very slow
    utterance.pitch = options?.pitch ?? 0.85; // Slightly low
    utterance.volume = 0.8;
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /** Speak with a rising alertness (for emergence) */
  speakAlert(text: string, step: number): void {
    // Gradually increase rate and pitch for each emergence step
    this.speak(text, {
      rate: 0.72 + step * 0.06,
      pitch: 0.85 + step * 0.04,
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

  stop(): void {
    this.cancel();
    this.synth = null;
    this.ready = false;
  }
}
