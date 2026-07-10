"use client";

import { useState, useCallback, useEffect, useReducer, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNarration } from "@/hooks/useNarration";
import BilateralDot from "../shared/BilateralDot";
import SudCheck from "../shared/SudCheck";
import GroundingExercise from "../shared/GroundingExercise";
import NarrationDisplay from "../NarrationDisplay";
import AdverseEventFlow from "../shared/AdverseEventFlow";
import ButterflyHug from "./ButterflyHug";
import { preloadAudioBatch, emdrAudio } from "@/lib/audioPreloader";
import { useWakeLock } from "@/lib/useWakeLock";

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
  | "post-grounding"
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

// ── State machine ────────────────────────────────────────────────
interface EmdrState {
  phase: EmdrPhase;
  blsActive: boolean;
  showReady: boolean;
  readyTarget: EmdrPhase | null;
  showBlsContinue: boolean;
  groundingAttempted: boolean;
  showAdverseEvent: boolean;
  exercises: string[];
}

type EmdrAction =
  | { type: "GOTO_PHASE"; phase: EmdrPhase }
  | { type: "SUD_RATED"; rating: number }
  | { type: "GROUNDING_COMPLETE" }
  | { type: "NARRATION_DONE_SHOW_READY"; target: EmdrPhase }
  | { type: "READY_CONFIRMED" }
  | { type: "START_BLS" }
  | { type: "SHOW_BLS_CONTINUE" }
  | { type: "BLS_CONTINUE"; exercise: string; nextPhase: EmdrPhase }
  | { type: "BUTTERFLY_COMPLETE" };

const initialState: EmdrState = {
  phase: "sud-check",
  blsActive: false,
  showReady: false,
  readyTarget: null,
  showBlsContinue: false,
  groundingAttempted: false,
  showAdverseEvent: false,
  exercises: [],
};

function emdrReducer(state: EmdrState, action: EmdrAction): EmdrState {
  switch (action.type) {
    case "GOTO_PHASE":
      return { ...state, phase: action.phase, showReady: false, readyTarget: null };

    case "SUD_RATED": {
      const { rating } = action;
      // Maximum distress goes straight to the adverse event protocol —
      // never into an ordinary grounding loop
      if (rating >= 10) return { ...state, showAdverseEvent: true };
      if (rating > 5) {
        if (state.groundingAttempted) return { ...state, phase: "post-grounding" };
        return { ...state, phase: "grounding" };
      }
      return { ...state, phase: "centering" };
    }

    case "GROUNDING_COMPLETE":
      return { ...state, groundingAttempted: true, phase: "sud-check" };

    case "NARRATION_DONE_SHOW_READY":
      return { ...state, showReady: true, readyTarget: action.target };

    case "READY_CONFIRMED":
      if (!state.readyTarget) return state;
      return { ...state, phase: state.readyTarget, showReady: false, readyTarget: null, showBlsContinue: false };

    case "START_BLS":
      return { ...state, blsActive: true };

    case "SHOW_BLS_CONTINUE":
      return { ...state, showBlsContinue: true };

    case "BLS_CONTINUE":
      return {
        ...state,
        blsActive: false,
        showBlsContinue: false,
        exercises: [...state.exercises, action.exercise],
        phase: action.nextPhase,
      };

    case "BUTTERFLY_COMPLETE":
      return { ...state, exercises: [...state.exercises, "Butterfly Hug"], phase: "container" };

    default:
      return state;
  }
}

