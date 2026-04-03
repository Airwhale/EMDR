"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import { TranceVoice } from "@/lib/TranceVoice";
import { sessionScript, PhaseId, ExperimentResult } from "@/lib/sessionScript";
import BreathingGuide from "@/components/BreathingGuide";
import NarrationDisplay from "@/components/NarrationDisplay";
import EmdrDot from "@/components/EmdrDot";
import HypnoticSpiral from "@/components/HypnoticSpiral";
import PhoticFlicker from "@/components/PhoticFlicker";
import Vignette from "@/components/Vignette";
import Staircase from "@/components/Staircase";
import EmergenceSequence from "@/components/EmergenceSequence";
import SessionSummary from "@/components/SessionSummary";
import ArmLevitation from "@/components/experiments/ArmLevitation";
import TimeDistortion from "@/components/experiments/TimeDistortion";
import SensoryAmplification from "@/components/experiments/SensoryAmplification";
import ChevreuPendulum from "@/components/experiments/ChevreuPendulum";
import { loadTrancePrefs, saveTrancePrefs } from "@/lib/sessionPersistence";

type ExperimentId = "arm" | "time" | "sensory" | "pendulum";
const EXPERIMENT_ORDER: ExperimentId[] = ["arm", "time", "sensory", "pendulum"];

type TrancePhase = Exclude<PhaseId, "entry">;

interface TranceSessionProps {
  onExit?: () => void;
}

