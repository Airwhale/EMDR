"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import NarrationDisplay from "../NarrationDisplay";
import { ExperimentResult } from "@/lib/sessionScript";

interface TimeDistortionProps {
  isActive: boolean;
  onComplete: (result: ExperimentResult) => void;
}

export default function TimeDistortion({ isActive, onComplete }: TimeDistortionProps) {
  const [phase, setPhase] = useState<"intro" | "waiting" | "result">("intro");
  const startTimeRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    setPhase("waiting");
  };

  const stopTimer = () => {
    const actualElapsed = (Date.now() - startTimeRef.current) / 1000;
    setElapsed(actualElapsed);
    setPhase("result");
  };

  const handleContinue = () => {
    const delta = Math.abs(elapsed - 60);

    onComplete({
      id: "time-distortion",
      title: "Time Distortion",
      response: `${elapsed.toFixed(1)} seconds (delta: ${delta.toFixed(1)}s)`,
      explanation:
        "In altered states of consciousness, the brain's internal clock becomes more flexible. Trance states often distort time perception — a common finding in hypnosis research. Most people in trance underestimate elapsed time.",
    });
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      {phase === "intro" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="flex flex-col items-center gap-8"
        >
          <NarrationDisplay text="Close your eyes for what feels like one minute. Open them when you think a minute has passed." />
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 1.5 }}
            onClick={startTimer}
            className="px-8 py-3 border border-gold/20 rounded-full text-gold/60
                       hover:border-gold/40 hover:text-gold/80 transition-all duration-700
                       ui-text"
          >
            Close my eyes now
          </motion.button>
        </motion.div>
      )}

      {phase === "waiting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "rgba(201, 169, 110, 0.15)" }}
          />
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 5, duration: 2 }}
            onClick={stopTimer}
            className="px-8 py-3 border border-gold/10 rounded-full text-gold/40
                       hover:border-gold/30 hover:text-gold/60 transition-all duration-700
                       ui-text"
          >
            I think a minute has passed
          </motion.button>
        </motion.div>
      )}

      {phase === "result" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="flex flex-col items-center gap-6"
        >
          <NarrationDisplay text="Interesting, isn't it? In trance, time becomes more flexible..." />
          <div className="flex flex-col items-center gap-2 mt-4">
            <span className="narration-text text-4xl text-gold/70">
              {elapsed.toFixed(1)}s
            </span>
            <span className="ui-text text-[#e8e0d4]/40">actual elapsed time</span>
            <span className="narration-text text-lg text-[#e8e0d4]/50 mt-2">
              {elapsed < 55
                ? "Time moved faster than you thought..."
                : elapsed > 65
                ? "Time stretched out for you..."
                : "Your sense of time was remarkably accurate."}
            </span>
          </div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1.5 }}
            onClick={handleContinue}
            className="mt-4 px-8 py-3 border border-gold/20 rounded-full text-gold/60
                       hover:border-gold/40 hover:text-gold/80 transition-all duration-700
                       ui-text"
          >
            Continue
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
