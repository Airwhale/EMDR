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
  { count: 5, prompt: "Look around and name 5 things you can see...", file: "/audio/grounding/grounding-01-see.mp3" },
  { count: 4, prompt: "Notice 4 things you can physically feel...", file: "/audio/grounding/grounding-02-touch.mp3" },
  { count: 3, prompt: "Listen for 3 sounds around you...", file: "/audio/grounding/grounding-03-hear.mp3" },
  { count: 2, prompt: "Notice 2 things about how your body feels right now...", file: "/audio/grounding/grounding-04-body.mp3" },
  { count: 1, prompt: "Take one deep, slow breath...", file: "/audio/grounding/grounding-05-breath.mp3" },
];

export default function AdverseEventFlow({ voice, onComplete }: AdverseEventFlowProps) {
  const [step, setStep] = useState<AEStep>("pause");
  const [groundingIndex, setGroundingIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const run = async () => {
      // PAUSE
      await voice?.speakAsync("Let's pause. You're safe. Take a slow breath.", { file: "/audio/adverse/adverse-pause.mp3" });
      if (cancelled) return;
      await delay(3000);
      if (cancelled) return;

      // ORIENT
      setStep("orient");
      await voice?.speakAsync("Feel your feet on the floor. Feel the surface beneath you. Notice the room around you.", { file: "/audio/adverse/adverse-orient.mp3" });
      if (cancelled) return;
      await delay(4000);
      if (cancelled) return;

      // GROUNDING
      setStep("grounding");
      await voice?.speakAsync("We're going to ground you with a simple exercise.", { file: "/audio/grounding/grounding-intro.mp3" });
      if (cancelled) return;
      await delay(2000);

      for (let i = 0; i < groundingSteps.length; i++) {
        if (cancelled) return;
        setGroundingIndex(i);
        await voice?.speakAsync(groundingSteps[i].prompt, { file: groundingSteps[i].file });
        if (cancelled) return;
        await delay(6000);
      }

      if (cancelled) return;
      await voice?.speakAsync("Good. Take a deep breath. You're here, you're safe.", { file: "/audio/grounding/grounding-closing.mp3" });
      if (cancelled) return;
      await delay(3000);

      // SUPPORT
      if (cancelled) return;
      setStep("support");
      await voice?.speakAsync("What you experienced is a normal response. This tool may not be right for you in this moment, and that's okay.", { file: "/audio/adverse/adverse-support.mp3" });
      if (cancelled) return;
      await delay(4000);

      // RESOURCES
      if (cancelled) return;
      setStep("resources");
    };

    run();
    return () => { cancelled = true; };
  }, [voice]);

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
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">Call or text 988, available 24/7</p>
              </div>
              <div className="p-4 border border-[#e8e0d4]/15 rounded-xl">
                <p className="text-sm text-[#e8e0d4]/60 font-light">Crisis Text Line</p>
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">Text HOME to 741741</p>
              </div>
              <div className="p-4 border border-[#e8e0d4]/15 rounded-xl">
                <p className="text-sm text-[#e8e0d4]/60 font-light">SAMHSA National Helpline</p>
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">1-800-662-4357, free, confidential, 24/7</p>
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
