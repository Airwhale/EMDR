"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import { TranceVoice } from "@/lib/TranceVoice";
import { sessionScript, NarrationCue } from "@/lib/sessionScript";
import BreathingGuide from "@/components/BreathingGuide";
import NarrationDisplay from "@/components/NarrationDisplay";
import EmdrDot from "@/components/EmdrDot";
import HypnoticSpiral from "@/components/HypnoticSpiral";
import PhoticFlicker from "@/components/PhoticFlicker";
import Vignette from "@/components/Vignette";
import Staircase from "@/components/Staircase";

type MedPhase = "fixation" | "deepening" | "staircase" | "sustain" | "emergence" | "complete";

interface MeditationSessionProps {
  onComplete: () => void;
  onExit: () => void;
}

// Extended deepening narration — cycles through these during the sustained phase
const sustainCues: NarrationCue[] = [
  { text: "deeper", spoken: "Sinking deeper... with every breath... that's right...", delay: 25000, duration: 6000 },
  { text: "stillness", spoken: "You are exactly where you need to be... surrounded by stillness...", delay: 25000, duration: 6000 },
  { text: "deeper", spoken: "Each exhale takes you further down... deeper... and deeper...", delay: 30000, duration: 6000 },
  { text: "peace", spoken: "Your mind is quiet... your body is soft... everything... is at peace...", delay: 30000, duration: 6000 },
  { text: "drifting", spoken: "You might notice how far you've drifted... and that's perfectly fine...", delay: 30000, duration: 6000 },
  { text: "deeper", spoken: "Deeper still... every sound around you... takes you further in...", delay: 25000, duration: 6000 },
  { text: "let go", spoken: "Let go of the last thread of effort... there is only calm...", delay: 30000, duration: 6000 },
  { text: "relaxed", spoken: "You are deeply... profoundly... relaxed...", delay: 30000, duration: 6000 },
  { text: "rest", spoken: "Rest here... in this deep... comfortable place...", delay: 35000, duration: 6000 },
  { text: "peaceful", spoken: "With each breath... deeper... and more peaceful...", delay: 30000, duration: 6000 },
];

const emergenceCues: NarrationCue[] = [
  { text: "In a moment, you'll begin to return... there's no rush...", spoken: "In a moment... you'll begin to return... there's no rush...", delay: 2000, duration: 8000 },
  { text: "1 — a gentle stirring of awareness...", spoken: "One... a gentle stirring of awareness...", delay: 8000, duration: 6000 },
  { text: "2 — becoming more aware of your surroundings...", spoken: "Two... becoming more aware... of your surroundings...", delay: 7000, duration: 6000 },
  { text: "3 — energy returning to your body...", spoken: "Three... feeling energy returning to your body...", delay: 7000, duration: 6000 },
  { text: "4 — almost there... take a deep breath...", spoken: "Four... almost there... take a deep breath in...", delay: 7000, duration: 6000 },
  { text: "5 — eyes open, fully alert, feeling refreshed.", spoken: "Five... eyes open... wide awake... fully alert... feeling wonderful... refreshed... and clear.", delay: 7000, duration: 8000 },
];

