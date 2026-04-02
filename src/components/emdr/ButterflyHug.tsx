"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { TranceVoice } from "@/lib/TranceVoice";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import NarrationDisplay from "../NarrationDisplay";

interface ButterflyHugProps {
  voice: TranceVoice | null;
  audio: TranceAudioEngine | null;
  onComplete: () => void;
}

const narration = [
  { text: "Cross your arms over your chest, hands resting on opposite shoulders...", delay: 0, duration: 8000 },
  { text: "Now alternate tapping — left, right, left, right — gently and steadily...", delay: 9000, duration: 8000 },
  { text: "Continue tapping... focus on the rhythm... let it soothe you...", delay: 9000, duration: 8000 },
  { text: "Notice any sensations in your body as you tap... just observe them...", delay: 9000, duration: 8000 },
  { text: "Continue for a few more moments... feeling calmer with each tap...", delay: 9000, duration: 8000 },
];

export default function ButterflyHug({ voice, audio, onComplete }: ButterflyHugProps) {
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [tapping, setTapping] = useState(false);
  const [tapSide, setTapSide] = useState<"left" | "right">("left");
  const tapIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    narration.forEach((cue) => {
      cumulative += cue.delay;
      const show = cumulative;
      const hide = show + cue.duration;
      timers.push(setTimeout(() => {
        setCurrentText(cue.text);
        voice?.speak(cue.text);
      }, show));
      timers.push(setTimeout(() => setCurrentText(null), hide));
      cumulative = hide;
    });

    // Start tapping animation after first cue
    timers.push(setTimeout(() => setTapping(true), 9000));
    timers.push(setTimeout(() => {
      setTapping(false);
      onComplete();
    }, cumulative + 3000));

    return () => timers.forEach(clearTimeout);
  }, [voice, onComplete]);

  // Tapping rhythm at ~1Hz
  useEffect(() => {
    if (!tapping) {
      if (tapIntervalRef.current) clearInterval(tapIntervalRef.current);
      return;
    }

    tapIntervalRef.current = setInterval(() => {
      setTapSide((prev) => {
        const next = prev === "left" ? "right" : "left";
        audio?.playPing(next);
        if (navigator.vibrate) navigator.vibrate(20);
        return next;
      });
    }, 1000);

    return () => {
      if (tapIntervalRef.current) clearInterval(tapIntervalRef.current);
    };
  }, [tapping, audio]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      {/* Butterfly hug visual */}
      {tapping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative flex items-center justify-center"
          style={{ width: 160, height: 120 }}
        >
          {/* Body outline */}
          <div
            className="absolute rounded-full"
            style={{
              width: 40,
              height: 60,
              border: "1px solid rgba(201, 169, 110, 0.15)",
              top: 20,
            }}
          />
          {/* Left hand */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 16,
              height: 16,
              background: tapSide === "left"
                ? "rgba(201, 169, 110, 0.5)"
                : "rgba(201, 169, 110, 0.15)",
              left: 45,
              top: 18,
            }}
            animate={{ scale: tapSide === "left" ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Right hand */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 16,
              height: 16,
              background: tapSide === "right"
                ? "rgba(201, 169, 110, 0.5)"
                : "rgba(201, 169, 110, 0.15)",
              right: 45,
              top: 18,
            }}
            animate={{ scale: tapSide === "right" ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}

      <NarrationDisplay text={currentText} />
    </div>
  );
}
