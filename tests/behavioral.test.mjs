import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SNAPSHOT_MAX_AGE_MS,
  SNAPSHOT_VERSION,
  clampHistory,
  isFreshIsoDate,
  safeParseJSON,
} from '../src/lib/sessionPersistenceCore.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function read(relPath) {
  return readFileSync(resolve(ROOT, relPath), 'utf8');
}

const emdrSrc = read('src/components/emdr/EmdrSession.tsx');
const artSrc  = read('src/components/art/ArtSession.tsx');
const pageSrc = read('src/app/page.tsx');

// =====================================================================
// Helper: extract the SUD gating function body from source
// =====================================================================

/**
 * Parse the SUD-gating callback from source and return the thresholds
 * encoded in its if/else branches.  The pattern in both EmdrSession and
 * ArtSession is:
 *
 *   if (rating > 6) {
 *     if (groundingAttempted) {
 *       if (rating >= 10) { … adverse … }
 *       else              { … post-grounding … }
 *     } else              { … grounding … }
 *   } else                { … proceed … }
 *
 * We extract the two key numeric boundaries and the four destination
 * phases so that the test stays coupled to real source, not hardcoded
 * expectations.
 */
function parseSudGating(src, fnName) {
  // The SUD gating logic may be in a callback (handleSudStart) or a
  // reducer case ("SUD_RATED" / "SUD_INITIAL_RATED"). Check if the
  // callback itself has the threshold, otherwise search the reducer.
  let fnIdx = src.indexOf(fnName);
  let block = '';

  if (fnIdx !== -1) {
    block = src.slice(fnIdx, fnIdx + 600);
  }

  // If the callback just dispatches to a reducer, search for the
  // reducer action case instead.
  if (!block.match(/(?:action\.)?rating\s*>\s*\d+/)) {
    for (const actionType of ['"SUD_RATED"', '"SUD_INITIAL_RATED"']) {
      const caseIdx = src.indexOf(`case ${actionType}`);
      if (caseIdx !== -1) {
        block = src.slice(caseIdx, caseIdx + 600);
        fnIdx = caseIdx;
        break;
      }
    }
  }

  assert.ok(fnIdx !== -1, `Could not find ${fnName} or reducer action in source`);

  // rating > N  (outer threshold for "elevated distress")
  // Also match action.rating > N (reducer pattern)
  const outerMatch = block.match(/(?:action\.)?rating\s*>\s*(\d+)/);
  assert.ok(outerMatch, `No outer threshold found in ${fnName}`);
  const outerThreshold = Number(outerMatch[1]);

  // rating >= N  (inner threshold for "adverse event")
  const innerMatch = block.match(/(?:action\.)?rating\s*>=\s*(\d+)/);
  assert.ok(innerMatch, `No inner threshold found in ${fnName}`);
  const adverseThreshold = Number(innerMatch[1]);

  // Extract the four destination branches
  const adverseAction    = block.includes('showAdverseEvent: true') || block.includes('setShowAdverseEvent(true)');
  const hasPostGrounding = block.includes('"post-grounding"');
  const hasGrounding     = block.includes('"grounding"');

  return { outerThreshold, adverseThreshold, adverseAction, hasPostGrounding, hasGrounding };
}

// =====================================================================
// 1. SUD GATING LOGIC
// =====================================================================

