# EMDR / ART Self-Administered Experience

A browser-based guided self-regulation tool using evidence-based therapeutic techniques. Built with Next.js 14.

> **This is a wellness and educational tool, not a substitute for professional therapy.**

## Modes

- **EMDR** — Resource-building stabilization (safe place, butterfly hug, container, resource installation)
- **ART** — Scene processing and voluntary image rescripting
- **Meditation** — Extended guided deep meditation (~30 min) with suggestions of contentment, belonging, joy, gratitude, safety, and wellbeing
- **Lateral Eye Movement** — Customizable bilateral stimulation tool with adjustable speed, binaural frequency, and volume

## Techniques used to induce altered states

This app layers 40 techniques across audio, visual, language, breathing, bilateral stimulation, and body-based categories:

### Audio (8 techniques)
| Technique | Description | Modes |
|-----------|-------------|-------|
| Binaural beats (primary) | Different frequencies in L/R ears create a perceived beat that entrains brainwave frequency | All |
| Second binaural layer | Harmonic layer at 2x base frequency reinforcing the primary beat | Meditation |
| Pink noise | Filtered noise masking environmental sounds | All |
| Isochronic pulses | Rhythmic amplitude modulation at theta frequency (6Hz) | Meditation |
| Sub-bass heartbeat | 40Hz oscillation modulated at resting heart rate, progressively slowing from 60→45bpm | Meditation |
| Breath-cue chimes | Rising/falling/steady tones panned L/R/center matching inhale/hold/exhale | Meditation |
| Binaural drone modulation | Drone volume rises and falls in sync with the breathing cycle | Meditation |
| Bilateral ping tones | Short L/R panned taps accompanying each direction change of the eye-tracking dot | EMDR, ART |

### Visual (8 techniques)
| Technique | Description | Modes |
|-----------|-------------|-------|
| Breathing guide circle | Expanding/contracting ring with spring physics guiding 4-4-6 breathing | Meditation |
| EMDR horizontal dot | Smooth bilateral eye-tracking dot moving across 84% of viewport | All |
| Hypnotic spiral | Canvas-rendered 5-arm logarithmic spiral rotating at ~10°/s | Meditation |
| Photic flicker | Full-screen luminance oscillation at alpha/theta frequencies (5-8Hz) | Meditation |
| Binaural pulse | Full-screen opacity pulse synced exactly to the binaural beat frequency | Meditation |
| Vignette (tunnel vision) | Progressive radial darkening simulating the narrowed focus of deep trance | All |
| Staircase particles | Downward-drifting particles with dissolving countdown numbers (10→1) | Meditation |
| Bilateral stimulation dot | Full-width dot at configurable speeds (EMDR: 1Hz, ART: 1.4Hz) with trail | EMDR, ART |

### Language & narration (9 techniques)
| Technique | Description | Modes |
|-----------|-------------|-------|
| Embedded commands | Imperative suggestions hidden within permissive sentences | Meditation |
| Ericksonian permissive language | Indirect suggestions using "perhaps," "might," "can" to bypass resistance | Meditation |
| Confusion technique | Paradoxical statements that short-circuit analytical thinking | Meditation |
| Fractionation | Brief alert-then-deepen cycles that amplify subjective depth | Meditation |
| Deepening challenges | Presuppositional challenges ("I wonder if you can go even deeper...") | Meditation |
| Dissociation language | Mind-body separation suggestions ("your body is here... your mind can float freely") | Meditation |
| Anchoring | Physical gesture (thumb-forefinger press) paired with deep relaxation for future recall | Meditation |
| Presuppositions | Statements assuming forward progress ("the deeper you go, the more content you feel") | Meditation |
| NLP sensory patterns | Rich multisensory imagery (warmth, heaviness, floating, honey, sunlight) | Meditation |

### Breathing (2 techniques)
| Technique | Description | Modes |
|-----------|-------------|-------|
| 4-4-6 extended exhale pattern | 4s inhale, 4s hold, 6s exhale — activates vagal tone and parasympathetic response | Meditation |
| Progressive breath slowdown | Cycle duration gradually increases from 14s to 27s over the session | Meditation |

### Bilateral stimulation (3 techniques)
| Technique | Description | Modes |
|-----------|-------------|-------|
| EMDR bilateral stimulation | Slow horizontal eye movements (~1Hz) following a dot | EMDR |
| ART bilateral stimulation | Faster eye movements (~1.4Hz) for accelerated processing | ART |
| Butterfly hug tapping | Self-administered alternating fingertip taps on upper chest at ~1Hz | EMDR |

### Body-based (6 techniques)
| Technique | Description | Modes |
|-----------|-------------|-------|
| Progressive body scan | Systematic attention from feet to head, noticing warmth/comfort spreading | Meditation |
| 5-4-3-2-1 grounding | Sensory anchoring exercise (see/touch/hear/smell/taste) | EMDR, ART |

### Emergence (3 techniques)
| Technique | Description | Modes |
|-----------|-------------|-------|
| Emergence sequence | Counting 1→5 with progressive reorientation and positive anchoring | Meditation |
| Audio pitch brightening | Binaural frequency shifts upward to alpha during emergence | Meditation |
| Vignette lightening | Progressive reduction of tunnel-vision darkening | All |

## Safety

- Use only when seated or lying down safely in a private setting
- If distress increases, stop and ground yourself
- SUD (distress) monitoring with automatic grounding redirects in EMDR/ART
- In the US, call or text **988** for 24/7 mental health crisis support

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Framer Motion for animations
- Web Audio API — all audio generated in-browser (no audio files required)
- Web Speech API — narration with smart voice selection (falls back to text)
- Pre-generated audio support via ElevenLabs (optional, see AUDIO_SCRIPTS.md)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Headphones recommended.

## Data storage

All data stored in browser `localStorage`. Nothing sent to any server.
