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

export default function ArtSession({ onComplete }: ArtSessionProps) {
  const [phase, setPhase] = useState<ArtPhase>("disclaimer");
  const [narration, setNarration] = useState<string | null>(null);
  const [sudStart, setSudStart] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [blsActive, setBlsActive] = useState(false);
  const [showSudRecheck, setShowSudRecheck] = useState(false);
  const [showSudFinal, setShowSudFinal] = useState(false);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);

  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("art");
    audio.fadeIn(6, 0.45);
    audioRef.current = audio;

    const voice = new TranceVoice();
    voice.init();
    voiceRef.current = voice;

    return () => {
      audio.stop();
      voice.stop();
    };
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
  const handleDisclaimerAccept = useCallback(() => {
    setPhase("centering");
  }, []);

  // ---- CENTERING ----
  useEffect(() => {
    if (phase !== "centering") return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(showNarr(
      "Take a deep breath... settle into this moment...",
      7000,
      "Take a deep breath... settle into this moment..."
    ));
    timers.push(setTimeout(() => {
      showNarr(
        "Let your body relax... feel the ground beneath you...",
        7000,
        "Let your body relax... feel the ground beneath you..."
      );
    }, 9000));
    timers.push(setTimeout(() => setPhase("scene-select"), 20000));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SCENE SELECT ----
  useEffect(() => {
    if (phase !== "scene-select") return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(showNarr(
      "Think of something mildly stressful. You don't need to describe it — just bring it to mind...",
      8000,
      "Think of something mildly stressful... you don't need to describe it... just bring it to mind..."
    ));
    timers.push(setTimeout(() => {
      showNarr(
        "See it like a scene in a movie... notice the details...",
        7000,
        "See it like a scene in a movie... notice the details..."
      );
    }, 10000));
    timers.push(setTimeout(() => setPhase("sud-initial"), 20000));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- INITIAL SUD ----
  const handleSudInitial = useCallback((rating: number) => {
    setSudStart(rating);
    if (rating > 6) {
      setPhase("grounding");
    } else {
      setRound(1);
      setPhase("processing");
    }
  }, []);

  // ---- GROUNDING ----
  const handleGroundingComplete = useCallback(() => {
    setPhase("centering");
  }, []);

  // ---- PROCESSING (eye movement sets) ----
  useEffect(() => {
    if (phase !== "processing") return;
    setBlsActive(true);
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(showNarr(
      "Hold the scene in mind... follow the dot...",
      5000,
      "Hold the scene in mind... follow the dot..."
    ));

    // 30-40 passes at ~0.3s half-cycle = ~18-24 seconds
    timers.push(setTimeout(() => {
      showNarr(
        "Keep following... let whatever comes up just be there...",
        5000,
        "Keep following... let whatever comes up... just be there..."
      );
    }, 8000));

    timers.push(setTimeout(() => {
      setBlsActive(false);
      setPhase("sensation-check");
    }, 20000));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SENSATION CHECK ----
  useEffect(() => {
    if (phase !== "sensation-check") return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(showNarr(
      "Where do you feel this in your body? Focus on that place...",
      7000,
      "Where do you feel this... in your body... focus on that place..."
    ));
    timers.push(setTimeout(() => setPhase("sensation-bls"), 9000));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SENSATION BLS ----
  useEffect(() => {
    if (phase !== "sensation-bls") return;
    setBlsActive(true);
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(showNarr(
      "Follow the dot... focus on the sensation... let it shift...",
      5000,
      "Follow the dot... focus on the sensation... let it shift..."
    ));

    timers.push(setTimeout(() => {
      setBlsActive(false);
      setPhase("vir-prompt");
    }, 14000));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- VOLUNTARY IMAGE REPLACEMENT ----
  useEffect(() => {
    if (phase !== "vir-prompt") return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(showNarr(
      "Now — replace that scene with any image you choose...",
      7000,
      "Now... replace that scene... with any image you choose..."
    ));
    timers.push(setTimeout(() => {
      showNarr(
        "It can be peaceful, funny, powerful — anything you want. Make the swap...",
        7000,
        "It can be peaceful... funny... powerful... anything you want. Make the swap..."
      );
    }, 9000));
    timers.push(setTimeout(() => setPhase("vir-bls"), 18000));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- VIR BLS (install the new image) ----
  useEffect(() => {
    if (phase !== "vir-bls") return;
    setBlsActive(true);
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(showNarr(
      "Hold the new image... follow the dot... let it settle in...",
      6000,
      "Hold the new image... follow the dot... let it settle in..."
    ));

    timers.push(setTimeout(() => {
      setBlsActive(false);
      setPhase("sud-recheck");
    }, 16000));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  // ---- SUD RECHECK ----
  useEffect(() => {
    if (phase !== "sud-recheck") return;
    setShowSudRecheck(true);
  }, [phase]);

  const handleSudRecheck = useCallback((rating: number) => {
    setShowSudRecheck(false);
    if (rating > 2 && round < MAX_ROUNDS) {
      // Another round
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

    timers.push(showNarr(
      "Scan your body from head to toe... notice what has shifted...",
      7000,
      "Scan your body from head to toe... notice what has shifted..."
    ));
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

    timers.push(showNarr(
      "Take a deep breath... notice how different the scene feels now...",
      8000,
      "Take a deep breath... notice how different the scene feels now..."
    ));
    timers.push(setTimeout(() => setShowSudFinal(true), 12000));

    return () => timers.forEach(clearTimeout);
  }, [phase, showNarr]);

  const handleSudFinal = useCallback((rating: number) => {
    audioRef.current?.fadeOut(8);
    onComplete({
      sudStart,
      sudEnd: rating,
      rounds: round,
    });
  }, [sudStart, round, onComplete]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* BLS dot — faster for ART */}
      {blsActive && (
        <div className="absolute top-[20%] w-full">
          <BilateralDot
            halfCycleSec={0.3}
            size={12}
            range={200}
            active={true}
            audio={audioRef.current}
            color="white"
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* DISCLAIMER */}
        {phase === "disclaimer" && (
          <motion.div
            key="art-disclaimer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-8 px-6 max-w-lg text-center"
          >
            <p className="narration-text text-xl text-[#e8e0d4]/80">
              This session uses techniques from Accelerated Resolution Therapy.
            </p>
            <p className="text-sm text-[#e8e0d4]/40 font-light leading-relaxed">
              Work with mildly stressful memories only. For trauma or highly
              distressing memories, please work with a trained ART clinician.
              You will not be asked to describe or share what you&apos;re processing.
            </p>
            <button
              onClick={handleDisclaimerAccept}
              className="px-8 py-3 border border-gold/25 rounded-full text-gold/60
                         hover:border-gold/45 hover:text-gold/80 transition-all duration-700 ui-text"
            >
              I understand
            </button>
          </motion.div>
        )}

        {/* GROUNDING */}
        {phase === "grounding" && (
          <motion.div key="art-grounding" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <GroundingExercise voice={voiceRef.current} onComplete={handleGroundingComplete} />
          </motion.div>
        )}

        {/* INITIAL SUD */}
        {phase === "sud-initial" && (
          <motion.div key="art-sud-init" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <SudCheck
              prompt="Rate the distress of this scene from 0 to 10..."
              onRate={handleSudInitial}
            />
          </motion.div>
        )}

        {/* NARRATION (for centering, scene-select, sensation, vir, body-scan, closing) */}
        {narration && !showSudRecheck && !showSudFinal && (
          <motion.div
            key={`art-narr-${phase}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <NarrationDisplay text={narration} size="large" />
          </motion.div>
        )}

        {/* SUD RECHECK */}
        {showSudRecheck && (
          <motion.div key="art-sud-re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <SudCheck prompt="What's the number now?" onRate={handleSudRecheck} />
          </motion.div>
        )}

        {/* FINAL SUD */}
        {showSudFinal && (
          <motion.div key="art-sud-final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <SudCheck prompt="How do you feel now?" onRate={handleSudFinal} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
