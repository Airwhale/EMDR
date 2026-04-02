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
  /** The text spoken aloud (may differ from display — can include embedded commands) */
  spoken?: string;
  /** Delay in ms before showing this cue (relative to previous cue end) */
  delay: number;
  /** How long the text stays visible in ms */
  duration: number;
}

export interface PhaseConfig {
  id: PhaseId;
  narration: NarrationCue[];
  minDuration: number;
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

  // Phase 1: Fixation Induction — EMDR dot + breathing + spiral + embedded commands
  {
    id: "fixation",
    narration: [
      {
        text: "Follow the light with your eyes...",
        spoken: "Follow the light... with your eyes... just let them track it naturally...",
        delay: 2000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Notice how your breathing is already beginning to slow...",
        spoken: "Notice how your breathing... is already beginning to slow... and as it slows... you can relax deeply now...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "With each exhale, your eyelids may feel just a little heavier...",
        spoken: "With each exhale... your eyelids may feel... just a little heavier... and that's perfectly fine...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "You don't need to try to relax... relaxation is already happening...",
        spoken: "You don't need to try to relax... relaxation is already happening... all by itself... let go completely...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "The space between your thoughts is getting wider...",
        spoken: "The space between your thoughts... is getting wider... and in that space... there is deep comfort...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Each breath carries you a little deeper...",
        spoken: "Each breath carries you... a little deeper... that's right... go deeper now...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "There's nothing you need to do... nowhere you need to be...",
        spoken: "There's nothing you need to do... nowhere you need to be... just this moment... drifting... deeper and deeper...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Just this light... and the sound of my voice...",
        spoken: "Just this light... and the sound of my voice... let everything else fade away... sleep...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      // Confusion technique — paradoxical statements to bypass critical mind
      {
        text: "You might wonder whether you're relaxing... or whether relaxation is finding you...",
        spoken: "You might wonder whether you're relaxing... or whether relaxation is finding you... and it doesn't matter which... because either way... you go deeper...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "The more you try to stay aware... the easier it becomes to let go...",
        spoken: "The more you try to stay aware... the easier it becomes... to let go... and that's a wonderful paradox... isn't it...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
    ],
    minDuration: 150000,
    requiresInteraction: false,
  },

  // Phase 2: Progressive Relaxation & Deepening (body scan + catalepsy suggestions)
  {
    id: "deepening",
    narration: [
      {
        text: "You might notice a warmth beginning in your feet... or perhaps a pleasant heaviness...",
        spoken: "You might notice... a warmth beginning in your feet... or perhaps a pleasant heaviness... and as you notice it... it grows...",
        delay: 3000,
        duration: 8000,
      },
      {
        text: "And that feeling can drift upward, at whatever pace feels right...",
        spoken: "And that feeling... can drift upward... at whatever pace feels right for you... there is no hurry...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Through your legs... a comfortable softness spreading...",
        spoken: "Through your legs... a comfortable softness spreading... as if your muscles are made of warm honey...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Some people feel it as warmth... others as lightness... there's no wrong way...",
        spoken: "Some people feel it as warmth... others as lightness... there's no wrong way... your unconscious mind knows exactly what to do...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your hands may feel pleasantly heavy on your lap... or floating...",
        spoken: "Your hands may feel pleasantly heavy on your lap... or floating... so heavy they couldn't move... or so light they might drift upward...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "That relaxation flowing through your arms... into your shoulders...",
        spoken: "That relaxation flowing through your arms... into your shoulders... like warm water pouring slowly downward...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Let your shoulders drop... just a little more...",
        spoken: "Let your shoulders drop... just a little more... that's right... even more...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your neck... releasing any tension it was holding without you knowing...",
        spoken: "Your neck... releasing any tension... it was holding without you knowing... and isn't it interesting... how much tension we hold... without realizing...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "The small muscles around your eyes... softening...",
        spoken: "The small muscles around your eyes... softening... your eyelids so heavy now... like velvet curtains closing...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your jaw... slightly parting... completely at ease...",
        spoken: "Your jaw... slightly parting... completely at ease... every muscle in your face... smooth and relaxed...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "A wave of calm washing over your scalp... dissolving everything...",
        spoken: "A wave of calm washing over your scalp... dissolving everything... every thought... every worry... just dissolving... into deep... peaceful... stillness...",
        delay: 7000,
        duration: 8000,
      },
      // Anchoring — associate relaxation with a physical touch
      {
        text: "Gently press your thumb and forefinger together... let this touch become your anchor...",
        spoken: "Now... gently press your thumb and forefinger together... and let this touch become your anchor... whenever you press them together in the future... this feeling of deep relaxation can return instantly...",
        delay: 7000,
        duration: 10000,
      },
    ],
    minDuration: 100000,
    requiresInteraction: false,
  },

  // Phase 2b: Staircase deepening
  {
    id: "staircase",
    narration: [
      {
        text: "Imagine a staircase descending gently into a comfortable place...",
        spoken: "Now imagine... a staircase... descending gently... into the most comfortable place you've ever known...",
        delay: 2000,
        duration: 8000,
      },
      {
        text: "With each step, you go deeper... more relaxed... more peaceful...",
        spoken: "With each step... you go deeper... more relaxed... more peaceful... twice as deep as the step before...",
        delay: 7000,
        duration: 8000,
      },
      // Fractionation — brief "wake up" then deeper re-induction
      {
        text: "And now... become slightly more aware for a moment...",
        spoken: "And now... become slightly more aware... for just a moment... notice the sounds around you... feel the surface beneath you...",
        delay: 7000,
        duration: 6000,
      },
      {
        text: "...and now let yourself drop twice as deep...",
        spoken: "...and now... let yourself drop... twice as deep as before... that's right... deeper and deeper... the fractionation makes every return... so much more profound...",
        delay: 5000,
        duration: 8000,
      },
    ],
    minDuration: 75000,
    requiresInteraction: false,
  },

  // Phase 3: Experiments
  {
    id: "experiments",
    narration: [
      {
        text: "You're now in a deeply relaxed state. Let's explore what your mind can do...",
        spoken: "You're now in a deeply relaxed state... and from this place of deep comfort... let's explore... what your mind can do...",
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
        spoken: "In a moment... I'll count from 1 to 5. With each number... you'll feel more alert... more present... more refreshed...",
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
  {
    text: "1 — beginning to rise, a gentle stirring...",
    spoken: "One... beginning to rise... a gentle stirring of awareness...",
    delay: 0,
    duration: 6000,
  },
  {
    text: "2 — more aware of your surroundings...",
    spoken: "Two... becoming more aware... of your surroundings... the sounds in the room...",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "3 — feeling energy returning to your body...",
    spoken: "Three... feeling energy returning to your body... your fingers and toes beginning to move...",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "4 — almost there, taking a deep breath...",
    spoken: "Four... almost there... take a deep breath in... feeling refreshed and clear...",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "5 — eyes open, fully alert, feeling refreshed and clear.",
    spoken: "Five... eyes open... wide awake... fully alert... feeling wonderful... refreshed... and clear.",
    delay: 7000,
    duration: 8000,
  },
];

export interface ExperimentResult {
  id: string;
  title: string;
  response: string;
  explanation: string;
}
