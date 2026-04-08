"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import { TranceVoice } from "@/lib/TranceVoice";
import BilateralDot from "../shared/BilateralDot";
import SudCheck from "../shared/SudCheck";
import GroundingExercise from "../shared/GroundingExercise";
import NarrationDisplay from "../NarrationDisplay";
import AdverseEventFlow from "../shared/AdverseEventFlow";
import ButterflyHug from "./ButterflyHug";

type EmdrPhase =
  | "centering"
  | "safe-place"
  | "safe-place-bls"
  | "butterfly-hug"
  | "container"
  | "container-bls"
  | "resource"
  | "resource-bls"
  | "body-scan"
  | "sud-check"
  | "grounding"
  | "closing"
  | "summary";

interface EmdrSessionProps {
  onComplete: (data: EmdrSummaryData) => void;
  onExit?: () => void;
  binauralEnabled?: boolean;
}

export interface EmdrSummaryData {
  sudStart: number | null;
  sudEnd: number | null;
  exercisesCompleted: string[];
}

// Small pause between sequential narration cues (ms)
const CUE_PAUSE = 600;
// Minimum time any narration cue stays visible, even if audio is shorter
const MIN_CUE_DISPLAY = 3000;

export default function EmdrSession({ onComplete, onExit, binauralEnabled = true }: EmdrSessionProps) {
  const [phase, setPhase] = useState<EmdrPhase>("sud-check");
  const [narration, setNarration] = useState<string | null>(null);
  const [sudStart, setSudStart] = useState<number | null>(null);
  const [sudEnd, setSudEnd] = useState<number | null>(null);
  const [exercises, setExercises] = useState<string[]>([]);
  const [blsActive, setBlsActive] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [readyTarget, setReadyTarget] = useState<EmdrPhase | null>(null);
  const [showBlsContinue, setShowBlsContinue] = useState(false);
  const [groundingAttempted, setGroundingAttempted] = useState(false);
  const [showAdverseEvent, setShowAdverseEvent] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);

  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("emdr");
    audio.fadeIn(8, 0.5);
    if (!binauralEnabled) audio.muteBinaural();
    audioRef.current = audio;

    const voice = new TranceVoice();
    voice.init();
    voiceRef.current = voice;
    setVoiceAvailable(voice.isSupported());

    return () => { audio.stop(); voice.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers used inside phase effects
  const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const say = useCallback(async (display: string, file?: string) => {
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
  }, []);

  // ---- SUD CHECK (initial) ----
  const handleSudStart = useCallback((rating: number) => {
    setSudStart(rating);
    if (rating > 5) {
      if (groundingAttempted && rating >= 9) {
        setShowAdverseEvent(true);
        return;
      }
      setPhase("grounding");
    } else {
      setPhase("centering");
    }
  }, [groundingAttempted]);

  // ---- CENTERING ----
  useEffect(() => {
    if (phase !== "centering") return;
    let cancelled = false;
    const run = async () => {
      await delay(1500);
      if (cancelled) return;
      await say("Take a deep breath...", "/audio/emdr/emdr-centering-01.mp3");
      if (cancelled) return;
      await say("Feel the surface beneath you...", "/audio/emdr/emdr-centering-02.mp3");
      if (cancelled) return;
      setPhase("safe-place");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- SAFE PLACE ----
  useEffect(() => {
    if (phase !== "safe-place") return;
    let cancelled = false;
    const run = async () => {
      await say("Think of your safe place...", "/audio/emdr/emdr-safeplace-01.mp3");
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;
      await say("Notice its colors, sounds, and warmth...", "/audio/emdr/emdr-safeplace-02.mp3");
      if (cancelled) return;
      await delay(2500);
      if (cancelled) return;
      await say("Choose one word for this place...", "/audio/emdr/emdr-safeplace-03.mp3");
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;
      await say("Hold that image and word...", "/audio/emdr/emdr-safeplace-04.mp3");
      if (cancelled) return;
      setShowReady(true);
      setReadyTarget("safe-place-bls");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- SAFE PLACE BLS ----
  useEffect(() => {
    if (phase !== "safe-place-bls") return;
    let cancelled = false;
    setShowBlsContinue(false);
    setNarration("Follow the dot... hold your safe place...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Follow the dot... hold your safe place...",
        { file: "/audio/emdr/emdr-safeplace-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      setBlsActive(true);
    };
    run();
    const t = setTimeout(() => setShowBlsContinue(true), 25000);
    return () => { cancelled = true; clearTimeout(t); voiceRef.current?.cancel(); };
  }, [phase]);

  const handleSafePlaceContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setExercises((prev) => [...prev, "Safe Place"]);
    setPhase("butterfly-hug");
  }, []);

  // ---- BUTTERFLY HUG ----
  const handleButterflyComplete = useCallback(() => {
    setExercises((prev) => [...prev, "Butterfly Hug"]);
    setPhase("container");
  }, []);

  // ---- CONTAINER ----
  useEffect(() => {
    if (phase !== "container") return;
    let cancelled = false;
    const run = async () => {
      await say("Imagine a strong container...", "/audio/emdr/emdr-container-01.mp3");
      if (cancelled) return;
      await delay(2000);
      if (cancelled) return;
      await say("Place what bothers you inside... close it...", "/audio/emdr/emdr-container-02.mp3");
      if (cancelled) return;
      await delay(2000);
      if (cancelled) return;
      await say("Safely contained for now...", "/audio/emdr/emdr-container-03.mp3");
      if (cancelled) return;
      await delay(1500);
      if (cancelled) return;
      setShowReady(true);
      setReadyTarget("container-bls");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- CONTAINER BLS ----
  useEffect(() => {
    if (phase !== "container-bls") return;
    let cancelled = false;
    setShowBlsContinue(false);
    setNarration("Follow the dot... feel it sealing...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Follow the dot... feel it sealing...",
        { file: "/audio/emdr/emdr-container-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      setBlsActive(true);
    };
    run();
    const t = setTimeout(() => setShowBlsContinue(true), 20000);
    return () => { cancelled = true; clearTimeout(t); voiceRef.current?.cancel(); };
  }, [phase]);

  const handleContainerContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setExercises((prev) => [...prev, "Container"]);
    setPhase("resource");
  }, []);

  // ---- RESOURCE INSTALLATION ----
  useEffect(() => {
    if (phase !== "resource") return;
    let cancelled = false;
    const run = async () => {
      await say("Think of a time you felt strong...", "/audio/emdr/emdr-resource-01.mp3");
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;
      await say("Step into that memory...", "/audio/emdr/emdr-resource-02.mp3");
      if (cancelled) return;
      await delay(2500);
      if (cancelled) return;
      await say("Where do you feel it? Let it expand...", "/audio/emdr/emdr-resource-03.mp3");
      if (cancelled) return;
      setShowReady(true);
      setReadyTarget("resource-bls");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- RESOURCE BLS ----
  useEffect(() => {
    if (phase !== "resource-bls") return;
    let cancelled = false;
    setShowBlsContinue(false);
    setNarration("Follow the dot... strengthen this feeling...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Follow the dot... strengthen this feeling...",
        { file: "/audio/emdr/emdr-resource-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      setBlsActive(true);
    };
    run();
    const t = setTimeout(() => setShowBlsContinue(true), 30000);
    return () => { cancelled = true; clearTimeout(t); voiceRef.current?.cancel(); };
  }, [phase]);

  const handleResourceContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setExercises((prev) => [...prev, "Resource Installation"]);
    setPhase("body-scan");
  }, []);

  // ---- BODY SCAN ----
  useEffect(() => {
    if (phase !== "body-scan") return;
    let cancelled = false;
    const run = async () => {
      await say("Scan your body... notice how you feel...", "/audio/emdr/emdr-bodyscan-01.mp3");
      if (cancelled) return;
      await say("Observe without judgment...", "/audio/emdr/emdr-bodyscan-02.mp3");
      if (cancelled) return;
      setPhase("closing");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- CLOSING ----
  useEffect(() => {
    if (phase !== "closing") return;
    let cancelled = false;
    const run = async () => {
      await say("You can return to your safe place anytime...", "/audio/emdr/emdr-closing-01.mp3");
      if (cancelled) return;
      setNarration(null);
      setSudEnd(-1);
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  const handleSudEnd = useCallback((rating: number) => {
    setSudEnd(rating);
    audioRef.current?.fadeOut(8);
    onComplete({ sudStart, sudEnd: rating, exercisesCompleted: exercises });
  }, [sudStart, exercises, onComplete]);

  const handleReady = useCallback(() => {
    if (readyTarget) {
      setShowReady(false);
      setPhase(readyTarget);
      setReadyTarget(null);
    }
  }, [readyTarget]);

  const handleGroundingComplete = useCallback(() => {
    setGroundingAttempted(true);
    setPhase("sud-check");
    setSudStart(null);
  }, []);

  const blsContinueHandler =
    phase === "safe-place-bls" ? handleSafePlaceContinue
    : phase === "container-bls" ? handleContainerContinue
    : phase === "resource-bls" ? handleResourceContinue
    : undefined;

  if (showAdverseEvent) {
    return <AdverseEventFlow voice={voiceRef.current} onComplete={() => onExit?.()} />;
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {blsActive && (
        <div className="absolute top-[30%] w-full">
          <BilateralDot
            halfCycleSec={0.5}
            size={24}
            active={true}
            audio={audioRef.current}
            color="gold"
            showContinue={showBlsContinue}
            onContinue={blsContinueHandler}
          />
        </div>
      )}

      {onExit && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          whileHover={{ opacity: 0.6 }}
          transition={{ duration: 0.8 }}
          onClick={() => {
            audioRef.current?.fadeOut(3);
            setTimeout(() => audioRef.current?.stop(), 3500);
            voiceRef.current?.stop();
            onExit();
          }}
          className="fixed top-4 left-4 z-50 ui-text text-[10px] text-[#e8e0d4]/25
                     hover:text-[#e8e0d4]/60 transition-colors duration-500"
        >
          ← exit
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {phase === "sud-check" && sudStart === null && (
          <motion.div key="sud-start" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <SudCheck prompt="Before we begin — how much distress are you feeling right now?" onRate={handleSudStart} />
          </motion.div>
        )}

        {phase === "grounding" && (
          <motion.div key="grounding" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <GroundingExercise voice={voiceRef.current} onComplete={handleGroundingComplete} />
          </motion.div>
        )}

        {!["sud-check", "grounding", "butterfly-hug"].includes(phase) &&
          sudEnd === null && narration && !blsActive && (
          <motion.div key={`narr-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
            className="flex flex-col items-center gap-6">
            <NarrationDisplay text={narration} size="large" />
            {showReady && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                onClick={handleReady}
                className="px-8 py-3 border border-gold/40 rounded-full text-gold/80
                           hover:border-gold/70 hover:text-gold hover:bg-gold/5
                           transition-all duration-500 ui-text"
              >
                I&apos;m ready
              </motion.button>
            )}
          </motion.div>
        )}

        {phase === "butterfly-hug" && (
          <motion.div key="butterfly" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <ButterflyHug voice={voiceRef.current} audio={audioRef.current} onComplete={handleButterflyComplete} />
          </motion.div>
        )}

        {phase === "closing" && sudEnd !== null && sudEnd < 0 && (
          <motion.div key="sud-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <SudCheck prompt="How are you feeling now?" onRate={handleSudEnd} />
          </motion.div>
        )}
      </AnimatePresence>

      {!voiceAvailable && (
        <div className="fixed bottom-4 left-4 z-50 text-[11px] ui-text px-3 py-2 rounded-full border border-[#e8e0d4]/20 text-[#e8e0d4]/55">
          Voice unavailable in this browser — text guidance only
        </div>
      )}
    </div>
  );
}
