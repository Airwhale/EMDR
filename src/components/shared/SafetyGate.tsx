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
      className="w-full h-full flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      <div className="w-full max-w-xl border border-gold/30 rounded-2xl p-8 bg-gold/[0.02]">
        <h1 id="safety-gate-title" className="narration-text text-3xl text-gold/85 mb-4 text-center">Safety check</h1>
        <p id="safety-gate-description" className="text-sm text-[#e8e0d4]/55 font-light leading-relaxed mb-5">
          This experience supports relaxation and emotional regulation, but is not medical care,
          psychotherapy, or crisis support.
        </p>

        <ul className="space-y-3 text-sm text-[#e8e0d4]/55 font-light leading-relaxed list-disc pl-5">
          <li>Use only when you can sit/lie down safely in a private setting.</li>
          <li>If you have severe distress or trauma symptoms, work with a licensed clinician.</li>
          <li>If this increases distress, pause immediately and do grounding before continuing.</li>
        </ul>

        <div className="mt-6 p-4 border border-[#e8e0d4]/15 rounded-xl text-xs text-[#e8e0d4]/55">
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