describe('SUD gating logic', () => {

  const emdrGating = parseSudGating(emdrSrc, 'handleSudStart');
  const artGating  = parseSudGating(artSrc, 'handleSudInitial');

  // ---- threshold values ----

  it('EMDR outer threshold is 6 (rating > 6 triggers grounding path)', () => {
    assert.equal(emdrGating.outerThreshold, 6);
  });

  it('EMDR adverse-event threshold is 10 (rating >= 10)', () => {
    assert.equal(emdrGating.adverseThreshold, 10);
  });

  it('ART outer threshold matches EMDR (both use > 6)', () => {
    assert.equal(artGating.outerThreshold, emdrGating.outerThreshold);
  });

  it('ART adverse-event threshold matches EMDR (both use >= 10)', () => {
    assert.equal(artGating.adverseThreshold, emdrGating.adverseThreshold);
  });

  // ---- branch destinations ----

  it('EMDR has all four branches: proceed, grounding, post-grounding, adverse', () => {
    assert.ok(emdrGating.adverseAction, 'should set showAdverseEvent');
    assert.ok(emdrGating.hasPostGrounding, 'should have post-grounding phase');
    assert.ok(emdrGating.hasGrounding, 'should have grounding phase');
  });

  it('ART has all four branches: proceed, grounding, post-grounding, adverse', () => {
    assert.ok(artGating.adverseAction, 'should set showAdverseEvent');
    assert.ok(artGating.hasPostGrounding, 'should have post-grounding phase');
    assert.ok(artGating.hasGrounding, 'should have grounding phase');
  });

  // ---- SUD <= 6 proceeds to session ----
  // Helper: find the SUD gating block (may be in handleSudStart or the reducer)
  function findSudBlock(src, fnName) {
    // Try reducer case first
    for (const actionType of ['"SUD_RATED"', '"SUD_INITIAL_RATED"']) {
      const caseIdx = src.indexOf(`case ${actionType}`);
      if (caseIdx !== -1) {
        return src.slice(caseIdx, caseIdx + 600);
      }
    }
    // Fall back to old callback pattern
    const fnIdx = src.indexOf(fnName);
    assert.ok(fnIdx !== -1, `Could not find ${fnName}`);
    return src.slice(fnIdx, fnIdx + 600);
  }

  it('EMDR proceeds to centering when SUD <= 6', () => {
    const block = findSudBlock(emdrSrc, 'handleSudStart');
    // In reducer: phase: "centering"
    assert.ok(block.includes('"centering"'),
      'SUD <= 6 should proceed to centering phase');
    const elseIdx = block.lastIndexOf('return {');
    const centeringIdx = block.lastIndexOf('"centering"');
    assert.ok(centeringIdx > 0,
      'centering should appear in the SUD gating block');
  });

  it('ART proceeds to processing when SUD <= 6', () => {
    const block = findSudBlock(artSrc, 'handleSudInitial');
    assert.ok(block.includes('"processing"'),
      'SUD <= 6 should proceed to processing phase');
  });

  // ---- SUD 7-9 without grounding triggers grounding ----

  it('EMDR: SUD 7-9 without prior grounding goes to grounding phase', () => {
    const block = findSudBlock(emdrSrc, 'handleSudStart');
    const gaIdx = block.indexOf('groundingAttempted');
    const groundingIdx = block.indexOf('"grounding"');
    assert.ok(groundingIdx > gaIdx,
      'grounding phase should appear after groundingAttempted check');
  });

  // ---- SUD 7-9 after grounding goes to post-grounding ----

  it('EMDR: SUD 7-9 after grounding attempted goes to post-grounding', () => {
    const block = findSudBlock(emdrSrc, 'handleSudStart');
    const pgIdx = block.indexOf('"post-grounding"');
    const gaIdx = block.indexOf('groundingAttempted');
    assert.ok(pgIdx > gaIdx,
      'post-grounding should be inside groundingAttempted check');
  });

  // ---- SUD 10 after grounding triggers adverse event ----

  it('EMDR: SUD 10 after grounding triggers adverse event', () => {
    const block = findSudBlock(emdrSrc, 'handleSudStart');
    const aeIdx = block.indexOf('showAdverseEvent');
    const ratingCheck = block.indexOf('rating >= 10') !== -1
      ? block.indexOf('rating >= 10')
      : block.indexOf('action.rating >= 10');
    assert.ok(ratingCheck > 0, 'should check rating >= 10');
    assert.ok(aeIdx > ratingCheck,
      'adverse event should follow the rating >= 10 check');
  });

  it('ART: SUD 10 after grounding triggers adverse event', () => {
    const block = findSudBlock(artSrc, 'handleSudInitial');
    const aeIdx = block.indexOf('showAdverseEvent');
    const ratingCheck = block.indexOf('rating >= 10') !== -1
      ? block.indexOf('rating >= 10')
      : block.indexOf('action.rating >= 10');
    assert.ok(ratingCheck > 0, 'should check rating >= 10');
    assert.ok(aeIdx > ratingCheck,
      'adverse event should follow the rating >= 10 check');
  });
});

// =====================================================================
// 2. PHASE TRANSITION VALIDATION
// =====================================================================

