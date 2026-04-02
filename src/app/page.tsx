"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModeSelect, { SessionMode } from "@/components/shared/ModeSelect";
import EmdrDot from "@/components/EmdrDot";
import TranceSession from "@/components/TranceSession";
import EmdrSession, { EmdrSummaryData } from "@/components/emdr/EmdrSession";
import ArtSession, { ArtSummaryData } from "@/components/art/ArtSession";
import SessionEndSummary from "@/components/shared/SessionEndSummary";

type AppState = "entry" | "mode-select" | "session" | "end-summary";

export default function App() {
  const [appState, setAppState] = useState<AppState>("entry");
  const [showReady, setShowReady] = useState(false);
  const [entryTextVisible, setEntryTextVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null);

  // EMDR/ART summary data
  const [endSummary, setEndSummary] = useState<{
    mode: "emdr" | "art";
    sudStart: number | null;
    sudEnd: number | null;
    details: string[];
  } | null>(null);

  // Entry timing
  useEffect(() => {
    if (appState !== "entry") return;
    const t1 = setTimeout(() => setEntryTextVisible(true), 3000);
    const t2 = setTimeout(() => setShowReady(true), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [appState]);

  const handleReady = useCallback(() => {
    setAppState("mode-select");
  }, []);

  const handleModeSelect = useCallback((mode: SessionMode) => {
    setSelectedMode(mode);
    setAppState("session");
  }, []);

  const handleEmdrComplete = useCallback((data: EmdrSummaryData) => {
    setEndSummary({
      mode: "emdr",
      sudStart: data.sudStart,
      sudEnd: data.sudEnd,
      details: data.exercisesCompleted,
    });
    setAppState("end-summary");
  }, []);

  const handleArtComplete = useCallback((data: ArtSummaryData) => {
    setEndSummary({
      mode: "art",
      sudStart: data.sudStart,
      sudEnd: data.sudEnd,
      details: [`${data.rounds} processing round${data.rounds !== 1 ? "s" : ""} completed`],
    });
    setAppState("end-summary");
  }, []);

  return (
    <div className="w-screen h-screen bg-trance-dark overflow-hidden">
      <AnimatePresence mode="wait">
        {/* =================== ENTRY =================== */}
        {appState === "entry" && (
          <motion.main
            key="entry"
            className="w-full h-full flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <div className="flex flex-col items-center gap-12 z-10">
              {/* Slow dot on entry */}
              <div className="relative w-full" style={{ height: 56 }}>
                <EmdrDot cycleDuration={5} size={12} rangeVw={30} />
              </div>

              <AnimatePresence>
                {entryTextVisible && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ duration: 3 }}
                    className="narration-text text-xl md:text-2xl text-center max-w-lg text-[#e8e0d4]/70"
                  >
                    Find a comfortable position. Put on headphones for the full
                    experience.
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showReady && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    onClick={handleReady}
                    className="px-10 py-4 border border-gold/30 rounded-full text-gold/70
                               hover:border-gold/50 hover:text-gold transition-all duration-1000
                               ui-text tracking-widest"
                  >
                    I&apos;m ready
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        )}

        {/* =================== MODE SELECT =================== */}
        {appState === "mode-select" && (
          <motion.main
            key="mode-select"
            className="w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <ModeSelect onSelect={handleModeSelect} />
          </motion.main>
        )}

        {/* =================== SESSION =================== */}
        {appState === "session" && selectedMode === "trance" && (
          <motion.div
            key="trance-session"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <TranceSession />
          </motion.div>
        )}

        {appState === "session" && selectedMode === "emdr" && (
          <motion.main
            key="emdr-session"
            className="w-full h-full bg-trance-dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <EmdrSession onComplete={handleEmdrComplete} />
          </motion.main>
        )}

        {appState === "session" && selectedMode === "art" && (
          <motion.main
            key="art-session"
            className="w-full h-full bg-trance-dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <ArtSession onComplete={handleArtComplete} />
          </motion.main>
        )}

        {/* =================== END SUMMARY (EMDR/ART) =================== */}
        {appState === "end-summary" && endSummary && (
          <motion.main
            key="end-summary"
            className="w-full h-full bg-trance-dark overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <SessionEndSummary
              mode={endSummary.mode}
              sudStart={endSummary.sudStart}
              sudEnd={endSummary.sudEnd}
              details={endSummary.details}
            />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