export default function TranceSession({ onExit }: TranceSessionProps) {
  const [phase, setPhase] = useState<TrancePhase>("fixation");
  const [currentNarration, setCurrentNarration] = useState<string | null>(null);
  const [experimentIndex, setExperimentIndex] = useState(0);
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [vignetteIntensity, setVignetteIntensity] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [breathSlowdown, setBreathSlowdown] = useState(1.0);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);

  const bgColors: Record<string, string> = {
    fixation: "#0a0a14",
    deepening: "#0d0a18",
    staircase: "#08081a",
    experiments: "#0a0a12",
    emergence: "#0f0f18",
    summary: "#0a0a0f",
  };

  // Init audio + voice on mount
  useEffect(() => {
    const prefs = loadTrancePrefs();
    setVoiceEnabled(prefs.voiceEnabled);

    const audio = new TranceAudioEngine();
    audio.init("trance");
    audio.fadeIn(20, 0.45);
    audioRef.current = audio;

    const voice = new TranceVoice();
    voice.init();
    voice.setEnabled(prefs.voiceEnabled);
    voiceRef.current = voice;
    setVoiceAvailable(voice.isSupported());

    return () => {
      audio.stop();
      voice.stop();
    };
  }, []);

  const speakNarration = useCallback(
    (text: string, spoken?: string) => {
      if (!voiceEnabled) return;
      voiceRef.current?.speak(spoken || text);
    },
    [voiceEnabled]
  );

  const schedulePhaseNarration = useCallback(
    (phaseId: PhaseId, onComplete?: () => void) => {
      const script = sessionScript.find((p) => p.id === phaseId)!;
      let cumulative = 0;
      const timers: ReturnType<typeof setTimeout>[] = [];

      script.narration.forEach((cue) => {
        cumulative += cue.delay;
        const show = cumulative;
        const hide = show + cue.duration;
        timers.push(
          setTimeout(() => {
            setCurrentNarration(cue.text);
            speakNarration(cue.text, cue.spoken);
          }, show)
        );
        timers.push(setTimeout(() => setCurrentNarration(null), hide));
        cumulative = hide;
      });

      if (onComplete) {
        timers.push(setTimeout(onComplete, cumulative + 2000));
      }

      return () => timers.forEach(clearTimeout);
    },
    [speakNarration]
  );

  // ---- FIXATION ----
  useEffect(() => {
    if (phase !== "fixation") return;
    setVignetteIntensity(0.2);
    setBreathSlowdown(1.0);

    const cleanup = schedulePhaseNarration("fixation", () => {
      setCurrentNarration(null);
      setPhase("deepening");
    });
    const slowTimers = [
      setTimeout(() => setBreathSlowdown(1.1), 38000),
      setTimeout(() => setBreathSlowdown(1.2), 74000),
      setTimeout(() => setBreathSlowdown(1.35), 110000),
    ];
    return () => { cleanup?.(); slowTimers.forEach(clearTimeout); };
  }, [phase, schedulePhaseNarration]);

  // ---- DEEPENING ----
  useEffect(() => {
    if (phase !== "deepening") return;
    audioRef.current?.setMasterVolume(0.6, 8);
    audioRef.current?.setDepth(0.4);
    setVignetteIntensity(0.45);
    setBreathSlowdown(1.4);

    const cleanup = schedulePhaseNarration("deepening", () => {
      setCurrentNarration(null);
      setPhase("staircase");
    });
    const slowTimers = [
      setTimeout(() => setBreathSlowdown(1.5), 30000),
      setTimeout(() => setBreathSlowdown(1.6), 60000),
      setTimeout(() => setBreathSlowdown(1.7), 85000),
    ];
    return () => { cleanup?.(); slowTimers.forEach(clearTimeout); };
  }, [phase, schedulePhaseNarration]);

  // ---- STAIRCASE ----
  const handleStaircaseStep = useCallback((step: number) => {
    const pitchOffset = (10 - step) * 2;
    audioRef.current?.shiftPitch(100 - pitchOffset, 3);
    audioRef.current?.setDepth(0.5 + (10 - step) * 0.05);
    audioRef.current?.setMasterVolume(0.65 + (10 - step) * 0.012, 3);
    setVignetteIntensity(0.55 + (10 - step) * 0.035);
  }, []);

  const handleStaircaseComplete = useCallback(() => setPhase("experiments"), []);

  useEffect(() => {
    if (phase !== "staircase") return;
    audioRef.current?.setMasterVolume(0.65, 6);
    audioRef.current?.setDepth(0.5);
    setVignetteIntensity(0.55);
    setBreathSlowdown(1.75);
    const cleanup = schedulePhaseNarration("staircase");
    return cleanup;
  }, [phase, schedulePhaseNarration]);

  // ---- EXPERIMENTS ----
  useEffect(() => {
    if (phase !== "experiments") return;
    audioRef.current?.setMasterVolume(0.35, 6);
    audioRef.current?.setDepth(0.25);
    setVignetteIntensity(0.2);

    const script = sessionScript.find((p) => p.id === "experiments")!;
    if (script.narration.length > 0) {
      const cue = script.narration[0];
      const t1 = setTimeout(() => {
        setCurrentNarration(cue.text);
        speakNarration(cue.text, cue.spoken);
      }, cue.delay);
      const t2 = setTimeout(() => setCurrentNarration(null), cue.delay + cue.duration);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [phase, speakNarration]);

  const handleExperimentComplete = useCallback(
    (result: ExperimentResult) => {
      setResults((prev) => [...prev, result]);
      const nextIdx = experimentIndex + 1;
      if (nextIdx >= EXPERIMENT_ORDER.length) setPhase("emergence");
      else setExperimentIndex(nextIdx);
    },
    [experimentIndex]
  );

  // ---- EMERGENCE ----
  useEffect(() => {
    if (phase !== "emergence") return;
    audioRef.current?.setMasterVolume(0.5, 4);
    audioRef.current?.emerge(30);
  }, [phase]);

  const handleEmergenceStep = useCallback((step: number) => {
    audioRef.current?.setMasterVolume(0.5 - step * 0.08, 3);
    setVignetteIntensity(Math.max(0, 0.2 - step * 0.04));
  }, []);

  const handleEmergenceComplete = useCallback(() => {
    audioRef.current?.fadeOut(10);
    setTimeout(() => audioRef.current?.stop(), 11000);
    voiceRef.current?.stop();
    setVignetteIntensity(0);
    setPhase("summary");
  }, []);

  const handleSkip = useCallback(() => {
    setPhase("experiments");
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      voiceRef.current?.setEnabled(next);
      saveTrancePrefs({ voiceEnabled: next });
      return next;
    });
  }, []);

  const currentExperiment = EXPERIMENT_ORDER[experimentIndex];
  const showSpiral = phase === "fixation" || phase === "deepening";
  const showPhotic = phase === "deepening" || phase === "staircase";

  return (
    <main
      className="relative w-screen h-screen flex items-center justify-center overflow-hidden transition-colors duration-[5000ms]"
      style={{ backgroundColor: bgColors[phase] || "#0a0a0f" }}
    >
      <Vignette intensity={vignetteIntensity} />
      <PhoticFlicker active={showPhotic} frequency={phase === "staircase" ? 6 : 8} intensity={0.02} />

      <AnimatePresence mode="wait">
        {phase === "fixation" && (
          <motion.div key="fixation" className="flex flex-col items-center gap-8 z-10 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div className="relative flex items-center justify-center">
              {showSpiral && <HypnoticSpiral opacity={0.05} speed={12} size={450} />}
              <BreathingGuide isActive={true} size="full" showSpiral={true} slowdown={breathSlowdown} />
              <EmdrDot cycleDuration={4} size={18} rangeVw={35} />
            </div>
            <NarrationDisplay text={currentNarration} />
          </motion.div>
        )}

        {phase === "deepening" && (
          <motion.div key="deepening" className="flex flex-col items-center w-full h-full z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div className="absolute top-12"><BreathingGuide isActive={true} size="small" slowdown={breathSlowdown} /></div>
            {showSpiral && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><HypnoticSpiral opacity={0.04} speed={8} size={600} /></div>}
            <div className="flex-1 flex items-center justify-center"><NarrationDisplay text={currentNarration} size="large" /></div>
          </motion.div>
        )}

        {phase === "staircase" && (
          <motion.div key="staircase" className="w-full h-full flex flex-col items-center z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div className="absolute top-12"><BreathingGuide isActive={true} size="small" slowdown={breathSlowdown} /></div>
            <div className="absolute top-32 z-10"><NarrationDisplay text={currentNarration} /></div>
            <Staircase isActive={true} onComplete={handleStaircaseComplete} onStep={handleStaircaseStep} />
          </motion.div>
        )}

        {phase === "experiments" && (
          <motion.div key="experiments" className="w-full h-full z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            {currentNarration && experimentIndex === 0 && (
              <div className="absolute top-1/3 left-0 right-0 z-10"><NarrationDisplay text={currentNarration} size="large" /></div>
            )}
            <AnimatePresence mode="wait">
              {currentExperiment === "arm" && <motion.div key="arm" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}><ArmLevitation isActive={true} onComplete={handleExperimentComplete} /></motion.div>}
              {currentExperiment === "time" && <motion.div key="time" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}><TimeDistortion isActive={true} onComplete={handleExperimentComplete} /></motion.div>}
              {currentExperiment === "sensory" && <motion.div key="sensory" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}><SensoryAmplification isActive={true} onComplete={handleExperimentComplete} /></motion.div>}
              {currentExperiment === "pendulum" && <motion.div key="pendulum" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}><ChevreuPendulum isActive={true} onComplete={handleExperimentComplete} /></motion.div>}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "emergence" && (
          <motion.div key="emergence" className="w-full h-full z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <EmergenceSequence isActive={true} onComplete={handleEmergenceComplete} onStep={handleEmergenceStep} />
          </motion.div>
        )}

        {phase === "summary" && (
          <motion.div key="summary" className="w-full h-full overflow-y-auto z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <SessionSummary results={results} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit button */}
      {onExit && phase !== "summary" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          whileHover={{ opacity: 0.6 }}
          transition={{ duration: 0.8 }}
          onClick={() => {
            audioRef.current?.fadeOut(3);
            setTimeout(() => audioRef.current?.stop(), 3500);
            voiceRef.current?.stop();
            onExit();
          }}
          className="fixed top-4 left-4 z-50 ui-text text-[10px] text-[#e8e0d4]/25
                     hover:text-[#e8e0d4]/60 transition-colors duration-500"
        >
          ← exit
        </motion.button>
      )}

      <div className="fixed bottom-4 left-0 right-0 flex justify-between px-4 z-50">
        {phase !== "summary" && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} whileHover={{ opacity: 0.5 }} transition={{ duration: 1 }} onClick={toggleVoice}
            className="ui-text text-[10px] text-[#e8e0d4]/30 hover:text-[#e8e0d4]/50 transition-colors duration-500">
            voice {voiceEnabled ? "on" : "off"}
          </motion.button>
        )}
        <div />
        {!["experiments", "emergence", "summary"].includes(phase) && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} whileHover={{ opacity: 0.4 }} transition={{ duration: 1 }} onClick={handleSkip}
            className="ui-text text-[10px] text-[#e8e0d4]/30 hover:text-[#e8e0d4]/50 transition-colors duration-500">
            skip to playground →
          </motion.button>
        )}
      </div>

      {!voiceAvailable && phase !== "summary" && (
        <div className="fixed bottom-4 left-4 z-50 text-[11px] ui-text px-3 py-2 rounded-full border border-[#e8e0d4]/20 text-[#e8e0d4]/55">
          Voice unavailable in this browser — text guidance only
        </div>
      )}
    </main>
  );
}