describe('Phase transition validation', () => {

  /**
   * Extract the phase type union members from a `type XPhase = ...` declaration.
   */
  function extractPhaseTypes(src, typeName) {
    const typeRegex = new RegExp(`type\\s+${typeName}\\s*=([\\s\\S]*?);`);
    const match = src.match(typeRegex);
    assert.ok(match, `Could not find type ${typeName}`);
    const members = [...match[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
    return new Set(members);
  }

  /**
   * Extract all phase values referenced in the source — via setPhase("..."),
   * dispatch({ type: "GOTO_PHASE", phase: "..." }), or reducer case bodies
   * that set phase: "...".
   */
  function extractReachablePhases(src) {
    const phases = new Set();
    // Old pattern: setPhase("...")
    for (const m of src.matchAll(/setPhase\("([^"]+)"\)/g)) {
      phases.add(m[1]);
    }
    // Reducer dispatch pattern: phase: "..."
    for (const m of src.matchAll(/phase:\s*"([^"]+)"/g)) {
      phases.add(m[1]);
    }
    // Reducer dispatch pattern: nextPhase: "..."
    for (const m of src.matchAll(/nextPhase:\s*"([^"]+)"/g)) {
      phases.add(m[1]);
    }
    // Reducer target pattern: target: "..."
    for (const m of src.matchAll(/target:\s*"([^"]+)"/g)) {
      phases.add(m[1]);
    }
    return phases;
  }

  /**
   * Extract the initial phase from either:
   *   - useState<XPhase>("...")
   *   - initialState = { phase: "..." }
   */
  function extractInitialPhase(src, typeName) {
    // Try useState pattern first
    const useStatePattern = new RegExp(`useState<${typeName}>\\("([^"]+)"\\)`);
    const useStateMatch = src.match(useStatePattern);
    if (useStateMatch) return useStateMatch[1];
    // Try reducer initial state pattern
    const reducerPattern = /const\s+initialState[^{]*\{[^}]*phase:\s*"([^"]+)"/;
    const reducerMatch = src.match(reducerPattern);
    return reducerMatch ? reducerMatch[1] : null;
  }

  // ---- EMDR ----

  const emdrDeclared  = extractPhaseTypes(emdrSrc, 'EmdrPhase');
  const emdrReached   = extractReachablePhases(emdrSrc);
  const emdrInitial   = extractInitialPhase(emdrSrc, 'EmdrPhase');

  it('EmdrPhase declares at least 10 phases', () => {
    assert.ok(emdrDeclared.size >= 10,
      `Expected >= 10 phases, got ${emdrDeclared.size}`);
  });

  it('EmdrPhase: all declared phases are reachable (no orphans)', () => {
    // "summary" is a terminal phase set by the parent via onComplete, not via setPhase
    const parentManaged = new Set(['summary']);
    const orphans = [...emdrDeclared].filter(p => !emdrReached.has(p) && !parentManaged.has(p));
    assert.deepEqual(orphans, [],
      `Orphaned EMDR phases: ${orphans.join(', ')}`);
  });

  it('EmdrPhase: all setPhase targets are declared in the type union', () => {
    const undeclared = [...emdrReached].filter(p => !emdrDeclared.has(p));
    assert.deepEqual(undeclared, [],
      `Undeclared EMDR phases referenced: ${undeclared.join(', ')}`);
  });

  it('EmdrPhase: initial phase is declared in the type union', () => {
    assert.ok(emdrInitial, 'should have an initial phase');
    assert.ok(emdrDeclared.has(emdrInitial),
      `Initial phase "${emdrInitial}" not in EmdrPhase type`);
  });

  // ---- ART ----

  const artDeclared  = extractPhaseTypes(artSrc, 'ArtPhase');
  const artReached   = extractReachablePhases(artSrc);
  const artInitial   = extractInitialPhase(artSrc, 'ArtPhase');

  it('ArtPhase declares at least 10 phases', () => {
    assert.ok(artDeclared.size >= 10,
      `Expected >= 10 phases, got ${artDeclared.size}`);
  });

  it('ArtPhase: all declared phases are reachable (no orphans)', () => {
    const parentManaged = new Set(['summary']);
    const orphans = [...artDeclared].filter(p => !artReached.has(p) && !parentManaged.has(p));
    assert.deepEqual(orphans, [],
      `Orphaned ART phases: ${orphans.join(', ')}`);
  });

  it('ArtPhase: all setPhase targets are declared in the type union', () => {
    const undeclared = [...artReached].filter(p => !artDeclared.has(p));
    assert.deepEqual(undeclared, [],
      `Undeclared ART phases referenced: ${undeclared.join(', ')}`);
  });

  it('ArtPhase: initial phase is declared in the type union', () => {
    assert.ok(artInitial, 'should have an initial phase');
    assert.ok(artDeclared.has(artInitial),
      `Initial phase "${artInitial}" not in ArtPhase type`);
  });

  // ---- Cross-check: shared phases should exist in both ----

  it('grounding and post-grounding phases exist in both EMDR and ART', () => {
    for (const shared of ['grounding', 'post-grounding']) {
      assert.ok(emdrDeclared.has(shared), `EMDR should declare "${shared}"`);
      assert.ok(artDeclared.has(shared), `ART should declare "${shared}"`);
    }
  });
});

