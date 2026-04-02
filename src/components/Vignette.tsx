"use client";

import { motion } from "framer-motion";

interface VignetteProps {
  /** 0 = no vignette, 1 = heavy dark edges (tunnel vision) */
  intensity: number;
}

/**
 * Radial vignette overlay that simulates tunnel vision.
 * Deepens as trance progresses, narrowing visual focus.
 */
export default function Vignette({ intensity }: VignetteProps) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-30"
      animate={{ opacity: intensity }}
      transition={{ duration: 4, ease: "easeInOut" }}
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 30%, rgba(5, 5, 10, 0.6) 70%, rgba(5, 5, 10, 0.95) 100%)",
      }}
    />
  );
}
