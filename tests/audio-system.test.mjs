import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---- audioMap tests ----

const audioMapSrc = readFileSync(resolve(ROOT, 'src/lib/audioMap.ts'), 'utf8');

test('audioMap has no duplicate file paths', () => {
  const paths = [...audioMapSrc.matchAll(/:\s*"(\/audio\/[^"]+)"/g)].map(m => m[1]);
  const seen = new Set();
  const dupes = [];
  for (const p of paths) {
    if (seen.has(p)) dupes.push(p);
    seen.add(p);
  }
  assert.deepEqual(dupes, [], `Duplicate audio paths found: ${dupes.join(', ')}`);
});

test('audioMap has no duplicate text keys', () => {
  // Extract all keys (the text before the colon in the map)
  const keys = [...audioMapSrc.matchAll(/^\s*"([^"]+)":\s*"/gm)].map(m => m[1]);
  const seen = new Set();
  const dupes = [];
  for (const k of keys) {
    if (seen.has(k)) dupes.push(k);
    seen.add(k);
  }
  assert.deepEqual(dupes, [], `Duplicate text keys found: ${dupes.join(', ')}`);
});

test('audioMap entry count is stable (136+ entries)', () => {
  const entries = [...audioMapSrc.matchAll(/^\s*"[^"]+"\s*:\s*"/gm)];
  assert.ok(entries.length >= 136, `Expected >=136 audioMap entries, got ${entries.length}`);
});

test('all audioMap file paths point to /audio/ directory', () => {
  const paths = [...audioMapSrc.matchAll(/:\s*"(\/audio\/[^"]+)"/g)].map(m => m[1]);
  for (const p of paths) {
    assert.ok(p.startsWith('/audio/'), `Path does not start with /audio/: ${p}`);
    assert.ok(p.endsWith('.mp3'), `Path does not end with .mp3: ${p}`);
  }
});

// ---- Session spoken-text → audioMap key alignment ----

// Build a set of audioMap keys
const audioMapKeys = new Set(
  [...audioMapSrc.matchAll(/^\s*"([^"]+)":\s*"/gm)].map(m => m[1])
);

/**
 * Extract all string literals that are passed as spoken text to speakAsync/say
 * in a given source file. This captures the second argument to say() and the
 * first argument to speakAsync().
 */
function extractSpokenTexts(src) {
  const texts = new Set();

  // say("display", "spoken") — capture second string arg
  for (const m of src.matchAll(/say\(\s*"[^"]*"\s*,\s*"([^"]+)"\s*\)/g)) {
    texts.add(m[1]);
  }

  // speakAsync("text") — capture first arg
  for (const m of src.matchAll(/speakAsync\(\s*\n?\s*"([^"]+)"/g)) {
    texts.add(m[1]);
  }

  // speak("text") — fire-and-forget (grounding uses this)
  for (const m of src.matchAll(/\.speak\(\s*"([^"]+)"/g)) {
    texts.add(m[1]);
  }

  return texts;
}

const sessionFiles = [
  'src/components/emdr/EmdrSession.tsx',
  'src/components/art/ArtSession.tsx',
  'src/components/emdr/ButterflyHug.tsx',
  'src/components/shared/GroundingExercise.tsx',
];

for (const relPath of sessionFiles) {
  const fullPath = resolve(ROOT, relPath);
  if (!existsSync(fullPath)) continue;
  const src = readFileSync(fullPath, 'utf8');
  const spokenTexts = extractSpokenTexts(src);

  test(`${relPath}: all spoken texts match an audioMap key`, () => {
    const missing = [];
    for (const text of spokenTexts) {
      if (!audioMapKeys.has(text)) {
        missing.push(text);
      }
    }
    assert.deepEqual(
      missing,
      [],
      `Spoken texts with no audioMap entry:\n${missing.map(t => `  - "${t}"`).join('\n')}`
    );
  });
}

// ---- TranceVoice source structure tests ----

const voiceSrc = readFileSync(resolve(ROOT, 'src/lib/TranceVoice.ts'), 'utf8');

test('TranceVoice exports speakAsync method', () => {
  assert.match(voiceSrc, /speakAsync\(.+\):\s*Promise<void>/);
});

test('TranceVoice cancel() resolves pending promises', () => {
  assert.match(voiceSrc, /_resolvePending\(\)/);
  // cancel must call _resolvePending
  const cancelBlock = voiceSrc.slice(voiceSrc.indexOf('cancel(): void'));
  assert.match(cancelBlock, /_resolvePending/);
});

test('TranceVoice stop() resolves pending promises', () => {
  const stopBlock = voiceSrc.slice(voiceSrc.indexOf('stop(): void'));
  assert.match(stopBlock, /_resolvePending/);
});

// ---- Session async pattern tests ----

for (const relPath of sessionFiles) {
  const fullPath = resolve(ROOT, relPath);
  if (!existsSync(fullPath)) continue;
  const src = readFileSync(fullPath, 'utf8');

  test(`${relPath}: uses async/await pattern (no setTimeout for narration)`, () => {
    // Should NOT have setTimeout(() => showNarr or setTimeout(() => speak
    const badPatterns = [
      /setTimeout\(\s*\(\)\s*=>\s*showNarr/,
      /setTimeout\(\s*\(\)\s*=>\s*speak\(/,
      /setTimeout\(\s*\(\)\s*=>.*voice.*speak\(/,
    ];
    for (const pat of badPatterns) {
      assert.doesNotMatch(src, pat,
        `Found setTimeout-based narration in ${relPath} — should use async/await with speakAsync`);
    }
  });

  test(`${relPath}: has cancellation cleanup in effects`, () => {
    // Should have a "cancelled = true" in return cleanup
    assert.match(src, /cancelled\s*=\s*true/,
      `${relPath} should set cancelled=true in effect cleanup`);
  });
}
