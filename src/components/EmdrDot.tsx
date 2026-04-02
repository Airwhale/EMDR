"use client";

import { motion } from "framer-motion";

interface EmdrDotProps {
  /** Seconds for one full L→R→L cycle */
  cycleDuration?: number;
  /** Dot size in px */
  size?: number;
  /** Whether to show the EMDR trace line */
  showTrace?: boolean;
}

export default function EmdrDot({
  cycleDuration = 4,
  size = 14,
  showTrace = false,
}: EmdrDotProps) {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: size * 4 }}>
      {/* Faint horizontal trace line */}
      {showTrace && (
        <div
          className="absolute w-3/5 h-px"
          style={{ background: "rgba(201, 169, 110, 0.06)" }}
        />
      )}

      {/* The EMDR dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: "radial-gradient(circle, rgba(201, 169, 110, 0.9), rgba(201, 169, 110, 0.15))",
          boxShadow: "0 0 20px rgba(201, 169, 110, 0.25), 0 0 60px rgba(201, 169, 110, 0.08)",
        }}
        animate={{
          x: ["-28vw", "28vw", "-28vw"],
        }}
        transition={{
          duration: cycleDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Trailing afterimage */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: "radial-gradient(circle, rgba(201, 169, 110, 0.3), transparent)",
          filter: "blur(4px)",
        }}
        animate={{
          x: ["-28vw", "28vw", "-28vw"],
        }}
        transition={{
          duration: cycleDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.08, // Slightly lagging = afterimage
        }}
      />
    </div>
  );
}
