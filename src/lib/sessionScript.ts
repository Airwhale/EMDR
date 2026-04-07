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
  /** MP3 file path, e.g. "/audio/trance/trance-fixation-01.mp3" */
  file?: string;
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
        file: "/audio/trance/trance-entry-01.mp3",
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
        text: "Follow the dot...",
        spoken: "Follow the dot with your eyes... keep your head still... just your eyes... gently... back and forth... that's right...",
        file: "/audio/trance/trance-fixation-01.mp3",
        delay: 3000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Let the sounds guide your breathing...",
        spoken: "Notice the sounds that rise and fall... let them guide your breathing... breathing in as they rise... breathing out as they fall...",
        file: "/audio/trance/trance-fixation-02.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Your breathing finds its rhythm...",
        spoken: "You might notice your breathing finding its own perfect rhythm now... effortless... automatic... and with each breath... you may find yourself becoming more comfortable...",
        file: "/audio/trance/trance-fixation-03.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Eyelids becoming heavy...",
        spoken: "Perhaps you can notice... your eyelids becoming pleasantly heavy... and that feels good... a welcome heaviness... that tells you everything is exactly as it should be...",
        file: "/audio/trance/trance-fixation-04.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Comfort spreading through you...",
        spoken: "Some people begin to notice a comfort spreading through them... all by itself... and you may find it happening to you now... and you can enjoy how easy it is... to simply allow this...",
        file: "/audio/trance/trance-fixation-05.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "A stillness opening inside...",
        spoken: "Perhaps you can sense a beautiful stillness... opening up inside you... and in that stillness... there might be such deep contentment... such quiet satisfaction...",
        file: "/audio/trance/trance-fixation-06.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Each breath carries you deeper...",
        spoken: "You may notice each breath carrying you a little deeper... into this feeling of wellbeing... that's right... deeper now... and it can feel wonderful...",
        file: "/audio/trance/trance-fixation-07.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "You are exactly where you want to be...",
        spoken: "And you may realize... you are exactly where you want to be... right here... right now... and that knowing can bring such peace... such contentment...",
        file: "/audio/trance/trance-fixation-08.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Just the sounds and this growing ease...",
        spoken: "Just the gentle movement... the soft sounds... and this growing sense of ease... everything else can simply drift away... because you are safe... and you are at peace...",
        file: "/audio/trance/trance-fixation-09.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      // Confusion technique with positive framing
      {
        text: "Relaxation is finding you...",
        spoken: "Perhaps the relaxation is finding you... or perhaps you are finding it... and it's a lovely thing... that either way... this comfort can grow deeper...",
        file: "/audio/trance/trance-fixation-10.mp3",
        delay: 4000,
        duration: BREATH_CYCLE,
      },
      {
        text: "Deeper... more content...",
        spoken: "And the deeper you go... the more content you might feel... and the more content you feel... the deeper you can go... such a wonderful cycle...",
        file: "/audio/trance/trance-fixation-11.mp3",
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
        text: "A warm glow in your feet...",
        spoken: "You might notice... a warm... pleasant glow beginning in your feet... and as you notice it... it can begin to grow...",
        file: "/audio/trance/trance-deepening-01.mp3",
        delay: 3000,
        duration: 8000,
      },
      {
        text: "Warmth drifting upward...",
        spoken: "That warmth might drift upward... bringing comfort wherever it goes... at its own perfect pace... and you can enjoy every moment of this journey...",
        file: "/audio/trance/trance-deepening-02.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Softness spreading...",
        spoken: "Perhaps through your legs... a beautiful softness spreading... as if your muscles are melting into warm honey... so comfortable... so at ease...",
        file: "/audio/trance/trance-deepening-03.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Your body knows what to do...",
        spoken: "Your body knows exactly how to do this... you can trust it completely... your deeper mind is already guiding you... into exactly the right state...",
        file: "/audio/trance/trance-deepening-04.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Hands wonderfully comfortable...",
        spoken: "You might notice your hands feeling wonderfully comfortable... perfectly placed... and you can notice how good it feels... to simply let them rest...",
        file: "/audio/trance/trance-deepening-05.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Comfort flowing into your shoulders...",
        spoken: "Perhaps waves of comfort flowing through your arms... into your shoulders... like warm sunlight spreading through you... bringing such contentment...",
        file: "/audio/trance/trance-deepening-06.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Shoulders softening...",
        spoken: "You may notice your shoulders softening... releasing into comfort... and you can feel how good that release feels... allowing yourself to enjoy it fully...",
        file: "/audio/trance/trance-deepening-07.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Neck finding ease...",
        spoken: "Perhaps your neck is finding its perfect position of ease... and with that ease can come a beautiful feeling of freedom... and lightness...",
        file: "/audio/trance/trance-deepening-08.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Eyes becoming soft...",
        spoken: "You might notice the delicate muscles around your eyes... becoming so soft... so smooth... and your eyelids may feel wonderfully heavy... pleasantly closed...",
        file: "/audio/trance/trance-deepening-09.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "Face radiating calm...",
        spoken: "Perhaps your whole face is beginning to radiate calm... smooth and serene... and there can be something so deeply satisfying about this... this complete peace...",
        file: "/audio/trance/trance-deepening-10.mp3",
        delay: 7000,
        duration: 8000,
      },
      {
        text: "A wave of contentment...",
        spoken: "You might notice a wave of pure contentment washing over you... from head to toe... every part of you... deeply... perfectly... at peace...",
        file: "/audio/trance/trance-deepening-11.mp3",
        delay: 7000,
        duration: 8000,
      },
      // Anchoring
      {
        text: "Press thumb and forefinger... anchor this feeling...",
        spoken: "Now... gently press your thumb and forefinger together... and let this touch become your anchor... this feeling of deep contentment... is yours to return to... whenever you choose... simply by pressing these fingers together...",
        file: "/audio/trance/trance-deepening-12.mp3",
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
        text: "A staircase leading down...",
        spoken: "In your mind... a beautiful staircase appears... leading down into the most comfortable... most peaceful place... you have ever known...",
        file: "/audio/trance/trance-staircase-01.mp3",
        delay: 2000,
        duration: 8000,
      },
      {
        text: "Each step... twice as deep...",
        spoken: "Each step might bring twice as much comfort... twice as much peace... and with each step... you may feel that contentment doubling...",
        file: "/audio/trance/trance-staircase-02.mp3",
        delay: 7000,
        duration: 8000,
      },
      // Countdown preparation
      {
        text: "Numbers counting down... dropping deeper...",
        spoken: "In a moment... you will see and hear some numbers... counting down from ten to one... and you may find yourself dropping more and more into relaxation... as each number takes you deeper...",
        file: "/audio/trance/trance-staircase-countdown-intro.mp3",
        delay: 7000,
        duration: 10000,
      },
      // Fractionation — positive framing
      {
        text: "Notice how good you feel...",
        spoken: "For just a moment... notice how good you already feel... notice the sounds around you... the surface supporting you... appreciate how comfortable you are...",
        file: "/audio/trance/trance-staircase-03.mp3",
        delay: 7000,
        duration: 6000,
      },
      {
        text: "Twice as deep...",
        spoken: "...and now... allow yourself to go twice as deep into that comfort... that's right... so much deeper... so much more peaceful...",
        file: "/audio/trance/trance-staircase-04.mp3",
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
        text: "Let's explore what your mind can do...",
        spoken: "You are deeply at peace... and from this beautiful place of comfort... let's explore... the wonderful things your mind can do...",
        file: "/audio/trance/trance-experiments-intro.mp3",
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
        text: "Counting from 1 to 5...",
        spoken: "In a moment... I'll count from 1 to 5... and with each number... you'll feel more alert... more present... carrying this feeling of contentment with you...",
        file: "/audio/trance/trance-emergence-intro.mp3",
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
    text: "1...",
    spoken: "One... a gentle brightening of awareness... feeling so good...",
    file: "/audio/trance/trance-emergence-01.mp3",
    delay: 0,
    duration: 6000,
  },
  {
    text: "2...",
    spoken: "Two... becoming more present... carrying this deep peace with you... it stays with you...",
    file: "/audio/trance/trance-emergence-02.mp3",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "3...",
    spoken: "Three... energy and vitality returning to your body... feeling wonderful... refreshed...",
    file: "/audio/meditation/meditation-emergence-03.mp3",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "4...",
    spoken: "Four... almost there... take a deep, satisfying breath... feeling clear... feeling content...",
    file: "/audio/trance/trance-emergence-04.mp3",
    delay: 7000,
    duration: 6000,
  },
  {
    text: "5 — fully alert, at peace.",
    spoken: "Five... eyes open... wide awake... fully alert... feeling wonderful... refreshed... and deeply at peace.",
    file: "/audio/trance/trance-emergence-05.mp3",
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
