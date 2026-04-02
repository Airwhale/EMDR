# TRANCE

A browser-based guided self-regulation experience built with Next.js 14. Three modes:

- **TRANCE** — Guided hypnotic relaxation with progressive induction, breathing synchronization, and suggestibility experiments
- **EMDR** — Resource-building stabilization exercises (safe place, butterfly hug, container, resource installation) with bilateral stimulation
- **ART** — Accelerated Resolution Therapy-inspired scene processing with voluntary image replacement

> This is an educational/wellness tool, not a substitute for clinical care.

## Safety

- Use only when seated or lying down safely in a private setting.
- If distress increases, stop and ground yourself.
- In the US, call or text **988** for 24/7 mental health crisis support.

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Framer Motion for animations
- Web Audio API — generative binaural tones, pink noise, isochronic pulses, bilateral ping sounds (no audio files)
- Web Speech API — narration with smart voice selection (falls back to text-only)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Headphones recommended.

## Architecture

| File | Purpose |
|---|---|
| `src/app/page.tsx` | App router — entry → safety gate → mode select → session |
| `src/components/TranceSession.tsx` | Trance mode (fixation → deepening → staircase → experiments → emergence) |
| `src/components/emdr/EmdrSession.tsx` | EMDR mode (safe place → butterfly hug → container → resource install) |
| `src/components/art/ArtSession.tsx` | ART mode (scene → processing BLS → sensation → VIR → recheck) |
| `src/lib/TranceAudioEngine.ts` | Web Audio synthesis engine with mode-specific presets |
| `src/lib/TranceVoice.ts` | Speech synthesis with prioritized voice selection and per-voice tuning |
| `src/lib/sessionPersistence.ts` | localStorage: session history, preferences, safety acknowledgment |
| `src/lib/SpeedContext.tsx` | Hold-to-fast-forward (4x) for portfolio demos |

## Data storage

All data is stored in the browser's `localStorage`. Nothing is sent to any server.

- Session history (last 10 EMDR/ART summaries with SUD scores)
- User preferences (voice on/off)
- Safety gate acknowledgment (first-run only)
