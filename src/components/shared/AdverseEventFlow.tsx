"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { TranceVoice } from "@/lib/TranceVoice";

interface AdverseEventFlowProps {
  voice: TranceVoice | null;
  onComplete: () => void;
}

type AEStep = "pause" | "orient" | "grounding" | "support" | "resources";

const groundingSteps = [
  { count: 5, prompt: "Look around and name 5 things you can see..." },
  { count: 4, prompt: "Notice 4 things you can physically feel..." },
  { count: 3, prompt: "Listen for 3 sounds around you..." },
  { count: 2, prompt: "Identify 2 things you can smell..." },
  { count: 1, prompt: "Notice 1 thing you can taste..." },
];

export default function AdverseEventFlow({ voice, onComplete }: AdverseEventFlowProps) {
  const [step, setStep] = useState<AEStep>("pause");
  const [groundingIndex, setGroundingIndex] = useState(-1);

  // PAUSE
  useEffect(() => {
    if (step !== "pause") return;
    voice?.speak("Let's pause. You're safe. Take a slow breath.");
    const t = setTimeout(() => setStep("orient"), 8000);
    return () => clearTimeout(t);
  }, [step, voice]);

  // ORIENT TO ROOM
  useEffect(() => {
    if (step !== "orient") return;
    voice?.speak("Feel your feet on the floor. Feel the surface beneath you. Notice the room around you.");
    const t = setTimeout(() => setStep("grounding"), 12000);
    return () => clearTimeout(t);
  }, [step, voice]);

  // 5-4-3-2-1 GROUNDING
  useEffect(() => {
    if (step !== "grounding") return;
    voice?.speak("We're going to ground you with a simple exercise.");
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 4000;

    groundingSteps.forEach((gs, i) => {
      timers.push(setTimeout(() => {
        setGroundingIndex(i);
        voice?.speak(gs.prompt);
      }, cumulative));
      cumulative += 10000;
    });

    timers.push(setTimeout(() => {
      voice?.speak("Good. Take a deep breath. You're here, you're safe.");
    }, cumulative));
    timers.push(setTimeout(() => setStep("support"), cumulative + 6000));

    return () => timers.forEach(clearTimeout);
  }, [step, voice]);

  // SUPPORT MESSAGE
  useEffect(() => {
    if (step !== "support") return;
    voice?.speak("What you experienced is a normal response. This tool may not be right for you in this moment, and that's okay.");
    const t = setTimeout(() => setStep("resources"), 12000);
    return () => clearTimeout(t);
  }, [step, voice]);

  const handleExit = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="w-full h-screen flex items-center justify-center px-6 bg-trance-dark">
      <AnimatePresence mode="wait">
        {step === "pause" && (
          <motion.div key="pause" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 text-center max-w-lg">
            <span className="narration-text text-3xl text-gold/85">Let&apos;s pause</span>
            <p className="narration-text text-xl text-[#e8e0d4]/70">
              You&apos;re safe. Take a slow, deep breath.
            </p>
          </motion.div>
        )}

        {step === "orient" && (
          <motion.div key="orient" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 text-center max-w-lg">
            <p className="narration-text text-xl text-[#e8e0d4]/70">
              Feel your feet on the floor. Feel the surface beneath you.
              Notice the room around you.
            </p>
          </motion.div>
        )}

        {step === "grounding" && (
          <motion.div key="grounding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 text-center max-w-lg">
            {groundingIndex >= 0 && groundingIndex < groundingSteps.length && (
              <>
                <span className="narration-text text-5xl text-gold/80">{groundingSteps[groundingIndex].count}</span>
                <p className="narration-text text-xl text-[#e8e0d4]/70">{groundingSteps[groundingIndex].prompt}</p>
              </>
            )}
            {groundingIndex < 0 && (
              <p className="narration-text text-xl text-[#e8e0d4]/70">
                We&apos;re going to ground you with a simple exercise...
              </p>
            )}
          </motion.div>
        )}

        {step === "support" && (
          <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 text-center max-w-lg">
            <p className="narration-text text-xl text-[#e8e0d4]/70">
              What you experienced is a normal response. This tool may not be right for
              you in this moment, and that&apos;s okay.
            </p>
          </motion.div>
        )}

        {step === "resources" && (
          <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-8 text-center max-w-lg">
            <p className="narration-text text-xl text-[#e8e0d4]/70">
              If you&apos;re still feeling distressed, please reach out for support.
            </p>

            <div className="space-y-3 w-full">
              <div className="p-4 border border-gold/25 rounded-xl">
                <p className="text-sm text-gold/80 font-light">988 Suicide &amp; Crisis Lifeline</p>
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">Call or text 988 — available 24/7</p>
              </div>
              <div className="p-4 border border-[#e8e0d4]/15 rounded-xl">
                <p className="text-sm text-[#e8e0d4]/60 font-light">Crisis Text Line</p>
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">Text HOME to 741741</p>
              </div>
              <div className="p-4 border border-[#e8e0d4]/15 rounded-xl">
                <p className="text-sm text-[#e8e0d4]/60 font-light">SAMHSA National Helpline</p>
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">1-800-662-4357 — free, confidential, 24/7</p>
              </div>
            </div>

            <button
              onClick={handleExit}
              className="px-8 py-3 border border-gold/40 rounded-full text-gold/80
                         hover:border-gold/70 hover:text-gold transition-all duration-500 ui-text"
            >
              Return to home
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
