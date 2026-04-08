"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TranceVoice } from "@/lib/TranceVoice";

interface GroundingExerciseProps {
  voice: TranceVoice | null;
  onComplete: () => void;
}

const steps = [
  { count: 5, sense: "things you can see", prompt: "Look around and name 5 things you can see...", file: "/audio/grounding/grounding-01-see.mp3" },
  { count: 4, sense: "things you can touch", prompt: "Notice 4 things you can physically feel...", file: "/audio/grounding/grounding-02-touch.mp3" },
  { count: 3, sense: "things you can hear", prompt: "Listen for 3 sounds around you...", file: "/audio/grounding/grounding-03-hear.mp3" },
  { count: 2, sense: "things about how your body feels", prompt: "Notice 2 things about how your body feels right now...", file: "/audio/grounding/grounding-04-body.mp3" },
  { count: 1, sense: "deep, slow breath", prompt: "Take one deep, slow breath...", file: "/audio/grounding/grounding-05-breath.mp3" },
];

/**
 * 5-4-3-2-1 grounding exercise. Automatically triggered if SUD is too high.
 */
export default function GroundingExercise({ voice, onComplete }: GroundingExerciseProps) {
  const [stepIndex, setStepIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const run = async () => {
      // Intro — let voice engine warm up first
      await delay(500);
      if (cancelled) return;
      await voice?.speakAsync(
        "Let's pause and ground yourself. This is a simple exercise to bring you back to the present moment.",
        { rate: 0.8, file: "/audio/grounding/grounding-intro.mp3" }
      );
      if (cancelled) return;
      await delay(800);

      for (let i = 0; i < steps.length; i++) {
        if (cancelled) return;
        setStepIndex(i);
        await voice?.speakAsync(steps[i].prompt, { rate: 0.8, file: steps[i].file });
        if (cancelled) return;
        // Give the user time to do each step even if the spoken cue is short
        await delay(4000);
      }

      if (cancelled) return;
      await voice?.speakAsync("Good. Take a deep breath. You're here, you're safe.", { rate: 0.75, file: "/audio/grounding/grounding-closing.mp3" });
      if (cancelled) return;
      await delay(1000);
      if (!cancelled) onComplete();
    };

    run();
    return () => {
      cancelled = true;
    };
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
