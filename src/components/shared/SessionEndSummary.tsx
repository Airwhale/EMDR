"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EndSummary, loadSummaryHistory, clearAllSessionHistory } from "@/lib/sessionPersistence";

interface SessionEndSummaryProps {
  mode: "emdr" | "art";
  sudStart: number | null;
  sudEnd: number | null;
  details: string[];
  completedAt?: string;
  onStartNewSession: () => void;
}

export default function SessionEndSummary({
  mode,
  sudStart,
  sudEnd,
  details,
  completedAt,
  onStartNewSession,
}: SessionEndSummaryProps) {
  const [history, setHistory] = useState<EndSummary[]>([]);
  const [historyCleared, setHistoryCleared] = useState(false);
  const sudImproved = sudStart !== null && sudEnd !== null && sudEnd < sudStart;
  const modeLabel = mode === "emdr" ? "EMDR" : "ART";
  const completedLabel = completedAt
    ? new Date(completedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : null;

  useEffect(() => {
    setHistory(loadSummaryHistory().slice(0, 5));
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-16 px-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-lg w-full"
      >
        <h1 className="narration-text text-3xl text-gold/80 text-center mb-2">
          {modeLabel} Session Complete
        </h1>
        <p className="ui-text text-center text-[#e8e0d4]/40 mb-2">
          Here&apos;s a summary of your session
        </p>
        {completedLabel && (
          <p className="ui-text text-center text-[#e8e0d4]/35 mb-8 text-xs">
            Completed {completedLabel}
          </p>
        )}

        {sudStart !== null && sudEnd !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="border border-gold/40 rounded-2xl p-6 mb-6"
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
                <span className="narration-text text-3xl text-gold/80">{sudEnd}</span>
                <p className="ui-text text-[10px] text-[#e8e0d4]/30 mt-1">after</p>
              </div>
            </div>
            {sudImproved && (
              <p className="narration-text text-sm text-gold/75 text-center mt-3">
                {sudStart - sudEnd} point{sudStart - sudEnd > 1 ? "s" : ""} of improvement
              </p>
            )}
          </motion.div>
        )}

        {details.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="border border-gold/40 rounded-2xl p-6 mb-6"
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

        {history.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1.5 }}
            className="border border-[#e8e0d4]/15 rounded-2xl p-6 mb-6"
          >
            <p className="ui-text text-[#e8e0d4]/45 mb-1">recent sessions</p>
            <p className="text-[10px] text-[#e8e0d4]/25 font-light mb-3">stored locally on this device</p>
            <ul className="space-y-2">
              {history.slice(1).map((item, i) => (
                <li key={`${item.completedAt}-${i}`} className="text-xs text-[#e8e0d4]/45 font-light flex justify-between gap-3">
                  <span>{item.mode.toUpperCase()}</span>
                  <span>
                    {item.sudStart ?? "?"} → {item.sudEnd ?? "?"}
                  </span>
                  <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="flex gap-6 justify-center"
        >
          <button
            onClick={onStartNewSession}
            className="px-8 py-3 border border-gold/35 rounded-full text-gold/80
                       hover:border-gold/70 hover:text-gold transition-all duration-700 ui-text"
          >
            New session
          </button>
          <Link
            href="/about?return=summary"
            className="px-8 py-3 border border-[#e8e0d4]/10 rounded-full text-[#e8e0d4]/40
                       hover:border-[#e8e0d4]/20 hover:text-[#e8e0d4]/60 transition-all duration-700 ui-text"
          >
            How it works
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1.5 }}
          className="mt-8 text-center"
        >
          {historyCleared ? (
            <span className="text-[11px] text-[#e8e0d4]/30 font-light">Session history cleared</span>
          ) : (
            <button
              onClick={() => {
                clearAllSessionHistory();
                setHistory([]);
                setHistoryCleared(true);
              }}
              className="text-[11px] text-[#e8e0d4]/25 hover:text-[#e8e0d4]/50
                         transition-colors duration-500 font-light"
            >
              Clear session history
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
