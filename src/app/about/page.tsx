"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const sections = [
  {
    title: "How This Works",
    content:
      "TRANCE uses well-established techniques from clinical hypnotherapy, adapted for a browser-based experience. None of this is magic — it's applied psychology, rhythm, and focused attention.",
  },
  {
    title: "Fixation Induction",
    content:
      "The breathing guide uses a technique called visual fixation combined with paced breathing. By synchronizing your attention with a slow, rhythmic visual stimulus, your parasympathetic nervous system activates — the same mechanism that makes staring at a candle flame or campfire deeply relaxing. The 4-4-6 breathing pattern (inhale-hold-exhale) is specifically chosen to promote vagal tone and trigger the relaxation response.",
  },
  {
    title: "Progressive Relaxation",
    content:
      "The body scan narration follows Edmund Jacobson's progressive muscle relaxation protocol, adapted with Milton Erickson's permissive language patterns. Rather than commanding relaxation ('relax your shoulders'), we use suggestions that allow your unconscious mind to participate ('you might notice your shoulders dropping'). This permissive approach tends to be more effective because it bypasses conscious resistance.",
  },
  {
    title: "The Staircase Deepening",
    content:
      "Counting down while visualizing descent is one of the oldest deepening techniques in hypnotherapy. The UI mirrors the suggestion — darkening gradually, particles drifting downward, audio pitch dropping. This multi-sensory reinforcement creates what's called 'response expectancy': your brain anticipates going deeper, which helps it actually happen.",
  },
  {
    title: "Binaural-Adjacent Audio",
    content:
      "The audio engine generates two slightly detuned sine waves (100Hz and 104Hz) which create a perceived 4Hz beating pattern. While true binaural beats require headphones and the research is mixed, the slow amplitude modulation combined with pink noise creates an environment that masks distractions and supports the relaxation response. The isochronic pulses (rhythmic amplitude modulation at theta frequency) have somewhat stronger evidence for promoting meditative states.",
  },
  {
    title: "The Ideomotor Effect",
    content:
      "Both the arm levitation and Chevreul pendulum experiments demonstrate the ideomotor effect — the phenomenon where thinking about a movement causes tiny, unconscious muscle activations. This was first described by William Benjamin Carpenter in 1852 and is a foundational concept in hypnosis research. It's the same mechanism behind Ouija boards, dowsing rods, and applied kinesiology. In a relaxed state, ideomotor responses tend to be stronger because the conscious mind's 'filtering' of unconscious impulses is reduced.",
  },
  {
    title: "Time Distortion",
    content:
      "Altered states of consciousness reliably distort time perception. Research by Bowers and others has shown that hypnotized subjects systematically underestimate elapsed time. This happens because trance states reduce the brain's 'time-tagging' of experiences — fewer distinct memories are encoded per unit of time, so retrospective estimates are shorter. If your minute felt shorter than 60 seconds, that's a strong indicator of trance depth.",
  },
  {
    title: "Somatic Suggestion",
    content:
      "The warmth suggestion experiment tests somatic suggestibility — the ability of mental imagery to influence bodily sensations. Neuroimaging studies have shown that hypnotic suggestions of warmth activate the same cortical regions as actual thermal stimulation. Even in light trance, many people experience genuine temperature changes in the suggested hand. This principle is used therapeutically for pain management and Raynaud's syndrome.",
  },
  {
    title: "Is This Real Hypnosis?",
    content:
      "Yes and no. This experience uses genuine hypnotic induction and suggestion techniques, and can produce a real altered state of consciousness in responsive individuals. However, clinical hypnotherapy typically involves a trained practitioner who can adapt in real-time to the subject's responses. This is more like a standardized induction — it works well for many people, especially with repeated sessions, but lacks the personalization of a live session. Suggestibility tends to increase with practice, so you may find the experience deepens each time you return.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-trance-dark text-[#e8e0d4] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <Link
            href="/"
            className="ui-text text-gold/40 hover:text-gold/70 transition-colors duration-500 mb-12 inline-block"
          >
            ← Back to experience
          </Link>

          <h1 className="narration-text text-4xl text-gold/80 mb-4">
            The Science Behind TRANCE
          </h1>
          <p className="text-[#e8e0d4]/40 text-sm mb-16 font-light">
            Understanding the psychology and neuroscience of what you just experienced.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 1 }}
            >
              <h2 className="narration-text text-2xl text-gold/60 mb-3">
                {section.title}
              </h2>
              <p className="text-[#e8e0d4]/60 leading-relaxed text-sm font-light">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="mt-20 pt-8 border-t border-gold/10 text-center"
        >
          <Link
            href="/"
            className="px-10 py-4 border border-gold/20 rounded-full text-gold/60
                       hover:border-gold/40 hover:text-gold/80 transition-all duration-700
                       ui-text inline-block"
          >
            Begin a session
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
