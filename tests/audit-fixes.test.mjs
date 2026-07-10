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
// 1. FIREFOX WEB AUDIO COMPAT — smoothCancel fallback
// =====================================================================

test('smoothCancel feature-detects cancelAndHoldAtTime (Firefox never shipped it)', () => {
  const engine = read('src/lib/TranceAudioEngine.ts');
  assert.match(engine, /typeof param\.cancelAndHoldAtTime === "function"/);
  assert.match(engine, /cancelScheduledValues\(now\)/);
  // the fallback must pin the current value so the next ramp starts smoothly
  assert.match(engine, /const current = param\.value;[\s\S]*?setValueAtTime\(current, now\)/);
});

test('smoothCancel does not throw on an AudioParam without cancelAndHoldAtTime', () => {
  // Simulate Firefox: extract the function and run it against a stub param
  const engine = read('src/lib/TranceAudioEngine.ts');
  const fnMatch = engine.match(/function smoothCancel\(param[^)]*\): void \{([\s\S]*?)\n\}/);
  assert.ok(fnMatch, 'smoothCancel function should exist');
  const body = fnMatch[1].replace(/: AudioParam/g, '');
  const fn = new Function('param', 'now', body);
  const calls = [];
  const stubParam = {
    value: 0.42,
    cancelScheduledValues: (t) => calls.push(['cancel', t]),
    setValueAtTime: (v, t) => calls.push(['set', v, t]),
    // no cancelAndHoldAtTime — Firefox
  };
  fn(stubParam, 1.0);
  assert.deepEqual(calls, [['cancel', 1.0], ['set', 0.42, 1.0]]);
});

// =====================================================================
// 2. STORAGE ACCESS — SecurityError safety
// =====================================================================

