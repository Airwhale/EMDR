"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface SafetyGateProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function SafetyGate({ onContinue, onBack }: SafetyGateProps) {
  const [hasPhotosensitivity, setHasPhotosensitivity] = useState<boolean | null>(null);

  return (
    <motion.main
      key="safety-gate"
      role="dialog"
      aria-labelledby="safety-gate-title"
      aria-describedby="safety-gate-description"
      className="w-full h-screen flex items-center justify-center px-6 overflow-y-auto py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-xl border border-gold/30 rounded-2xl p-8 bg-gold/[0.02]">
        <h1 id="safety-gate-title" className="narration-text text-3xl text-gold/85 mb-4 text-center">Before you begin</h1>
        <p id="safety-gate-description" className="text-sm text-[#e8e0d4]/55 font-light leading-relaxed mb-5">
          This experience supports relaxation and emotional regulation, but is not medical care,
          psychotherapy, or crisis support.
        </p>

        <ul className="space-y-3 text-sm text-[#e8e0d4]/55 font-light leading-relaxed list-disc pl-5">
          <li>Use only when you can sit or lie down safely in a private setting.</li>
          <li>If you have severe distress or trauma symptoms, please work with a licensed clinician.</li>
          <li>If this experience increases distress at any point, use the exit button — you will be guided through grounding before leaving.</li>
          <li>The meditation mode uses suggestions of mind-body separation and deep relaxation. If you have a history of dissociative experiences, consult a clinician before using meditation mode.</li>
          <li>This experience may temporarily bring up strong emotions. This is a normal part of processing and will be managed with grounding if needed.</li>
        </ul>

        {/* Photosensitivity screening */}
        <div className="mt-6 p-4 border border-[#e8e0d4]/15 rounded-xl">
          <p className="text-xs text-[#e8e0d4]/55 mb-3">
            This experience includes subtle visual flickering effects. Do you have photosensitivity, epilepsy,
            or a history of seizures triggered by flashing lights?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setHasPhotosensitivity(true)}
              className={`px-4 py-2 rounded-full text-xs ui-text transition-all duration-300 ${
                hasPhotosensitivity === true
                  ? "border border-gold/60 text-gold/90 bg-gold/10"
                  : "border border-[#e8e0d4]/20 text-[#e8e0d4]/40 hover:border-[#e8e0d4]/40"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setHasPhotosensitivity(false)}
              className={`px-4 py-2 rounded-full text-xs ui-text transition-all duration-300 ${
                hasPhotosensitivity === false
                  ? "border border-gold/60 text-gold/90 bg-gold/10"
                  : "border border-[#e8e0d4]/20 text-[#e8e0d4]/40 hover:border-[#e8e0d4]/40"
              }`}
            >
              No
            </button>
          </div>
          {hasPhotosensitivity === true && (
            <p className="text-xs text-gold/70 mt-3 font-light">
              Visual flickering effects will be disabled for your safety. You can still use all other features.
              Please consult your doctor before using this tool.
            </p>
          )}
        </div>

        <div className="mt-4 p-4 border border-[#e8e0d4]/15 rounded-xl text-xs text-[#e8e0d4]/55">
          <p className="font-light">
            This experience relies on stereo audio and binaural tones through headphones.
            If you are deaf or hard of hearing, the Lateral Eye Movement tool provides a
            visual-only experience that works without audio.
          </p>
        </div>

        <div className="mt-4 p-4 border border-[#e8e0d4]/15 rounded-xl text-xs text-[#e8e0d4]/55">
          In the United States, you can call or text <span className="text-gold/80">988</span> for
          24/7 immediate mental health crisis support.
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-[#e8e0d4]/20 rounded-full text-[#e8e0d4]/55
                       hover:border-[#e8e0d4]/35 hover:text-[#e8e0d4]/80 transition-all duration-700 ui-text"
          >
            Go back
          </button>
          <button
            onClick={() => {
              // Store photosensitivity preference for the session
              if (hasPhotosensitivity === true) {
                sessionStorage.setItem("trance.photosensitive", "true");
              }
              onContinue();
            }}
            disabled={hasPhotosensitivity === null}
            className={`px-6 py-3 border rounded-full transition-all duration-700 ui-text ${
              hasPhotosensitivity === null
                ? "border-[#e8e0d4]/10 text-[#e8e0d4]/20 cursor-not-allowed"
                : "border-gold/45 text-gold/85 hover:border-gold/75 hover:text-gold"
            }`}
          >
            I understand, continue
          </button>
        </div>
      </div>
    </motion.main>
  );
}
