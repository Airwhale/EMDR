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
  { text: "Cross your arms over your chest, placing each hand on the opposite shoulder...", delay: 0, duration: 9000 },
  { text: "Now use your fingertips to gently tap your shoulders — alternating left, right, left, right...", delay: 10000, duration: 9000 },
  { text: "Keep tapping your shoulders with your fingertips... gently and steadily...", delay: 10000, duration: 8000 },
  { text: "Notice any sensations in your body as you tap... just observe them...", delay: 9000, duration: 8000 },
  { text: "Continue tapping for a few more moments... feeling calmer with each tap...", delay: 9000, duration: 8000 },
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

    // Show pose image during first cue, then switch to tapping animation
    timers.push(setTimeout(() => {
      setShowPose(false);
      setTapping(true);
    }, 9000));
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
      {/* Crossed-arms pose illustration (shown during first cue) */}
      {showPose && !tapping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center"
          style={{ width: 280, height: 220 }}
        >
          {/* Body/torso */}
          <div
            className="absolute rounded-full"
            style={{
              width: 70,
              height: 100,
              border: "1.5px solid rgba(201, 169, 110, 0.35)",
              top: 55,
            }}
          />
          {/* Head */}
          <div
            className="absolute rounded-full"
            style={{
              width: 40,
              height: 40,
              border: "1.5px solid rgba(201, 169, 110, 0.35)",
              top: 10,
            }}
          />
          {/* Left arm crossing to right shoulder */}
          <div
            className="absolute"
            style={{
              width: 90,
              height: 2,
              background: "rgba(201, 169, 110, 0.4)",
              top: 85,
              left: 55,
              transform: "rotate(-35deg)",
              transformOrigin: "right center",
              borderRadius: 1,
            }}
          />
          {/* Right arm crossing to left shoulder */}
          <div
            className="absolute"
            style={{
              width: 90,
              height: 2,
              background: "rgba(201, 169, 110, 0.4)",
              top: 85,
              right: 55,
              transform: "rotate(35deg)",
              transformOrigin: "left center",
              borderRadius: 1,
            }}
          />
          {/* Left hand on right shoulder */}
          <div
            className="absolute rounded-full"
            style={{
              width: 14,
              height: 14,
              background: "rgba(201, 169, 110, 0.5)",
              top: 62,
              right: 88,
            }}
          />
          {/* Right hand on left shoulder */}
          <div
            className="absolute rounded-full"
            style={{
              width: 14,
              height: 14,
              background: "rgba(201, 169, 110, 0.5)",
              top: 62,
              left: 88,
            }}
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
          style={{ width: 280, height: 200 }}
        >
          {/* Body/torso — brighter */}
          <div
            className="absolute rounded-full"
            style={{
              width: 70,
              height: 100,
              border: "1.5px solid rgba(201, 169, 110, 0.45)",
              top: 40,
              boxShadow: "0 0 15px rgba(201, 169, 110, 0.08)",
            }}
          />
          {/* Head */}
          <div
            className="absolute rounded-full"
            style={{
              width: 40,
              height: 40,
              border: "1.5px solid rgba(201, 169, 110, 0.35)",
              top: -5,
            }}
          />
          {/* Left hand/tap indicator */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 28,
              height: 28,
              background: tapSide === "left"
                ? "rgba(201, 169, 110, 0.7)"
                : "rgba(201, 169, 110, 0.2)",
              boxShadow: tapSide === "left"
                ? "0 0 20px rgba(201, 169, 110, 0.4)"
                : "none",
              left: 68,
              top: 40,
            }}
            animate={{ scale: tapSide === "left" ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Right hand/tap indicator */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 28,
              height: 28,
              background: tapSide === "right"
                ? "rgba(201, 169, 110, 0.7)"
                : "rgba(201, 169, 110, 0.2)",
              boxShadow: tapSide === "right"
                ? "0 0 20px rgba(201, 169, 110, 0.4)"
                : "none",
              right: 68,
              top: 40,
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
