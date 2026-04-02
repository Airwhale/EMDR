"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { emergenceNarration } from "@/lib/sessionScript";
import NarrationDisplay from "./NarrationDisplay";

interface EmergenceSequenceProps {
  isActive: boolean;
  onComplete: () => void;
  onStep?: (step: number) => void;
}

export default function EmergenceSequence({
  isActive,
  onComplete,
  onStep,
}: EmergenceSequenceProps) {
  const [currentCue, setCurrentCue] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);

  const runEmergence = useCallback(() => {
    let cumulativeDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    emergenceNarration.forEach((cue, index) => {
      cumulativeDelay += cue.delay;
      const showTime = cumulativeDelay;
      const hideTime = showTime + cue.duration;

      timers.push(
        setTimeout(() => {
          setCurrentCue(cue.text);
          setBrightness((index + 1) / emergenceNarration.length);
          onStep?.(index + 1);
        }, showTime)
      );

      timers.push(
        setTimeout(() => {
          setCurrentCue(null);
        }, hideTime)
      );

      cumulativeDelay = hideTime;
    });

    timers.push(
      setTimeout(() => {
        onComplete();
      }, cumulativeDelay + 3000)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete, onStep]);

  useEffect(() => {
    if (!isActive) return;

    // Wait for initial narration
    const startTimer = setTimeout(() => {
      return runEmergence();
    }, 12000);

    return () => clearTimeout(startTimer);
  }, [isActive, runEmergence]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Brightening overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundColor: `rgba(30, 30, 50, ${brightness * 0.15})`,
        }}
        transition={{ duration: 3 }}
      />

      <AnimatePresence mode="wait">
        {currentCue && (
          <motion.div
            key={currentCue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <NarrationDisplay text={currentCue} size="large" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
