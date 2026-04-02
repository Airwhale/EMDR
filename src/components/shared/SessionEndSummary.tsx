"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface SessionEndSummaryProps {
  mode: "emdr" | "art";
  sudStart: number | null;
  sudEnd: number | null;
  details: string[];
}

export default function SessionEndSummary({
  mode,
  sudStart,
  sudEnd,
  details,
}: SessionEndSummaryProps) {
  const sudImproved = sudStart !== null && sudEnd !== null && sudEnd < sudStart;
  const modeLabel = mode === "emdr" ? "EMDR" : "ART";

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-16 px-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
        className="max-w-lg w-full"
      >
        <h1 className="narration-text text-3xl text-gold/80 text-center mb-2">
          {modeLabel} Session Complete
        </h1>
        <p className="ui-text text-center text-[#e8e0d4]/40 mb-10">
          Here&apos;s a summary of your session
        </p>

        {/* SUD change */}
        {sudStart !== null && sudEnd !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="border border-gold/10 rounded-2xl p-6 mb-6"
            style={{ background: "rgba(201, 169, 110, 0.02)" }}
          >
            <p className="ui-text text-[#e8e0d4]/50 mb-3">distress level</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <span className="narration-text text-3xl text-[#e8e0d4]/50">{sudStart}</span>
                <p className="ui-text text-[10px] text-[#e8e0d4]/30 mt-1">before</p>
              </div>
              <span className="text-gold/30">→</span>
              <div className="text-center">
                <span className="narration-text text-3xl text-gold/70">{sudEnd}</span>
                <p className="ui-text text-[10px] text-[#e8e0d4]/30 mt-1">after</p>
              </div>
            </div>
            {sudImproved && (
              <p className="narration-text text-sm text-gold/50 text-center mt-3">
                {sudStart - sudEnd} point{sudStart - sudEnd > 1 ? "s" : ""} of improvement
              </p>
            )}
          </motion.div>
        )}

        {/* Details */}
        {details.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="border border-gold/10 rounded-2xl p-6 mb-6"
            style={{ background: "rgba(201, 169, 110, 0.02)" }}
          >
            <p className="ui-text text-[#e8e0d4]/50 mb-3">
              {mode === "emdr" ? "exercises completed" : "processing rounds"}
            </p>
            <ul className="space-y-1">
              {details.map((d, i) => (
                <li key={i} className="text-sm text-[#e8e0d4]/50 font-light">{d}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Explanation */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.5 }}
          className="text-sm text-[#e8e0d4]/40 font-light leading-relaxed text-center mb-10"
        >
          {mode === "emdr"
            ? "These stabilization resources strengthen over time. The safe place and butterfly hug can be practiced anytime you need grounding."
            : "With ART, the original memory remains but the emotional charge often diminishes. The new image you chose can continue to replace the old one when the memory arises."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="flex gap-6 justify-center"
        >
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 border border-gold/20 rounded-full text-gold/60
                       hover:border-gold/40 hover:text-gold/80 transition-all duration-700 ui-text"
          >
            New session
          </button>
          <Link
            href="/about"
            className="px-8 py-3 border border-[#e8e0d4]/10 rounded-full text-[#e8e0d4]/40
                       hover:border-[#e8e0d4]/20 hover:text-[#e8e0d4]/60 transition-all duration-700 ui-text"
          >
            How it works
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
