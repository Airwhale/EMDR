"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const sections = [
  {
    title: "How This Works",
    content:
      "This experience uses well-established techniques from clinical hypnotherapy, EMDR, and ART, adapted for a browser-based format. None of this is magic — it's applied psychology, rhythm, and focused attention. Multiple methods work together to support relaxation and emotional regulation.",
  },
  {
    title: "EMDR-Style Eye Movement",
    content:
      "The slowly moving dot that tracks horizontally across your screen uses the same principle as EMDR (Eye Movement Desensitization and Reprocessing) therapy. Bilateral eye movements activate both brain hemispheres alternately, which reduces cognitive arousal and facilitates a shift from active, analytical thinking into a more receptive, trance-like state. In clinical EMDR, this is used to process trauma; here, it serves as an induction aid that helps disengage the critical faculty.",
  },
  {
    title: "True Binaural Tones",
    content:
      "The audio engine sends a slightly different frequency to each ear — for example, 100Hz to the left and 104Hz to the right. Your brain perceives the 4Hz difference as a rhythmic 'beat' that isn't present in either signal alone. This theta-frequency beating pattern (4-7Hz) corresponds to the EEG signature of deep meditation and light sleep. As trance deepens, the binaural beat frequency shifts lower into deep theta. During emergence, it rises to alpha (8-12Hz) to promote alertness. Headphones are essential for this effect.",
  },
  {
    title: "Voice Synthesis",
    content:
      "This experience uses your browser's speech synthesis to deliver narration in a slow, low-pitched voice. The pacing — with deliberate pauses between phrases — mimics the cadence of a skilled therapist. Spoken suggestions engage different processing pathways than written text, and the combination of reading and hearing the same content creates dual-channel reinforcement that deepens the effect.",
  },
  {
    title: "Fixation Induction & Spiral",
    content:
      "The breathing guide uses visual fixation combined with paced breathing. The subtle logarithmic spiral behind it rotates just fast enough to hold peripheral attention without conscious awareness. This combination activates the parasympathetic nervous system. The 4-4-6 breathing pattern (inhale-hold-exhale) is specifically chosen to promote vagal tone and trigger the relaxation response.",
  },
  {
    title: "Embedded Commands & Ericksonian Language",
    content:
      "The narration uses Milton Erickson's permissive language patterns — suggestions are phrased as possibilities ('you might notice...') rather than commands ('relax now'). The spoken voice version includes subtle embedded commands — imperative phrases hidden within longer permissive sentences (like 'and as it slows, you can relax deeply now'). Your conscious mind processes the full sentence, but your unconscious responds to the emphasized command fragment.",
  },
  {
    title: "Confusion Technique",
    content:
      "Several narration cues use paradoxical statements ('the more you try to stay aware, the easier it becomes to let go'). This is Erickson's confusion technique — by presenting the conscious mind with a logical paradox, it momentarily short-circuits analytical processing and creates an opening for direct suggestion. The brief cognitive overload makes the unconscious mind more receptive.",
  },
  {
    title: "Photic Driving",
    content:
      "During deepening phases, you may notice an extremely subtle luminance flicker on screen. This is photic driving — rhythmic visual stimulation at alpha (8Hz) or theta (6Hz) frequencies that can entrain brainwave activity. The effect is kept very subtle (barely perceptible) for comfort, but clinical studies show that even low-intensity photic stimulation can measurably shift dominant EEG frequency.",
  },
  {
    title: "Vignette & Tunnel Vision",
    content:
      "The darkening edges of your screen simulate tunnel vision — a phenomenon that naturally occurs in deep trance states as peripheral awareness narrows. By artificially creating this visual effect, we leverage the brain's tendency toward response expectancy: seeing what trance 'looks like' helps produce the actual experience. The vignette deepens progressively with each phase.",
  },
  {
    title: "Progressive Relaxation & Anchoring",
    content:
      "The body scan follows Edmund Jacobson's progressive muscle relaxation, adapted with Ericksonian permissive language. Near the end, you're asked to press thumb and forefinger together — this creates a kinesthetic 'anchor' (an NLP technique from Bandler and Grinder). With repetition, this physical gesture becomes a conditioned trigger that can rapidly re-induce relaxation in future sessions.",
  },
  {
    title: "Fractionation",
    content:
      "During the staircase deepening, there's a brief moment where you're asked to become more aware before dropping deeper again. This is fractionation — repeatedly moving between lighter and deeper states. Each cycle deepens the trance more than continuous deepening alone, because the contrast between states amplifies the subjective experience of 'going deeper.'",
  },
  {
    title: "Sub-Bass Heartbeat Entrainment",
    content:
      "A barely-audible 40Hz sub-bass oscillation is modulated at approximately resting heart rate (60bpm). As trance deepens, this slows to ~50bpm. Research on auditory-cardiac entrainment suggests that rhythmic auditory stimulation near heart rate can influence actual cardiac rhythm, promoting parasympathetic dominance and physiological relaxation.",
  },
  {
    title: "The Suggestibility Experiments",
    content:
      "The arm levitation and Chevreul pendulum demonstrate the ideomotor effect — thinking about movement causes unconscious muscle activation. Time distortion exploits trance's effect on temporal processing. Sensory amplification tests somatic suggestibility — the ability of imagery to alter bodily sensations. These are all standard hypnotic phenomena used in clinical assessment.",
  },
  {
    title: "Is This Real Hypnosis?",
    content:
      "Yes. This experience layers genuine clinical induction techniques — EMDR-style bilateral stimulation, binaural entrainment, Ericksonian language, confusion technique, photic driving, progressive relaxation, anchoring, and fractionation. Any one of these alone can induce trance in responsive individuals; together they create a robust multi-modal induction. However, it lacks the real-time adaptation of a live hypnotherapist. Suggestibility increases with repeated sessions.",
  },
];

export default function AboutPage() {
  const [backHref, setBackHref] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("return") === "summary") {
      setBackHref("/?return=summary");
    }
  }, []);

  return (
    <main className="min-h-screen bg-trance-dark text-[#e8e0d4] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <Link
            href={backHref}
            className="ui-text text-gold/80 hover:text-gold transition-colors duration-500 mb-12 inline-block"
          >
            ← Back to experience
          </Link>

          <h1 className="narration-text text-4xl text-gold/80 mb-4">
            The Science Behind the Experience
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
              <h2 className="narration-text text-2xl text-gold/80 mb-3">
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
          className="mt-20 pt-8 border-t border-gold/25 text-center"
        >
          <Link
            href={backHref === "/" ? "/" : "/?return=summary"}
            className="px-10 py-4 border border-gold/35 rounded-full text-gold/80
                       hover:border-gold/70 hover:text-gold transition-all duration-700
                       ui-text inline-block"
          >
            Back to experience
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
