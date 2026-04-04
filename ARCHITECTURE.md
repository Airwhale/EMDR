# Architecture

## App flow

```
Entry screen → "What is this?" (learn) or "I'm ready"
    ↓
Safety gate (shown every session)
    ↓
Mode select: EMDR | ART | MEDITATION | LATERAL EYE MOVEMENT
    ↓
Session (each mode is a self-contained component)
    ↓
Summary / Exit
```

## Directory structure

```
src/
  app/
    page.tsx              — App router: entry → safety → mode select → session
    about/page.tsx        — Science explainer page (techniques used)
    learn/page.tsx        — "What is this?" page (route fallback)
    layout.tsx            — Root layout, metadata
    globals.css           — Global styles, fonts, CSS effects

  components/
    NarrationDisplay.tsx  — Animated text display with crossfade transitions
    BreathingGuide.tsx    — Breathing circle (4-4-6 pattern, progressive slowdown)
    EmdrDot.tsx           — EMDR-style horizontal dot (trance/meditation entry)
    HypnoticSpiral.tsx    — Canvas-rendered logarithmic spiral
    PhoticFlicker.tsx     — Full-screen alpha/theta frequency flicker
    Vignette.tsx          — Progressive tunnel-vision darkening
    BinauralPulse.tsx     — Full-screen opacity pulse at binaural beat frequency
    Staircase.tsx         — 10→1 countdown with dissolving numbers + particles
    EmergenceSequence.tsx — 1→5 count-up emergence with brightening
    SessionSummary.tsx    — Trance mode post-session summary
    TranceSession.tsx     — Trance mode orchestrator (hidden from UI)

    emdr/
      EmdrSession.tsx     — EMDR mode: centering → safe place → butterfly hug →
                            container → resource install → body scan → closing
      ButterflyHug.tsx    — Butterfly hug exercise with photos + tapping animation

    art/
      ArtSession.tsx      — ART mode: centering → scene select → SUD → processing →
                            sensation check → VIR → SUD recheck → body scan → closing

    meditation/
      MeditationSession.tsx — Meditation mode: centering → fixation → deepening →
                              staircase → sustained (looping cues) → emergence.
                              Supports guided and silent sub-modes.

    lateral/
      LateralSession.tsx  — Standalone bilateral dot with real-time sliders
                            (speed, binaural Hz, drone volume, ping volume)

    experiments/          — Suggestibility experiments (hidden from UI)
      ArmLevitation.tsx
      TimeDistortion.tsx
      SensoryAmplification.tsx
      ChevreuPendulum.tsx

    shared/
      ModeSelect.tsx      — Mode selection screen with binaural toggle
      SafetyGate.tsx      — Safety disclaimer (shown every session)
      SudCheck.tsx        — Subjective Units of Distress scale (0-10)
      GroundingExercise.tsx — 5-4-3-2-1 sensory grounding
      BilateralDot.tsx    — Full-width bilateral dot with ping sounds
      SessionEndSummary.tsx — EMDR/ART post-session summary with SUD comparison
      LearnContent.tsx    — "What is this?" content (used inline and as route)

  lib/
    TranceAudioEngine.ts  — Web Audio API synthesis engine:
                            - True binaural beats (2 layers, stereo-panned)
                            - Pink noise
                            - Isochronic theta pulses
                            - Sub-bass heartbeat entrainment
                            - Bilateral ping tones
                            - Breath-cue chimes
                            - Mode-specific presets (trance/emdr/art)
    TranceVoice.ts        — Speech synthesis wrapper:
                            - Prioritized voice selection (30+ voices ranked)
                            - Per-voice rate/pitch/volume tuning
                            - Pre-generated MP3 playback with Web Speech fallback
    NarrationAudio.ts     — Standalone MP3 playback engine (alternative to TranceVoice)
    audioMap.ts           — Auto-generated text→filepath lookup (136 entries)
    sessionScript.ts      — Structured narration data for trance/meditation induction
    sessionPersistence.ts — localStorage: snapshots, history, preferences
    sessionPersistenceCore.mjs — Pure helpers: JSON parsing, staleness, clamping

scripts/
  generate-audio.mjs    — ElevenLabs API script to generate all MP3s
  .env.example          — API credential template

tests/
  persistence-and-about.test.mjs — Behavior tests for persistence + navigation

public/
  audio/                — Pre-generated narration MP3s (137 files)
    trance/             — Trance/meditation induction narration
    emdr/               — EMDR exercise narration
    art/                — ART exercise narration
    meditation/         — Meditation sustain cues, anchoring, emergence
    grounding/          — 5-4-3-2-1 grounding prompts
    experiments/        — Suggestibility experiment narration
    breath/             — "breathe in", "hold", "breathe out"
  images/
    emdr/               — Butterfly hug reference photos
```

## Audio system

The audio system has two independent layers:

### 1. TranceAudioEngine (Web Audio API)
Generates all ambient/environmental audio in real-time:
- Binaural beats, pink noise, isochronic pulses, heartbeat, breath chimes
- Mode-specific presets configure frequency, volume, and which layers are active
- Methods: `fadeIn`, `fadeOut`, `setDepth`, `shiftPitch`, `setBinauralBeat`,
  `setHeartbeatRate`, `playPing`, `playBreathCue`, `muteBinaural`

### 2. TranceVoice (narration)
Handles all spoken narration:
1. On init, probes for `/audio/breath/breath-in.mp3`
2. If MP3s exist: looks up spoken text in `audioMap.ts`, plays the MP3
3. If no MP3s: falls back to Web Speech API with smart voice selection
4. Per-voice tuning ensures consistent quality across browsers/OS

## Data storage

All data in `localStorage`. Nothing sent to any server.
- `trance.app.snapshot.v2` — App state snapshot (24h TTL)
- `trance.endSummary.latest.v1` — Most recent session summary
- `trance.endSummary.history.v1` — Last 10 session summaries
- `trance.user.prefs.v1` — User preferences (voice on/off)
