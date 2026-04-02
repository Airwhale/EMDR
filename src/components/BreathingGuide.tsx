"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface BreathingGuideProps {
  isActive: boolean;
  size?: "full" | "small";
  showSpiral?: boolean;
}

type BreathPhase = "inhale" | "hold" | "exhale";

const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 6000;
const TOTAL_CYCLE = INHALE_MS + HOLD_MS + EXHALE_MS; // 14s

/**
 * Uses a single continuous Framer Motion keyframe animation for the entire
 * breath cycle instead of swapping duration/scale per phase. This avoids
 * animation interruption on state changes.
 *
 * The breathPhase state is only used for the label text — it does NOT
 * drive the motion animation.
 */
export default function BreathingGuide({
  isActive,
  size = "full",
  showSpiral = false,
}: BreathingGuideProps) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Label-only state cycle (does not drive animation)
  useEffect(() => {
    if (!isActive) return;

    const cycle = () => {
      setBreathPhase("inhale");
      timerRef.current = setTimeout(() => {
        setBreathPhase("hold");
        timerRef.current = setTimeout(() => {
          setBreathPhase("exhale");
          timerRef.current = setTimeout(cycle, EXHALE_MS);
        }, HOLD_MS);
      }, INHALE_MS);
    };

    cycle();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive]);

  const baseSize = size === "full" ? 200 : 60;

  // Keyframe stops: inhale peak at 4/14 ≈ 0.286, hold ends at 8/14 ≈ 0.571
  const inhaleStop = INHALE_MS / TOTAL_CYCLE;
  const holdStop = (INHALE_MS + HOLD_MS) / TOTAL_CYCLE;

  // Scale keyframes: 0.8 → 1.4 (inhale) → 1.4 (hold) → 0.8 (exhale)
  const scaleKeys = [0.8, 1.4, 1.4, 0.8];
  const opacityKeys = [0.5, 0.9, 0.9, 0.5];
  const times = [0, inhaleStop, holdStop, 1];

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
        animate={isActive ? { scale: scaleKeys, opacity: opacityKeys.map((o) => o * 0.5) } : {}}
        transition={{
          duration: TOTAL_CYCLE / 1000,
          times,
          ease: "easeInOut",
          repeat: Infinity,
        }}
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
        animate={isActive ? { scale: scaleKeys, opacity: opacityKeys } : {}}
        transition={{
          duration: TOTAL_CYCLE / 1000,
          times,
          ease: "easeInOut",
          repeat: Infinity,
        }}
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
        animate={
          isActive
            ? { scale: scaleKeys.map((s) => s * 0.8), opacity: opacityKeys }
            : {}
        }
        transition={{
          duration: TOTAL_CYCLE / 1000,
          times,
          ease: "easeInOut",
          repeat: Infinity,
        }}
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
