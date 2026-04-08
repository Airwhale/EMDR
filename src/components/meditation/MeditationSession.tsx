"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import BinauralPulse from "@/components/BinauralPulse";
import { TranceVoice } from "@/lib/TranceVoice";
import { sessionScript, NarrationCue } from "@/lib/sessionScript";
import BreathingGuide from "@/components/BreathingGuide";
import NarrationDisplay from "@/components/NarrationDisplay";
import EmdrDot from "@/components/EmdrDot";
import HypnoticSpiral from "@/components/HypnoticSpiral";
import PhoticFlicker from "@/components/PhoticFlicker";
import Vignette from "@/components/Vignette";
import Staircase from "@/components/Staircase";

type MedPhase = "centering" | "fixation" | "deepening" | "staircase" | "sustain" | "emergence" | "complete";

const NUMBER_WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const NUMBER_FILES = [
  "",
  "/audio/trance/trance-staircase-count-01.mp3",
  "/audio/trance/trance-staircase-count-02.mp3",
  "/audio/trance/trance-staircase-count-03.mp3",
  "/audio/trance/trance-staircase-count-04.mp3",
  "/audio/trance/trance-staircase-05.mp3",
  "/audio/trance/trance-staircase-06.mp3",
  "/audio/trance/trance-staircase-07.mp3",
  "/audio/trance/trance-staircase-08.mp3",
  "/audio/trance/trance-staircase-09.mp3",
  "/audio/trance/trance-staircase-10.mp3",
];

interface MeditationSessionProps {
  onComplete: () => void;
  onExit: () => void;
  /** If true, skip all voice narration and countdown — visual + audio only */
  silent?: boolean;
  flickerEnabled?: boolean;
  binauralEnabled?: boolean;
}

// Extended deepening narration — cycles through these during the sustained phase.
// Themes: contentment, belonging, joy, gratitude, wellbeing, safety, ease.
// Techniques: deepening challenges, dissociation language, presuppositions.
const sustainCues: NarrationCue[] = [
  // Contentment
  { text: "contentment", spoken: "And perhaps you can feel that contentment now... growing with every breath... deeper... and more satisfying...", delay: 25000, duration: 6000, file: "/audio/meditation/meditation-sustain-01.mp3" },
  // Belonging
  { text: "belonging", spoken: "Some people notice the sounds welcoming them deeper... the gentle tones cradling them... and you might find you belong here... in this comfort...", delay: 25000, duration: 6000, file: "/audio/meditation/meditation-sustain-02.mp3" },
  // Deepening challenge
  { text: "deeper", spoken: "I wonder if you can go even deeper than this... and I think you can... because you already have... and it can feel so good...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-03.mp3" },
  // Peace
  { text: "peace", spoken: "You might notice your mind becoming beautifully still... your body perfectly at ease... and perhaps there is such deep peace... in this moment...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-04.mp3" },
  // Dissociation
  { text: "floating", spoken: "Some people find that while their body rests here... comfortable and safe... their mind begins to float freely... drifting... weightless... free...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-05.mp3" },
  // Gratitude
  { text: "gratitude", spoken: "Notice how good this feels... this gift you are giving yourself... this time... this care... this peace...", delay: 25000, duration: 6000, file: "/audio/meditation/meditation-sustain-06.mp3" },
  // Deepening challenge + contentment
  { text: "even deeper", spoken: "And you may find you can go even deeper still... deeper than you thought possible... and each new depth might bring even more contentment... even more joy...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-07.mp3" },
  // Wellbeing
  { text: "wellbeing", spoken: "Perhaps you can notice a profound sense of wellbeing... spreading through every part of you... deeply... completely... perfectly at peace...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-08.mp3" },
  // Dissociation + safety
  { text: "free", spoken: "Some people find their body resting here... warm and safe... while their mind drifts somewhere beautiful... somewhere peaceful... somewhere that is entirely theirs...", delay: 35000, duration: 6000, file: "/audio/meditation/meditation-sustain-09.mp3" },
  // Joy
  { text: "joy", spoken: "And perhaps you can notice... a quiet joy... underneath all of this... a gentle smile that might come from deep within...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-10.mp3" },
  // Ease
  { text: "ease", spoken: "And you might notice it becoming so easy now... so effortless... your deeper mind knows exactly what to do... and you can simply enjoy...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-11.mp3" },
  // Deepening challenge + dissociation
  { text: "boundless", spoken: "I wonder how deep you can go... perhaps there is no limit... your mind vast and open... and every moment here... might bring more comfort... more peace... more contentment...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-12.mp3" },
  // Contentment + belonging
  { text: "exactly right", spoken: "And you may realize that everything is exactly as it should be... and you are exactly where you want to be... you might find you belong here... in this warmth...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-13.mp3" },
  // Dissociation + wellbeing
  { text: "dissolving", spoken: "Perhaps the boundary between you and this peace... is beginning to dissolve... and you might find yourself becoming the calm itself... the stillness itself...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-14.mp3" },
  // Safety + joy
  { text: "safe", spoken: "You can rest here... in this beautiful place... knowing that you are safe... you are whole... and this joy... this contentment... is always available to you...", delay: 35000, duration: 6000, file: "/audio/meditation/meditation-sustain-15.mp3" },
  // Flowing + contentment
  { text: "flowing", spoken: "Perhaps you can notice everything flowing... your breath... the sounds... this feeling of deep contentment... all moving together... perfectly...", delay: 30000, duration: 6000, file: "/audio/meditation/meditation-sustain-16.mp3" },
];

