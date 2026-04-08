"use client";

import { useEffect, useRef } from "react";

interface BinauralPulseProps {
  /** Pulse frequency in Hz (matches binaural beat frequency) */
  frequency: number;
  /** Max opacity of the pulse overlay */
  intensity?: number;
  active: boolean;
}

/**
 * Full-screen opacity pulse synced to the binaural beat frequency.
 * Uses RAF + direct DOM mutation for zero React re-renders.
 */
export default function BinauralPulse({
  frequency,
  intensity = 0.03,
  active,
}: BinauralPulseProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const freqRef = useRef(frequency);
  const intensityRef = useRef(intensity);
  freqRef.current = frequency;
  intensityRef.current = intensity;

  useEffect(() => {
    const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!active || !elRef.current || reducedMotion) {
      if (elRef.current) elRef.current.style.opacity = "0";
      cancelAnimationFrame(rafRef.current);
      return;
    }

    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!elRef.current) return;
      const elapsed = (now - startRef.current) / 1000;
      // Sinusoidal pulse at binaural beat frequency
      const val = (Math.sin(elapsed * freqRef.current * Math.PI * 2) + 1) / 2;
      elRef.current.style.opacity = String(val * intensityRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={elRef}
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        backgroundColor: "rgba(201, 169, 110, 0.5)",
        opacity: 0,
        willChange: "opacity",
      }}
    />
  );
}
