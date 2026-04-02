"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TranceVoice } from "@/lib/TranceVoice";

interface GroundingExerciseProps {
  voice: TranceVoice | null;
  onComplete: () => void;
}

const steps = [
  { count: 5, sense: "things you can see", prompt: "Look around and name 5 things you can see..." },
  { count: 4, sense: "things you can touch", prompt: "Notice 4 things you can physically feel..." },
  { count: 3, sense: "things you can hear", prompt: "Listen for 3 sounds around you..." },
  { count: 2, sense: "things you can smell", prompt: "Identify 2 things you can smell..." },
  { count: 1, sense: "thing you can taste", prompt: "Notice 1 thing you can taste..." },
];

/**
 * 5-4-3-2-1 grounding exercise. Automatically triggered if SUD is too high.
 */
export default function GroundingExercise({ voice, onComplete }: GroundingExerciseProps) {
  const [stepIndex, setStepIndex] = useState(-1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Intro
    timers.push(
      setTimeout(() => {
        voice?.speak("Let's pause and ground yourself. This is a simple exercise to bring you back to the present moment.", { rate: 0.8 });
      }, 500)
    );

    // Schedule each step
    let cumulative = 6000;
    steps.forEach((step, i) => {
      timers.push(
        setTimeout(() => {
          setStepIndex(i);
          voice?.speak(step.prompt, { rate: 0.8 });
        }, cumulative)
      );
      cumulative += 10000;
    });

    // Complete
    timers.push(
      setTimeout(() => {
        voice?.speak("Good. Take a deep breath. You're here, you're safe.", { rate: 0.75 });
      }, cumulative)
    );
    timers.push(setTimeout(onComplete, cumulative + 6000));

    return () => timers.forEach(clearTimeout);
  }, [voice, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      <AnimatePresence mode="wait">
        {stepIndex < 0 ? (
          <motion.p
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="narration-text text-2xl text-[#e8e0d4]/80 text-center max-w-lg"
          >
            Let&apos;s pause and ground yourself...
          </motion.p>
        ) : (
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-4"
          >
            <span className="narration-text text-5xl text-gold/80">{steps[stepIndex].count}</span>
            <p className="narration-text text-xl text-[#e8e0d4]/70 text-center max-w-md">
              {steps[stepIndex].prompt}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
