"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

interface BreathingGuideProps {
  isActive: boolean;
  size?: "full" | "small";
  showSpiral?: boolean;
  /** Multiplier for cycle speed. 1.0 = default (14s), 1.3 = 30% slower (18.2s), etc. */
  slowdown?: number;
}

type BreathPhase = "inhale" | "hold" | "exhale";

const BASE_INHALE = 4000;
const BASE_HOLD = 4000;
const BASE_EXHALE = 6000;

/**
 * Breathing guide with dynamic pacing. The `slowdown` prop stretches the
 * entire cycle — when narration says "your breathing is slowing," the
 * parent increases slowdown and the circle actually slows.
 *
 * Uses imperative animation controls so we can restart the cycle with a
 * new duration smoothly (the current cycle finishes, then the next one
 * picks up the new speed).
 */
export default function BreathingGuide({
  isActive,
  size = "full",
  showSpiral = false,
  slowdown = 1,
}: BreathingGuideProps) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slowdownRef = useRef(slowdown);
  slowdownRef.current = slowdown;

  const controls = useAnimation();
  const glowControls = useAnimation();
  const dotControls = useAnimation();

  const baseSize = size === "full" ? 200 : 60;

  const runCycle = useCallback(async () => {
    if (!isActive) return;

    const s = slowdownRef.current;
    const inhaleMs = BASE_INHALE * s;
    const holdMs = BASE_HOLD * s;
    const exhaleMs = BASE_EXHALE * s;
    const totalS = (inhaleMs + holdMs + exhaleMs) / 1000;
    const inhaleStop = inhaleMs / (inhaleMs + holdMs + exhaleMs);
    const holdStop = (inhaleMs + holdMs) / (inhaleMs + holdMs + exhaleMs);

    const times = [0, inhaleStop, holdStop, 1];
    const scaleKeys = [0.8, 1.4, 1.4, 0.8];
    const opacityKeys = [0.5, 0.9, 0.9, 0.5];

    // Start all three layers in parallel — no awaits between them
    controls.start({
      scale: scaleKeys,
      opacity: opacityKeys,
      transition: { duration: totalS, times, ease: "easeInOut" },
    });
    glowControls.start({
      scale: scaleKeys,
      opacity: opacityKeys.map((o) => o * 0.5),
      transition: { duration: totalS, times, ease: "easeInOut" },
    });
    dotControls.start({
      scale: scaleKeys.map((sc) => sc * 0.8),
      opacity: opacityKeys,
      transition: { duration: totalS, times, ease: "easeInOut" },
    });

    // Label phase tracking
    setBreathPhase("inhale");
    timerRef.current = setTimeout(() => {
      setBreathPhase("hold");
      timerRef.current = setTimeout(() => {
        setBreathPhase("exhale");
        timerRef.current = setTimeout(() => {
          // Next cycle — picks up latest slowdown
          runCycle();
        }, exhaleMs);
      }, holdMs);
    }, inhaleMs);
  }, [isActive, controls, glowControls, dotControls]);

  useEffect(() => {
    if (isActive) {
      runCycle();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, runCycle]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: baseSize * 2, height: baseSize * 2 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: baseSize * 1.5,
          height: baseSize * 1.5,
          background:
            "radial-gradient(circle, rgba(201, 169, 110, 0.08) 0%, transparent 70%)",
          willChange: "transform, opacity",
        }}
        animate={glowControls}
      />

      {/* Main breathing ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: baseSize,
          height: baseSize,
          borderColor: "rgba(201, 169, 110, 0.4)",
          boxShadow:
            "0 0 30px rgba(201, 169, 110, 0.1), inset 0 0 30px rgba(201, 169, 110, 0.05)",
          willChange: "transform, opacity",
        }}
        animate={controls}
      />

      {/* Inner warm dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: baseSize * 0.15,
          height: baseSize * 0.15,
          background:
            "radial-gradient(circle, rgba(201, 169, 110, 0.8) 0%, rgba(201, 169, 110, 0.2) 70%)",
          willChange: "transform, opacity",
        }}
        animate={dotControls}
      />

      {/* Spiral texture overlay — always mounted, opacity-toggled */}
      <motion.div
        className="absolute rounded-full spiral-texture"
        style={{
          width: baseSize * 1.2,
          height: baseSize * 1.2,
          willChange: "transform",
        }}
        animate={{ rotate: 360, opacity: showSpiral ? 1 : 0 }}
        transition={{
          rotate: {
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          },
          opacity: { duration: 2 },
        }}
      />

      {/* Breath phase label */}
      {size === "full" && (
        <motion.span
          className="absolute ui-text text-gold/40"
          style={{ bottom: -30 }}
          animate={{ opacity: breathPhase === "hold" ? 0.2 : 0.5 }}
          transition={{ duration: 1 }}
        >
          {breathPhase === "inhale"
            ? "breathe in"
            : breathPhase === "hold"
            ? "hold"
            : "breathe out"}
        </motion.span>
      )}
    </div>
  );
}
