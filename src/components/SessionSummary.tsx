"use client";

import { motion } from "framer-motion";
import { ExperimentResult } from "@/lib/sessionScript";
import Link from "next/link";

interface SessionSummaryProps {
  results: ExperimentResult[];
}

export default function SessionSummary({ results }: SessionSummaryProps) {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-16 px-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
        className="max-w-2xl w-full"
      >
        <h1 className="narration-text text-3xl md:text-4xl text-center text-gold/80 mb-2">
          Session Complete
        </h1>
        <p className="ui-text text-center text-[#e8e0d4]/40 mb-12">
          Here&apos;s what we explored together
        </p>

        <div className="space-y-8">
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.3, duration: 1.5 }}
              className="border border-gold/40 rounded-2xl p-6"
              style={{ background: "rgba(201, 169, 110, 0.02)" }}
            >
              <h3 className="narration-text text-xl text-gold/80 mb-1">
                {result.title}
              </h3>
              <p className="ui-text text-[#e8e0d4]/50 mb-3">
                Your response: {result.response}
              </p>
              <p className="text-sm text-[#e8e0d4]/50 leading-relaxed font-light">
                {result.explanation}
              </p>
            </motion.div>
          ))}
        </div>

        {results.length === 0 && (
          <p className="narration-text text-center text-[#e8e0d4]/40">
            No experiments were completed in this session.
          </p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: results.length * 0.3 + 2, duration: 2 }}
          className="mt-16 text-center space-y-6"
        >
          <p className="narration-text text-lg text-[#e8e0d4]/50">
            Bookmark this page. Suggestibility tends to increase with repeated sessions.
          </p>

          <div className="flex gap-6 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 border border-gold/35 rounded-full text-gold/80
                         hover:border-gold/70 hover:text-gold transition-all duration-700
                         ui-text"
            >
              Begin again
            </button>
            <Link
              href="/about"
              className="px-8 py-3 border border-[#e8e0d4]/10 rounded-full text-[#e8e0d4]/40
                         hover:border-[#e8e0d4]/20 hover:text-[#e8e0d4]/60 transition-all duration-700
                         ui-text"
            >
              How it works
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
