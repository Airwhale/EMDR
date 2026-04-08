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
      className="flex flex-col items-center gap-4 sm:gap-6 px-4"
    >
      <p className="narration-text text-lg sm:text-xl text-[#e8e0d4]/80 text-center max-w-md">
        {prompt}
      </p>
      {/* Anchor descriptions */}
      <div className="flex justify-between w-full max-w-[340px] sm:max-w-[460px] text-center">
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">calm</span>
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">mild</span>
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">moderate</span>
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">high</span>
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">severe</span>
      </div>
      <div className="flex items-center gap-[3px] sm:gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => onRate(i)}
            className="w-[28px] h-[28px] sm:w-10 sm:h-10 rounded-full border border-gold/35 text-gold/75 text-xs sm:text-sm
                       hover:border-gold/70 hover:text-gold hover:bg-gold/5
                       focus:outline-none focus:ring-2 focus:ring-gold/50
                       transition-all duration-300 flex items-center justify-center"
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-[340px] sm:max-w-[460px]">
        <span className="ui-text text-[10px] text-[#e8e0d4]/30">no distress</span>
        <span className="ui-text text-[10px] text-[#e8e0d4]/30">worst possible</span>
      </div>
    </motion.div>
  );
}
