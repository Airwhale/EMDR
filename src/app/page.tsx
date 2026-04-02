"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import { sessionScript, PhaseId, ExperimentResult } from "@/lib/sessionScript";
import { useSessionTimer } from "@/lib/useSessionTimer";
import BreathingGuide from "@/components/BreathingGuide";
import NarrationDisplay from "@/components/NarrationDisplay";
import Staircase from "@/components/Staircase";
import EmergenceSequence from "@/components/EmergenceSequence";
import SessionSummary from "@/components/SessionSummary";
import ArmLevitation from "@/components/experiments/ArmLevitation";
import TimeDistortion from "@/components/experiments/TimeDistortion";
import SensoryAmplification from "@/components/experiments/SensoryAmplification";
import ChevreuPendulum from "@/components/experiments/ChevreuPendulum";

type ExperimentId = "arm" | "time" | "sensory" | "pendulum";
const EXPERIMENT_ORDER: ExperimentId[] = ["arm", "time", "sensory", "pendulum"];

export default function TranceExperience() {
  const [phase, setPhase] = useState<PhaseId>("entry");
  const [showReady, setShowReady] = useState(false);
  const [entryTextVisible, setEntryTextVisible] = useState(false);
  const [currentNarration, setCurrentNarration] = useState<string | null>(null);
  const [experimentIndex, setExperimentIndex] = useState(0);
  const [results, setResults] = useState<ExperimentResult[]>([]);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const { scheduleCues } = useSessionTimer();

  // Background color evolution
  const bgColors: Record<string, string> = {
    entry: "#0a0a0f",
    fixation: "#0a0a14",
    deepening: "#0d0a18",
    staircase: "#08081a",
    experiments: "#0a0a12",
    emergence: "#0f0f18",
    summary: "#0a0a0f",
  };

  // ---- PHASE HANDLERS ----

  // Entry: show text after 3s, button after 8s
  useEffect(() => {
    if (phase !== "entry") return;
    const t1 = setTimeout(() => setEntryTextVisible(true), 3000);
    const t2 = setTimeout(() => setShowReady(true), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  const handleReady = useCallback(() => {
    const audio = new TranceAudioEngine();
    audio.init();
    audio.fadeIn(20);
    audioRef.current = audio;
    setPhase("fixation");
  }, []);

  // Fixation phase
  useEffect(() => {
    if (phase !== "fixation") return;

    const script = sessionScript.find((p) => p.id === "fixation")!;
    scheduleCues(script.narration, () => {
      setCurrentNarration(null);
      setPhase("deepening");
    });

    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    script.narration.forEach((cue) => {
      cumulative += cue.delay;
      const show = cumulative;
      const hide = show + cue.duration;
      timers.push(setTimeout(() => setCurrentNarration(cue.text), show));
      timers.push(setTimeout(() => setCurrentNarration(null), hide));
      cumulative = hide;
    });

    timers.push(setTimeout(() => setPhase("deepening"), cumulative + 2000));

    return () => timers.forEach(clearTimeout);
  }, [phase, scheduleCues]);

  // Deepening phase
  useEffect(() => {
    if (phase !== "deepening") return;

    audioRef.current?.setDepth(0.4);

    const script = sessionScript.find((p) => p.id === "deepening")!;
    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    script.narration.forEach((cue) => {
      cumulative += cue.delay;
      const show = cumulative;
      const hide = show + cue.duration;
      timers.push(setTimeout(() => setCurrentNarration(cue.text), show));
      timers.push(setTimeout(() => setCurrentNarration(null), hide));
      cumulative = hide;
    });

    timers.push(
      setTimeout(() => {
        setCurrentNarration(null);
        setPhase("staircase");
      }, cumulative + 2000)
    );

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Staircase handlers
  const handleStaircaseStep = useCallback((step: number) => {
    const pitchOffset = (10 - step) * 2;
    audioRef.current?.shiftPitch(100 - pitchOffset, 3);
    audioRef.current?.setDepth(0.4 + (10 - step) * 0.06);
  }, []);

  const handleStaircaseComplete = useCallback(() => {
    setPhase("experiments");
  }, []);

  // Staircase narration
  useEffect(() => {
    if (phase !== "staircase") return;

    audioRef.current?.setDepth(0.5);

    const script = sessionScript.find((p) => p.id === "staircase")!;
    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    script.narration.forEach((cue) => {
      cumulative += cue.delay;
      const show = cumulative;
      const hide = show + cue.duration;
      timers.push(setTimeout(() => setCurrentNarration(cue.text), show));
      timers.push(setTimeout(() => setCurrentNarration(null), hide));
      cumulative = hide;
    });

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Experiments intro narration
  useEffect(() => {
    if (phase !== "experiments") return;

    const script = sessionScript.find((p) => p.id === "experiments")!;
    if (script.narration.length > 0) {
      const cue = script.narration[0];
      const t1 = setTimeout(() => setCurrentNarration(cue.text), cue.delay);
      const t2 = setTimeout(
        () => setCurrentNarration(null),
        cue.delay + cue.duration
      );
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [phase]);

  const handleExperimentComplete = useCallback(
    (result: ExperimentResult) => {
      setResults((prev) => [...prev, result]);
      const nextIdx = experimentIndex + 1;
      if (nextIdx >= EXPERIMENT_ORDER.length) {
        setPhase("emergence");
      } else {
        setExperimentIndex(nextIdx);
      }
    },
    [experimentIndex]
  );

  // Emergence
  const handleEmergenceStep = useCallback((step: number) => {
    audioRef.current?.shiftPitch(80 + step * 8, 3);
  }, []);

  const handleEmergenceComplete = useCallback(() => {
    audioRef.current?.fadeOut(10);
    setTimeout(() => {
      audioRef.current?.stop();
    }, 11000);
    setPhase("summary");
  }, []);

  // Skip to playground
  const handleSkip = useCallback(() => {
    if (!audioRef.current) {
      const audio = new TranceAudioEngine();
      audio.init();
      audio.fadeIn(5);
      audioRef.current = audio;
    }
    setPhase("experiments");
  }, []);

  const currentExperiment = EXPERIMENT_ORDER[experimentIndex];

  return (
    <main
      className="relative w-screen h-screen flex items-center justify-center overflow-hidden transition-colors duration-[5000ms]"
      style={{ backgroundColor: bgColors[phase] || "#0a0a0f" }}
    >
      {/* =================== ENTRY =================== */}
      <AnimatePresence mode="wait">
        {phase === "entry" && (
          <motion.div
            key="entry"
            className="flex flex-col items-center gap-12"
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {/* Breathing dot */}
            <motion.div
              className="rounded-full"
              style={{
                width: 12,
                height: 12,
                background:
                  "radial-gradient(circle, rgba(201, 169, 110, 0.8), rgba(201, 169, 110, 0.1))",
                boxShadow: "0 0 30px rgba(201, 169, 110, 0.2)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Entry text */}
            <AnimatePresence>
              {entryTextVisible && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ duration: 3 }}
                  className="narration-text text-xl md:text-2xl text-center max-w-lg text-[#e8e0d4]/70"
                >
                  Find a comfortable position. This session works best with
                  headphones.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Ready button */}
            <AnimatePresence>
              {showReady && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2 }}
                  onClick={handleReady}
                  className="px-10 py-4 border border-gold/30 rounded-full text-gold/70
                             hover:border-gold/50 hover:text-gold transition-all duration-1000
                             ui-text tracking-widest"
                >
                  I&apos;m ready
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =================== FIXATION =================== */}
        {phase === "fixation" && (
          <motion.div
            key="fixation"
            className="flex flex-col items-center gap-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
          >
            <BreathingGuide isActive={true} size="full" showSpiral={true} />
            <NarrationDisplay text={currentNarration} />
          </motion.div>
        )}

        {/* =================== DEEPENING =================== */}
        {phase === "deepening" && (
          <motion.div
            key="deepening"
            className="flex flex-col items-center w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
          >
            <div className="absolute top-12">
              <BreathingGuide isActive={true} size="small" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <NarrationDisplay text={currentNarration} size="large" />
            </div>
          </motion.div>
        )}

        {/* =================== STAIRCASE =================== */}
        {phase === "staircase" && (
          <motion.div
            key="staircase"
            className="w-full h-full flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
          >
            <div className="absolute top-12">
              <BreathingGuide isActive={true} size="small" />
            </div>
            <div className="absolute top-32 z-10">
              <NarrationDisplay text={currentNarration} />
            </div>
            <Staircase
              isActive={true}
              onComplete={handleStaircaseComplete}
              onStep={handleStaircaseStep}
            />
          </motion.div>
        )}

        {/* =================== EXPERIMENTS =================== */}
        {phase === "experiments" && (
          <motion.div
            key="experiments"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {currentNarration && experimentIndex === 0 && (
              <div className="absolute top-1/3 left-0 right-0 z-10">
                <NarrationDisplay text={currentNarration} size="large" />
              </div>
            )}

            <AnimatePresence mode="wait">
              {currentExperiment === "arm" && (
                <motion.div
                  key="arm"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  <ArmLevitation
                    isActive={true}
                    onComplete={handleExperimentComplete}
                  />
                </motion.div>
              )}
              {currentExperiment === "time" && (
                <motion.div
                  key="time"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  <TimeDistortion
                    isActive={true}
                    onComplete={handleExperimentComplete}
                  />
                </motion.div>
              )}
              {currentExperiment === "sensory" && (
                <motion.div
                  key="sensory"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  <SensoryAmplification
                    isActive={true}
                    onComplete={handleExperimentComplete}
                  />
                </motion.div>
              )}
              {currentExperiment === "pendulum" && (
                <motion.div
                  key="pendulum"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  <ChevreuPendulum
                    isActive={true}
                    onComplete={handleExperimentComplete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =================== EMERGENCE =================== */}
        {phase === "emergence" && (
          <motion.div
            key="emergence"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <EmergenceSequence
              isActive={true}
              onComplete={handleEmergenceComplete}
              onStep={handleEmergenceStep}
            />
          </motion.div>
        )}

        {/* =================== SUMMARY =================== */}
        {phase === "summary" && (
          <motion.div
            key="summary"
            className="w-full h-full overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }}
          >
            <SessionSummary results={results} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip to playground */}
      {phase !== "experiments" &&
        phase !== "emergence" &&
        phase !== "summary" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            whileHover={{ opacity: 0.4 }}
            transition={{ duration: 1 }}
            onClick={handleSkip}
            className="fixed bottom-4 right-4 ui-text text-[10px] text-[#e8e0d4]/30
                       hover:text-[#e8e0d4]/50 transition-colors duration-500 z-50"
          >
            skip to playground →
          </motion.button>
        )}
    </main>
  );
}
