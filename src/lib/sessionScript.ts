export type PhaseId =
  | "entry"
  | "fixation"
  | "deepening"
  | "staircase"
  | "experiments"
  | "emergence"
  | "summary";

export interface NarrationCue {
  text: string;
  /** Delay in ms before showing this cue (relative to phase start or previous cue end) */
  delay: number;
  /** How long the text stays visible in ms */
  duration: number;
}

export interface PhaseConfig {
  id: PhaseId;
  narration: NarrationCue[];
  /** Minimum duration of the phase in ms before auto-advancing */
  minDuration: number;
  /** Whether user interaction is needed to advance */
  requiresInteraction: boolean;
}

const BREATH_CYCLE = 14000; // 4s inhale + 4s hold + 6s exhale

export const sessionScript: PhaseConfig[] = [
  // Phase 0: Entry
  {
    id: "entry",
    narration: [
      {
        text: "Find a comfortable position. This session works best with headphones.",
        delay: 3000,
        duration: 6000,
      },
    ],
    minDuration: 8000,
    requiresInteraction: true,
  },

  // Phase 1: Fixation Induction
  {
    id: "fixation",
    narration: [
      {
        text: "Focus on the light in front of you...",
        delay: 2000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Notice how your breathing is already beginning to slow...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "With each exhale, your eyelids may feel just a little heavier...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "You don't need to try to relax... relaxation is already happening...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "The space between your thoughts is getting wider...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Each breath carries you a little deeper...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "There's nothing you need to do... nowhere you need to be...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Just this light... and the sound of these words...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
    ],
    minDuration: 120000,
    requiresInteraction: false,
  },

  // Phase 2: Progressive Relaxation & Deepening (body scan)
  {
    id: "deepening",
    narration: [
      {
        text: "You might notice a warmth beginning in your feet... or perhaps a pleasant heaviness...",
        delay: 3000,
        duration: 8000,
      },
      {
        text: "And that feeling can drift upward, at whatever pace feels right...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Through your legs... a comfortable softness spreading...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Some people feel it as warmth... others as lightness... there's no wrong way...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your hands may feel pleasantly heavy on your lap... or floating...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "That relaxation flowing through your arms... into your shoulders...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Let your shoulders drop... just a little more...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your neck... releasing any tension it was holding without you knowing...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "The small muscles around your eyes... softening...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your jaw... slightly parting... completely at ease...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "A wave of calm washing over your scalp... dissolving everything...",
        delay: 7000,
        duration: 8000,
      },
    ],
    minDuration: 90000,
    requiresInteraction: false,
  },

  // Phase 2b: Staircase deepening
  {
    id: "staircase",
    narration: [
      {
        text: "Imagine a staircase descending gently into a comfortable place...",
        delay: 2000,
        duration: 8000,
      },
      {
        text: "With each step, you go deeper... more relaxed... more peaceful...",
        delay: 7000,
        duration: 8000,
      },
    ],
    minDuration: 70000,
    requiresInteraction: false,
  },

  // Phase 3: Experiments (handled by individual components)
  {
    id: "experiments",
    narration: [
      {
        text: "You're now in a deeply relaxed state. Let's explore what your mind can do...",
        delay: 2000,
        duration: 6000,
      },
    ],
    minDuration: 0,
    requiresInteraction: true,
  },

  // Phase 4: Emergence
  {
    id: "emergence",
    narration: [
      {
        text: "In a moment, I'll count from 1 to 5. With each number, you'll feel more alert, more present...",
        delay: 2000,
        duration: 8000,
      },
    ],
    minDuration: 60000,
    requiresInteraction: false,
  },

  // Summary
  {
    id: "summary",
    narration: [],
    minDuration: 0,
    requiresInteraction: true,
  },
];

export const staircaseNumbers = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export const emergenceNumbers = [1, 2, 3, 4, 5];

export const emergenceNarration: NarrationCue[] = [
  { text: "1 — beginning to rise, a gentle stirring...", delay: 0, duration: 6000 },
  { text: "2 — more aware of your surroundings...", delay: 7000, duration: 6000 },
  { text: "3 — feeling energy returning to your body...", delay: 7000, duration: 6000 },
  { text: "4 — almost there, taking a deep breath...", delay: 7000, duration: 6000 },
  { text: "5 — eyes open, fully alert, feeling refreshed and clear.", delay: 7000, duration: 8000 },
];

export interface ExperimentResult {
  id: string;
  title: string;
  response: string;
  explanation: string;
}
