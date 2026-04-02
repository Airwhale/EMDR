"use client";

import { motion } from "framer-motion";

interface EmdrDotProps {
  /** Seconds for one full L→R→L cycle */
  cycleDuration?: number;
  /** Dot size in px */
  size?: number;
  /** Horizontal travel range in px (half-width each side of center) */
  range?: number;
}

/**
 * EMDR-style dot that moves horizontally through the center of its container.
 * Designed to overlay the breathing guide circle so it passes through the middle.
 */
export default function EmdrDot({
  cycleDuration = 4,
  size = 10,
  range = 120,
}: EmdrDotProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* The EMDR dot — distinct from the breathing ring's warm glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(220, 210, 190, 0.3))",
          boxShadow: "0 0 12px rgba(255, 255, 255, 0.3), 0 0 40px rgba(201, 169, 110, 0.1)",
        }}
        animate={{
          x: [-range, range, -range],
        }}
        transition={{
          duration: cycleDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle afterimage trail */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)",
          filter: "blur(3px)",
        }}
        animate={{
          x: [-range, range, -range],
        }}
        transition={{
          duration: cycleDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1,
        }}
      />
    </div>
  );
}
