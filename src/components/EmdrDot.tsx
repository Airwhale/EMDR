"use client";

import { motion } from "framer-motion";

interface EmdrDotProps {
  cycleDuration?: number;
  size?: number;
  range?: number;
}

/**
 * EMDR-style dot — smooth horizontal movement through container center.
 * Uses GPU-accelerated transforms with will-change hints.
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
      {/* The EMDR dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(220, 210, 190, 0.3))",
          boxShadow:
            "0 0 12px rgba(255, 255, 255, 0.3), 0 0 40px rgba(201, 169, 110, 0.1)",
          willChange: "transform",
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
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)",
          filter: "blur(3px)",
          willChange: "transform",
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
