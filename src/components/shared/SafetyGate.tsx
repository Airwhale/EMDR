"use client";

import { motion } from "framer-motion";

interface SafetyGateProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function SafetyGate({ onContinue, onBack }: SafetyGateProps) {
  return (
    <motion.main
      key="safety-gate"
      role="dialog"
      aria-labelledby="safety-gate-title"
      aria-describedby="safety-gate-description"
      className="w-full h-screen flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-lg border border-gold/30 rounded-2xl p-8 bg-gold/[0.02]">
        <h1 id="safety-gate-title" className="narration-text text-2xl text-gold/85 mb-4 text-center">Before you begin</h1>
        <p id="safety-gate-description" className="text-sm text-[#e8e0d4]/55 font-light leading-relaxed mb-4">
          This supports relaxation and emotional regulation, but is not therapy or crisis support.
        </p>

        <ul className="space-y-2 text-sm text-[#e8e0d4]/50 font-light leading-relaxed list-disc pl-5 mb-4">
          <li>Use in a safe, private setting where you can sit or lie down.</li>
          <li>If distress increases, use the exit button — you&apos;ll be guided through grounding.</li>
          <li>Strong emotions may come up briefly. This is normal and will be managed.</li>
        </ul>

        <div className="p-3 border border-[#e8e0d4]/15 rounded-xl text-xs text-[#e8e0d4]/50">
          In the US, call or text <span className="text-gold/80">988</span> for 24/7 crisis support.
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-[#e8e0d4]/20 rounded-full text-[#e8e0d4]/55
                       hover:border-[#e8e0d4]/35 hover:text-[#e8e0d4]/80 transition-all duration-700 ui-text"
          >
            Go back
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-3 border border-gold/45 rounded-full text-gold/85
                       hover:border-gold/75 hover:text-gold transition-all duration-700 ui-text"
          >
            I understand, continue
          </button>
        </div>
      </div>
    </motion.main>
  );
}
