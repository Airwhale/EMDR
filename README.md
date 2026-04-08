# EMDR / ART Self-Administered Experience

A free, browser-based guided self-regulation tool. Four modes — EMDR resource-building, ART memory rescripting, guided hypnotic meditation, and a customizable bilateral stimulation tool — all running entirely in the browser with no backend, no accounts, and no data collection.

> **This is a wellness and educational tool, not a substitute for professional therapy.**
> Find a certified EMDR therapist at [emdria.org](https://www.emdria.org/find-an-emdr-therapist/) or connect with pro bono therapists through [emdrhap.org](https://www.emdrhap.org/).

## Live demo

**[hypno1.vercel.app](https://hypno1.vercel.app)** — headphones recommended

## Why this exists

EMDR and ART are evidence-based therapies with strong clinical outcomes, but access is limited by cost, availability, and waitlists. This project asks: what if the core bilateral stimulation techniques were available to anyone with a browser and headphones?

It is not a replacement for working with a therapist. It implements a simplified subset of these therapies — resource-building from EMDR, image rescripting from ART, and a hypnotic meditation that layers binaural tones, breathing guidance, and progressive relaxation. The goal is to give people a structured, consent-forward tool they can use on their own terms.

## What it does

### Four modes

| Mode | Duration | What happens |
|------|----------|-------------|
| **EMDR** | 10-15 min | Safe place visualization, butterfly hug, container exercise, resource installation — each paired with bilateral eye movements |
| **ART** | 10-20 min | Select a stressful scene, process it with fast bilateral eye movements, then rescript it into something better. Loops until distress drops |
| **Meditation** | Up to 30 min | Guided or silent. Hypnotic induction, breathing sync, binaural tones deepening from theta to delta, positive suggestion cues, anchoring. End whenever you're ready |
| **Lateral** | Open-ended | Adjustable bilateral dot with sliders for speed, binaural frequency (0-40 Hz), binaural volume, ping sound, and pink noise |

### Safety and consent

Every session begins with a safety gate explaining what the tool is and isn't. EMDR and ART sessions monitor distress throughout using the SUD (Subjective Units of Distress) scale:

- **Before starting:** If distress is above 5, the user is routed through a grounding exercise before proceeding
- **During ART:** Distress is rechecked after each processing round. The loop continues until it drops below 2
- **If distress hits 10:** An adverse event protocol exits the session immediately
- **After every session:** Crisis resources are shown (988 Suicide & Crisis Lifeline, Crisis Text Line)
- **At any point:** The exit button is always visible in the top-left corner

### Session tracking

Completed EMDR and ART sessions are stored locally with before/after distress scores. The end summary shows improvement and session history so users can see patterns over time. All data stays in the browser — nothing leaves the device.

## How it works

The app layers 40+ techniques across audio, visual, language, breathing, and bilateral stimulation:

### Audio
True binaural beats (separate L/R oscillators), a second harmonic layer, pink noise, isochronic pulses, a sub-bass heartbeat that slows from 60 to 45 bpm, breath-synced chimes, and bilateral ping tones. All generated in real-time with the Web Audio API — no audio files for the sound engine.

### Visual
Bilateral eye-tracking dot, breathing guide circle with spring physics, hypnotic spiral, photic flicker at alpha/theta frequencies, binaural pulse synced to beat frequency, progressive vignette (tunnel vision), and staircase countdown particles.

### Language and narration
Ericksonian permissive language, embedded commands, confusion technique, fractionation, presuppositions, dissociation language, deepening challenges, NLP sensory patterns, and kinesthetic anchoring. Voice narration uses pre-generated ElevenLabs MP3s with Web Speech API fallback.

### Breathing
4-4-6 extended exhale pattern (activates parasympathetic response) with progressive slowdown — cycle duration increases from 14s to 27s over the session.

### Bilateral stimulation
Three speeds: slow (~1 Hz) for EMDR resource-building, fast (~1.4 Hz) for ART processing, and user-controlled for the lateral tool. Plus butterfly hug self-tapping at ~1 Hz.

## Accessibility

- Keyboard navigable throughout (roving tabIndex on SUD scale, arrow keys, Home/End)
- `aria-labels` on all interactive controls, `role="switch"` on toggles, `role="dialog"` on safety gate
- `prefers-reduced-motion` respected — disables animations, photic flicker, and binaural pulse
- Graceful fallback messaging if Web Audio is unsupported
- `noscript` fallback for non-JS browsers

## Tech stack

- **Next.js 14** (App Router), TypeScript, Tailwind CSS
- **Framer Motion** for animations and page transitions
- **Web Audio API** — binaural tones, pink noise, heartbeat, isochronic pulses, all synthesized in-browser
- **Web Speech API** — voice narration with smart voice selection (ElevenLabs MP3 fallback)
- **No backend** — all state in localStorage, no network requests after page load

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Headphones recommended.

## Tests

```bash
node --test tests/
```

57 tests covering audio system integrity, session persistence, accessibility attributes, keyboard navigation, reduced motion support, OG metadata, and browser fallbacks.

## Data and privacy

All data stored in browser `localStorage`. Nothing is sent to any server. No analytics, no cookies, no tracking. Session history can be cleared from the end summary screen.
