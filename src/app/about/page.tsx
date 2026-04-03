"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ReadingLink {
  label: string;
  href: string;
}

interface AboutSection {
  title: string;
  content: string;
  evidence?: ReadingLink[];
}

const sections: AboutSection[] = [
  {
    title: "How This Works",
    content:
      "This experience layers 40 distinct techniques across six categories to guide you into an altered state. None of this is magic — it's applied psychology, rhythm, and focused attention. Here is everything this app does to create the experience:",
  },
  {
    title: "All Techniques at a Glance",
    content:
      "Audio: true binaural beats (two layers), pink noise masking, isochronic theta pulses, sub-bass heartbeat entrainment (progressively slowing from 60 to 45bpm), breath-synced tonal chimes panned L/R, binaural drone modulation that breathes with you, bilateral ping tones for EMDR/ART. Visual: animated breathing circle (4-4-6 pattern with progressive slowdown), bilateral eye-tracking dot, logarithmic hypnotic spiral, photic flicker at alpha/theta frequencies, full-screen opacity pulse synced to the binaural beat, progressive vignette simulating tunnel vision, staircase countdown with drifting particles. Language: Ericksonian permissive language, embedded commands, confusion technique (paradoxical statements), fractionation (alert-then-deepen cycles), deepening challenges, dissociation language (mind-body separation), kinesthetic anchoring, presuppositions, NLP sensory patterns. Breathing: 4-4-6 extended exhale pattern, progressive breath cycle slowdown (14s→27s). Bilateral: EMDR slow eye movements, ART fast eye movements, butterfly hug self-tapping. Body: progressive body scan, 5-4-3-2-1 grounding, arm levitation, Chevreul pendulum, time distortion, sensory amplification. Emergence: counting 1→5 with reorientation, audio pitch brightening, vignette lightening.",
  },
  {
    title: "EMDR-Style Eye Movement",
    content:
      "The slowly moving dot that tracks horizontally across your screen uses the same principle as EMDR (Eye Movement Desensitization and Reprocessing) therapy. Bilateral eye movements activate both brain hemispheres alternately, which reduces cognitive arousal and facilitates a shift from active, analytical thinking into a more receptive, trance-like state. In clinical EMDR, this is used to process trauma; here, it serves as an induction aid that helps disengage the critical faculty.",
    evidence: [
      { label: "EMDRIA: What is EMDR?", href: "https://www.emdria.org/about-emdr-therapy/" },
      { label: "WHO PTSD guideline (EMDR listed)", href: "https://www.who.int/publications/i/item/9789241550186" },
    ],
  },
  {
    title: "True Binaural Tones",
    content:
      "The audio engine sends a slightly different frequency to each ear — for example, 100Hz to the left and 104Hz to the right. Your brain perceives the 4Hz difference as a rhythmic 'beat' that isn't present in either signal alone. This theta-frequency beating pattern (4-7Hz) corresponds to the EEG signature of deep meditation and light sleep. As trance deepens, the binaural beat frequency shifts lower into deep theta. During emergence, it rises to alpha (8-12Hz) to promote alertness. Headphones are essential for this effect.",
    evidence: [{ label: "Oster (1973): Auditory beats in the brain", href: "https://www.scientificamerican.com/article/auditory-beats-in-the-brain/" }],
  },
  {
    title: "Voice Synthesis",
    content:
      "This experience uses your browser's speech synthesis to deliver narration in a slow, low-pitched voice. The pacing — with deliberate pauses between phrases — mimics the cadence of a skilled hypnotherapist. Spoken suggestions engage different processing pathways than written text, and the combination of reading and hearing the same content creates dual-channel reinforcement that deepens suggestibility.",
    evidence: [
      { label: "APA Dictionary: Suggestibility", href: "https://dictionary.apa.org/suggestibility" },
      { label: "Web Speech API (MDN)", href: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API" },
    ],
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
    evidence: [{ label: "Review: Rhythmic sensory stimulation and brain oscillations", href: "https://www.frontiersin.org/articles/10.3389/fnhum.2018.00389/full" }],
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
    evidence: [{ label: "Systematic review: auditory stimulation and heart rate variability", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5871151/" }],
  },
  {
    title: "Second Binaural Layer & Binaural Pulse",
    content:
      "A second binaural tone at double the base frequency (200Hz) creates harmonic reinforcement, making the drone richer and more enveloping. Additionally, during the meditation sustain phase, the entire screen subtly pulses in opacity at the exact binaural beat frequency — reinforcing the auditory entrainment through a second sensory channel. You may not consciously notice either effect, but your brain responds to the multi-layered coherence.",
  },
  {
    title: "Deepening Challenges & Dissociation",
    content:
      "During the meditation's sustained phase, the narration uses two advanced hypnotic techniques. Deepening challenges are presuppositional invitations ('I wonder if you can go even deeper than this... and I think you can... because you already have') that assume you're already deep and can go further. Dissociation language gently separates mind from body ('your body is here, comfortable and safe... but your mind can float freely'), creating the floating, boundary-dissolving quality of deep trance. The meditation also weaves in suggestions of contentment, belonging, joy, gratitude, safety, and wellbeing throughout.",
  },
  {
    title: "NLP Sensory Patterns",
    content:
      "The narration uses rich, multi-sensory imagery drawn from Neuro-Linguistic Programming — warmth spreading through your body, muscles melting like warm honey, waves of comfort like sunlight, velvet heaviness in the eyelids. These sensory predicates engage the same neural pathways as actual physical sensation, deepening the somatic experience of relaxation and making the suggestions feel physically real.",
  },
  {
    title: "The Suggestibility Experiments",
    content:
      "The arm levitation and Chevreul pendulum demonstrate the ideomotor effect — thinking about movement causes unconscious muscle activation. Time distortion exploits trance's effect on temporal processing. Sensory amplification tests somatic suggestibility — the ability of imagery to alter bodily sensations. These are all standard hypnotic phenomena used in clinical assessment.",
  },
  {
    title: "Is This Real Hypnosis?",
    content:
      "Yes. This experience layers 40 distinct techniques across audio, visual, language, breathing, bilateral stimulation, and body-based categories — including binaural entrainment, Ericksonian language, photic driving, heartbeat entrainment, NLP patterns, deepening challenges, dissociation language, and more. Any one of these alone can induce trance in responsive individuals; together they create a robust multi-modal induction. However, it lacks the real-time adaptation of a live hypnotherapist. Suggestibility increases with repeated sessions.",
    evidence: [{ label: "APA Dictionary: Hypnosis", href: "https://dictionary.apa.org/hypnosis" }],
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
              {section.evidence && (
                <div className="mt-3">
                  <p className="text-[#e8e0d4]/35 text-xs font-light mb-2">Further reading</p>
                  <ul className="space-y-1">
                    {section.evidence.map((e) => (
                      <li key={e.href}>
                        <a
                          href={e.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-xs text-[#e8e0d4]/45 hover:text-gold/80 underline underline-offset-4"
                        >
                          {e.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            href={backHref}
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
