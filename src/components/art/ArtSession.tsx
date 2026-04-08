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
  binauralEnabled?: boolean;
}

export interface ArtSummaryData {
  sudStart: number | null;
  sudEnd: number | null;
  rounds: number;
}

// ART uses ~40 passes per set at 0.35s half-cycle ≈ 28s minimum
// Add buffer so user has time to settle — 35s before continue appears
const ART_SET_DURATION = 35000;

// Small pause between sequential narration cues (ms)
const CUE_PAUSE = 600;
// Minimum time any narration cue stays visible, even if audio is shorter
const MIN_CUE_DISPLAY = 3000;

export default function ArtSession({ onComplete, onExit, binauralEnabled = true }: ArtSessionProps) {
  const [phase, setPhase] = useState<ArtPhase>("centering");
  const [narration, setNarration] = useState<string | null>(null);
  const [sudStart, setSudStart] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [blsActive, setBlsActive] = useState(false);
  const [showBlsContinue, setShowBlsContinue] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [readyTarget, setReadyTarget] = useState<ArtPhase | null>(null);
  const [showSudRecheck, setShowSudRecheck] = useState(false);
  const [showSudFinal, setShowSudFinal] = useState(false);
  const [groundingAttempted, setGroundingAttempted] = useState(false);
  const [showAdverseEvent, setShowAdverseEvent] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);

  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("art");
    audio.fadeIn(6, 0.5);
    if (!binauralEnabled) audio.muteBinaural();
    audioRef.current = audio;

    const voice = new TranceVoice();
    voice.init();
    voiceRef.current = voice;
    setVoiceAvailable(voice.isSupported());

    return () => { audio.stop(); voice.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const elapsed = Date.now() - start;
    const remaining = Math.max(CUE_PAUSE, MIN_CUE_DISPLAY - elapsed);
    await delay(remaining);
  }, []);

  // ---- CENTERING ----
  useEffect(() => {
    if (phase !== "centering") return;
    let cancelled = false;
    const run = async () => {
      await delay(1500);
      if (cancelled) return;
      await say("Take a deep breath...", "/audio/art/art-centering-01.mp3");
      if (cancelled) return;
      await say("Let your body relax...", "/audio/art/art-centering-02.mp3");
      if (cancelled) return;
      setPhase("scene-select");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- SCENE SELECT ----
  useEffect(() => {
    if (phase !== "scene-select") return;
    let cancelled = false;
    const run = async () => {
      await say(
        "Choose a specific moment...",
        "/audio/art/art-scene-01.mp3"
      );
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;
      await say(
        "See it like a movie scene...",
        "/audio/art/art-scene-02.mp3"
      );
      if (cancelled) return;
      await delay(2000);
      if (cancelled) return;
      setPhase("sud-initial");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- INITIAL SUD ----
  const handleSudInitial = useCallback((rating: number) => {
    setSudStart(rating);
    if (rating > 6) {
      if (groundingAttempted && rating >= 9) {
        setShowAdverseEvent(true);
        return;
      }
      setPhase("grounding");
    } else {
      setRound(1);
      setPhase("processing");
    }
  }, [groundingAttempted]);

  const handleReady = useCallback(() => {
    if (readyTarget) {
      setShowReady(false);
      setPhase(readyTarget);
      setReadyTarget(null);
    }
  }, [readyTarget]);

  const handleGroundingComplete = useCallback(() => {
    setGroundingAttempted(true);
    setPhase("sud-initial");
    setSudStart(null);
  }, []);

  // ---- PROCESSING ----
  useEffect(() => {
    if (phase !== "processing") return;
    setShowBlsContinue(false);

    const run = async () => {
      if (round > 1) {
        setNarration("Bring the original scene back...");
        await voiceRef.current?.speakAsync(
          "Bring the original scene back to mind...",
          { file: "/audio/art/art-processing-return-01.mp3" }
        );
        await voiceRef.current?.speakAsync("Follow the dot...", { file: "/audio/art/art-processing-return-02.mp3" });
      } else {
        setNarration("Hold the scene... follow the dot...");
        await voiceRef.current?.speakAsync(
          "Hold the scene... follow the dot...",
          { file: "/audio/art/art-processing-01.mp3" }
        );
        await voiceRef.current?.speakAsync("Keep following...", { file: "/audio/art/art-processing-02.mp3" });
      }
      // Voice done — now start the dot
      setNarration(null);
      setBlsActive(true);
    };
    run();

    const t = setTimeout(() => setShowBlsContinue(true), ART_SET_DURATION);
    return () => { clearTimeout(t); voiceRef.current?.cancel(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleProcessingContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setPhase("sensation-check");
  }, []);

  // ---- SENSATION CHECK ----
  useEffect(() => {
    if (phase !== "sensation-check") return;
    let cancelled = false;
    const run = async () => {
      await say(
        "Where do you feel it in your body?",
        "/audio/art/art-sensation-01.mp3"
      );
      if (cancelled) return;
      setShowReady(true);
      setReadyTarget("sensation-bls");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- SENSATION BLS ----
  useEffect(() => {
    if (phase !== "sensation-bls") return;
    let cancelled = false;
    setShowBlsContinue(false);
    setNarration("Follow the dot... let it soften...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Follow the dot... let it soften...",
        { file: "/audio/art/art-sensation-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      setBlsActive(true);
    };
    run();
    const t = setTimeout(() => setShowBlsContinue(true), ART_SET_DURATION);
    return () => { cancelled = true; clearTimeout(t); voiceRef.current?.cancel(); };
  }, [phase]);

  const handleSensationContinue = useCallback(() => {
    setBlsActive(false);
    setShowBlsContinue(false);
    setPhase("vir-prompt");
  }, []);

  // ---- VOLUNTARY IMAGE REPLACEMENT prompt ----
  useEffect(() => {
    if (phase !== "vir-prompt") return;
    let cancelled = false;
    const run = async () => {
      await say(
        "Create a new version of this moment...",
        "/audio/art/art-vir-01.mp3"
      );
      if (cancelled) return;
      await delay(2500);
      if (cancelled) return;
      await say(
        "Change what happens... make it yours...",
        "/audio/art/art-vir-02.mp3"
      );
      if (cancelled) return;
      setShowReady(true);
      setReadyTarget("vir-bls");
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  // ---- VIR BLS ----
  useEffect(() => {
    if (phase !== "vir-bls") return;
    let cancelled = false;
    setShowBlsContinue(false);
    setNarration("Hold the new scene... follow the dot...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Hold the new scene... follow the dot...",
        { file: "/audio/art/art-vir-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      setBlsActive(true);
    };
    run();
    const t = setTimeout(() => setShowBlsContinue(true), ART_SET_DURATION);
    return () => { cancelled = true; clearTimeout(t); voiceRef.current?.cancel(); };
  }, [phase]);

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
    if (rating > 2) {
      setRound((r) => r + 1);
      setPhase("processing");
    } else {
      setPhase("body-scan");
    }
  }, []);

  // ---- BODY SCAN ----
  useEffect(() => {
    if (phase !== "body-scan") return;
    let cancelled = false;
    const run = async () => {
      await say("Scan your body... notice what shifted...", "/audio/art/art-bodyscan-01.mp3");
      if (cancelled) return;
      await say("Observe without judgment...", "/audio/art/art-bodyscan-02.mp3");
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
      await say(
        "Think back to the original memory...",
        "/audio/art/art-closing-01.mp3"
      );
      if (cancelled) return;
      setShowSudFinal(true);
    };
    run();
    return () => { cancelled = true; voiceRef.current?.cancel(); };
  }, [phase, say]);

  const handleSudFinal = useCallback((rating: number) => {
    audioRef.current?.fadeOut(8);
    onComplete({ sudStart, sudEnd: rating, rounds: round });
  }, [sudStart, round, onComplete]);

  const blsContinueHandler =
    phase === "processing" ? handleProcessingContinue
    : phase === "sensation-bls" ? handleSensationContinue
    : phase === "vir-bls" ? handleVirContinue
    : undefined;

  const isBls = blsActive;

  if (showAdverseEvent) {
    return <AdverseEventFlow voice={voiceRef.current} onComplete={() => onExit?.()} />;
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
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

      {onExit && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 0.9 }}
          transition={{ duration: 0.8 }}
          onClick={() => {
            audioRef.current?.fadeOut(3);
            setTimeout(() => audioRef.current?.stop(), 3500);
            voiceRef.current?.stop();
            onExit();
          }}
          className="fixed top-4 left-4 z-50 ui-text text-[11px] text-[#e8e0d4]/50
                     hover:text-[#e8e0d4]/80 transition-colors duration-300"
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

        {narration && !showSudRecheck && !showSudFinal && !isBls && (
          <motion.div key={`art-narr-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
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
