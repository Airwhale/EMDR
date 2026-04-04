# Audio Generation Scripts

This folder contains tools for generating narration audio files using the ElevenLabs API.

## Setup

1. Copy the example env file and add your credentials:
   ```bash
   cp scripts/.env.example .env
   ```

2. Edit `.env` with:
   - `ELEVENLABS_API_KEY` — from [elevenlabs.io](https://elevenlabs.io) → Profile → API Keys
   - `ELEVENLABS_VOICE_ID` — browse voices in the ElevenLabs library, copy the voice ID

## Usage

```bash
# Preview all files that will be generated (no API calls)
node scripts/generate-audio.mjs --dry-run

# Generate all audio files
node scripts/generate-audio.mjs

# Generate only one folder (e.g., breath, emdr, art, meditation, trance, grounding, experiments)
node scripts/generate-audio.mjs --folder breath

# Skip files that already exist (resume after failure)
node scripts/generate-audio.mjs --skip-existing
```

## How it works

1. `generate-audio.mjs` reads `AUDIO_SCRIPTS.md` from the project root
2. Parses each `filename.mp3: "spoken text"` entry
3. Calls the ElevenLabs text-to-speech API for each entry
4. Saves the resulting MP3 to `public/audio/<folder>/`
5. Rate-limits requests (1.5s between calls) with retry logic (up to 4 retries with exponential backoff)

## Files

- `generate-audio.mjs` — The generation script
- `.env.example` — Template for API credentials (copy to `.env` in project root)

## Voice settings

The script uses these ElevenLabs voice settings (optimized for calm, meditative narration):
- Stability: 0.65
- Similarity boost: 0.75
- Style: 0.4
- Speaker boost: enabled

## After generation

Once MP3 files are in `public/audio/`, the app automatically detects and uses them instead of browser speech synthesis. The detection is handled by `TranceVoice` which probes for `/audio/breath/breath-in.mp3` on init — if found, all subsequent `speak()` calls look up the text in `audioMap.ts` and play the corresponding MP3.

No code changes needed — just generate the files, commit them, and deploy.
