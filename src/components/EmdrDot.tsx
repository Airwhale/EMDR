"use client";

import { motion } from "framer-motion";

interface EmdrDotProps {
  cycleDuration?: number;
  size?: number;
  /** Travel range as vw (e.g. 35 = -35vw to +35vw = 70vw total) */
  rangeVw?: number;
}

/**
 * EMDR-style dot for the trance mode — smooth horizontal movement
 * using viewport-width units for wide screen coverage.
 */
export default function EmdrDot({
  cycleDuration = 4,
  size = 12,
  rangeVw = 35,
}: EmdrDotProps) {
  // Framer Motion animates x as a string with vw units
  const left = `${-rangeVw}vw`;
  const right = `${rangeVw}vw`;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* The EMDR dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(220, 210, 190, 0.3))",
          boxShadow:
            "0 0 14px rgba(255, 255, 255, 0.35), 0 0 50px rgba(201, 169, 110, 0.1)",
          willChange: "transform",
        }}
        animate={{
          x: [left, right, left],
        }}
        transition={{
          duration: cycleDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Afterimage trail */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)",
          filter: "blur(4px)",
          willChange: "transform",
        }}
        animate={{
          x: [left, right, left],
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
