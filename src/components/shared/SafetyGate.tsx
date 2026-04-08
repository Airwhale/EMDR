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
          EMDR and ART are clinical therapies designed to be administered by a trained therapist. This tool borrows specific relaxation and resource-building techniques from those approaches for self-guided use. It is not a substitute for the full clinical protocols or for working with a licensed professional.
        </p>

        <ul className="space-y-2 text-sm text-[#e8e0d4]/50 font-light leading-relaxed list-disc pl-5 mb-4">
          <li>Use in a safe, private setting where you can sit or lie down.</li>
          <li>You can exit at any time using the button in the top left corner.</li>
          <li>Strong emotions may come up briefly. This is normal.</li>
        </ul>

        <div className="p-3 border border-[#e8e0d4]/15 rounded-xl text-xs text-[#e8e0d4]/45 font-light leading-relaxed">
          <p className="mb-2">If anything ever feels like more than you want to handle alone, these are free and available anytime:</p>
          <ul className="space-y-1 pl-1">
            <li>Call or text <span className="text-gold/80">988</span> <span className="text-[#e8e0d4]/30">(Suicide &amp; Crisis Lifeline, US)</span></li>
            <li>Text <span className="text-gold/80">HOME</span> to <span className="text-gold/80">741741</span> <span className="text-[#e8e0d4]/30">(Crisis Text Line)</span></li>
          </ul>
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