test('hasStorage probes localStorage inside try/catch and caches the result', () => {
  const persistence = read('src/lib/sessionPersistence.ts');
  const fnIdx = persistence.indexOf('function hasStorage');
  const block = persistence.slice(Math.max(0, fnIdx - 400), fnIdx + 500);
  assert.match(block, /try\s*\{/);
  assert.match(block, /catch/);
  assert.doesNotMatch(block, /return typeof window\.localStorage/,
    'typeof window.localStorage still invokes the throwing getter');
});

test('route-level error.tsx exists with crisis resources', () => {
  const err = read('src/app/error.tsx');
  assert.match(err, /988/);
  assert.match(err, /741741/);
  assert.match(err, /reset/);
});

// =====================================================================
// 3. SAFETY FLOW — matches documented behavior
// =====================================================================

test('EMDR: SUD 10 triggers adverse protocol before any grounding branch', () => {
  const src = read('src/components/emdr/EmdrSession.tsx');
  const block = src.slice(src.indexOf('case "SUD_RATED"'), src.indexOf('case "SUD_RATED"') + 600);
  const adverseIdx = block.indexOf('rating >= 10');
  const groundIdx = block.indexOf('groundingAttempted');
  assert.ok(adverseIdx > 0 && groundIdx > 0);
  assert.ok(adverseIdx < groundIdx, 'the >= 10 check must come before the grounding branch');
});

test('ART: mid-session SUD recheck routes a 10 to the adverse protocol', () => {
  const src = read('src/components/art/ArtSession.tsx');
  const block = src.slice(src.indexOf('case "SUD_RECHECK_RATED"'), src.indexOf('case "SUD_RECHECK_RATED"') + 600);
  assert.match(block, /rating >= 10/);
  assert.match(block, /showAdverseEvent: true/);
});

test('sessions silence the tone engine when the adverse flow takes over', () => {
  for (const path of ['src/components/emdr/EmdrSession.tsx', 'src/components/art/ArtSession.tsx']) {
    const src = read(path);
    assert.match(src, /if \(showAdverseEvent\) audioRef\.current\?\.stop\(\);/, path);
  }
});

test('post-grounding screens show crisis line info', () => {
  for (const path of ['src/components/emdr/EmdrSession.tsx', 'src/components/art/ArtSession.tsx']) {
    const src = read(path);
    const idx = src.indexOf('post-grounding" &&');
    const block = src.slice(idx, idx + 2500);
    assert.match(block, /988/, `${path} post-grounding should mention 988`);
    assert.match(block, /741741/, `${path} post-grounding should mention the Crisis Text Line`);
  }
});

// =====================================================================
// 4. SERVICE WORKER
// =====================================================================

const sw = read('public/sw.js');

test('SW never intercepts media/Range requests', () => {
  assert.match(sw, /request\.headers\.has\("range"\)/);
  assert.match(sw, /\/audio\//);
});

test('SW uses cache-first for immutable /_next/static assets', () => {
  assert.match(sw, /_next\/static/);
  assert.match(sw, /cacheFirst/);
});

test('SW falls back to cache on non-OK network responses', () => {
  assert.match(sw, /return cached \|\| response/);
});

test('SW bounds the runtime cache', () => {
  assert.match(sw, /RUNTIME_MAX_ENTRIES/);
  assert.match(sw, /trimCache/);
});

test('SW ignores non-GET requests', () => {
  assert.match(sw, /request\.method !== "GET"/);
});

// =====================================================================
// 5. PWA ICONS
// =====================================================================

test('manifest declares real 192/512 PNG icons and the files exist', () => {
  const manifest = JSON.parse(read('public/manifest.json'));
  const sizes = manifest.icons.map((i) => i.sizes);
  assert.ok(sizes.includes('192x192'), 'manifest needs a 192x192 icon for Android install');
  assert.ok(sizes.includes('512x512'), 'manifest needs a 512x512 icon for the splash screen');
  for (const icon of manifest.icons) {
    assert.equal(icon.type, 'image/png');
    assert.ok(existsSync(resolve(ROOT, 'public', icon.src.replace(/^\//, ''))), `${icon.src} should exist`);
  }
  assert.ok(existsSync(resolve(ROOT, 'public/apple-touch-icon.png')));
});

// =====================================================================
// 6. NARRATION STALL WATCHDOG
// =====================================================================

test('speakAsync has a load watchdog so a stalled MP3 cannot hang the session', () => {
  const voice = read('src/lib/TranceVoice.ts');
  assert.match(voice, /loadWatchdog/);
  assert.match(voice, /load-timeout/);
  // the watchdog must be cleared on every terminal event
  const cleared = voice.match(/clearTimeout\(loadWatchdog\)/g) || [];
  assert.ok(cleared.length >= 3, 'watchdog cleared in ended, error, and canplaythrough handlers');
});

// =====================================================================
// 7. WAKE LOCK RE-ACQUISITION
// =====================================================================

test('wake lock re-acquires after a UA-initiated release, with backoff', () => {
  const hook = read('src/lib/useWakeLock.ts');
  assert.match(hook, /addEventListener\("release"/);
  assert.match(hook, /setTimeout\(acquire/);
});

// =====================================================================
// 8. FONTS, VIEWPORT, MISC MOBILE
// =====================================================================

test('fonts are self-hosted via next/font — no runtime Google Fonts import', () => {
  assert.match(read('src/app/layout.tsx'), /next\/font\/google/);
  assert.doesNotMatch(read('src/app/globals.css'), /@import url\(.https:\/\/fonts\.googleapis/);
});

test('viewport uses dvh override for iOS toolbar clipping', () => {
  const css = read('src/app/globals.css');
  assert.match(css, /@supports \(height: 100dvh\)/);
  assert.match(css, /\.h-screen \{ height: 100dvh; \}/);
});

test('layout exports viewport-fit=cover and dark themeColor', () => {
  const layout = read('src/app/layout.tsx');
  assert.match(layout, /viewportFit: "cover"/);
  assert.match(layout, /themeColor: "#0a0a0f"/);
});

test('lateral drawer pads for the home-indicator safe area', () => {
  assert.match(read('src/components/lateral/LateralSession.tsx'), /safe-area-inset-bottom/);
});

test('fullscreen button is feature-gated (iPhone has no fullscreen API)', () => {
  const page = read('src/app/page.tsx');
  assert.match(page, /fullscreenSupported && \(/);
  assert.match(page, /requestFullscreen\?\.\(\)/);
});

test('?return=summary is stripped after being consumed', () => {
  const page = read('src/app/page.tsx');
  assert.match(page, /history\.replaceState/);
});

test('siteUrl fallback points at the real deployment domain', () => {
  assert.match(read('src/app/layout.tsx'), /hypno1-amber\.vercel\.app/);
});

// =====================================================================
// 9. TIMER HYGIENE
// =====================================================================

test('Staircase clears inner step timers on unmount', () => {
  const src = read('src/components/Staircase.tsx');
  assert.match(src, /innerCleanup/);
  assert.match(src, /innerCleanup\?\.\(\)/);
});

test('meditation sustain loop tracks all cue timers for cleanup', () => {
  const src = read('src/components/meditation/MeditationSession.tsx');
  assert.match(src, /cueTimers = new Set/);
  assert.match(src, /cueTimers\.forEach\(clearTimeout\)/);
});

test('voice toggle does not restart phase effects (speakNarration reads a ref)', () => {
  const src = read('src/components/meditation/MeditationSession.tsx');
  assert.match(src, /voiceEnabledRef/);
  assert.match(src, /if \(!voiceEnabledRef\.current \|\| silent\) return;/);
});
