"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import NarrationDisplay from "../NarrationDisplay";
import { ExperimentResult } from "@/lib/sessionScript";

interface ChevreuPendulumProps {
  isActive: boolean;
  onComplete: (result: ExperimentResult) => void;
}

const narrationSteps = [
  {
    text: "If you have a necklace, keychain, or anything on a string — hold it still in front of you.",
    delay: 0,
    showDuration: 8000,
  },
  {
    text: "Without moving your hand, simply think about the pendulum swinging left to right...",
    delay: 9000,
    showDuration: 8000,
  },
  {
    text: "Just think the thought. Watch what happens...",
    delay: 9000,
    showDuration: 8000,
  },
];

export default function ChevreuPendulum({ isActive, onComplete }: ChevreuPendulumProps) {
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [pendulumSwing, setPendulumSwing] = useState(0);

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
        // Gradually increase pendulum swing amplitude
        setPendulumSwing(i * 4);
      }, show));
      timers.push(setTimeout(() => setCurrentText(null), hide));
      cumulative = hide;
    });

    timers.push(setTimeout(() => setShowQuestion(true), cumulative + 5000));

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  const handleResponse = (response: string) => {
    onComplete({
      id: "chevreul-pendulum",
      title: "Chevreul Pendulum",
      response,
      explanation:
        "The Chevreul pendulum demonstrates the ideomotor effect — your unconscious mind creates tiny muscle movements that match your thoughts, without conscious intent. This is the same principle behind dowsing rods, Ouija boards, and many hypnotic phenomena. It shows how thought becomes physical action below the threshold of awareness.",
    });
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      {/* Pendulum animation */}
      <div className="relative h-48 flex items-start justify-center">
        {/* Pivot point */}
        <div
          className="absolute top-0 w-2 h-2 rounded-full"
          style={{ background: "rgba(201, 169, 110, 0.3)" }}
        />
        {/* String + weight */}
        <motion.div
          className="flex flex-col items-center origin-top"
          style={{ transformOrigin: "top center" }}
          animate={{ rotate: pendulumSwing > 0 ? [pendulumSwing, -pendulumSwing] : 0 }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div
            className="w-px h-32"
            style={{ background: "rgba(201, 169, 110, 0.2)" }}
          />
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201, 169, 110, 0.5), rgba(201, 169, 110, 0.2))",
              boxShadow: "0 0 10px rgba(201, 169, 110, 0.15)",
            }}
          />
        </motion.div>
      </div>

      <NarrationDisplay text={currentText} />

      {showQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="narration-text text-lg text-[#e8e0d4]/70">
            Did the pendulum move?
          </p>
          <div className="flex gap-4">
            {["Yes, noticeably", "A little", "I didn't have one", "No movement"].map(
              (option) => (
                <button
                  key={option}
                  onClick={() => handleResponse(option)}
                  className="px-5 py-3 border border-gold/35 rounded-full text-gold/80
                             hover:border-gold/70 hover:text-gold transition-all duration-700
                             ui-text text-xs"
                >
                  {option}
                </button>
              )
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
