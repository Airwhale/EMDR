"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export type SessionMode = "emdr" | "art" | "meditation" | "lateral";

interface ModeSelectProps {
  onSelect: (mode: SessionMode) => void;
  binauralEnabled: boolean;
  onBinauralToggle: (enabled: boolean) => void;
}

const modes: { id: SessionMode; title: string; subtitle: string; description: string }[] = [
  {
    id: "emdr",
    title: "EMDR",
    subtitle: "Build calm & inner resources",
    description:
      "Best if you want to feel more grounded and relaxed. Guided exercises help you create a mental safe place, practice self-soothing through the butterfly hug, and strengthen positive inner resources — all using gentle bilateral eye movements.",
  },
  {
    id: "art",
    title: "ART",
    subtitle: "Process & rescript a stressful memory",
    description:
      "Best if you have a specific stressful memory you'd like to take the edge off. This is a simplified, self-guided version of the clinical technique. Fast-paced eye movements help you process the scene, then you'll be guided to change it in your mind, reshaping it into something that feels better. You won't need to describe or share anything.",
  },
  {
    id: "meditation",
    title: "HYPNOTIC MEDITATION",
    subtitle: "Guided hypnotic meditation into deep relaxation",
    description:
      "Best if you want a long, immersive session. Uses hypnotic language, binaural tones, and bilateral stimulation to guide you into a deep trance state, then holds you there with gentle deepening cues for up to 30 minutes. Includes statements designed to bring contentment, belonging, joy, gratitude, safety, and wellbeing. End whenever you're ready.",
  },
  {
    id: "lateral",
    title: "LATERAL EYE MOVEMENT",
    subtitle: "Customizable bilateral stimulation tool",
    description:
      "A simple, adjustable bilateral eye movement tool. Control the speed, sound, and binaural tone frequency with sliders. Use it however you like — on its own, alongside your own practice, or just to relax.",
  },
];

export default function ModeSelect({ onSelect, binauralEnabled, onBinauralToggle }: ModeSelectProps) {
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

      {/* Binaural toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBinauralToggle(!binauralEnabled)}
            role="switch"
            aria-checked={binauralEnabled}
            aria-label="Toggle binaural tones"
            className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${
              binauralEnabled ? "bg-gold/40" : "bg-[#e8e0d4]/15"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#e8e0d4]/80 absolute top-0.5 transition-all duration-300 ${
                binauralEnabled ? "left-5" : "left-0.5"
              }`}
            />
          </button>
          <span className="ui-text text-[10px] text-[#e8e0d4]/40">
            binaural tones {binauralEnabled ? "on" : "off"}
          </span>
        </div>

        {/* Mode info link — below toggle, clearly about the modes not binaural */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="ui-text text-[10px] text-[#e8e0d4]/65 hover:text-[#e8e0d4]/85 transition-colors duration-300"
        >
          {expanded ? "hide details" : "not sure which to choose? click to find out more"}
        </button>
      </motion.div>

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

      <div className="flex flex-col gap-4 w-full max-w-md">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.8 }}
            onClick={() => onSelect(mode.id)}
            className="text-left px-6 py-5 border border-gold/40 rounded-2xl
                       hover:border-gold/60 hover:bg-gold/[0.02] transition-all duration-700
                       group"
          >
            <span className="ui-text text-sm text-gold/80 group-hover:text-gold transition-colors duration-500">
              {mode.title}
            </span>
            <span className="narration-text text-sm text-[#e8e0d4]/40 mt-1 block">
              {mode.subtitle}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
