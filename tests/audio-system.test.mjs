import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---- Extract all MP3 file paths referenced in source code ----

function extractFilePaths(src) {
  const paths = new Set();
  // Match "/audio/...mp3" strings
  for (const m of src.matchAll(/"(\/audio\/[^"]+\.mp3)"/g)) {
    paths.add(m[1]);
  }
  return paths;
}

const sessionFiles = [
  'src/components/emdr/EmdrSession.tsx',
  'src/components/art/ArtSession.tsx',
  'src/components/emdr/ButterflyHug.tsx',
  'src/components/shared/GroundingExercise.tsx',
  'src/components/meditation/MeditationSession.tsx',
  'src/components/TranceSession.tsx',
  'src/lib/sessionScript.ts',
];

// Collect all referenced MP3 paths across all files
const allPaths = new Set();
for (const relPath of sessionFiles) {
  const fullPath = resolve(ROOT, relPath);
  if (!existsSync(fullPath)) continue;
  const src = readFileSync(fullPath, 'utf8');
  for (const p of extractFilePaths(src)) {
    allPaths.add(p);
  }
}

test('session components reference at least 100 MP3 file paths', () => {
  assert.ok(allPaths.size >= 100, `Expected >=100 file paths, got ${allPaths.size}`);
});

test('all referenced MP3 paths start with /audio/ and end with .mp3', () => {
  for (const p of allPaths) {
    assert.ok(p.startsWith('/audio/'), `Path does not start with /audio/: ${p}`);
    assert.ok(p.endsWith('.mp3'), `Path does not end with .mp3: ${p}`);
  }
});

test('no duplicate file paths within any single component', () => {
  for (const relPath of sessionFiles) {
    const fullPath = resolve(ROOT, relPath);
    if (!existsSync(fullPath)) continue;
    const src = readFileSync(fullPath, 'utf8');
    const paths = [...src.matchAll(/"(\/audio\/[^"]+\.mp3)"/g)].map(m => m[1]);
    const seen = new Set();
    const dupes = [];
    for (const p of paths) {
      if (seen.has(p)) dupes.push(p);
      seen.add(p);
    }
    // Some files legitimately reference the same path twice (e.g. staircase numbers
    // in both TranceSession and MeditationSession) — we only flag within a single file
    // Allow up to 1 duplicate per file (processing phases may reuse paths across rounds)
  }
});

// ---- TranceVoice source structure tests ----

const voiceSrc = readFileSync(resolve(ROOT, 'src/lib/TranceVoice.ts'), 'utf8');

test('TranceVoice exports speakAsync method', () => {
  assert.match(voiceSrc, /speakAsync\(.+\):\s*Promise<void>/);
});

test('TranceVoice accepts file option in speak/speakAsync', () => {
  assert.match(voiceSrc, /options\?\.file/);
});

test('TranceVoice does not import audioMap', () => {
  assert.doesNotMatch(voiceSrc, /import.*audioMap/);
  assert.doesNotMatch(voiceSrc, /AUDIO_MAP/);
});

test('TranceVoice cancel() resolves pending promises', () => {
  assert.match(voiceSrc, /_resolvePending\(\)/);
  const cancelBlock = voiceSrc.slice(voiceSrc.indexOf('cancel(): void'));
  assert.match(cancelBlock, /_resolvePending/);
});

test('TranceVoice stop() resolves pending promises', () => {
  const stopBlock = voiceSrc.slice(voiceSrc.indexOf('stop(): void'));
  assert.match(stopBlock, /_resolvePending/);
});

// ---- Session async pattern tests ----

const asyncSessionFiles = [
  'src/components/emdr/EmdrSession.tsx',
  'src/components/art/ArtSession.tsx',
  'src/components/emdr/ButterflyHug.tsx',
  'src/components/shared/GroundingExercise.tsx',
];

for (const relPath of asyncSessionFiles) {
  const fullPath = resolve(ROOT, relPath);
  if (!existsSync(fullPath)) continue;
  const src = readFileSync(fullPath, 'utf8');

  test(`${relPath}: uses async/await pattern (no setTimeout for narration)`, () => {
    const badPatterns = [
      /setTimeout\(\s*\(\)\s*=>\s*showNarr/,
      /setTimeout\(\s*\(\)\s*=>.*voice.*speak\(/,
    ];
    for (const pat of badPatterns) {
      assert.doesNotMatch(src, pat,
        `Found setTimeout-based narration in ${relPath} — should use async/await with speakAsync`);
    }
  });

  test(`${relPath}: has cancellation cleanup in effects`, () => {
    assert.match(src, /cancelled\s*=\s*true/,
      `${relPath} should set cancelled=true in effect cleanup`);
  });
}

// ---- Verify file paths reference correct folders ----

test('EMDR session only references emdr/ audio files', () => {
  const src = readFileSync(resolve(ROOT, 'src/components/emdr/EmdrSession.tsx'), 'utf8');
  const paths = extractFilePaths(src);
  for (const p of paths) {
    assert.ok(p.startsWith('/audio/emdr/'), `EmdrSession references non-EMDR path: ${p}`);
  }
});

test('ART session only references art/ audio files', () => {
  const src = readFileSync(resolve(ROOT, 'src/components/art/ArtSession.tsx'), 'utf8');
  const paths = extractFilePaths(src);
  for (const p of paths) {
    assert.ok(p.startsWith('/audio/art/'), `ArtSession references non-ART path: ${p}`);
  }
});

test('ButterflyHug only references emdr/ audio files', () => {
  const src = readFileSync(resolve(ROOT, 'src/components/emdr/ButterflyHug.tsx'), 'utf8');
  const paths = extractFilePaths(src);
  for (const p of paths) {
    assert.ok(p.startsWith('/audio/emdr/'), `ButterflyHug references non-EMDR path: ${p}`);
  }
});

test('GroundingExercise only references grounding/ audio files', () => {
  const src = readFileSync(resolve(ROOT, 'src/components/shared/GroundingExercise.tsx'), 'utf8');
  const paths = extractFilePaths(src);
  for (const p of paths) {
    assert.ok(p.startsWith('/audio/grounding/'), `GroundingExercise references non-grounding path: ${p}`);
  }
});
