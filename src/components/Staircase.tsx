"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { staircaseNumbers } from "@/lib/sessionScript";

interface StaircaseProps {
  isActive: boolean;
  onComplete: () => void;
  onStep?: (step: number) => void;
}

export default function Staircase({ isActive, onComplete, onStep }: StaircaseProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Memoize particles — generate once, never recalculate
  const particles = useMemo(() => {
    if (!isActive) return [];
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
    }));
  }, [isActive]);

  const runStaircase = useCallback(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    staircaseNumbers.forEach((num, index) => {
      timers.push(
        setTimeout(() => {
          setCurrentIndex(index);
          onStep?.(num);
        }, index * 7000)
      );
    });

    timers.push(
      setTimeout(() => {
        setCurrentIndex(-1);
        onComplete();
      }, staircaseNumbers.length * 7000 + 3000)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete, onStep]);

  useEffect(() => {
    if (!isActive) return;
    // Start after narration cues finish (~55s total for staircase narration).
    // Keep the inner cleanup so unmounting mid-countdown also clears the
    // step timers — otherwise numbers keep being spoken after exit, and the
    // completion timer can fire into a phase the user already left.
    let innerCleanup: (() => void) | null = null;
    const timer = setTimeout(() => { innerCleanup = runStaircase(); }, 55000);
    return () => {
      clearTimeout(timer);
      innerCleanup?.();
    };
  }, [isActive, runStaircase]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Drifting particles — stable durations, no recalculation */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            animationDuration: `${p.duration}s`,
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
            style={{ willChange: "transform, opacity, filter" }}
            initial={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            animate={{ opacity: 0.6, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(15px)", y: 40 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <span
              className="narration-text text-gold/75 font-light"
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
