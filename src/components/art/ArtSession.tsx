"use client";

import { useState, useCallback, useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNarration } from "@/hooks/useNarration";
import BilateralDot from "../shared/BilateralDot";
import SudCheck from "../shared/SudCheck";
import GroundingExercise from "../shared/GroundingExercise";
import NarrationDisplay from "../NarrationDisplay";
import AdverseEventFlow from "../shared/AdverseEventFlow";
import { preloadAudioBatch, artAudio } from "@/lib/audioPreloader";
import { useWakeLock } from "@/lib/useWakeLock";

type ArtPhase =
  | "centering"
  | "scene-select"
  | "sud-initial"
  | "grounding"
  | "post-grounding"
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

// ── State machine ────────────────────────────────────────────────
interface ArtState {
  phase: ArtPhase;
  round: number;
  blsActive: boolean;
  showBlsContinue: boolean;
  showReady: boolean;
  readyTarget: ArtPhase | null;
  showSudRecheck: boolean;
  showSudFinal: boolean;
  groundingAttempted: boolean;
  showAdverseEvent: boolean;
}

type ArtAction =
  | { type: "GOTO_PHASE"; phase: ArtPhase }
  | { type: "SUD_INITIAL_RATED"; rating: number }
  | { type: "GROUNDING_COMPLETE" }
  | { type: "START_PROCESSING" }
  | { type: "NARRATION_DONE_SHOW_READY"; target: ArtPhase }
  | { type: "READY_CONFIRMED" }
  | { type: "START_BLS" }
  | { type: "SHOW_BLS_CONTINUE" }
  | { type: "BLS_CONTINUE"; nextPhase: ArtPhase }
  | { type: "SHOW_SUD_RECHECK" }
  | { type: "SUD_RECHECK_RATED"; rating: number }
  | { type: "SHOW_SUD_FINAL" };

const initialState: ArtState = {
  phase: "centering",
  round: 0,
  blsActive: false,
  showBlsContinue: false,
  showReady: false,
  readyTarget: null,
  showSudRecheck: false,
  showSudFinal: false,
  groundingAttempted: false,
  showAdverseEvent: false,
};

function artReducer(state: ArtState, action: ArtAction): ArtState {
  switch (action.type) {
    case "GOTO_PHASE":
      return { ...state, phase: action.phase, showReady: false, readyTarget: null };

    case "SUD_INITIAL_RATED": {
      const { rating } = action;
      // Maximum distress goes straight to the adverse event protocol —
      // never into an ordinary grounding loop
      if (rating >= 10) return { ...state, showAdverseEvent: true };
      if (rating > 5) {
        if (state.groundingAttempted) return { ...state, phase: "post-grounding" };
        return { ...state, phase: "grounding" };
      }
      return { ...state, round: 1, phase: "processing" };
    }

    case "GROUNDING_COMPLETE":
      return { ...state, groundingAttempted: true, phase: "sud-initial" };

    case "START_PROCESSING":
      return { ...state, round: 1, phase: "processing" };

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
      return { ...state, blsActive: false, showBlsContinue: false, phase: action.nextPhase };

    case "SHOW_SUD_RECHECK":
      return { ...state, showSudRecheck: true };

    case "SUD_RECHECK_RATED": {
      // Escalating to maximum distress mid-session means processing is
      // making things worse — stop and run the adverse event protocol
      // instead of looping into another round
      if (action.rating >= 10) return { ...state, showSudRecheck: false, showAdverseEvent: true };
      if (action.rating > 2) {
        return { ...state, showSudRecheck: false, round: state.round + 1, phase: "processing" };
      }
      return { ...state, showSudRecheck: false, phase: "body-scan" };
    }

    case "SHOW_SUD_FINAL":
      return { ...state, showSudFinal: true };

    default:
      return state;
  }
}

