"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";

interface BilateralDotProps {
  /** Seconds for one full L→R pass (half-cycle). EMDR ≈ 0.5s, ART ≈ 0.35s */
  halfCycleSec: number;
  size?: number;
  active: boolean;
  audio: TranceAudioEngine | null;
  color?: "gold" | "white";
  /** Callback when the user clicks continue */
  onContinue?: () => void;
  /** If true, show a continue button below the dot */
  showContinue?: boolean;
}

/**
 * Full-width bilateral stimulation dot with integrated ping sound.
 * Uses requestAnimationFrame for smooth movement across ~85% of viewport.
 */
export default function BilateralDot({
  halfCycleSec,
  size = 16,
  active,
  audio,
  color = "gold",
  onContinue,
  showContinue = false,
}: BilateralDotProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastSideRef = useRef<"left" | "right">("left");

  const colorMain =
    color === "gold"
      ? "radial-gradient(circle, rgba(212, 180, 120, 1), rgba(201, 169, 110, 0.4))"
      : "radial-gradient(circle, rgba(255, 255, 255, 1), rgba(230, 220, 200, 0.5))";
  const shadowMain =
    color === "gold"
      ? "0 0 20px rgba(201, 169, 110, 0.6), 0 0 60px rgba(201, 169, 110, 0.2)"
      : "0 0 20px rgba(255, 255, 255, 0.6), 0 0 60px rgba(201, 169, 110, 0.15)";
  const colorTrail =
    color === "gold"
      ? "radial-gradient(circle, rgba(201, 169, 110, 0.45), transparent)"
      : "radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent)";
  const lineColor =
    color === "gold" ? "rgba(201, 169, 110, 0.06)" : "rgba(255, 255, 255, 0.04)";

  const animate = useCallback(() => {
    if (!dotRef.current || !active) return;

    const fullCycle = halfCycleSec * 2;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (!dotRef.current) return;
      const elapsed = ((now - startTime) / 1000) % fullCycle;
      const t = elapsed / fullCycle;

      // Use percentage of viewport for full-width travel
      // sin produces -1 to 1, we map to -42vw to 42vw (84% of viewport)
      const pct = Math.sin(t * Math.PI * 2) * 42;

      dotRef.current.style.transform = `translateX(${pct}vw)`;
      if (trailRef.current) {
        trailRef.current.style.transform = `translateX(${pct}vw)`;
      }

      // Ping on direction change
      const currentSide: "left" | "right" = pct >= 0 ? "right" : "left";
      if (currentSide !== lastSideRef.current) {
        lastSideRef.current = currentSide;
        audio?.playPing(currentSide);
        if (navigator.vibrate) navigator.vibrate(15);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [active, halfCycleSec, audio]);

  useEffect(() => {
    if (active) animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, animate]);

  return (
    <div className="flex flex-col items-center gap-12 w-full">
      {/* Dot area */}
      <div
        className="relative w-full flex items-center justify-center pointer-events-none"
        style={{ height: size * 5, zIndex: 10 }}
      >
        {/* Guide line — full width */}
        <div
          className="absolute h-px"
          style={{ width: "84vw", background: lineColor }}
        />

        {/* Main dot */}
        <div
          ref={dotRef}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            background: colorMain,
            boxShadow: shadowMain,
            willChange: "transform",
          }}
        />

        {/* Trail */}
        <div
          ref={trailRef}
          className="absolute rounded-full"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            background: colorTrail,
            filter: "blur(5px)",
            willChange: "transform",
          }}
        />
      </div>

      {/* Continue button + helper text */}
      {showContinue && onContinue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="flex flex-col items-center gap-3 pointer-events-auto"
        >
          <button
            onClick={onContinue}
            className="px-8 py-3 border border-gold/50 rounded-full text-gold/90
                       hover:border-gold hover:text-gold hover:bg-gold/5
                       transition-all duration-500 ui-text"
          >
            continue
          </button>
          <span className="text-[11px] text-[#e8e0d4]/35 font-light">
            Press continue when you&apos;re ready to move on
          </span>
        </motion.div>
      )}
    </div>
  );
}
