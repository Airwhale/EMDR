"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface PhoticFlickerProps {
  /** Flicker frequency in Hz (alpha ~10Hz, theta ~6Hz) */
  frequency?: number;
  /** Max opacity of the flicker overlay */
  intensity?: number;
  /** Whether flickering is active */
  active: boolean;
}

/**
 * Photic driving overlay — a very subtle full-screen luminance flicker
 * at a target brainwave frequency. Used in clinical settings to entrain
 * neural oscillations. We keep it extremely subtle to avoid discomfort.
 */
export default function PhoticFlicker({
  frequency = 8,
  intensity = 0.025,
  active,
}: PhoticFlickerProps) {
  const [flickerOpacity, setFlickerOpacity] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setFlickerOpacity(0);
      return;
    }

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      // Sinusoidal oscillation at target frequency
      const val = (Math.sin(elapsed * frequency * Math.PI * 2) + 1) / 2;
      setFlickerOpacity(val * intensity);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, frequency, intensity]);

  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 3 }}
      style={{
        backgroundColor: `rgba(201, 169, 110, ${flickerOpacity})`,
      }}
    />
  );
}
