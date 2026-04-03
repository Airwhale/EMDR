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
        text: "Find a comfortable position. Put on headphones for the full experience.",
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
        text: "Follow the dot with your eyes... keep your head still...",
        spoken: "Follow the dot with your eyes... keep your head still... just your eyes... gently... back and forth... that's right...",
        delay: 3000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Notice the sounds that rise and fall... let them guide your breathing...",
        spoken: "Notice the sounds that rise and fall... let them guide your breathing... breathing in as they rise... breathing out as they fall...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Your breathing finds its own perfect rhythm now...",
        spoken: "Your breathing finds its own perfect rhythm now... effortless... automatic... and with each breath... you can feel yourself becoming more comfortable...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Your eyelids are becoming pleasantly heavy... and that feels good...",
        spoken: "Your eyelids are becoming pleasantly heavy... and that feels good... a welcome heaviness... that tells you everything is exactly as it should be...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Comfort is spreading through you now... all by itself...",
        spoken: "Comfort is spreading through you now... all by itself... you can feel it happening... and you can enjoy how easy it is... to simply allow this...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "A beautiful stillness is opening up inside you...",
        spoken: "A beautiful stillness is opening up inside you... and in that stillness... there is such deep contentment... such quiet satisfaction...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Each breath carries you deeper into this feeling of wellbeing...",
        spoken: "Each breath carries you deeper into this feeling of wellbeing... that's right... deeper now... and it feels wonderful...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "You are exactly where you want to be... right here... right now...",
        spoken: "You are exactly where you want to be... right here... right now... and that knowing brings such peace... such contentment...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Just the gentle movement... the soft sounds... and this growing sense of ease...",
        spoken: "Just the gentle movement... the soft sounds... and this growing sense of ease... everything else can simply drift away... because you are safe... and you are at peace...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      // Confusion technique with positive framing
      {
        text: "Perhaps the relaxation is finding you... or perhaps you are finding it...",
        spoken: "Perhaps the relaxation is finding you... or perhaps you are finding it... and it's a lovely thing... that either way... this comfort grows deeper...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "And the deeper you go... the more content you feel...",
        spoken: "And the deeper you go... the more content you feel... and the more content you feel... the deeper you can go... such a wonderful cycle...",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
    ],
    minDuration: 165000,
    requiresInteraction: false,
  },

  // Phase 2: Progressive Relaxation & Deepening
  {
    id: "deepening",
    narration: [
      {
        text: "A warm, pleasant glow is beginning in your feet...",
        spoken: "A warm... pleasant glow is beginning in your feet... you can feel it now... and it feels so good...",
        delay: 3000,
        duration: 8000,
      },
      {
        text: "That warmth drifts upward... bringing comfort wherever it goes...",
        spoken: "That warmth drifts upward... bringing comfort wherever it goes... at its own perfect pace... and you can enjoy every moment of this journey...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Through your legs... a beautiful softness spreading...",
        spoken: "Through your legs... a beautiful softness spreading... as if your muscles are melting into warm honey... so comfortable... so at ease...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your body knows exactly how to do this... trust it completely...",
        spoken: "Your body knows exactly how to do this... trust it completely... your deeper mind is already guiding you... into exactly the right state...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your hands feel wonderfully comfortable... perfectly placed...",
        spoken: "Your hands feel wonderfully comfortable... perfectly placed... and you can notice how good it feels... to simply let them rest...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Waves of comfort flowing through your arms... into your shoulders...",
        spoken: "Waves of comfort flowing through your arms... into your shoulders... like warm sunlight spreading through you... bringing such contentment...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your shoulders soften... releasing into comfort...",
        spoken: "Your shoulders soften... releasing into comfort... and you can feel how good that release feels... allowing yourself to enjoy it fully...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your neck finds its perfect position of ease...",
        spoken: "Your neck finds its perfect position of ease... and with that ease comes a beautiful feeling of freedom... and lightness...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "The delicate muscles around your eyes... becoming so soft...",
        spoken: "The delicate muscles around your eyes... becoming so soft... so smooth... and your eyelids feel wonderfully heavy... pleasantly closed...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your whole face radiates calm... smooth and serene...",
        spoken: "Your whole face radiates calm... smooth and serene... and there's something so deeply satisfying about this... this complete peace...",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "A wave of pure contentment washing over you... from head to toe...",
        spoken: "A wave of pure contentment washing over you... from head to toe... every part of you... deeply... perfectly... at peace...",
        delay: 7000,
        duration: 8000,
      },
      // Anchoring
      {
        text: "Gently press your thumb and forefinger together... anchoring this feeling...",
        spoken: "Now... gently press your thumb and forefinger together... and let this touch become your anchor... this feeling of deep contentment... is yours to return to... whenever you choose... simply by pressing these fingers together...",
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
        text: "In your mind... a beautiful staircase appears... leading down into warmth...",
        spoken: "In your mind... a beautiful staircase appears... leading down into the most comfortable... most peaceful place... you have ever known...",
        delay: 2000,
        duration: 8000,
      },
      {
        text: "Each step brings twice as much comfort... twice as much peace...",
        spoken: "Each step brings twice as much comfort... twice as much peace... and with each step... you can feel that contentment doubling...",
        delay: 7000,
        duration: 8000,
      },
      // Fractionation — positive framing
      {
        text: "For just a moment... notice how good you already feel...",
        spoken: "For just a moment... notice how good you already feel... notice the sounds around you... the surface supporting you... appreciate how comfortable you are...",
        delay: 7000,
        duration: 6000,
      },
      {
        text: "...and now allow yourself to go twice as deep into that comfort...",
        spoken: "...and now... allow yourself to go twice as deep into that comfort... that's right... so much deeper... so much more peaceful...",
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
        text: "You are deeply at peace. Let's explore what your mind can do...",
        spoken: "You are deeply at peace... and from this beautiful place of comfort... let's explore... the wonderful things your mind can do...",
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
        text: "In a moment, I'll count from 1 to 5... bringing you back feeling wonderful...",
        spoken: "In a moment... I'll count from 1 to 5... and with each number... you'll feel more alert... more present... carrying this feeling of contentment with you...",
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
    text: "1 — a gentle brightening of awareness...",
    spoken: "One... a gentle brightening of awareness... feeling so good...",
    delay: 0,
    duration: 6000,
  },
  {
    text: "2 — becoming more present... carrying this peace with you...",
    spoken: "Two... becoming more present... carrying this deep peace with you... it stays with you...",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "3 — energy and vitality returning... feeling wonderful...",
    spoken: "Three... energy and vitality returning to your body... feeling wonderful... refreshed...",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "4 — almost there... taking a deep, satisfying breath...",
    spoken: "Four... almost there... take a deep, satisfying breath... feeling clear... feeling content...",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "5 — eyes open, fully alert, feeling wonderful and at peace.",
    spoken: "Five... eyes open... wide awake... fully alert... feeling wonderful... refreshed... and deeply at peace.",
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
