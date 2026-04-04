"use client";

import { motion } from "framer-motion";

interface Section {
  title: string;
  content?: string;
  link?: { label: string; url: string };
  items?: { label: string; time: string; detail: string }[];
}

const sections: Section[] = [
  {
    title: "What is this?",
    content:
      "This is a free, browser-based tool that guides you through self-administered EMDR and ART exercises — two evidence-based approaches used worldwide for emotional regulation, stress reduction, and processing difficult experiences. Everything runs in your browser. Nothing is recorded, stored on a server, or shared.",
  },
  {
    title: "What is EMDR?",
    content:
      "EMDR (Eye Movement Desensitization and Reprocessing) is a psychotherapy approach developed by Francine Shapiro in the late 1980s. It uses bilateral stimulation — typically side-to-side eye movements — while focusing on specific thoughts, feelings, or memories. Decades of clinical research have shown it to be effective for reducing distress associated with traumatic memories, anxiety, and negative self-beliefs. Our EMDR mode focuses on Phase 2 stabilization resources: safe place visualization, the butterfly hug, a container exercise, and resource installation. These are calming, resource-building techniques — not trauma reprocessing.",
    link: { label: "Learn more about EMDR →", url: "https://www.emdria.org/about-emdr-therapy/" },
  },
  {
    title: "What is ART?",
    content:
      "ART (Accelerated Resolution Therapy) is a newer, directive therapy developed by Laney Rosenzweig. While both ART and EMDR use bilateral eye movements, they differ in important ways. EMDR uses shorter sets of eye movements and allows the mind to freely associate between memories — the process is open-ended and exploratory. ART, by contrast, is highly scripted and directive: it uses longer, faster sets of eye movements and follows a fixed sequence of steps. The most distinctive difference is ART's Voluntary Image Replacement technique — after processing a scene with eye movements, you are guided to change the scene in your mind. You might change what happens, who is there, how it looks, or how it ends. You are in control of the image, reshaping it into something that feels better. Another key difference: ART does not require you to describe or share what you're processing. You simply bring the scene to mind privately, process it, and change it. Our ART mode guides you through this process for stressful memories.",
    link: { label: "Learn more about ART →", url: "https://acceleratedresolutiontherapy.com/about-art/" },
  },
  {
    title: "Why would I want to do this?",
    content:
      "Bilateral stimulation (the side-to-side eye movements at the core of both EMDR and ART) has been shown to reduce the emotional intensity of memories and activate the body's relaxation response. Even outside of formal therapy, these techniques can help with everyday stress, mild anxiety, trouble sleeping, or simply wanting to feel more grounded. The safe place and butterfly hug exercises from EMDR are widely used as standalone self-regulation tools.",
  },
  {
    title: "How long does each experience take?",
    items: [
      { label: "EMDR mode", time: "10–15 minutes", detail: "Centering, safe place visualization, butterfly hug, container exercise, resource installation, and body scan." },
      { label: "ART mode", time: "10–20 minutes", detail: "Centering, scene selection, 1–3 processing rounds with eye movements, guided scene change (voluntary image replacement), and body scan." },
      { label: "Meditation mode", time: "Up to 30 minutes", detail: "Choose guided (with voice narration and countdown) or silent (visual effects and binaural tones only). Includes suggestions of contentment, belonging, joy, gratitude, safety, and wellbeing. End whenever you're ready." },
      { label: "Lateral eye movement tool", time: "Open-ended", detail: "A customizable bilateral eye movement tool with sliders for dot speed, binaural frequency, drone volume, and ping sound. Use it for your own practice or simply to relax." },
    ],
  },
  {
    title: "Important note",
    content:
      "This tool is designed for self-regulation and wellness. It is not a replacement for professional therapy. If you are dealing with trauma, severe anxiety, PTSD, or any mental health crisis, please work with a licensed clinician. The EMDR and ART modes in this app use only the resource-building and mild-stress components of these therapies — not the full clinical trauma-processing protocols.",
  },
];

interface LearnContentProps {
  onBack: () => void;
  onReady: () => void;
}

export default function LearnContent({ onBack, onReady }: LearnContentProps) {
  return (
    <div className="min-h-screen bg-trance-dark text-[#e8e0d4]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <button
            onClick={onBack}
            className="ui-text text-gold/80 hover:text-gold transition-colors duration-500 mb-12 inline-block"
          >
            ← Back
          </button>

          <h1 className="narration-text text-4xl text-gold/85 mb-4">
            Before You Begin
          </h1>
          <p className="text-[#e8e0d4]/45 text-sm mb-14 font-light">
            Understanding what this experience offers and how to get the most from it.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
            >
              <h2 className="narration-text text-2xl text-gold/80 mb-3">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-[#e8e0d4]/60 leading-relaxed text-sm font-light">
                  {section.content}
                </p>
              )}
              {section.link && (
                <a
                  href={section.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs text-gold/60 hover:text-gold
                             transition-colors duration-500 font-light"
                >
                  {section.link.label}
                </a>
              )}
              {section.items && (
                <div className="space-y-4 mt-2">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="border border-gold/15 rounded-xl p-4"
                      style={{ background: "rgba(201, 169, 110, 0.02)" }}
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="ui-text text-xs text-gold/75">{item.label}</span>
                        <span className="ui-text text-xs text-[#e8e0d4]/50">{item.time}</span>
                      </div>
                      <p className="text-[#e8e0d4]/45 text-xs font-light leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-16 pt-8 border-t border-gold/20 text-center"
        >
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={onReady}
              className="px-10 py-4 border border-gold/40 rounded-full text-gold/80
                         hover:border-gold/70 hover:text-gold transition-all duration-700
                         ui-text"
            >
              I&apos;m ready to begin
            </button>
            <a
              href="/about"
              className="px-8 py-4 border border-[#e8e0d4]/20 rounded-full text-[#e8e0d4]/50
                         hover:border-[#e8e0d4]/40 hover:text-[#e8e0d4]/80 transition-all duration-700
                         ui-text"
            >
              The science behind it
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