const emergenceCues: NarrationCue[] = [
  { text: "When you're ready... you'll begin to return... carrying this peace with you...", spoken: "When you're ready... you'll begin to return... carrying this beautiful feeling of peace with you... it stays with you...", delay: 2000, duration: 8000, file: "/audio/meditation/meditation-emergence-intro.mp3" },
];

export default function MeditationSession({ onComplete, onExit, silent = false, binauralEnabled = true, flickerEnabled = false }: MeditationSessionProps) {
  const [phase, setPhase] = useState<MedPhase>(silent ? "sustain" : "centering");
  const [currentNarration, setCurrentNarration] = useState<string | null>(null);
  const [vignetteIntensity, setVignetteIntensity] = useState(0);
  const [breathSlowdown, setBreathSlowdown] = useState(1.0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [currentBeatFreq, setCurrentBeatFreq] = useState(3);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const voiceRef = useRef<TranceVoice | null>(null);
  const sustainIndexRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Init audio + voice
  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("trance");
    if (!binauralEnabled) audio.muteBinaural();
    audioRef.current = audio;

    if (silent) {
      // Silent mode starts at sustain — ramp up audio to deep state quickly
      audio.fadeIn(5, 0.55);
      audio.setDepth(0.8);
      setVignetteIntensity(0.7);
      setBreathSlowdown(1.9);
    } else {
      audio.fadeIn(20, 0.5);
    }

    const voice = new TranceVoice();
    voice.init();
    voiceRef.current = voice;

    startTimeRef.current = Date.now();

    return () => { audio.stop(); voice.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Elapsed time tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const speakNarration = useCallback(
    (text: string, spoken?: string, file?: string) => {
      if (!voiceEnabled || silent) return;
      voiceRef.current?.speak(spoken || text, { file });
    },
    [voiceEnabled, silent]
  );

  const scheduleNarrationCues = useCallback(
    (cues: NarrationCue[], onDone?: () => void) => {
      let cumulative = 0;
      const timers: ReturnType<typeof setTimeout>[] = [];

      cues.forEach((cue) => {
        cumulative += cue.delay;
        const show = cumulative;
        timers.push(setTimeout(() => {
          setCurrentNarration(cue.text);
          speakNarration(cue.text, cue.spoken, cue.file);
        }, show));
        cumulative = show + cue.duration;
      });

      if (onDone) {
        timers.push(setTimeout(onDone, cumulative + 2000));
      }

      return () => timers.forEach(clearTimeout);
    },
    [speakNarration]
  );

  // ---- CENTERING (breathing instructions) ----
  useEffect(() => {
    if (phase !== "centering") return;
    setVignetteIntensity(0.1);
    setBreathSlowdown(1.0);

    const timers: ReturnType<typeof setTimeout>[] = [];
    // Delay first cue to let voice engine initialize
    timers.push(setTimeout(() => {
      speakNarration(
        "Let your eyes follow the dot moving across the screen... keep your head still... just your eyes...",
        "Let your eyes follow the dot moving across the screen... keep your head still... just your eyes...",
        "/audio/meditation/meditation-centering-01.mp3"
      );
    }, 2000));

    // One complete breathing instruction timed to one breath cycle (~14s)
    timers.push(setTimeout(() => {
      speakNarration(
        "As the sounds rise... breathe in... as they hold... hold... as they fall... breathe out slowly...",
        "As the sounds rise... breathe in... as they hold... hold... as they fall... breathe out slowly...",
        "/audio/meditation/meditation-centering-02.mp3"
      );
    }, 16000));

    timers.push(setTimeout(() => {
      speakNarration(
        "That's it... synchronize your breathing with the rhythm you hear... and allow it to become automatic... keeping your eyes on the dot...",
        "That's it... synchronize your breathing with the rhythm you hear... and allow it to become automatic... keeping your eyes on the dot...",
        "/audio/meditation/meditation-centering-03.mp3"
      );
    }, 34000));
    timers.push(setTimeout(() => {
      setPhase("fixation");
    }, 48000));

    return () => timers.forEach(clearTimeout);
  }, [phase, speakNarration]);

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
  const handleStaircaseStep = useCallback((step: number) => {
    const pitchOffset = (10 - step) * 2;
    audioRef.current?.shiftPitch(100 - pitchOffset, 3);
    audioRef.current?.setDepth(0.5 + (10 - step) * 0.05);
    audioRef.current?.setMasterVolume(0.65 + (10 - step) * 0.012, 3);
    setVignetteIntensity(0.55 + (10 - step) * 0.035);
    // Speak the number
    speakNarration(NUMBER_WORDS[step] || String(step), undefined, NUMBER_FILES[step]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Progressive deepening over sustain phase:
    // Binaural: 100Hz/3Hz → 72Hz/1.5Hz (theta → delta)
    // Heartbeat: 60bpm → 45bpm (resting → deep relaxation)
    // Both layers shift together for coherent descent
    const binauralTimers = [
      setTimeout(() => {
        audioRef.current?.shiftPitch(95, 30);
        audioRef.current?.setBinauralBeat(2.8, 30);
        audioRef.current?.setHeartbeatRate(57, 30);
        setCurrentBeatFreq(2.8);
      }, 60000),   // 1 min
      setTimeout(() => {
        audioRef.current?.shiftPitch(88, 40);
        audioRef.current?.setBinauralBeat(2.4, 40);
        audioRef.current?.setHeartbeatRate(54, 40);
        setCurrentBeatFreq(2.4);
      }, 180000),  // 3 min
      setTimeout(() => {
        audioRef.current?.shiftPitch(82, 50);
        audioRef.current?.setBinauralBeat(2.0, 50);
        audioRef.current?.setHeartbeatRate(51, 50);
        setCurrentBeatFreq(2.0);
      }, 360000),  // 6 min
      setTimeout(() => {
        audioRef.current?.shiftPitch(76, 60);
        audioRef.current?.setBinauralBeat(1.8, 60);
        audioRef.current?.setHeartbeatRate(48, 60);
        setCurrentBeatFreq(1.8);
      }, 600000),  // 10 min
      setTimeout(() => {
        audioRef.current?.shiftPitch(72, 60);
        audioRef.current?.setBinauralBeat(1.5, 60);
        audioRef.current?.setHeartbeatRate(45, 60);
        setCurrentBeatFreq(1.5);
      }, 900000),  // 15 min
    ];

    // Anchoring reinforcement — spoken at FULL volume (louder than regular narration)
    // Timed to coincide with deepest binaural shifts
    const anchoringTimers = [
      // Right after staircase (~30s into sustain) — first anchor
      setTimeout(() => {
        if (voiceEnabled && !silent) {
          voiceRef.current?.speak(
            "Gently press your thumb and forefinger together... feel this deep contentment lock into place... this feeling is yours... whenever you press these fingers together... this peace returns...",
            { file: "/audio/meditation/meditation-anchor-01.mp3", volume: 0.95 }
          );
        }
        if (!silent) {
          setCurrentNarration("anchor");
          setTimeout(() => setCurrentNarration(null), 6000);
        }
      }, 30000),
      // ~10 min — reinforcement at deepening wave
      setTimeout(() => {
        if (voiceEnabled && !silent) {
          voiceRef.current?.speak(
            "Press your thumb and forefinger together again now... notice how much deeper this feeling has become... your anchor grows stronger each time... this profound peace... this contentment... stored in this simple touch...",
            { file: "/audio/meditation/meditation-anchor-02.mp3", volume: 0.95 }
          );
        }
        if (!silent) {
          setCurrentNarration("anchor");
          setTimeout(() => setCurrentNarration(null), 6000);
        }
      }, 620000),  // ~10 min 20s (just after the 10min binaural shift)
      // ~15 min — final reinforcement at deepest point
      setTimeout(() => {
        if (voiceEnabled && !silent) {
          voiceRef.current?.speak(
            "One last time... press your thumb and forefinger together... at this deepest point... seal this feeling in... this is the deepest peace you have felt... and it is always here for you... always available... with this simple touch...",
            { file: "/audio/meditation/meditation-anchor-03.mp3", volume: 0.95 }
          );
        }
        if (!silent) {
          setCurrentNarration("anchor");
          setTimeout(() => setCurrentNarration(null), 6000);
        }
      }, 920000),  // ~15 min 20s (just after the 15min binaural shift)
    ];

    const runNextCue = () => {
      const idx = sustainIndexRef.current % sustainCues.length;
      const cue = sustainCues[idx];
      sustainIndexRef.current++;

      const showTimer = setTimeout(() => {
        if (!silent) {
          setCurrentNarration(cue.text);
          speakNarration(cue.text, cue.spoken, cue.file);
        }
      }, cue.delay);

      const hideTimer = setTimeout(() => {
        if (!silent) setCurrentNarration(null);
      }, cue.delay + cue.duration);

      const nextTimer = setTimeout(runNextCue, cue.delay + cue.duration + 2000);

      return [showTimer, hideTimer, nextTimer];
    };

    // 2-hour session cap — auto-emerge
    const sessionCapTimer = setTimeout(() => {
      setPhase("emergence");
    }, 7200000); // 2 hours

    const timers = runNextCue();
    return () => {
      timers.forEach(clearTimeout);
      binauralTimers.forEach(clearTimeout);
      anchoringTimers.forEach(clearTimeout);
      clearTimeout(sessionCapTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, speakNarration]);

  // ---- END MEDITATION (user-triggered) ----
  const handleEndMeditation = useCallback(() => {
    if (silent) {
      // Silent mode: skip emergence, go straight to exit
      audioRef.current?.fadeOut(3);
      setTimeout(() => {
        audioRef.current?.stop();
        voiceRef.current?.stop();
        onExit();
      }, 3500);
    } else {
      setPhase("emergence");
    }
  }, [silent, onExit]);

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

    return () => { cleanup(); };
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

  const showPhotic = flickerEnabled && (phase === "deepening" || phase === "staircase" || phase === "sustain");

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
      <BinauralPulse active={phase === "sustain" || phase === "staircase"} frequency={currentBeatFreq} intensity={0.035} />
      <PhoticFlicker active={showPhotic} frequency={phase === "sustain" ? 5 : phase === "staircase" ? 6 : 8} intensity={phase === "sustain" ? 0.012 : 0.015} />

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

      {/* Persistent EMDR dot — visible throughout induction phases */}
      {(phase === "centering" || phase === "fixation" || phase === "deepening" || phase === "staircase" || phase === "sustain") && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <EmdrDot cycleDuration={phase === "sustain" ? 10 : 8} size={18} rangeVw={17} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* CENTERING — voice only, no text */}
        {phase === "centering" && (
          <motion.div key="med-centering" className="absolute inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} />
        )}

        {/* FIXATION — no extra overlay needed, dot + circle are persistent */}
        {phase === "fixation" && (
          <motion.div key="med-fixation" className="absolute inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} />
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

      {/* End meditation button — top left, consistent with other modes */}
      {phase !== "emergence" && phase !== "complete" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          whileHover={{ opacity: 0.6 }}
          transition={{ duration: 0.8 }}
          onClick={handleEndMeditation}
          className="fixed top-4 left-4 z-50 ui-text text-[10px] text-[#e8e0d4]/25
                     hover:text-[#e8e0d4]/60 transition-colors duration-500"
        >
          ← end
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

        {/* Spacer to keep timer centered */}
        <div className="w-16" />
      </div>
    </main>
  );
}
