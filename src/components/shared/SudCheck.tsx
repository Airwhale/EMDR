"use client";

import { motion } from "framer-motion";

interface SudCheckProps {
  prompt?: string;
  onRate: (rating: number) => void;
}

/**
 * Subjective Units of Distress scale (0-10).
 * Used in EMDR and ART to monitor distress levels.
 */
export default function SudCheck({
  prompt = "How much distress are you feeling right now?",
  onRate,
}: SudCheckProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5 }}
      className="flex flex-col items-center gap-6"
    >
      <p className="narration-text text-xl text-[#e8e0d4]/80 text-center max-w-md">
        {prompt}
      </p>
      <div className="flex items-center gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => onRate(i)}
            className="w-10 h-10 rounded-full border border-gold/20 text-gold/50 text-sm
                       hover:border-gold/50 hover:text-gold hover:bg-gold/5
                       transition-all duration-300 flex items-center justify-center"
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-[460px]">
        <span className="ui-text text-[10px] text-[#e8e0d4]/30">no distress</span>
        <span className="ui-text text-[10px] text-[#e8e0d4]/30">worst possible</span>
      </div>
    </motion.div>
  );
}