// =====================================================================
// 3. AUDIO FILE COVERAGE
// =====================================================================

describe('Audio file coverage', () => {

  function extractMp3Refs(src) {
    const paths = new Set();
    for (const m of src.matchAll(/"(\/audio\/[^"]+\.mp3)"/g)) {
      paths.add(m[1]);
    }
    return paths;
  }

  const emdrMp3s = extractMp3Refs(emdrSrc);
  const artMp3s  = extractMp3Refs(artSrc);

  it('EmdrSession references at least 1 MP3 file', () => {
    assert.ok(emdrMp3s.size >= 1, `Expected >=1 MP3 refs, got ${emdrMp3s.size}`);
  });

  it('ArtSession references at least 1 MP3 file', () => {
    assert.ok(artMp3s.size >= 1, `Expected >=1 MP3 refs, got ${artMp3s.size}`);
  });

  it('every MP3 referenced in EmdrSession.tsx exists on disk', () => {
    const missing = [];
    for (const p of emdrMp3s) {
      const diskPath = resolve(ROOT, 'public', p.slice(1)); // strip leading /
      if (!existsSync(diskPath)) missing.push(p);
    }
    assert.deepEqual(missing, [],
      `Missing EMDR audio files: ${missing.join(', ')}`);
  });

  it('every MP3 referenced in ArtSession.tsx exists on disk', () => {
    const missing = [];
    for (const p of artMp3s) {
      const diskPath = resolve(ROOT, 'public', p.slice(1));
      if (!existsSync(diskPath)) missing.push(p);
    }
    assert.deepEqual(missing, [],
      `Missing ART audio files: ${missing.join(', ')}`);
  });

  it('no MP3 path appears in both EmdrSession and ArtSession (no cross-contamination)', () => {
    const overlap = [...emdrMp3s].filter(p => artMp3s.has(p));
    assert.deepEqual(overlap, [],
      `Shared MP3s between EMDR and ART: ${overlap.join(', ')}`);
  });

  it('EMDR MP3 refs all live under /audio/emdr/', () => {
    for (const p of emdrMp3s) {
      assert.ok(p.startsWith('/audio/emdr/'), `Unexpected path prefix: ${p}`);
    }
  });

  it('ART MP3 refs all live under /audio/art/', () => {
    for (const p of artMp3s) {
      assert.ok(p.startsWith('/audio/art/'), `Unexpected path prefix: ${p}`);
    }
  });
});

// =====================================================================
// 4. SESSION PERSISTENCE EDGE CASES
// =====================================================================

