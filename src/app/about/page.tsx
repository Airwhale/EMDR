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
  meditationOnly?: boolean;
}

const sections: AboutSection[] = [
  {
    title: "How This Works",
    content:
      "This experience layers dozens of techniques from EMDR, ART, and clinical relaxation practices. None of this is magic. It's applied psychology, rhythm, and focused attention. Below is a deeper look at how each technique works.",
  },
  {
    title: "EMDR-Style Eye Movement",
    content:
      "The slowly moving dot that tracks horizontally across your screen uses the same principle as EMDR (Eye Movement Desensitization and Reprocessing) therapy. Research suggests that bilateral eye movements may activate both brain hemispheres alternately, reducing cognitive arousal and facilitating a shift from active, analytical thinking into a more receptive state. In clinical EMDR, this is used to process trauma; here, it serves as an induction aid.",
    evidence: [
      { label: "EMDRIA: What is EMDR?", href: "https://www.emdria.org/about-emdr-therapy/" },
      { label: "Harvard Health: What is EMDR?", href: "https://www.health.harvard.edu/mental-health/what-is-emdr-therapy-and-who-can-it-help" },
    ],
  },
  {
    title: "True Binaural Tones",
    content:
      "The audio engine sends a slightly different frequency to each ear: for example, 100Hz to the left and 104Hz to the right. Your brain perceives the 4Hz difference as a rhythmic 'beat' that isn't present in either signal alone. This theta-frequency range (4-7Hz) is associated with the EEG patterns seen during deep meditation and light sleep, though the degree to which binaural beats reliably entrain brainwaves varies across studies. As trance deepens, the beat frequency shifts lower. During emergence, it rises to alpha (8-12Hz) to encourage alertness. These tones are layered with pink noise masking, isochronic theta pulses, and breath-synced chimes to create a rich, immersive soundscape. Headphones are essential for this effect.",
    evidence: [{ label: "Oster (1973): Auditory beats in the brain", href: "https://www.scientificamerican.com/article/auditory-beats-in-the-brain/" }],
  },
  {
    title: "Voice Synthesis",
    content:
      "This experience uses your browser's speech synthesis (or pre-generated audio files) to deliver narration in a slow, calm voice. The pacing, with deliberate pauses between phrases, mimics the cadence of a skilled therapist. Spoken guidance engages different processing pathways than written text, and the combination of hearing and seeing creates dual-channel reinforcement that deepens the effect.",
    evidence: [
      { label: "APA Dictionary: Suggestibility", href: "https://dictionary.apa.org/suggestibility" },
    ],
  },
  {
    title: "Fixation Induction & Spiral",
    meditationOnly: true,
    content:
      "The breathing guide uses visual fixation combined with paced breathing. The subtle logarithmic spiral behind it rotates just fast enough to hold peripheral attention without conscious awareness. This combination activates the parasympathetic nervous system. The 4-4-6 breathing pattern (inhale-hold-exhale) is specifically chosen to promote vagal tone and trigger the relaxation response.",
  },
  {
    title: "Embedded Commands & Ericksonian Language",
    meditationOnly: true,
    content:
      "The narration uses Milton Erickson's permissive language patterns; suggestions are phrased as possibilities ('you might notice...') rather than commands ('relax now'). The spoken voice version includes subtle embedded commands, imperative phrases hidden within longer permissive sentences (like 'and as it slows, you can relax deeply now'). Your conscious mind processes the full sentence, but your unconscious responds to the emphasized command fragment.",
  },
  {
    title: "Confusion Technique",
    meditationOnly: true,
    content:
      "Several narration cues use paradoxical statements ('the more you try to stay aware, the easier it becomes to let go'). This is Erickson's confusion technique: by presenting the conscious mind with a logical paradox, it momentarily short-circuits analytical processing and creates an opening for direct suggestion. The brief cognitive overload makes the unconscious mind more receptive.",
  },
  {
    title: "Photic Driving",
    meditationOnly: true,
    content:
      "During deepening phases, you may notice an extremely subtle luminance flicker on screen (off by default; enable in settings). This is photic driving, rhythmic visual stimulation at alpha (8Hz) or theta (6Hz) frequencies that may influence brainwave activity. The effect is kept very subtle (barely perceptible) for comfort. Some studies suggest that even low-intensity photic stimulation can shift dominant EEG frequency, though results vary.",
    evidence: [{ label: "Review: Rhythmic sensory stimulation and brain oscillations", href: "https://www.frontiersin.org/articles/10.3389/fnhum.2018.00389/full" }],
  },
  {
    title: "Vignette & Tunnel Vision",
    meditationOnly: true,
    content:
      "The darkening edges of your screen simulate tunnel vision, a phenomenon that naturally occurs in deep trance states as peripheral awareness narrows. By artificially creating this visual effect, we leverage the brain's tendency toward response expectancy: seeing what trance 'looks like' helps produce the actual experience. The vignette deepens progressively with each phase.",
  },
  {
    title: "Progressive Relaxation & Anchoring",
    meditationOnly: true,
    content:
      "The body scan follows Edmund Jacobson's progressive muscle relaxation, adapted with Ericksonian permissive language. Near the end, you're asked to press thumb and forefinger together, which creates a kinesthetic 'anchor' (an NLP technique from Bandler and Grinder). With repetition, this physical gesture becomes a conditioned trigger that can rapidly re-induce relaxation in future sessions.",
  },
  {
    title: "Fractionation",
    meditationOnly: true,
    content:
      "During the staircase deepening, there's a brief moment where you're asked to become more aware before dropping deeper again. This is fractionation: repeatedly moving between lighter and deeper states. Each cycle deepens the trance more than continuous deepening alone, because the contrast between states amplifies the subjective experience of 'going deeper.'",
  },
  {
    title: "Sub-Bass Heartbeat Entrainment",
    meditationOnly: true,
    content:
      "A barely-audible 40Hz sub-bass oscillation is modulated at approximately resting heart rate (60bpm). As trance deepens, this slows to ~50bpm. Some research on auditory-cardiac entrainment suggests that rhythmic auditory stimulation near heart rate may influence cardiac rhythm, though evidence is preliminary. The intention is to promote parasympathetic dominance and physiological relaxation.",
    evidence: [{ label: "Systematic review: auditory stimulation and heart rate variability", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5871151/" }],
  },
  {
    title: "Second Binaural Layer & Binaural Pulse",
    meditationOnly: true,
    content:
      "A second binaural tone at double the base frequency (200Hz) creates harmonic reinforcement, making the drone richer and more enveloping. Additionally, during the meditation sustain phase, the entire screen subtly pulses in opacity at the binaural beat frequency, adding a visual layer to the auditory experience. You may not consciously notice either effect, but the intention is to create a coherent multi-sensory environment that supports relaxation.",
  },
  {
    title: "Deepening Challenges & Dissociation",
    meditationOnly: true,
    content:
      "During the meditation's sustained phase, the narration uses two advanced hypnotic techniques. Deepening challenges are presuppositional invitations ('I wonder if you can go even deeper than this... and I think you can... because you already have') that assume you're already deep and can go further. Dissociation language gently separates mind from body ('your body is here, comfortable and safe... but your mind can float freely'), creating the floating, boundary-dissolving quality of deep trance. The meditation also weaves in suggestions of contentment, belonging, joy, gratitude, safety, and wellbeing throughout.",
  },
  {
    title: "NLP Sensory Patterns",
    meditationOnly: true,
    content:
      "The narration uses rich, multi-sensory imagery drawn from Neuro-Linguistic Programming: warmth spreading through your body, muscles melting like warm honey, waves of comfort like sunlight, velvet heaviness in the eyelids. The theory is that vivid sensory language can activate some of the same neural pathways as actual physical sensation, deepening the felt experience of relaxation. How strongly this works varies from person to person.",
  },
  {
    title: "Is This Real?",
    content:
      "This experience layers dozens of techniques across audio, visual, language, breathing, bilateral stimulation, and body-based categories, including binaural tones, Ericksonian language, photic driving, heartbeat entrainment, NLP patterns, deepening challenges, and dissociation language. These techniques are drawn from clinical EMDR, ART, and hypnotherapy. Some have strong research support (EMDR, progressive relaxation, paced breathing); others have promising but more preliminary evidence (binaural entrainment, photic driving). Together they create a multi-layered experience, though individual responses vary. This is a self-guided tool: it lacks the real-time adaptation of a live clinician. The effects tend to deepen with repeated sessions.",
    evidence: [{ label: "APA Dictionary: Hypnosis", href: "https://dictionary.apa.org/hypnosis" }],
  },
];

export default function AboutPage() {
  const [backHref, setBackHref] = useState("/");
  const [showDetails, setShowDetails] = useState(false);

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

        {/* Quick summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mb-12"
        >
          <h2 className="narration-text text-2xl text-gold/80 mb-4">In 30 seconds</h2>
          <div className="space-y-3 text-[#e8e0d4]/60 leading-relaxed text-sm font-light">
            <p>
              This experience combines bilateral eye movements (from EMDR and ART therapy), binaural audio tones, paced breathing, and hypnotic language patterns to guide you into a deeply relaxed state.
            </p>
            <p>
              Your eyes follow a moving dot, which may help quiet analytical thinking. Binaural tones played through headphones create a subtle rhythmic beat that some research associates with meditative brainwave states. A breathing guide activates your body&apos;s relaxation response. The narration uses permissive, Ericksonian language designed to deepen the experience without forcing it.
            </p>
            <p>
              Some of these techniques have strong clinical evidence (EMDR, progressive relaxation, paced breathing). Others are more preliminary (binaural entrainment, photic driving). Individual responses vary. Together, they create a layered experience that many people find deeply calming.
            </p>
          </div>
        </motion.div>

        {/* Expand/collapse for detailed sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ui-text text-xs text-gold/60 hover:text-gold/90 transition-colors duration-300"
          >
            {showDetails ? "Hide detailed breakdown" : "Read the detailed breakdown of each technique"}
          </button>
        </motion.div>

        {showDetails && (
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
              >
                <h2 className={`narration-text text-2xl text-gold/80 ${section.meditationOnly ? "mb-1" : "mb-3"}`}>
                  {section.title}
                </h2>
                {section.meditationOnly && (
                  <p className="ui-text text-[10px] text-gold/35 mb-3 tracking-wider">
                    Hypnotic Meditation
                  </p>
                )}
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
        )}

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