export default function MeditationSession({ onComplete, onExit }: MeditationSessionProps) {
  const [phase, setPhase] = useState<MedPhase>("fixation");
  const [currentNarration, setCurrentNarration] = useState<string | null>(null);
  const [vignetteIntensity, setVignetteIntensity] = useState(0);
  const [breathSlowdown, setBreathSlowdown] = useState(1.0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);
  const sustainIndexRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Init audio + voice
  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("trance");
    audio.fadeIn(20, 0.5);
    audioRef.current = audio;

    const voice = new TranceVoice();
    voice.init();
    voiceRef.current = voice;

    startTimeRef.current = Date.now();

    return () => { audio.stop(); voice.stop(); };
  }, []);

  // Elapsed time tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const speakNarration = useCallback(
    (text: string, spoken?: string) => {
      if (!voiceEnabled) return;
      voiceRef.current?.speak(spoken || text);
    },
    [voiceEnabled]
  );

  const scheduleNarrationCues = useCallback(
    (cues: NarrationCue[], onDone?: () => void) => {
      let cumulative = 0;
      const timers: ReturnType<typeof setTimeout>[] = [];

      cues.forEach((cue) => {
        cumulative += cue.delay;
        const show = cumulative;
        const hide = show + cue.duration;
        timers.push(setTimeout(() => {
          setCurrentNarration(cue.text);
          speakNarration(cue.text, cue.spoken);
        }, show));
        timers.push(setTimeout(() => setCurrentNarration(null), hide));
        cumulative = hide;
      });

      if (onDone) {
        timers.push(setTimeout(onDone, cumulative + 2000));
      }

      return () => timers.forEach(clearTimeout);
    },
    [speakNarration]
  );

  // ---- FIXATION (reuse trance script) ----
  useEffect(() => {
    if (phase !== "fixation") return;
    setVignetteIntensity(0.2);
    setBreathSlowdown(1.0);

    const script = sessionScript.find((p) => p.id === "fixation")!;
    const cleanup = scheduleNarrationCues(script.narration, () => {
      setCurrentNarration(null);
      setPhase("deepening");
    });
    const slowTimers = [
      setTimeout(() => setBreathSlowdown(1.1), 38000),
      setTimeout(() => setBreathSlowdown(1.2), 74000),
      setTimeout(() => setBreathSlowdown(1.35), 110000),
    ];
    return () => { cleanup(); slowTimers.forEach(clearTimeout); };
  }, [phase, scheduleNarrationCues]);

  // ---- DEEPENING (reuse trance script) ----
  useEffect(() => {
    if (phase !== "deepening") return;
    audioRef.current?.setMasterVolume(0.6, 8);
    audioRef.current?.setDepth(0.4);
    setVignetteIntensity(0.45);
    setBreathSlowdown(1.4);

    const script = sessionScript.find((p) => p.id === "deepening")!;
    const cleanup = scheduleNarrationCues(script.narration, () => {
      setCurrentNarration(null);
      setPhase("staircase");
    });
    const slowTimers = [
      setTimeout(() => setBreathSlowdown(1.5), 30000),
      setTimeout(() => setBreathSlowdown(1.6), 60000),
      setTimeout(() => setBreathSlowdown(1.7), 85000),
    ];
    return () => { cleanup(); slowTimers.forEach(clearTimeout); };
  }, [phase, scheduleNarrationCues]);

  // ---- STAIRCASE ----
  const numberWords = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const handleStaircaseStep = useCallback((step: number) => {
    const pitchOffset = (10 - step) * 2;
    audioRef.current?.shiftPitch(100 - pitchOffset, 3);
    audioRef.current?.setDepth(0.5 + (10 - step) * 0.05);
    audioRef.current?.setMasterVolume(0.65 + (10 - step) * 0.012, 3);
    setVignetteIntensity(0.55 + (10 - step) * 0.035);
    // Speak the number
    speakNarration(numberWords[step] || String(step));
  }, [speakNarration]);

  const handleStaircaseComplete = useCallback(() => {
    setPhase("sustain");
  }, []);

  useEffect(() => {
    if (phase !== "staircase") return;
    audioRef.current?.setMasterVolume(0.65, 6);
    audioRef.current?.setDepth(0.5);
    setVignetteIntensity(0.55);
    setBreathSlowdown(1.75);

    const script = sessionScript.find((p) => p.id === "staircase")!;
    const cleanup = scheduleNarrationCues(script.narration);
    return cleanup;
  }, [phase, scheduleNarrationCues]);

  // ---- SUSTAINED DEEP MEDITATION (loops narration cues) ----
  useEffect(() => {
    if (phase !== "sustain") return;
    audioRef.current?.setMasterVolume(0.55, 8);
    audioRef.current?.setDepth(0.8);
    setVignetteIntensity(0.7);
    setBreathSlowdown(1.9);

    const runNextCue = () => {
      const idx = sustainIndexRef.current % sustainCues.length;
      const cue = sustainCues[idx];
      sustainIndexRef.current++;

      const showTimer = setTimeout(() => {
        setCurrentNarration(cue.text);
        speakNarration(cue.text, cue.spoken);
      }, cue.delay);

      const hideTimer = setTimeout(() => {
        setCurrentNarration(null);
      }, cue.delay + cue.duration);

      const nextTimer = setTimeout(runNextCue, cue.delay + cue.duration + 2000);

      return [showTimer, hideTimer, nextTimer];
    };

    const timers = runNextCue();
    return () => timers.forEach(clearTimeout);
  }, [phase, speakNarration]);

  // ---- END MEDITATION (user-triggered) ----
  const handleEndMeditation = useCallback(() => {
    setPhase("emergence");
  }, []);

  // ---- EMERGENCE ----
  useEffect(() => {
    if (phase !== "emergence") return;
    setBreathSlowdown(1.2);
    setVignetteIntensity(0.3);
    audioRef.current?.setMasterVolume(0.5, 4);
    audioRef.current?.emerge(30);

    const cleanup = scheduleNarrationCues(emergenceCues, () => {
      audioRef.current?.fadeOut(10);
      setTimeout(() => audioRef.current?.stop(), 11000);
      voiceRef.current?.stop();
      setVignetteIntensity(0);
      setPhase("complete");
    });

    // Progressive brightening
    const brightenTimers = [
      setTimeout(() => { setVignetteIntensity(0.2); setBreathSlowdown(1.1); }, 10000),
      setTimeout(() => { setVignetteIntensity(0.1); setBreathSlowdown(1.0); }, 24000),
      setTimeout(() => setVignetteIntensity(0), 38000),
    ];

    return () => { cleanup(); brightenTimers.forEach(clearTimeout); };
  }, [phase, scheduleNarrationCues]);

  // ---- COMPLETE ----
  useEffect(() => {
    if (phase !== "complete") return;
    // Small delay before showing summary
    const t = setTimeout(onComplete, 2000);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      voiceRef.current?.setEnabled(next);
      return next;
    });
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const showPhotic = phase === "deepening" || phase === "staircase" || phase === "sustain";
  const showEndButton = phase === "sustain" || phase === "staircase" || phase === "deepening";

  const bgColors: Record<string, string> = {
    fixation: "#0a0a14",
    deepening: "#0d0a18",
    staircase: "#08081a",
    sustain: "#06061a",
    emergence: "#0f0f18",
    complete: "#0a0a0f",
  };

  return (
    <main
      className="relative w-screen h-screen flex items-center justify-center overflow-hidden transition-colors duration-[5000ms]"
      style={{ backgroundColor: bgColors[phase] || "#0a0a0f" }}
    >
      <Vignette intensity={vignetteIntensity} />
      <PhoticFlicker active={showPhotic} frequency={phase === "sustain" ? 5 : phase === "staircase" ? 6 : 8} intensity={phase === "sustain" ? 0.025 : 0.03} />

      {/* Persistent breathing guide — never unmounts, so animation is continuous */}
      {phase !== "emergence" && phase !== "complete" && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative flex items-center justify-center">
            <HypnoticSpiral opacity={phase === "sustain" ? 0.03 : 0.05} speed={phase === "sustain" ? 6 : 10} size={700} />
            <BreathingGuide isActive={true} size="large" showSpiral={true} slowdown={breathSlowdown}
              onPhaseChange={(p) => {
                audioRef.current?.playBreathCue(p);
                audioRef.current?.setBreathDroneModulation(p === "inhale" ? 1 : p === "hold" ? 0.7 : 0, p === "inhale" ? 4 : 6);
              }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* FIXATION — dot + narration overlay */}
        {phase === "fixation" && (
          <motion.div key="med-fixation" className="absolute inset-0 flex flex-col items-center justify-center z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <EmdrDot cycleDuration={4} size={18} rangeVw={35} />
          </motion.div>
        )}

        {/* DEEPENING — narration below circle */}
        {phase === "deepening" && (
          <motion.div key="med-deepening" className="absolute inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} />
        )}

        {/* STAIRCASE — numbers overlaid on circle, narration below */}
        {phase === "staircase" && (
          <motion.div key="med-staircase" className="absolute inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Staircase isActive={true} onComplete={handleStaircaseComplete} onStep={handleStaircaseStep} />
            </div>
          </motion.div>
        )}

        {/* SUSTAINED — key word below circle */}
        {phase === "sustain" && (
          <motion.div key="med-sustain" className="absolute inset-0 flex items-end justify-center pb-[15%] z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            {currentNarration && (
              <p className="narration-text text-glow text-2xl text-gold/40 text-center">{currentNarration}</p>
            )}
          </motion.div>
        )}

        {/* EMERGENCE */}
        {phase === "emergence" && (
          <motion.div key="med-emergence" className="flex flex-col items-center w-full h-full z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex-1 flex items-center justify-center"><NarrationDisplay text={currentNarration} size="large" /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit button — top left */}
      {phase !== "emergence" && phase !== "complete" && (
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

      {/* Bottom controls */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-between items-end px-4 z-50">
        {/* Voice toggle */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} whileHover={{ opacity: 0.5 }} transition={{ duration: 0.8 }} onClick={toggleVoice}
          className="ui-text text-[10px] text-[#e8e0d4]/30 hover:text-[#e8e0d4]/50 transition-colors duration-500">
          voice {voiceEnabled ? "on" : "off"}
        </motion.button>

        {/* Timer */}
        <span className="ui-text text-[10px] text-[#e8e0d4]/20">{formatTime(elapsed)}</span>

        {/* End meditation button */}
        {showEndButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 0.9 }}
            transition={{ duration: 0.8 }}
            onClick={handleEndMeditation}
            className="px-5 py-2 border border-[#e8e0d4]/25 rounded-full text-[#e8e0d4]/45
                       hover:border-[#e8e0d4]/50 hover:text-[#e8e0d4]/80
                       transition-all duration-500 ui-text text-[10px]"
          >
            end meditation
          </motion.button>
        )}
      </div>
    </main>
  );
}
