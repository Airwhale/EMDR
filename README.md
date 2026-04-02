# TRANCE

TRANCE is a browser-based guided self-regulation experience built with Next.js. It includes:

- **TRANCE mode** (guided hypnotic relaxation + suggestibility experiments)
- **EMDR-inspired stabilization mode** (resource-focused, non-trauma reprocessing)
- **ART-inspired processing mode** (mild-stress scene processing and replacement)

> This project is educational/wellness-oriented and not a substitute for clinical care.

## Safety first

- Use this app only when you can sit/lie down safely.
- If distress increases, stop and ground.
- For urgent emotional crisis support in the US, call or text **988**.

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Web Audio API (generative audio)
- Web Speech API (narration, with text fallback)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — Next.js lint
- `npm run test` — run lightweight Node-based project checks

## Architecture notes

- `src/app/page.tsx` orchestrates global app state and mode routing.
- `src/components/TranceSession.tsx` handles the trance flow and experiments.
- `src/components/emdr/EmdrSession.tsx` and `src/components/art/ArtSession.tsx` manage session-specific state machines.
- `src/lib/TranceAudioEngine.ts` generates immersive audio entirely in-browser.
- `src/lib/TranceVoice.ts` wraps speech synthesis and handles voice selection.
- `src/lib/sessionPersistence.ts` stores snapshots, summaries, and user preferences.

## Persistence behavior

The app stores lightweight local data in `localStorage`:

- latest summary + summary history
- app snapshot (for resuming)
- simple user preferences (e.g., voice on/off)

No backend storage is required for these features.

## Testing

Tests use Node's built-in test runner. Start with:

```bash
npm run test
```