// ── Component ────────────────────────────────────────────────────
export default function EmdrSession({ onComplete, onExit, binauralEnabled = true }: EmdrSessionProps) {
  // Keep the screen awake — sessions are long and touch-free
  useWakeLock();

  const { narration, setNarration, say, delay, cancelVoice, audioRef, voiceRef, voiceAvailable } = useNarration({ mode: "emdr" });

  const [state, dispatch] = useReducer(emdrReducer, initialState);
  const { phase, blsActive, showReady, showBlsContinue, showAdverseEvent, exercises } = state;

  const [sudStart, setSudStart] = useState<number | null>(null);
  const [sudEnd, setSudEnd] = useState<number | null>(null);

  // Start audio after hook initializes engine
  useEffect(() => {
    audioRef.current?.fadeIn(8, 0.5);
  }, [audioRef]);

  const binauralFirstRun = useRef(true);
  useEffect(() => {
    if (!audioRef.current) return;
    // Skip on mount: the init effect already started the designed slow
    // fade-in — re-fading here would cut it to a 2s ramp. Only mute if
    // binaural is off from the start.
    if (binauralFirstRun.current) {
      binauralFirstRun.current = false;
      if (!binauralEnabled) audioRef.current.muteBinaural();
      return;
    }
    if (binauralEnabled) {
      audioRef.current.fadeIn(2, 0.5);
    } else {
      audioRef.current.muteBinaural();
    }
  }, [binauralEnabled, audioRef]);

  // Preload the next phase's audio in the background
  useEffect(() => {
    const nextAudio: Record<string, readonly string[]> = {
      "sud-check": emdrAudio.centering,
      centering: emdrAudio.safePlace,
      "safe-place": emdrAudio.safePlace,
      "safe-place-bls": emdrAudio.butterfly,
      "butterfly-hug": emdrAudio.container,
      container: emdrAudio.container,
      "container-bls": emdrAudio.resource,
      resource: emdrAudio.resource,
      "resource-bls": emdrAudio.bodyScan,
      "body-scan": emdrAudio.closing,
    };
    const files = nextAudio[phase];
    if (files) preloadAudioBatch(files);
  }, [phase]);

  // ── SUD CHECK (initial) ──
  const handleSudStart = useCallback((rating: number) => {
    setSudStart(rating);
    dispatch({ type: "SUD_RATED", rating });
  }, []);

  // ── CENTERING ──
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
      dispatch({ type: "GOTO_PHASE", phase: "safe-place" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, delay, cancelVoice]);

  // ── SAFE PLACE ──
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
      dispatch({ type: "NARRATION_DONE_SHOW_READY", target: "safe-place-bls" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, delay, cancelVoice]);

  // ── SAFE PLACE BLS ──
  useEffect(() => {
    if (phase !== "safe-place-bls") return;
    let cancelled = false;
    setNarration("Follow the dot... hold your safe place...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Follow the dot... hold your safe place...",
        { file: "/audio/emdr/emdr-safeplace-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      dispatch({ type: "START_BLS" });
    };
    run();
    const t = setTimeout(() => dispatch({ type: "SHOW_BLS_CONTINUE" }), 25000);
    return () => { cancelled = true; clearTimeout(t); cancelVoice(); };
  }, [phase, setNarration, cancelVoice, voiceRef]);

  // ── BUTTERFLY HUG ──
  const handleButterflyComplete = useCallback(() => {
    dispatch({ type: "BUTTERFLY_COMPLETE" });
  }, []);

  // ── CONTAINER ──
  useEffect(() => {
    if (phase !== "container") return;
    let cancelled = false;
    const run = async () => {
      await delay(800);
      if (cancelled) return;
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
      dispatch({ type: "NARRATION_DONE_SHOW_READY", target: "container-bls" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, delay, cancelVoice]);

  // ── CONTAINER BLS ──
  useEffect(() => {
    if (phase !== "container-bls") return;
    let cancelled = false;
    setNarration("Follow the dot... feel it sealing...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Follow the dot... feel it sealing...",
        { file: "/audio/emdr/emdr-container-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      dispatch({ type: "START_BLS" });
    };
    run();
    const t = setTimeout(() => dispatch({ type: "SHOW_BLS_CONTINUE" }), 20000);
    return () => { cancelled = true; clearTimeout(t); cancelVoice(); };
  }, [phase, setNarration, cancelVoice, voiceRef]);

  // ── RESOURCE INSTALLATION ──
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
      dispatch({ type: "NARRATION_DONE_SHOW_READY", target: "resource-bls" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, delay, cancelVoice]);

  // ── RESOURCE BLS ──
  useEffect(() => {
    if (phase !== "resource-bls") return;
    let cancelled = false;
    setNarration("Follow the dot... strengthen this feeling...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Follow the dot... strengthen this feeling...",
        { file: "/audio/emdr/emdr-resource-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      dispatch({ type: "START_BLS" });
    };
    run();
    const t = setTimeout(() => dispatch({ type: "SHOW_BLS_CONTINUE" }), 30000);
    return () => { cancelled = true; clearTimeout(t); cancelVoice(); };
  }, [phase, setNarration, cancelVoice, voiceRef]);

  // ── BODY SCAN ──
  useEffect(() => {
    if (phase !== "body-scan") return;
    let cancelled = false;
    const run = async () => {
      await say("Scan your body... notice how you feel...", "/audio/emdr/emdr-bodyscan-01.mp3");
      if (cancelled) return;
      await say("Observe without judgment...", "/audio/emdr/emdr-bodyscan-02.mp3");
      if (cancelled) return;
      dispatch({ type: "GOTO_PHASE", phase: "closing" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, cancelVoice]);

  // ── CLOSING ──
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
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, setNarration, cancelVoice]);

  const handleSudEnd = useCallback((rating: number) => {
    setSudEnd(rating);
    audioRef.current?.fadeOut(8);
    onComplete({ sudStart, sudEnd: rating, exercisesCompleted: exercises });
  }, [sudStart, exercises, onComplete, audioRef]);

  const handleGroundingComplete = useCallback(() => {
    dispatch({ type: "GROUNDING_COMPLETE" });
    setSudStart(null);
  }, []);

  const blsContinueHandler = useCallback(() => {
    if (phase === "safe-place-bls") dispatch({ type: "BLS_CONTINUE", exercise: "Safe Place", nextPhase: "butterfly-hug" });
    else if (phase === "container-bls") dispatch({ type: "BLS_CONTINUE", exercise: "Container", nextPhase: "resource" });
    else if (phase === "resource-bls") dispatch({ type: "BLS_CONTINUE", exercise: "Resource Installation", nextPhase: "body-scan" });
  }, [phase]);

  // The adverse-event protocol takes over the screen — fade out the
  // binaural/pink-noise bed so it doesn't keep droning under the crisis
  // resources. (The voice object stays alive; the flow narrates with it.)
  useEffect(() => {
    if (showAdverseEvent) audioRef.current?.stop();
  }, [showAdverseEvent, audioRef]);

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
                     hover:text-[#e8e0d4]/80 transition-colors duration-300 p-3 -m-3"
        >
          ← exit
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {phase === "sud-check" && sudStart === null && (
          <motion.div key="sud-start" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <SudCheck prompt="Before we begin, how much distress are you feeling right now?" onRate={handleSudStart} />
          </motion.div>
        )}

        {phase === "grounding" && (
          <motion.div key="grounding" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <GroundingExercise voice={voiceRef.current} onComplete={handleGroundingComplete} />
          </motion.div>
        )}

        {phase === "post-grounding" && (
          <motion.div key="post-grounding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 text-center max-w-md">
            <p className="narration-text text-xl text-[#e8e0d4]/70">
              It&apos;s okay to feel what you&apos;re feeling. There&apos;s no rush, and no wrong choice here. You can continue when you&apos;re ready, or step away for now.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => dispatch({ type: "GOTO_PHASE", phase: "centering" })}
                className="px-6 py-3 border border-gold/45 rounded-full text-gold/85
                           hover:border-gold/75 hover:text-gold transition-all duration-700 ui-text"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  audioRef.current?.fadeOut(3);
                  setTimeout(() => audioRef.current?.stop(), 3500);
                  voiceRef.current?.stop();
                  onExit?.();
                }}
                className="px-6 py-3 border border-[#e8e0d4]/20 rounded-full text-[#e8e0d4]/55
                           hover:border-[#e8e0d4]/35 hover:text-[#e8e0d4]/80 transition-all duration-700 ui-text"
              >
                Exit
              </button>
            </div>
            <p className="text-[11px] text-[#e8e0d4]/35 font-light leading-relaxed max-w-xs">
              If you&apos;re feeling overwhelmed, support is available anytime: call or text{" "}
              <span className="text-gold/60">988</span>, or text{" "}
              <span className="text-gold/60">HOME</span> to <span className="text-gold/60">741741</span>.
            </p>
          </motion.div>
        )}

        {!["sud-check", "grounding", "post-grounding", "butterfly-hug"].includes(phase) &&
          sudEnd === null && narration && !blsActive && (
          <motion.div key={`narr-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
            className="flex flex-col items-center gap-6">
            <NarrationDisplay text={narration} size="large" />
            {showReady && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                onClick={() => dispatch({ type: "READY_CONFIRMED" })}
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
