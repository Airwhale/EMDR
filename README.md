# EMDR / ART Self-Administered Experience

A free, browser-based guided self-regulation tool using evidence-based therapeutic techniques. Built with Next.js 14.

> **This is a wellness and educational tool, not a substitute for professional therapy.** If you are dealing with trauma, PTSD, or severe anxiety, please work with a licensed clinician.

## What it does

Three guided modes, each using different therapeutic approaches:

- **EMDR mode** — Resource-building stabilization exercises based on [EMDR](https://www.emdr.com/what-is-emdr/) Phase 2 protocol: safe place visualization, bilateral stimulation, butterfly hug, container exercise, and resource installation
- **ART mode** — Scene processing and voluntary image replacement based on [Accelerated Resolution Therapy](https://acceleratedresolutiontherapy.com/about-art/): fast bilateral eye movements, sensation body checks, and the signature scene-replacement technique
- **Trance mode** — Full guided self-hypnosis session with progressive relaxation, breathing synchronization, deepening techniques, and interactive suggestibility experiments

## Learn more about the techniques

- [EMDR International Association — What is EMDR?](https://www.emdria.org/about-emdr-therapy/)
- [APA — Eye Movement Desensitization and Reprocessing](https://www.apa.org/ptsd-guideline/treatments/eye-movement-reprocessing)
- [Accelerated Resolution Therapy — How ART works](https://acceleratedresolutiontherapy.com/about-art/)
- [NCBI — Bilateral stimulation and emotional memory](https://pubmed.ncbi.nlm.nih.gov/30518853/)
- [Frontiers in Psychology — EMDR self-administered interventions](https://www.frontiersin.org/journals/psychology)

## Safety

- Use only when seated or lying down safely in a private setting
- If distress increases, stop and ground yourself
- The app includes automatic SUD (distress) monitoring with grounding redirects
- In the US, call or text **988** for 24/7 mental health crisis support

## Time estimates

| Mode | Duration | What's included |
|------|----------|-----------------|
| EMDR | 10–15 min | Safe place, butterfly hug, container, resource installation, body scan |
| ART | 10–20 min | Scene processing (1–3 rounds), sensation check, voluntary image replacement |
| Trance | 15–25 min | Breathing induction, progressive relaxation, staircase deepening, 4 suggestibility experiments |

## Tech stack

- **Next.js 14** (App Router), TypeScript, Tailwind CSS
- **Framer Motion** for animations
- **Web Audio API** — generative binaural tones, pink noise, isochronic pulses, bilateral ping sounds (no audio files)
- **Web Speech API** — spoken narration with smart voice selection (falls back to text-only)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Headphones recommended for binaural tones.

## Architecture

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | App router — entry → safety gate → mode select → session |
| `src/app/learn/page.tsx` | "What is this?" explainer page |
| `src/app/about/page.tsx` | Science behind the techniques |
| `src/components/TranceSession.tsx` | Trance mode flow |
| `src/components/emdr/EmdrSession.tsx` | EMDR mode state machine |
| `src/components/art/ArtSession.tsx` | ART mode state machine |
| `src/lib/TranceAudioEngine.ts` | Web Audio synthesis with mode-specific presets |
| `src/lib/TranceVoice.ts` | Speech synthesis with prioritized voice selection |
| `src/lib/sessionPersistence.ts` | localStorage: session history, preferences, safety acknowledgment |

## Data storage

All data is stored in the browser's `localStorage`. Nothing is sent to any server.

- Session history (last 10 EMDR/ART summaries with SUD scores)
- User preferences (voice on/off)
- Safety gate acknowledgment (first-run only)

Users can clear all session history from the summary screen at the end of any session.
