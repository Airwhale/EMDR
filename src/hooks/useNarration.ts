"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TranceAudioEngine, AudioMode } from "@/lib/TranceAudioEngine";
import { TranceVoice } from "@/lib/TranceVoice";

/** Small pause between sequential narration cues (ms) */
const CUE_PAUSE = 600;
/** Minimum time any narration cue stays visible, even if audio is shorter */
const MIN_CUE_DISPLAY = 3000;

interface UseNarrationOptions {
  mode: AudioMode;
}

interface UseNarrationReturn {
  narration: string | null;
  setNarration: (text: string | null) => void;
  say: (display: string, file?: string) => Promise<void>;
  delay: (ms: number) => Promise<void>;
  cancelVoice: () => void;
  audioRef: React.RefObject<TranceAudioEngine | null>;
  voiceRef: React.RefObject<TranceVoice | null>;
  voiceAvailable: boolean;
}

/**
 * Shared narration hook used by EmdrSession, ArtSession, and other
 * session components. Centralizes audio/voice init, the `say` helper,
 * and `delay` utility.
 *
 * Audio engine is initialized but NOT started — the caller is responsible
 * for calling `audioRef.current.fadeIn(...)` after mount.
 */
export function useNarration({ mode }: UseNarrationOptions): UseNarrationReturn {
  const [narration, setNarration] = useState<string | null>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);

  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init(mode);
    audioRef.current = audio;

    const voice = new TranceVoice();
    voice.init();
    voiceRef.current = voice;
    setVoiceAvailable(voice.isSupported());

    return () => {
      audio.stop();
      voice.stop();
    };
  // mode is stable for the lifetime of a session component
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelVoice = useCallback(() => {
    voiceRef.current?.cancel();
  }, []);

  const delay = useCallback(
    (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
    []
  );

  const say = useCallback(
    async (display: string, file?: string) => {
      const start = Date.now();
      setNarration(display);
      if (voiceRef.current) {
        if (file) {
          await voiceRef.current.speakAsync(display, { file });
        } else {
          await voiceRef.current.speakAsync(display);
        }
      }
      // Ensure the cue stays visible for at least MIN_CUE_DISPLAY ms total
      const elapsed = Date.now() - start;
      const remaining = Math.max(CUE_PAUSE, MIN_CUE_DISPLAY - elapsed);
      await delay(remaining);
    },
    [delay]
  );

  return {
    narration,
    setNarration,
    say,
    delay,
    cancelVoice,
    audioRef,
    voiceRef,
    voiceAvailable,
  };
}
