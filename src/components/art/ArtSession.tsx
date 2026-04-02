"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import { TranceVoice } from "@/lib/TranceVoice";
import { useSpeed } from "@/lib/SpeedContext";
import BilateralDot from "../shared/BilateralDot";
import SudCheck from "../shared/SudCheck";
import GroundingExercise from "../shared/GroundingExercise";
import NarrationDisplay from "../NarrationDisplay";

type ArtPhase =
  | "disclaimer"
  | "centering"
  | "scene-select"
  | "sud-initial"
  | "grounding"
  | "processing"
  | "sensation-check"
  | "sensation-bls"
  | "vir-prompt"
  | "vir-bls"
  | "sud-recheck"
  | "body-scan"
  | "closing"
  | "summary";

interface ArtSessionProps {
  onComplete: (data: ArtSummaryData) => void;
}

export interface ArtSummaryData {
  sudStart: number | null;
  sudEnd: number | null;
  rounds: number;
}

const MAX_ROUNDS = 3;

// ART uses ~40 passes per set at 0.35s half-cycle = ~28s per set
const ART_SET_DURATION = 28000;

export default function ArtSession({ onComplete }: ArtSessionProps) {
  const [phase, setPhase] = useState<ArtPhase>("disclaimer");
  const [narration, setNarration] = useState<string | null>(null);
  const [sudStart, setSudStart] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [blsActive, setBlsActive] = useState(false);
  const [showBlsContinue, setShowBlsContinue] = useState(false);
  const [showSudRecheck, setShowSudRecheck] = useState(false);
  const [showSudFinal, setShowSudFinal] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  const speed = useSpeed();
  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);

  useEffect(() => {
    if (voiceRef.current) voiceRef.current.speedMultiplier = speed;
  }, [speed]);

  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("art");
    audio.fadeIn(6, 0.45);
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

  const showNarr = useCallback((text: string, duration: number, spoken?: string) => {
    setNarration(text);
    speak(spoken || text);
    return setTimeout(() => setNarration(null), duration);
  }, [speak]);

  // ---- DISCLAIMER ----
  const handleDisclaimerAccept = useCallback(() => setPhase("centering"), []);

  // ---- CENTERING ----
  useEffect(() => {
    if (phase !== "centering") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("Take a deep breath... settle into this moment...", 7000));
    timers.push(setTimeout(() => {
      showNarr("Let your body relax... feel the ground beneath you...", 7000);
    }, 9000));
    timers.push(setTimeout(() => setPhase("scene-select"), 20000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SCENE SELECT ----
  useEffect(() => {
    if (phase !== "scene-select") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr(
      "Think of something mildly stressful. You don't need to describe it — just bring it to mind...", 8000,
      "Think of something mildly stressful... you don't need to describe it... just bring it to mind..."));
    timers.push(setTimeout(() => {
      showNarr("See it like a scene in a movie... notice the details...", 7000,
        "See it like a scene in a movie... notice the details...");
    }, 10000));
    timers.push(setTimeout(() => setPhase("sud-initial"), 20000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- INITIAL SUD ----
  const handleSudInitial = useCallback((rating: number) => {
    setSudStart(rating);
    if (rating > 6) { setPhase("grounding"); }
    else { setRound(1); setPhase("processing"); }
  }, []);

  const handleGroundingComplete = useCallback(() => setPhase("centering"), []);

  // ---- PROCESSING (40 passes ≈ 28s, then continue button) ----
  useEffect(() => {
    if (phase !== "processing") return;
    setBlsActive(true);
    setShowBlsContinue(false);
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(showNarr("Hold the scene in mind... follow the dot...", 5000,
      "Hold the scene in mind... follow the dot..."));
    timers.push(setTimeout(() => {
      showNarr("Keep following... let whatever comes up just be there...", 5000,
        "Keep following... let whatever comes up... just be there...");
    }, 10000));
    // Show continue after ~40 passes
    timers.push(setTimeout(() => setShowBlsContinue(true), ART_SET_DURATION));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  const handleProcessingContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setPhase("sensation-check");
  }, []);

  // ---- SENSATION CHECK ----
  useEffect(() => {
    if (phase !== "sensation-check") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("Where do you feel this in your body? Focus on that place...", 7000,
      "Where do you feel this... in your body... focus on that place..."));
    timers.push(setTimeout(() => setPhase("sensation-bls"), 9000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SENSATION BLS (40 passes ≈ 28s, then continue) ----
  useEffect(() => {
    if (phase !== "sensation-bls") return;
    setBlsActive(true);
    setShowBlsContinue(false);

    showNarr("Follow the dot... focus on the sensation... let it shift...", 5000,
      "Follow the dot... focus on the sensation... let it shift...");
    const t = setTimeout(() => setShowBlsContinue(true), ART_SET_DURATION);
    return () => clearTimeout(t);
  }, [phase, showNarr]);

  const handleSensationContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setPhase("vir-prompt");
  }, []);

  // ---- VOLUNTARY IMAGE REPLACEMENT prompt ----
  useEffect(() => {
    if (phase !== "vir-prompt") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("Now — replace that scene with any image you choose...", 7000,
      "Now... replace that scene... with any image you choose..."));
    timers.push(setTimeout(() => {
      showNarr("It can be peaceful, funny, powerful — anything you want. Make the swap...", 7000,
        "It can be peaceful... funny... powerful... anything you want. Make the swap...");
    }, 9000));
    timers.push(setTimeout(() => setPhase("vir-bls"), 18000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- VIR BLS (40 passes to install new image, then continue) ----
  useEffect(() => {
    if (phase !== "vir-bls") return;
    setBlsActive(true);
    setShowBlsContinue(false);

    showNarr("Hold the new image... follow the dot... let it settle in...", 6000,
      "Hold the new image... follow the dot... let it settle in...");
    const t = setTimeout(() => setShowBlsContinue(true), ART_SET_DURATION);
    return () => clearTimeout(t);
  }, [phase, showNarr]);

  const handleVirContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setPhase("sud-recheck");
  }, []);

  // ---- SUD RECHECK ----
  useEffect(() => {
    if (phase !== "sud-recheck") return;
    setShowSudRecheck(true);
  }, [phase]);

  const handleSudRecheck = useCallback((rating: number) => {
    setShowSudRecheck(false);
    if (rating > 2 && round < MAX_ROUNDS) {
      setRound((r) => r + 1);
      setPhase("processing");
    } else {
      setPhase("body-scan");
    }
  }, [round]);

  // ---- BODY SCAN ----
  useEffect(() => {
    if (phase !== "body-scan") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("Scan your body from head to toe... notice what has shifted...", 7000));
    timers.push(setTimeout(() => {
      showNarr("Observe without judgment...", 5000, "Observe... without judgment...");
    }, 9000));
    timers.push(setTimeout(() => setPhase("closing"), 18000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- CLOSING ----
  useEffect(() => {
    if (phase !== "closing") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr("Take a deep breath... notice how different the scene feels now...", 8000));
    timers.push(setTimeout(() => setShowSudFinal(true), 12000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  const handleSudFinal = useCallback((rating: number) => {
    audioRef.current?.fadeOut(8);
    onComplete({ sudStart, sudEnd: rating, rounds: round });
  }, [sudStart, round, onComplete]);

  // BLS continue handler based on phase
  const blsContinueHandler =
    phase === "processing" ? handleProcessingContinue
    : phase === "sensation-bls" ? handleSensationContinue
    : phase === "vir-bls" ? handleVirContinue
    : undefined;

  const isBls = blsActive;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* BLS dot — full width, faster for ART */}
      {isBls && (
        <div className="absolute top-[30%] w-full">
          <BilateralDot
            halfCycleSec={0.35}
            size={16}
            active={true}
            audio={audioRef.current}
            color="white"
            showContinue={showBlsContinue}
            onContinue={blsContinueHandler}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "disclaimer" && (
          <motion.div key="art-disclaimer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-8 px-6 max-w-lg text-center">
            <p className="narration-text text-xl text-[#e8e0d4]/80">
              This session uses techniques from Accelerated Resolution Therapy.
            </p>
            <p className="text-sm text-[#e8e0d4]/40 font-light leading-relaxed">
              Work with mildly stressful memories only. For trauma or highly
              distressing memories, please work with a trained ART clinician.
              You will not be asked to describe or share what you&apos;re processing.
            </p>
            <button onClick={handleDisclaimerAccept}
              className="px-8 py-3 border border-gold/40 rounded-full text-gold/80
                         hover:border-gold/70 hover:text-gold transition-all duration-700 ui-text">
              I understand
            </button>
          </motion.div>
        )}

        {phase === "grounding" && (
          <motion.div key="art-grounding" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <GroundingExercise voice={voiceRef.current} onComplete={handleGroundingComplete} />
          </motion.div>
        )}

        {phase === "sud-initial" && (
          <motion.div key="art-sud-init" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <SudCheck prompt="Rate the distress of this scene from 0 to 10..." onRate={handleSudInitial} />
          </motion.div>
        )}

        {/* Narration — hidden during BLS (dot should be the only thing on screen) */}
        {narration && !showSudRecheck && !showSudFinal && !isBls && (
          <motion.div key={`art-narr-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}>
            <NarrationDisplay text={narration} size="large" />
          </motion.div>
        )}

        {showSudRecheck && (
          <motion.div key="art-sud-re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <SudCheck prompt="What's the number now?" onRate={handleSudRecheck} />
          </motion.div>
        )}

        {showSudFinal && (
          <motion.div key="art-sud-final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <SudCheck prompt="How do you feel now?" onRate={handleSudFinal} />
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
