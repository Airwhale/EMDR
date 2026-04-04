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
  { text: "Cross your arms over your upper chest, so each hand rests just below the opposite collarbone...", delay: 0, duration: 7000 },
  { text: "Your fingertips should be pointing up toward your neck, resting on the area between your shoulder and collarbone...", delay: 8000, duration: 7000 },
  { text: "Now gently tap with your fingertips — alternating left, right, left, right — like a butterfly's wings...", delay: 8000, duration: 7000 },
  { text: "Keep tapping steadily on your upper chest... each tap light and rhythmic...", delay: 8000, duration: 7000 },
  { text: "Notice any sensations in your body as you tap... just observe them...", delay: 8000, duration: 7000 },
  { text: "Continue tapping for a few more moments... feeling calmer with each tap...", delay: 8000, duration: 7000 },
];

export default function ButterflyHug({ voice, audio, onComplete }: ButterflyHugProps) {
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [showPose, setShowPose] = useState(true);
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

    // Show pose during first two cues (placement), then switch to tapping
    timers.push(setTimeout(() => {
      setShowPose(false);
      setTapping(true);
    }, 15000));
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
      {/* Reference photos (shown during placement cues) */}
      {showPose && !tapping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex gap-6 items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/emdr/butterfly-hug-2.webp"
            alt="Butterfly hug hand placement — arms crossed over upper chest"
            className="rounded-2xl max-h-[28vh] w-auto"
            style={{ opacity: 0.85 }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/emdr/butterfly-hug-1.jpg"
            alt="Butterfly hug full pose — arms crossed, eyes closed"
            className="rounded-2xl max-h-[28vh] w-auto"
            style={{ opacity: 0.85 }}
          />
        </motion.div>
      )}

      {/* Alternating tapping animation (shown during tapping cues) */}
      {tapping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center"
          style={{ width: 300, height: 220 }}
        >
          {/* Head */}
          <div
            className="absolute rounded-full"
            style={{
              width: 44,
              height: 44,
              border: "1.5px solid rgba(201, 169, 110, 0.35)",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
          {/* Torso */}
          <div
            className="absolute rounded-[35px]"
            style={{
              width: 80,
              height: 110,
              border: "1.5px solid rgba(201, 169, 110, 0.45)",
              top: 55,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 0 15px rgba(201, 169, 110, 0.06)",
            }}
          />
          {/* Shoulders */}
          <div
            className="absolute"
            style={{
              width: 120,
              height: 2,
              background: "rgba(201, 169, 110, 0.25)",
              top: 65,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
          {/* Left hand/tap indicator — on right upper chest */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 30,
              height: 30,
              background: tapSide === "left"
                ? "rgba(201, 169, 110, 0.7)"
                : "rgba(201, 169, 110, 0.2)",
              boxShadow: tapSide === "left"
                ? "0 0 20px rgba(201, 169, 110, 0.4)"
                : "none",
              right: 82,
              top: 57,
            }}
            animate={{ scale: tapSide === "left" ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Right hand/tap indicator — on left upper chest */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 30,
              height: 30,
              background: tapSide === "right"
                ? "rgba(201, 169, 110, 0.7)"
                : "rgba(201, 169, 110, 0.2)",
              boxShadow: tapSide === "right"
                ? "0 0 20px rgba(201, 169, 110, 0.4)"
                : "none",
              left: 82,
              top: 57,
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
