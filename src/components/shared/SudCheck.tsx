"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SudCheckProps {
  prompt?: string;
  onRate: (rating: number) => void;
}

const sudLabels = ["calm", "very low", "low", "mild", "moderate", "noticeable", "strong", "high", "very high", "intense", "severe"];

/**
 * Subjective Units of Distress scale (0-10).
 * Used in EMDR and ART to monitor distress levels.
 */
export default function SudCheck({
  prompt = "How much distress are you feeling right now?",
  onRate,
}: SudCheckProps) {
  const [selected, setSelected] = useState<number>(5);
  const groupRef = useRef<HTMLDivElement>(null);

  // Auto-focus the pre-selected button so arrow keys work immediately.
  // Small delay lets the Framer Motion fade-in begin first.
  useEffect(() => {
    const t = setTimeout(() => {
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("button");
      buttons?.[selected]?.focus();
    }, 100);
    return () => clearTimeout(t);
  // Only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { next = Math.min(10, index + 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { next = Math.max(0, index - 1); e.preventDefault(); }
    else if (e.key === "Home") { next = 0; e.preventDefault(); }
    else if (e.key === "End") { next = 10; e.preventDefault(); }
    else return;

    setSelected(next);
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[next]?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5 }}
      className="flex flex-col items-center gap-4 sm:gap-6 px-4"
    >
      <p id="sud-prompt" className="narration-text text-lg sm:text-xl text-[#e8e0d4]/80 text-center max-w-md">
        {prompt}
      </p>
      {/* Anchor descriptions */}
      <div className="flex justify-between w-full max-w-[340px] sm:max-w-[460px] text-center" aria-hidden="true">
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">calm</span>
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">mild</span>
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">moderate</span>
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">high</span>
        <span className="ui-text text-[9px] text-[#e8e0d4]/35 w-12 sm:w-16">severe</span>
      </div>
      <div
        ref={groupRef}
        role="group"
        aria-labelledby="sud-prompt"
        className="flex items-center gap-[3px] sm:gap-1"
      >
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => { setSelected(i); onRate(i); }}
            onKeyDown={(e) => handleKeyDown(e, i)}
            tabIndex={i === selected ? 0 : -1}
            aria-label={`${i} — ${sudLabels[i]}`}
            aria-pressed={i === selected}
            className={`w-[28px] h-[28px] sm:w-10 sm:h-10 rounded-full border text-xs sm:text-sm
                       focus:outline-none focus:ring-2 focus:ring-gold/50
                       transition-all duration-300 flex items-center justify-center
                       ${i === selected
                         ? "border-gold/80 text-gold bg-gold/10"
                         : "border-gold/35 text-gold/75 hover:border-gold/70 hover:text-gold hover:bg-gold/5"
                       }`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-[340px] sm:max-w-[460px]" aria-hidden="true">
        <span className="ui-text text-[10px] text-[#e8e0d4]/30">no distress</span>
        <span className="ui-text text-[10px] text-[#e8e0d4]/30">worst possible</span>
      </div>
    </motion.div>
  );
}
