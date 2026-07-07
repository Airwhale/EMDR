import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function read(relPath) {
  return readFileSync(resolve(ROOT, relPath), 'utf8');
}

// =====================================================================
// 1. SCREEN WAKE LOCK
// =====================================================================

const wakeLock = read('src/lib/useWakeLock.ts');

test('useWakeLock requests a screen wake lock', () => {
  assert.match(wakeLock, /wakeLock\.request\("screen"\)/);
});

test('useWakeLock feature-detects before requesting', () => {
  assert.match(wakeLock, /"wakeLock" in navigator/);
});

test('useWakeLock re-acquires on visibilitychange', () => {
  assert.match(wakeLock, /addEventListener\("visibilitychange"/);
  assert.match(wakeLock, /visibilityState === "visible"/);
});

test('useWakeLock releases the lock and listener on cleanup', () => {
  assert.match(wakeLock, /removeEventListener\("visibilitychange"/);
  assert.match(wakeLock, /release\(\)/);
});

const sessionComponents = [
  'src/components/meditation/MeditationSession.tsx',
  'src/components/emdr/EmdrSession.tsx',
  'src/components/art/ArtSession.tsx',
  'src/components/lateral/LateralSession.tsx',
];

for (const relPath of sessionComponents) {
  test(`${relPath}: uses the wake lock hook`, () => {
    const src = read(relPath);
    assert.match(src, /import \{ useWakeLock \} from "@\/lib\/useWakeLock"/);
    assert.match(src, /useWakeLock\(\);/);
  });
}

// =====================================================================
// 2. AUDIO CONTEXT RECOVERY AFTER TAB HIDE / SCREEN LOCK
// =====================================================================

const engine = read('src/lib/TranceAudioEngine.ts');

test('engine resumes suspended AudioContext when tab becomes visible', () => {
  assert.match(engine, /visibilitychange/);
  assert.match(engine, /visibilityState === "visible"/);
  assert.match(engine, /state === "suspended"/);
});

test('engine removes the visibility listener on stop', () => {
  const stopBlock = engine.slice(engine.indexOf('stop(): void'));
  assert.match(stopBlock, /removeEventListener\("visibilitychange"/);
});

test('engine keeps the first-gesture unlock for iOS autoplay policy', () => {
  assert.match(engine, /addEventListener\("touchstart"/);
});

// =====================================================================
// 3. SOCIAL PREVIEW IMAGE
// =====================================================================

test('opengraph-image.png exists and is a reasonable size', () => {
  const path = resolve(ROOT, 'src/app/opengraph-image.png');
  assert.ok(existsSync(path), 'src/app/opengraph-image.png should exist');
  const bytes = statSync(path).size;
  assert.ok(bytes > 10_000, 'image should not be empty');
  assert.ok(bytes < 8_000_000, 'Next.js requires og images under 8MB');
});

test('opengraph-image has alt text', () => {
  const alt = read('src/app/opengraph-image.alt.txt');
  assert.ok(alt.trim().length > 10, 'alt text should describe the image');
});

test('twitter card uses summary_large_image now that an image exists', () => {
  const layout = read('src/app/layout.tsx');
  assert.match(layout, /card: "summary_large_image"/);
});

// =====================================================================
// 4. FEEDBACK CHANNEL
// =====================================================================

test('end summary offers a feedback mailto link', () => {
  const summary = read('src/components/shared/SessionEndSummary.tsx');
  assert.match(summary, /mailto:[^"]+subject=/);
  assert.match(summary, /Send feedback/);
});
