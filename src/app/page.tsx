"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModeSelect, { SessionMode } from "@/components/shared/ModeSelect";
import LearnContent from "@/components/shared/LearnContent";
import EmdrDot from "@/components/EmdrDot";
import TranceSession from "@/components/TranceSession";
import EmdrSession, { EmdrSummaryData } from "@/components/emdr/EmdrSession";
import ArtSession, { ArtSummaryData } from "@/components/art/ArtSession";
import SessionEndSummary from "@/components/shared/SessionEndSummary";
import SafetyGate from "@/components/shared/SafetyGate";
import {
  appendSummaryToHistory,
  clearAppSnapshot,
  EndSummary,
  loadAppSnapshot,
  loadLatestEndSummary,
  saveAppSnapshot,
  saveLatestEndSummary,
} from "@/lib/sessionPersistence";

type AppState = "entry" | "learn" | "safety" | "mode-select" | "session" | "end-summary";

export default function App() {
  const [appState, setAppState] = useState<AppState>("entry");
  const [isHydrated, setIsHydrated] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [entryTextVisible, setEntryTextVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null);

  // EMDR/ART summary data
  const [endSummary, setEndSummary] = useState<EndSummary | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shouldReturnSummary = params.get("return") === "summary";

    if (shouldReturnSummary) {
      const latestSummary = loadLatestEndSummary();
      if (latestSummary) {
        setEndSummary(latestSummary);
        setSelectedMode(latestSummary.mode);
        setAppState("end-summary");
        setIsHydrated(true);
        return;
      }
    }

    const saved = loadAppSnapshot();
    if (saved && saved.appState === "end-summary" && saved.endSummary) {
      setSelectedMode(saved.selectedMode);
      setEndSummary(saved.endSummary);
      setAppState("end-summary");
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveAppSnapshot({
      appState,
      selectedMode,
      endSummary,
      updatedAt: new Date().toISOString(),
    });
  }, [appState, selectedMode, endSummary, isHydrated]);

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
    setAppState("safety");
  }, []);

  const handleSafetyContinue = useCallback(() => {
    setAppState("mode-select");
  }, []);

  const handleSafetyBack = useCallback(() => {
    setAppState("entry");
  }, []);

  const handleModeSelect = useCallback((mode: SessionMode) => {
    setSelectedMode(mode);
    setAppState("session");
  }, []);

  const handleEmdrComplete = useCallback((data: EmdrSummaryData) => {
    const summary: EndSummary = {
      mode: "emdr",
      sudStart: data.sudStart,
      sudEnd: data.sudEnd,
      details: data.exercisesCompleted,
      completedAt: new Date().toISOString(),
    };
    setEndSummary(summary);
    saveLatestEndSummary(summary);
    appendSummaryToHistory(summary);
    setAppState("end-summary");
  }, []);

  const handleArtComplete = useCallback((data: ArtSummaryData) => {
    const summary: EndSummary = {
      mode: "art",
      sudStart: data.sudStart,
      sudEnd: data.sudEnd,
      details: [`${data.rounds} processing round${data.rounds !== 1 ? "s" : ""} completed`],
      completedAt: new Date().toISOString(),
    };
    setEndSummary(summary);
    saveLatestEndSummary(summary);
    appendSummaryToHistory(summary);
    setAppState("end-summary");
  }, []);

  const handleStartNewSession = useCallback(() => {
    clearAppSnapshot();
    setSelectedMode(null);
    setEndSummary(null);
    setShowReady(false);
    setEntryTextVisible(false);
    setAppState("entry");
  }, []);

  if (!isHydrated) {
    return (
      <div className="w-screen h-screen bg-trance-dark flex items-center justify-center">
        <p className="ui-text text-xs text-[#e8e0d4]/40 tracking-widest">Loading…</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-trance-dark overflow-hidden">
      <AnimatePresence mode="wait">
        {/* =================== ENTRY =================== */}
        {appState === "entry" && (
          <motion.main
            key="entry"
            className="w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center gap-10 z-10">
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                transition={{ duration: 0.8 }}
                className="narration-text text-3xl md:text-4xl text-gold/85 text-center"
              >
                EMDR / ART Self-Administered Experience
              </motion.h1>

              {/* Slow dot on entry */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative w-full"
                style={{ height: 56 }}
              >
                <EmdrDot cycleDuration={5} size={18} rangeVw={30} />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: entryTextVisible ? 0.7 : 0 }}
                transition={{ duration: 0.8 }}
                className="narration-text text-lg md:text-xl text-center max-w-lg text-[#e8e0d4]/60"
              >
                Find a comfortable position. Put on headphones for the full
                experience.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showReady ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center gap-5"
                style={{ pointerEvents: showReady ? "auto" : "none" }}
              >
                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleReady}
                    className="px-10 py-4 border border-gold/40 rounded-full text-gold/80
                               hover:border-gold/70 hover:text-gold transition-all duration-700
                               ui-text tracking-widest"
                  >
                    I&apos;m ready
                  </button>
                  <button
                    onClick={() => setAppState("learn")}
                    className="px-6 py-4 border border-[#e8e0d4]/25 rounded-full text-[#e8e0d4]/50
                               hover:border-[#e8e0d4]/45 hover:text-[#e8e0d4]/80
                               transition-all duration-700 ui-text tracking-widest"
                  >
                    What is this?
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      document.documentElement.requestFullscreen().catch(() => {});
                    }
                  }}
                  className="px-5 py-2 border border-[#e8e0d4]/20 rounded-full text-[#e8e0d4]/40
                             hover:border-[#e8e0d4]/40 hover:text-[#e8e0d4]/70
                             transition-all duration-700 ui-text text-[10px]"
                >
                  full screen
                </button>
              </motion.div>
            </div>
          </motion.main>
        )}

        {/* =================== LEARN =================== */}
        {appState === "learn" && (
          <motion.main
            key="learn"
            className="w-full h-full overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <LearnContent
              onBack={() => setAppState("entry")}
              onReady={handleReady}
            />
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
            transition={{ duration: 0.8 }}
          >
            <ModeSelect onSelect={handleModeSelect} />
          </motion.main>
        )}

        {appState === "safety" && (
          <SafetyGate onContinue={handleSafetyContinue} onBack={handleSafetyBack} />
        )}

        {/* =================== SESSION =================== */}
        {appState === "session" && selectedMode === "trance" && (
          <motion.div
            key="trance-session"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
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
            transition={{ duration: 0.8 }}
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
            transition={{ duration: 0.8 }}
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
            transition={{ duration: 0.8 }}
          >
            <SessionEndSummary
              mode={endSummary.mode}
              sudStart={endSummary.sudStart}
              sudEnd={endSummary.sudEnd}
              details={endSummary.details}
              completedAt={endSummary.completedAt}
              onStartNewSession={handleStartNewSession}
            />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
