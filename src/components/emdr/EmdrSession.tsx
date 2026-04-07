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

  const say = useCallback(async (display: string, spoken?: string) => {
    setNarration(display);
    if (voiceRef.current) await voiceRef.current.speakAsync(spoken ?? display);
    await delay(CUE_PAUSE);
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
      await say("Take a deep breath...", "Take a slow... deep breath... let your body settle...");
      if (cancelled) return;
      await say("Feel the surface beneath you...", "Feel the surface beneath you... notice the air on your skin...");
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
      await say("Think of your safe place...", "In your mind... think of a place... where you feel completely safe... and at peace...");
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;
      await say("Notice its colors, sounds, and warmth...", "Notice the colors... the sounds... and the temperature of this place... in your mind...");
      if (cancelled) return;
      await delay(2500);
      if (cancelled) return;
      await say("Choose one word for this place...", "Choose a single word... that represents this safe place...");
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;
      await say("Hold that image and word...", "Hold that image and word in mind...");
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
    setBlsActive(true);
    setShowBlsContinue(false);
    voiceRef.current?.speakAsync(
      "Follow the dot with your eyes... keep your head still... just your eyes... holding your safe place in mind..."
    );
    setNarration("Follow the dot... hold your safe place...");
    const t = setTimeout(() => setShowBlsContinue(true), 20000);
    return () => clearTimeout(t);
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
      await say("Imagine a strong container...", "In your mind... imagine a strong container... a box... a vault... anything that locks securely...");
      if (cancelled) return;
      await delay(2000);
      if (cancelled) return;
      await say("Place what bothers you inside... close it...", "Place anything that's been bothering you inside... close the lid firmly...");
      if (cancelled) return;
      await delay(2000);
      if (cancelled) return;
      await say("Safely contained for now...", "It's held safely there... not gone... just contained for now...");
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
    setBlsActive(true);
    setShowBlsContinue(false);
    voiceRef.current?.speakAsync(
      "Imagine the container sealing... as you follow the dot... feeling it become more and more secure... with each movement of your eyes..."
    );
    setNarration("Follow the dot... feel it sealing...");
    const t = setTimeout(() => setShowBlsContinue(true), 15000);
    return () => clearTimeout(t);
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
      await say("Think of a time you felt strong...", "In your mind... think of a time... you felt strong... capable... or deeply at peace...");
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;
      await say("Step into that memory...", "In your mind... step into that memory... feel it... in your body...");
      if (cancelled) return;
      await delay(2500);
      if (cancelled) return;
      await say("Where do you feel it? Let it expand...", "Where in your body do you feel that strength... or peace... let the feeling expand...");
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
    setBlsActive(true);
    setShowBlsContinue(false);
    voiceRef.current?.speakAsync("Follow the dot... let the eye movements strengthen this feeling...");
    setNarration("Follow the dot... strengthen this feeling...");
    const t = setTimeout(() => setShowBlsContinue(true), 25000);
    return () => clearTimeout(t);
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
      await say("Scan your body... notice how you feel...", "Scan your body from head to toe... notice how you feel now...");
      if (cancelled) return;
      await say("Observe without judgment...", "Observe any changes... without judgment...");
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
      await say("You can return to your safe place anytime...", "Take a deep breath... you can return to your safe place... anytime you need...");
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
