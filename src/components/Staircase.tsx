"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { staircaseNumbers } from "@/lib/sessionScript";

interface StaircaseProps {
  isActive: boolean;
  onComplete: () => void;
  onStep?: (step: number) => void;
}

export default function Staircase({ isActive, onComplete, onStep }: StaircaseProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number }[]>([]);

  // Generate drifting particles
  useEffect(() => {
    if (!isActive) return;
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
    }));
    setParticles(newParticles);
  }, [isActive]);

  const runStaircase = useCallback(() => {
    staircaseNumbers.forEach((num, index) => {
      setTimeout(() => {
        setCurrentIndex(index);
        onStep?.(num);
      }, index * 5000);
    });

    // Complete after all numbers shown
    setTimeout(() => {
      setCurrentIndex(-1);
      onComplete();
    }, staircaseNumbers.length * 5000 + 2000);
  }, [onComplete, onStep]);

  useEffect(() => {
    if (isActive) {
      // Start after initial narration
      const timer = setTimeout(runStaircase, 18000);
      return () => clearTimeout(timer);
    }
  }, [isActive, runStaircase]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Drifting particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            animationDuration: `${15 + Math.random() * 10}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Countdown numbers */}
      <AnimatePresence mode="wait">
        {currentIndex >= 0 && currentIndex < staircaseNumbers.length && (
          <motion.div
            key={staircaseNumbers[currentIndex]}
            className="absolute flex items-center justify-center"
            initial={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            animate={{ opacity: 0.6, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(15px)", y: 40 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <span
              className="narration-text text-gold/50 font-light"
              style={{ fontSize: "8rem" }}
            >
              {staircaseNumbers[currentIndex]}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
