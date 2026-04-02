"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface PhoticFlickerProps {
  frequency?: number;
  intensity?: number;
  active: boolean;
}

/**
 * Photic driving overlay — uses a ref-based RAF loop that directly
 * mutates the DOM element's style, bypassing React re-renders entirely.
 */
export default function PhoticFlicker({
  frequency = 8,
  intensity = 0.025,
  active,
}: PhoticFlickerProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !elRef.current) {
      if (elRef.current) elRef.current.style.backgroundColor = "transparent";
      cancelAnimationFrame(rafRef.current);
      return;
    }

    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!elRef.current) return;
      const elapsed = (now - startRef.current) / 1000;
      const val = (Math.sin(elapsed * frequency * Math.PI * 2) + 1) / 2;
      elRef.current.style.backgroundColor = `rgba(201, 169, 110, ${val * intensity})`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, frequency, intensity]);

  if (!active) return null;

  return (
    <motion.div
      ref={elRef}
      className="absolute inset-0 pointer-events-none z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      style={{ willChange: "background-color" }}
    />
  );
}
