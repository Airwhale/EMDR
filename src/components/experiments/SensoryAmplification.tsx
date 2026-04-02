"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import NarrationDisplay from "../NarrationDisplay";
import { ExperimentResult } from "@/lib/sessionScript";

interface SensoryAmplificationProps {
  isActive: boolean;
  onComplete: (result: ExperimentResult) => void;
}

const narrationSteps = [
  { text: "Focus on your left hand. Notice the temperature of the air on your skin...", delay: 0, showDuration: 7000 },
  { text: "Now imagine holding a warm cup of tea...", delay: 8000, showDuration: 6000 },
  { text: "Feel the heat radiating into your palm... the ceramic smooth and warm...", delay: 7000, showDuration: 8000 },
  { text: "The warmth spreading through your fingers...", delay: 9000, showDuration: 7000 },
];

const warmthLevels = ["Cool", "Neutral", "Slightly Warm", "Warm", "Very Warm"];

export default function SensoryAmplification({
  isActive,
  onComplete,
}: SensoryAmplificationProps) {
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [warmthProgress, setWarmthProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    narrationSteps.forEach((step, i) => {
      cumulative += step.delay;
      const show = cumulative;
      const hide = show + step.showDuration;

      timers.push(setTimeout(() => {
        setCurrentText(step.text);
        setWarmthProgress((i + 1) / narrationSteps.length);
      }, show));
      timers.push(setTimeout(() => setCurrentText(null), hide));
      cumulative = hide;
    });

    timers.push(setTimeout(() => setShowQuestion(true), cumulative + 2000));

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const handleResponse = (level: string) => {
    onComplete({
      id: "sensory-amplification",
      title: "Sensory Amplification",
      response: level,
      explanation:
        "Somatic suggestion works by activating the same neural pathways involved in actual sensory experience. Studies show that hypnotic suggestion can measurably alter skin temperature perception and even blood flow. If you felt any warmth, your mind successfully influenced your body's sensory processing.",
    });
  };

  if (!isActive) return null;

  // Gradient interpolation from blue-ish to amber based on progress
  const gradientColor = `rgba(${Math.round(100 + warmthProgress * 112)}, ${Math.round(
    120 + warmthProgress * 40
  )}, ${Math.round(180 - warmthProgress * 110)}, 0.08)`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 relative">
      {/* Background warmth gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ background: `radial-gradient(ellipse at center, ${gradientColor}, transparent 70%)` }}
        transition={{ duration: 3 }}
      />

      <NarrationDisplay text={currentText} />

      {showQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="flex flex-col items-center gap-4 z-10"
        >
          <p className="narration-text text-lg text-[#e8e0d4]/70">
            Rate the warmth you feel:
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {warmthLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleResponse(level)}
                className="px-5 py-3 border border-gold/35 rounded-full text-gold/80
                           hover:border-gold/70 hover:text-gold transition-all duration-700
                           ui-text text-xs"
              >
                {level}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
