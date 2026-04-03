"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import { TranceVoice } from "@/lib/TranceVoice";
import BilateralDot from "../shared/BilateralDot";
import SudCheck from "../shared/SudCheck";
import GroundingExercise from "../shared/GroundingExercise";
import NarrationDisplay from "../NarrationDisplay";

type ArtPhase =
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
  onExit?: () => void;
}

export interface ArtSummaryData {
  sudStart: number | null;
  sudEnd: number | null;
  rounds: number;
}

const MAX_ROUNDS = 3;

// ART uses ~40 passes per set at 0.35s half-cycle ≈ 28s minimum
// Add buffer so user has time to settle — 35s before continue appears
const ART_SET_DURATION = 35000;

export default function ArtSession({ onComplete, onExit }: ArtSessionProps) {
  const [phase, setPhase] = useState<ArtPhase>("centering");
  const [narration, setNarration] = useState<string | null>(null);
  const [sudStart, setSudStart] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [blsActive, setBlsActive] = useState(false);
  const [showBlsContinue, setShowBlsContinue] = useState(false);
  const [showSudRecheck, setShowSudRecheck] = useState(false);
  const [showSudFinal, setShowSudFinal] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);

  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("art");
    audio.fadeIn(6, 0.5);
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

  // ---- CENTERING ----
  useEffect(() => {
    if (phase !== "centering") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Small delay to let voice engine initialize before first spoken cue
    timers.push(setTimeout(() => {
      showNarr("Take a deep breath... settle into this moment...", 7000);
    }, 1500));
    timers.push(setTimeout(() => {
      showNarr("Let your body relax... feel the ground beneath you...", 7000);
    }, 10500));
    timers.push(setTimeout(() => setPhase("scene-select"), 21500));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SCENE SELECT ----
  useEffect(() => {
    if (phase !== "scene-select") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(showNarr(
      "Think of something stressful. You don't need to describe it — just bring it to mind...", 8000,
      "Think of something stressful... you don't need to describe it... just bring it to mind..."));
    timers.push(setTimeout(() => {
      showNarr("See it like a scene in a movie in your mind... notice the details...", 7000,
        "See it like a scene in a movie... in your mind... notice the details...");
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

    if (round > 1) {
      // Returning for another round — explicitly bring back the original
      timers.push(showNarr("Bring the original scene back to mind... how it was before you changed it...", 6000,
        "Bring the original scene back to mind... how it was... before you changed it..."));
      timers.push(setTimeout(() => {
        showNarr("Follow the dot... notice what's still there...", 5000,
          "Follow the dot... notice what's still there...");
      }, 10000));
    } else {
      timers.push(showNarr("Hold that scene in mind... follow the dot with your eyes... keep your head still...", 6000,
        "Hold that scene in mind... follow the dot with your eyes... keep your head still... just your eyes..."));
      timers.push(setTimeout(() => {
        showNarr("Keep following... let whatever comes up just be there...", 5000,
          "Keep following... let whatever comes up... just be there...");
      }, 10000));
    }
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
    timers.push(showNarr("Where do you feel the tension or discomfort in your body? Focus on that place...", 7000,
      "Where do you feel the tension... or discomfort... in your body... focus on that place..."));
    timers.push(setTimeout(() => setPhase("sensation-bls"), 9000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SENSATION BLS (40 passes ≈ 28s, then continue) ----
  useEffect(() => {
    if (phase !== "sensation-bls") return;
    setBlsActive(true);
    setShowBlsContinue(false);

    showNarr("Follow the dot... focus on where you feel it in your body... let the feeling soften...", 5000,
      "Follow the dot... focus on where you feel it in your body... let the feeling soften...");
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
    timers.push(showNarr("Now — in your mind, change the scene. You're in control of this image...", 7000,
      "Now... in your mind... change the scene. You're in control of this image..."));
    timers.push(setTimeout(() => {
      showNarr("Change what happens... change who's there... change how it looks or feels. Make it the way you want it to be...", 8000,
        "Change what happens... change who's there... change how it looks or feels. Make it the way you want it to be...");
    }, 9000));
    timers.push(setTimeout(() => setPhase("vir-bls"), 18000));
    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- VIR BLS (40 passes to install the changed scene, then continue) ----
  useEffect(() => {
    if (phase !== "vir-bls") return;
    setBlsActive(true);
    setShowBlsContinue(false);

    showNarr("Hold the changed scene in mind... follow the dot... let it settle in...", 6000,
      "Hold the changed scene in mind... follow the dot... let it settle in...");
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
    timers.push(showNarr("Take a deep breath... think back to the original memory... notice how different it feels now...", 9000,
      "Take a deep breath... think back to the original memory... notice how different it feels now..."));
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
            size={22}
            active={true}
            audio={audioRef.current}
            color="white"
            showContinue={showBlsContinue}
            onContinue={blsContinueHandler}
          />
        </div>
      )}

      {/* Exit button */}
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
          <motion.div key={`art-narr-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
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
