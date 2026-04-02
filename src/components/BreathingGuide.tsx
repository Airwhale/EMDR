"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface BreathingGuideProps {
  isActive: boolean;
  size?: "full" | "small";
  showSpiral?: boolean;
}

type BreathPhase = "inhale" | "hold" | "exhale";

const INHALE_DURATION = 4000;
const HOLD_DURATION = 4000;
const EXHALE_DURATION = 6000;

export default function BreathingGuide({
  isActive,
  size = "full",
  showSpiral = false,
}: BreathingGuideProps) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const cycle = () => {
      setBreathPhase("inhale");
      timerRef.current = setTimeout(() => {
        setBreathPhase("hold");
        timerRef.current = setTimeout(() => {
          setBreathPhase("exhale");
          timerRef.current = setTimeout(cycle, EXHALE_DURATION);
        }, HOLD_DURATION);
      }, INHALE_DURATION);
    };

    cycle();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive]);

  const baseSize = size === "full" ? 200 : 60;
  const scale =
    breathPhase === "inhale"
      ? 1.4
      : breathPhase === "hold"
      ? 1.4
      : 0.8;

  const duration =
    breathPhase === "inhale"
      ? INHALE_DURATION / 1000
      : breathPhase === "hold"
      ? HOLD_DURATION / 1000
      : EXHALE_DURATION / 1000;

  const opacity = breathPhase === "exhale" ? 0.5 : 0.9;

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
        }}
        animate={{ scale, opacity: opacity * 0.5 }}
        transition={{
          duration,
          ease: "easeInOut",
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
        }}
        animate={{ scale, opacity }}
        transition={{
          duration,
          type: "spring",
          stiffness: 20,
          damping: 15,
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
        }}
        animate={{ scale: scale * 0.8, opacity }}
        transition={{ duration, ease: "easeInOut" }}
      />

      {/* Spiral texture overlay */}
      {showSpiral && (
        <motion.div
          className="absolute rounded-full spiral-texture"
          style={{
            width: baseSize * 1.2,
            height: baseSize * 1.2,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      )}

      {/* Breath phase label (small, subtle) */}
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