// ── Component ────────────────────────────────────────────────────
export default function ArtSession({ onComplete, onExit, binauralEnabled = true }: ArtSessionProps) {
  // Keep the screen awake — sessions are long and touch-free
  useWakeLock();

  const { narration, setNarration, say, delay, cancelVoice, audioRef, voiceRef, voiceAvailable } = useNarration({ mode: "art" });

  const [state, dispatch] = useReducer(artReducer, initialState);
  const { phase, round, blsActive, showBlsContinue, showReady, showSudRecheck, showSudFinal, showAdverseEvent } = state;

  const [sudStart, setSudStart] = useState<number | null>(null);

  // Start audio after hook initializes engine
  useEffect(() => {
    audioRef.current?.fadeIn(6, 0.5);
  }, [audioRef]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (binauralEnabled) {
      audioRef.current.fadeIn(2, 0.5);
    } else {
      audioRef.current.muteBinaural();
    }
  }, [binauralEnabled, audioRef]);

  // Preload the next phase's audio in the background
  useEffect(() => {
    const nextAudio: Record<string, readonly string[]> = {
      centering: artAudio.scene,
      "scene-select": artAudio.scene,
      "sud-initial": artAudio.processing,
      processing: artAudio.sensation,
      "sensation-check": artAudio.sensation,
      "sensation-bls": artAudio.vir,
      "vir-prompt": artAudio.vir,
      "vir-bls": artAudio.processing, // may loop back
      "sud-recheck": artAudio.bodyScan,
      "body-scan": artAudio.closing,
    };
    const files = nextAudio[phase];
    if (files) preloadAudioBatch(files);
  }, [phase]);

  // ── CENTERING ──
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
      dispatch({ type: "GOTO_PHASE", phase: "scene-select" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, delay, cancelVoice]);

  // ── SCENE SELECT ──
  useEffect(() => {
    if (phase !== "scene-select") return;
    let cancelled = false;
    const run = async () => {
      await say("Choose a specific moment...", "/audio/art/art-scene-01.mp3");
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;
      await say("See it like a movie scene...", "/audio/art/art-scene-02.mp3");
      if (cancelled) return;
      await delay(2000);
      if (cancelled) return;
      dispatch({ type: "GOTO_PHASE", phase: "sud-initial" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, delay, cancelVoice]);

  // ── INITIAL SUD ──
  const handleSudInitial = useCallback((rating: number) => {
    setSudStart(rating);
    setNarration(null);
    dispatch({ type: "SUD_INITIAL_RATED", rating });
  }, [setNarration]);

  const handleGroundingComplete = useCallback(() => {
    dispatch({ type: "GROUNDING_COMPLETE" });
    setSudStart(null);
  }, []);

  // ── PROCESSING ──
  useEffect(() => {
    if (phase !== "processing") return;

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
      setNarration(null);
      dispatch({ type: "START_BLS" });
    };
    run();

    const t = setTimeout(() => dispatch({ type: "SHOW_BLS_CONTINUE" }), ART_SET_DURATION);
    return () => { clearTimeout(t); cancelVoice(); };
  // round is read inside but we only want to re-run on phase change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── SENSATION CHECK ──
  useEffect(() => {
    if (phase !== "sensation-check") return;
    let cancelled = false;
    const run = async () => {
      await say("Where do you feel it in your body?", "/audio/art/art-sensation-01.mp3");
      if (cancelled) return;
      dispatch({ type: "NARRATION_DONE_SHOW_READY", target: "sensation-bls" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, cancelVoice]);

  // ── SENSATION BLS ──
  useEffect(() => {
    if (phase !== "sensation-bls") return;
    let cancelled = false;
    setNarration("Follow the dot... let it soften...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Follow the dot... let it soften...",
        { file: "/audio/art/art-sensation-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      dispatch({ type: "START_BLS" });
    };
    run();
    const t = setTimeout(() => dispatch({ type: "SHOW_BLS_CONTINUE" }), ART_SET_DURATION);
    return () => { cancelled = true; clearTimeout(t); cancelVoice(); };
  }, [phase, setNarration, cancelVoice, voiceRef]);

  // ── VOLUNTARY IMAGE REPLACEMENT prompt ──
  useEffect(() => {
    if (phase !== "vir-prompt") return;
    let cancelled = false;
    const run = async () => {
      await say("Create a new version of this moment...", "/audio/art/art-vir-01.mp3");
      if (cancelled) return;
      await delay(2500);
      if (cancelled) return;
      await say("Change what happens... make it yours...", "/audio/art/art-vir-02.mp3");
      if (cancelled) return;
      dispatch({ type: "NARRATION_DONE_SHOW_READY", target: "vir-bls" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, delay, cancelVoice]);

  // ── VIR BLS ──
  useEffect(() => {
    if (phase !== "vir-bls") return;
    let cancelled = false;
    setNarration("Hold the new scene... follow the dot...");
    const run = async () => {
      await voiceRef.current?.speakAsync(
        "Hold the new scene... follow the dot...",
        { file: "/audio/art/art-vir-bls.mp3" }
      );
      if (cancelled) return;
      setNarration(null);
      dispatch({ type: "START_BLS" });
    };
    run();
    const t = setTimeout(() => dispatch({ type: "SHOW_BLS_CONTINUE" }), ART_SET_DURATION);
    return () => { cancelled = true; clearTimeout(t); cancelVoice(); };
  }, [phase, setNarration, cancelVoice, voiceRef]);

  // ── SUD RECHECK ──
  useEffect(() => {
    if (phase !== "sud-recheck") return;
    dispatch({ type: "SHOW_SUD_RECHECK" });
  }, [phase]);

  // ── BODY SCAN ──
  useEffect(() => {
    if (phase !== "body-scan") return;
    let cancelled = false;
    const run = async () => {
      await say("Scan your body... notice what shifted...", "/audio/art/art-bodyscan-01.mp3");
      if (cancelled) return;
      await say("Observe without judgment...", "/audio/art/art-bodyscan-02.mp3");
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
      await say("Think back to the original memory...", "/audio/art/art-closing-01.mp3");
      if (cancelled) return;
      dispatch({ type: "SHOW_SUD_FINAL" });
    };
    run();
    return () => { cancelled = true; cancelVoice(); };
  }, [phase, say, cancelVoice]);

  const handleSudFinal = useCallback((rating: number) => {
    audioRef.current?.fadeOut(8);
    onComplete({ sudStart, sudEnd: rating, rounds: round });
  }, [sudStart, round, onComplete, audioRef]);

  const blsContinueHandler = useCallback(() => {
    if (phase === "processing") dispatch({ type: "BLS_CONTINUE", nextPhase: "sensation-check" });
    else if (phase === "sensation-bls") dispatch({ type: "BLS_CONTINUE", nextPhase: "vir-prompt" });
    else if (phase === "vir-bls") dispatch({ type: "BLS_CONTINUE", nextPhase: "sud-recheck" });
  }, [phase]);

  // The adverse-event protocol takes over the screen — fade out the
  // binaural/pink-noise bed so it doesn't keep droning under the crisis
  // resources. (The voice object stays alive; the flow narrates with it.)
  useEffect(() => {
    if (showAdverseEvent) audioRef.current?.stop();
  }, [showAdverseEvent]);

  if (showAdverseEvent) {
    return <AdverseEventFlow voice={voiceRef.current} onComplete={() => onExit?.()} />;
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {blsActive && (
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

        {phase === "post-grounding" && (
          <motion.div key="art-post-grounding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 text-center max-w-md">
            <p className="narration-text text-xl text-[#e8e0d4]/70">
              It&apos;s okay to feel what you&apos;re feeling. There&apos;s no rush, and no wrong choice here. You can continue when you&apos;re ready, or step away for now.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => dispatch({ type: "START_PROCESSING" })}
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

        {phase === "sud-initial" && (
          <motion.div key="art-sud-init" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <SudCheck prompt="Rate the distress of this scene from 0 to 10..." onRate={handleSudInitial} />
          </motion.div>
        )}

        {narration && !showSudRecheck && !showSudFinal && !blsActive && (
          <motion.div key={`art-narr-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
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

        {showSudRecheck && (
          <motion.div key="art-sud-re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <SudCheck prompt="What's the number now?" onRate={(rating) => dispatch({ type: "SUD_RECHECK_RATED", rating })} />
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
