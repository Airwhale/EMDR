"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import { TranceVoice } from "@/lib/TranceVoice";
import BilateralDot from "../shared/BilateralDot";
import SudCheck from "../shared/SudCheck";
import GroundingExercise from "../shared/GroundingExercise";
import NarrationDisplay from "../NarrationDisplay";
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
}

export interface EmdrSummaryData {
  sudStart: number | null;
  sudEnd: number | null;
  exercisesCompleted: string[];
}

export default function EmdrSession({ onComplete }: EmdrSessionProps) {
  const [phase, setPhase] = useState<EmdrPhase>("sud-check");
  const [narration, setNarration] = useState<string | null>(null);
  const [sudStart, setSudStart] = useState<number | null>(null);
  const [sudEnd, setSudEnd] = useState<number | null>(null);
  const [exercises, setExercises] = useState<string[]>([]);
  const [blsActive, setBlsActive] = useState(false);
  const [showBlsContinue, setShowBlsContinue] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);

  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("emdr");
    audio.fadeIn(8, 0.4);
    audioRef.current = audio;

    const voice = new TranceVoice();
    voice.init();
    voiceRef.current = voice;
    setVoiceAvailable(voice.isSupported());

    return () => { audio.stop(); voice.stop(); };
  }, []);

  const speak = useCallback((text: string) => {
    voiceRef.current?.speak(text);
  }, []);

  const showNarr = useCallback((text: string, duration: number, spokenText?: string) => {
    setNarration(text);
    speak(spokenText || text);
    return setTimeout(() => setNarration(null), duration);
  }, [speak]);

  // ---- SUD CHECK (initial) ----
  const handleSudStart = useCallback((rating: number) => {
    setSudStart(rating);
    setPhase(rating > 5 ? "grounding" : "centering");
  }, []);

  // ---- CENTERING ----
  useEffect(() => {
    if (phase !== "centering") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("Take a slow, deep breath... let your body settle...", 7000,
      "Take a slow... deep breath... let your body settle..."));
    timers.push(setTimeout(() => {
      showNarr("Feel the surface beneath you... notice the air on your skin...", 7000,
        "Feel the surface beneath you... notice the air on your skin...");
    }, 9000));
    timers.push(setTimeout(() => setPhase("safe-place"), 20000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SAFE PLACE ----
  useEffect(() => {
    if (phase !== "safe-place") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("In your mind, think of a place where you feel completely safe and at peace...", 8000,
      "In your mind... think of a place... where you feel completely safe... and at peace..."));
    timers.push(setTimeout(() => {
      showNarr("Notice the colors, sounds, and temperature of this place in your mind...", 8000,
        "Notice the colors... the sounds... and the temperature of this place... in your mind...");
    }, 10000));
    timers.push(setTimeout(() => {
      showNarr("Choose a single word that represents this place...", 7000,
        "Choose a single word... that represents this safe place...");
    }, 20000));
    timers.push(setTimeout(() => showNarr("Hold that image and word in mind...", 5000), 29000));
    timers.push(setTimeout(() => setPhase("safe-place-bls"), 36000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SAFE PLACE BLS (4-6 slow passes ≈ 6s, then continue button) ----
  useEffect(() => {
    if (phase !== "safe-place-bls") return;
    setBlsActive(true);
    setShowBlsContinue(false);
    showNarr("Follow the dot while holding your safe place in mind...", 6000,
      "Follow the dot... while holding your safe place in mind...");
    // Safe place: minimum 20s (~20 slow passes) before continue appears
    const t = setTimeout(() => setShowBlsContinue(true), 20000);
    return () => clearTimeout(t);
  }, [phase, showNarr]);

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
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("In your mind, imagine a strong container — a box, a vault, anything that locks securely...", 8000,
      "In your mind... imagine a strong container... a box... a vault... anything that locks securely..."));
    timers.push(setTimeout(() => {
      showNarr("Place anything that's been bothering you inside... close the lid firmly...", 8000,
        "Place anything that's been bothering you inside... close the lid firmly...");
    }, 10000));
    timers.push(setTimeout(() => {
      showNarr("It's held safely there. Not gone — just contained for now...", 7000,
        "It's held safely there... not gone... just contained for now...");
    }, 20000));
    timers.push(setTimeout(() => setPhase("container-bls"), 29000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- CONTAINER BLS (4-6 passes ≈ 6s, then continue) ----
  useEffect(() => {
    if (phase !== "container-bls") return;
    setBlsActive(true);
    setShowBlsContinue(false);
    showNarr("Follow the dot to seal the container...", 5000,
      "Follow the dot... to seal the container...");
    // Container: minimum 15s (~15 slow passes)
    const t = setTimeout(() => setShowBlsContinue(true), 15000);
    return () => clearTimeout(t);
  }, [phase, showNarr]);

  const handleContainerContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setExercises((prev) => [...prev, "Container"]);
    setPhase("resource");
  }, []);

  // ---- RESOURCE INSTALLATION ----
  useEffect(() => {
    if (phase !== "resource") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("In your mind, think of a time you felt strong, capable, or deeply at peace...", 8000,
      "In your mind... think of a time... you felt strong... capable... or deeply at peace..."));
    timers.push(setTimeout(() => {
      showNarr("In your mind, step into that memory... feel it in your body...", 7000,
        "In your mind... step into that memory... feel it... in your body...");
    }, 10000));
    timers.push(setTimeout(() => {
      showNarr("Where do you feel this strength? Let it grow...", 7000,
        "Where do you feel this strength... let it grow...");
    }, 19000));
    timers.push(setTimeout(() => setPhase("resource-bls"), 28000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- RESOURCE BLS (6-12 passes ≈ 12s, then continue) ----
  useEffect(() => {
    if (phase !== "resource-bls") return;
    setBlsActive(true);
    setShowBlsContinue(false);
    showNarr("Follow the dot... let the eye movements strengthen this feeling...", 6000,
      "Follow the dot... let the eye movements strengthen this feeling...");
    // Resource installation: minimum 25s (~25 passes, longest EMDR set)
    const t = setTimeout(() => setShowBlsContinue(true), 25000);
    return () => clearTimeout(t);
  }, [phase, showNarr]);

  const handleResourceContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setExercises((prev) => [...prev, "Resource Installation"]);
    setPhase("body-scan");
  }, []);

  // ---- BODY SCAN ----
  useEffect(() => {
    if (phase !== "body-scan") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("Scan your body from head to toe... notice how you feel now...", 8000,
      "Scan your body from head to toe... notice how you feel now..."));
    timers.push(setTimeout(() => {
      showNarr("Observe any changes without judgment...", 6000,
        "Observe any changes... without judgment...");
    }, 10000));
    timers.push(setTimeout(() => setPhase("closing"), 20000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- CLOSING ----
  useEffect(() => {
    if (phase !== "closing") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("Take a deep breath... you can return to your safe place anytime you need...", 8000,
      "Take a deep breath... you can return to your safe place... anytime you need..."));
    timers.push(setTimeout(() => { setNarration(null); setSudEnd(-1); }, 12000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  const handleSudEnd = useCallback((rating: number) => {
    setSudEnd(rating);
    audioRef.current?.fadeOut(8);
    onComplete({ sudStart, sudEnd: rating, exercisesCompleted: exercises });
  }, [sudStart, exercises, onComplete]);

  const handleGroundingComplete = useCallback(() => setPhase("centering"), []);

  // Determine BLS continue handler based on current phase
  const blsContinueHandler =
    phase === "safe-place-bls" ? handleSafePlaceContinue
    : phase === "container-bls" ? handleContainerContinue
    : phase === "resource-bls" ? handleResourceContinue
    : undefined;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* BLS dot — centered vertically in upper portion, full width */}
      {blsActive && (
        <div className="absolute top-[30%] w-full">
          <BilateralDot
            halfCycleSec={0.5}
            size={18}
            active={true}
            audio={audioRef.current}
            color="gold"
            showContinue={showBlsContinue}
            onContinue={blsContinueHandler}
          />
        </div>
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

        {/* Narration — hidden during BLS (dot should be the only thing on screen) */}
        {!["sud-check", "grounding", "butterfly-hug"].includes(phase) &&
          sudEnd === null && narration && !blsActive && (
          <motion.div key={`narr-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <NarrationDisplay text={narration} size="large" />
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
