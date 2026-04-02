"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import NarrationDisplay from "../NarrationDisplay";
import { ExperimentResult } from "@/lib/sessionScript";

interface ArmLevitationProps {
  isActive: boolean;
  onComplete: (result: ExperimentResult) => void;
}

const narrationSteps = [
  { text: "Rest your hands on your lap or desk...", delay: 0, showDuration: 6000 },
  { text: "Focus on your dominant hand...", delay: 7000, showDuration: 6000 },
  {
    text: "Imagine a helium balloon tied gently to your wrist... feel the upward pull...",
    delay: 7000,
    showDuration: 8000,
  },
  {
    text: "You don't need to lift your hand. Just notice if it wants to rise...",
    delay: 9000,
    showDuration: 8000,
  },
];

export default function ArmLevitation({ isActive, onComplete }: ArmLevitationProps) {
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [balloonVisible, setBalloonVisible] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    narrationSteps.forEach((step) => {
      cumulative += step.delay;
      const show = cumulative;
      const hide = show + step.showDuration;

      timers.push(setTimeout(() => setCurrentText(step.text), show));
      timers.push(setTimeout(() => setCurrentText(null), hide));
      cumulative = hide;
    });

    // Show balloon animation
    timers.push(setTimeout(() => setBalloonVisible(true), 14000));

    // Show question after narration
    timers.push(setTimeout(() => setShowQuestion(true), cumulative + 2000));

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const handleResponse = (response: string) => {
    onComplete({
      id: "arm-levitation",
      title: "Arm Levitation",
      response,
      explanation:
        "The ideomotor effect causes subtle, unconscious muscle movements in response to mental imagery. Even a tiny twitch indicates your unconscious mind is responding to suggestion — a hallmark of hypnotic responsiveness.",
    });
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      {/* Balloon illustration */}
      {balloonVisible && (
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Balloon */}
            <div
              className="w-16 h-20 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at 40% 30%, rgba(201, 169, 110, 0.3), rgba(201, 169, 110, 0.1))",
                border: "1px solid rgba(201, 169, 110, 0.2)",
              }}
            />
            {/* String */}
            <motion.div
              className="w-px h-24"
              style={{ background: "rgba(201, 169, 110, 0.2)" }}
              animate={{ scaleY: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}

      <NarrationDisplay text={currentText} />

      {/* Response buttons */}
      {showQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="narration-text text-lg text-[#e8e0d4]/70">
            Did your hand move, even slightly?
          </p>
          <div className="flex gap-4">
            {["Yes", "A little", "Not this time"].map((option) => (
              <button
                key={option}
                onClick={() => handleResponse(option)}
                className="px-6 py-3 border border-gold/20 rounded-full text-gold/60
                           hover:border-gold/40 hover:text-gold/80 transition-all duration-700
                           ui-text"
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