describe('Session persistence edge cases', () => {

  // ---- snapshot with appState "session" should NOT be restored to "session" ----

  it('page.tsx does not restore appState "session" directly (falls back to mode-select)', () => {
    // The pattern in page.tsx:
    //   } else if (saved.appState === "session") {
    //     setAppState("mode-select");
    const sessionBlock = pageSrc.match(
      /saved\.appState\s*===\s*"session"[\s\S]*?setAppState\("([^"]+)"\)/
    );
    assert.ok(sessionBlock, 'should have a handler for appState === "session"');
    assert.equal(sessionBlock[1], 'mode-select',
      'appState "session" should be restored as "mode-select", not "session"');
  });

  it('page.tsx never calls setAppState("session") inside the loadAppSnapshot block', () => {
    // Find the restore block between loadAppSnapshot() and setIsHydrated(true)
    const loadIdx = pageSrc.indexOf('loadAppSnapshot()');
    const hydratedIdx = pageSrc.indexOf('setIsHydrated(true)', loadIdx);
    assert.ok(loadIdx > 0 && hydratedIdx > loadIdx, 'should find the restore block');
    const restoreBlock = pageSrc.slice(loadIdx, hydratedIdx);
    const appStateSettings = [...restoreBlock.matchAll(/setAppState\("([^"]+)"\)/g)]
      .map(m => m[1]);
    assert.ok(!appStateSettings.includes('session'),
      `Restore block should not set appState to "session", found: [${appStateSettings.join(', ')}]`);
  });

  // ---- snapshot with appState "end-summary" SHOULD be restored ----

  it('page.tsx restores appState "end-summary" from snapshot', () => {
    const endSummaryRestore = pageSrc.match(
      /saved\.appState\s*===\s*"end-summary"[\s\S]*?setAppState\("end-summary"\)/
    );
    assert.ok(endSummaryRestore,
      'should restore appState "end-summary" directly');
  });

  it('page.tsx restores endSummary data along with "end-summary" state', () => {
    const block = pageSrc.match(
      /saved\.appState\s*===\s*"end-summary"[\s\S]*?setEndSummary\(saved\.endSummary\)/
    );
    assert.ok(block, 'should call setEndSummary when restoring end-summary');
  });

  it('page.tsx guards end-summary restore on endSummary being truthy', () => {
    const block = pageSrc.match(
      /saved\.appState\s*===\s*"end-summary"\s*&&\s*saved\.endSummary/
    );
    assert.ok(block, 'should check saved.endSummary exists before restoring end-summary');
  });

  // ---- core helpers edge cases ----

  it('safeParseJSON returns null for undefined input', () => {
    assert.equal(safeParseJSON(undefined), null);
  });

  it('safeParseJSON returns null for null input', () => {
    assert.equal(safeParseJSON(null), null);
  });

  it('safeParseJSON returns the number when given a numeric string', () => {
    // JSON.parse("42") === 42, and safeParseJSON coerces the input
    assert.equal(safeParseJSON('42'), 42);
  });

  it('safeParseJSON parses valid nested JSON', () => {
    const input = JSON.stringify({ appState: 'end-summary', nested: { a: 1 } });
    const result = safeParseJSON(input);
    assert.deepEqual(result, { appState: 'end-summary', nested: { a: 1 } });
  });

  it('isFreshIsoDate returns true for a date 1 second in the future', () => {
    const future = new Date(Date.now() + 1000).toISOString();
    assert.equal(isFreshIsoDate(future, SNAPSHOT_MAX_AGE_MS), true);
  });

  it('isFreshIsoDate returns false for empty string', () => {
    assert.equal(isFreshIsoDate('', SNAPSHOT_MAX_AGE_MS), false);
  });

  it('isFreshIsoDate returns false for undefined', () => {
    assert.equal(isFreshIsoDate(undefined, SNAPSHOT_MAX_AGE_MS), false);
  });

  it('isFreshIsoDate returns false for a stale date (beyond max age)', () => {
    const stale = new Date(Date.now() - (SNAPSHOT_MAX_AGE_MS + 60_000)).toISOString();
    assert.equal(isFreshIsoDate(stale, SNAPSHOT_MAX_AGE_MS), false);
  });

  it('clampHistory returns empty array for null input', () => {
    assert.deepEqual(clampHistory(null, 5), []);
  });

  it('clampHistory returns empty array for undefined input', () => {
    assert.deepEqual(clampHistory(undefined, 5), []);
  });

  it('clampHistory returns empty array for object input', () => {
    assert.deepEqual(clampHistory({ a: 1 }, 5), []);
  });

  it('clampHistory with maxItems=0 returns empty array', () => {
    assert.deepEqual(clampHistory([1, 2, 3], 0), []);
  });

  it('clampHistory preserves order (newest first)', () => {
    assert.deepEqual(clampHistory(['a', 'b', 'c'], 2), ['a', 'b']);
  });

  it('SNAPSHOT_VERSION is a positive integer', () => {
    assert.ok(Number.isInteger(SNAPSHOT_VERSION));
    assert.ok(SNAPSHOT_VERSION > 0);
  });

  it('SNAPSHOT_MAX_AGE_MS is 24 hours', () => {
    assert.equal(SNAPSHOT_MAX_AGE_MS, 1000 * 60 * 60 * 24);
  });

  // ---- AppSnapshot type checks ----

  it('sessionPersistence.ts declares "session" in the AppSnapshot appState union', () => {
    const persistSrc = read('src/lib/sessionPersistence.ts');
    const typeMatch = persistSrc.match(/appState:\s*([^;]+);/);
    assert.ok(typeMatch, 'should find appState type');
    assert.ok(typeMatch[1].includes('"session"'),
      'AppSnapshot.appState should include "session" variant');
  });

  it('sessionPersistence.ts declares "end-summary" in the AppSnapshot appState union', () => {
    const persistSrc = read('src/lib/sessionPersistence.ts');
    const typeMatch = persistSrc.match(/appState:\s*([^;]+);/);
    assert.ok(typeMatch, 'should find appState type');
    assert.ok(typeMatch[1].includes('"end-summary"'),
      'AppSnapshot.appState should include "end-summary" variant');
  });
});
