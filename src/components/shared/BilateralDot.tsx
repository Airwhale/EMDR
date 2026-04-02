"use client";

import { useRef, useEffect, useCallback } from "react";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";

interface BilateralDotProps {
  /** Seconds for one full L→R pass (half-cycle). EMDR ≈ 0.5s, ART ≈ 0.3s */
  halfCycleSec: number;
  size?: number;
  range?: number;
  active: boolean;
  audio: TranceAudioEngine | null;
  /** Visual color — EMDR uses warm gold, ART uses bright white */
  color?: "gold" | "white";
}

/**
 * Bilateral stimulation dot with integrated ping sound.
 * Uses requestAnimationFrame for buttery-smooth movement.
 * Fires audio ping on each direction change.
 */
export default function BilateralDot({
  halfCycleSec,
  size = 14,
  range = 160,
  active,
  audio,
  color = "gold",
}: BilateralDotProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastSideRef = useRef<"left" | "right">("left");

  const colorMain =
    color === "gold"
      ? "radial-gradient(circle, rgba(201, 169, 110, 0.95), rgba(201, 169, 110, 0.2))"
      : "radial-gradient(circle, rgba(255, 255, 255, 0.95), rgba(220, 210, 190, 0.2))";
  const shadowMain =
    color === "gold"
      ? "0 0 14px rgba(201, 169, 110, 0.4), 0 0 40px rgba(201, 169, 110, 0.12)"
      : "0 0 14px rgba(255, 255, 255, 0.4), 0 0 40px rgba(201, 169, 110, 0.1)";
  const colorTrail =
    color === "gold"
      ? "radial-gradient(circle, rgba(201, 169, 110, 0.25), transparent)"
      : "radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)";

  const animate = useCallback(() => {
    if (!dotRef.current || !active) return;

    const fullCycle = halfCycleSec * 2;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (!dotRef.current) return;
      const elapsed = ((now - startTime) / 1000) % fullCycle;
      const t = elapsed / fullCycle;

      // Smooth sinusoidal motion
      const x = Math.sin(t * Math.PI * 2) * range;

      dotRef.current.style.transform = `translateX(${x}px)`;
      if (trailRef.current) {
        trailRef.current.style.transform = `translateX(${x}px)`;
      }

      // Detect direction change for ping
      const currentSide: "left" | "right" = x >= 0 ? "right" : "left";
      if (currentSide !== lastSideRef.current) {
        lastSideRef.current = currentSide;
        audio?.playPing(currentSide);
        // Haptic feedback on mobile
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [active, halfCycleSec, range, audio]);

  useEffect(() => {
    if (active) {
      animate();
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, animate]);

  return (
    <div
      className="relative w-full flex items-center justify-center pointer-events-none"
      style={{ height: size * 4, zIndex: 10 }}
    >
      {/* Faint guide line */}
      <div
        className="absolute h-px"
        style={{
          width: range * 2,
          background:
            color === "gold"
              ? "rgba(201, 169, 110, 0.06)"
              : "rgba(255, 255, 255, 0.04)",
        }}
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
          width: size * 0.6,
          height: size * 0.6,
          background: colorTrail,
          filter: "blur(4px)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
