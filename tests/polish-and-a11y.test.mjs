import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function read(relPath) {
  return readFileSync(resolve(ROOT, relPath), 'utf8');
}

// =====================================================================
// 1. OG META TAGS & TWITTER CARD
// =====================================================================

const layout = read('src/app/layout.tsx');

test('layout exports openGraph metadata with title, description, and type', () => {
  assert.match(layout, /openGraph:\s*\{/);
  assert.match(layout, /title:\s*"EMDR/);
  assert.match(layout, /type:\s*"website"/);
});

test('layout exports twitter card metadata', () => {
  assert.match(layout, /twitter:\s*\{/);
  assert.match(layout, /card:\s*"summary"/);
});

test('layout has metadataBase for absolute URL resolution', () => {
  assert.match(layout, /metadataBase:\s*new URL/);
});

// =====================================================================
// 2. FAVICON DECLARED IN METADATA
// =====================================================================

test('favicon.ico exists on disk', () => {
  assert.ok(existsSync(resolve(ROOT, 'src/app/favicon.ico')), 'favicon.ico should exist');
});

test('layout declares favicon in icons metadata', () => {
  assert.match(layout, /icons:\s*\{/);
  assert.match(layout, /icon:\s*"\/favicon\.ico"/);
});

// =====================================================================
// 3. LOADING STATE
// =====================================================================

test('loading.tsx exists and renders a loading indicator', () => {
  const loading = read('src/app/loading.tsx');
  assert.match(loading, /export default function Loading/);
  assert.match(loading, /loadPulse/, 'should have a CSS pulse animation');
});

test('loading.tsx uses no client-side JavaScript (no "use client")', () => {
  const loading = read('src/app/loading.tsx');
  assert.doesNotMatch(loading, /["']use client["']/, 'loading.tsx should be a server component');
});

// =====================================================================
// 4. BROWSER / DEVICE FALLBACK — WEB AUDIO
// =====================================================================

const page = read('src/app/page.tsx');

test('page.tsx checks for AudioContext or webkitAudioContext support', () => {
  assert.match(page, /AudioContext/);
  assert.match(page, /webkitAudioContext/);
});

test('page.tsx renders a fallback message when audio is unsupported', () => {
  assert.match(page, /audioSupported/);
  assert.match(page, /does not support Web Audio/);
});

test('audio fallback uses role="alert" for screen readers', () => {
  assert.match(page, /role="alert"/);
});

test('TranceAudioEngine handles AudioContext construction failure gracefully', () => {
  const engine = read('src/lib/TranceAudioEngine.ts');
  assert.match(engine, /try\s*\{[\s\S]*?new AudioContext/);
  assert.match(engine, /catch/);
  assert.match(engine, /AudioContext initialization failed/);
});

// =====================================================================
// 5. ACCESSIBILITY — ARIA LABELS
// =====================================================================

test('entry screen buttons have aria-labels', () => {
  assert.match(page, /aria-label="Begin the experience"/);
  assert.match(page, /aria-label="Learn more about EMDR and ART"/);
});

test('binaural toggle in ModeSelect has role="switch" and aria-checked', () => {
  const modeSelect = read('src/components/shared/ModeSelect.tsx');
  assert.match(modeSelect, /role="switch"/);
  assert.match(modeSelect, /aria-checked=\{binauralEnabled\}/);
  assert.match(modeSelect, /aria-label="Toggle binaural tones"/);
});

test('flicker toggle in meditation choice has role="switch" and aria-checked', () => {
  assert.match(page, /role="switch"/);
  assert.match(page, /aria-checked=\{flickerEnabled\}/);
  assert.match(page, /aria-label="Toggle visual flickering"/);
});

test('lateral session sliders all have aria-labels', () => {
  const lateral = read('src/components/lateral/LateralSession.tsx');
  assert.match(lateral, /aria-label=\{`Dot speed:/);
  assert.match(lateral, /aria-label=\{`Binaural frequency:/);
  assert.match(lateral, /aria-label=\{`Binaural volume:/);
  assert.match(lateral, /aria-label=\{`Ping sound volume:/);
  assert.match(lateral, /aria-label=\{`Pink noise volume:/);
});

// =====================================================================
// 7. ACCESSIBILITY — SAFETY GATE DIALOG
// =====================================================================

test('SafetyGate uses role="dialog" with aria-labelledby', () => {
  const safetyGate = read('src/components/shared/SafetyGate.tsx');
  assert.match(safetyGate, /role="dialog"/);
  assert.match(safetyGate, /aria-labelledby/);
});

// =====================================================================
// 8. REDUCED MOTION SUPPORT
// =====================================================================

const css = read('src/app/globals.css');

test('globals.css respects prefers-reduced-motion for particles and spirals', () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.particle\s*\{[^}]*animation:\s*none/);
  assert.match(css, /\.spiral-texture\s*\{[^}]*animation:\s*none/);
});

test('globals.css disables all transition/animation durations under reduced motion', () => {
  // The blanket rule catches any CSS transition the Framer Motion
  // library injects, plus our own Tailwind transitions
  assert.match(css, /transition-duration:\s*0\.01ms\s*!important/);
  assert.match(css, /animation-duration:\s*0\.01ms\s*!important/);
});

test('BinauralPulse respects prefers-reduced-motion', () => {
  const pulse = read('src/components/BinauralPulse.tsx');
  assert.match(pulse, /prefers-reduced-motion/);
});

test('PhoticFlicker respects prefers-reduced-motion', () => {
  const flicker = read('src/components/PhoticFlicker.tsx');
  assert.match(flicker, /prefers-reduced-motion/);
});

// =====================================================================
// 9. NOSCRIPT FALLBACK
// =====================================================================

test('layout includes noscript fallback message', () => {
  assert.match(layout, /<noscript>/);
  assert.match(layout, /JavaScript Required/);
});

// =====================================================================
// 11. STRUCTURAL / INTEGRATION CHECKS
// =====================================================================

test('layout sets lang="en" on html element', () => {
  assert.match(layout, /lang="en"/);
});

test('OG description differs from meta description (more user-friendly)', () => {
  // The OG description should be tailored for social sharing
  const metaDesc = layout.match(/description:\s*\n?\s*"([^"]+)"/);
  const ogDesc = layout.match(/openGraph:[\s\S]*?description:\s*\n?\s*"([^"]+)"/);
  assert.ok(metaDesc, 'should have a meta description');
  assert.ok(ogDesc, 'should have an OG description');
  // They should be different — OG is more casual/action-oriented
  assert.notEqual(metaDesc[1], ogDesc[1], 'OG description should differ from meta description');
});

test('all mode select buttons are keyboard accessible (use <button> or <motion.button>)', () => {
  const modeSelect = read('src/components/shared/ModeSelect.tsx');
  // Mode cards use <motion.button> in a .map() — 1 in source renders 4 at runtime.
  // Plus the binaural toggle and expand details button = 3 total in source.
  assert.match(modeSelect, /<motion\.button/, 'mode cards should use <motion.button>');
  // Ensure no div-with-onClick anti-pattern for mode selection
  assert.doesNotMatch(modeSelect, /<div[^>]*onClick=\{[^}]*onSelect/, 'mode cards should not use div with onClick');
});

test('entry screen "full screen" button exists and is a <button>', () => {
  assert.match(page, /<button[\s\S]*?full screen[\s\S]*?<\/button>/);
});
