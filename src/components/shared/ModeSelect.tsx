"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export type SessionMode = "trance" | "emdr" | "art";

interface ModeSelectProps {
  onSelect: (mode: SessionMode) => void;
}

const modes: { id: SessionMode; title: string; subtitle: string; description: string }[] = [
  {
    id: "emdr",
    title: "EMDR",
    subtitle: "Resource building & calm",
    description:
      "Safe place visualization, bilateral stimulation, butterfly hug, and grounding. Based on EMDR Phase 2 stabilization resources.",
  },
  {
    id: "art",
    title: "ART",
    subtitle: "Scene processing & rescripting",
    description:
      "Guided eye movements, voluntary image replacement, and body awareness. Based on Accelerated Resolution Therapy protocol.",
  },
  {
    id: "trance",
    title: "TRANCE",
    subtitle: "Guided hypnotic relaxation & experiences",
    description:
      "Deep breathing, progressive relaxation, and suggestibility experiments. A full guided self-hypnosis session with interactive demonstrations of hypnotic phenomena.",
  },
];

export default function ModeSelect({ onSelect }: ModeSelectProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center gap-10 px-4"
    >
      <p className="narration-text text-xl text-[#e8e0d4]/50">
        Choose your experience
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.2, duration: 1 }}
            onClick={() => onSelect(mode.id)}
            className="text-left px-6 py-5 border border-gold/40 rounded-2xl
                       hover:border-gold/60 hover:bg-gold/[0.02] transition-all duration-700
                       group"
          >
            <div className="flex items-baseline gap-3">
              <span className="ui-text text-sm text-gold/80 group-hover:text-gold transition-colors duration-500">
                {mode.title}
              </span>
              <span className="narration-text text-sm text-[#e8e0d4]/40">
                {mode.subtitle}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Expandable description */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        onClick={() => setExpanded(!expanded)}
        className="ui-text text-[10px] text-[#e8e0d4]/30"
      >
        {expanded ? "hide details" : "what\u2019s the difference?"}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md space-y-4 overflow-hidden"
          >
            {modes.map((mode) => (
              <div key={mode.id} className="px-4">
                <span className="ui-text text-xs text-gold/75">{mode.title}</span>
                <p className="text-xs text-[#e8e0d4]/40 mt-1 font-light leading-relaxed">
                  {mode.description}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
