#!/usr/bin/env node

/**
 * generate-audio.mjs — Reads AUDIO_SCRIPTS.md and generates all MP3 files
 * via the ElevenLabs API. Saves each file to the correct public/audio/ folder.
 *
 * Usage:
 *   1. Copy .env.example to .env and add your ElevenLabs API key + voice ID
 *   2. Run: node scripts/generate-audio.mjs
 *
 * Options:
 *   --dry-run     Parse and list all files without calling the API
 *   --skip-existing  Skip files that already exist on disk
 *   --folder art  Only generate files for a specific folder (trance, emdr, art, meditation, grounding, experiments, breath)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SCRIPTS_PATH = resolve(ROOT, "AUDIO_SCRIPTS.md");
const PUBLIC_AUDIO = resolve(ROOT, "public", "audio");

// ---- Load .env file manually ----
const envPath = resolve(ROOT, ".env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

// ---- Config ----

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_monolingual_v1";

// Voice settings for calm, slow narration
const VOICE_SETTINGS = {
  stability: 0.65,
  similarity_boost: 0.75,
  style: 0.4,
  use_speaker_boost: true,
};

// ---- Parse AUDIO_SCRIPTS.md ----

function parseScripts() {
  const content = readFileSync(SCRIPTS_PATH, "utf-8");
  const entries = [];
  let currentFolder = null;

  for (const line of content.split("\n")) {
    // Detect folder headers: ## public/audio/trance/
    const folderMatch = line.match(/^## public\/audio\/(\w+)\//);
    if (folderMatch) {
      currentFolder = folderMatch[1];
      continue;
    }

    // Detect file entries: filename.mp3: "spoken text"
    const entryMatch = line.match(/^(\S+\.mp3):\s*"(.+)"$/);
    if (entryMatch && currentFolder) {
      entries.push({
        folder: currentFolder,
        filename: entryMatch[1],
        text: entryMatch[2],
        filepath: resolve(PUBLIC_AUDIO, currentFolder, entryMatch[1]),
      });
    }
  }

  return entries;
}

// ---- ElevenLabs API ----

async function generateAudio(text, retries = 4) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: VOICE_SETTINGS,
        }),
      });

      if (response.status === 429) {
        // Rate limited — wait and retry
        const wait = (attempt + 1) * 5000;
        console.log(`  ⏳ Rate limited, waiting ${wait / 1000}s...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
      }

      return Buffer.from(await response.arrayBuffer());
    } catch (err) {
      if (attempt < retries && (err.message.includes("fetch failed") || err.message.includes("429"))) {
        const wait = (attempt + 1) * 3000;
        console.log(`  ⏳ Retry ${attempt + 1}/${retries} in ${wait / 1000}s... (${err.message})`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

// ---- Main ----

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const skipExisting = args.includes("--skip-existing");
  const folderArg = args.find((a) => !a.startsWith("--"));

  if (!dryRun && (!API_KEY || !VOICE_ID)) {
    console.error("Error: Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env or environment");
    console.error("");
    console.error("  cp scripts/.env.example .env");
    console.error("  # Edit .env with your API key and voice ID");
    console.error("  node scripts/generate-audio.mjs");
    process.exit(1);
  }

  let entries = parseScripts();
  console.log(`Parsed ${entries.length} audio entries from AUDIO_SCRIPTS.md`);

  if (folderArg) {
    entries = entries.filter((e) => e.folder === folderArg);
    console.log(`Filtered to ${entries.length} entries in folder: ${folderArg}`);
  }

  if (dryRun) {
    console.log("\n--- DRY RUN ---\n");
    for (const entry of entries) {
      const exists = existsSync(entry.filepath);
      console.log(`${exists ? "[EXISTS]" : "[GENERATE]"} ${entry.folder}/${entry.filename}`);
      console.log(`  "${entry.text.substring(0, 80)}${entry.text.length > 80 ? "..." : ""}"`);
    }
    console.log(`\nTotal: ${entries.length} files`);
    console.log(`Characters: ${entries.reduce((sum, e) => sum + e.text.length, 0)}`);
    return;
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const progress = `[${i + 1}/${entries.length}]`;

    // Ensure directory exists
    const dir = dirname(entry.filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Skip existing
    if (skipExisting && existsSync(entry.filepath)) {
      console.log(`${progress} SKIP (exists) ${entry.folder}/${entry.filename}`);
      skipped++;
      continue;
    }

    console.log(`${progress} Generating ${entry.folder}/${entry.filename}...`);

    try {
      const mp3Buffer = await generateAudio(entry.text);
      writeFileSync(entry.filepath, mp3Buffer);
      generated++;
      console.log(`  ✓ ${(mp3Buffer.length / 1024).toFixed(1)}KB`);

      // Rate limiting — wait between requests to avoid 429s
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`  ✗ FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch(console.error);
